import assert from 'node:assert/strict';
import test from 'node:test';
import { applyAction, createCampaign, createGameSession, effectiveAttributes, GAME_TUNING, generateFloor, previewEquipment, resourceState, upgradeCampaignResources } from '../src/game/dungeon.js';
import { projectLogEvents } from '../src/game/log-policy.js';
import { projectFloatingFeedback, removeFloatingFeedback } from '../src/game/floating-feedback.js';
import { getLatestMovement, getMovementKey, getMoveInitialDelay, getMoveRepeatDelay, SPRINT_INITIAL_DELAY, SPRINT_REPEAT_DELAY, WALK_INITIAL_DELAY, WALK_REPEAT_DELAY } from '../src/game/keyboard-input.js';
import { getMouseMovementFromSelectedCell } from '../src/game/mouse-selection.js';
import { describeInventoryDrop, previewInventoryDrop, resolveInventoryDrop } from '../src/game/inventory-drag.js';
import { getCameraCenter, getWorldCellAtScreenPosition, getWorldCellScreenCenter, getWorldScreenPosition, WorldRender } from '../src/content/world/WorldRender.js';
import { findWorldTooltipPosition } from '../src/content/world/tooltip-placement.js';
import { gameZoomPresets, getTileCssSize } from '../src/content/world/zoom.js';
import { migrateCampaign, readPreferences, readSlot, readSlotSummary, writePreferences, writeSlot } from '../src/game/saves.js';

class MemoryStorage { values = new Map(); getItem(key) { return this.values.get(key) ?? null; } setItem(key, value) { this.values.set(key, String(value)); } }

test('projects player Health changes and enemy hits into positioned transient text', () => {
  const effects = projectFloatingFeedback([
    { type: 'resource.changed', eventId: 'heal', facts: { resource: 'health', previous: 8, current: 13, position: { x: 4, y: 7 } } },
    { type: 'resource.changed', eventId: 'hurt', facts: { resource: 'health', previous: 13, current: 9, position: { x: 4, y: 7 } } },
    { type: 'resource.changed', eventId: 'mana', facts: { resource: 'mana', previous: 8, current: 4, position: { x: 4, y: 7 } } },
    { type: 'combat.hit', eventId: 'melee', facts: { targetId: 'rat-1', damage: 6, targetPosition: { x: 5, y: 7 } } },
    { type: 'combat.hit', eventId: 'ability', facts: { targetId: 'skeleton-1', damage: 8, targetPosition: { x: 12, y: 3 }, source: 'wand' } },
  ]);
  assert.deepEqual(effects.map(({ id, text, color, x, y }) => ({ id, text, color, x, y })), [
    { id: 'heal', text: '+5', color: 'gain', x: 4, y: 7 },
    { id: 'hurt', text: '−4', color: 'loss', x: 4, y: 7 },
    { id: 'melee', text: '−6', color: 'loss', x: 5, y: 7 },
    { id: 'ability', text: '−8', color: 'loss', x: 12, y: 3 },
  ]);
  assert.ok(effects.every((effect) => effect.duration > 0));
  assert.deepEqual(removeFloatingFeedback(effects, 'heal'), effects.slice(1));
});

test('combat events capture actor positions before enemy removal or player respawn', () => {
  const melee = createCampaign(301); const enemy = { id: 'melee-target', kind: 'enemy', name: 'Cave Rat', x: melee.player.x + 1, y: melee.player.y, hp: 50, damage: 0, xp: 1 };
  melee.floor.map[enemy.y][enemy.x] = 0; melee.floor.entities = [enemy];
  const meleeHit = applyAction(melee, { type: 'move', direction: 'e' }).events.find((event) => event.type === 'combat.hit');
  assert.equal(meleeHit.facts.targetId, enemy.id); assert.deepEqual(meleeHit.facts.targetPosition, { x: enemy.x, y: enemy.y });

  const ability = createCampaign(302); const target = { id: 'wand-target', kind: 'enemy', name: 'Cave Rat', x: ability.player.x + 2, y: ability.player.y, hp: 50, damage: 0, xp: 1 };
  ability.floor.map[target.y][target.x] = 0; ability.floor.entities = [target];
  const abilityHit = applyAction(ability, { type: 'ability', index: 1 }).events.find((event) => event.type === 'combat.hit');
  assert.equal(abilityHit.facts.targetId, target.id); assert.deepEqual(abilityHit.facts.targetPosition, { x: target.x, y: target.y });

  const dying = createCampaign(303); dying.player.resources.health.current = 1; const oldPosition = { x: dying.player.x, y: dying.player.y };
  dying.floor.entities = [{ id: 'killer', kind: 'enemy', x: dying.player.x, y: dying.player.y, hp: 9, damage: 99, xp: 1 }];
  const death = applyAction(dying, { type: 'move', direction: 'e' });
  const healthLoss = death.events.find((event) => event.type === 'resource.changed' && event.facts.resource === 'health');
  assert.deepEqual(healthLoss.facts.position, { x: oldPosition.x + 1, y: oldPosition.y });
  assert.ok(death.events.some((event) => event.type === 'player.died'));
});

test('enemy damage is reduced to one quarter after defense mitigation and rounded to a whole number', () => {
  const campaign = createCampaign(304); campaign.player.resources.stamina.current = 13;
  const enemy = { id: 'fractional-hit', kind: 'enemy', name: 'Cave Rat', x: campaign.player.x + 2, y: campaign.player.y, hp: 50, damage: 20, xp: 1 };
  campaign.floor.map[enemy.y][enemy.x] = 0; campaign.floor.map[campaign.player.y][campaign.player.x + 1] = 0; campaign.floor.entities = [enemy];
  const result = applyAction(campaign, { type: 'move', direction: 'e' });
  const healthEvent = result.events.find((event) => event.type === 'resource.changed' && event.facts.cause === 'enemy-attack');
  assert.equal(GAME_TUNING.enemyDamageMultiplier, 0.25);
  assert.equal(healthEvent.facts.previous - healthEvent.facts.current, 3);
  assert.equal(Number.isInteger(healthEvent.facts.previous - healthEvent.facts.current), true);
});

