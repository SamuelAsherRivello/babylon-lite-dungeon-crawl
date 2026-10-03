import { wallFrameAt } from "../../game/dungeon.js";

/** Build renderer-neutral geometry/placement for either world view. */
export const WorldRender = Object.freeze({
  Render({ map, entities = [], player, tileSize = 32, view = "game", detail = "full" }) {
    const terrain = [];
    for (let y = 0; y < map.length; y++) for (let x = 0; x < map[y].length; x++) {
      terrain.push({ x, y, worldX: x * tileSize + tileSize / 2, worldY: y * tileSize + tileSize / 2, wall: map[y][x] === 1, frame: map[y][x] === 1 ? wallFrameAt({ map }, x, y) : 26 });
    }
    const actors = entities.filter((entry) => entry.kind === "enemy").map((entry) => ({ id: entry.id, kind: entry.name === "Skeleton" ? "skeleton" : "rat", x: entry.x, y: entry.y, worldX: entry.x * tileSize + tileSize / 2, worldY: entry.y * tileSize + tileSize / 2 }));
    const objects = entities.filter((entry) => ["item", "potion", "chest", "stairs", "discovery"].includes(entry.kind)).map((entry) => ({ id: entry.id, kind: entry.kind, resource: entry.resource ?? null, x: entry.x, y: entry.y, worldX: entry.x * tileSize + tileSize / 2, worldY: entry.y * tileSize + tileSize / 2 }));
    return { view, detail, tileSize, width: map[0]?.length ?? 0, height: map.length, terrain, actors, objects, markers: { player: { x: player.x, y: player.y }, exit: objects.find((entry) => entry.kind === "stairs") ?? null } };
  },
});

/** Return the world coordinate centered by a camera policy, in tile units. */
export function getCameraCenter({ mode = "center", player, previousCenter = player, visibleWidth, visibleHeight }) {
  if (mode === "screen") {
    const pageWidth = Math.max(1, Math.floor(visibleWidth)); const pageHeight = Math.max(1, Math.floor(visibleHeight));
    return { x: Math.floor(player.x / pageWidth) * pageWidth + pageWidth / 2, y: Math.floor(player.y / pageHeight) * pageHeight + pageHeight / 2 };
  }
  if (mode === "deadzone") {
    const halfX = Math.max(0, visibleWidth * 0.15); const halfY = Math.max(0, visibleHeight * 0.15);
    return { x: player.x < previousCenter.x - halfX ? player.x + halfX : player.x > previousCenter.x + halfX ? player.x - halfX : previousCenter.x, y: player.y < previousCenter.y - halfY ? player.y + halfY : player.y > previousCenter.y + halfY ? player.y - halfY : previousCenter.y };
  }
  return { x: player.x, y: player.y };
}

/** Project a world-cell coordinate into viewport CSS pixels using the active camera and zoom. */
export function getWorldScreenPosition({ x, y, center, viewportWidth, viewportHeight, tileCssSize }) {
  return {
    left: viewportWidth / 2 + (x - center.x) * tileCssSize,
    top: viewportHeight / 2 + (y - center.y) * tileCssSize - tileCssSize / 2,
  };
}

/** Invert a centered world view: each integer cell coordinate refers to its sprite center. */
export function getWorldCellAtScreenPosition({ screenX, screenY, center, viewportWidth, viewportHeight, tileCssSize }) {
  return {
    x: Math.floor(center.x + (screenX - viewportWidth / 2) / tileCssSize + 0.5),
    y: Math.floor(center.y + (screenY - viewportHeight / 2) / tileCssSize + 0.5),
  };
}

/** Project a cell center for overlays that occupy the entire tile, such as the targeting reticle. */
export function getWorldCellScreenCenter({ x, y, center, viewportWidth, viewportHeight, tileCssSize }) {
  return {
    left: viewportWidth / 2 + (x - center.x) * tileCssSize,
    top: viewportHeight / 2 + (y - center.y) * tileCssSize,
  };
}
