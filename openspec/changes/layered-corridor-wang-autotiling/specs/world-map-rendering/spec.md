# Spec Delta

## MODIFIED Requirements

### Requirement: Keep world views geometrically consistent
The game view and minimap SHALL derive grounds, rendered walls, object coordinates, and actor coordinates from the same active realm. They SHALL use identical traversal and placement rules with arguments controlling view bounds, scale, detail, layers, and markers. The minimap SHALL provide a simplified low-resolution representation of the realm rather than unrelated artwork.

#### Scenario: Show the same player and exit
- **WHEN** both views render the active realm
- **THEN** grounds, walls, player, and exit occupy matching map coordinates despite different scale and detail

#### Scenario: Show a corridor boundary consistently
- **WHEN** a corridor floor meets nonwalkable space
- **THEN** the game view and minimap show the same wall boundary at the same world coordinates

#### Scenario: Descend to another realm
- **WHEN** the player completes a dungeon
- **THEN** both views update to the newly generated realm with no stale grounds, walls, terrain, or actors
