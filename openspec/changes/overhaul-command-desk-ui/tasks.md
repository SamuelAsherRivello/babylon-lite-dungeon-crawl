# Tasks

## 1. Campaign model and legacy migration

- [x] 1.1 Define campaign version 2 with five active/five inactive attributes, resources, two Weapons/two Armor positions, Inventory/capacity, four ability bindings, counters/objective, and retained Log; verify valid/invalid fixtures and agreed field ordering.
- [x] 1.2 Implement a pure migration from the inspected version-1 schema, mapping old Health/Strength/Defense/Stamina, equipment, pending state, realm, position, entities, Time, and XP without duplicate items; verify old saves retain supported state and inactive attributes become zero.
- [x] 1.3 Extend `saves.js` validation/read/write to support migration and preserve original records before successful version-2 writes; verify three-campaign independence, failed migration retention, corrupted JSON, and unavailable storage in focused save tests.
- [x] 1.4 Document the version mapping and backup/rollback behavior under `cryptbound/documentation/`; verify examples against the migration fixtures and keep provisional new-game tuning distinct from migrated progression.

## 2. Action transactions, domain events, and Log policy

- [x] 2.1 Introduce the pure action-result contract and serial session dispatcher with unique transaction/event IDs; verify one accepted move/attack/ability/slot drag causes one tick and one enemy phase, while rejected actions and idle time cause none.
- [x] 2.2 Define a shared event envelope and event catalog for movement/time, combat, resources, items, equipment, abilities, progression, realms/death, quests/counters, and saves; verify structured facts rather than formatted log text reach independent subscribers.
- [x] 2.3 Replace direct domain message creation with relevant semantic events in existing paths, and provide hooks used by the new systems in subsequent groups; verify a listener receives events even with logging disabled and no domain `message` or ad hoc log-only callback remains.
- [x] 2.4 Implement the session-level Log subscriber and centralized include/ignore/format rules with ordering/deduplication/retention; verify selected events become entries once, ignored movement and insufficient-Mana events remain raw events, and hidden mobile Log still accumulates entries.
- [x] 2.5 Route autosaving from finalized action revisions after Log projection and emit storage outcomes through events; verify Log append and save-failure handling cannot recursively save or reapply gameplay.
- [x] 2.6 Add focused transaction/event/Log tests to the existing test command and document how to suppress logging without removing events, and how to extend an event before adding Log coverage; verify a policy-only change leaves source emission and other subscribers intact.

## 3. Resources, combat attributes, and XP

- [x] 3.1 Implement active Health/Stamina/Offense/Defense/Mana attributes, matching maxima, and inactive zero-valued Vitality/Strength/Luck/Recovery/Agility; verify legacy Strength/Luck/Recovery formulas no longer affect new gameplay.
- [x] 3.2 Implement bounded current values and percentage preservation on maximum changes, with derived Offense/Defense and safe zero-maximum behavior; verify Health 20/25 becomes 8/10 and Stamina 20/25 yields 80% Offense/Defense.
- [x] 3.3 Configure starting Stamina 25 and provisional attack cost 5/move recovery 10 centrally, using one stamina charge for a combined weapon attack; verify clamps at zero/maximum and emitted resource facts.
- [x] 3.4 Add Health/Mana Potion world pickups using the existing potion art and direct refill rules; verify collection below cap, walking over uncollected potions at cap, no Inventory entry, and no extra time tick.
- [x] 3.5 Revise XP to award attack and kill experience, carry threshold overflow, and increment the bar count without trait choices; verify discovery XP and level-choice pending states are removed.
- [x] 3.6 Preserve base attributes/XP/ability bindings on death while resetting realm and run Inventory/equipment; verify fresh-run fixtures and resource maxima after removing run item effects.
- [x] 3.7 Update focused `game.test.mjs` coverage and document meter units, currentMax markers, provisional balance values, potion exceptions, and XP rules; verify documented numerical examples match tested calculations.
- [x] 3.8 Persist hidden Difficulty with progression, advance it alongside Dungeon Level on exits, and retain it while death resets Level, Time, run items, and counters; verify new-game, descent, death, reload, and legacy-save behavior in focused game/save checks.

## 4. Inventory, grouped equipment, and Slot Drag Preview

