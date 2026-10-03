# character-progression Specification

## Purpose

Defines how a character grows across repeated dungeon runs and equips found gear, so defeat resets a run while preserving earned long-term progress.

## Requirements

### Requirement: Track six persistent character stats
The character SHALL have persistent Vitality, Strength, Luck, Recovery, and Stealth stats. Vitality increases maximum Health, Strength improves weapon offense, Luck advances deterministic loot and discovery rewards at defined thresholds, Recovery improves Stamina recovered from movement, and Stealth reduces effective enemy awareness. Defense SHALL derive primarily from equipped armor and shields, with only a small innate value.

#### Scenario: Apply stat effects
- **WHEN** the character's persistent stats are used during play
- **THEN** each stat applies its defined deterministic effect without changing the player's one-cell, one-turn movement rule

#### Scenario: Display Attributes
- **WHEN** the player equips or removes armor or a shield
- **THEN** effective Defense changes chiefly through the equipped item while retaining the character's small innate Defense

### Requirement: Award experience and stat choices
Enemies and discoveries SHALL award experience. Each level gained SHALL present three distinct choices from the five persistent stats and apply the selected increase immediately; excess experience SHALL carry toward the next level. The offered choices SHALL follow a deterministic rotation, and selecting one SHALL NOT advance a separate tactical turn.

#### Scenario: Level up
- **WHEN** earned experience crosses the next level threshold
- **THEN** the player chooses one of three distinct stat increases and remaining experience is retained

#### Scenario: Attack an enemy
- **WHEN** the player selects one offered stat increase
- **THEN** the selected persistent stat increases, its derived effect updates, and displayed time does not advance again

### Requirement: Equip five gear slots
The character SHALL have two Weapons positions and two Armor positions. Items SHALL enter Inventory before manual compatible equip. Sword and shield SHALL both be placeable in either Weapons position. Only enabled equipment SHALL modify attributes. The system SHALL not auto-equip or prompt to replace gear.

#### Scenario: Auto-equip into empty slot
- **WHEN** the player collects compatible gear while a position is empty
- **THEN** the gear enters Inventory and that position stays empty until a drag is committed

#### Scenario: Decide on occupied slot
- **WHEN** the player finds gear while matching positions are occupied
- **THEN** it enters Inventory if capacity is available, without a swap/leave prompt

### Requirement: Begin each run with empty gear
Starting a fresh run SHALL clear run Inventory and equipped gear while retaining persistent base attributes, XP count, partial XP, and ability bindings. The initial nearby stick SHALL be available to collect into Inventory before manual equipment.

#### Scenario: New run equipment
- **WHEN** a fresh run starts after death
- **THEN** Weapons and Armor positions and Inventory are empty while persistent progression remains

### Requirement: Preserve progression on death
At zero Health, the player SHALL begin a newly generated Dungeon Level 1 with run Inventory, equipment, current resources, Time, and run counters reset. Persistent base attributes, XP count, partial XP, ability bindings, and Difficulty SHALL remain, with the five inactive attributes still zero. Difficulty SHALL not be shown in the player-facing interface.

#### Scenario: Death starts a fresh Level 1
- **WHEN** the character dies
- **THEN** a new Level 1 layout starts with Time at zero, empty run equipment/Inventory, and starting run counters/resources, while character progression and hidden Difficulty remain

#### Scenario: Death starts fresh floor
- **WHEN** the character dies
- **THEN** the run restarts at its initial depth with new dungeon layout and empty gear while persistent progression remains intact
