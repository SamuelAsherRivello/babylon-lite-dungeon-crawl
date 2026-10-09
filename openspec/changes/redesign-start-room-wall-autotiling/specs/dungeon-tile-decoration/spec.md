# Spec Delta

## Purpose

Define deterministic, room-aware Tiled decoration for generated dungeon rooms while preserving Cryptbound's binary simulation map.

## ADDED Requirements

### Requirement: Decorate the start room from its geometric boundary
The game SHALL derive the start-room decoration from the generated walkable room boundary, assigning wall-face, edge, and corner art only to matching geometric roles. A blocked cell that does not serve that boundary SHALL NOT receive a start-room perimeter frame.

#### Scenario: Render a rectangular start room
- **WHEN** a new floor contains the central start room
- **THEN** the visible perimeter forms contiguous wall faces around its walkable interior
- **AND** each visible corner uses the matching corner art

### Requirement: Keep obstacle interiors visually distinct from room perimeters
The start-room perimeter SHALL NOT use Tiled frames whose authored purpose is an opaque interior void or obstacle center. Decorative layers SHALL NOT introduce black bands, columns, or gaps into the walkable start-room interior.

#### Scenario: Inspect the player-facing start room
- **WHEN** the player begins a seeded run
- **THEN** the chamber interior remains visibly walkable
- **AND** the boundary does not contain obstacle-center art facing that interior

### Requirement: Preserve simulation and seed determinism
Decoration SHALL be presentation-only: it SHALL NOT change walkability, pathfinding, entity placement, player start, exit reachability, saved campaign data, or the generated binary map. The same seed and floor level SHALL produce the same decoration plan.

#### Scenario: Compare two generated seeded floors
- **WHEN** two new campaigns are generated with the same seed and level
- **THEN** their binary maps and start-room decoration plans are identical
- **AND** their traversal outcomes remain unchanged
