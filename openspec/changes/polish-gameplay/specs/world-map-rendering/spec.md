# Spec Delta

## Purpose

Keep the rendered dungeon, camera, visible exit, and pointer targeting aligned with the active generated realm and the player's selected view mode.

## ADDED Requirements

### Requirement: Render a distinct exit in every realm
Every generated realm SHALL contain a visible exit tile at a reachable location. Entering that tile SHALL advance to the next realm; defeating enemies or performing other actions SHALL NOT advance realms.

#### Scenario: Defeat an enemy
- **WHEN** the player defeats an enemy before reaching the exit
- **THEN** the current realm and its generated map remain active

#### Scenario: Enter the exit
- **WHEN** the player enters the realm's exit tile
- **THEN** the next realm loads and the player's realm/depth advances once

### Requirement: Center camera follows the player
Center mode SHALL keep the player's sprite centered in the game view while the world scrolls as the player moves.

#### Scenario: Move in Center mode
- **WHEN** the player moves one cell with Center selected
- **THEN** the player remains centered and the visible world shifts by one cell

### Requirement: Deadzone camera keeps the player within a local region
Deadzone mode SHALL keep the world stationary while the player moves within a configured region around the view center, and SHALL move the camera when the player crosses that region.

#### Scenario: Move inside the deadzone
- **WHEN** the player moves without crossing a deadzone boundary
- **THEN** the camera remains stationary

#### Scenario: Cross the deadzone boundary
- **WHEN** the player moves beyond a deadzone boundary
- **THEN** the camera moves enough to bring the player back within it

### Requirement: Screen camera pages the world
Screen mode SHALL keep the current page stationary until the player crosses a view edge, then show the adjoining page without changing the player's world coordinates.

#### Scenario: Cross a page edge
- **WHEN** the player exits one edge of the current view
- **THEN** the adjoining page appears with the same player world position visible at the corresponding edge

### Requirement: Select pointer targets from grid centers
The reticle SHALL snap to the nearest visible grid-cell center using the same camera and zoom transform as the rendered world. Mouse movement SHALL update the reticle, and movement input SHALL use the reticle's grid position rather than independently converting raw mouse coordinates.

#### Scenario: Pointer moves around a cell midpoint
- **WHEN** the pointer crosses the midpoint between neighboring grid-cell centers
- **THEN** the reticle selects the nearest center and moves to that cell without a half-cell offset

#### Scenario: Move using the reticle target
- **WHEN** the player begins or continues mouse movement toward a reticle target
- **THEN** the input position is derived from that reticle target and remains aligned to the selected grid cell

### Requirement: Keep minimap framing independent
The minimap SHALL represent the same active realm, player, and exit as the game view while fitting the full realm independently of game Zoom and Camera settings.

#### Scenario: Change game view settings
- **WHEN** Zoom or Camera changes
- **THEN** the minimap continues to show the same full realm and current player and exit positions
