# pixel-game-presentation Specification

## Purpose

Defines a readable, crisp landscape game presentation and consistent keyboard, mobile, and zoom controls for the dungeon experience.

## Requirements
### Requirement: Present a fixed landscape game viewport
The game SHALL use a 16:9 landscape viewport and SHALL NOT expose an orientation toggle.

#### Scenario: Render on mobile
- **WHEN** the game is opened on a portrait-oriented mobile device
- **THEN** the game remains landscape and its primary viewport remains usable

### Requirement: Render native-size pixel artwork
The 2D world SHALL use Pixel Perfect rendering with nearest sampling, 32 by 32 pixel Tiled artwork at native scale by default, and user-selectable Half (0.5x), Native (1.0x), and Double (2.0x) zoom levels.

#### Scenario: Native zoom
- **WHEN** Native zoom is selected
- **THEN** each world tile renders at its original 32 by 32 pixel size in the logical render target

#### Scenario: Change zoom
- **WHEN** the player selects Half or Double zoom
- **THEN** the world render scale changes to the selected level while preserving crisp pixel edges

### Requirement: Support eight-way keyboard movement
The game SHALL accept WASD and arrow keys as equivalent movement controls, including diagonal movement from paired direction keys.

#### Scenario: Move with keyboard
- **WHEN** the player presses a cardinal or diagonal keyboard direction
- **THEN** one corresponding grid movement request is sent

### Requirement: Provide mobile eight-way movement
Touch-capable play SHALL show an on-screen eight-way virtual controller that sends the same grid movement requests as the keyboard.

#### Scenario: Move with virtual controller
- **WHEN** the player presses a direction on the virtual controller
- **THEN** one corresponding grid movement request is sent

### Requirement: Display turn and game status
The primary viewport SHALL display the current time counter, health, depth, six stats, equipment, and actionable level-up or item decisions without obscuring the playfield.

#### Scenario: Show turn counter
- **WHEN** the game is running
- **THEN** the HUD visibly reports the current time and updates it by one for each accepted turn
