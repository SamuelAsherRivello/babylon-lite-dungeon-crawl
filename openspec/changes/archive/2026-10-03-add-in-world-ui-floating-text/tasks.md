# Tasks

## 1. Event integration

- [x] 1.1 Project committed player Health increases and decreases into transient feedback records with signed amounts and actor positions; verify event projection distinguishes Health from other resource changes and preserves captured positions across respawn.
- [x] 1.2 Project enemy hit events into transient feedback records using target identity, damage, and world position; verify melee and ability hits both provide usable positions, including when the target is defeated.

## 2. World presentation

- [x] 2.1 Render transient text effects in the world overlay at actor coordinates with upward motion, green gains, and red losses; verify camera modes and zoom keep text aligned with actors.
- [x] 2.2 Expire completed effects and offset simultaneous messages without adding world-space health bars; verify effects are removed after their animation and no persistent health indicators render.

## 3. Verification

- [x] 3.1 Add focused checks for player healing/damage, enemy melee/ability damage, defeated enemies, respawn, and effect expiry; verify all checks pass and gameplay outcomes remain unchanged.
