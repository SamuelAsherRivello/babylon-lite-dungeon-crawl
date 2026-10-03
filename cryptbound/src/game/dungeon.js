const W = 40;
const H = 20;
const ITEM_CAPACITY = 10;
export const GAME_TUNING = Object.freeze({ startingStamina: 25, attackStaminaCost: 5, moveStaminaRecovery: 10, enemyDamageMultiplier: 0.25, xpPerAttack: 1, xpPerKillBase: 6, xpThreshold: 100, enemyAwareness: 8, sneakingAwareness: 4, enemyMoveIntervalFrames: 2 });
const ATTACK_STAMINA_COST = GAME_TUNING.attackStaminaCost;
const MOVE_STAMINA_RECOVERY = GAME_TUNING.moveStaminaRecovery;

export const directions = Object.freeze({ n: [0, -1], s: [0, 1], w: [-1, 0], e: [1, 0] });
export const resourceNames = Object.freeze(["health", "stamina", "offense", "defense", "mana", "xp"]);
export const EVENT_TYPES = Object.freeze(["action.committed", "action.rejected", "time.advanced", "player.moved", "player.sneak.changed", "combat.hit", "enemy.defeated", "resource.changed", "item.collected", "item.collection.rejected", "potion.consumed", "chest.opened", "equipment.changed", "ability.used", "ability.assignment.changed", "xp.gained", "xp.level.changed", "realm.entered", "player.died", "campaign.save.succeeded", "campaign.save.failed"]);
export const attributeLabels = Object.freeze({ health: "Health", stamina: "Stamina", offense: "Offense", defense: "Defense", mana: "Mana", vitality: "Vitality", strength: "Strength", luck: "Luck", recovery: "Recovery", agility: "Agility" });
export const statLabels = attributeLabels;
export const abilityCatalog = Object.freeze({
  heal: Object.freeze({ id: "heal", title: "Heal", icon: "✦", manaCost: 10, kind: "heal", amount: 10, target: "self" }),
  wand: Object.freeze({ id: "wand", title: "Wand", icon: "✹", manaCost: 8, kind: "wand", damage: 8, target: "nearest-enemy", range: 8 }),
});
export const itemCatalog = Object.freeze([
  { name: "Chest Plate 02", group: "armor", modifiers: { defense: 8 } },
  { name: "Iron Sword 01", group: "weapons", modifiers: { offense: 8 } },
  { name: "Oak Shield 03", group: "weapons", modifiers: { defense: 6 } },
  { name: "Wooden Stick", group: "weapons", modifiers: { offense: 3 } },
]);

function rng(seed) { let value = seed >>> 0; return () => { value = (value * 1664525 + 1013904223) >>> 0; return value / 4294967296; }; }
function seedNow() { return Math.floor(Math.random() * 0xffffffff) >>> 0; }
function blankMap() { return Array.from({ length: H }, () => Array.from({ length: W }, () => 1)); }
function itemInstance(item, id) { return { id, ...item, modifiers: { ...item.modifiers } }; }
function entityAt(entities, x, y) { return entities.find((entity) => entity.x === x && entity.y === y); }
function emit(events, type, facts, state, source = type.split(".")[0]) { events.push({ type, facts, source, gameTime: state.floor.time, sequence: events.length + 1 }); }

export function createResourcesModel(values = {}) {
  return Object.fromEntries(resourceNames.map((name) => {
    const value = values[name] ?? {};
    return [name, { current: Number(value.current ?? 0), currentMax: Number(value.currentMax ?? 0), ...(value.level == null ? {} : { level: Number(value.level) }) }];
  }));
}

export function isResourcesModel(value) {
  return resourceNames.every((name) => Number.isFinite(value?.[name]?.current) && Number.isFinite(value?.[name]?.currentMax));
}

