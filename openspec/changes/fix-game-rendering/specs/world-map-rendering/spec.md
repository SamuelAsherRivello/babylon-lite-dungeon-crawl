# Spec Delta

## Purpose

Defines stable, bounded camera presentation of the active dungeon map across player movement and view reconfiguration.

## ADDED Requirements

### Requirement: Keep game cameras within map bounds
When the active dungeon map is at least as large as the visible world span on both axes, Center, Deadzone, and Screen cameras SHALL frame only cells within the active dungeon map. If centering the player would reveal space beyond a map edge, the camera SHALL clamp to the map bounds and the player MAY appear away from the viewport center.

#### Scenario: Follow the player near an edge
- **WHEN** a player moves near an outer map edge in Center mode
- **THEN** the view contains map tiles rather than renderer clear space when the map covers the visible span
- **AND** the player shifts from the viewport center only as needed to keep the view within map bounds

#### Scenario: Change camera mode near an edge
- **WHEN** a player switches among Center, Deadzone, and Screen near an outer map edge
- **THEN** the selected camera behavior is applied without displaying coordinates beyond the active map

### Requirement: Apply the selected camera mode live
The game SHALL apply the selected persisted camera mode immediately and recompute its framing whenever the game viewport, layout, browser zoom or device-pixel-ratio, world zoom, or camera mode changes. Center and Deadzone SHALL reinitialize around the player; Screen SHALL select the page containing the player.

#### Scenario: Change the selected camera
- **WHEN** the player chooses a different camera mode while playing
- **THEN** the game view uses that mode on the next render without remounting the game or changing player coordinates

#### Scenario: Reconfigure the game view
- **WHEN** the game viewport or world zoom changes
- **THEN** the current camera mode is reapplied using the new visible world span
- **AND** the player is recentered when the selected mode and map bounds permit it

### Requirement: Keep camera modes independent from the minimap
Changing a game-camera mode or its framing SHALL NOT change minimap geometry or prevent the minimap from fitting the active dungeon.

#### Scenario: Reframe the game camera
- **WHEN** the main game camera is resized or switched
- **THEN** the minimap continues to show the same full active map and player coordinate
