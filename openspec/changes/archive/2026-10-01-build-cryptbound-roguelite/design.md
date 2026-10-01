# Design

## Context

See proposal.md for motivation and the four capability specs for player-facing behavior. The generated repository currently contains a React 19/Vite 8 shell, a Babylon Lite 1.32 pixel-perfect sprite showcase, and a render-resolution module. The existing 2D logical canvas is 320 by 180, assets use 32-pixel tiles, and Babylon Lite requires WebGPU. The starter UI currently persists orientation and other template settings and must be adapted to fixed landscape.

## Goals / Non-Goals

**Goals:** Make the game deterministic and resumable per turn; keep simulation independent of rendering; reuse the template lifecycle and render-target scaling; expose supplied art as Tiled-compatible data.

**Non-Goals:** Networking, multiplayer, a 3D scene, a final boss, a full authoring editor, or alternate orientation.

## Decisions

- **Separate simulation from UI and drawing.** Put procedural generation, turn resolution, actor/item data, equipment, combat, progression, and state transitions in plain JavaScript modules under the renamed app's game area. React owns menus, HUD, choices, and input. Babylon Lite owns texture loading, tile/sprite drawing, camera framing, and canvas lifecycle. The alternative—turn logic inside React effects or sprite callbacks—would make autosave and deterministic floor resumption fragile.
- **Use a serializable campaign snapshot as the save boundary.** Store a versioned envelope for each of three slot keys. A snapshot contains the campaign's persistent progression and the complete active floor state (seed/map, entities, player position, time, drops, chests, and equipment). Use a seeded PRNG state to support deterministic continuation. Validate version and shape on load; retain in-memory play with a clear error if storage fails. Avoid one global key so a slot write cannot overwrite another campaign.
- **Build grid movement around one turn resolver.** Normalize WASD, arrows, diagonal combinations, and touch-pad presses into one direction request. A central resolver validates destination/corners, resolves movement or bump, then runs a single enemy phase and produces the next state. Rejected wall/corner moves do not consume a turn. Brace uses the same turn pipeline.
- **Generate connected tile maps from a floor seed.** Use room-and-corridor generation, place the start, exit, nearby stick, enemies, chests, and discoveries only on reachable cells, and serialize its seed/results. Adapt the supplied Tiled tileset artwork into a data-driven terrain atlas; use neighbor masks for wall blobs with frame mapping derived from the supplied sheet. Do not copy unrelated game assets or code. Keep per-tile collision decisions in Tiled metadata where applicable.
- **Render through the existing Pixel Perfect Babylon Lite path.** Rename `project-name/` to `cryptbound/`, set logical rendering to the verified 320x180 template baseline, retain 32x32 source tiles, and compose the visible room/grid at source-pixel dimensions. Preserve nearest sampling and the render-target presenter. Offer only Half, Native, and Double settings; Native is default and means scale 1.0 of the logical pixel buffer. Keep the template's four UI corner roles and WebGPU unsupported message, replacing showcase UI with game-specific content.
- **Treat death and level-up as explicit state transitions.** Persistent stats/XP/level live outside run-only floor/gear state. An XP threshold enters a level-choice state with three options; selecting one returns to play. Death discards run state and creates a fresh seed while preserving progression. Recovery is applied on descent; Luck affects documented loot/critical rolls; Stamina funds Brace.
- **Use original Tiled-format project assets copied from the supplied pack.** Preserve source images, add external `.tsj` declarations with validated 32x32 grid metadata, and author `.tmj` sample/test map palette references as needed by the game. Record the supplied pack path and attribution/license findings in project documentation; do not claim permissions not established by the source package.

## Risks / Trade-offs

- [Sprite-sheet frame meanings or license are unclear] → Inspect sheets and any included license/readme before selecting/copying; record provenance and only use unambiguous frames.
- [A full-width 320x180 display contains few 32x32 tiles] → Keep the playfield at native pixel size and use the landscape 16:9 viewport; fit HUD panels around it instead of resampling tile art.
- [Browser storage may be unavailable or corrupted] → Validate loads, report storage errors, and keep the active session playable.
- [Large maps/entities can make local saves bulky] → Save compact tile/entity records and only write once per resolved turn.

## Migration Plan

Rename the template app directory and Vite root, replace showcase content and orientation controls, copy verified assets, then implement campaign/game modules and HUD. No previous player save migration is needed in the new project. Rollback is a normal source-control revert; deployed saves remain browser-local.