function playerResourcesFromCampaign(campaign, previous = campaign.player.resources) {
  const attributes = effectiveAttributes(campaign);
  const current = (name, fallback = 0) => Number.isFinite(previous?.[name]?.current) ? previous[name].current : Number.isFinite(previous?.[name]) ? previous[name] : fallback;
  const stamina = Math.max(0, Math.min(attributes.stamina, current("stamina")));
  const staminaRatio = attributes.stamina > 0 ? stamina / attributes.stamina : 0;
  return createResourcesModel({
    health: { current: Math.max(0, Math.min(attributes.health, current("health", attributes.health))), currentMax: attributes.health },
    stamina: { current: stamina, currentMax: attributes.stamina },
    offense: { current: attributes.offense * staminaRatio, currentMax: attributes.offense },
    defense: { current: attributes.defense * staminaRatio, currentMax: attributes.defense },
    mana: { current: Math.max(0, Math.min(attributes.mana, current("mana", attributes.mana))), currentMax: attributes.mana },
    xp: { current: campaign.progression.xp, currentMax: campaign.progression.nextXp, level: campaign.progression.level },
  });
}

function enemyResources(enemy, level = 1) {
  const healthMax = Number(enemy.resources?.health?.currentMax ?? enemy.maxHp ?? enemy.hp ?? 0);
  const healthCurrent = Number(enemy.resources?.health?.current ?? enemy.hp ?? healthMax);
  const offense = Number(enemy.resources?.offense?.current ?? enemy.damage ?? 0);
  const xp = Number(enemy.resources?.xp?.current ?? enemy.xp ?? 0);
  return createResourcesModel({
    health: { current: healthCurrent, currentMax: healthMax },
    stamina: { current: 0, currentMax: 0 },
    offense: { current: offense, currentMax: offense },
    defense: { current: 0, currentMax: 0 },
    mana: { current: 0, currentMax: 0 },
    xp: { current: xp, currentMax: xp, level },
  });
}

export function upgradeCampaignResources(campaign) {
  campaign.player.resources = playerResourcesFromCampaign(campaign);
  const level = campaign.floor.level ?? campaign.floor.depth ?? 1;
  for (const entity of campaign.floor.entities ?? []) if (entity.kind === "enemy") {
    entity.resources = enemyResources(entity, level);
    entity.hp = entity.resources.health.current;
    entity.maxHp = entity.resources.health.currentMax;
    entity.damage = entity.resources.offense.current;
    entity.xp = entity.resources.xp.current;
  }
  return campaign;
}

export function generateFloor(level, seed = seedNow(), difficulty = level) {
  const random = rng(seed); const map = blankMap(); const rooms = [];
  for (let i = 0; i < 9; i++) {
    const room = { x: 2 + Math.floor(random() * 31), y: 2 + Math.floor(random() * 12), w: 5 + Math.floor(random() * 5), h: 4 + Math.floor(random() * 4) };
    for (let y = room.y; y < Math.min(H - 1, room.y + room.h); y++) for (let x = room.x; x < Math.min(W - 1, room.x + room.w); x++) map[y][x] = 0;
    if (rooms.length) { const previous = rooms.at(-1); let x = previous.x + 1; let y = previous.y + 1; const tx = room.x + 1; const ty = room.y + 1; while (x !== tx) { map[y][x] = 0; x += Math.sign(tx - x); } while (y !== ty) { map[y][x] = 0; y += Math.sign(ty - y); } }
    rooms.push(room);
  }
  const start = { x: rooms[0].x + 1, y: rooms[0].y + 1 }; const exit = { x: rooms.at(-1).x + 1, y: rooms.at(-1).y + 1 };
  const entities = [
    { id: "stick", kind: "item", x: start.x + 1, y: start.y, item: itemInstance(itemCatalog[3], "stick-item") },
    { id: "health-potion", kind: "potion", resource: "health", x: start.x, y: start.y + 1 },
    { id: "mana-potion", kind: "potion", resource: "mana", x: start.x + 2, y: start.y },
    { id: "stairs", kind: "stairs", x: exit.x, y: exit.y },
  ];
  for (let i = 1; i < rooms.length; i++) {
    const room = rooms[i]; const x = room.x + 2; const y = room.y + 2;
    if (random() < 0.76) {
      const enemy = { id: `enemy-${i}`, kind: "enemy", x, y, hp: 10 + difficulty * 2, maxHp: 10 + difficulty * 2, damage: 4 + Math.floor(difficulty / 3), name: difficulty > 4 && random() < 0.4 ? "Skeleton" : "Cave Rat", xp: 6 + difficulty };
      enemy.resources = enemyResources(enemy, level);
      entities.push(enemy);
    }
    if (random() < 0.35) entities.push({ id: `chest-${i}`, kind: "chest", x: Math.min(W - 2, x + 1), y, opened: false });
  }
  return { seed, width: W, height: H, map, start, entities, time: 0, level };
}