- [x] 4.1 Implement ordinary automatic collection into capacity-bounded Inventory with stable item IDs and alphabetical name/ID sorting; verify no automatic equip or prompt, count excludes equipped gear, and full Inventory leaves the item in the world.
- [x] 4.2 Implement two Weapons/two Armor positions and item-to-group compatibility, allowing swords/shields in either Weapons position; verify cosmetic group swaps do not change aggregate modifiers and incompatible drops are rejected.
- [x] 4.3 Implement atomic equip, unequip, and within-group reorder actions with capacity validation and domain events; verify one time tick per committed change and zero for same-source/invalid/canceled drops.
- [x] 4.4 Implement a pure projected-attributes calculation shown only while an item is over a relevant compatible equipment slot; verify leaving the slot, canceling, or ending the drag clears the preview without changing authoritative or saved values.
- [x] 4.5 Build shared pointer-capture drag state/handles for desktop and touch, separating drag gestures from card scrolling; verify pointer cancellation, Escape, return to source, invalid targets, and release revalidation with the existing view integration.
- [x] 4.6 Add focused inventory/compatibility/preview tests and document the initial capacity and occupied-target policies; verify the documented drop rules and alphabetical examples against the tests.

## 5. Abilities and Sneak

- [x] 5.1 Define a configurable ability catalog with Heal/self-target and Wand/offensive grid targeting, Mana costs, and effect payloads; verify positive costs, bounded healing, deterministic targeting, and relevant ability/resource/combat events.
- [x] 5.2 Implement four initial assignments `[Heal, Wand, empty, empty]`, empty-position moves, and populated swaps; verify keys 1–4 read current positions and committed reorders cost exactly one tick.
- [x] 5.3 Guard activation through keyboard and touch using current Mana, empty binding, and valid-effect checks; verify unaffordable abilities cause no message, resource change, or time tick and affordable effects resolve before one enemy phase.
- [x] 5.4 Replace Brace with C/mobile Sneak mode, using centrally configurable awareness tuning in the existing enemy model; verify mode toggle adds no tick and subsequent moves retain the shared action rules.
- [x] 5.5 Update focused game tests and ability/control documentation; verify examples cover key reassignment, silent insufficient-Mana rejection, and provisional payload/Sneak tuning without presenting those values as approved balance.

## 6. Shared world renderer, minimap, Zoom, and cameras

- [x] 6.1 Extract identical map traversal, wall selection, and entity placement into `WorldRender.Render(args)` under `src/content/`, with the documented view/camera/detail/layer/marker arguments; verify both views derive matching geometry and positions from the same realm fixture.
- [x] 6.2 Refactor the current Babylon owner to share one engine/device and texture lifetime across the game surface and minimap auxiliary surface using the installed SDK APIs; verify surface/layer cleanup on resize, campaign changes, and realm replacement, with mouse interaction disabled for the minimap.
- [x] 6.3 Support Zoom 0.25/0.5/1/2/4 and normalize backing-to-CSS density so the tile sizes are 8/16/32/64/128 CSS pixels; verify resize, DPR change, fullscreen, and developer aspect preview do not change the selected scale.
- [x] 6.4 Implement Center, a centered Deadzone spanning 30% of visible width and 30% of visible height, and Screen page-origin camera policies, defaulting to Center; verify deadzone resize/zoom behavior, edge entries for all four Screen directions, and that camera movement never changes player map coordinates.
- [x] 6.5 Add the low-resolution full-realm minimap with simplified detail and player/exit markers, independently fitted from game Zoom/Camera; verify geometry matches the active world before and after descent.
- [x] 6.6 Update focused renderer/camera/preset tests and the rendering guide; verify WebGPU-only errors, nearest filtering, no fallback renderer, and documented lifecycle/coordinate/DPR behavior against installed SDK support.
- [x] 6.7 Keep the selected world cell under the mouse reticle while a button is held across movement and all camera modes; verify pointer motion does not change the held selection, release restores hover targeting, zoom preserves cell alignment, and the minimap never shows or handles a reticle.

## 7. Responsive React composition and item views

