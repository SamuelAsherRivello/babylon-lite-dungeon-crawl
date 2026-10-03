# Design

## Context

See `proposal.md` for motivation and the capability deltas for observable behavior. The inspected implementation has these boundaries:

- `cryptbound/src/game/Game.jsx` owns campaign selection, keyboard timing, localStorage calls, and almost all game JSX. Its `Dpad` includes diagonal arrows and Brace, and `state.pending` opens gear/trait overlays.
- `cryptbound/src/game/dungeon.js` is a mostly pure game-rule module. It currently has six active stats, five anatomical equipment positions, auto-equipping, discovery XP, random trait choices, Brace, and a single formatted `message` field.
- `cryptbound/src/game/saves.js` accepts version-1 campaigns and stores three keys prefixed `cryptbound.slot.`. There is no migration or application preference record.
- `cryptbound/src/content/BabylonWorld.jsx` owns a WebGPU engine, atlases, tile/actor/item layers, centered camera, and resize observers. It uses 32-pixel world coordinates and a fixed 320×180 reference for three zoom presets.
- `cryptbound/src/ui/BrowserSurface.jsx` fits the CSS viewport and independent gutters. `layout.js` only permits landscape. `App.jsx` creates all four corners; `Dialog.jsx` already provides a centered dialog primitive.
- `package.json` verifies React 19, Vite 8, Babylon Lite 1.32.0, and existing Node tests. Installed Babylon Lite exposes `createSurface`, `createSpriteRenderer`, `resizeSurface`, `disposeSurface`, `centerSprite2DView`, sprite layers, and explicit view zoom. Auxiliary surfaces can share one engine/device.
- The supplied asset pack already includes Health and Mana Potion artwork. `version.txt` currently supplies 0.0.5. The Vite root is `cryptbound` and deployment base is `/babylon-lite-dungeon-crawl/`.

The inherited guidance and OpenSpec context still describe the old UI. The user's explicit platform/corner/progression decisions supersede those defaults. Implementation must update the project guidance and context so future work does not restore the old design; generated skills are outside this change.

## Goals / Non-Goals

**Goals:** Keep campaign rules independent of React and GPU ownership; represent committed actions once; share geometry across both world views; make the named item components reusable; centralize Log policy; and preserve existing local campaigns through a versioned migration.

**Non-Goals:** Rename the project, replace the renderer, introduce online services or an event-sourced persistence platform, settle final combat balance, or replace procedural gameplay with the supplied reference screenshots. The screenshots guide appearance; both views render the actual active realm.

## Decisions

### 1. Compose the shell from the agreed React components

Reusable UI belongs under `cryptbound/src/ui/`. Game actions/models belong under `src/game/`; render lifecycle and drawing belong under `src/content/`. `Game.jsx` becomes the campaign/session integration entry instead of containing every view.

| Component | Responsibility |
| --- | --- |
| `GameScreen` | Region composition, automatic platform aspect, PC developer aspect preview |
| `TitleBar` | Title/world/realm/counters and view/settings controls |
| `StatusBar` | Vertically centered desktop legend/developer area; no mobile tab controls |
| `GameViewport` | Measured world host delegating drawing to the content renderer |
| `SecondaryInfoPanel` | Minimap, plain Quest, Log cards |
| `PrimaryInfoPanel` | Resources, Attributes, Abilities, Slots, Inventory cards |
| `Card` | Border, title on its top line, common spacing |
| `ResourceList` / `ResourceBar` | Ordered meters, cap marker, gain display |
| `AttributeViewItemList` / `AttributeViewItem` | Two columns of five name/value entries and projected colors |
| `AbilityViewItemList` / `AbilityViewItem` | Four ordered horizontal ability rows and positional binding |
| `InventoryViewItemList` / `InventoryViewItems` | Alphabetized horizontal inventory rows and carry count; preserve the requested plural row-component name |
| `SlotList` / `SlotRow` | Group titles and horizontal equipment drop targets |
| `MobileControlPanel` | Cardinal arrows, 1–4, Sneak at the top of the portrait lower area |
| `SettingsDialog` | Existing dialog primitive adapted to the vertical action menu |

