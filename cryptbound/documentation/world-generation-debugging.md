# World Generation Debugging

Map repair links use the following query parameters:

```text
?world=1&level=1&slot=1&seed=12345&mute=1&debug-fix-map-autotiled=1
```

`slot` accepts only `1`, `2`, or `3`. A valid slot skips the Saved Games menu. Missing or invalid slots use the normal menu. `seed` is an unsigned 32-bit value and is used only when the selected slot is empty. `level` selects the generated dungeon level for a new campaign. `randomSeed` remains accepted as a compatibility alias for `seed`.

When `debug-fix-map-autotiled=1` is present, the active campaign shows Map Fix controls. **Open Editable Copy** downloads a self-contained ZIP bundle. It contains a `.tmj` file with `Walkability`, `Terrain`, `Entities`, and `Markers` layers, plus temporary copies of the dungeon `.tsx` and PNG art under the relative paths expected by the map. Extract the bundle anywhere, then open `debug/fixtures/<map-name>.tmj` in Tiled; the art resolves beside it even when the download was saved in Documents.

Map properties include `world`, `level`, `seed`, `generatorVersion`, and `coordinateConvention: tile-origin`. The browser no longer needs to write into the project folder or ask for a project-specific save location.

Edit the exported map in Tiled, preserve its 100-by-100 dimensions and required layers, then load it through **Load repaired map**. The validator requires player and exit markers on walkable cells and rejects invalid files without replacing the active floor. The repaired walkability layer drives collision and pathfinding; rendering continues through the shared game/minimap world model.

Repository-hosted fixtures can also be opened directly with a base-relative `map`, for example `?world=1&level=1&slot=1&seed=17&mute=1&debug-fix-map-autotiled=1&map=debug/fixtures/floor-17.tmj`.

The map-fix flag is opt-in. Ordinary player URLs do not expose export/import controls and continue using the regular save menu and generated floors.
