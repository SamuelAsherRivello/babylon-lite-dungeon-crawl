# Spec Delta

## ADDED Requirements

### Requirement: Identify the game in browser chrome
The browser tab title SHALL match the game's displayed title, and the favicon SHALL use the game's two-sword icon.

#### Scenario: Open the game
- **WHEN** the game is open in a browser tab
- **THEN** the tab title matches the in-game title and the tab shows the game favicon

### Requirement: Center and dismiss closable menus
Menus that overlay gameplay SHALL be centered in the viewport over a backdrop that visibly darkens the full viewport. A menu with a close button SHALL also close when Escape is pressed.

#### Scenario: Close Settings with Escape
- **WHEN** Settings is open and has a close button
- **THEN** pressing Escape closes Settings without advancing game time

#### Scenario: Dim the viewport behind a menu
- **WHEN** an overlay menu is open
- **THEN** its backdrop covers and darkens the complete game viewport