Common row/drop affordances can be shared internally, but the user-facing list components remain separately named. Quest uses simple text, not the item-row renderer. Icon-only controls still have accessible names. The visible ability cost is a number with no Mana icon.

Alternative: continue expanding `Game.jsx`. This would couple input/session state to every new card and complicate shared drag behavior. The component split gives each region a bounded responsibility without adding a UI library.

### 2. Fit the shell by platform and keep world scale independent

Retain `BrowserSurface` and `fitViewport`; support validated presets at 16:9 and 9:16. Automatic selection uses PC/mobile platform detection, not just a narrow desktop window. Centralize that detection: prefer an available mobile user-agent hint and a documented mobile-user-agent fallback; treat ambiguous large tablets as mobile only when the platform signal indicates mobile. Touch hardware alone does not turn a PC into a mobile layout. Provide a testable classifier rather than spreading detection across components. A developer-only PC override can switch the entire shell between both supported aspects for preview; it is session-only and unavailable as a player preference. Update project guidance so these two aspects remain the permanent supported game layouts.

Landscape uses CSS grid rows `4% 92% 4%`, with the middle columns giving each Info panel 22% of total shell width and assigning the residual to the world. Portrait uses `4% 46% 4% 46%` and orders regions 1,3,2,bottom. The lower area keeps its 46% shell-height budget. Its statusbar provides Control and Info buttons; the lower area displays either Mobile Controls or both information panels, starting on Control. The information panels scroll within the lower area. The world never chooses its zoom from these measurements. Vertically center all titlebar and statusbar content within its allocated region.

Only Log, equipment Slots, and Inventory use scrolling content. Other cards use compact container-relative sizing and bounded rows. Always-visible track treatment must remain visible even on platforms with overlay scrollbars. No page or panel-stack scrollbar is introduced to conceal overflow. Validate the complete portrait card stack before settling the provisional lower-area token.

Developer aspect preview is a session-only PC override gated by development mode or an explicit developer switch. Landscape places it at the right of statusbar 2. In portrait preview, a PC retains a developer return control outside the game statusbar. Preview is not a stored player preference.

Alternative: responsive breakpoint alone. It would turn a resized PC window into the mobile layout, conflicting with the platform requirement. Alternative: fitting the entire world into region 3. It would change tile scale on resize, conflicting with Zoom ownership. Portrait dedicates the bottom area to one selected content group so the movement controls retain their current layout while information can use the full area when requested.

### 3. Share a parameterized WorldRender and GPU owner

Extract the common tile/wall/entity traversal and placement into `src/content/world/WorldRender.js`, exposed as `WorldRender.Render(args)`. This interface accepts data and view options; it never advances game state. It feeds the same drawing algorithm into the game and minimap view instances.

```js
{
  target,                         // view's renderer/layers/surface resources
  map, entities, player,           // same committed realm data for both views
  viewport: { width, height, backingWidth, backingHeight },
  tileSize: 32,
  view: "game" | "minimap",
  camera: {
    mode: "center" | "deadzone" | "screen" | "full-map",
    position, pageOrigin, deadzoneWidthRatio: 0.3, deadzoneHeightRatio: 0.3
  },
  zoom,                           // user scale for game; independent fit for minimap
  detail: "full" | "simplified",
  palette,
  layers: { terrain, walls, objects, actors, lighting },
  visibility,
  markers: { player, enemies, items, exit }
}
```

There is no new fog-of-war system; visibility initially reflects the current game's revealed map. The minimap uses full-map framing, simplified low-resolution representation, and player/exit markers. Game Zoom does not feed its fit calculation. Reference colors are presentation arguments rather than different map logic.

Use one existing WebGPU engine/device for the game view and an auxiliary surface for the minimap, as supported by the installed SDK. Each view owns its layers/handles; shared textures/atlas lifetime belongs to the renderer owner. Resize, realm replacement, and cleanup update/dispose the proper view resources without recreating the entire engine.

The SDK projects sprite units into backing pixels, so normalize view zoom by the backing-to-CSS ratio: game view zoom is the selected user scale times that density ratio. A 32-unit tile therefore remains 32 CSS pixels at 1 regardless of DPR. Use backing dimensions for the SDK camera transform. Center follows every step; Deadzone lets the player move inside a centered rectangle 30% of visible width by 30% of visible height before scrolling; Screen stores a page origin and advances it by the visible world span. Screen paging never changes player world coordinates. While a mouse button is held, retain the selected world-cell coordinates and project that cell through the active camera transform so the reticle stays on the selection in Center, Deadzone, and Screen modes. Releasing the button returns to cursor hover selection. Resize or a camera-mode change recomputes framing without changing selected Zoom.

