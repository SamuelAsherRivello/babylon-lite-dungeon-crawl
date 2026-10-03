# Spec Delta

## Purpose

Give each new run a readable identity that can be replayed consistently at a chosen difficulty, including its later procedurally generated realms.

## ADDED Requirements

### Requirement: Accept a readable run seed
A `randomSeed` URL argument SHALL accept an eight-character uppercase letter-and-digit token from a documented alphabet that avoids visually ambiguous characters. When the argument is absent or invalid, a new random run seed SHALL be generated.

#### Scenario: Start with a supplied seed
- **WHEN** a new campaign is started with `?randomSeed=ASDFASDF`
- **THEN** the campaign uses that token as its run seed

#### Scenario: Start without a usable seed
- **WHEN** the `randomSeed` argument is missing or invalid
- **THEN** the game creates a random readable run seed and starts normally

### Requirement: Reproduce the full run from seed and difficulty
The same run seed and difficulty SHALL generate the same realm layouts, exits, enemies, and world pickups at every depth. Changing only the run seed SHALL create different generated content while preserving the selected difficulty.

#### Scenario: Descend through a reproducible run
- **WHEN** two new runs use the same seed and difficulty and reach the same depth
- **THEN** that realm's generated layout and placements match

#### Scenario: Replay at the same difficulty
- **WHEN** a new run uses a different seed and the previous difficulty
- **THEN** it generates different realm content at the same difficulty baseline

### Requirement: Apply difficulty to enemy challenge
A new run SHALL store a selected difficulty that sets its enemy challenge baseline. Realm depth SHALL continue to increase challenge within that selected difficulty.

#### Scenario: Increase realm depth
- **WHEN** a player descends while a difficulty is selected
- **THEN** the next realm uses the same difficulty and a higher depth challenge
