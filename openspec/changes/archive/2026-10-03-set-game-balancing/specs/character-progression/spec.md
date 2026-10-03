# Spec Delta

## MODIFIED Requirements

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
