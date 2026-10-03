import { createCampaign, isResourcesModel, upgradeCampaignResources } from "./dungeon.js";
import { gameZoomPresets } from "../content/world/zoom.js";

const PREFIX = "cryptbound.slot.";
const BACKUP_PREFIX = "cryptbound.slot.v1-backup.";
const PREFERENCE_KEY = "cryptbound.preferences.v1";
export const SLOT_IDS = Object.freeze(["1", "2", "3"]);
export const DEFAULT_PREFERENCES = Object.freeze({ zoom: 1, camera: "center", fullscreenDesired: false, sfxVolume: 80, musicVolume: 20, muteAll: false });

export function isValidCampaign(value) { return value?.version === 2 && value.progression?.attributes && value.floor?.map && value.player?.equipment && Array.isArray(value.player.inventory); }
function validV1(value) { return value?.version === 1 && value.progression?.stats && value.floor?.map && value.player?.equipment; }
function oldItem(item, id) {
  const group = /head|body|leg/i.test(item?.slot ?? "") ? "armor" : "weapons";
  return { id, name: item?.name ?? "Recovered item", group, modifiers: group === "armor" ? { defense: item?.defense ?? 0 } : { offense: item?.attack ?? 0, defense: item?.defense ?? 0 } };
}
function legacyEquipmentItems(equipment = {}) {
  const seen = new Set();
  return Object.values(equipment).flatMap((item, index) => {
    if (!item) return [];
    // Legacy state could reference the same item in both a slot and a pending
    // choice. Preserve the first occurrence only so migration never clones it.
    const identity = item.id ?? `${item.name ?? "item"}:${item.slot ?? index}`;
    if (seen.has(identity)) return [];
    seen.add(identity);
    return [oldItem(item, `legacy-${identity}`)];
  });
}
export function migrateCampaign(value) {
  if (isValidCampaign(value)) {
    const level = Number.isInteger(value.floor.level) ? value.floor.level : Number.isInteger(value.floor.depth) ? value.floor.depth : 1;
    const difficulty = Number.isInteger(value.progression.difficulty) ? value.progression.difficulty : level;
    const needsResourceMigration = !isResourcesModel(value.player.resources) || (value.floor.entities ?? []).some((entity) => entity.kind === "enemy" && !isResourcesModel(entity.resources));
    if (value.floor.level === level && value.progression.difficulty === difficulty && !needsResourceMigration) return value;
    const next = { ...structuredClone(value), floor: { ...structuredClone(value.floor), level }, progression: { ...structuredClone(value.progression), difficulty }, realm: value.realm ?? `Underground ${level}` };
    return upgradeCampaignResources(next);
  }
  if (!validV1(value)) throw new Error("This save is invalid or from an unsupported version.");
  const level = Number.isInteger(value.floor.level) ? value.floor.level : Number.isInteger(value.floor.depth) ? value.floor.depth : 1;
  const next = createCampaign(value.floor.seed, level);
  next.floor = structuredClone(value.floor);
  next.floor.level = level;
  next.floor.time = Number.isFinite(value.floor.time) ? value.floor.time : Number.isFinite(value.time) ? value.time : 0;
  next.world = value.world ?? "One"; next.realm = value.realm ?? `Underground ${level}`;
  next.player.x = value.player.x; next.player.y = value.player.y;
  const stats = value.progression.stats;
  const oldHealth = stats.health ?? stats.vitality ?? value.player.maxHp ?? 25;
  const oldStamina = stats.stamina ?? 25;
  next.progression = { attributes: { health: Math.max(1, oldHealth), stamina: Math.max(0, oldStamina), offense: Math.max(0, stats.offense ?? stats.strength ?? 0), defense: Math.max(0, stats.defense ?? 0), mana: Math.max(0, stats.mana ?? 20), vitality: 0, strength: 0, luck: 0, recovery: 0, agility: 0 }, level: value.progression.level ?? 1, xp: value.progression.xp ?? 0, nextXp: 100, totalKills: value.progression.totalKills ?? 0, difficulty: level };
  next.player.resources = { health: Math.min(next.progression.attributes.health, value.player.resources?.health ?? value.player.hp ?? next.progression.attributes.health), stamina: Math.min(next.progression.attributes.stamina, value.player.resources?.stamina ?? oldStamina), mana: Math.min(next.progression.attributes.mana, value.player.resources?.mana ?? 20) };
  const legacy = legacyEquipmentItems(value.player.equipment);
  const armor = legacy.filter((item) => item.group === "armor"); const weapons = legacy.filter((item) => item.group === "weapons");
  next.player.equipment = { weapons: [weapons.shift() ?? null, weapons.shift() ?? null], armor: [armor.shift() ?? null, armor.shift() ?? null] };
  next.player.inventory = [...weapons, ...armor].sort((a, b) => a.name.localeCompare(b.name));
  next.player.sneaking = Boolean(value.player.sneaking ?? value.pending?.sneaking ?? false);
  next.counters = { ...next.counters, ...(value.counters ?? {}) };
  next.objective = value.objective ?? next.objective;
  next.log = [];
  return upgradeCampaignResources(next);
}
export function readSlot(storage, slot) {
  if (!SLOT_IDS.includes(String(slot))) throw new Error("Unknown Saved Game.");
  const raw = storage.getItem(PREFIX + slot); if (!raw) return null;
  const original = JSON.parse(raw); const campaign = migrateCampaign(original);
  if (campaign !== original) {
    // Write the rollback copy first, then replace the primary record. If either
    // storage operation fails, the original slot data remains recoverable.
    if (original.version === 1) storage.setItem(BACKUP_PREFIX + slot, raw);
    storage.setItem(PREFIX + slot, JSON.stringify({ ...campaign, savedAt: Date.now() }));
  }
  return campaign;
}
export function writeSlot(storage, slot, campaign) {
  if (!SLOT_IDS.includes(String(slot))) throw new Error("Unknown Saved Game.");
  if (!isValidCampaign(campaign)) throw new Error("Cannot save an invalid campaign.");
  storage.setItem(PREFIX + slot, JSON.stringify({ ...campaign, savedAt: Date.now() }));
}
export function deleteSlot(storage, slot) { if (!SLOT_IDS.includes(String(slot))) throw new Error("Unknown Saved Game."); storage.removeItem(PREFIX + slot); }
export function readSlotSummary(storage) { return SLOT_IDS.map((slot) => { try { const state = readSlot(storage, slot); return { slot, occupied: Boolean(state), level: state?.floor.level ?? state?.floor.depth ?? null, xpLevel: state?.progression.level ?? null }; } catch (error) { return { slot, occupied: true, invalid: true, error: error.message }; } }); }
function normalizeVolume(value, fallback) { return Number.isInteger(value) && value >= 0 && value <= 100 ? value : fallback; }
export function normalizePreferences(value) { return { zoom: gameZoomPresets.includes(value?.zoom) ? value.zoom : DEFAULT_PREFERENCES.zoom, camera: ["center", "deadzone", "screen"].includes(value?.camera) ? value.camera : DEFAULT_PREFERENCES.camera, fullscreenDesired: value?.fullscreenDesired === true, sfxVolume: normalizeVolume(value?.sfxVolume, DEFAULT_PREFERENCES.sfxVolume), musicVolume: normalizeVolume(value?.musicVolume, DEFAULT_PREFERENCES.musicVolume), muteAll: value?.muteAll === true }; }
export function readPreferences(storage) { try { return normalizePreferences(JSON.parse(storage.getItem(PREFERENCE_KEY) ?? "null")); } catch { return { ...DEFAULT_PREFERENCES }; } }
export function writePreferences(storage, value) { const normalized = normalizePreferences(value); storage.setItem(PREFERENCE_KEY, JSON.stringify(normalized)); return normalized; }
