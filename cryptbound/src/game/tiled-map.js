import { FLOOR_HEIGHT, FLOOR_WIDTH, generateFloor } from "./dungeon.js";
import { buildDungeonWangTerrain } from "../content/world/dungeon-wang.js";

export const GENERATOR_VERSION = "cryptbound-floor-v1";
export const TILED_TILE_SIZE = 32;
export const DUNGEON_TILESET_SOURCE = "../../assets/Tiled_Examples/Tilesets/Tileset_Dungeon.tsx";

function propertiesObject(properties = []) {
  return Object.fromEntries(properties.map(({ name, value }) => [name, value]));
}

function propertiesArray(values) {
  return Object.entries(values).filter(([, value]) => value !== undefined).map(([name, value]) => ({ name, type: typeof value === "number" ? "int" : "string", value }));
}

function objectLayer(name, objects) { return { id: name === "Entities" ? 3 : 4, name, type: "objectgroup", visible: true, opacity: 1, draworder: "topdown", objects }; }

export function serializeFloorToTiled({ campaign, generatorVersion = GENERATOR_VERSION } = {}) {
  const floor = campaign?.floor;
  if (!floor?.map?.length) throw new Error("Cannot export an empty dungeon floor.");
  const width = Number(floor.width ?? floor.map[0].length); const height = Number(floor.height ?? floor.map.length);
  const terrainModel = buildDungeonWangTerrain({ map: floor.map, tileSize: TILED_TILE_SIZE });
  const terrainByCell = new Map(terrainModel.terrain.map((cell) => [`${cell.x},${cell.y}`, cell.frame == null ? 0 : cell.frame + 1]));
  const terrain = floor.map.flatMap((row, y) => row.map((_, x) => terrainByCell.get(`${x},${y}`) ?? 0));
  const walkability = floor.map.flatMap((row) => row.map((cell) => cell === 0 ? 1 : 0));
  const entityObjects = (floor.entities ?? []).map((entity, index) => ({ id: index + 1, name: entity.id ?? `${entity.kind}-${index}`, type: entity.kind, x: entity.x * TILED_TILE_SIZE, y: entity.y * TILED_TILE_SIZE, width: TILED_TILE_SIZE, height: TILED_TILE_SIZE, properties: propertiesArray({ ...entity, x: undefined, y: undefined, id: undefined, kind: undefined }) }));
  const markerObjects = [
    { id: 1, name: "player", type: "player", x: campaign.player.x * TILED_TILE_SIZE, y: campaign.player.y * TILED_TILE_SIZE, width: TILED_TILE_SIZE, height: TILED_TILE_SIZE },
    ...((floor.entities ?? []).filter((entity) => entity.kind === "stairs").map((entity, index) => ({ id: index + 2, name: "exit", type: "exit", x: entity.x * TILED_TILE_SIZE, y: entity.y * TILED_TILE_SIZE, width: TILED_TILE_SIZE, height: TILED_TILE_SIZE }))),
  ];
  return {
    type: "map", version: "1.10", tiledversion: "1.10.2", orientation: "orthogonal", renderorder: "right-down",
    width, height, tilewidth: TILED_TILE_SIZE, tileheight: TILED_TILE_SIZE, infinite: false,
    properties: propertiesArray({ world: campaign.world === "One" ? 1 : campaign.world, level: floor.level ?? 1, seed: floor.seed, generatorVersion, coordinateConvention: "tile-origin" }),
    tilesets: [{ firstgid: 1, source: DUNGEON_TILESET_SOURCE }],
    layers: [
      { id: 1, name: "Walkability", type: "tilelayer", visible: true, opacity: 1, width, height, data: walkability },
      { id: 2, name: "Terrain", type: "tilelayer", visible: true, opacity: 1, width, height, data: terrain },
      objectLayer("Entities", entityObjects), objectLayer("Markers", markerObjects),
    ],
  };
}

