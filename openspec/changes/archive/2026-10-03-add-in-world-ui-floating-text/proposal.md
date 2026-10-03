# Proposal

## Why

Combat currently changes Health and enemy HP without showing that change at the affected character in the dungeon view. Brief, color-coded floating text will make hits and healing immediately readable while keeping the world clear of persistent health bars.

## What Changes

- Show transient floating text in the world when the player's Health increases or decreases, using green for gains and red for losses.
- Show transient floating text at an enemy's world position when its health decreases, using red for damage.
- Do not add world-space health bars or persistent health indicators.
- Keep the feedback presentation-only; it does not change combat, health, turns, or the game log.

## Capabilities

### New Capabilities
- `world-floating-feedback`: Transient world-anchored text for player and enemy health changes.

### Modified Capabilities
- None.

## Impact

The gameplay event subscriber in `cryptbound/src/game/Game.jsx` and the Babylon Lite world projection/rendering in `cryptbound/src/content/BabylonWorld.jsx` and `cryptbound/src/content/world/WorldRender.js` are likely integration points. Existing `resource.changed` events identify player Health gains/losses, and `combat.hit` events identify enemy damage, including target position for ability hits. No new dependency or gameplay rule is required.
