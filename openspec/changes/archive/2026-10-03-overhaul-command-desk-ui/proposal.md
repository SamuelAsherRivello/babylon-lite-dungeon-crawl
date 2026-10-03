# Proposal

## Why

The current game combines its HUD, touch controller, and modal decisions in one landscape view, while the template corners duplicate controls around it. Replace that interface with the Command Desk layout so PC and mobile expose the same game state, inventory, and abilities in dedicated landscape and portrait compositions.

## What Changes

- **BREAKING:** Support fitted 16:9 landscape and 9:16 portrait shells. Select the usual aspect from PC/mobile platform; expose a PC-only developer override to preview either aspect. Remove all four game template corners.
- Implement regions 1–6: titlebar and statusbar each consume 4% of shell height; landscape secondary and primary panels each consume 22% of shell width; the game view fills the remaining region. Portrait orders titlebar, game view, statusbar with Control/Info buttons, and a 46%-height lower area that displays either the controls or both information panels. Start on Control. Center titlebar and statusbar content vertically.
- Add the titlebar title `Dungeon Roguelite (DR)`, world/Dungeon Level, time, keys, gold, icon-only Zoom/Camera/Settings controls, and Fullscreen. World is One; Dungeon Level starts at 1 and increases at each exit. Center world/Level within the space between title and time; keep Difficulty hidden.
- Add Zoom presets 0.25, 0.5, 1, 2, 4 and Center/Deadzone/Screen cameras, defaulting to 1 and Center. Persist Zoom, Camera, and desired Fullscreen in localStorage and restore them on load/refresh, respecting browser fullscreen gesture requirements.
- Extract shared `WorldRender.Render(args)` for the game view and low-resolution minimap; both use the same map traversal, geometry, and entity placement with different arguments. Resizing the game view changes visible world bounds, not the selected tile scale.
- Add `SecondaryInfoPanel` with minimap, plain-text Quest, and retained Log; add `PrimaryInfoPanel` with Resources, Attributes, Abilities, Slots, and Inventory. Card titles interrupt the top border. All item entries are full-width horizontal rows. Only Log, Slots, and Inventory have scrolling areas and always-visible scrollbar tracks.
- **BREAKING:** All major game systems emit relevant structured domain events rather than log text. A central Log system subscribes to those events and owns selection, formatting, and ignore rules. Removing a log rule keeps its source event intact; adding log coverage adds or extends the source event first when necessary. Remove direct status-message rendering, including legacy text such as `Iron Sword left behind.`
- **BREAKING:** Replace the six active legacy stats with active Health, Stamina, Offense, Defense, and Mana, plus inactive Vitality, Strength, Luck, Recovery, and Agility at zero. Resources show those first five in the same order, then XP. Resource meters have current value, attribute-defined maximum marker, dark unused space, and a bright gain segment that animates into the normal fill.
- **BREAKING:** Pick up equipment into alphabetized Inventory without prompting or equipping. Manual compatible slot drags enable item effects; drops onto occupied or incompatible slots are rejected. Show projected attribute values only while an item is being dragged over a relevant compatible slot. Empty slots display `+`; drag cursors and indicators appear only on rows that are actually draggable. Inventory titles show current/max carry, such as `Inventory 07/10`.
- Provide Weapons and Armor equipment groups with two positions each. Positions within a group have no independent stat effect. Ability position controls the 1–4 key binding; initially populate Heal and offensive Wand, with two empty positions. Ability rows show `[01] icon title mana-cost drag-icon`, without a Mana icon. Insufficient Mana greys the ability out and prevents activation without a message.
- Health and Mana potions refill their matching resource directly when collected; when that resource is full, the potion remains on the map. These resource pickups do not enter Inventory.
- **BREAKING:** Remove level-up trait prompts, gear replacement prompts, Brace, discovery XP, the technical render-resolution readout, the floor label, the separate message strip, and the menu tagline. Award XP on enemy attacks and kills; show its level number only on the XP bar, starting at 01 and advancing as the bar fills.
- Advance exactly one time unit for accepted movement, attacks, abilities, and completed slot drags. Enemies act once after a tick. Settings adds no separate pause state. Layout changes, settings changes, drag previews/cancellation, and rejected actions do not tick time.
- Track Dungeon Level separately from persistent character progression and hidden Difficulty. Dungeon Level starts at 1 and increases after each exit; Difficulty starts at 1, increases on each exit, is saved with progression, and determines generated challenge. Death starts a new Level 1 dungeon and resets run Time, items, equipment, and run counters while retaining character progression and Difficulty.
- Center, Deadzone, and Screen camera modes project the selected grid cell consistently. While a mouse button is held, keep its selected world cell highlighted under the reticle as the view moves; release returns to hover selection. Deadzone allows free player movement within a centered rectangle covering 30% of the visible width and 30% of the visible height before scrolling the world.
- Vertically center statusbar content within its region.
- Add centered Settings with vertical actions, Save & Return to Main Menu, non-clickable root version text (currently v0.0.5), and a plain GitHub source button. Keep three independent campaigns, now labelled `3 Saved Games`, with realm/XP summaries and save-failure handling.

