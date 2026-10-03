import { createAStarPathfinder, createGridMap } from "@esengine/pathfinding";

// Adapted from the MIT-licensed cardinal A* integration in
// https://github.com/SamuelAsherRivello/babylon-lite-ascii-rpg
const sameCell = (left, right) => left?.x === right?.x && left?.y === right?.y;
const cellKey = ({ x, y }) => `${x},${y}`;
const isWalkableTerrain = (floor, x, y) => floor?.map?.[y]?.[x] === 0;

/** Find a cardinal route across a floor without passing through occupied cells. */
export function findCardinalPath(floor, from, to) {
  const height = floor?.map?.length ?? 0;
  const width = floor?.map?.[0]?.length ?? 0;
  if (!width || !height || !Number.isInteger(from?.x) || !Number.isInteger(from?.y) || !Number.isInteger(to?.x) || !Number.isInteger(to?.y)
    || !isWalkableTerrain(floor, from.x, from.y) || !isWalkableTerrain(floor, to.x, to.y)) return null;

  const occupied = new Set((floor.entities ?? [])
    .filter((entity) => !sameCell(entity, to))
    .map(cellKey));
  const grid = createGridMap(width, height, { allowDiagonal: false });
  for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) {
    grid.setWalkable(x, y, isWalkableTerrain(floor, x, y) && (!occupied.has(`${x},${y}`) || (x === from.x && y === from.y)));
  }
  const result = createAStarPathfinder(grid).findPath(from.x, from.y, to.x, to.y);
  if (!result.found || !result.path.length) return null;
  const path = result.path.map((cell) => Object.freeze({ x: cell.x, y: cell.y }));
  return Object.freeze(path);
}
