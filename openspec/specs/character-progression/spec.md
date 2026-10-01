# character-progression Specification

## Purpose

Defines how a character grows across repeated dungeon runs and equips found gear, so defeat resets a run while preserving earned long-term progress.

## Requirements
### Requirement: Track six persistent character stats
The character SHALL have persistent Vitality, Strength, Defense, Stamina, Luck, and Recovery stats, each affecting its named combat or survival outcome.

#### Scenario: Apply stat effects
- **WHEN** the character's stats are used during play
- **THEN** Vitality sets maximum health, Strength affects melee damage, Defense reduces incoming damage, Stamina fuels Brace, Luck affects critical hits and loot, and Recovery heals on descent

### Requirement: Award experience and stat choices
Enemies and discoveries SHALL award experience. Each level gained SHALL present three stat choices and apply the selected increase immediately; excess experience SHALL carry toward the next level.

#### Scenario: Level up
- **WHEN** earned experience crosses the next level threshold
- **THEN** the player chooses one of three stat increases and remaining experience is retained

### Requirement: Equip five gear slots
The character SHALL have Head, Body, Legs, Left Arm, and Right Arm equipment slots. If a slot is empty, stepping onto compatible equipment SHALL equip it automatically; if occupied, the player SHALL be offered swap or leave choices.

#### Scenario: Auto-equip into empty slot
- **WHEN** the player steps onto a compatible gear item and its slot is empty
- **THEN** the item is equipped

#### Scenario: Decide on occupied slot
- **WHEN** the player finds an item for an occupied slot
- **THEN** the player can swap the item or leave it on the floor

### Requirement: Begin each run with empty gear
Starting a fresh run SHALL clear equipped gear while retaining the persistent character stats, level, and unspent experience.

#### Scenario: New run equipment
- **WHEN** the player starts a new run after death
- **THEN** all five equipment slots are empty and the nearby starting stick remains available to collect

### Requirement: Preserve progression on death
When health reaches zero, the active run floor and run equipment SHALL be discarded and a new procedural run SHALL begin, while persistent stats, level, and unspent experience remain.

#### Scenario: Death starts fresh floor
- **WHEN** the character dies
- **THEN** the run restarts at its initial depth with new dungeon layout and empty gear while persistent progression remains intact

### Requirement: Brace with Stamina
The player SHALL be able to use a defensive Brace action that spends Stamina and reduces incoming damage for its protected turn.

#### Scenario: Brace
- **WHEN** the player activates Brace with sufficient Stamina
- **THEN** one turn advances and incoming damage for that protected turn is reduced

#### Scenario: Insufficient Stamina
- **WHEN** the player attempts Brace without sufficient Stamina
- **THEN** Brace does not activate and no turn advances
