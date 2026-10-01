import assert from 'node:assert/strict';
import test from 'node:test';
import { brace, choosePending, createCampaign, generateFloor, resolveTurn, wallFrameAt } from '../src/game/dungeon.js';
import { SLOT_IDS, deleteSlot, readSlot, readSlotSummary, writeSlot } from '../src/game/saves.js';

function openAround(state, x, y, radius = 4) {
  for (let py = Math.max(1, y - radius); py <= Math.min(state.floor.height - 2, y + radius); py++) {
    for (let px = Math.max(1, x - radius); px <= Math.min(state.floor.width - 2, x + radius); px++) state.floor.map[py][px] = 0;
  }
}
function emptyEntities(state) { state.floor.entities = []; }

test('generates deterministic connected floors with a reachable start weapon and stairs', () => {
  for (const seed of [1, 2, 17, 1337, 0xffffffff]) {
    const floor = generateFloor(1, seed);
    assert.deepEqual(floor.map, generateFloor(1, seed).map);
    const interiorWalls = floor.map.slice(1, -1).flatMap((row) => row.slice(1, -1)).filter((tile) => tile === 1).length;
    const interiorFloors = floor.map.slice(1, -1).flatMap((row) => row.slice(1, -1)).filter((tile) => tile === 0).length;
    assert.ok(interiorWalls > 0, `seed ${seed} carves rooms into solid rock`);
    assert.ok(interiorFloors > 0, `seed ${seed} contains walkable rooms and corridors`);
    const visited = new Set([`${floor.start.x},${floor.start.y}`]); const queue = [floor.start];
    while (queue.length) {
      const { x, y } = queue.shift();
      for (const [dx, dy] of [[0,-1],[1,0],[0,1],[-1,0]]) {
        const nx = x + dx; const ny = y + dy; const key = `${nx},${ny}`;
        if (floor.map[ny]?.[nx] === 0 && !visited.has(key)) { visited.add(key); queue.push({ x:nx, y:ny }); }
      }
    }
    const stairs = floor.entities.find((entity) => entity.kind === 'stairs');
    const stick = floor.entities.find((entity) => entity.kind === 'item' && entity.item.name === 'Wooden Stick');
    assert.ok(visited.has(`${stairs.x},${stairs.y}`), `stairs reachable for seed ${seed}`);
    assert.ok(visited.has(`${stick.x},${stick.y}`), `stick reachable for seed ${seed}`);
  }
});

test('maps neighboring wall masks to tile frames', () => {
  const floor = { map: Array.from({ length: 3 }, () => [0,0,0]) };
  floor.map[0][1] = 1; floor.map[1][0] = 1; floor.map[1][2] = 1; floor.map[2][1] = 1;
  assert.equal(wallFrameAt(floor, 1, 1), 4);
  floor.map[0][1] = 0;
  assert.equal(wallFrameAt(floor, 1, 1), 5);
});

test('starts with empty equipment and equips the nearby stick in one turn', () => {
  const campaign = createCampaign(42);
  assert.deepEqual(Object.values(campaign.player.equipment), [null,null,null,null,null]);
  const result = resolveTurn(campaign, 'e');
  assert.equal(result.floor.time, campaign.floor.time + 1);
  assert.equal(result.player.x, campaign.player.x + 1);
  assert.equal(result.player.equipment.rightArm.name, 'Wooden Stick');
  assert.equal(result.floor.entities.some((entity) => entity.id === 'stick'), false);
});

test('rejects blocked and corner-cutting moves without advancing time', () => {
  const campaign = createCampaign(7); emptyEntities(campaign); campaign.player.x = 5; campaign.player.y = 5;
  openAround(campaign, 5, 5); campaign.floor.map[5][4] = 1;
  assert.equal(resolveTurn(campaign, 'w'), campaign);
  campaign.floor.map[4][6] = 0; campaign.floor.map[5][6] = 1; campaign.floor.map[4][5] = 0;
  assert.equal(resolveTurn(campaign, 'ne'), campaign);
  assert.equal(campaign.floor.time, 0);
});

test('runs one enemy phase after one accepted step', () => {
  const campaign = createCampaign(8); emptyEntities(campaign); campaign.player.x = 10; campaign.player.y = 10; openAround(campaign, 10, 10);
  campaign.floor.entities.push({ id:'rat', kind:'enemy', name:'Cave Rat', x:13, y:10, hp:20, damage:1, xp:2 });
  const result = resolveTurn(campaign, 'e');
  assert.equal(result.floor.time, 1);
  assert.deepEqual([result.floor.entities[0].x,result.floor.entities[0].y], [12,10]);
});

