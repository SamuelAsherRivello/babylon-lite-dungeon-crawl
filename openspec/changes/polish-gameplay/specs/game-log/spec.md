# Spec Delta

## Purpose

Present selected gameplay events as a clear, consistent account of what the player does and experiences during the current run.

## ADDED Requirements

### Requirement: Write Log entries in present-tense second person
Every player-facing gameplay Log entry SHALL address the player as “You” and use present-tense verbs. Event facts SHALL be formatted as readable sentences without changing the event's outcome.

#### Scenario: Collect an item
- **WHEN** the player collects an item
- **THEN** the Log says `You collect <item>.`

#### Scenario: Defeat an enemy
- **WHEN** the player defeats an enemy
- **THEN** the Log says `You defeat <enemy>.`

### Requirement: Keep Log events about gameplay actions
Log entries SHALL describe committed gameplay events and SHALL NOT be emitted for rejected actions or canceled previews and drags.

#### Scenario: Cancel an equipment drag
- **WHEN** the player returns an item to its source
- **THEN** no Log entry is added for the canceled drag
