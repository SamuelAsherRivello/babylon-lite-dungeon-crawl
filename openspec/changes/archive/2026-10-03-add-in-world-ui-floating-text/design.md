# Design

## Context

See `proposal.md` for motivation and `specs/world-floating-feedback/spec.md` for observable behavior. Gameplay transactions already emit structured `resource.changed` facts for the player's Health and `combat.hit` facts for enemy damage. React subscribes to committed events, while `BabylonWorld` owns the Babylon Lite sprite scene and world-to-screen camera transform.

## Goals / Non-Goals

**Goals:** Convert committed health-change events into short-lived presentation messages and render them in world coordinates so they track the affected actor through camera movement.

**Non-Goals:** Change damage/healing rules, add persistent health UI, or add text to the React HUD or gameplay log.

## Decisions

- Keep event interpretation in the React/game integration layer and pass a small list of transient text effects into `BabylonWorld`. Render the text as an HTML overlay within the world container, using the same camera and zoom projection as the sprites. This avoids adding a font asset or a second renderer pass while keeping combat rules renderer-independent.
- For player Health, derive the displayed delta from `resource.changed` previous/current values, filtering to the Health resource. For enemy damage, use `combat.hit` damage and target identity/position; add missing target facts to any event source if needed during implementation, without changing outcomes.
- Render effects as text-only HTML overlays above the actor position. Use the same world-to-screen conversion as sprites so camera mode and zoom stay aligned. Use green for positive player Health deltas and red for negative player deltas or enemy damage.
- Give each effect a finite lifetime and upward motion, then remove it from the renderer's active set. On enemy death or player respawn, retain its captured world position for the effect's remaining lifetime so the feedback is not lost when the actor is removed or moved.
- Keep colors and duration as presentation constants; do not introduce a dependency or health bar primitives.

Alternatives considered: Babylon Lite's native text renderer needs a font asset and a separately managed rendering context; using it would add asset and compositing complexity for brief labels. A health-bar overlay would violate the text-only request and add persistent visual clutter.

## Risks / Trade-offs

- [CSS text may look less pixel-art-like than the sprites] → Use a compact monospace face, pixel-centered actor coordinates, and strong contrast against the world.
- [Multiple hits can overlap] → Offset concurrent effects slightly while preserving their shared actor anchor.
- [Health change events can arise during death reset] → Filter semantic events so only actual committed Health gains/losses produce feedback; define death/respawn transition handling alongside event inspection.
