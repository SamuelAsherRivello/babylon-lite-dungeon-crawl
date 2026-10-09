# Spec Delta

## MODIFIED Requirements

### Requirement: Keep world views geometrically consistent
The game view and minimap SHALL derive terrain, walls, object coordinates, and actor coordinates from the same active realm. They SHALL use identical sparse Wang terrain and diagnostic-cell coordinates with arguments controlling view bounds, scale, detail, layers, and markers. The minimap SHALL provide a simplified low-resolution representation of the realm while preserving the same omitted deep blocked interiors and visible red diagnostics.

#### Scenario: Show the same player and exit
- **WHEN** both views render the active realm
- **THEN** walkable cells, Wang boundary cells, red diagnostic cells, player, and exit occupy matching map coordinates despite different scale and detail

#### Scenario: Descend to another realm
- **WHEN** the player completes a dungeon
- **THEN** both views update to the newly generated realm with no stale sparse terrain, diagnostic cells, or actors
