# Game Layout and Pixel Art

Cryptbound uses the template's landscape 16:9 browser viewport. The viewport contains the game board, status panel, choices, and touch controller; the title, source link, settings, and version retain the template's four corner roles. Orientation switching has been removed.

World tiles and actor frames are 32 by 32 pixels. Native zoom keeps each tile at source dimensions; Half and Double use the template's render-resolution dimension calculation and preserve nearest-neighbor pixel edges. Supplied Tiled tilesets and example maps remain under `public/assets/` with their relative image paths intact.

The current turn model is in `src/game/dungeon.js`; slot persistence is in `src/game/saves.js`. Both are independent from the React display. The active view is assembled in `src/game/Game.jsx` and mounted by `src/content/Content.jsx`.