export function effectiveAttributes(campaign, equipment = campaign.player.equipment) {
  const base = campaign.progression.attributes; const mods = Object.values(equipment).flat().filter(Boolean).reduce((all, item) => {
    for (const [key, value] of Object.entries(item.modifiers ?? {})) all[key] = (all[key] ?? 0) + value;
    return all;
  }, {});
  const result = {}; for (const key of Object.keys(attributeLabels)) result[key] = Math.max(0, (base[key] ?? 0) + (mods[key] ?? 0));
  return result;
}

export function resourceState(campaign) {
  return playerResourcesFromCampaign(campaign);
}

export function createCampaign(seed = seedNow(), difficulty = 1) {
  const floor = generateFloor(1, seed, difficulty); const attributes = { health: 25, stamina: 25, offense: 10, defense: 8, mana: 20, vitality: 0, strength: 0, luck: 0, recovery: 0, agility: 0 };
  attributes.stamina = GAME_TUNING.startingStamina;
  const campaign = { version: 2, world: "One", realm: `Underground ${floor.level}`, floor, progression: { attributes, level: 1, xp: 0, nextXp: GAME_TUNING.xpThreshold, totalKills: 0, difficulty }, player: { x: floor.start.x, y: floor.start.y, resources: {}, equipment: { weapons: [null, null], armor: [null, null] }, inventory: [], inventoryCapacity: ITEM_CAPACITY, abilities: ["heal", "wand", null, null], sneaking: false }, counters: { keys: 1, gold: 55 }, objective: "Find the exit", log: [] };
  campaign.player.resources = playerResourcesFromCampaign(campaign, { health: 25, stamina: GAME_TUNING.startingStamina, mana: 20 });
  return campaign;
}

const blobFrames = Object.freeze([3, 2, 1, 0, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4]);
export function wallFrameAt(floor, x, y) { const wall = (tx, ty) => floor.map[ty]?.[tx] === 1; const mask = Number(wall(x, y - 1)) | (Number(wall(x + 1, y)) << 1) | (Number(wall(x, y + 1)) << 2) | (Number(wall(x - 1, y)) << 3); return blobFrames[mask]; }