test('starts a v2 campaign with approved attributes and bindings', () => {
  const campaign = createCampaign(42);
  assert.equal(campaign.version, 2);
  assert.equal(campaign.floor.level, 1); assert.equal(campaign.progression.difficulty, 1);
  assert.deepEqual(campaign.progression.attributes, { health: 25, stamina: 25, offense: 10, defense: 8, mana: 20, vitality: 0, strength: 0, luck: 0, recovery: 0, agility: 0 });
  assert.deepEqual(campaign.player.abilities, ['heal', 'wand', null, null]);
  assert.deepEqual(campaign.player.equipment, { weapons: [null, null], armor: [null, null] });
  assert.deepEqual(campaign.player.resources, {
    health: { current: 25, currentMax: 25 }, stamina: { current: 25, currentMax: 25 },
    offense: { current: 10, currentMax: 10 }, defense: { current: 8, currentMax: 8 },
    mana: { current: 20, currentMax: 20 }, xp: { current: 0, currentMax: 100, level: 1 },
  });
  assert.equal(campaign.player.inventoryCapacity, 10); assert.deepEqual(campaign.player.inventory, []);
  assert.deepEqual(campaign.counters, { keys: 1, gold: 55 });
  assert.equal(campaign.objective, 'Find the exit'); assert.deepEqual(campaign.log, []);
  assert.deepEqual(Object.keys(campaign.progression.attributes), ['health', 'stamina', 'offense', 'defense', 'mana', 'vitality', 'strength', 'luck', 'recovery', 'agility']);
});

test('accepted move and equipment changes emit events and cost one time unit', () => {
  const campaign = createCampaign(9); campaign.floor.entities = [];
  campaign.floor.map[campaign.player.y][campaign.player.x + 1] = 0;
  const move = applyAction(campaign, { type: 'move', direction: 'e' });
  assert.equal(move.accepted, true); assert.equal(move.state.floor.time, 1);
  assert.ok(move.events.some((event) => event.type === 'player.moved'));
  const item = { id: 'sword', name: 'Iron Sword 01', group: 'weapons', modifiers: { offense: 8 } };
  move.state.player.inventory = [item];
  const equip = applyAction(move.state, { type: 'equip', itemId: item.id, group: 'weapons', index: 0 });
  assert.equal(equip.state.floor.time, 2); assert.equal(equip.state.player.inventory.length, 0);
  assert.ok(equip.events.some((event) => event.type === 'equipment.changed'));
});

test('drag previews are pure and show equipment attribute changes before commit', () => {
  const campaign = createCampaign(3); const item = { id: 'shield', name: 'Oak Shield 03', group: 'weapons', modifiers: { defense: 6 } };
  const before = effectiveAttributes(campaign); const after = previewEquipment(campaign, item, 'weapons', 0);
  assert.equal(after.defense, before.defense + 6); assert.deepEqual(effectiveAttributes(campaign), before);
});

test('resource maxima and derived offense track current stamina', () => {
  const campaign = createCampaign(4); campaign.player.resources.stamina.current = 20;
  upgradeCampaignResources(campaign);
  const resources = resourceState(campaign);
  assert.equal(resources.stamina.currentMax, 25); assert.equal(resources.offense.current, 8);
});

test('saved campaigns and preferences remain independent', () => {
  const storage = new MemoryStorage(); const campaign = createCampaign(7);
  writeSlot(storage, '1', campaign); writePreferences(storage, { zoom: 2, camera: 'deadzone', fullscreenDesired: true });
  assert.equal(readSlot(storage, '1').floor.seed, 7);
  assert.deepEqual(readSlotSummary(storage).map((entry) => entry.occupied), [true, false, false]);
  assert.deepEqual(readPreferences(storage), { zoom: 2, camera: 'deadzone', fullscreenDesired: true, sfxVolume: 80, musicVolume: 20, muteAll: false });
  assert.deepEqual(writePreferences(storage, { zoom: 0.5, camera: 'screen', fullscreenDesired: false, sfxVolume: 0, musicVolume: 63, muteAll: true }), { zoom: 0.5, camera: 'screen', fullscreenDesired: false, sfxVolume: 0, musicVolume: 63, muteAll: true });
  assert.deepEqual(readPreferences(storage), { zoom: 0.5, camera: 'screen', fullscreenDesired: false, sfxVolume: 0, musicVolume: 63, muteAll: true });
});

test('preferences validate malformed, out-of-range, and unavailable storage', () => {
  const storage = new MemoryStorage();
  storage.setItem('cryptbound.preferences.v1', '{broken');
  assert.deepEqual(readPreferences(storage), { zoom: 1, camera: 'center', fullscreenDesired: false, sfxVolume: 80, musicVolume: 20, muteAll: false });
  storage.setItem('cryptbound.preferences.v1', JSON.stringify({ zoom: 7, camera: 'follow', fullscreenDesired: 'yes' }));
  assert.deepEqual(readPreferences(storage), { zoom: 1, camera: 'center', fullscreenDesired: false, sfxVolume: 80, musicVolume: 20, muteAll: false });
  storage.setItem('cryptbound.preferences.v1', JSON.stringify({ zoom: 2, camera: 'screen', fullscreenDesired: true, sfxVolume: 101, musicVolume: -1, muteAll: 'yes' }));
  assert.deepEqual(readPreferences(storage), { zoom: 2, camera: 'screen', fullscreenDesired: true, sfxVolume: 80, musicVolume: 20, muteAll: false });
  assert.deepEqual(readPreferences({ getItem: () => { throw new Error('blocked'); } }), { zoom: 1, camera: 'center', fullscreenDesired: false, sfxVolume: 80, musicVolume: 20, muteAll: false });
});

