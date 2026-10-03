## MODIFIED Requirements

### Requirement: Advance one tactical turn per accepted grid action
Accepted movement, attacks, abilities, and completed slot drags SHALL each advance exactly one time unit followed by one enemy phase. Chest and stair interactions through accepted grid actions SHALL retain one tick. Idle time, Settings, layout/preferences, previews, canceled/invalid drags, and rejected actions SHALL not advance world time. The game SHALL not have an autonomous time clock or separate Settings pause state.

#### Scenario: Walk into traversable space
- **WHEN** one grid move is accepted
- **THEN** the player moves one cell and Time increases once

#### Scenario: Bump an enemy
- **WHEN** the player bumps an adjacent enemy
- **THEN** one attack resolves and Time advances once

#### Scenario: Blocked terrain
- **WHEN** the player attempts an impassable cell without an actionable target
- **THEN** the player stays in place and Time does not advance

#### Scenario: Commit equipment or ability assignment
- **WHEN** an equipment drag or ability reorder is committed
- **THEN** its change is applied before one time increment and one enemy phase

#### Scenario: Settings remains open
- **WHEN** no gameplay action is accepted while Settings is open
- **THEN** world Time and enemies remain unchanged through the ordinary action-driven time rule

### Requirement: Interact through adjacent tiles
Bumping into an enemy, chest, or stair SHALL invoke its interaction. Stepping onto loot or stairs SHALL resolve its tile interaction; ordinary loot SHALL enter Inventory and potions SHALL refill their resource under the collection rules. Collection SHALL add no tick beyond its accepted movement. Discovery interactions SHALL not grant XP.

#### Scenario: Open a chest
- **WHEN** the player bumps an unopened adjacent chest
- **THEN** it opens and reveals its loot as one interaction turn

#### Scenario: Collect a discovery
- **WHEN** a valid discovery is collected
- **THEN** its collection is recorded without discovery XP or a level-choice prompt

#### Scenario: Collect while moving
- **WHEN** a movement lands on an accepted item pickup
- **THEN** item collection resolves during that move without another time increment

### Requirement: Advance Dungeon Level and persistent Difficulty at exits
Each new campaign SHALL begin at Dungeon Level 1 and Difficulty 1. Entering an exit SHALL increase both values by one, then generate the next dungeon using the new Difficulty. Dungeon Level and Time SHALL reset to 1 and zero on death; Difficulty SHALL persist with saved character progression and continue to drive generated challenge. Difficulty SHALL remain hidden from players.

#### Scenario: Enter an exit
- **WHEN** the player enters the exit on Dungeon Level N
- **THEN** the game starts Dungeon Level N+1 and uses Difficulty N+1 for world generation

#### Scenario: Die at a later Dungeon Level
- **WHEN** the player dies after reaching a later Dungeon Level
- **THEN** a new Dungeon Level 1 is generated using the saved Difficulty, and Time resets to zero

### Requirement: Resolve dual-wield attacks together
When both Weapons positions contain attack-capable weapons, a melee bump SHALL resolve the combined weapon action before one enemy phase and one time increment. Rearranging those weapons within the group SHALL not change their combined attribute effect. A shield SHALL contribute only its defined item effects.

#### Scenario: Attack with two weapons
- **WHEN** both Weapons positions contain attack-capable weapons and the player bumps an enemy
- **THEN** their attack resolves as one action, with one stamina charge and one time increment
