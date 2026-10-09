# Design

## Context

See [proposal.md](proposal.md). Floors are currently a binary `map` built by carving a central 7-by-7 room and connecting later rooms with corridors. The renderer assigns one terrain frame to each cell and the failed experiment overwrote the nearest blocked cells with a 3-by-3 obstacle motif. `wall_combinations01.tmx`, `wall_combinations02.tmx`, and `dungeon_example.tmx` demonstrate that the supplied art uses distinct roles, not a universal blob table.

## Goals / Non-Goals

**Goals:**

- Preserve the binary world as the sole gameplay authority.
- Produce a deterministic presentation plan for the generated start room, including doors where a corridor leaves it.
- Isolate art-role selection from Babylon Lite sprite lifecycle code so it is unit-testable.

**Non-Goals:**

- Retiling the entire procedural dungeon, adding new art, changing procedural connectivity, or changing camera/minimap/gameplay rules.
- Persisting decorative sprites or frames in saves.

## Decisions

### Retain start-room bounds as floor metadata

Floor generation will retain the central room's rectangle as `startRoom` metadata. A save normalizer will supply the known central rectangle when valid older floors lack it, without changing their map or entities. This avoids flood-filling from the player start, which would incorrectly include corridors and connected rooms.

**Alternative considered:** Infer the room from current walkable cells. Rejected because corridors make connected walkable space ambiguous.

### Plan decoration from the room ring, not nearest blocked-cell distance

A pure decoration planner will inspect the one-cell ring outside `startRoom`. It will emit a decoration only for blocked ring cells and select a frame from a verified Tiled role table according to side, corner, and adjacent doorway geometry. Corridor openings receive no blocking perimeter art. The planner will never fill farther solid terrain simply to meet a tile count.

**Alternative considered:** Continue selecting the closest 50 walls. Rejected because distance does not encode wall orientation or whether a cell faces the room.

### Keep base terrain and decoration separate

`WorldRender` will expose binary terrain unchanged plus a main-view decoration collection. Babylon Lite will render decorative wall faces in their own ordered layer over the normal terrain tiles. It will not create a floor tile underneath every blocked cell, and the minimap will omit decoration because it already represents binary geometry.

**Alternative considered:** Replace every blocked cell's base frame. Rejected because the supplied opaque obstacle art has roles that do not represent a room perimeter and would alter the established general wall treatment.

### Use a small, explicit verified frame table

The implementation will verify frame IDs against the supplied Tiled maps and encode only the frames needed for top/bottom/left/right faces, outer corners, and doorway ends. If a required role is not present in the reference, it will use the existing base terrain rather than guessing with an obstacle-center frame.

**Alternative considered:** Derive frames from four-neighbor bit masks. Rejected because the sheet's frame semantics include authored visual depth and cannot be inferred safely from collision adjacency alone.

### Cache by immutable floor geometry

The presenter will cache the decoration plan by the current floor map and `startRoom` bounds. The plan is recomputed only when a newly generated or restored floor changes, not on every animation draw.

## Risks / Trade-offs

- [A corridor cuts a start-room wall] → Treat that ring position as a doorway and assert the planner emits no blocking face there.
- [Old saves omit start-room metadata] → Normalize only the metadata from the existing central start position; do not regenerate maps or relocate entities.
- [A frame is misread from the atlas] → Cross-check the fixed role table in Tiled and cover each role with pure tests before browser validation.
- [The viewport masks a visual seam] → Use one focused Chrome/Playwright check at the fixed seed and manually compare it to the Tiled references; finalization retains the full applicable suite.

## Migration Plan

1. Remove the experimental nearest-50 override and its all-blocked-floor underlay behavior.
2. Introduce and normalize `startRoom` metadata, then implement the pure planner and renderer decoration layer.
3. Validate deterministic geometry and role selection with Node tests, then run the focused seeded browser check.
4. If regressions occur, remove only the decoration layer and planner; the unchanged binary terrain renderer remains the rollback path.