- [x] 7.1 Extend `layout.js` to both fitted ratios and centralize platform classification plus a session-only developer override; update focused layout tests to verify PC/mobile selection, portrait fit, centered gutters, and invalid configurations.
- [x] 7.2 Compose `GameScreen`, `TitleBar`, and `StatusBar` with the `Dungeon Roguelite (DR)` title, 4% title/status height, 22% landscape side widths, centered World/Dungeon Level, real counters, icon-labelled dropdowns, Fullscreen, and developer controls; vertically center titlebar/statusbar content and verify region geometry and no counter/control divider lines.
- [x] 7.3 Build bordered `Card` and `SecondaryInfoPanel` with minimap, plain Quest, and event-projected Log in order; verify titles sit on the top border and legacy standalone status messages never render.
- [x] 7.4 Build `PrimaryInfoPanel`, `ResourceList`/`ResourceBar`, `AttributeViewItemList`/`AttributeViewItem`, and event-driven gain animation; verify Resources/Attributes order, five zero-valued right entries, currentMax markers, bright gain segments, and XP-only text.
- [x] 7.5 Build `AbilityViewItemList`/`AbilityViewItem`, `SlotList`/`SlotRow`, and `InventoryViewItemList`/`InventoryViewItems` as full-width horizontal rows; verify exact ability field order, no Mana-cost icon, section titles only for equipment, `+` on empty equipment positions, drag indicators/cursors only on actually draggable rows, and `Inventory NN/MM` title.
- [x] 7.6 Wire pointer drag projections and committed actions into the item views; verify red/green values during both directions of drag, white on commit/cancel, alphabetical Inventory reinsertion, and immediate key-binding updates.
- [x] 7.7 Build the portrait lower area with a statusbar Control/Info toggle; show `MobileControlPanel` by default and both information panels when Info is selected, keeping gameplay state unchanged while switching.
- [x] 7.8 Remove all `AppCorner` instances, old Dpad/Brace/pending-choice/message/readout JSX, and unused selectors/imports/custom properties; verify active JSX and styles agree and the production UI contains none of the killed features.
- [x] 7.9 Tune portrait sizing within the provisional lower-area budget and enforce always-visible tracks only in Log/Slots/Inventory; verify controls stay visible at initial scroll and all information cards remain reachable at representative 360×640 and 390×693 sizes without clipping or overlap.
- [x] 7.10 Update layout/UI documentation, project guidance, and OpenSpec context to the approved platform exception, components, corner removal, event ownership, and scrollbar policy; verify generated skill files, Vite root, and repository base are preserved.
- [x] 7.11 Display Dungeon Level in place of the old realm-depth wording while keeping Difficulty hidden; verify the titlebar and Saved Game summaries show Dungeon Level and the XP meter remains distinct.

## 8. Preferences, Settings, and Saved Games flow

- [x] 8.1 Add validated application-level localStorage preferences for Zoom/Camera/Fullscreen intent and restore them before view setup; verify valid reload, invalid values, malformed JSON, blocked storage, and defaults 1/Center/windowed independently of campaign selection.
- [x] 8.2 Implement Fullscreen desired/actual state and browser-event synchronization, applying stored intent on a permitted gesture when needed; verify rejected initial requests preserve play and intent, and browser exit updates actual state and stored preference.
- [x] 8.3 Adapt `Dialog` into centered `SettingsDialog` with vertical Save & Return/GitHub actions and non-clickable root version text; verify focus/held-input handling, source-link protection, no GitHub icon, and no separate pause state.
- [x] 8.4 Replace menu slot/Delve/floor/level wording with `3 Saved Games` and realm/XP summaries, remove tagline, and save committed state before returning; verify selecting/resuming all three campaigns and retaining failed migration data.
- [x] 8.5 Show persistent save failure state independently of Log visibility, including when the portrait lower area is scrolled to controls; verify unavailable localStorage remains clearly reported without creating a gameplay or autosave loop.
- [x] 8.6 Add focused preference/save-flow tests and document refresh/fullscreen gesture behavior and Saved Games terminology; verify preferences are app-wide and developer aspect override is not persisted.

## 9. Integrated acceptance checks

- [x] 9.1 Run the repository's updated `npm test` and `npm run build` from the root; verify all focused checks pass and production output preserves `cryptbound/dist` and the existing Pages base.
- [ ] 9.2 Review the landscape PC view and portrait mobile view, including the PC developer aspect override, at normal and increased browser zoom, windowed/fullscreen, and representative DPR values; deliver evidence for visible controls, reachable information cards, intended scrollbars, no corner units, and stable tile scale.
- [x] 9.3 Exercise a complete collect/equip/preview/cancel/reorder/ability/potion/descent/death sequence; verify raw event order, Log policy, stamina-derived resources, key assignment, and one enemy phase per accepted tick.
- [x] 9.4 Refresh and resume a migrated and a new campaign with stored Zoom/Camera/Fullscreen intent; verify full state restoration, no duplicated Log/events/items, and protected legacy records.
- [x] 9.5 Verify a production session hides Dev Settings and a developer PC session can preview both mobile modes and return to landscape without changing campaign state; record remaining provisional tuning values and any unresolved acceptance failures.
- [x] 9.6 Exercise exit and death transitions at multiple Dungeon Levels; verify both values increase on exit, only Dungeon Level and Time reset on death, hidden Difficulty persists through death/save reload, and generated challenge uses Difficulty.