function tick(state, events) { const previous = state.floor.time; state.floor.time++; emit(events, "time.advanced", { previous, current: state.floor.time }, state); enemyPhase(state, events); }
function normalizeResources(state, events, cause, previousCaps) { const caps = effectiveAttributes(state); for (const key of ["health", "stamina", "mana"]) { const prior = state.player.resources[key].current; const oldMax = previousCaps[key]; const ratio = oldMax > 0 ? prior / oldMax : 0; const next = Math.max(0, Math.min(caps[key], ratio * caps[key])); state.player.resources[key] = { current: next, currentMax: caps[key] }; if (prior !== next) emit(events, "resource.changed", { resource: key, previous: prior, current: next, previousMax: oldMax, currentMax: caps[key], cause }, state); } state.player.resources = playerResourcesFromCampaign(state, state.player.resources); }
function changeResource(state, events, key, value, cause) { const cap = effectiveAttributes(state)[key]; const previous = state.player.resources[key].current; const current = Math.max(0, Math.min(cap, value)); state.player.resources[key] = { current, currentMax: cap }; state.player.resources = playerResourcesFromCampaign(state, state.player.resources); if (current !== previous) emit(events, "resource.changed", { resource: key, previous, current, currentMax: cap, cause, ...(key === "health" ? { position: { x: state.player.x, y: state.player.y } } : {}) }, state); }
function gainXp(state, events, amount, cause) { const previous = state.progression.xp; state.progression.xp += amount; emit(events, "xp.gained", { amount, cause, previous, current: state.progression.xp }, state); while (state.progression.xp >= state.progression.nextXp) { state.progression.xp -= state.progression.nextXp; state.progression.level++; emit(events, "xp.level.changed", { level: state.progression.level, current: state.progression.xp, threshold: state.progression.nextXp }, state); } state.player.resources = playerResourcesFromCampaign(state, state.player.resources); }
function integerDamage(amount) { return Math.max(0, Math.round(amount)); }
function enemyPhase(state, events) { const player = state.player; const defense = resourceState(state).defense.current; const enemiesMayMove = state.floor.time % GAME_TUNING.enemyMoveIntervalFrames === 0; for (const enemy of state.floor.entities.filter((entity) => entity.kind === "enemy")) { const dx = Math.sign(player.x - enemy.x); const dy = Math.sign(player.y - enemy.y); if (Math.max(Math.abs(player.x - enemy.x), Math.abs(player.y - enemy.y)) <= 1) { const damage = integerDamage((enemy.resources.offense.current - defense) * GAME_TUNING.enemyDamageMultiplier); if (damage) changeResource(state, events, "health", player.resources.health.current - damage, "enemy-attack"); } else if (enemiesMayMove && Math.abs(player.x - enemy.x) + Math.abs(player.y - enemy.y) < (player.sneaking ? GAME_TUNING.sneakingAwareness : GAME_TUNING.enemyAwareness)) { const tx = enemy.x + dx; const ty = enemy.y + dy; if (state.floor.map[ty]?.[tx] === 0 && !entityAt(state.floor.entities.filter((entry) => entry !== enemy), tx, ty)) { enemy.x = tx; enemy.y = ty; } } }
  if (state.player.resources.health.current <= 0) { const reset = freshRunAfterDeath(state); Object.assign(state, reset); emit(events, "player.died", { realm: "Underground 1" }, state); }
}
function freshRunAfterDeath(state) { const difficulty = state.progression.difficulty ?? state.floor.level ?? state.floor.depth ?? 1; const campaign = createCampaign(seedNow(), difficulty); campaign.progression = structuredClone(state.progression); campaign.progression.difficulty = difficulty; campaign.player.abilities = [...state.player.abilities]; campaign.player.resources = playerResourcesFromCampaign(campaign, campaign.player.resources); return campaign; }
function orderedInventory(inventory) { return [...inventory].sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id)); }
function attack(state, events, enemy) { const offense = Math.max(1, integerDamage(resourceState(state).offense.current)); const health = enemy.resources.health; const before = health.current; health.current = Math.max(0, health.current - offense); enemy.hp = health.current; emit(events, "combat.hit", { target: enemy.name, targetId: enemy.id, targetPosition: { x: enemy.x, y: enemy.y }, damage: offense, previousHealth: before, currentHealth: health.current }, state); changeResource(state, events, "stamina", state.player.resources.stamina.current - ATTACK_STAMINA_COST, "attack"); gainXp(state, events, GAME_TUNING.xpPerAttack, "attack"); if (health.current <= 0) { state.floor.entities = state.floor.entities.filter((entry) => entry.id !== enemy.id); state.progression.totalKills++; gainXp(state, events, enemy.resources.xp.current, "kill"); emit(events, "enemy.defeated", { name: enemy.name, xp: enemy.resources.xp.current }, state); } }

