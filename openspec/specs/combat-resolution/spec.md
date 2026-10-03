# combat-resolution Specification

## Purpose
Defines Cryptbound's deterministic combat-resource economy so tactical fights are readable, survivable, and configurable without random damage outcomes.

## Requirements

### Requirement: Resolve combat deterministically
The game SHALL calculate melee and enemy-hit damage without hit rolls, critical hits, blocks, or random damage ranges. An enemy hit that resolves after mitigation SHALL deal at least one Health damage.

#### Scenario: Resolve an enemy hit
- **WHEN** an enemy attack resolves against a player with effective Defense
- **THEN** the game uses the attacker's deterministic combat values, reduces the result by the player's effective Defense, and applies no less than one Health damage

### Requirement: Apply Stamina to combat effectiveness
The player SHALL spend Stamina for attacks and recover Stamina from accepted ground movement, bounded by its maximum. Lower current Stamina SHALL lower effective Offense and Defense through a configurable deterministic curve.

#### Scenario: Recover Stamina while moving
- **WHEN** the player makes accepted ground moves while below maximum Stamina
- **THEN** each move restores the configured amount without exceeding the maximum

#### Scenario: Attack with depleted Stamina
- **WHEN** the player attacks after current Stamina has fallen
- **THEN** the attack spends the configured Stamina cost and uses the correspondingly lower effective Offense

### Requirement: Keep Health and Mana potion-driven
Health and Mana SHALL be restored only by their matching potions or explicit ability effects. Ordinary movement SHALL NOT restore Health or Mana, and accepted abilities SHALL spend their configured Mana cost.

#### Scenario: Walk while injured
- **WHEN** the player completes an accepted ground move with missing Health and Mana
- **THEN** Health and Mana remain unchanged while Stamina may recover

#### Scenario: Consume a Mana potion
- **WHEN** the player steps onto a Mana potion below maximum Mana
- **THEN** the potion restores the configured Mana amount without exceeding the maximum and is removed from the floor

### Requirement: Meet the floor-one encounter target
The initial character, starting weapon, and basic floor-one enemy SHALL be tuned so the basic enemy is defeated by approximately two full-Stamina player melee attacks and the player at full Health and Stamina survives approximately three successful basic-enemy attacks.

#### Scenario: Evaluate the opening encounter
- **WHEN** a new character with the nearby starting weapon fights one basic floor-one enemy without healing or equipment upgrades
- **THEN** the configured deterministic values meet the two-attack defeat and three-hit survival targets
