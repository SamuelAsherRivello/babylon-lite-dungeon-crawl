# Design

## Context

See `proposal.md` and `specs/tooltip-presentation/spec.md`. The browser surface places the game viewport beneath a React UI layer. `Game.jsx` owns React HUD composition and renders the player's six resources through `ResourceList` and `ResourceBar`. `BabylonWorld.jsx` owns the canvas host, mouse-to-grid targeting, camera/zoom transforms, and a React reticle overlay. The world projection identifies rat and skeleton sprites. The current character resource presentation combines stored Health, Stamina, and Mana with derived Offense, Defense, and XP; enemy records currently store `hp`, `maxHp`, `damage`, and `xp` directly.

## Goals / Non-Goals

**Goals:** Keep both tooltip presentations React-rendered; use one six-row resource model with independent entity-owned instances; reuse the player's visual resource presentation; keep world anchoring and collision decisions tied to the same projected grid geometry used for pointer targeting.

**Non-Goals:** Change the renderer, combat outcomes, enemy AI, game rules, or add a tooltip dependency. UI tooltips do not use world-grid placement constraints.

## Decisions

### Separate tooltip triggers from React presentation

Use a reusable React tooltip presentation for compact UI explanations and a distinct enemy panel presentation for world targets. UI elements trigger the former through pointer hover or keyboard focus. `BabylonWorld` supplies enemy identity and grid geometry to the latter when pointer targeting resolves an enemy cell. The canvas remains a renderer only; it does not draw tooltip content.

Alternative: draw enemy details in Babylon Lite. That duplicates UI styling and violates the confirmed requirement that all tooltip rendering use React.

### Give every entity its own resource record

Use the character's working six-row resource presentation as the common data shape, and give the player and every spawned enemy independent copies. The entity's resource record is authoritative for that entity's tooltip display; do not pass the player's resource record to an enemy panel. Update combat/resource projection and save loading as needed so enemy Health and other displayed resource values stay associated with their owner. Resource changes on one entity must not mutate another entity's record.

Alternative: synthesize enemy rows from the player's resource state at render time. That would show values owned by the wrong entity and would not provide per-enemy resource state.

### Keep the enemy panel's two sections visible together

Render a larger, side-by-side panel with a PORTRAIT section on the left and a RESOURCES section on the right. The portrait section contains only the enemy sprite. The resources section reuses the same six row names, order, icons, bar treatment, and spacing as the player's Resources tab, and reads the hovered enemy's own six-row resource record. Resource updates remain entity-local. This model integration does not by itself change enemy combat outcomes.

Alternative: make the two headings switch tabs. That contradicts the confirmed mockup interpretation that both labeled sections remain visible at once.

### Solve placement from measured rectangles

Measure the rendered panel and express the hovered grid spot, player grid spot, and visible game-world frame in one CSS-pixel coordinate space. Generate candidate panel rectangles near the hovered spot, reject any rectangle outside the frame or intersecting either protected grid rectangle, then choose a remaining candidate by proximity to the hovered spot. If there is no valid candidate, render no panel. Recompute after pointer target, viewport size, camera, or zoom changes.

Alternative: clamp a single tooltip point to the frame. Clamping alone can still overlap the player or hovered grid spot and cannot express the no-valid-placement behavior.

## Risks / Trade-offs

- [Existing enemy HP/damage/XP fields may diverge from the new resource records] → Make one entity-owned resource record authoritative and migrate saved enemies into it without losing current floor state.
- [Measured panel dimensions can change after content loads] → Recalculate placement after layout measurement and when the frame or target geometry changes.
- [A crowded area can leave no valid panel rectangle] → Hide the panel, as confirmed, rather than violating containment or protected-cell rules.
