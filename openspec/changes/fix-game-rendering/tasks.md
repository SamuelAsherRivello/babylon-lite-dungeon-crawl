# Tasks

## 1. Centered 100 by 100 campaign floors

- [ ] 1.1 Refactor procedural floor generation to use a 100 by 100 grid, carve a traversable central start room, connect generated rooms, and retain reachable stairs and nearby starting loot; verify focused game tests assert dimensions, center spawn, connectivity, and descent generation.
- [ ] 1.2 Add an idempotent undersized-floor migration that centers copied terrain and uniformly offsets floor start, player, and entities; verify save/game tests cover 40 by 20 expansion, relative-coordinate preservation, repeated loads, and unmodified 100 by 100 campaigns.
- [ ] 1.3 Update campaign-save and world-rendering documentation with the centered-floor and legacy-expansion behavior; verify the documentation matches the migration fixtures and public zoom terminology.

## 2. Bounded live camera framing

- [ ] 2.1 Extend renderer-neutral camera helpers to calculate desired Center, Deadzone, and Screen centers and clamp them to a map that covers the visible span; verify focused game tests cover each mode, every map edge, resize/zoom spans, and no player-coordinate mutation.
- [ ] 2.2 Refactor the Babylon world owner to read the current camera mode during drawing, reset framing after viewport/layout/DPR/world-zoom/mode/floor changes, and share its bounded center with pointer, reticle, and floating-text projection; verify focused content/game tests cover immediate mode changes, reconfiguration, and minimap independence.
- [ ] 2.3 Update the world-rendering guide to describe bounded framing, reapplication triggers, and the low-zoom smaller-map limit; verify documented behavior matches helper tests.

## 3. Integration verification

- [ ] 3.1 Run the complete test suite and production build; verify all focused camera, migration, content, and page tests pass with the 100 by 100 world.
