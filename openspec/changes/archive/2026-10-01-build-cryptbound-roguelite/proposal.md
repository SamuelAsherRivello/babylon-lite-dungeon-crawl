# Proposal

## Why

The template repository is a starter shell rather than a playable game. Cryptbound will turn it into a crisp, turn-based medieval dungeon roguelite where each movement matters, death feeds long-term growth, and three local save slots let players maintain separate campaigns.

## What Changes

- Add an endlessly descendable, procedurally generated dungeon with one-grid-step turns, tactical enemies, bump combat, loot, chests, and stairs.
- Add persistent six-stat progression, level-up choices, five equipment slots, and fresh runs after death.
- Add exactly three independent local save slots that autosave and resume complete active runs.
- Replace template presentation with a landscape, 8-way keyboard/mobile game using Tiled pixel art, pixel-perfect rendering, and three render-scale zoom settings.

## Capabilities

### New Capabilities
- `dungeon-turns`: Procedural floor exploration, turn advancement, enemy actions, combat, interactions, and descent.
- `character-progression`: Persistent stats and XP, level choices, equipment, loot, death, and new runs.
- `campaign-saves`: Three local save slots, autosave, and resume.
- `pixel-game-presentation`: Landscape pixel-perfect rendering, movement controls, mobile controller, HUD, and zoom.

### Modified Capabilities

None.

## Impact

The React/Vite game shell and Babylon Lite scene in the generated app folder will be replaced with Cryptbound's game UI and rendering integration. New game rules and procedural generation will live in reusable modules, with save data persisted in browser localStorage. Tiled-compatible artwork will be copied from the supplied Dungeons-and-Pixels-v1.4 folder with provenance recorded. Existing template release, version, and deployment conventions remain in effect.
