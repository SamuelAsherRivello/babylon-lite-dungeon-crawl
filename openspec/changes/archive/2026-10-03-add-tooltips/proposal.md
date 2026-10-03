# Proposal

## Why

Players need concise explanations for React interface controls and useful enemy details while exploring the dungeon. Two tooltip presentations can provide that information while respecting their different anchors and available screen bounds.

## What Changes

- Add a short, wide text tooltip for information triggered by React UI elements.
- Add a larger in-world enemy panel, also rendered entirely with React, with two always-visible side-by-side sections: PORTRAIT contains only the enemy sprite, and RESOURCES contains all six resource rows in the same order and visual style as the player's Resources tab.
- Give the player and every enemy an independent instance of the same six-row resources data model, following the character resource model. Each enemy tooltip reads the hovered enemy's own resource instance.
- Spawn the in-world panel when the mouse hovers an enemy grid spot. Position it from the hovered grid spot's center and extents, the player's grid spot, and the game-world frame dimensions. Keep the complete panel inside the frame and non-overlapping with either protected grid spot; hide it when no valid position exists.
- Keep UI tooltips inside the app viewport and keep their triggering mechanism independent from their React rendering.

## Capabilities

### New Capabilities
- `tooltip-presentation`: React-rendered UI and in-world tooltips with trigger-specific content and placement bounds.

### Modified Capabilities
- None.

## Impact

Likely integration points include resource and enemy state in `cryptbound/src/game/dungeon.js`, save migration in `cryptbound/src/game/saves.js`, React UI components and styles under `cryptbound/src/game/` and `cryptbound/src/ui/`, plus the React overlay and pointer/grid projection in `cryptbound/src/content/BabylonWorld.jsx`. Enemy artwork comes from the existing game asset pack. Each entity owns its own six-resource record, and the enemy panel reads that record without substituting player values. No renderer change or new dependency is proposed.
