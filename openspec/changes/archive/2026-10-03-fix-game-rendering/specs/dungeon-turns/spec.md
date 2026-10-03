# Spec Delta

## MODIFIED Requirements

### Requirement: Generate traversable dungeon floors
Each run SHALL begin in a newly generated 100 by 100 tile dungeon floor with a traversable player start at the floor's central tile, a reachable exit stair, a starting weapon nearby, and floor content appropriate to the current depth.

#### Scenario: Start a run
- **WHEN** a new run begins
- **THEN** the player appears at the central tile of a traversable 100 by 100 procedural floor with empty equipment and a nearby stick

#### Scenario: Descend without an ending
- **WHEN** the player reaches and enters the floor's stair tile
- **THEN** a new 100 by 100 procedural floor loads at the next depth with stronger or additional enemy types available