test('migrates legacy campaigns without losing world progress or duplicating equipment', () => {
  const legacy = {
    version: 1, world: 'Two', realm: 'Crypt 4', floor: { seed: 99, depth: 4, time: 31, map: [[0]], start: { x: 2, y: 3 }, entities: [{ id: 'rat', kind: 'enemy', x: 4, y: 5, hp: 7, xp: 10 }] },
    progression: { level: 3, xp: 45, totalKills: 8, stats: { health: 30, stamina: 18, offense: 12, defense: 6, strength: 999 } },
    player: { x: 8, y: 9, hp: 11, equipment: { weapon: { id: 's1', name: 'Old Sword', slot: 'weapon', attack: 4 }, head: { id: 'a1', name: 'Old Helm', slot: 'head', defense: 2 }, pendingChoice: { id: 's1', name: 'Old Sword', slot: 'weapon', attack: 4 } } },
    pending: { type: 'level-choice', choices: ['strength'] },
  };
  const migrated = migrateCampaign(legacy);
  assert.equal(migrated.realm, 'Crypt 4'); assert.equal(migrated.player.x, 8); assert.equal(migrated.player.y, 9);
  assert.equal(migrated.floor.time, 31); assert.equal(migrated.floor.level, 4); assert.equal(migrated.progression.difficulty, 4);
  assert.deepEqual(migrated.floor.entities.map(({ resources, ...entity }) => entity), [{ ...legacy.floor.entities[0], damage: 0, maxHp: 7 }]);
  assert.equal(migrated.floor.entities[0].resources.health.current, 7);
  assert.equal(migrated.floor.entities[0].resources.xp.current, 10);
  assert.equal(migrated.progression.level, 3); assert.equal(migrated.progression.xp, 45);
  assert.deepEqual(migrated.progression.attributes, { health: 30, stamina: 18, offense: 12, defense: 6, mana: 20, vitality: 0, strength: 0, luck: 0, recovery: 0, agility: 0 });
  const items = [...migrated.player.equipment.weapons, ...migrated.player.equipment.armor, ...migrated.player.inventory].filter(Boolean);
  assert.equal(items.length, 2); assert.equal(new Set(items.map((item) => item.id)).size, 2);
});

test('backs up legacy bytes before replacing them and leaves invalid records intact', () => {
  const storage = new MemoryStorage();
  const legacy = { version: 1, floor: { seed: 17, depth: 1, time: 6, map: [[0]], start: { x: 0, y: 0 }, entities: [] }, progression: { stats: { strength: 5 } }, player: { x: 0, y: 0, equipment: {} } };
  const raw = JSON.stringify(legacy); storage.setItem('cryptbound.slot.2', raw);
  assert.equal(readSlot(storage, '2').floor.time, 6);
  assert.equal(storage.getItem('cryptbound.slot.v1-backup.2'), raw);
  assert.equal(JSON.parse(storage.getItem('cryptbound.slot.2')).version, 2);
  const bad = '{broken'; storage.setItem('cryptbound.slot.3', bad);
  assert.equal(readSlotSummary(storage)[2].invalid, true); assert.equal(storage.getItem('cryptbound.slot.3'), bad);
  assert.throws(() => readSlot({ getItem: () => { throw new Error('blocked'); } }, '1'), /blocked/);
  assert.throws(() => writeSlot({ setItem: () => { throw new Error('quota'); } }, '1', createCampaign(1)), /quota/);
});

test('player and each generated enemy own independent six-resource models', () => {
  const campaign = createCampaign(884);
  const enemies = campaign.floor.entities.filter((entity) => entity.kind === 'enemy');
  assert.ok(enemies.length > 1);
  assert.equal(Object.keys(campaign.player.resources).length, 6);
  for (const [index, enemy] of enemies.entries()) {
    assert.equal(Object.keys(enemy.resources).length, 6);
    assert.equal(enemy.resources.health.currentMax, enemy.maxHp);
    assert.equal(enemy.resources.offense.current, enemy.damage);
    assert.equal(enemy.resources.xp.current, enemy.xp);
    assert.notEqual(enemy.resources, campaign.player.resources);
    if (index > 0) assert.notEqual(enemy.resources.health, enemies[0].resources.health);
  }
  const original = enemies[1].resources.health.current;
  enemies[0].resources.health.current--;
  assert.equal(enemies[1].resources.health.current, original);
});

test('world tooltip placement stays inside its frame and avoids both grid spots', () => {
  const frame = { left: 100, top: 50, right: 700, bottom: 450 };
  const protectedRects = [{ left: 320, top: 180, width: 40, height: 40 }, { left: 540, top: 320, width: 40, height: 40 }];
  const position = findWorldTooltipPosition(frame, { width: 180, height: 100 }, protectedRects);
  assert.ok(position);
  const panel = { left: frame.left + position.left, top: frame.top + position.top, width: 180, height: 100 };
  assert.ok(panel.left >= frame.left && panel.top >= frame.top && panel.left + panel.width <= frame.right && panel.top + panel.height <= frame.bottom);
  for (const rect of protectedRects) assert.ok(panel.left + panel.width <= rect.left || panel.left >= rect.left + rect.width || panel.top + panel.height <= rect.top || panel.top >= rect.top + rect.height);
  assert.equal(findWorldTooltipPosition({ left: 0, top: 0, right: 80, bottom: 60 }, { width: 100, height: 70 }, protectedRects), null);
});

test('adds Dungeon Level and saved Difficulty to existing v2 campaigns without losing progress', () => {
  const storage = new MemoryStorage(); const old = createCampaign(18); old.floor.depth = 6; delete old.floor.level; delete old.progression.difficulty;
  old.floor.time = 41; old.progression.level = 5; old.progression.xp = 33;
  storage.setItem('cryptbound.slot.1', JSON.stringify(old));
  const loaded = readSlot(storage, '1');
  assert.equal(loaded.floor.level, 6); assert.equal(loaded.progression.difficulty, 6);
  assert.equal(loaded.floor.time, 41); assert.equal(loaded.progression.level, 5); assert.equal(loaded.progression.xp, 33);
  assert.equal(storage.getItem('cryptbound.slot.v1-backup.1'), null);
});

