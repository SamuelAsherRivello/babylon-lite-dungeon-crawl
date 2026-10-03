# Spec Delta

## MODIFIED Requirements

### Requirement: Generate traversable dungeon floors
Each run SHALL begin in a newly generated 64-by-48-tile dungeon floor with a reachable, visible exit tile, a starting weapon nearby, and floor content appropriate to the current depth. The player SHALL begin at cell (32,24), and the 1x game view SHALL remain covered by world tiles at common landscape and portrait display sizes.

#### Scenario: Start a run
- **WHEN** a new run begins
- **THEN** the player appears at the center of a traversable procedural floor with empty equipment and a nearby weapon

#### Scenario: Descend without an ending
- **WHEN** the player enters the visible exit tile
- **THEN** a new procedural floor loads at the next depth with stronger or additional enemy types available

#### Scenario: Defeat an enemy before reaching the exit
- **WHEN** the player defeats one or more enemies before entering the exit tile
- **THEN** the current floor remains active and the realm does not advance

#### Scenario: Keep the view filled at 1x
- **WHEN** the game opens at 1x zoom on a 1920x1080 landscape or 1080x1920 portrait display
- **THEN** the centered starting view contains world tiles across its full visible area
