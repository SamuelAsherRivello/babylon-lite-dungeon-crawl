# Spec Delta

## Purpose

Defines the tactical dungeon turn loop: generated rooms, grid movement, enemies, combat, treasure, and descent through an endless medieval dungeon.

## ADDED Requirements

### Requirement: Generate traversable dungeon floors
Each run SHALL begin in a newly generated dungeon floor with a reachable exit stair, a starting weapon nearby, and floor content appropriate to the current depth.

#### Scenario: Start a run
- **WHEN** a new run begins
- **THEN** the player appears in a traversable procedural floor with empty equipment and a nearby stick

#### Scenario: Descend without an ending
- **WHEN** the player reaches and enters the floor's stair tile
- **THEN** a new procedural floor loads at the next depth with stronger or additional enemy types available

### Requirement: Advance one tactical turn per accepted grid action
A legal player step or an actionable bump interaction SHALL advance time by exactly one turn, and enemies SHALL act once during that turn. Enemies SHALL NOT act when no player turn is accepted.

#### Scenario: Walk into traversable space
- **WHEN** the player makes one accepted grid move
- **THEN** the player moves one cell and the displayed time increases by one

#### Scenario: Bump an enemy
- **WHEN** the player bumps an adjacent enemy
- **THEN** one attack action resolves and time advances once

#### Scenario: Blocked terrain
- **WHEN** the player attempts to move into an impassable cell with no actionable target
- **THEN** the player stays in place and time does not advance

### Requirement: Prevent diagonal corner cutting
Diagonal steps SHALL be accepted only when the destination and both orthogonally adjacent cells are traversable.

#### Scenario: Both sides of diagonal are open
- **WHEN** the player moves diagonally through two open orthogonal neighbors into an open destination
- **THEN** the diagonal step is accepted as one turn

#### Scenario: A diagonal is pinched by a wall
- **WHEN** either orthogonal neighbor of a diagonal step is blocked
- **THEN** the move is rejected without advancing time

### Requirement: Resolve tactical enemy actions
Living enemies SHALL take at most one action after each accepted player turn, using movement or attack behavior appropriate to their type and depth.

#### Scenario: Enemy approaches
- **WHEN** an enemy can reach or attack the player during its action
- **THEN** it moves or attacks once according to its behavior

### Requirement: Interact through adjacent tiles
Bumping into an enemy, pickup, chest, or stair SHALL invoke that target's interaction; stepping onto ground loot or stairs SHALL also resolve their tile interaction.

#### Scenario: Open a chest
- **WHEN** the player bumps an unopened adjacent chest
- **THEN** the chest opens and resolves its loot as one interaction turn

#### Scenario: Collect a discovery
- **WHEN** the player collects a valid discovery
- **THEN** the discovery is recorded and grants its specified experience once

### Requirement: Resolve dual-wield attacks together
When both arm slots contain weapons, one melee bump SHALL resolve both equipped weapon attacks as a single player turn.

#### Scenario: Attack with two weapons
- **WHEN** the player bumps an adjacent enemy while holding weapons in both arm slots
- **THEN** both weapon strikes resolve before the enemy phase, with only one time increment