test('persists hidden Difficulty across exit, death, and save reload while it scales generated enemies', () => {
  const storage = new MemoryStorage(); const campaign = createCampaign(181);
  campaign.floor.entities = [{ id: 'stairs', kind: 'stairs', x: campaign.player.x + 1, y: campaign.player.y }];
  campaign.floor.map[campaign.player.y][campaign.player.x + 1] = 0;
  const descended = applyAction(campaign, { type: 'move', direction: 'e' }).state;
  assert.equal(descended.floor.level, 2); assert.equal(descended.progression.difficulty, 2);
  const expectedEnemy = (level) => 10 + level * 2;
  assert.ok(descended.floor.entities.filter((entity) => entity.kind === 'enemy').every((enemy) => enemy.maxHp >= expectedEnemy(descended.progression.difficulty)));
  writeSlot(storage, '1', descended);
  const reloaded = readSlot(storage, '1');
  assert.equal(reloaded.floor.level, 2); assert.equal(reloaded.progression.difficulty, 2);
  reloaded.floor.level = 7; reloaded.floor.time = 89; reloaded.progression.difficulty = 7;
  reloaded.player.resources.health.current = 1;
  reloaded.floor.entities = [{ id: 'killer', kind: 'enemy', x: reloaded.player.x + 1, y: reloaded.player.y, hp: 99, damage: 99, xp: 1 }];
  reloaded.floor.map[reloaded.player.y][reloaded.player.x + 1] = 0;
  const death = applyAction(reloaded, { type: 'move', direction: 'e' }).state;
  assert.equal(death.floor.level, 1); assert.equal(death.floor.time, 0); assert.equal(death.progression.difficulty, 7);
  assert.ok(death.floor.entities.filter((entity) => entity.kind === 'enemy').every((enemy) => enemy.maxHp >= expectedEnemy(death.progression.difficulty)));
  writeSlot(storage, '1', death);
  const resumed = readSlot(storage, '1');
  assert.equal(resumed.floor.level, 1); assert.equal(resumed.floor.time, 0); assert.equal(resumed.progression.difficulty, 7);
});

test('session serializes committed and rejected actions with unique transaction and event IDs', () => {
  const campaign = createCampaign(24); campaign.floor.entities = [];
  campaign.floor.map[campaign.player.y][campaign.player.x + 1] = 0;
  const seen = []; const session = createGameSession(campaign); session.subscribe((result) => seen.push(result));
  const move = session.dispatch({ type: 'move', direction: 'e' });
  const rejected = session.dispatch({ type: 'move', direction: 'bad' });
  const sneak = session.dispatch({ type: 'toggle-sneak' });
  assert.equal(move.accepted, true); assert.equal(move.ticks, 1); assert.equal(session.getState().floor.time, 1);
  assert.equal(rejected.accepted, false); assert.equal(rejected.ticks, 0); assert.equal(sneak.ticks, 0);
  assert.notEqual(move.transactionId, rejected.transactionId);
  const eventIds = seen.flatMap((result) => result.events.map((event) => event.eventId));
  assert.equal(new Set(eventIds).size, eventIds.length);
  assert.ok(move.events.some((event) => event.type === 'action.committed'));
  assert.ok(rejected.events.every((event) => event.outcome === 'rejected'));
});

test('Log policy projects selected structured events once and ignores movement without suppressing it', () => {
  const events = [
    { type: 'player.moved', facts: { to: { x: 2, y: 3 } }, eventId: 'e1' },
    { type: 'item.collected', facts: { name: 'Wooden Stick' }, eventId: 'e2' },
  ];
  const once = projectLogEvents([], events);
  assert.deepEqual(once, [{ id: 'e2', text: 'You collect Wooden Stick.' }]);
  assert.deepEqual(projectLogEvents(once, events), once);
});

test('session finalizes Log projection before autosave and publishes save failures without gameplay', () => {
  const campaign = createCampaign(34); campaign.floor.entities = [];
  campaign.floor.map[campaign.player.y][campaign.player.x + 1] = 0;
  let saved = null; const session = createGameSession(campaign, { onCommit: (result) => { saved = structuredClone(result.state); } });
  session.subscribe((result) => { if (result.accepted) result.state.log = projectLogEvents(result.state.log, result.events); });
  const committed = session.dispatch({ type: 'move', direction: 'e' });
  assert.deepEqual(saved.log, committed.state.log);
  const before = session.getState().floor.time; const failure = session.publish('campaign.save.failed', { reason: 'quota' });
  assert.equal(failure.outcome, 'system'); assert.equal(session.getState().floor.time, before);
});

test('preserves resource fullness when equipment changes maxima and handles zero safely', () => {
  const campaign = createCampaign(35); campaign.floor.entities = [];
  campaign.player.resources.health.current = 20;
  campaign.player.inventory = [{ id: 'vital-armor', name: 'Vital Armor', group: 'armor', modifiers: { health: -15 } }];
  const result = applyAction(campaign, { type: 'equip', itemId: 'vital-armor', group: 'armor', index: 0 });
  assert.equal(result.state.player.resources.health.current, 8);
  assert.equal(effectiveAttributes(result.state).health, 10);
  assert.ok(result.events.some((event) => event.type === 'resource.changed' && event.facts.previousMax === 25 && event.facts.currentMax === 10));
  result.state.player.equipment.armor[0].modifiers.health = -10;
  result.state.player.resources.stamina.current = 20;
  upgradeCampaignResources(result.state);
  assert.equal(resourceState(result.state).stamina.currentMax, 25);
  assert.equal(resourceState(result.state).offense.current, resourceState(result.state).offense.currentMax * 0.8);
  result.state.progression.attributes.stamina = 0; result.state.player.resources.stamina.current = 0;
  upgradeCampaignResources(result.state);
  assert.equal(resourceState(result.state).offense.current, 0); assert.equal(resourceState(result.state).defense.current, 0);
});

