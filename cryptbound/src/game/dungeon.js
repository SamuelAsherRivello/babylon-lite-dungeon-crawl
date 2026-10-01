const W = 40;
const H = 20;
const baseStats = { vitality: 10, strength: 2, defense: 0, stamina: 3, luck: 1, recovery: 1 };
const items = [
  { name: "Oak Buckler", slot: "leftArm", attack: 1, defense: 1 },
  { name: "Iron Sword", slot: "rightArm", attack: 3 },
  { name: "Bronze Helm", slot: "head", defense: 1 },
  { name: "Wool Tunic", slot: "body", defense: 1 },
  { name: "Traveler's Leggings", slot: "legs", defense: 1 },
  { name: "Tempered Blade", slot: "rightArm", attack: 5 },
];

function rng(seed) {
  let value = seed >>> 0;
  return () => { value = (value * 1664525 + 1013904223) >>> 0; return value / 4294967296; };
}
function seedNow() { return Math.floor(Math.random() * 0xffffffff) >>> 0; }
function blankMap() { return Array.from({ length: H }, () => Array.from({ length: W }, () => 1)); }

export function generateFloor(depth, seed = seedNow()) {
  const random = rng(seed);
  const map = blankMap();
  const rooms = [];
  for (let i = 0; i < 9; i++) {
    const room = { x: 2 + Math.floor(random() * 31), y: 2 + Math.floor(random() * 12), w: 5 + Math.floor(random() * 5), h: 4 + Math.floor(random() * 4) };
    for (let y = room.y; y < Math.min(H - 1, room.y + room.h); y++) for (let x = room.x; x < Math.min(W - 1, room.x + room.w); x++) map[y][x] = 0;
    if (rooms.length) {
      const prev = rooms.at(-1); let x = prev.x + 1; let y = prev.y + 1;
      const tx = room.x + 1; const ty = room.y + 1;
      while (x !== tx) { map[y][x] = 0; x += Math.sign(tx - x); }
      while (y !== ty) { map[y][x] = 0; y += Math.sign(ty - y); }
    }
    rooms.push(room);
  }
  const start = { x: rooms[0].x + 1, y: rooms[0].y + 1 };
  const exit = { x: rooms.at(-1).x + 1, y: rooms.at(-1).y + 1 };
  const entities = [{ id: "stick", kind: "item", x: start.x + 1, y: start.y, item: { name: "Wooden Stick", slot: "rightArm", attack: 1 } }, { id: "stairs", kind: "stairs", x: exit.x, y: exit.y }];
  for (let i = 1; i < rooms.length; i++) {
    const room = rooms[i]; const x = room.x + 2; const y = room.y + 2;
    if (random() < 0.76) entities.push({ id: `enemy-${i}`, kind: "enemy", x, y, hp: 3 + Math.floor(depth / 2), maxHp: 3 + Math.floor(depth / 2), damage: 1 + Math.floor(depth / 4), name: depth > 4 && random() < 0.4 ? "Skeleton" : "Cave Rat", xp: 3 + depth });
    if (random() < 0.35) entities.push({ id: `chest-${i}`, kind: "chest", x: Math.min(W - 2, x + 1), y, opened: false });
    if (random() < 0.2) entities.push({ id: `relic-${i}`, kind: "discovery", x: Math.min(W - 2, x + 2), y: Math.min(H - 2, y + 1), xp: 4 + depth });
  }
  return { seed, width: W, height: H, map, start, entities, time: 0, depth };
}