Alternative: independent minimap algorithm or static screenshot. It risks divergence from generated realms. Alternative: separate engine per view. Shared surfaces avoid duplicate GPU devices and textures and are supported by the verified version.

### 4. Make committed actions and raw events an application boundary

Split the current rule responsibilities into focused domain helpers for resources, inventory/equipment, abilities, and progression while retaining dungeon generation/collision/turn coordination in `dungeon.js`. A pure action resolver returns the next state plus an ordered set of raw domain events. It constructs no Log sentences.

A session controller serializes dispatch, assigns transaction/event IDs, commits player effects, advances one tick for accepted movement/attack/ability/slot drag, and runs one enemy phase. Publish raw events from the committed transaction through one event hub. Log, resource-animation, save-status, and other listeners subscribe independently. React reads committed snapshots; its rendering/effect replay does not publish the transaction again. A session-owned controller and subscription hook can use React's existing external-store support without an added state library.

Event envelope: stable `type`, `eventId`, `transactionId`, sequence, campaign identity, game time, source system, and typed facts. Event payloads carry IDs, names from item data, coordinates, costs, amounts, previous/new values, maxima, and causes. They do not contain a `message`, `logText`, or preformatted sentence. Accepted effects, rejected requests, and UI-only previews are distinct; only the first category can incur a tick. Sneak toggles a mode used by subsequent movement and does not add an extra tick itself.

| Domain event family | Representative facts |
| --- | --- |
| `player.moved`, `time.advanced` | from/to cells, previous/new time |
| `combat.hit`, `enemy.defeated` | attacker/target, damage, target Health, XP cause |
| `resource.changed`, `resource.maximum.changed` | resource, old/new amount or cap, causal item/action |
| `item.collected`, `item.collection.rejected`, `potion.consumed` | item/world position, destination or rejection reason |
| `equipment.changed`, `ability.assignment.changed` | item/ability, source/destination, before/after modifiers/bindings |
| `ability.used`, `action.rejected` | ability, Mana cost, target/effect or rejection reason |
| `xp.gained`, `xp.level.changed` | cause, amount, previous/new count/progress |
| `realm.entered`, `player.died`, `quest.changed`, `counter.changed` | realm/quest/counter identity and state change |
| `campaign.loaded`, `campaign.saved`, `campaign.save.failed` | campaign ID and structured storage outcome |

The Log system is a session-level subscriber with a pure selection/formatting policy table. It owns readable text, retention, and ignored event types. Initially it honors pickups, meaningful equipment/ability outcomes, combat results, progression, realm/death, objectives, and failures; routine movement/time and insufficient-Mana rejection are ignored. It runs even while the Log card is hidden. Persist derived Log entries and ordering IDs, not a complete raw-event journal. On resume display saved entries without replaying them through the policy.

Developer workflow: to suppress a log, change its policy only; the source event remains. To add coverage, reuse an adequate event or extend/add the responsible system's semantic event, then add its Log rule. No system accepts a `shouldLog` flag from the UI. Save subscriptions react to finalized action revisions, not every Log append; a save-failure event cannot trigger recursive autosaving. Project Log entries before writing the action's final snapshot. UI notification happens after that projection so users see one consistent state.

Alternative: append messages directly inside rules. It makes logging requests change gameplay modules and drops events other listeners need. Alternative: log generic state diffs. It loses semantic causes and reliable ordering. A typed event boundary preserves intent with a small synchronous hub rather than a full event-sourced architecture.

### 5. Store attributes, resources, items, and abilities explicitly

Campaign version 2 includes base/effective attributes, current Health/Stamina/Mana, derived Offense/Defense, grouped equipment, item instances with stable IDs, Inventory/capacity, four ability assignments, XP, world/realm/counters/objective, and retained Log. The five inactive attributes remain zero and are excluded from old combat/luck/descent-heal formulas. New-run inventory/equipment reset follows existing run-reset behavior; base attributes, XP, and ability bindings persist.

