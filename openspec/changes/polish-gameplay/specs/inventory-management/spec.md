# Spec Delta

## Purpose

Manage world equipment, two-slot equipment groups, and drag previews so players can understand attribute changes before committing gear changes.

## ADDED Requirements

### Requirement: Find six equipment types in generated worlds
Generated realms SHALL place collectible swords, shields, daggers, chest plates, shirts, and pants. Each item SHALL belong to Weapons or Armors and SHALL carry data-defined attribute modifiers.

#### Scenario: Collect a world item
- **WHEN** the player enters a cell containing one of the six equipment types
- **THEN** the item enters Inventory and applies no attribute effect until equipped

#### Scenario: Equip an item
- **WHEN** an item is committed to a compatible empty equipment position
- **THEN** its modifiers affect the corresponding player attributes

### Requirement: Keep both equipment groups visible
The equipment view SHALL always display Weapons and Armors, each with two positions whether occupied or empty. Both groups SHALL accept compatible items in either position.

#### Scenario: Show empty groups
- **WHEN** no items are equipped
- **THEN** Weapons and Armors remain visible with two empty drop positions apiece

### Requirement: Preview attribute changes during equipment drags
Dragging an item into or out of equipment SHALL show projected attribute values before release. Increases SHALL be green, decreases red, and unchanged values retain the normal text color. Preview state SHALL NOT modify committed attributes or world time.

#### Scenario: Preview adding or removing gear
- **WHEN** a compatible item is dragged over a slot, or equipped gear is dragged out
- **THEN** the Attributes view shows the result of the proposed change before it is committed

### Requirement: Commit equipment drags once
A successful equip or unequip drop SHALL apply the item modifiers, update Inventory and equipment, clear the preview, and advance time exactly once. Returning a dragged item to its source, canceling, or making an invalid drop SHALL restore the original state and advance no time.

#### Scenario: Return to source
- **WHEN** an item is released back into its original Inventory row or equipment position
- **THEN** the drag cancels without changing attributes, equipment, Inventory, or time

### Requirement: Keep equipment and Inventory usable
The Slots and Inventory cards SHALL each show at least four item rows when their content area is available and SHALL provide their own visible vertical scrollbar when content exceeds that area.

#### Scenario: Scroll long item lists
- **WHEN** a group or Inventory contains more rows than its visible area
- **THEN** its own scrollbar reveals the remaining rows without hiding the other card