export function createCampaign(seed = seedNow()) {
  const progression = { stats: { ...baseStats }, level: 1, xp: 0, nextXp: 10, totalKills: 0 };
  const floor = generateFloor(1, seed);
  const maxHp = 10 + (progression.stats.vitality - 10) * 2;
  return { version: 1, progression, floor, player: { x: floor.start.x, y: floor.start.y, hp: maxHp, maxHp, stamina: progression.stats.stamina, equipment: { head: null, body: null, legs: null, leftArm: null, rightArm: null } }, pending: null, message: "Find the stick to arm yourself." };
}
export const directions = Object.freeze({ n: [0,-1], s: [0,1], w: [-1,0], e: [1,0], nw: [-1,-1], ne: [1,-1], sw: [-1,1], se: [1,1] });
const at = (entities, x, y) => entities.find((e) => e.x === x && e.y === y);
const slotNames = { head: "Head", body: "Body", legs: "Legs", leftArm: "Left Arm", rightArm: "Right Arm" };
const blobFrames = Object.freeze([3,2,1,0,15,14,13,12,11,10,9,8,7,6,5,4]);
export function wallFrameAt(floor, x, y) {
  const wall = (tx, ty) => floor.map[ty]?.[tx] === 1;
  const mask = Number(wall(x, y - 1)) | (Number(wall(x + 1, y)) << 1) | (Number(wall(x, y + 1)) << 2) | (Number(wall(x - 1, y)) << 3);
  return blobFrames[mask];
}

