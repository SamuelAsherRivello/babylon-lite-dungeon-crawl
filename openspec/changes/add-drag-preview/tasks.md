# Tasks

## 1. Transfer feedback model

- [x] 1.1 Extend the pure inventory-drag helper with a shared valid-transfer description for Inventory-to-equipment and equipment-to-Inventory, including projected attributes and capacity checks; verify focused `cryptbound/test/game.test.mjs` cases cover valid, incompatible, occupied, and full destinations without mutating the campaign.
- [x] 1.2 Preserve release-time validation by deriving the dispatched existing equipment action from that same transfer description; verify valid transfers still cost one tick and canceled or invalid transfers cost none in `cryptbound/test/game.test.mjs`.

## 2. Drag presentation

- [x] 2.1 Add threshold-gated React drag presentation state that records the dragged item, source identity, pointer position, and valid hovered destination; verify pointer move, Escape, pointer cancel, and release all clear presentation and attribute projection without changing a non-drag click.
- [x] 2.2 Render a non-interactive cursor-following item preview plus departure and landing states for Inventory/equipment transfers; add focused UI assertions in `cryptbound/test/page.test.mjs` and style the states in `cryptbound/src/ui/style.css` without changing card layout.
- [x] 2.3 Connect valid hover descriptions to the Attributes panel for both equip and unequip projections; verify the source and destination visual states, ghost, and attribute projection clear after a valid or invalid drop.
- [x] 2.4 Make every populated equipment row, not only its grip icon, a drag source; verify `cryptbound/test/page.test.mjs` covers the full-row source metadata.

## 3. Integration verification

- [x] 3.1 Run `npm test` and `npm run build`; manually verify a Wooden Stick drag to an empty Weapons position and an equipped-item drag back to Inventory show the ghost, departure, landing, and projected attributes before committing.