test('potion pickups refill directly below cap and remain when already full', () => {
  const campaign = createCampaign(36); campaign.floor.entities = [];
  const target = { x: campaign.player.x + 1, y: campaign.player.y };
  campaign.floor.map[target.y][target.x] = 0;
  campaign.floor.entities = [{ id: 'health-potion-1', kind: 'potion', resource: 'health', x: target.x, y: target.y }];
  campaign.player.resources.health.current = 10;
  const collected = applyAction(campaign, { type: 'move', direction: 'e' });
  assert.equal(collected.state.player.resources.health.current, 25); assert.equal(collected.state.player.inventory.length, 0);
  assert.equal(collected.state.floor.time, 1); assert.ok(collected.events.some((event) => event.type === 'potion.consumed' && event.facts.itemId === 'health-potion-1'));
  campaign.floor.entities = [{ id: 'health-potion-2', kind: 'potion', resource: 'health', x: target.x, y: target.y }];
  campaign.player.x = target.x - 1; campaign.player.y = target.y; campaign.player.resources.health.current = 25;
  const full = applyAction(campaign, { type: 'move', direction: 'e' });
  assert.equal(full.state.player.x, target.x); assert.equal(full.state.floor.entities.length, 1); assert.equal(full.state.floor.time, 1);
});

test('attacks charge once, award attack and kill XP, and carry threshold overflow', () => {
  const campaign = createCampaign(37); campaign.floor.entities = [];
  const target = { x: campaign.player.x + 1, y: campaign.player.y };
  campaign.floor.map[target.y][target.x] = 0;
  campaign.floor.entities = [{ id: 'rat', kind: 'enemy', name: 'Cave Rat', x: target.x, y: target.y, hp: 1, damage: 0, xp: 8 }];
  campaign.progression.xp = 95; campaign.player.resources.stamina.current = 25;
  const result = applyAction(campaign, { type: 'move', direction: 'e' });
  assert.equal(result.ticks, 1); assert.equal(result.state.floor.time, 1);
  assert.equal(result.state.player.resources.stamina.current, 20); assert.equal(result.state.progression.level, 2);
  assert.equal(result.state.progression.xp, 4); assert.equal(result.state.progression.nextXp, GAME_TUNING.xpThreshold);
  assert.equal(result.events.filter((event) => event.type === 'resource.changed' && event.facts.resource === 'stamina').length, 1);
});

test('death starts a clean run while preserving persistent progression and bindings', () => {
  const campaign = createCampaign(38); campaign.floor.entities = [];
  campaign.floor.level = 10; campaign.floor.time = 63; campaign.progression.difficulty = 10;
  campaign.player.resources.health.current = 1; campaign.progression.level = 4; campaign.progression.xp = 27;
  campaign.progression.attributes.offense = 14; campaign.player.abilities = ['wand', 'heal', null, null];
  campaign.player.inventory = [{ id: 'lost-item', name: 'Lost Sword', group: 'weapons', modifiers: { offense: 5 } }];
  campaign.player.equipment.weapons[0] = { id: 'equipped', name: 'Equipped Sword', group: 'weapons', modifiers: { offense: 8 } };
  const target = { x: campaign.player.x + 1, y: campaign.player.y }; campaign.floor.map[target.y][target.x] = 0;
  campaign.floor.entities = [{ id: 'killer', kind: 'enemy', name: 'Killer', x: target.x + 1, y: target.y, hp: 20, damage: 99, xp: 1 }];
  const result = applyAction(campaign, { type: 'move', direction: 'e' });
  assert.equal(result.state.realm, 'Underground 1'); assert.equal(result.state.floor.level, 1); assert.equal(result.state.floor.time, 0); assert.equal(result.state.progression.difficulty, 10);
  assert.equal(result.state.progression.level, 4); assert.equal(result.state.progression.xp, 27);
  assert.equal(result.state.progression.attributes.offense, 14); assert.deepEqual(result.state.player.abilities, ['wand', 'heal', null, null]);
  assert.deepEqual(result.state.player.inventory, []); assert.deepEqual(result.state.player.equipment.weapons, [null, null]);
  assert.deepEqual(result.state.counters, { keys: 1, gold: 55 });
  assert.ok(result.events.some((event) => event.type === 'player.died'));
});

test('inventory collection is alphabetical, capacity bounded, and equipment commits atomically', () => {
  const campaign = createCampaign(39); campaign.floor.entities = [];
  const x = campaign.player.x + 1; const y = campaign.player.y; campaign.floor.map[y][x] = 0;
  const sword = { id: 'z-sword', name: 'Z Sword', group: 'weapons', modifiers: { offense: 4 } };
  const armor = { id: 'a-armor', name: 'A Armor', group: 'armor', modifiers: { defense: 2 } };
  campaign.floor.entities = [{ id: 'loot-z', kind: 'item', x, y, item: sword }];
  const picked = applyAction(campaign, { type: 'move', direction: 'e' });
  assert.deepEqual(picked.state.player.equipment.weapons, [null, null]); assert.equal(picked.state.player.inventory[0].id, sword.id);
  picked.state.player.inventory.push(armor); picked.state.player.inventory.sort((a, b) => a.name.localeCompare(b.name));
  const equipped = applyAction(picked.state, { type: 'equip', itemId: armor.id, group: 'armor', index: 1 });
  assert.equal(equipped.state.floor.time, picked.state.floor.time + 1); assert.equal(equipped.state.player.equipment.armor[1].id, armor.id);
  const beforeRejected = equipped.state;
  const invalid = applyAction(beforeRejected, { type: 'equip', itemId: sword.id, group: 'armor', index: 0 });
  assert.equal(invalid.accepted, false); assert.equal(invalid.state, beforeRejected); assert.equal(invalid.state.floor.time, beforeRejected.floor.time);
  const reordered = applyAction(equipped.state, { type: 'reorder-equipment', group: 'armor', index: 0, other: 1 });
  assert.equal(reordered.state.floor.time, equipped.state.floor.time + 1);
  assert.equal(effectiveAttributes(reordered.state).defense, effectiveAttributes(equipped.state).defense);
  reordered.state.player.inventory = Array.from({ length: 10 }, (_, index) => ({ id: `i${index}`, name: `Item ${index}`, group: 'weapons', modifiers: {} }));
  assert.equal(applyAction(reordered.state, { type: 'unequip', group: 'armor', index: 0 }).accepted, false);
  const full = structuredClone(campaign); full.player.inventory = Array.from({ length: full.player.inventoryCapacity }, (_, index) => ({ id: `f${index}`, name: `F${index}`, group: 'weapons', modifiers: {} }));
  const lootPosition = { x: full.player.x + 1, y: full.player.y }; full.floor.map[lootPosition.y][lootPosition.x] = 0;
  full.floor.entities = [{ id: 'blocked-loot', kind: 'item', ...lootPosition, item: { id: 'blocked-item', name: 'Blocked', group: 'weapons', modifiers: {} } }];
  const notPicked = applyAction(full, { type: 'move', direction: 'e' });
  assert.equal(notPicked.state.player.inventory.length, 10); assert.ok(notPicked.state.floor.entities.some((entity) => entity.id === 'blocked-loot'));
});

