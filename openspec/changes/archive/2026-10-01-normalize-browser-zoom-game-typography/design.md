# Design

## Context

See proposal.md - Why. The HUD currently sizes much of its text with container query units, while the template corners use point units. Container-relative font sizes counter browser zoom; point-sized corner text grows, so the two areas diverge.

## Goals / Non-Goals

**Goals:** Use one browser-zoom-responsive text sizing model, reduce the default UI scale, add row and group spacing, and keep the game content from colliding with corner elements.

**Non-Goals:** Change the Babylon scene's logical render target, tile size, or the game's Half/Native/Double world zoom setting.

## Decisions

- Use `rem`-based typography for the HUD and template corner labels. This follows browser zoom consistently instead of tying glyph size to the shrinking CSS viewport.
- Use flex/grid sizing, wrapping, and line-height/gap spacing for HUD composition. Keep container-relative dimensions only for layout geometry and canvas placement.
- Render equipment labels and values as separate elements so CSS can maintain a readable gap and align values consistently.
- Leave `BabylonWorld` render-target and view-centering logic unchanged.

## Risks / Trade-offs

- At high browser zoom, the fixed 16:9 game viewport has less CSS space and some labels will wrap. Responsive wrapping and scrollable HUD regions mitigate crowding without resizing the Babylon render target.
