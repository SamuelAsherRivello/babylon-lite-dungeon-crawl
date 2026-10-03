# Tasks

## 1. Cardinal pathfinding foundation

- [ ] 1.1 Add `@esengine/pathfinding` to the runtime dependencies and lockfile, preserving its source attribution in the local adapter; verify a clean dependency install resolves it.
- [ ] 1.2 Add a focused game-layer cardinal A* adapter for `floor.map` and entity occupancy; verify unit tests cover a deterministic route around walls, a null result for a sealed target, blocked intermediate entities, and an allowed selected interaction endpoint.

## 2. Mouse navigation and reticle integration

- [ ] 2.1 Replace dominant-axis mouse selection with the A* path's next cardinal step while retaining the existing held-input and one-action dungeon dispatch; verify focused tests show a route detours around terrain, advances only one cell at a time, and leaves keyboard/mobile direction handling unchanged.
- [ ] 2.2 Pass derived route availability from the game controller to the world reticle without moving pathfinding into the renderer; verify focused UI/content tests cover a black reticle and no dispatched movement, turn, or enemy phase for an unreachable selected cell, plus preserved endpoint bump/enter interactions.

## 3. Integration verification

- [ ] 3.1 Run `npm test` and `npm run build`; verify the full game suite and production build succeed with the A* dependency included.
