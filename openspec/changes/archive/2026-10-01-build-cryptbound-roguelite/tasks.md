# Tasks

## 1. Project shell and assets

- [x] 1.1 Rename `project-name/` to `cryptbound/`, update Vite root/base and package/repository metadata, remove template orientation override/shortcut/settings, and retain four corner roles.
- [x] 1.2 Inspect supplied Dungeons-and-Pixels sheets, TSX/TMX and license/provenance; copy the supplied Tiled assets and sample maps with source paths intact, and document asset origins.
- [x] 1.3 Replace showcase rendering with a Babylon Lite pixel-perfect dungeon scene using 32x32 source tiles; expose Half, Native, Double render-scale selection with Native default.

## 2. Simulation and persistence

- [x] 2.1 Implement serializable campaign model, seeded procedural connected floors, wall autotiling, start/stick/stairs placement, and depth-scaled enemy placement.
- [x] 2.2 Implement eight-way movement validation, corner blocking, single-turn interaction/combat/enemy phase, enemy behaviors, chests, discoveries, stairs, and time counter.
- [x] 2.3 Implement six persistent stats, XP/three-choice level-up, equipment/loot/swap behavior, dual-arm combat, Brace, descent healing, and death-to-fresh-run transition.
- [x] 2.4 Implement exactly three independent versioned localStorage slots with per-turn autosave, resume, validation, and storage failure handling.

## 3. Player interface and delivery

- [x] 3.1 Implement title/slot selection, readable landscape HUD, equipment and level/item choices, WASD/arrow input, and mobile eight-way virtual controller.
- [x] 3.2 Replace template placeholders in README and documentation with setup, controls, game rules, asset provenance, version/release and deployment details; configure repository About metadata/topics.
- [x] 3.3 Run applicable focused checks, existing test suite, production build, and browser verification; resolve failures and record any environment-limited verification.
