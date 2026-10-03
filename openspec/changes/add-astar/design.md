# Design

## Context

See [proposal.md](proposal.md) for motivation. The current mouse-selection helper compares the selected cell with the player position and emits only the dominant axis. `Game.jsx` feeds that direction into its held-input timer, while `dungeon.js` is the sole authority for accepted moves, bumps, time, and enemy phases. `BabylonWorld.jsx` already projects a held cell through camera movement and exposes a black `.grid_reticle.invalid` visual state.

The referenced ASCII RPG uses `@esengine/pathfinding` for its cardinal `findPath` implementation, then layers resumable searches, distance fields, and sector/realm routing on top. Cryptbound's 40-by-20 active floor needs only the cardinal route lookup for mouse navigation.

## Goals / Non-Goals

**Goals:**

- Use a deterministic cardinal A* route over the current dungeon map for mouse-selected destinations.
- Convert only the route's immediate next cell to Cryptbound's existing movement direction and continue using its established action/turn pipeline.
- Derive a reachable/unreachable selection state once per current campaign/selection state and pass it to the world view for reticle presentation.
- Preserve current interactions at an endpoint and prevent intermediate traversal through blocking entities.

**Non-Goals:**

- Port the source project's resumable search, distance fields, hierarchy, sector cache, or cross-realm routing.
- Change keyboard, mobile, enemy, save, camera, or rendering behavior.
- Queue a complete route, animate direct movement, or allow diagonal A* steps.

## Decisions

### Port a narrow, local cardinal A* adapter

Add `@esengine/pathfinding` at the compatible source version and create a small game-layer adapter that maps `floor.map` (where `0` is walkable) and active entity occupancy into the package's grid. It returns either an ordered immutable path beginning with the player cell or `null`.

The adapter will preserve the source utility's cardinal-only configuration and endpoint exception: a selected actionable endpoint may be reached, but an occupied non-endpoint cell cannot be crossed. This allows normal bump and enter actions without giving the routefinder authority to resolve them.

**Alternative considered:** Copy the entire `AStarUtility` module. Rejected because its sector, resumable, distance-field, and realm features are unused by the requested 40-by-20 mouse route and would add unrelated behavior.

### Recompute from the latest campaign before each mouse dispatch

`Game.jsx` will use the selected held cell and current campaign to obtain the path, map `path[1]` to a current cardinal move action, and clear mouse movement when the path is missing or contains no next cell. The existing effect and timer will re-evaluate after every accepted state update, so world changes cannot leave a stale route step in flight.

`dungeon.js` remains unchanged as the tactical authority: it validates the one-cell move, resolves bumps/entries, advances time, and triggers the enemy phase only for accepted actions.

**Alternative considered:** Submit a destination action and let `dungeon.js` carry out a whole route. Rejected because it would blur UI intent with simulation, risk multiple turns per click, and bypass the existing one-action event behavior.

### Give the renderer a derived route-status prop

The game controller will compute whether the selected cell has a valid path and pass that derived status to `BabylonWorld`. The renderer will use it to apply the existing `invalid` reticle class, including for unreachable walls or sealed open cells, while retaining enemy/item colors only for reachable targets. The renderer will not own tactical pathfinding or dispatch movement.

**Alternative considered:** Have `BabylonWorld` run an independent path lookup for coloring. Rejected because duplicate route policies could disagree with input and mix simulation logic into the render layer.

## Risks / Trade-offs

- [Entity position changes between route calculations] → Recalculate from the newest campaign before each dispatched mouse step and retain the dungeon resolver's validation as the final gate.
- [Continuous mouse hold dispatches an old direction] → Clear and replace the held mouse movement whenever the route has no next step, is unavailable, or the selected cell is released.
- [A non-walkable target is confused with an interaction target] → Allow only the actual selected actionable endpoint as an exception; all other non-walkable or occupied cells remain blocked.
- [New runtime dependency changes the bundle] → Limit imports to the grid and A* functions and keep the adapter scoped to game navigation.

## Migration Plan

1. Add the dependency and local adapter without changing campaign/save data.
2. Integrate route-derived mouse input and reticle state behind the existing mouse selection flow.
3. Run focused unit tests, the repository test command, and a production build.
4. Roll back by removing the adapter/dependency integration; saved campaigns remain compatible because no persisted schema changes.
