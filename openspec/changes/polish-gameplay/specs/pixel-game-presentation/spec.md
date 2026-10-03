# Spec Delta

## MODIFIED Requirements

### Requirement: Present a fixed landscape game viewport
The game SHALL select a landscape layout on Windows and a portrait layout on mobile, each filling the available viewport in its orientation. A development-only Aspect button SHALL switch between both complete layouts for preview without changing gameplay state.

#### Scenario: Open on Windows
- **WHEN** the game opens on Windows
- **THEN** it uses the landscape layout and fills the available landscape viewport

#### Scenario: Open on mobile
- **WHEN** the game opens on a mobile platform
- **THEN** it uses the portrait layout and fills the available portrait viewport

#### Scenario: Preview another layout in development
- **WHEN** a developer activates the Aspect button
- **THEN** the entire shell switches between landscape and portrait without changing campaign state

### Requirement: Display turn and game status
The primary viewport SHALL display the current time counter, health, depth, character attributes, equipment groups, Inventory, and the game's status panels without obscuring the playfield. Settings SHALL be available from the titlebar.

#### Scenario: Show turn counter
- **WHEN** the game is running
- **THEN** the HUD visibly reports the current time and updates it by one for each accepted turn

#### Scenario: Open Settings
- **WHEN** the player activates the titlebar Settings control
- **THEN** the centered Settings menu opens without advancing time

### Requirement: Keep the HUD readable and spaced
At the browser's default zoom, the HUD SHALL preserve the current text size and keep equipment labels and values distinct without overlap. Slots and Inventory SHALL each provide an independently scrollable area tall enough for at least four rows. Resource bars SHALL use reduced vertical spacing to preserve room for those areas.

#### Scenario: Read equipment and Inventory
- **WHEN** the HUD is shown in a supported layout
- **THEN** Slots and Inventory each display at least four rows where the viewport permits and each scroll independently when more rows exist

#### Scenario: Fit resources and equipment panels
- **WHEN** the landscape or portrait layout is shown
- **THEN** resource bars use compact gaps while Slots and Inventory retain their minimum row height and text size stays unchanged

## ADDED Requirements

### Requirement: Size titlebar and statusbar compactly
The titlebar and statusbar SHALL each use half their previous 8-percent height, while retaining the current interface text size.

#### Scenario: Render the compact bars
- **WHEN** either platform layout is displayed
- **THEN** the titlebar and statusbar each occupy 4 percent of the shell height and their text size remains unchanged

### Requirement: Give titlebar icons consistent hit areas
Zoom, Camera, Fullscreen, and Settings controls SHALL share the `title-bar-icon` visual treatment, with equal icon sizing and padding modeled on the existing Settings gear.

#### Scenario: Compare titlebar controls
- **WHEN** the titlebar is displayed
- **THEN** its four icon controls have matching icon size and padding
