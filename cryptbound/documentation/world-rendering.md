# World rendering and camera coordinates

`src/content/world/WorldRender.js` builds renderer-neutral terrain, actors, objects, and markers from one campaign floor. Game and minimap views use the same 32-unit world coordinates and wall-frame selection; view/detail arguments change presentation only. The minimap independently fits the full realm. It does not read game Zoom or Camera.

The game view uses Center, Deadzone, or Screen camera policies. Deadzone keeps the player within a centered rectangle 30% of the visible width and height. Screen pages use the visible world span and retain the player's actual world coordinates. Camera math and pointer-to-cell projection use the same world-center conversion. A held selection remains its original map cell and is reprojected as the camera follows; minimap has no pointer input or reticle.

Zoom presets are 0.25, 0.5, 1, 2, and 4. At 1, a 32-unit tile is intended to occupy 32 CSS pixels; renderer backing density is handled separately. Babylon Lite is WebGPU-only. Unsupported WebGPU surfaces display the existing initialization message and do not fall back to another renderer. Auxiliary canvas APIs available in the installed package include `createSurface`, `resizeSurface`, and `disposeSurface`; renderers may bind directly to a surface.
