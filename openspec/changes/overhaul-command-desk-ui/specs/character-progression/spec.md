## MODIFIED Requirements

### Requirement: Track six persistent character stats
The character SHALL have ten attributes. Health, Stamina, Offense, Defense, and Mana SHALL appear in the left column in that order and define resource maxima. Vitality, Strength, Luck, Recovery, and Agility SHALL appear in the right column at zero and have no gameplay effect in this change. XP SHALL not appear as an attribute.

#### Scenario: Apply stat effects
- **WHEN** combat and resource rules use character attributes
- **THEN** the five active attributes define their named maxima while the five zero-valued attributes do not affect gameplay

#### Scenario: Display Attributes
- **WHEN** the Attributes card is shown
- **THEN** the two columns contain five name/value entries each and the left matches Resources order before XP

### Requirement: Award experience and stat choices
Enemy attacks and enemy kills SHALL award experience. XP SHALL show a bar with a level count starting at 01; filling it SHALL increment the count and restart progress at zero, carrying excess toward the next threshold. No stat-choice prompt SHALL be shown, and discoveries SHALL no longer grant XP.

#### Scenario: Level up
- **WHEN** earned experience crosses a threshold
- **THEN** the XP count increments, excess progresses toward the next threshold, and no choice or pause occurs

#### Scenario: Attack an enemy
- **WHEN** a valid attack hits an enemy
- **THEN** attack XP is awarded and a kill awards its additional XP if that attack defeats the enemy

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

### Requirement: Preserve progression and Difficulty on death
At zero Health, the player SHALL begin a newly generated Dungeon Level 1 with run Inventory, equipment, current resources, Time, and run counters reset. Persistent base attributes, XP count, partial XP, ability bindings, and Difficulty SHALL remain, with the five inactive attributes still zero. Difficulty SHALL not be shown in the player-facing interface.

#### Scenario: Death starts a fresh Level 1
- **WHEN** the character dies
- **THEN** a new Level 1 layout starts with Time at zero, empty run equipment/Inventory, and starting run counters/resources, while character progression and hidden Difficulty remain

## REMOVED Requirements

### Requirement: Brace with Stamina
**Reason**: Stamina now governs attacks and effective Offense/Defense, and the agreed controls replace Brace with Sneak and abilities.
**Migration**: Remove Brace controls and action handling; use the new Stamina resource rules and C/mobile Sneak control.
