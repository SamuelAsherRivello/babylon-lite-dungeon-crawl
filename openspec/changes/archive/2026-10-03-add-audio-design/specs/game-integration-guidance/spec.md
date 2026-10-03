# Spec Delta

## MODIFIED Requirements

### Requirement: Game sound is optional and controllable
Game guidance SHALL make sound optional, recommend 4 to 10 event-based sound effects when sound is used, discourage music by default while allowing a project to intentionally request restrained, sourced music, and require both a UI mute control and a documented URL argument that mutes all sound. It SHALL recommend the `?mute=1` query argument for silent AI testing.

#### Scenario: Silent AI testing
- **WHEN** a game includes sound and is opened with `?mute=1`
- **THEN** all game sound is muted while the normal human-player experience can enable sound through the UI

#### Scenario: Project intentionally includes music
- **WHEN** a game has a project requirement for music
- **THEN** its guidance permits sourced, restrained music while retaining independent user control and a silent AI testing option
