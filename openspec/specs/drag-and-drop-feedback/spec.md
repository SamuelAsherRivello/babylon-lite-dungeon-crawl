# drag-and-drop-feedback Specification

## Purpose

Make item drag gestures legible through pointer-following, source, destination, and attribute-projection feedback before a drop is committed.

## Requirements

### Requirement: Show an active item under the pointer
Once an Inventory or equipment item passes the drag threshold, the interface SHALL show a non-interactive preview of that item following the active pointer. The preview SHALL remain visible over valid, invalid, and empty areas until the gesture ends.

#### Scenario: Begin an Inventory drag
- **WHEN** a player drags Wooden Stick from Inventory beyond the drag threshold
- **THEN** a preview identifying Wooden Stick follows the pointer and does not block target detection

#### Scenario: Drag an equipped item away from its row
- **WHEN** a player drags an equipped item beyond the drag threshold
- **THEN** its preview follows the pointer until release or cancellation

### Requirement: Distinguish a dragged source and valid destination
While an item drag is active, its originating Inventory row or equipment position SHALL show a departure state. A compatible available equipment position for an Inventory item, or Inventory with capacity for an equipped item, SHALL show a landing state while hovered. Invalid, occupied, incompatible, and full destinations SHALL not show a landing state.

#### Scenario: Hover an empty compatible weapon position
- **WHEN** Wooden Stick from Inventory is over an empty Weapons position
- **THEN** its Inventory row shows departure and that Weapons position shows landing

#### Scenario: Hover Inventory while carrying equipment
- **WHEN** an equipped item is over Inventory with available capacity
- **THEN** its equipment position shows departure and Inventory shows landing

#### Scenario: Hover a rejected destination
- **WHEN** an item is over an incompatible, occupied, or full destination
- **THEN** the source remains marked as departing but the destination has no landing state

### Requirement: Project attributes for a valid equipment transfer
While an Inventory item hovers a compatible available equipment position, the Attributes panel SHALL show the values resulting from enabling that item. While an equipped item hovers Inventory with capacity, it SHALL show the values resulting from removing that item. The projection SHALL clear outside a valid destination and shall not mutate campaign state, resources, saved state, or game time.

#### Scenario: Preview equipping Wooden Stick
- **WHEN** Wooden Stick hovers an empty Weapons position
- **THEN** Attributes show its projected modifier changes until the pointer leaves or the gesture ends

#### Scenario: Preview unequipping an item
- **WHEN** an equipped item hovers Inventory with capacity
- **THEN** Attributes show the projected values after removing that item until the pointer leaves or the gesture ends

### Requirement: Clear drag feedback after the gesture
On a valid release, invalid release, release at the source, Escape, pointer cancellation, or loss of the drag gesture, the interface SHALL remove the item preview, departure state, landing state, and projected attributes. Only a valid release SHALL perform the existing equipment transaction.

#### Scenario: Complete a valid equipment drop
- **WHEN** Wooden Stick is released over an empty Weapons position
- **THEN** all transient drag feedback clears and Wooden Stick appears in the position after the equipment transaction commits

#### Scenario: Cancel a drag
- **WHEN** a player presses Escape or the pointer is canceled during an item drag
- **THEN** all transient drag feedback clears and the campaign remains unchanged