export function resolveTurn(state, dir) {
  if (!directions[dir] || state.pending) return state;
  const [dx, dy] = directions[dir]; const nx = state.player.x + dx; const ny = state.player.y + dy;
  const map = state.floor.map; const ent = at(state.floor.entities, nx, ny);
  if (map[ny]?.[nx] !== 0 && !ent) return state;
  if (dx && dy && (map[state.player.y]?.[nx] !== 0 || map[ny]?.[state.player.x] !== 0 || at(state.floor.entities, nx, state.player.y) || at(state.floor.entities, state.player.x, ny))) return state;
  const next = structuredClone(state); const p = next.player; const f = next.floor;
  let acted = true;
  if (ent?.kind === "enemy") {
    const weapons = [p.equipment.leftArm, p.equipment.rightArm].filter(Boolean);
    const strikes = weapons.length ? weapons : [null];
    const damage = strikes.reduce((total, weapon) => { const crit = Math.random() < Math.min(0.3, next.progression.stats.luck * 0.025); const hit = Math.max(1, next.progression.stats.strength + (weapon?.attack ?? 0)) * (crit ? 2 : 1); ent.hp -= hit; return total + hit; }, 0);
    if (ent.hp <= 0) {
      f.entities = f.entities.filter((e) => e.id !== ent.id); gainXp(next, ent.xp); next.progression.totalKills++;
      if (Math.random() < Math.min(0.65, 0.22 + next.progression.stats.luck * 0.035)) f.entities.push({ id: `drop-${ent.id}-${f.time}`, kind: "item", x: ent.x, y: ent.y, item: items[Math.floor(Math.random() * items.length)] });
      next.message = `${ent.name} defeated${weapons.length > 1 ? " with both blades" : ""}.`;
    } else next.message = `${weapons.length > 1 ? "Both weapons strike" : "You strike"} ${ent.name} for ${damage}.`;
  } else if (ent?.kind === "stairs") {
    const depth = f.depth + 1; next.floor = generateFloor(depth); next.player.x = next.floor.start.x; next.player.y = next.floor.start.y; next.player.hp = Math.min(p.maxHp, p.hp + next.progression.stats.recovery); next.player.stamina = next.progression.stats.stamina; next.floor.time = f.time + 1; next.message = `You descend to floor ${depth}.`; enemyPhase(next); if (next.player.hp <= 0) return freshRunAfterDeath(next); return next;
  } else if (ent?.kind === "chest") {
    if (!ent.opened) { const loot = items[Math.floor(Math.random() * items.length)]; f.entities = f.entities.filter((e) => e.id !== ent.id); f.entities.push({ id: `loot-${f.time}`, kind: "item", x: nx, y: ny, item: loot }); next.message = "The chest contains " + loot.name + "."; }
    else acted = false;
  } else if (ent?.kind === "discovery") {
    p.x = nx; p.y = ny; f.entities = f.entities.filter((e) => e.id !== ent.id); gainXp(next, ent.xp); next.message = `Ancient relic discovered. +${ent.xp} XP.`;
  } else if (ent?.kind === "item") {
    p.x = nx; p.y = ny; const slot = ent.item.slot; const old = p.equipment[slot];
    if (old) { p.x = nx; p.y = ny; next.pending = { type: "equip", entityId: ent.id, item: ent.item, old, slot }; next.message = `Replace ${old.name} with ${ent.item.name}?`; }
    else { p.equipment[slot] = ent.item; f.entities = f.entities.filter((e) => e.id !== ent.id); next.message = `${ent.item.name} equipped (${slotNames[slot]}).`; }
  } else { p.x = nx; p.y = ny; const under = at(f.entities, nx, ny); if (under?.kind === "item") { const slot = under.item.slot; if (!p.equipment[slot]) { p.equipment[slot] = under.item; f.entities = f.entities.filter((e) => e.id !== under.id); next.message = `${under.item.name} equipped.`; } else { next.pending = { type: "equip", entityId: under.id, item: under.item, old: p.equipment[slot], slot }; } } }
  if (!acted) return state;
  f.time++;
  enemyPhase(next);
  if (p.hp <= 0) return freshRunAfterDeath(next);
  return next;
}
function enemyPhase(state, bracing = false) {
  const p = state.player; const stats = state.progression.stats; const f = state.floor;
  for (const enemy of [...f.entities].filter((e) => e.kind === "enemy")) {
    const dx = Math.sign(p.x - enemy.x); const dy = Math.sign(p.y - enemy.y);
    const gearDefense = Object.values(p.equipment).reduce((value, item) => value + (item?.defense ?? 0), 0);
    if (Math.max(Math.abs(p.x - enemy.x), Math.abs(p.y - enemy.y)) <= 1) p.hp -= Math.max(0, enemy.damage - stats.defense - gearDefense - (bracing ? 2 : 0));
    else if (Math.abs(p.x - enemy.x) + Math.abs(p.y - enemy.y) < 8) { const tx = enemy.x + dx; const ty = enemy.y + dy; if (f.map[ty]?.[tx] === 0 && !at(f.entities.filter((e) => e !== enemy), tx, ty)) { enemy.x = tx; enemy.y = ty; } }
  }
}
function gainXp(s, amount) { s.progression.xp += amount; while (s.progression.xp >= s.progression.nextXp) { s.progression.xp -= s.progression.nextXp; s.progression.level++; s.progression.nextXp += 5; const keys = Object.keys(s.progression.stats); const choices = [...keys].sort(() => Math.random() - 0.5).slice(0, 3); s.pending = { type: "level", choices }; s.message = "Choose a stat to improve."; break; } }
export function choosePending(state, choice) { const next = structuredClone(state); if (next.pending?.type === "level" && next.pending.choices.includes(choice)) { next.progression.stats[choice]++; if (choice === "vitality") { next.player.maxHp += 2; next.player.hp += 2; } next.message = `${choice} increased.`; } else if (next.pending?.type === "equip") { const { item, slot, entityId, old } = next.pending; if (choice === "swap") { next.player.equipment[slot] = item; next.floor.entities = next.floor.entities.filter((e) => e.id !== entityId); next.floor.entities.push({ id: `unequipped-${next.floor.time}`, kind: "item", x: next.player.x, y: next.player.y, item: old }); } next.message = choice === "swap" ? `${item.name} equipped.` : `${item.name} left behind.`; }
  next.pending = null; if (next.progression.xp >= next.progression.nextXp) gainXp(next, 0); return next; }
export function brace(state) { if (state.pending || state.player.stamina < 1) return state; const next = structuredClone(state); next.player.stamina--; next.floor.time++; enemyPhase(next, true); next.message = "You brace behind your guard."; if (next.player.hp <= 0) return freshRunAfterDeath(next); return next; }
function freshRunAfterDeath(state) { const progression = state.progression; const campaign = createCampaign(); campaign.progression = progression; campaign.player.maxHp = 10 + Math.max(0, progression.stats.vitality - 10) * 2; campaign.player.hp = campaign.player.maxHp; campaign.player.stamina = progression.stats.stamina; campaign.message = "You fell. Your hard-earned traits remain; a new delve begins."; return campaign; }
export const itemCatalog = items;
export const statLabels = Object.freeze({ vitality: "Vitality", strength: "Strength", defense: "Defense", stamina: "Stamina", luck: "Luck", recovery: "Recovery" });
