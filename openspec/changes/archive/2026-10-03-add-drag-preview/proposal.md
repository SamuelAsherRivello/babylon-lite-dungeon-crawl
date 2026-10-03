# Proposal

## Why

Equipment can be dragged successfully, but the interface provides no visible object under the pointer and no source or destination state. Players cannot confidently tell which item is moving, whether a target can accept it, or why projected attributes change.

## What Changes

- Render an item drag preview that follows the active pointer without intercepting drop detection.
- Mark the item source with a departure state and a valid Inventory or equipment destination with a landing state.
- Keep projected attributes in sync with valid Inventory-to-equipment and equipment-to-Inventory drags, without mutating campaign state before release.
- Clear all transient visuals and projections when a drag ends, is canceled, returns to its source, or reaches an invalid target.

## Capabilities

### New Capabilities

- `drag-and-drop-feedback`: Visible, transient feedback for item drag gestures between Inventory and equipment positions.

### Modified Capabilities

- None.

## Impact

Implementation affects the React drag state and item-row rendering in `cryptbound/src/game/Game.jsx`, pure projection/validation helpers in `cryptbound/src/game/inventory-drag.js`, drag-state styling in `cryptbound/src/ui/style.css`, and focused game/UI tests. It introduces no runtime dependency, persistence change, or renderer change.
