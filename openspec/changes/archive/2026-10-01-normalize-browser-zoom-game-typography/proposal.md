# Proposal

## Why

At the browser's 100% zoom, Cryptbound's HUD typography is oversized and crowded. Browser zoom also affects the template corner labels differently from the game HUD, making the interface inconsistent.

## What Changes

- Reduce the default UI type scale and add clear spacing between HUD labels, values, controls, and equipment rows.
- Make all interface text respond consistently to browser zoom while preserving the Babylon world's independent pixel render scale.
- Keep the HUD legible and orderly as the browser viewport narrows under zoom.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `pixel-game-presentation`: Specify consistent browser zoom behavior, readable default type sizing, and spacing that prevents HUD overlap.

## Impact

- Affected files: `cryptbound/src/ui/style.css`, `cryptbound/src/game/Game.jsx`, and presentation specifications.
- No changes to game simulation, Babylon render target resolution, or user-facing Half/Native/Double world zoom.
