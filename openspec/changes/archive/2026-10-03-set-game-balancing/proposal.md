# Proposal

## Why

Cryptbound's current combat loop makes low Stamina reduce both Offense and Defense linearly while enemies can attack on every accepted player turn. This creates punishing encounters, leaves five visible progression stats without gameplay effects, and lacks a coherent Mana and potion economy.

## What Changes

- Establish deterministic combat calculations for weapon damage, Stamina-scaled Offense and Defense, and incoming damage. Successful enemy hits always deal at least one Health damage after mitigation; combat, blocks, and damage ranges do not use dice rolls.
- Rebalance floor-one resources and enemies around a two-player-attack basic-enemy defeat and a full-health, full-Stamina player surviving approximately three basic-enemy hits.
- Retain Stamina as the movement-recovered combat resource, while making its recovery, attack cost, and combat-effect curve configurable and compatible with the starting-fight target.
- Make Health restoration potion-driven: ordinary movement never restores Health. Make Mana potion-driven and ability-spent, with configurable ability costs and effects.
- Give persistent progression stats durable gameplay effects: Vitality raises Health capacity, Strength improves weapon offense, Luck provides deterministic loot/discovery progression, Recovery improves Stamina recovery from movement, and Stealth lowers effective enemy awareness.
- Present three distinct deterministic stat choices whenever XP earns a level; choosing one applies its increase without advancing a separate turn.
- Make Defense primarily equipment-driven, with only a small innate defense; armor and shields provide the meaningful mitigation growth.
- Give each enemy an individual awareness radius and action cooldown. An aware enemy may move one grid cell or attack only when its cooldown permits; no distinct hidden thinking timer is introduced.
- Clarify time accounting: an accepted move, combat bump, ability use, or committed ability/equipment reassignment advances one turn; collecting an item during a move adds no extra turn.

## Capabilities

### New Capabilities
- `combat-resolution`: Deterministic player/enemy damage resolution, combat-resource effects, starting encounter tuning, and Health/Stamina/Mana restoration rules.

### Modified Capabilities
- `character-progression`: Replace inert secondary stats with the confirmed persistent stat effects and equipment-led Defense progression.
- `dungeon-turns`: Define individual enemy awareness/action cooldowns and explicit no-extra-turn collection behavior.

## Impact

- Affects `cryptbound/src/game/dungeon.js`, its game-rule tests, save migration for renamed or newly effective stats, and player-facing attribute/resource descriptions.
- Retunes the ability catalog and potion values while preserving four ability bindings and their existing one-turn activation behavior.
- Requires consistency with the in-progress resource-meter and player-ability UI work, whose specifications currently describe the provisional linear Stamina model and current Mana costs.
