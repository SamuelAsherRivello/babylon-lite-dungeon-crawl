# world-floating-feedback Specification

## Purpose

Defines brief, readable combat and healing feedback that appears at the affected character's location in the dungeon world. The feedback communicates health changes without adding persistent world-space status UI.

## Requirements

### Requirement: Show floating text for player Health changes
When the player's Health changes, the game SHALL show brief floating text at the player's world position; gains SHALL be green and losses SHALL be red.

#### Scenario: Player takes damage
- **WHEN** an enemy reduces the player's Health
- **THEN** red floating text showing the amount lost appears at the player's position

#### Scenario: Player gains Health
- **WHEN** the player's Health increases
- **THEN** green floating text showing the amount gained appears at the player's position

### Requirement: Show floating text for enemy damage
When an enemy loses health, the game SHALL show brief red floating text at that enemy's world position showing the amount of damage dealt.

#### Scenario: Enemy is hit by a melee attack
- **WHEN** the player damages an enemy with a melee attack
- **THEN** red floating text showing the damage appears at the enemy's position

#### Scenario: Enemy is hit by an ability
- **WHEN** an ability damages an enemy
- **THEN** red floating text showing the damage appears at the enemy's position

### Requirement: Keep floating feedback transient and text-only
Floating health feedback SHALL disappear after a brief animation and SHALL NOT render world-space health bars or persistent health indicators.

#### Scenario: Feedback expires
- **WHEN** the floating text animation completes
- **THEN** the text is removed from the world view

#### Scenario: Enemy remains visible
- **WHEN** an enemy is damaged
- **THEN** the world view shows the floating damage text without a health bar