test('drag resolver previews and commits only relevant compatible destinations', () => {
  const campaign = createCampaign(40); const item = { id: 's1', name: 'Sword', group: 'weapons', modifiers: { offense: 4 } };
  campaign.player.inventory = [item]; const drag = { kind: 'inventory', item };
  assert.ok(previewInventoryDrop(campaign, drag, 'weapons', 0, null));
  assert.equal(previewInventoryDrop(campaign, drag, 'armor', 0, null), null);
  assert.equal(previewInventoryDrop(campaign, drag, 'weapons', 0, { id: 'occupied' }), null);
  assert.deepEqual(resolveInventoryDrop(drag, { kind: 'slot', group: 'weapons', index: 1 }), { type: 'equip', itemId: 's1', group: 'weapons', index: 1 });
  assert.equal(resolveInventoryDrop(drag, { kind: 'slot', group: 'weapons', index: 0 }, { id: 'occupied' }), null);
  assert.equal(resolveInventoryDrop({ kind: 'slot', group: 'weapons', index: 0, item }, { kind: 'slot', group: 'armor', index: 1 }), null);
  assert.deepEqual(resolveInventoryDrop({ kind: 'slot', group: 'weapons', index: 0, item }, { kind: 'slot', group: 'weapons', index: 1 }), { type: 'reorder-equipment', group: 'weapons', index: 0, other: 1 });
  assert.deepEqual(resolveInventoryDrop({ kind: 'slot', group: 'armor', index: 1, item }, { kind: 'inventory' }), { type: 'unequip', group: 'armor', index: 1 });
});

test('drag descriptions share valid drop actions with transient equip and unequip previews', () => {
  const campaign = createCampaign(401); const stick = { id: 'stick', name: 'Wooden Stick', group: 'weapons', modifiers: { offense: 3 } };
  campaign.player.inventory = [stick]; const baseline = effectiveAttributes(campaign);
  const equip = describeInventoryDrop(campaign, { kind: 'inventory', item: stick }, { kind: 'slot', group: 'weapons', index: 0 });
  assert.deepEqual(equip.action, { type: 'equip', itemId: stick.id, group: 'weapons', index: 0 }); assert.equal(equip.preview.offense, baseline.offense + 3);
  assert.equal(describeInventoryDrop(campaign, { kind: 'inventory', item: stick }, { kind: 'slot', group: 'armor', index: 0 }), null);
  assert.equal(describeInventoryDrop(campaign, { kind: 'inventory', item: stick }, { kind: 'slot', group: 'weapons', index: 0 }, { id: 'occupied' }), null);
  const equipped = createCampaign(402); equipped.player.equipment.weapons[0] = stick; const equippedBaseline = effectiveAttributes(equipped);
  const unequip = describeInventoryDrop(equipped, { kind: 'slot', item: stick, group: 'weapons', index: 0 }, { kind: 'inventory' });
  assert.deepEqual(unequip.action, { type: 'unequip', group: 'weapons', index: 0 }); assert.equal(unequip.preview.offense, equippedBaseline.offense - 3);
  equipped.player.inventory = Array.from({ length: equipped.player.inventoryCapacity }, (_, index) => ({ id: `full-${index}`, name: `Full ${index}`, group: 'weapons', modifiers: {} }));
  assert.equal(describeInventoryDrop(equipped, { kind: 'slot', item: stick, group: 'weapons', index: 0 }, { kind: 'inventory' }), null);
  assert.equal(equipped.player.equipment.weapons[0], stick);
});

test('abilities reject empty or unaffordable bindings and reassignment updates key positions', () => {
  const campaign = createCampaign(41); campaign.floor.entities = [];
  const insufficient = structuredClone(campaign); insufficient.player.resources.mana.current = 0;
  const rejected = applyAction(insufficient, { type: 'ability', index: 0 });
  assert.equal(rejected.accepted, false); assert.equal(rejected.ticks, 0); assert.equal(rejected.events[0].facts.reason, 'insufficient-mana');
  const empty = applyAction(campaign, { type: 'ability', index: 2 }); assert.equal(empty.accepted, false); assert.equal(empty.state.floor.time, 0);
  const moved = applyAction(campaign, { type: 'assign-ability', from: 0, to: 3 });
  assert.deepEqual(moved.state.player.abilities, [null, 'wand', null, 'heal']); assert.equal(moved.state.floor.time, 1);
  const noTarget = applyAction(campaign, { type: 'ability', index: 1 });
  assert.equal(noTarget.accepted, false); assert.equal(noTarget.events[0].facts.reason, 'no-valid-target');
});

