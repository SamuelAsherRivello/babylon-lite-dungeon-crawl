# Design

## Context

See `proposal.md` for motivation and `specs/drag-and-drop-feedback/spec.md` for behavior. `Game.jsx` already owns pointer capture, DOM hit testing, committed drop dispatch, and attribute preview state. `inventory-drag.js` supplies pure action resolution and inventory-to-slot projection. The current pointer state is ref-only, so it cannot drive a cursor preview or CSS states, and slot-to-Inventory projection is not modeled.

## Goals / Non-Goals

**Goals:** Keep authoritative item movement in the existing domain actions while giving React enough transient state to render a pointer ghost, source departure, destination landing, and projected attributes. Use one shared validity/projection result for hover feedback and release-time revalidation.

**Non-Goals:** Change equipment compatibility, capacity, sorting, turn costs, save data, ability dragging, or within-group equipment reordering. The ghost is visual feedback only; it is not a second drag/drop protocol or a native browser drag image.

## Decisions

### Promote active presentation state after the existing drag threshold

Keep the pointer identity and capture metadata in a ref, but add React state only after the existing movement threshold is crossed. The state carries the item, primitive source identity, pointer coordinates, and current destination result. This avoids changing double-click behavior or showing a departure state for a press that never becomes a drag, while allowing rows and the overlay to rerender from one consistent snapshot.

Alternative: update only DOM classes from pointer handlers. That would split visual state from React and make cancellation/error cleanup fragile.

### Use one pure transfer description for hover and release

Extend the inventory-drag helper layer with a pure description of an item transfer at a concrete destination. It will report whether the destination is currently valid, the existing action to dispatch, and any projected attributes. The helper will include Inventory capacity when evaluating equipment-to-Inventory drops. Pointer movement uses the description for landing and projection; pointer release recomputes it before dispatching, so display and commit cannot diverge because state changed during a drag.

Alternative: retain separate preview and action branches in `Game.jsx`. That duplicates compatibility and capacity logic, which risks a green landing state that fails at release.

### Render a non-interactive fixed drag preview

Render one presentation-only item overlay from the active drag state. CSS positions it from client coordinates with a small pointer offset, gives it a clear elevated row treatment, and sets `pointer-events: none`; hit testing will therefore continue to find the actual slot or Inventory below it. Source rows and valid targets receive additive departure/landing classes without changing their contents or layout.

Alternative: use native HTML drag images. Native drag does not provide the same pointer/touch handling already used by the game and would bypass its cancellation and preview model.

### Limit this change to Inventory/equipment transfers

Inventory-to-slot and slot-to-Inventory flows gain the described feedback and projections. Existing ability and equipment-reorder gestures retain their current behavior, avoiding an unrequested expansion of visual semantics to unrelated controls.

## Risks / Trade-offs

- [High-frequency pointer updates can rerender the HUD] → Store only small presentation data, update it only after a drag begins, and keep rule computations pure and small.
- [Overlay can obscure a small target] → Offset the overlay from the pointer and disable its pointer events.
- [Inventory capacity can change before release] → Recompute the transfer description at release and clear feedback if it is no longer valid.
- [Scrollable cards and touch gestures can conflict] → Preserve the existing threshold, pointer capture, and cancellation behavior; verify a non-drag gesture still scrolls/clicks as it does today.

## Migration Plan

No migration is needed. The presentation state is session-only and introduces no persisted data. If a regression appears, removing the overlay and classes restores the previous drag behavior without affecting saves or domain actions.