export function applyAction(campaign, action) {
  const state = upgradeCampaignResources(structuredClone(campaign)); const events = []; const reject = (reason) => ({ state: campaign, events: [{ type: "action.rejected", facts: { reason }, gameTime: campaign.floor.time, sequence: 1 }], accepted: false, ticks: 0 });
  if (action.type === "toggle-sneak") { state.player.sneaking = !state.player.sneaking; emit(events, "player.sneak.changed", { active: state.player.sneaking }, state); return { state, events, accepted: true, ticks: 0 }; }
  if (action.type === "move") {
    const direction = directions[action.direction]; if (!direction) return reject("invalid-direction"); const [dx, dy] = direction; const x = state.player.x + dx; const y = state.player.y + dy; const entity = entityAt(state.floor.entities, x, y);
    if (state.floor.map[y]?.[x] !== 0 && !entity) return reject("blocked");
    if (entity?.kind === "enemy") attack(state, events, entity); else {
      state.player.x = x; state.player.y = y; emit(events, "player.moved", { from: { x: campaign.player.x, y: campaign.player.y }, to: { x, y } }, state);
      if (entity?.kind === "stairs") { const level = (state.floor.level ?? state.floor.depth ?? 1) + 1; const difficulty = (state.progression.difficulty ?? state.floor.depth ?? 1) + 1; const time = state.floor.time; state.progression.difficulty = difficulty; state.floor = generateFloor(level, seedNow(), difficulty); state.floor.time = time; state.realm = `Underground ${level}`; state.player.x = state.floor.start.x; state.player.y = state.floor.start.y; emit(events, "realm.entered", { realm: state.realm, level }, state); }
      else if (entity?.kind === "potion") { const cap = effectiveAttributes(state)[entity.resource]; if (state.player.resources[entity.resource].current < cap) { const previous = state.player.resources[entity.resource].current; changeResource(state, events, entity.resource, cap, "potion"); state.floor.entities = state.floor.entities.filter((entry) => entry.id !== entity.id); emit(events, "potion.consumed", { itemId: entity.id, item: entity.name ?? `${entity.resource} potion`, resource: entity.resource, previous, current: cap }, state); } }
      else if (entity?.kind === "item") { if (state.player.inventory.length < state.player.inventoryCapacity) { state.player.inventory = orderedInventory([...state.player.inventory, entity.item]); state.floor.entities = state.floor.entities.filter((entry) => entry.id !== entity.id); emit(events, "item.collected", { itemId: entity.item.id, name: entity.item.name, destination: "inventory" }, state); } else emit(events, "item.collection.rejected", { itemId: entity.item.id, name: entity.item.name, reason: "inventory-full" }, state); }
      else if (entity?.kind === "chest" && !entity.opened) { entity.opened = true; const item = itemInstance(itemCatalog[state.floor.time % itemCatalog.length], `chest-item-${state.floor.time}`); entity.kind = "item"; entity.item = item; delete entity.opened; emit(events, "chest.opened", { item: item.name }, state); }
      changeResource(state, events, "stamina", state.player.resources.stamina.current + MOVE_STAMINA_RECOVERY, "move");
    }
    tick(state, events); return { state, events, accepted: true, ticks: 1 };
  }
  if (action.type === "ability") { const abilityId = state.player.abilities[action.index]; const ability = abilityCatalog[abilityId]; if (!ability) return reject("empty-ability"); if (state.player.resources.mana.current < ability.manaCost) return reject("insufficient-mana"); const enemy = ability.kind === "wand" ? [...state.floor.entities.filter((entry) => entry.kind === "enemy" && Math.abs(entry.x - state.player.x) + Math.abs(entry.y - state.player.y) <= ability.range)].sort((a, b) => Math.abs(a.x - state.player.x) + Math.abs(a.y - state.player.y) - Math.abs(b.x - state.player.x) - Math.abs(b.y - state.player.y) || a.id.localeCompare(b.id))[0] : null; if (ability.kind === "wand" && !enemy) return reject("no-valid-target"); changeResource(state, events, "mana", state.player.resources.mana.current - ability.manaCost, "ability"); if (ability.kind === "heal") changeResource(state, events, "health", state.player.resources.health.current + ability.amount, "heal"); else { const health = enemy.resources.health; const damage = integerDamage(ability.damage); const previousHealth = health.current; health.current = Math.max(0, health.current - damage); enemy.hp = health.current; emit(events, "combat.hit", { target: enemy.name, targetId: enemy.id, targetPosition: { x: enemy.x, y: enemy.y }, damage, previousHealth, currentHealth: health.current, source: ability.id }, state); if (health.current <= 0) { state.floor.entities = state.floor.entities.filter((entry) => entry.id !== enemy.id); gainXp(state, events, enemy.resources.xp.current, "kill"); emit(events, "enemy.defeated", { name: enemy.name, xp: enemy.resources.xp.current }, state); } } emit(events, "ability.used", { id: ability.id, title: ability.title, manaCost: ability.manaCost, target: ability.target }, state); tick(state, events); return { state, events, accepted: true, ticks: 1 }; }
  if (action.type === "assign-ability") { const { from, to } = action; if (![from, to].every((index) => Number.isInteger(index) && index >= 0 && index < 4) || from === to) return reject("invalid-ability-slot"); [state.player.abilities[from], state.player.abilities[to]] = [state.player.abilities[to], state.player.abilities[from]]; emit(events, "ability.assignment.changed", { from, to }, state); tick(state, events); return { state, events, accepted: true, ticks: 1 }; }
  if (action.type === "equip" || action.type === "unequip" || action.type === "reorder-equipment") { const { group, index } = action; if (!state.player.equipment[group] || !Number.isInteger(index) || index < 0 || index > 1) return reject("invalid-slot"); const previousCaps = effectiveAttributes(state);
    if (action.type === "equip") { const itemIndex = state.player.inventory.findIndex((item) => item.id === action.itemId); const item = state.player.inventory[itemIndex]; if (!item || item.group !== group || state.player.equipment[group][index]) return reject("invalid-equipment-drop"); state.player.inventory.splice(itemIndex, 1); state.player.equipment[group][index] = item; emit(events, "equipment.changed", { action: "enabled", itemId: item.id, item: item.name, source: "inventory", destination: { group, index }, group, index }, state); }
    else if (action.type === "unequip") { const item = state.player.equipment[group][index]; if (!item || state.player.inventory.length >= state.player.inventoryCapacity) return reject("cannot-unequip"); state.player.equipment[group][index] = null; state.player.inventory = orderedInventory([...state.player.inventory, item]); emit(events, "equipment.changed", { action: "returned to inventory", itemId: item.id, item: item.name, source: { group, index }, destination: "inventory", group, index }, state); }
    else { const other = action.other; if (!Number.isInteger(other) || other < 0 || other > 1 || other === index) return reject("invalid-equipment-slot"); [state.player.equipment[group][index], state.player.equipment[group][other]] = [state.player.equipment[group][other], state.player.equipment[group][index]]; emit(events, "equipment.changed", { action: "reordered", group, index, other, source: { group, index }, destination: { group, index: other } }, state); }
    normalizeResources(state, events, "equipment", previousCaps); tick(state, events); return { state, events, accepted: true, ticks: 1 };
  }
  return reject("unknown-action");
}

