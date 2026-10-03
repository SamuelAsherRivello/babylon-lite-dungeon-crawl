# Spec Delta

## Purpose

Defines route-aware mouse navigation so dungeon destinations can be reached around obstacles without bypassing turn-based movement rules.

## ADDED Requirements

### Requirement: Route a held mouse destination through cardinal cells
When a player holds the mouse on a destination in the main game view, the game SHALL find a cardinal path from the player to that cell across the active floor and submit only the path's next cell through the ordinary movement action.

#### Scenario: Route around a wall
- **WHEN** a held destination is reachable only by turning around impassable terrain
- **THEN** the next accepted mouse movement is the first cardinal step of a route around that terrain
- **AND** the player is not relocated directly to the destination

#### Scenario: Advance along a held route
- **WHEN** the player remains holding a reachable destination after an accepted step
- **THEN** subsequent mouse movement recalculates from the player's current cell
- **AND** every accepted step remains one ordinary tactical action

### Requirement: Preserve tactical obstacles and endpoint interactions
The route SHALL not traverse impassable terrain or occupied intermediate cells. A selected actionable endpoint SHALL retain its existing bump or enter interaction when the next route step reaches that endpoint.

#### Scenario: Target an enemy behind open terrain
- **WHEN** the player holds an enemy's reachable cell
- **THEN** the route stops at that selected cell without crossing other occupied cells
- **AND** its existing bump interaction resolves when it becomes the next step

#### Scenario: Target a stair or collectible
- **WHEN** the selected reachable endpoint contains a stair, chest, potion, or item
- **THEN** the next-step movement preserves that endpoint's existing enter or interaction behavior

### Requirement: Communicate an unreachable mouse destination
The main game view SHALL display the selected destination's reticle in black and SHALL not request movement while no path exists from the player to that destination.

#### Scenario: Select a sealed destination
- **WHEN** a held destination is impassable or isolated from the player
- **THEN** its reticle is black
- **AND** the player position, time, and enemy-action state remain unchanged

#### Scenario: Route becomes unavailable
- **WHEN** a previously reachable held destination has no path after the world changes
- **THEN** the reticle changes to black before another mouse movement is requested

