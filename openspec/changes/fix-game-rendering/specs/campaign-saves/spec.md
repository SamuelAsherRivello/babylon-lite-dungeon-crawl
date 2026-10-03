# Spec Delta

## ADDED Requirements

### Requirement: Expand undersized saved floors safely
When an otherwise valid saved campaign contains a generated floor smaller than 100 by 100 tiles, the game SHALL expand it into a centered 100 by 100 tile floor before play resumes. The migration SHALL preserve the active floor's terrain, player, entities, time, and progression by applying the same coordinate offset to every retained world position.

#### Scenario: Resume a legacy 40 by 20 floor
- **WHEN** the player loads a valid campaign whose active floor is 40 by 20 tiles
- **THEN** the game resumes it on a 100 by 100 tile floor with the original terrain, player, and entities centered together
- **AND** their relative positions, time, and progression are unchanged

#### Scenario: Resume an already expanded floor
- **WHEN** the player loads a valid campaign whose active floor is already 100 by 100 tiles
- **THEN** the game preserves its map dimensions and world coordinates without applying another offset