function tileLayer(map, name) { return map.layers?.find((layer) => layer.type === "tilelayer" && layer.name === name); }
function objectLayerByName(map, name) { return map.layers?.find((layer) => layer.type === "objectgroup" && layer.name === name); }
function objectCell(object) { return { x: Math.floor(Number(object.x) / TILED_TILE_SIZE), y: Math.floor(Number(object.y) / TILED_TILE_SIZE) }; }

export function validateTiledRepairMap(map) {
  const properties = propertiesObject(map?.properties);
  const walkability = tileLayer(map, "Walkability"); const terrain = tileLayer(map, "Terrain"); const markers = objectLayerByName(map, "Markers");
  const errors = [];
  if (map?.type !== "map" || map.orientation !== "orthogonal") errors.push("map must be an orthogonal Tiled map");
  if (map?.width !== FLOOR_WIDTH || map?.height !== FLOOR_HEIGHT) errors.push(`map must be ${FLOOR_WIDTH} by ${FLOOR_HEIGHT} tiles`);
  if (map?.tilewidth !== TILED_TILE_SIZE || map?.tileheight !== TILED_TILE_SIZE) errors.push("map tiles must be 32 by 32 pixels");
  if (!walkability || !Array.isArray(walkability.data) || walkability.data.length !== FLOOR_WIDTH * FLOOR_HEIGHT) errors.push("Walkability layer is missing or has the wrong size");
  if (!terrain || !Array.isArray(terrain.data) || terrain.data.length !== FLOOR_WIDTH * FLOOR_HEIGHT) errors.push("Terrain layer is missing or has the wrong size");
  if (!properties.generatorVersion || properties.coordinateConvention !== "tile-origin") errors.push("generation metadata is missing");
  const player = markers?.objects?.find((object) => object.type === "player"); const exit = markers?.objects?.find((object) => object.type === "exit");
  if (!player) errors.push("player marker is missing"); if (!exit) errors.push("exit marker is missing");
  for (const object of [player, exit]) if (object && (!Number.isInteger(object.x) || !Number.isInteger(object.y))) errors.push("markers must use integer tile-aligned coordinates");
  return { valid: errors.length === 0, errors, properties, walkability, terrain, markers };
}

export function floorFromTiledRepairMap(map, fallbackFloor = null) {
  const checked = validateTiledRepairMap(map); if (!checked.valid) throw new Error(`Invalid repaired map: ${checked.errors.join("; ")}`);
  const mapData = Array.from({ length: FLOOR_HEIGHT }, (_, y) => checked.walkability.data.slice(y * FLOOR_WIDTH, (y + 1) * FLOOR_WIDTH).map((cell) => Number(cell) === 1 ? 0 : 1));
  const markers = checked.markers.objects; const player = objectCell(markers.find((object) => object.type === "player")); const exit = objectCell(markers.find((object) => object.type === "exit"));
  if (mapData[player.y]?.[player.x] !== 0 || mapData[exit.y]?.[exit.x] !== 0) throw new Error("player and exit markers must be on walkable cells");
  const entitiesLayer = objectLayerByName(map, "Entities");
  const entities = (entitiesLayer?.objects ?? []).map((object) => { const position = objectCell(object); const props = propertiesObject(object.properties); return { ...props, id: object.name || props.id, kind: object.type || props.kind, x: position.x, y: position.y }; });
  if (!entities.some((entity) => entity.kind === "stairs")) entities.push({ id: "stairs", kind: "stairs", x: exit.x, y: exit.y });
  return { ...(fallbackFloor ?? generateFloor(Number(checked.properties.level ?? 1), Number(checked.properties.seed ?? 0), Number(checked.properties.level ?? 1))), seed: Number(checked.properties.seed ?? fallbackFloor?.seed ?? 0), width: FLOOR_WIDTH, height: FLOOR_HEIGHT, map: mapData, start: player, entities, level: Number(checked.properties.level ?? fallbackFloor?.level ?? 1) };
}
