# Design

## Context

See `proposal.md` for motivation. The domain generator currently fixes floors at 40 by 20 cells and makes the first randomly positioned room the start. `BabylonWorld` owns a persistent camera-center reference, but its draw closure reads the mount-time camera prop instead of current render state. The renderer, pointer projection, floating text, and minimap all consume the same camera helpers.

## Goals / Non-Goals

**Goals:**

- Give every newly generated floor a 100 by 100 playable grid and a deterministic center-cell spawn.
- Preserve valid active campaigns while expanding undersized saved floors.
- Apply the selected camera policy from current React state and constrain it to a map that covers the view.
- Keep map-to-screen projection, reticle placement, and minimap geometry consistent with the rendered camera.

**Non-Goals:**

- Dynamically size dungeons from browser dimensions, add an infinite world, alter enemy balance, or add a renderer fallback.
- Change camera controls, zoom presets, stored preference keys, or minimap interaction behavior.

## Decisions

### Generate a fixed 100 by 100 center-origin floor

The domain layer will expose shared floor dimensions and a canonical center cell at `(50, 50)`. Generation will carve a central starting room around that point, connect the remaining procedurally placed rooms to it, and place the player start there. A fixed square retains seeded reproducibility and save portability; viewport-dependent generation would make a campaign depend on the device that created it.

### Expand legacy floors by embedding, not regenerating

Migration will recognize floors smaller than the canonical dimensions, create a wall-filled 100 by 100 map, and copy old terrain into its centered offset. It will shift `floor.start`, every entity coordinate, and the campaign player coordinate by that same offset, then set floor dimensions. This preserves active layout and relative positions. Regenerating a floor would discard a player's active world state, while leaving it unchanged would retain the Native-scale presentation defect.

### Separate desired framing from bounded presentation

Camera policy will first compute the desired Center, Deadzone, or Screen center in tile space, then clamp it against the active map and visible span when the map covers that span. The clamp bounds are the half-visible extents, so the renderer never requests map coordinates past the left, right, top, or bottom limits. If a viewport is larger than a map at a low world zoom, clamping cannot fill the entire surface; the 100-cell map specifically addresses Native-scale presentation rather than promising an unbounded backdrop.

### Make current camera state explicit at every render boundary

`BabylonWorld` will obtain the current camera mode from its latest state record rather than the mount-time effect closure. A camera-state reset token derived from viewport dimensions, device pixel ratio, zoom, mode, and floor identity will reset the stored center before framing. Center and Deadzone reset to the player; Screen calculates the page containing the player. Resize observers will resize the surface before reprojecting the camera so backing dimensions and CSS-space projection agree.

### Keep all projections on one clamped center

The main world renderer, pointer-to-cell conversion, held reticle, and floating feedback will use the same current bounded center and CSS tile size. The minimap continues to calculate its own full-map center and fit scale, independent of game camera resets.

## Risks / Trade-offs

- [Large 100 by 100 terrain creates more sprites] → Reuse existing fixed sprite layers and verify setup/update performance with the focused content tests.
- [A low zoom can display more than 100 cells] → Clamp only when the map covers the visible span; document this intentional limit and keep the Native-scale acceptance target.
- [Coordinate migration can omit a world position] → Centralize expansion and cover player, start, entities, terrain dimensions, repeat loads, and save persistence in tests.
- [Camera reset can desynchronize overlay projection] → Route rendering and overlays through the same camera-center helper and add focused policy/reconfiguration tests.

## Migration Plan

1. On loading a valid campaign, normalize an undersized active floor before it reaches game or renderer consumers.
2. Write the normalized campaign through the existing safe slot path, retaining the original legacy record according to the established migration behavior.
3. Existing 100 by 100 campaigns remain unchanged; rollback is possible from the retained pre-migration slot record where applicable.
