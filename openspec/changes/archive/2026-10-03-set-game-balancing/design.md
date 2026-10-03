# Design

## Context

`cryptbound/src/game/dungeon.js` currently owns turn resolution, combat, resources, generated enemies, abilities, and campaign creation. It applies a linear Stamina ratio to Offense and Defense, lets enemies attack every turn while adjacent, and stores five inactive secondary attributes. See [proposal.md](proposal.md) for motivation and the accompanying spec deltas for the behavioral contract.

Existing saves use version 2 and are normalized in `cryptbound/src/game/saves.js`. The React layer renders resource and attribute values from the game state; it must remain a consumer of game-rule state rather than calculating combat values itself.

## Goals / Non-Goals

**Goals:**

- Centralize deterministic encounter tuning and make the floor-one combat target testable.
- Keep tactical timing entirely within the game-rule layer, including enemy cooldowns and pending level-up selection.
- Preserve current save data where a direct migration is meaningful.

**Non-Goals:**

- Add random combat outcomes, a fallback renderer, multiplayer, or a second movement-speed system.
- Redesign the Babylon renderer, viewport layout, or ability-binding interaction model.
- Add a distinct enemy thinking timer or make pickup collection an extra action.

## Decisions

### Centralize the opening combat profile

`GAME_TUNING` remains the single tuning surface and will carry the following starting profile:

| Value | Initial target |
|---|---:|
| Health maximum | 30 |
| Stamina maximum | 16 |
| Mana maximum | 12 |
| Attack Stamina cost | 4 |
| Ground-move Stamina recovery | 2 |
| Innate Defense | 1 |
| Starting-stick damage | 6 |
| Basic-enemy Health / attack | 12 / 11 |
| Basic-enemy awareness / cooldown | 6 tiles / 2 turns |
| Health / Mana potion restoration | 10 / 8 |
| Heal cost and effect | 5 Mana / 8 Health |
| Wand cost and effect | 4 Mana / 7 damage |

Player readiness is `0.75 + 0.25 * currentStamina / maximumStamina`. Effective weapon offense and Defense multiply their respective base values by readiness and round to an integer. A melee hit uses the effective weapon offense; an enemy hit is `max(1, enemy attack - effective Defense)`. This gentle deterministic curve preserves the desired Stamina loop without making the second opening attack miss the two-hit target. A raw Stamina multiplier was rejected because the existing 0–25 values would create unstable damage ranges.

### Treat equipment as the Defense build path

Campaign state keeps a small innate Defense and derives the rest from equipped armor and shields. Vitality, Strength, Luck, Recovery, and Stealth are persistent ranks rather than parallel raw resource caps:

- Vitality adds 3 maximum Health per rank.
- Strength adds 1 weapon offense per rank.
- Luck advances deterministic loot/discovery quality by one tier for each two ranks.
- Recovery adds 1 Stamina recovered per accepted ground move per rank.
- Stealth reduces effective enemy awareness by one tile for each two ranks, to a minimum of one tile.

The existing `agility` save field migrates to `stealth`. Resource maxima and current amounts are normalized through the existing resource-normalization path so current-to-maximum fullness is retained after migration or an upgrade.

### Use a single enemy action clock

Enemies gain explicit `awareness`, `actionCooldown`, and next-eligible-action state when generated. After each accepted player turn, an enemy inside its effective awareness radius acts only when its next eligible turn is reached, then schedules its next action after its cooldown. An eligible enemy performs either one one-cell movement or one adjacent attack. This uses a single observable timing rule instead of a separate hidden thinking clock.

Sneak remains an existing awareness modifier and combines with Stealth before the minimum-radius bound is applied. Player movement still advances exactly one grid cell and one tactical turn.

### Gate progress on a deterministic level-up choice

When XP crosses a threshold, the rules layer creates three distinct options from the five persistent stats using a deterministic rotation based on character level. It records a pending choice, exposes it to React, and rejects later tactical actions until a valid option is chosen. The choice increments the selected rank and normalizes affected resources, but does not tick time; the action that granted XP remains the sole time advance.

This is preferred to silently applying a stat or randomly presenting cards: it makes persistent growth intentional and is reproducible in tests and saves.

### Preserve player-facing boundaries

The game-rule layer will emit state and resource-change events. React will render revised labels, descriptions, values, and the level-up choice UI, and dispatch a choice action. Babylon world rendering remains unchanged. Game-rule tests cover the calculations and time accounting; component tests cover the new visible choice and labels.

## Risks / Trade-offs

- [A floor-one target can drift when equipment or enemy generation changes] -> Encode the target in focused game-rule tests and retain all values in `GAME_TUNING`.
- [Migrated saves can contain obsolete high raw Offense/Defense values] -> Migrate rank names, rebuild derived values from the new base profile and equipment, and preserve current Health/Stamina/Mana fullness rather than obsolete maxima.
- [Pending upgrades could block saved games unexpectedly] -> Persist pending choices and validate their contents on load; regenerate the deterministic choice set when legacy state has none.
- [The in-progress command-desk change specifies a linear resource display model] -> Update affected UI documentation/tests together and reconcile its resource-meter/player-ability deltas before either change is archived.

## Migration Plan

1. Advance campaign save data to a new version and migrate `agility` to `stealth` while retaining compatible persistent ranks and equipment.
2. Rebuild derived resource maxima from the new profile and preserve Health, Stamina, and Mana fullness ratios.
3. Generate valid per-enemy action-clock state for loaded floors and regenerate valid pending level-up choices when absent.
4. Keep the prior migration path readable so old version-1 and version-2 saves remain recoverable.
5. Validate a migrated save, a fresh run, and a death/reset run before release.
