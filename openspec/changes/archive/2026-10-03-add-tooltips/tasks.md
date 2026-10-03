# Tasks

## 1. UI tooltip

- [x] 1.1 Add a reusable React text tooltip for pointer-hovered and keyboard-focused UI elements; verify it stays fully inside the application viewport at each edge.
- [x] 1.2 Add focused checks for tooltip activation, dismissal, and edge repositioning; verify the UI tooltip remains a short, wide text presentation.

## 2. Enemy panel and data

- [x] 2.1 Refactor player and enemy state to own independent copies of the six-row resources model, migrate persisted enemy/player records as needed, and keep existing combat behavior intact; verify one entity's resource changes do not mutate another's.
- [x] 2.2 Render the always-visible PORTRAIT and RESOURCES sections in React, with only the enemy sprite in PORTRAIT and all six rows read from that enemy's resources instance; verify rat and skeleton portraits, values, and row order match the player style.
- [x] 2.3 Feed hovered enemy identity and grid geometry from world pointer targeting into the React panel; verify the panel appears only while an enemy grid spot is hovered and disappears when the pointer leaves.

## 3. In-world placement

- [x] 3.1 Implement placement from measured tooltip dimensions, hovered and player grid spot centers/extents, and game-world frame dimensions; verify the whole panel stays inside the frame and overlaps neither protected spot.
- [x] 3.2 Recompute placement on frame resize and camera/zoom changes, and hide the panel when no valid rectangle exists; verify each behavior with focused geometry checks.

## 4. Integration

- [x] 4.1 Verify both tooltip types render through React, reuse existing resource styling where specified, and leave renderer and gameplay outcomes unchanged.
