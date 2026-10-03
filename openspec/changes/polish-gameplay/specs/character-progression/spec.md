# Spec Delta

## MODIFIED Requirements

### Requirement: Preserve progression on death
When Health reaches zero, the player SHALL respawn at the entrance of the same generated realm with Health restored. The current realm layout and depth SHALL remain unchanged; persistent stats and progression SHALL remain, and carried Inventory and equipped items SHALL be lost.

#### Scenario: Death in a generated realm
- **WHEN** the player's Health reaches zero in a realm deeper than the first
- **THEN** the player respawns at that realm's entrance in the same generated layout, with progression retained and run items cleared

#### Scenario: Continue toward the exit after death
- **WHEN** the player respawns after death
- **THEN** the realm does not advance or regenerate until the player reaches its exit
