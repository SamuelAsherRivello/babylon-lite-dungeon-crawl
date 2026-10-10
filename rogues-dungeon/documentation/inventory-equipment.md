# Inventory and equipment

New campaigns carry up to 10 unequipped items. Ordinary world loot is collected directly into Inventory, displayed alphabetically by name then stable item ID. Equipped items do not count toward the Inventory total. A full Inventory leaves ordinary loot in its world position while movement continues.

Equipment has two Weapons and two Armor positions. Swords and shields share the Weapons group; armor items use Armor. Occupied destinations and incompatible groups reject drops. Equipment changes are atomic and cost one game tick only when accepted. Unequipping requires an available Inventory position. Reordering within one group is cosmetic and does not change combined modifiers.

Attribute preview is a pure projection shown only while a compatible item is over a usable equipment position. It clears on leaving the target, cancellation, invalid drop, or drag end. It never changes campaign or saved state before a valid drop commits.
