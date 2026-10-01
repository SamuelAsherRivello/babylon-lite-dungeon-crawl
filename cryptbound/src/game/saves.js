const PREFIX = "cryptbound.slot.";
export const SLOT_IDS = Object.freeze(["1", "2", "3"]);
function validCampaign(value) { return value?.version === 1 && value.progression?.stats && value.floor?.map && value.player?.equipment; }
export function readSlot(storage, slot) {
  if (!SLOT_IDS.includes(String(slot))) throw new Error("Unknown save slot.");
  const raw = storage.getItem(PREFIX + slot); if (!raw) return null;
  const value = JSON.parse(raw); if (!validCampaign(value)) throw new Error("This save is invalid or from an unsupported version."); return value;
}
export function writeSlot(storage, slot, campaign) {
  if (!SLOT_IDS.includes(String(slot))) throw new Error("Unknown save slot.");
  if (!validCampaign(campaign)) throw new Error("Cannot save an invalid campaign.");
  storage.setItem(PREFIX + slot, JSON.stringify({ ...campaign, savedAt: Date.now() }));
}
export function deleteSlot(storage, slot) { if (!SLOT_IDS.includes(String(slot))) throw new Error("Unknown save slot."); storage.removeItem(PREFIX + slot); }
export function readSlotSummary(storage) {
  return SLOT_IDS.map((slot) => { try { const state = readSlot(storage, slot); return { slot, occupied: Boolean(state), depth: state?.floor.depth ?? null, level: state?.progression.level ?? null }; } catch (error) { return { slot, occupied: true, invalid: true, error: error.message }; } });
}
