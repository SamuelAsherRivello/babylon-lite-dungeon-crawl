# Spec Delta

## MODIFIED Requirements

### Requirement: Advance one tactical turn per accepted grid action
A legal player step or an actionable bump interaction SHALL advance time by exactly one turn, and enemies SHALL act once during that turn. A mouse-selected destination with no legal cardinal route SHALL be rejected without moving the player, advancing time, or causing an enemy action.

#### Scenario: Walk into traversable space
- **WHEN** the player makes one accepted grid move
- **THEN** the player moves one cell and the displayed time increases by one

#### Scenario: Bump an enemy
- **WHEN** the player bumps an adjacent enemy
- **THEN** one attack action resolves and time advances once

#### Scenario: Blocked terrain
- **WHEN** the player attempts to move into an impassable cell with no actionable target
- **THEN** the player stays in place and time does not advance

#### Scenario: Unreachable mouse destination
- **WHEN** the player selects a mouse destination with no legal cardinal path
- **THEN** the player stays in place and time does not advance
- **AND** enemies do not act
