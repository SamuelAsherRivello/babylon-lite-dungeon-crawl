## MODIFIED Requirements

### Requirement: Content renderer preserves browser layout
The game renderer SHALL run within the viewport content layer, independently of React layout. Backing resolution and world Zoom SHALL not change viewport ratio, external gutters, or UI CSS geometry. The renderer SHALL not intercept input meant for the titlebar, statusbar, panels, or Settings.

#### Scenario: Renderer and UI composition
- **WHEN** world rendering runs in the game region
- **THEN** all primary UI stays within the fitted shell in windowed and fullscreen modes

#### Scenario: Corner interaction above content
- **WHEN** a player operates a replacement titlebar or Settings control
- **THEN** it remains reachable and world input does not consume that interaction

## REMOVED Requirements

### Requirement: Four operable corners
**Reason**: The user explicitly removed all four corner UI units from this game.
**Migration**: Move title and fullscreen to the game titlebar, Settings to a centered dialog, and source/version into that dialog; retain fitted viewport and gutters.

## ADDED Requirements

### Requirement: Keep replacement shell actions operable
The game shell SHALL own title, source link, version, Settings, and fullscreen actions without rendering any template corner unit. The source link SHALL retain protected new-tab behavior; version SHALL come from the root version source. Fullscreen state and preference SHALL synchronize with browser events and failures.

#### Scenario: Operate actions after removing corners
- **WHEN** the player enters fullscreen, exits it using browser controls, follows GitHub, or reads version
- **THEN** the replacement controls remain usable, fullscreen state stays accurate, the source link is protected, and version matches the root file
