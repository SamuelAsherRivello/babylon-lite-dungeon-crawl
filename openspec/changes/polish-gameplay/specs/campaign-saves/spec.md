# Spec Delta

## MODIFIED Requirements

### Requirement: Autosave and resume complete runs
The selected slot SHALL autosave the complete active campaign after every accepted turn and SHALL restore the saved campaign after reload, including the current floor state, run seed, and selected difficulty. The saved run seed and difficulty SHALL take precedence over URL defaults when resuming that campaign.

#### Scenario: Resume after reload
- **WHEN** the player reloads the game and selects a populated slot
- **THEN** the same floor, player position, enemies, items, time, gear, progression, run seed, and difficulty are restored

#### Scenario: Save after a turn
- **WHEN** one accepted player turn resolves
- **THEN** the selected slot contains the resulting complete run state

#### Scenario: Resume with a different URL seed
- **WHEN** a saved campaign is resumed while the URL contains another `randomSeed`
- **THEN** the saved campaign's seed and difficulty remain active
