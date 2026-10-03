# game-integration-guidance Specification

## Purpose
Give template consumers a game integration guide distinguishing implemented browser layout and Babylon Lite showcase behavior from game-specific resolution and rendering choices.

## Requirements

### Requirement: Parameter and policy guidance
The guide SHALL distinguish browser shell/gutters, responsive React UI, world coordinates, user Zoom, and canvas backing resolution. It SHALL require the existing 2D Pixel Perfect policy and document Command Desk controls and shared world/minimap rendering as game integration behavior. Template showcase diagnostics SHALL not be described as active game UI.

#### Scenario: Consumer selects a policy
- **WHEN** a reader consults rendering guidance
- **THEN** the required Pixel Perfect policy and the distinction between game Zoom and backing resolution are explicit

### Requirement: Resolution vocabulary
The guide SHALL distinguish CSS size, logical resolution, internal render resolution, canvas backing resolution, and display size. It SHALL explain DPR-aware backing decisions without multiplying CSS layout or applying DPR twice and SHALL keep React UI independent of reduced game rendering resolution.

#### Scenario: Reduced game render resolution
- **WHEN** a consumer plans a reduced-resolution renderer
- **THEN** the guide requires an explicit mapping between internal render and backing dimensions while retaining independent CSS display and UI dimensions

### Requirement: Integer scaling contract
The guide SHALL describe directly declared logical resolution or derivation from tile size and grid dimensions, consistency checks when both are supplied, automatic or explicit positive integer display scales, pixel alignment, centered content, and internal letterbox background. It SHALL distinguish internal letterboxing from external browser gutters and define the coordinate domain of pixel-perfect guarantees.

#### Scenario: Tile grid calculation
- **WHEN** 32 by 32 logical-pixel tiles form a 10 by 18 grid displayed within a 640 by 1152 CSS viewport
- **THEN** the guide derives 320 by 576 logical dimensions and centered integer scale 2 without stretching

#### Scenario: Smaller screen
- **WHEN** no positive integer scale fits or an explicit scale exceeds the available viewport
- **THEN** the guide requires a documented nonzero fallback, proposes fractional fit with pixel-perfect guarantees suspended, and explains optional clipping or scrolling alternatives

#### Scenario: Fractional DPR
- **WHEN** integer CSS scaling maps to fractional physical pixels
- **THEN** the guide distinguishes logical-to-CSS guarantees from physical display guarantees and does not promise universal physical pixel perfection

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

### Requirement: Showcase and renderer handoff are explicit
Game guidance SHALL identify the Babylon showcase as an example rather than gameplay, require implementation of the requested scene including for 3D, and describe Babylon Lite as WebGPU-only with no fallback renderer.

#### Scenario: WebGPU is unavailable
- **WHEN** a game uses Babylon Lite and WebGPU is unavailable or initialization fails
- **THEN** the game displays a clear unsupported-browser message without substituting a fallback renderer

#### Scenario: Game replaces the showcase
- **WHEN** a game is built from the template
- **THEN** the showcase is replaced by the requested game content and a selected 3D style receives its own scene and renderer setup

### Requirement: Game rendering choices are explicit
Every 2D game SHALL use the Pixel Perfect policy. Each game SHALL choose its own logical resolution and render scale; neither is prescribed by the showcase dimensions.

#### Scenario: 2D game selects dimensions
- **WHEN** an agent implements a 2D game
- **THEN** it uses Pixel Perfect and chooses logical resolution and render scale to fit the game's content

### Requirement: Game viewport and gutter roles are clear
Game guidance SHALL prioritize the viewport for primary content in both windowed and fullscreen modes, require the template gutter layout, and make secondary gutter content optional.

#### Scenario: Game uses optional gutter content
- **WHEN** a game has secondary instructions, design elements, or backstory
- **THEN** it may place that material in a gutter while keeping primary content in the viewport

### Requirement: Game scrolling is project-defined
Game guidance SHALL leave each game free to choose whether content scrolls and how scrolling is implemented.

#### Scenario: Game chooses scrolling behavior
- **WHEN** an agent implements game content movement
- **THEN** it uses the scrolling or non-scrolling behavior appropriate to the game design

### Requirement: Game sound is optional and controllable
Game guidance SHALL make sound optional, recommend 4 to 10 event-based sound effects when sound is used, discourage music by default while allowing a project to intentionally request restrained, sourced music, and require both a UI mute control and a documented URL argument that mutes all sound. It SHALL recommend the `?mute=1` query argument for silent AI testing.

#### Scenario: Silent AI testing
- **WHEN** a game includes sound and is opened with `?mute=1`
- **THEN** all game sound is muted while the normal human-player experience can enable sound through the UI

#### Scenario: Project intentionally includes music
- **WHEN** a game has a project requirement for music
- **THEN** its guidance permits sourced, restrained music while retaining independent user control and a silent AI testing option
