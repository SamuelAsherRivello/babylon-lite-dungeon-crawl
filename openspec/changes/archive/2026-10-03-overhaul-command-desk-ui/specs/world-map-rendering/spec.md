## Purpose

Render the game view and minimap from the same world geometry with selectable camera behavior and independent presentation arguments.

## ADDED Requirements

### Requirement: Keep world views geometrically consistent
The game view and minimap SHALL derive terrain, walls, object coordinates, and actor coordinates from the same active realm. They SHALL use identical traversal and placement rules with arguments controlling view bounds, scale, detail, layers, and markers. The minimap SHALL provide a simplified low-resolution representation of the realm rather than unrelated artwork.

#### Scenario: Show the same player and exit
- **WHEN** both views render the active realm
- **THEN** walls, player, and exit occupy matching map coordinates despite different scale and detail

#### Scenario: Descend to another realm
- **WHEN** the player completes a dungeon
- **THEN** both views update to the newly generated realm with no stale terrain or actors

### Requirement: Center camera follows every move
Center mode SHALL keep the player's sprite center at the game view's center, moving the displayed world as the player moves. Center SHALL be the default camera mode without a saved preference.

#### Scenario: Move while Center is selected
- **WHEN** the player moves one row or column
- **THEN** the player remains centered and the world shifts by that step

### Requirement: Deadzone camera permits local movement
Deadzone mode SHALL allow the player to move freely within a centered rectangle covering 30% of the visible game-view width and 30% of its height without moving the world. When the player crosses that boundary, the camera SHALL scroll enough to keep the player within the deadzone. The rectangle SHALL be recalculated from the visible world span when Zoom or viewport size changes.

#### Scenario: Move inside deadzone
- **WHEN** the player moves without crossing a deadzone boundary
- **THEN** the camera remains stationary

#### Scenario: Cross deadzone boundary
- **WHEN** a move takes the player beyond the centered rectangle
- **THEN** the world shifts just enough to bring the player back to the centered 30%-by-30% deadzone

#### Scenario: Resize or zoom in Deadzone mode
- **WHEN** visible world width or height changes while Deadzone is selected
- **THEN** the centered deadzone adjusts to 30% of the new visible width and height without changing the player's world coordinates

### Requirement: Screen camera advances by view pages
Screen mode SHALL keep the current view stationary until the player exits an edge, then display the adjoining full screen so the player enters its opposite edge. Paging SHALL change presentation without teleporting, wrapping, or duplicating the player's world position.

#### Scenario: Exit right or left
- **WHEN** the player exits the right or left edge
- **THEN** the adjoining screen appears and the player enters at its left or right edge respectively

#### Scenario: Exit top or bottom
- **WHEN** the player exits the top or bottom edge
- **THEN** the adjoining screen appears and the player enters at its bottom or top edge respectively

### Requirement: Minimap framing is independent of game camera
The minimap SHALL fit the active realm at low resolution with a player marker. Changing game Zoom or Camera SHALL not change the map geometry or the minimap's full-realm framing.

#### Scenario: Change game zoom
- **WHEN** the player changes game Zoom from 1 to 2
- **THEN** the game shows fewer cells while the minimap continues to fit the same entire realm

### Requirement: Restrict mouse interaction to the game view
Only the main game view SHALL handle mouse selection, reticle rendering, movement input, and mouse-wheel Zoom. The minimap SHALL remain a passive renderer with mouse interaction disabled.

#### Scenario: Move the pointer over the minimap
- **WHEN** the pointer moves or clicks over the minimap
- **THEN** no game reticle or movement input appears or is triggered

### Requirement: Retain a selected world cell while the mouse is held
When a mouse button is pressed over the game view, the selected grid cell SHALL remain the same world coordinate until release. The renderer SHALL reproject that cell through the active camera and Zoom so the reticle stays on it while the player or camera moves. Pointer movement during the hold SHALL NOT select a different cell. After release, normal hover selection SHALL resume.

#### Scenario: Hold selection while the camera moves
- **WHEN** the player holds the mouse over a selected cell while movement shifts the view
- **THEN** the reticle follows the same world cell as its screen position changes

#### Scenario: Hold selection in each camera mode
- **WHEN** the mouse is held while Center, Deadzone, or Screen camera framing changes
- **THEN** the reticle remains aligned to the selected world cell in every mode

#### Scenario: Release held selection
- **WHEN** the mouse button is released
- **THEN** the held world-cell selection ends and later pointer movement selects by its current grid position
