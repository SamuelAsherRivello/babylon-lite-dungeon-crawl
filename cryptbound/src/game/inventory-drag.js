import { effectiveAttributes, previewEquipment } from "./dungeon.js";

export function previewInventoryDrop(campaign, drag, group, index, targetItem) {
  if (!drag) return null;
  if (drag.kind === "inventory" && drag.item.group === group && !targetItem) return previewEquipment(campaign, drag.item, group, index);
  if (drag.kind === "slot" && drag.group === group && drag.index !== index) {
    const projected = structuredClone(campaign); const slots = projected.player.equipment[group];
    [slots[drag.index], slots[index]] = [slots[index], slots[drag.index]];
    return effectiveAttributes(projected);
  }
  return null;
}

export function resolveInventoryDrop(drag, destination, targetItem = null) {
  if (!drag || !destination) return null;
  if (destination.kind === "slot") {
    const { group, index } = destination;
    if (drag.kind === "inventory" && drag.item.group === group && !targetItem) return { type: "equip", itemId: drag.item.id, group, index };
    if (drag.kind === "slot" && drag.group === group && drag.index !== index) return { type: "reorder-equipment", group, index: drag.index, other: index };
    return null;
  }
  if (destination.kind === "inventory" && drag.kind === "slot") return { type: "unequip", group: drag.group, index: drag.index };
  return null;
}

export function describeInventoryDrop(campaign, drag, destination, targetItem = null) {
  const action = resolveInventoryDrop(drag, destination, targetItem);
  if (!action) return null;
  if (destination.kind === "inventory") {
    if (campaign.player.inventory.length >= campaign.player.inventoryCapacity) return null;
    return { action, destination, preview: previewEquipment(campaign, drag.item, drag.group, drag.index, "unequip") };
  }
  return { action, destination, preview: previewInventoryDrop(campaign, drag, destination.group, destination.index, targetItem) };
}
