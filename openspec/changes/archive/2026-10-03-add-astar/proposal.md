# Proposal

## Why

Mouse movement currently chooses only the dominant cardinal direction toward the selected grid cell. It cannot route around walls, so a player who clicks a visible reachable destination may repeatedly walk into an obstacle instead of progressing toward it.

## What Changes

- Add a focused cardinal A* pathfinding utility adapted from the linked ASCII RPG implementation, using the dungeon's `floor.map` walkability and the source project's `@esengine/pathfinding` dependency.
- Replace dominant-axis mouse movement with a route lookup from the player to the held target cell; dispatch only the first cardinal step of a successful route through the existing movement action and turn resolver.
- Treat impassable terrain and occupied non-target cells as unavailable route space, while retaining existing bump/interact behavior when the selected endpoint is an actionable target.
- Do not dispatch movement, advance time, or trigger enemy actions when no route exists to a selected destination.
- Mark a selected destination with the existing black invalid reticle whenever it has no valid route from the player's current position; preserve the current enemy and item reticle colors for reachable targets.
- Keep keyboard and mobile directional movement unchanged.

## Capabilities

### New Capabilities

- `mouse-path-navigation`: Route mouse-selected dungeon destinations through a cardinal A* path and communicate unreachable destinations with the world reticle.

### Modified Capabilities

- `dungeon-turns`: Define that a failed mouse-route selection is a rejected non-turn while a routed first step uses the ordinary single-action turn pipeline.

## Impact

- Affects `cryptbound/src/game/mouse-selection.js`, `cryptbound/src/game/Game.jsx`, `cryptbound/src/content/BabylonWorld.jsx`, and the game-focused tests.
- Adds the `@esengine/pathfinding` runtime dependency and a local A* adapter/utility based on the referenced MIT-licensed source.
- Does not alter keyboard/mobile movement controls, persistence format, Babylon Lite rendering, or the movement action API.
