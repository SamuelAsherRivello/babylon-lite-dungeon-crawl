# Proposal

## Why

The 40 by 20 dungeon is smaller than the Native-scale game pane on common landscape displays, exposing the renderer clear color. Camera selection also remains stuck on the mode present when the Babylon renderer mounts, so choosing Center, Deadzone, or Screen does not reliably alter framing.

## What Changes

- Generate 100 by 100 tile dungeon floors with a traversable player start at the geographic center and preserve a nearby starting weapon and reachable stairs.
- **BREAKING:** Migrate an active legacy 40 by 20 saved floor into a centered 100 by 100 floor, offsetting the player and every world entity so the active run remains playable without retaining the undersized level bounds.
- Add map-bounded camera framing for Center, Deadzone, and Screen: whenever the map is larger than the visible world span, a camera never renders beyond the level, and the player may be off-center near a map edge when that is necessary to keep the view tiled.
- Make camera selection live. Reapply the selected camera policy whenever the game pane, layout, browser zoom/DPR, world zoom, or camera mode changes; Center and Deadzone initialize around the player while Screen resolves the page containing the player.
- Keep the existing three selectable camera modes and their persisted preference. The minimap remains independent of the game camera.

## Capabilities

### New Capabilities

- `world-map-rendering`: Bounded game-camera framing and resilient camera reapplication for the active dungeon view.

### Modified Capabilities

- `dungeon-turns`: Generated floors and their initial spawn now use a centered 100 by 100 world layout.
- `campaign-saves`: Existing saved active floors are safely expanded and coordinate-shifted to the new world layout.

## Impact

The change affects procedural generation and campaign migration in `cryptbound/src/game/`, shared camera math and Babylon Lite rendering in `cryptbound/src/content/`, focused game/content tests, and the world-rendering documentation. It adds no dependencies, rendering fallback, or new player-facing camera controls.
