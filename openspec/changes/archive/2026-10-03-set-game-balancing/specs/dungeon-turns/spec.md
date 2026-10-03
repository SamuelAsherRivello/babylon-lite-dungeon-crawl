# Spec Delta

## MODIFIED Requirements

### Requirement: Resolve tactical enemy actions
Living enemies SHALL have an individual awareness radius and action cooldown. An enemy within its effective awareness range SHALL take at most one action, moving one cell or attacking, only when its cooldown permits after an accepted player turn.

#### Scenario: Enemy waits for its cooldown
- **WHEN** an aware enemy's action cooldown is not due after an accepted player turn
- **THEN** that enemy neither moves nor attacks during the turn

#### Scenario: Eligible enemy approaches
- **WHEN** an enemy is aware and its action cooldown is due after an accepted player turn
- **THEN** it moves one cell toward the player or performs one attack when adjacent

#### Scenario: Enemy approaches
- **WHEN** an enemy can reach or attack the player during its action
- **THEN** it moves or attacks once according to its behavior

### Requirement: Interact through adjacent tiles
Bumping into an enemy, pickup, chest, or stair SHALL invoke that target's interaction; stepping onto ground loot or stairs SHALL also resolve their tile interaction. Collecting an item or potion as part of an accepted move SHALL add no turn beyond that move's one turn.

#### Scenario: Open a chest
- **WHEN** the player bumps an unopened adjacent chest
- **THEN** the chest opens and resolves its loot as one interaction turn

#### Scenario: Collect a discovery
- **WHEN** the player collects a valid discovery
- **THEN** the discovery is recorded and grants its specified experience once

#### Scenario: Collect while moving
- **WHEN** the player steps onto a collectible item or potion
- **THEN** the collection resolves during the accepted movement action and displayed time increases by exactly one

## ADDED Requirements

### Requirement: Advance time for committed loadout changes
A committed ability-binding or equipment-slot assignment, removal, reorder, or swap SHALL advance exactly one tactical turn. A rejected, cancelled, or unchanged loadout operation SHALL NOT advance time.

#### Scenario: Commit an equipment change
- **WHEN** the player commits a valid equipment-slot change
- **THEN** the loadout changes and displayed time increases by one

#### Scenario: Cancel a loadout change
- **WHEN** the player cancels or attempts an invalid loadout operation
- **THEN** the loadout and displayed time remain unchanged
