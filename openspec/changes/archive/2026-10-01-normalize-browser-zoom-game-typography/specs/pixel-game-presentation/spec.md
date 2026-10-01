## ADDED Requirements

### Requirement: Scale interface typography consistently with browser zoom
All game interface text, including template corner labels, SHALL respond consistently to browser zoom. The Babylon world SHALL retain its selected render resolution independently of browser text zoom.

#### Scenario: Zoom the browser page
- **WHEN** the player changes browser zoom
- **THEN** all interface text scales consistently while the Babylon world keeps its selected Half, Native, or Double render resolution

### Requirement: Keep the HUD readable and spaced
At the browser's default zoom, the HUD SHALL use compact, readable text with visible spacing between information rows and controls. Equipment labels and values SHALL remain visually distinct, and HUD text SHALL not overlap the game header, corner labels, or other controls.

#### Scenario: Read the HUD at default browser zoom
- **WHEN** a game is displayed at 100% browser zoom
- **THEN** its status, traits, equipment, and controls use a reduced type scale with clear spacing and no overlapping text

#### Scenario: Narrow viewport from browser zoom
- **WHEN** browser zoom reduces the available CSS viewport width
- **THEN** HUD text and equipment rows wrap or reflow while retaining their spacing and remaining available without overlap
