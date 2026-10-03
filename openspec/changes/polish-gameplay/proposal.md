# Proposal

## Why

Several gameplay and presentation controls do not yet match the intended play loop: the selected camera mode is ineffective, the reticle can select the wrong tile, death unexpectedly returns the player to a new run, and equipment feedback and menus need clearer behavior. A reproducible run seed, a visible exit on every realm, and better-fitting landscape/portrait layouts will make play and debugging predictable.

## What Changes

- Make Center, Deadzone, and Screen camera modes work at every supported Zoom. Quantize pointer coordinates to the nearest grid-cell center, display the reticle at that center, and use the reticle's grid position as the sole mouse movement target.
- Generate a fixed 64x48-tile world and place the player at its center. At 1x zoom, the 32-pixel tiles fill the game view on common 1920x1080 landscape and 1080x1920 portrait displays.
- Add a distinct, visible exit tile to every generated realm. Only entering that tile advances depth. On death, respawn at the entrance of the same generated realm, restore Health, preserve stats/progression, and lose carried and equipped items.
- Add an eight-character `randomSeed` URL argument using the readable alphabet `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`. Omit it to generate a random seed. Persist run seed and difficulty; derive later realm seeds from the run seed and depth so the same seed and difficulty reproduce the full run. Difficulty sets the baseline and challenge continues to rise with depth; Easy, Normal, and Hard are the proposed presets, with numeric tuning centralized.
- Keep Weapons and Armors groups visible with two slots each. Place a sword, shield, dagger, chest plate, shirt, and pants in generated worlds; equipment modifiers affect attributes. Show projected attribute values during drag-in and drag-out. Returning an item to its source cancels the drag without changing state or advancing time.
- Format Log entries in second person and present tense (for example, `You collect gold.`).
- Open Settings as a centered menu. Center menus over a viewport-wide dim backdrop; Escape closes menus that have a close button. Give titlebar icons a shared `title-bar-icon` class with consistent size and padding modeled on the Settings gear.
- Fit the game to the available landscape or portrait screen, selecting landscape on Windows and portrait on mobile. Add a development-only Aspect button to switch layouts for preview. Halve the current titlebar and statusbar heights while preserving current text size. Keep Slots and Inventory tall enough to show at least four rows and give each its own visible scrollbar; tighten Resource bar gaps to free vertical room.
- Make the browser tab title match the game title and replace the template favicon with a two-sword game icon (interpreting the earlier “2 scores” request as two swords).

## Capabilities

### New Capabilities
- `inventory-management`: Persistent equipment groups, world pickups, modifiers, attribute previews, and drag commit/cancellation behavior.
- `game-log`: Present-tense, second-person messages for selected game events.
- `run-seeds`: Readable run seed and difficulty inputs, deterministic realm generation, and persistence across reloads.
- `world-map-rendering`: Distinct exit presentation, working camera modes, and reticle-centered pointer targeting.

### Modified Capabilities
- `browser-template-layout`: Browser title and favicon, plus viewport behavior for the game's two platform layouts.
- `campaign-saves`: Persist and restore run seed and difficulty with each campaign.
- `character-progression`: Same-realm death respawn while retaining progression and losing run items.
- `dungeon-turns`: Centered world start, fixed world dimensions, seeded realms, distinct exits, equipment pickups, and exit-only realm advancement.
- `pixel-game-presentation`: Landscape/portrait selection and dev preview, shorter bars, titlebar icon sizing, centered menus, and readable scrolling equipment areas.
- `game-integration-guidance`: Document the game's explicit Windows-landscape/mobile-portrait behavior and developer preview so inherited single-orientation guidance does not reverse it.

## Impact

Implementation affects `cryptbound/src/game/dungeon.js`, `saves.js`, `Game.jsx`, `cryptbound/src/content/BabylonWorld.jsx`, shared UI styles/components, `cryptbound/index.html`, favicon assets, game guidance, and focused tests. Save records need a compatible migration for run seed/difficulty and changed death behavior. No new runtime dependency or renderer is required; Babylon Lite remains WebGPU-only with Pixel Perfect 32x32 tiles.

The active `overhaul-command-desk-ui` change already plans overlapping menu, camera, layout, and inventory behavior, and its death requirement conflicts with this proposal. Reconcile those unimplemented planning tasks before applying both changes so the implementation has one authoritative requirement set.