The bar has a common 0–100 capacity domain. Health 20 with a cap of 25 fills 20% of the bar and 80% of the allowed segment. This reconciles the maximum marker with fullness relative to the attribute. On maximum changes preserve `current / oldMaximum`, multiply by the new maximum, and handle zero without division. Offense/Defense always derive from the Stamina ratio. Meter state updates immediately; animation consumes `resource.changed` facts and runs on presentation time without game ticks. XP's cap is its full 100% range, with its count overlaid inside the bar.

Inventory has a provisional capacity of 10 individual entries, with equipped gear excluded; alphabetic ordering uses a stable ID tie-break for duplicate names. Inventory-to-equipment accepts compatible empty destinations. Drops onto occupied or incompatible equipment slots are rejected, leaving the item at its source; no swap prompt is shown. Rearranging already-equipped items within a group or populated ability positions swaps them atomically. Full Inventory leaves new ordinary world items uncollected and rejects drag-out. Potions bypass Inventory entirely.

Pointer events and pointer capture support the same drag model on desktop and touch. One drag context records source ID, original state, projected destination, and projected attributes. Attribute preview appears only while an item is over a compatible relevant slot; leaving that target clears the preview. Preview cannot mutate persistent state or emit committed domain events. Release validates the current item/destination/capacity again, submits one domain action, and restores white values. Escape, pointer cancellation, and return to source restore the original snapshot without a tick. Show a drag indicator and grab cursor only for rows that actually support dragging; empty slots show `+` as an available drop target without a draggable cursor.

Heal and Wand use data-defined Mana costs/effects. Ability key lookup reads current position, never a fixed ability ID. No Mana means a disabled row/button and silent rejection. Potions refill to maximum. Starting Stamina is 25; the provisional attack/move changes are −5/+10 as discussed. Other base values and spell payload strengths remain configurable tuning, not hidden constants in JSX.

Alternative: keep legacy anatomical positions and six stats. It would contradict the specified groups and inactive right column. Alternative: apply preview to real state then roll back. It risks saves/enemy calculations seeing tentative gear and violates the no-commit preview rule.

### 6. Separate Dungeon Level from persistent Difficulty

Store the current Dungeon Level on the generated floor and the hidden Difficulty with persistent character progression. Both start at 1. Entering an exit increments each once; use Difficulty, rather than the run-local Dungeon Level, when scaling generated enemies and other challenge data. On death, create a new Dungeon Level 1 layout and reset run Time, Inventory, equipment, current resources, and run counters. Keep base attributes, XP/character progression, ability bindings, and Difficulty. This follows Dead Cells' distinction between run-local state and retained difficulty progression while preserving the user's endless-dungeon rule that every exit deepens challenge.

For older saves that have no Difficulty field, initialize it from their stored floor depth where available so their existing challenge does not unexpectedly drop; otherwise default it to 1. Keep the field out of the player-facing UI, while showing Dungeon Level independently of the XP bar's character-level count.

### 6. Separate view preferences from Saved Games

Store a validated application preference record, for example `cryptbound.preferences.v1`, with `zoom`, `camera`, and `fullscreenDesired`. Restore before preparing the game view; use defaults 1, Center, and false for absent/invalid values. A compatible legacy Half/Native/Double preference can map to 0.5/1/2 if one exists; the inspected game currently holds Zoom only in React state.

Fullscreen has separate desired and actual states. A remembered true intent can request entry during a permitted post-load user gesture. Use `fullscreenchange` to reflect reality and user exits; do not claim fullscreen when entry was rejected. Keep intent on a blocked initial restoration, avoid repeat-request loops, and retain the titlebar Fullscreen action. Fullscreen must not alter game Zoom or write campaign state.

Settings uses `Dialog` focus management, clears held movement input on open/close, and routes only its own controls while focused. It adds no paused world flag: without accepted commands, the existing action-driven world naturally stands still. GitHub keeps `noopener noreferrer`; version is read from the root file. Save failure remains visible via a sticky error state.

Alternative: keep preference fields inside each campaign. That would restore different view settings merely by choosing another Saved Game and would not meet app-wide load/refresh restoration.

## Risks / Trade-offs