## Capabilities

### New Capabilities

- `resource-meters`: Attribute-capped resource values, visual maximum markers, gain animation, stamina-dependent offense/defense, and direct resource potion pickups.
- `inventory-management`: Capacity, alphabetic item lists, compatible equipment groups, Slot Drag Preview, and drag commits/cancellation.
- `player-abilities`: Four assignable ability positions, Mana costs, disabled affordances, and keyboard/touch activation.
- `world-map-rendering`: Shared WorldRender argument contract, minimap rendering, and the three camera behaviors.
- `game-events`: Structured events across major game systems and a centralized, independently configurable Log projection.

### Modified Capabilities

- `pixel-game-presentation`: Platform layouts, region dimensions, panels/cards, list components, control placement, and removed HUD features.
- `character-progression`: Ten attributes, revised XP sources/display, grouped manual equipment, retained progression and Difficulty on death, and removal of Brace/trait selection.
- `dungeon-turns`: Tick semantics for abilities/equipment, grouped weapon handling, and separate Level/Difficulty progression.
- `campaign-saves`: Saved Games terminology, expanded campaign persistence including Difficulty and Dungeon Level, legacy save migration, and application view preferences.
- `babylon-render-resolution`: Five user Zoom scales, tile sizing independent of region resizing, and removal of template render diagnostics.
- `browser-template-layout`: Game-specific replacement of the four corners while retaining fitted viewport, gutters, and fullscreen/link/version behavior.
- `game-integration-guidance`: Document this game's platform layouts, shared renderer, selected zoom, and replacement of legacy template UI.
- `template-ai-guidance`: Reconcile inherited single-orientation instructions with the explicit platform-responsive game requirement.

## Impact

Implementation touches `cryptbound/src/game/Game.jsx`, `dungeon.js`, and `saves.js`; reusable UI under `cryptbound/src/ui/`; rendering under `cryptbound/src/content/`; and related styles, documentation, project guidance, and existing tests. The current version-1 saves require a non-destructive versioned migration to the new attributes, inventory, groups, abilities, and log. React 19, Vite 8, Babylon Lite 1.32.0, the existing art pack, WebGPU-only support, repository root, Vite root, and deployment base remain the verified foundation; no new dependency is required by this plan.

Acceptance requires both aspect compositions, visible portrait controls with information panels accessible below them, stable zoom during resize/fullscreen, mirrored map content, held reticle tracking in every camera mode, working compatible-slot previews and keyed abilities, one tick per committed action, and successful save/preference restoration. Balance values, spell payload tuning, exact portrait space allocation, gain animation, and Log retention remain tunable values identified in the design.
