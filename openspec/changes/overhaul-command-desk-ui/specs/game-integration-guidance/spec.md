## MODIFIED Requirements

### Requirement: Parameter and policy guidance
The guide SHALL distinguish browser shell/gutters, responsive React UI, world coordinates, user Zoom, and canvas backing resolution. It SHALL require the existing 2D Pixel Perfect policy and document Command Desk controls and shared world/minimap rendering as game integration behavior. Template showcase diagnostics SHALL not be described as active game UI.

#### Scenario: Consumer selects a policy
- **WHEN** a reader consults rendering guidance
- **THEN** the required Pixel Perfect policy and the distinction between game Zoom and backing resolution are explicit

### Requirement: Future renderer integration responsibilities
Source comments and linked documentation SHALL describe renderer lifecycle, camera/resize, nearest filtering, mipmaps, anti-aliasing, DPR sizing, WebGPU support, and independent React composition. They SHALL document shared game/minimap rendering and actual developer controls rather than removed showcase labels or outlines. Verified APIs SHALL be distinguished from future integration choices.

#### Scenario: Renderer handoff
- **WHEN** a maintainer reads integration guidance
- **THEN** it explains shared view rendering, disposal, resize without tile auto-fit, and WebGPU-only initialization using verified project capabilities

### Requirement: Game orientation is singular
Guidance SHALL document this game's explicitly requested platform-specific 16:9 PC and 9:16 mobile layouts as an exception to the inherited singular-orientation template rule. Players SHALL not choose orientation. Desktop developer preview SHALL be distinguished from a player preference, with square excluded for the game.

#### Scenario: Game adapts the template orientation
- **WHEN** an agent adapts or maintains this game
- **THEN** it preserves automatic platform selection and the developer-only preview rather than restoring landscape-only behavior