- [Small portrait area versus many non-scrolling cards] → Keep lists compact, bound the two scrollable primary cards, verify real content at narrow supported sizes, and tune only the provisional lower-area/typography tokens.
- [Fullscreen cannot be entered without browser permission] → Persist intent, reflect actual state, and request during a permitted gesture without blocking play.
- [Multiple view surfaces and subscription cleanup] → Share one engine owner; dispose per-view layers/surfaces and session listeners explicitly on realm/session lifecycle changes.
- [Re-rendered effects duplicate events, Log, or autosaves] → Dispatch through the serial session boundary with unique event IDs and deduplicating Log projection; never publish from render effects.
- [Persistent Difficulty could be confused with run depth or XP level] → Use separate stored values, label only Dungeon Level in the titlebar, keep Difficulty hidden, and use it only for world generation.
- [Old stats/positions cannot map one-to-one] → Preserve original storage, map active maxima and items deterministically, place extra legacy armor in Inventory, and report unsupported data instead of deleting it.
- [Dark empty space and a below-100 cap can be misunderstood] → Consistent color/marker treatment, accessible current/max descriptions, and review of the requested bar model before tuning values above the 0–100 domain.

## Migration Plan

1. Add pure version-1-to-2 migration and validation before changing campaign consumers. Keep the existing three storage identities and retain the original version-1 record under a backup key before the first successful version-2 write.
2. Preserve the legacy map, entities, position, Time, level/partial XP, and saved maximum/current Health. Convert the old Strength contribution to active base Offense, old Defense to active base Defense, and normalize Stamina to the new 25 cap while preserving its old fullness. Introduce Mana, abilities, counters, objective, and Log with documented defaults; force the five inactive attributes to zero.
3. Map old hand items to Weapons and body/head/legs items to Armor in deterministic order. Fill the two Armor positions and move any extra legacy armor into Inventory, preserving item IDs and effects. New-run balance defaults do not retroactively erase saved Health progression.
4. Discard legacy pending trait/equipment dialogs without granting a new choice. Leave any uncommitted found gear as world loot or collect it through the normal Inventory rule; never duplicate it. Do not display or replay the legacy formatted `message` string.
5. Introduce the action/event/session boundary and Log projection, then the resource/inventory/ability rules and React components. Replace `BabylonWorld` traversal with the shared renderer. Remove obsolete JSX, styles, imports, pending/Brace paths, corner instances, and technical controls after replacements are wired.
6. Update current guidance/context and focused tests before delivery. Keep existing corrupted-save and storage-failure behavior. A failed migration remains available for diagnosis rather than being overwritten with a new run.
7. Rollback uses retained legacy records for the previous build. Version-2 writes are not interpreted as version 1, and the backup is not deleted by normal save operations.

## Implementation Notes

The delivered layout uses the approved PC/mobile classifier and the development-only PC override; the project-specific exception is recorded in `cryptbound/AGENTS.md` and `cryptbound/documentation/layout-and-game-integration.md`. The current command desk uses reusable `GameScreen`, `TitleBar`, `StatusBar`, `Card`, and panel/item components. Keyboard movement tracks held WASD/arrow keys independently; Shift and right mouse share the fast repeat mode. The engine and shared textures are retained by the world-view owner, while each surface owns its renderer and layers. Raw domain events drive Log projection, resource gain highlights, and save status.

## Open Questions

These are tunable data/presentation values that can be settled after this proposal without changing component boundaries or requirement contracts:

- Final starting Health/Offense/Defense/Mana and spell costs/effect strengths; preserve observed legacy values during migration and configure new-game values centrally. Stamina 25 and right-column zeros are already settled.
- Exact portrait lower-area allocation, gain-animation duration, and Log retention limit; 46% lower area, roughly 300 ms, and 200 entries remain tunable presentation/retention values.
- Inventory capacity/balance and exact Sneak awareness/range tuning; the initial capacity example is 10 and Sneak uses the existing enemy-awareness model with a configurable reduced radius, without adding an independent timer or attack mode.
- Wand range/target preference and Heal amount can be tuned in the ability catalog. Initial implementation should reuse grid targeting with a deterministic nearest valid enemy for Wand and self-target for Heal, with no new aiming interface.
