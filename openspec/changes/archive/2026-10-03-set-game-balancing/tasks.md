# Tasks

## 1. Deterministic combat and turn rules

- [x] 1.1 Replace the provisional combat constants and resource derivation in `cryptbound/src/game/dungeon.js` with the approved opening profile, readiness curve, deterministic damage formula, and potion/ability values; verify focused `cryptbound/test/game.test.mjs` cases prove the two-hit opening kill and three-hit survival target.
- [x] 1.2 Add per-enemy awareness, action cooldown, and next-eligible-action state to floor generation and enemy resolution; verify game-rule tests cover cooldown waiting, one-cell movement or one attack when eligible, Stealth/Sneak awareness, and no enemy action after a rejected player action.
- [x] 1.3 Preserve one-turn movement collection and one-turn committed loadout changes while ensuring pickups add no extra tick; verify game-rule tests cover item/potion collection, ability assignment, equipment assignment, rejection, and cancellation time accounting.
- [x] 1.4 Update `cryptbound/documentation/resources-progression.md` and `cryptbound/documentation/abilities-controls.md` with the new deterministic resource, potion, and ability economy; verify every documented initial value matches `GAME_TUNING`.

## 2. Persistent stats, level choices, and saves

- [x] 2.1 Implement Vitality, Strength, Luck, Recovery, and Stealth as derived persistent-rank effects, with equipment-led Defense and updated attribute labels/descriptions; verify focused game-rule tests cover each effect and current-resource normalization after an upgrade or equipment change.
- [x] 2.2 Implement deterministic three-option level-up state and a non-turn-consuming stat-choice action that blocks tactical actions until resolved; verify game-rule tests cover distinct rotating options, valid and invalid choices, XP carryover, and exact time behavior.
- [x] 2.3 Advance save migration to preserve compatible progress, map legacy `agility` to `stealth`, rebuild obsolete derived values, initialize enemy clocks and pending choices, and preserve Health/Stamina/Mana fullness; verify migration tests cover version-1, version-2, and current save payloads.
- [x] 2.4 Update `cryptbound/documentation/resources-progression.md` to describe stat ranks, deterministic Luck, Stealth, and level-up choices; verify the documented migration behavior matches `cryptbound/src/game/saves.js`.

## 3. Player-facing progression UI

- [x] 3.1 Update React resource and attribute presentation so the renamed Stat set, equipment-led Defense, and revised help text reflect authoritative game-rule values; verify `cryptbound/test/page.test.mjs` or focused component assertions cover the rendered labels and resource descriptions.
- [x] 3.2 Add a level-up chooser that displays the three pending stat options, prevents ordinary gameplay input while it is open, and dispatches the selected rule-layer action; verify focused UI tests cover rendering, selection, and the post-selection return to play.
- [x] 3.3 Add or update an `@smoke` Playwright scenario for a visible level-up choice and its selection using `?mute=1`; verify with `npm run test:browser` after the UI implementation.

## 4. Integrated verification

- [x] 4.1 Run `npm test`, `npm run build`, and `npm run test:browser:full`; verify all relevant game-rule, UI, browser, and production-build checks pass with the revised combat loop.