test('WorldRender shares exact terrain and entity coordinates while camera policies remain presentation-only', () => {
  const campaign = createCampaign(42); const game = WorldRender.Render({ map: campaign.floor.map, entities: campaign.floor.entities, player: campaign.player, view: 'game' });
  const minimap = WorldRender.Render({ map: campaign.floor.map, entities: campaign.floor.entities, player: campaign.player, view: 'minimap', detail: 'simplified' });
  assert.deepEqual(game.terrain.map(({ x, y, frame }) => [x, y, frame]), minimap.terrain.map(({ x, y, frame }) => [x, y, frame]));
  assert.deepEqual(game.actors.map(({ id, x, y }) => [id, x, y]), minimap.actors.map(({ id, x, y }) => [id, x, y]));
  assert.deepEqual(game.markers.player, minimap.markers.player); assert.equal(game.markers.exit.id, minimap.markers.exit.id);
  const player = { x: 10, y: 10 };
  const initial = getCameraCenter({ mode: 'center', player, visibleWidth: 20, visibleHeight: 10 }); assert.deepEqual(initial, player);
  assert.deepEqual(getCameraCenter({ mode: 'deadzone', player: { x: 11, y: 10 }, previousCenter: player, visibleWidth: 20, visibleHeight: 10 }), player);
  assert.deepEqual(getCameraCenter({ mode: 'deadzone', player: { x: 14, y: 10 }, previousCenter: player, visibleWidth: 20, visibleHeight: 10 }), { x: 11, y: 10 });
  assert.deepEqual(getCameraCenter({ mode: 'deadzone', player: { x: 14, y: 10 }, previousCenter: player, visibleWidth: 40, visibleHeight: 20 }), player);
  const screen = getCameraCenter({ mode: 'screen', player: { x: 20, y: 10 }, visibleWidth: 10, visibleHeight: 8 });
  assert.deepEqual(screen, { x: 25, y: 12 });
  assert.deepEqual(getCameraCenter({ mode: 'screen', player: { x: 9, y: 10 }, visibleWidth: 10, visibleHeight: 8 }), { x: 5, y: 12 });
  assert.deepEqual(getCameraCenter({ mode: 'screen', player: { x: 20, y: 7 }, visibleWidth: 10, visibleHeight: 8 }), { x: 25, y: 4 });
  assert.deepEqual(getCameraCenter({ mode: 'screen', player: { x: 20, y: 8 }, visibleWidth: 10, visibleHeight: 8 }), { x: 25, y: 12 });
  assert.deepEqual({ x: campaign.player.x, y: campaign.player.y }, game.markers.player); // Camera framing never mutates map coordinates.
});
test('floating text anchors to the target cell top edge across camera movement and zoom', () => {
  const player = { x: 10, y: 10 }; const target = { x: 11, y: 9 };
  const center = getCameraCenter({ mode: 'center', player, visibleWidth: 10, visibleHeight: 8 });
  assert.deepEqual(getWorldScreenPosition({ ...target, center, viewportWidth: 300, viewportHeight: 200, tileCssSize: 32 }), { left: 182, top: 52 });
  assert.deepEqual(getWorldScreenPosition({ ...target, center, viewportWidth: 300, viewportHeight: 200, tileCssSize: 64 }), { left: 214, top: 4 });
  const movedCenter = getCameraCenter({ mode: 'center', player: { x: 11, y: 9 }, visibleWidth: 10, visibleHeight: 8 });
  assert.deepEqual(getWorldScreenPosition({ ...target, center: movedCenter, viewportWidth: 300, viewportHeight: 200, tileCssSize: 32 }), { left: 150, top: 84 });
});
test('mouse coordinates select the cell centered under the pointer across scale factors', () => {
  const center = { x: 10, y: 20 };
  for (const tileCssSize of [8, 16, 32, 48, 64, 128]) {
    const viewportWidth = tileCssSize * 10, viewportHeight = tileCssSize * 8;
    for (const cell of [{ x: 10, y: 20 }, { x: 9, y: 19 }, { x: 13, y: 22 }]) {
      const point = getWorldCellScreenCenter({ ...cell, center, viewportWidth, viewportHeight, tileCssSize });
      assert.deepEqual(getWorldCellAtScreenPosition({ screenX: point.left, screenY: point.top, center, viewportWidth, viewportHeight, tileCssSize }), cell);
      assert.deepEqual(getWorldCellAtScreenPosition({ screenX: point.left - tileCssSize / 2 + 0.01, screenY: point.top + tileCssSize / 2 - 0.01, center, viewportWidth, viewportHeight, tileCssSize }), cell);
    }
  }
});
test('a held selection remains on its original world cell as the camera scrolls', () => {
  const selected = { x: 14, y: 9 };
  const viewportWidth = 320, viewportHeight = 180, tileCssSize = 32;
  for (const center of [{ x: 10, y: 10 }, { x: 11, y: 10 }, { x: 12, y: 9 }]) {
    const position = getWorldCellScreenCenter({ ...selected, center, viewportWidth, viewportHeight, tileCssSize });
    assert.deepEqual(getWorldCellAtScreenPosition({ screenX: position.left, screenY: position.top, center, viewportWidth, viewportHeight, tileCssSize }), selected);
  }
});
test('selected grid cell is the single source for mouse movement', () => {
  const player = { x: 5, y: 5 };
  assert.equal(getMouseMovementFromSelectedCell(null, player), null);
  assert.equal(getMouseMovementFromSelectedCell({ x: 7, y: 5, pressed: false }, player), null);
  assert.deepEqual(getMouseMovementFromSelectedCell({ x: 7, y: 6, pressed: true }, player), { direction: 'e', sprint: false });
  assert.deepEqual(getMouseMovementFromSelectedCell({ x: 4, y: 8, pressed: true, sprint: true }, player), { direction: 's', sprint: true });
  assert.equal(getMouseMovementFromSelectedCell({ x: 5, y: 5, pressed: true }, player), null);
});
test('game Zoom presets map a 32 CSS-pixel tile independently of backing density', () => {
  assert.deepEqual(gameZoomPresets.map((zoom) => getTileCssSize(zoom)), [8, 16, 32, 64, 128]);
  for (const zoom of gameZoomPresets) for (const dpr of [1, 1.5, 2, 3]) assert.equal(getTileCssSize(zoom), 32 * zoom);
});

