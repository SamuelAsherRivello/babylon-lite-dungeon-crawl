# babylon-render-resolution Specification

## Purpose

Provides a runtime-selectable Babylon Lite render resolution independent of game logical coordinates. It keeps the same 2D world view while making resolution and nearest-neighbor presentation behavior visible and adjustable.

## Requirements

### Requirement: Logical resolution independent of render resolution
World coordinates SHALL remain in 32-pixel tile units independently of canvas backing resolution. User Zoom SHALL intentionally change displayed tile size and camera framing. Internal backing resolution or DPR changes SHALL not change game coordinates or the selected CSS tile scale; game-region resizing SHALL change available visible bounds rather than auto-fitting the world.

#### Scenario: Render target changes while playing
- **WHEN** backing resolution or display density changes with Zoom unchanged
- **THEN** world positions and tile size in CSS pixels remain unchanged

#### Scenario: Game region is resized
- **WHEN** region 3 becomes narrower at Zoom 1
- **THEN** tiles still occupy 32 CSS pixels and fewer world columns are visible

### Requirement: Nearest-neighbor presentation
The selected internal render target SHALL be presented into the native backing buffer using nearest-neighbor sampling when its dimensions differ from the native backing dimensions. This behavior SHALL retain hard, intentionally jagged pixel-art edges when enlarging or reducing the rendered image.

#### Scenario: Smaller render target is enlarged
- **WHEN** the half-native render target is selected
- **THEN** its output is enlarged into the native backing buffer with nearest-neighbor sampling and no blended edge colors

#### Scenario: Larger render target is reduced
- **WHEN** the double-native render target is selected
- **THEN** its output is reduced into the native backing buffer with nearest-neighbor sampling and no blended edge colors

### Requirement: WebGPU render-target limits
Backing targets SHALL respect the active WebGPU device's texture limits while preserving aspect ratio and selected user Zoom. An internal target cap SHALL not replace the user's tile scale or add a technical resolution readout. Rendering SHALL remain WebGPU-only with the existing clear unsupported-browser message.

#### Scenario: Double target exceeds device texture limit
- **WHEN** an internally requested target exceeds the device limit
- **THEN** it is safely capped with selected Zoom unchanged and no fallback renderer

### Requirement: Provide five tile-relative Zoom presets
Game Zoom SHALL offer 0.25, 0.5, 1, 2, and 4, where 1 displays a 32 by 32 tile at 32 by 32 CSS pixels. Selecting a preset SHALL be independent of layout, viewport fit, fullscreen, and minimap fit. Unsupported stored values SHALL fall back to 1.

#### Scenario: Select a preset
- **WHEN** a 32-pixel tile is viewed at the five supported presets
- **THEN** its CSS size is respectively 8, 16, 32, 64, or 128 pixels on each axis
