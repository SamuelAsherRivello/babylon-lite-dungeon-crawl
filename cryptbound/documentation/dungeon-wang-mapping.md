# Dungeon tileset Wang mapping

Author: Codex, 2026-10-08. Source art: `../public/assets/Tilesets/Tileset_Dungeon.png` (384 × 288 pixels, 12 columns × 9 rows of 32-pixel tiles). Source tileset: `../public/assets/Tiled_Examples/Tilesets/Tileset_Dungeon.tsx`. Local tile IDs below refer to that exact TSX. The wall and stone floor family occupies the first five rows; animated liquids, dirt, and props are excluded.

The `Walkable floor` region uses a **mixed** Wang set. Values are in Tiled's clockwise order `N, NE, E, SE, S, SW, W, NW`; `1` is painted floor and `0` is outside that region. The assignments follow the documented Dungeon Figure 8 limited profile and were checked against the exact source sheet. Tile 31 is an optional decorative variant of tile 1 and is excluded so the upper boundary has one predictable choice.

| Local tile ID | Wang values | Visual role |
| --- | --- | --- |
| 0 | 0,0,1,1,1,0,0,0 | Upper-left outer turn |
| 1 | 0,0,1,1,1,1,1,0 | Upper wall |
| 5 | 0,0,0,0,1,1,1,0 | Upper-right outer turn |
| 12 | 1,1,1,1,1,0,0,0 | Left wall |
| 13 | 1,1,1,1,1,1,1,1 | Stone floor |
| 17 | 1,0,0,0,1,1,1,1 | Right wall |
| 48 | 1,1,1,0,0,0,0,0 | Lower-left outer turn |
| 49 | 1,1,1,0,0,0,1,1 | Lower wall |
| 53 | 1,0,0,0,0,0,1,1 | Lower-right outer turn |
| 6 | 1,1,1,0,1,1,1,1 | One diagonal void at SE |
| 8 | 1,1,1,1,1,0,1,1 | One diagonal void at SW |
| 30 | 1,0,1,1,1,1,1,1 | One diagonal void at NE |
| 32 | 1,1,1,1,1,1,1,0 | One diagonal void at NW |

Proof result: Tiled 1.12.2 painted all 64 cells of the 8 × 8 room in `dungeon-wang-proof.tmx` using the nine outer-room roles above. `read_region` confirmed every expected local ID, and the rendered room has continuous walls and all four correct turns. Erasing and repainting its lower-right corner restored tile 53 and preserved the neighboring wall and floor tiles. A separate one-cell island probe returned `MISSING_WANG_PATTERN` for Wang ID `0` and changed no cells.

Fitness outcome: **Limited Wang-ready** for solid rectangular rooms with all four outer turns. The four diagonal-void assignments are included from the documented source profile but are not exercised by this fixture. A rectangular hole or narrow bridge requires additional masks, including `249, 243, 231, 207, 159, 63, 252, 126` (decimal, bit weights `N=1` through `NW=128`); those roles have no identified matching art in this family. Do not use this set for those footprints or claim unrestricted mixed-terrain painting.

## Runtime placement

The game applies this table to the full binary dungeon map. Each walkable cell samples `N, NE, E, SE, S, SW, W, NW` walkable neighbors. A complete mask (`255`) uses local tile `13`; a mapped boundary mask uses its listed local ID. An unmapped boundary mask receives no tile sprite and is reported as an unsupported Wang diagnostic. Blocked cells, including deep unreachable interiors, do not receive terrain sprites. The game and minimap use the same sparse coordinates. Unsupported walkable boundary cells are shown with a semi-transparent red 32-by-32 debug square in both views; this marker is intentionally always visible while the feature is being validated.
