# resource-meters Specification

## Purpose
Communicate current resources, attribute-defined limits, and resource changes through consistent meters, including stamina-dependent combat values and world potion pickups.

## Requirements

### Requirement: Order resource meters consistently
Resources SHALL contain Health, Stamina, Offense, Defense, Mana, and XP in that order. Each row SHALL contain an icon and a bar without a visible name or numeric label, except for the level number on XP. Accessible resource names and values SHALL remain available.

#### Scenario: Read Resources
- **WHEN** Resources is displayed
- **THEN** the six icon-and-bar rows appear in the specified order, and XP alone carries its level number

### Requirement: Show current resource and attribute maximum
Each non-XP resource SHALL have a maximum set by its matching attribute and a current amount between zero and that maximum. A bar SHALL represent the 0–100 domain, with a vertical marker at its current maximum, normal color to its current amount, and a dark variant in the remaining space. Full health SHALL mean the current amount equals the Health attribute.

#### Scenario: Attribute caps Health at 25
- **WHEN** the Health attribute is 25 and current Health is 20
- **THEN** the cap marker is at 25% of full bar width and normal fill ends at 20%, representing 80% of available Health

#### Scenario: Reach current maximum
- **WHEN** current Health reaches 25 with a Health attribute of 25
- **THEN** the normal fill reaches the cap marker and cannot exceed it

### Requirement: Preserve fullness when a maximum changes
When equipment changes a positive resource maximum, the system SHALL preserve the current-to-maximum ratio and bound current to the new maximum. A zero maximum SHALL produce zero current and SHALL NOT cause invalid arithmetic. Offense and Defense SHALL instead remain derived from Stamina.

#### Scenario: Reduce Health maximum
- **WHEN** equipment changes maximum Health from 25 to 10 while current Health is 20
- **THEN** current Health becomes 8, preserving 80% fullness

#### Scenario: Remove all maximum Stamina
- **WHEN** maximum Stamina becomes zero
- **THEN** current Stamina, effective Offense, and effective Defense are zero

### Requirement: Animate resource gains with a bright segment
Each meter SHALL derive normal, dark, and bright variants from one main color. A resource gain SHALL immediately update authoritative gameplay state, show the gained segment brightly, and animate the normal fill toward its new value without advancing world time.

#### Scenario: Collect a potion below maximum
- **WHEN** a potion restores Health from 15 to its maximum of 25
- **THEN** the gained 10-point segment appears bright before the normal fill grows over it, while gameplay already has 25 Health

### Requirement: Connect Stamina to combat resources
A new character SHALL start with a Stamina attribute and current Stamina of 25. Attacks SHALL reduce current Stamina and movement SHALL restore it, within its maximum. Effective Offense and Defense SHALL equal their respective maxima multiplied by current Stamina divided by maximum Stamina. Attack cost and movement recovery SHALL be configurable for later tuning.

#### Scenario: Combat effectiveness decreases
- **WHEN** maximum Stamina is 25 and current Stamina falls to 20
- **THEN** effective Offense and Defense become 80% of their respective attribute maxima

#### Scenario: Restore Stamina while walking
- **WHEN** movement restores more Stamina than the missing amount
- **THEN** Stamina stops at its attribute maximum

### Requirement: Collect potions directly into resources
Stepping onto a Health or Mana Potion below the matching maximum SHALL consume the world item and refill that resource to its current maximum without a prompt or Inventory entry. At that maximum the player SHALL be able to walk over the potion, leaving it uncollected. Mana and Health SHALL NOT regenerate merely from walking.

#### Scenario: Collect Mana Potion
- **WHEN** the player walks onto a Mana Potion with Mana below maximum
- **THEN** Mana refills, the potion leaves the world, and Inventory stays unchanged

#### Scenario: Walk over potion at maximum
- **WHEN** the player walks over a Health Potion at maximum Health
- **THEN** the player moves normally and the potion remains at its world position