export function resolveTurn(state, direction) { return applyAction(state, { type: "move", direction }).state; }
export function previewEquipment(campaign, item, group, index, mode = "equip") { const projected = structuredClone(campaign); if (mode === "equip" && projected.player.equipment[group]?.[index] === null) projected.player.equipment[group][index] = item; if (mode === "unequip") projected.player.equipment[group][index] = null; return effectiveAttributes(projected); }
export function createGameSession(initial, { onCommit } = {}) {
  let state = initial; let transactionSequence = 0; let eventSequence = 0; let dispatching = false;
  const listeners = new Set(); const queue = [];
  const session = {
    getState: () => state,
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    publish(type, facts = {}) {
      const event = { type, facts, eventId: `event-${++eventSequence}`, transactionId: null, gameTime: state.floor.time, sequence: 1, outcome: "system" };
      const result = { state, events: [event], accepted: false, ticks: 0, system: true };
      for (const listener of [...listeners]) listener(result);
      state = result.state;
      return event;
    },
    dispatch(action) {
      const request = { action, result: null }; queue.push(request);
      if (dispatching) return { queued: true, accepted: false, ticks: 0, events: [] };
      dispatching = true;
      try {
        while (queue.length) {
          const current = queue.shift(); const result = applyAction(state, current.action);
          result.transactionId = `tx-${++transactionSequence}`;
          result.events = result.events.map((event, index) => ({ ...event, transactionId: result.transactionId, eventId: `event-${++eventSequence}`, sequence: index + 1, outcome: result.accepted ? "committed" : "rejected" }));
          if (result.accepted) {
            const committed = { type: "action.committed", facts: { transactionId: result.transactionId, actionType: current.action.type, ticks: result.ticks }, transactionId: result.transactionId, eventId: `event-${++eventSequence}`, gameTime: result.state.floor.time, sequence: result.events.length + 1, outcome: "committed" };
            result.events.push(committed); state = result.state;
          }
          current.result = result;
          for (const listener of [...listeners]) listener(result);
          if (result.accepted) { state = result.state; onCommit?.(result); }
        }
      } finally { dispatching = false; }
      return request.result;
    },
  };
  return session;
}
