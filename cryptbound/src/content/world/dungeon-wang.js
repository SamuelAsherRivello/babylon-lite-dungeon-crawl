const DIRECTIONS = Object.freeze([
  [0, -1], [1, -1], [1, 0], [1, 1],
  [0, 1], [-1, 1], [-1, 0], [-1, -1],
]);

// Source: cryptbound/documentation/dungeon-wang-mapping.md. The key is the
// eight-bit mask in Tiled's N, NE, E, SE, S, SW, W, NW order.
export const DUNGEON_WANG_TILE_BY_MASK = Object.freeze({
  7: 48,
  28: 0,
  31: 12,
  112: 5,
  124: 1,
  127: 32,
  193: 53,
  199: 49,
  223: 8,
  241: 17,
  247: 6,
  253: 30,
  255: 13,
});

export const DUNGEON_WANG_INTERIOR_TILE = 13;

export function walkableMask(map, x, y) {
  return DIRECTIONS.reduce((mask, [dx, dy], index) => mask | (map[y + dy]?.[x + dx] === 0 ? 1 << index : 0), 0);
}

export function isWalkableBoundary(mask) { return mask !== 255; }

export function buildDungeonWangTerrain({ map, tileSize = 32 }) {
  const terrain = [];
  const diagnostics = [];
  for (let y = 0; y < map.length; y++) for (let x = 0; x < (map[y]?.length ?? 0); x++) {
    if (map[y][x] !== 0) continue;
    const mask = walkableMask(map, x, y);
    const frame = DUNGEON_WANG_TILE_BY_MASK[mask];
    const entry = { x, y, mask, worldX: x * tileSize + tileSize / 2, worldY: y * tileSize + tileSize / 2, frame: frame ?? null, floorFrame: frame ?? null, wallFrame: null, wall: false };
    if (frame == null && isWalkableBoundary(mask)) diagnostics.push({ x, y, mask, worldX: entry.worldX, worldY: entry.worldY });
    terrain.push(entry);
  }
  return { terrain, diagnostics };
}

