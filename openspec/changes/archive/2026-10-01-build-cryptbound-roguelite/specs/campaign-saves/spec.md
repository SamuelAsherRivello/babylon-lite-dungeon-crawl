# Spec Delta

## Purpose

Lets players maintain three independent local campaigns and reliably resume the full active dungeon run after closing or reloading the game.

## ADDED Requirements

### Requirement: Provide exactly three independent save slots
The game SHALL expose exactly three local save slots, with each slot storing a separate campaign and no account or network dependency.

#### Scenario: Choose a slot
- **WHEN** the player opens campaign selection
- **THEN** exactly three slots are available and each shows whether it contains a campaign

#### Scenario: Keep slots independent
- **WHEN** the player saves progress in one slot
- **THEN** the other two slots retain their own campaign data unchanged

### Requirement: Autosave and resume complete runs
The selected slot SHALL autosave the complete active campaign after every accepted turn and SHALL restore the saved campaign after reload, including the current floor state.

#### Scenario: Resume after reload
- **WHEN** the player reloads the game and selects a populated slot
- **THEN** the same floor, player position, enemies, items, time, gear, and persistent progression are restored

#### Scenario: Save after a turn
- **WHEN** one accepted player turn resolves
- **THEN** the selected slot contains the resulting complete run state

### Requirement: Handle unavailable local storage
If localStorage cannot be read or written, the game SHALL present a clear save error and SHALL keep the current campaign playable for the current page session.

#### Scenario: Storage write fails
- **WHEN** the browser rejects a save write
- **THEN** the player sees that progress could not be saved and can continue the active session
