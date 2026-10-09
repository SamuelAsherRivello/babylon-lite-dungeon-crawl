# Spec Delta

## MODIFIED Requirements

### Requirement: Keep world views geometrically consistent
The game view and minimap SHALL derive terrain, walls, object coordinates, and actor coordinates from the same active realm. The game view SHALL render presentation-only room decoration at those same coordinates without altering traversal or placement. The minimap SHALL provide a simplified low-resolution representation of the realm rather than unrelated artwork.

#### Scenario: Show the same player and exit
- **WHEN** both views render the active realm
- **THEN** walls, player, and exit occupy matching map coordinates despite different scale and detail
- **AND** start-room decoration does not change the minimap's map geometry

#### Scenario: Descend to another realm
- **WHEN** the player completes a dungeon
- **THEN** both views update to the newly generated realm with no stale terrain or actors
- **AND** the game view uses the new realm's decoration plan
