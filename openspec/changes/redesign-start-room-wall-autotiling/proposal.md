# Proposal

## Why

The first local wall-autotiling experiment applied Tiled obstacle motifs to arbitrary blocked cells around the player start. It produced opaque black bands and did not make the generated start chamber read as a believable room. Cryptbound needs a presentation model that understands room boundaries instead of treating every binary wall cell as interchangeable.

## What Changes

- Replace the experimental “nearest 50 wall cells” frame override with a deterministic start-room decoration plan based on an explicit walkable room boundary.
- Map only verified Tiled wall-face, edge, and corner frames to the geometric roles they were authored for; do not use opaque obstacle-void frames as perimeter fallbacks.
- Keep collision, pathfinding, save data, seed behavior, entities, and minimap geometry driven by the existing binary dungeon map.
- Render the resulting decoration as presentation-only layers shared by the main world view; retain pixel-perfect 32-by-32 rendering and WebGPU-only support.
- Add deterministic tests for the start-room perimeter and frame roles, plus a focused browser check of Saved Game 2 with `?mute=1&randomSeed=1` during implementation.

## Capabilities

### New Capabilities

- `dungeon-tile-decoration`: Deterministic, room-aware Tiled decoration that makes blocked tiles around the start room read as a coherent dungeon boundary without changing simulation geometry.

### Modified Capabilities

- `world-map-rendering`: The shared world render model will include presentation-only room decoration while preserving matching gameplay and minimap coordinates.

## Impact

- Affected source: procedural floor generation metadata, world-render model, Babylon Lite tile layers, and focused game/content tests.
- Affected assets: existing `Tiled_Examples/wall_combinations01.tmx`, `wall_combinations02.tmx`, `dungeon_example.tmx`, and `Tileset_Dungeon.png`; no new art dependency.
- Existing experimental local autotile overrides and their documentation/tests will be removed or replaced as part of the implementation.
- Playwright is useful for confirming browser-visible output but is not run during this proposal; implementation will use one focused live-browser check and finalization will run the applicable suite.