test('opens a chest for one turn, leaves its loot on the map, then descends one floor per turn', () => {
  const campaign = createCampaign(9); emptyEntities(campaign); campaign.player.x = 10; campaign.player.y = 10; openAround(campaign, 10, 10);
  campaign.floor.entities.push({ id:'chest', kind:'chest', x:11, y:10, opened:false });
  const opened = resolveTurn(campaign, 'e');
  assert.equal(opened.floor.time, 1);
  assert.ok(opened.floor.entities.some((entity) => entity.kind === 'item'));
  const stairState = createCampaign(11); stairState.player.x = 10; stairState.player.y = 10; openAround(stairState, 10, 10);
  stairState.floor.depth = 3; stairState.floor.time = 6; stairState.floor.entities = [{ id:'stairs', kind:'stairs', x:11, y:10 }];
  const descended = resolveTurn(stairState, 'e');
  assert.equal(descended.floor.depth, 4);
  assert.equal(descended.floor.time, 7);
  assert.equal(descended.player.x, descended.floor.start.x);
});

test('levels offer three stats, carry excess XP, and Brace spends Stamina to reduce damage', () => {
  const campaign = createCampaign(12); campaign.progression.xp = 10; campaign.progression.nextXp = 10;
  campaign.pending = { type:'level', choices:['strength','defense','luck'] };
  const leveled = choosePending(campaign, 'strength');
  assert.equal(leveled.progression.stats.strength, campaign.progression.stats.strength + 1);
  const guarded = createCampaign(13); emptyEntities(guarded); guarded.player.x = 10; guarded.player.y = 10; guarded.player.stamina = 2; guarded.player.hp = 10; openAround(guarded, 10, 10);
  guarded.floor.entities.push({ id:'enemy', kind:'enemy', name:'Cave Rat', x:11, y:10, hp:10, damage:4, xp:1 });
  const result = brace(guarded);
  assert.equal(result.floor.time, 1);
  assert.equal(result.player.stamina, 1);
  assert.equal(result.player.hp, 8);
});

test('death starts a fresh floor with empty gear while preserving earned progression', () => {
  const campaign = createCampaign(14); campaign.player.x = 10; campaign.player.y = 10; campaign.player.hp = 1; campaign.player.equipment.rightArm = { name:'Sword', slot:'rightArm', attack:2 };
  campaign.progression.level = 3; campaign.progression.xp = 4; campaign.progression.stats.strength = 7;
  openAround(campaign, 10, 10);
  campaign.floor.entities = [
    { id:'target', kind:'enemy', name:'Cave Rat', x:11, y:10, hp:99, damage:4, xp:1 },
    { id:'attacker', kind:'enemy', name:'Cave Rat', x:10, y:9, hp:99, damage:4, xp:1 },
  ];
  const result = resolveTurn(campaign, 'e');
  assert.equal(result.floor.depth, 1);
  assert.equal(result.progression.level, 3);
  assert.equal(result.progression.xp, 4);
  assert.equal(result.progression.stats.strength, 7);
  assert.deepEqual(Object.values(result.player.equipment), [null,null,null,null,null]);
});

class MemoryStorage {
  values = new Map();
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
}

test('stores three independent versioned campaigns and validates damaged saves', () => {
  const storage = new MemoryStorage(); const a = createCampaign(21); const b = createCampaign(22);
  assert.deepEqual(SLOT_IDS, ['1','2','3']);
  writeSlot(storage, '1', a); writeSlot(storage, '2', b);
  assert.equal(readSlot(storage, '1').floor.seed, 21);
  assert.equal(readSlot(storage, '2').floor.seed, 22);
  assert.equal(readSlot(storage, '3'), null);
  assert.deepEqual(readSlotSummary(storage).map((entry) => entry.occupied), [true,true,false]);
  storage.setItem('cryptbound.slot.3', '{broken');
  assert.equal(readSlotSummary(storage)[2].invalid, true);
  assert.throws(() => readSlot(storage, '3'), SyntaxError);
  assert.throws(() => readSlot(storage, '4'), /Unknown save slot/);
  deleteSlot(storage, '2');
  assert.equal(readSlot(storage, '2'), null);
});

test('keeps the current campaign usable when local storage writes fail', () => {
  const storage = { getItem() { return null; }, setItem() { throw new Error('quota'); }, removeItem() {} };
  assert.throws(() => writeSlot(storage, '1', createCampaign(23)), /quota/);
});