test('WASD and arrow input track held directions independently and delay held-key repeats', () => {
  for (const [code, direction] of Object.entries({ KeyW: 'n', KeyA: 'w', KeyS: 's', KeyD: 'e', ArrowUp: 'n', ArrowLeft: 'w', ArrowDown: 's', ArrowRight: 'e' })) assert.deepEqual(getMovementKey({ code }), { code, direction });
  const held = new Map(); held.set('KeyW', { direction: 'n' }); held.set('ArrowRight', { direction: 'e' });
  assert.deepEqual(getLatestMovement(held), { direction: 'e', sprint: false }); held.delete('ArrowRight');
  assert.deepEqual(getLatestMovement(held), { direction: 'n', sprint: false }); assert.deepEqual(getLatestMovement(held, true), { direction: 'n', sprint: true });
  assert.equal(getMovementKey({ key: 'D' }).direction, 'e');
  assert.equal(WALK_INITIAL_DELAY, 400);
  assert.equal(WALK_REPEAT_DELAY, 200);
  assert.equal(SPRINT_INITIAL_DELAY, 250);
  assert.equal(SPRINT_REPEAT_DELAY, 125);
  assert.equal(getMoveInitialDelay(false), WALK_INITIAL_DELAY);
  assert.equal(getMoveInitialDelay(true), SPRINT_INITIAL_DELAY);
  assert.equal(getMoveRepeatDelay(false), WALK_REPEAT_DELAY);
  assert.equal(getMoveRepeatDelay(true), SPRINT_REPEAT_DELAY);
});

test('enemies advance toward the player every second game frame while attacking when adjacent', () => {
  const campaign = createCampaign(71); const { x, y } = campaign.player;
  for (let offset = 1; offset <= 5; offset++) campaign.floor.map[y][x + offset] = 0;
  campaign.floor.entities = [{ id: 'slow-enemy', kind: 'enemy', name: 'Slow Enemy', x: x + 4, y, hp: 10, damage: 1, xp: 1 }];
  const first = applyAction(campaign, { type: 'move', direction: 'e' });
  assert.equal(first.state.floor.time, 1); assert.equal(first.state.floor.entities[0].x, x + 4);
  const second = applyAction(first.state, { type: 'move', direction: 'e' });
  assert.equal(second.state.floor.time, 2); assert.equal(second.state.floor.entities[0].x, x + 3);
});

test('integrates collect, equipment preview and reorder, ability, potion, descent, and death events', () => {
  let state = createCampaign(72); state.floor.entities = [];
  const open = (x, y) => { state.floor.map[y][x] = 0; };
  const loot = { id: 'found-sword', name: 'Found Sword', group: 'weapons', modifiers: { offense: 3 } };
  const x = state.player.x + 1, y = state.player.y; open(x, y);
  state.floor.entities = [{ id: 'world-sword', kind: 'item', x, y, item: loot }];
  const collected = applyAction(state, { type: 'move', direction: 'e' }); state = collected.state;
  assert.ok(collected.events.some((event) => event.type === 'item.collected'));
  const preview = previewInventoryDrop(state, { kind: 'inventory', item: loot }, 'weapons', 0, null);
  assert.ok(preview); assert.equal(state.player.equipment.weapons[0], null); // Preview/cancel leaves source untouched.
  const equipped = applyAction(state, { type: 'equip', itemId: loot.id, group: 'weapons', index: 0 }); state = equipped.state;
  state.player.inventory.push({ id: 'backup-sword', name: 'Backup Sword', group: 'weapons', modifiers: { offense: 1 } });
  state = applyAction(state, { type: 'equip', itemId: 'backup-sword', group: 'weapons', index: 1 }).state;
  const reordered = applyAction(state, { type: 'reorder-equipment', group: 'weapons', index: 0, other: 1 }); state = reordered.state;
  assert.ok(reordered.events.some((event) => event.type === 'equipment.changed'));
  state.player.resources.health.current = 10;
  const healed = applyAction(state, { type: 'ability', index: 0 }); state = healed.state;
  assert.ok(healed.events.some((event) => event.type === 'ability.used'));
  const px = state.player.x, py = state.player.y + 1; open(px, py);
  state.floor.entities = [{ id: 'health-potion', kind: 'potion', resource: 'health', name: 'Health Potion', x: px, y: py }];
  const potion = applyAction(state, { type: 'move', direction: 's' }); state = potion.state;
  assert.ok(potion.events.some((event) => event.type === 'potion.consumed'));
  const sx = state.player.x + 1, sy = state.player.y; open(sx, sy);
  state.floor.entities = [{ id: 'stairs', kind: 'stairs', x: sx, y: sy }];
  const descent = applyAction(state, { type: 'move', direction: 'e' }); state = descent.state;
  assert.ok(descent.events.some((event) => event.type === 'realm.entered'));
  assert.equal(state.floor.level, 2); assert.equal(state.progression.difficulty, 2);
  const oldTime = state.floor.time, oldX = state.player.x, oldY = state.player.y;
  open(oldX + 1, oldY); state.floor.entities = [{ id: 'fatal', kind: 'enemy', name: 'Fatal Enemy', x: oldX, y: oldY, hp: 10, damage: 999, xp: 1 }];
  const death = applyAction(state, { type: 'move', direction: 'e' });
  assert.ok(death.events.some((event) => event.type === 'player.died'));
  assert.equal(death.events.filter((event) => event.type === 'time.advanced').length, 1);
  assert.equal(death.events.filter((event) => event.type === 'resource.changed' && event.facts.cause === 'enemy-attack').length, 1);
});
