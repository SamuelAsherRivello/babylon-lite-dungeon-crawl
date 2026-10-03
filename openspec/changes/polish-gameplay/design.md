# Design

## Context

See `proposal.md` and the capability deltas for motivation and observable behavior. The current rule system is in `cryptbound/src/game/dungeon.js`; local campaign migration and persistence are in `saves.js`; `Game.jsx` owns the desktop session and UI composition. `BabylonWorld.jsx` owns one Babylon Lite view and currently computes reticle cells by flooring mouse offsets from the player-centered viewport. The renderer currently centers the player regardless of Camera selection. World generation uses fixed `W=40`, `H=20`, numeric per-floor RNG seeds, and one stairs entity drawn with an item sprite. Current CSS uses a fitted responsive shell, 4% title/status rows in landscape, independently scrollable Slots/Inventory content, and a developer Aspect label with no toggle.

The active `overhaul-command-desk-ui` plan is not implemented according to its task tracker, but overlaps this work and specifies a different death reset. Treat this change's confirmed death behavior and layout requirements as the current user direction; do not apply both task lists in parallel.

## Goals / Non-Goals

**Goals:** Keep gameplay state and procedural generation in the rule/save modules, keep drawing and pointer-to-grid projection in the Babylon Lite view, and keep layout, modal interactions, and previews in React UI. Preserve deterministic, replayable world generation across reloads and depths.

**Non-Goals:** Add a renderer fallback, change the asset pack, add online/multiplayer services, or remove the mobile Controls/Info interface. The unrelated request to remove bottom HUD UI is excluded.

## Decisions

### Run identity and generation

Represent a run with a readable eight-character seed token and a difficulty selection. Parse `randomSeed` from the URL only when creating a new campaign; a resumed save takes precedence. If absent or invalid, generate a random token. Hash the token into the existing deterministic numeric RNG domain and derive each realm's numeric seed from the run token and depth, so generation order and reloads do not affect later floors. Persist both run seed and difficulty with the campaign and migrate existing v2 saves by retaining their current floor while assigning a default difficulty and a root seed derived from the saved floor seed.

Use a fixed `64x48` tile map with the start at cell `(32,24)` and ensure generated rooms/corridors include that start. At 32 CSS pixels per tile, the landscape game region is approximately `34x31` tiles at 1920x1080; the portrait game region is approximately `19x25` tiles at 1080x1920. Both fit inside the fixed map with the player centered. Use the readable seed alphabet `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`, excluding the most visually ambiguous `I`, `O`, `0`, and `1`; accept case-insensitive input and display uppercase. Difficulty presets are Easy, Normal, and Hard, with their numeric values centralized for tuning.

Alternative: generate each descending floor from ambient randomness. That would make a seeded run impossible to replay. Alternative: seed only the first floor. That would not meet the user's full-run replay expectation.

### Keep realm transitions and death separate

Each generated floor keeps one reachable stairs/exit entity, rendered with a distinct visible exit appearance. Movement into its cell is the only action that creates the next realm. Death retains the current floor object and its seed/depth, moves the player to that floor's entrance, restores Health, and clears run Inventory and equipment. Persistent progression remains on the campaign. Ensure the reset does not accidentally regenerate the floor or route through new-campaign initialization.

Alternative: restart at Underground 1 after death. This matches the old canonical spec but contradicts the latest user decision and makes ordinary combat look like an unexpected realm transition.

### Make camera and reticle share one coordinate transform

Keep world-to-screen and screen-to-world conversion paired around tile centers. At 1x a world cell is 32 CSS pixels; the view transform accounts for DPR, selected Zoom, camera origin, and measured viewport. Convert a pointer point to the nearest grid center using rounded cell offsets, position the reticle at that same center, and send its selected world-cell coordinate to the movement controller. The pointer handler updates the reticle; input does not perform a second, independent conversion from raw mouse coordinates. Center, Deadzone, and Screen compute camera origins from committed player position and the viewport's visible cell span. Minimap remains full-map and independent.

Alternative: retain flooring from the player center. It biases selection toward one side of each tile and reproduces the screenshot's half-cell offset. Alternative: let the controller independently quantize the mouse. Two conversions can disagree at cell boundaries or after the camera moves.

### Keep equipment previews transient

Define six item records with a compatible group and attribute modifiers. Inventory and enabled equipment remain separate sources for computed attributes. During drag preview, compute the projected result from a copy and render only the projected values/colors; commit the rule action only on a valid drop. Track the source location so returning to it cancels, clears preview, and sends no turn. Keep the fixed two Weapons and two Armors positions visible even when empty.

### Fit platform layout without changing type scale

Keep the browser shell's established landscape and portrait fitted viewport modes and external gutter contract. Select Windows landscape and mobile portrait by platform; expose an ephemeral development-only Aspect toggle for preview. Retain current text sizing. Keep title/status rows at 4% each, reduce resource list spacing, and allocate independent four-row minimum scrolling regions for Slots and Inventory. Use a shared `title-bar-icon` rule for all four titlebar actions.

### Use one modal contract and one Log voice

Keep React as the owner of Settings/menu state. Dialogs remain centered, cover the viewport with a dark backdrop, and register Escape only when a close action exists. Escape closes the active closable menu without dispatching a gameplay action. Log formatting stays separate from raw gameplay events and consistently produces present-tense second-person sentences.

## Risks / Trade-offs

- [The fixed world may still fail to fill an unusually large viewport at 1x] → Confirm the supported viewport baseline before locking dimensions; keep size as one explicit generator configuration.
- [Seed parsing or migration could change existing saved floors] → Preserve each saved map/entity snapshot, migrate without regenerating it, and use the derived root seed only for future realms.
- [Camera movement can make a stationary pointer refer to a different world cell] → Recompute the reticle with the current camera transform before each input update and keep its grid cell authoritative.
- [Four visible rows consume scarce portrait panel height] → Compress resource gaps and retain independent scroll areas without reducing text size.
- [The existing active change overlaps these requirements] → Do not apply both plans concurrently; reconcile or supersede the overlapping tasks before implementation is complete.

## Migration Plan

1. Add a save migration that preserves current floor state and fills missing run-seed/difficulty fields with documented defaults; retain the original record until a migrated save succeeds.
2. Introduce root run identity and deterministic per-depth seed derivation before changing generation dimensions.
3. Update realm generation and death/exit transitions while preserving save compatibility.
4. Update rendering/pointer projection and then the React layout, menus, equipment rows, and Log presentation.
5. Update the browser title/favicon and project guidance to match the implemented platform layouts.

Rollback can continue loading the pre-migration save after restoring the prior build; keep the original save backup and avoid rewriting its floor during migration.

## Open Questions

- Difficulty baseline values can be tuned after the difficulty and depth-scaling behavior is in place.
- The favicon request said “2 scores”; this plan interprets it as two crossed swords.
