# Original Game Request

## Initial request

Replace the template prompt with a 2D single-player dungeon-crawling roguelite. Save campaigns to local storage in three slots. Character stats improve over time and persist; each death starts a new procedural dungeon. Use the template's 2DPixelPerfect style and native 1.0 render scale so tiles retain their original crisp size. WASD moves one grid space at a time and advances the on-screen Time counter by one; enemies only move when time advances. Use the supplied Dungeons-and-Pixels-v1.4 assets for the hero, enemies, pickups, items, and environment.

## Follow-up decisions

- Medieval setting and endless descent, with stronger enemies deeper down; inspiration from Caves of Qud and Cogmind is limited to gameplay.
- Six persistent stats: Vitality, Strength, Defense, Stamina, Luck, Recovery. XP comes from enemies and discoveries; level-ups offer three choices; partial XP carries through death.
- Five equipment slots: Head, Body, Legs, Left Arm, Right Arm. Begin each run unequipped, with a stick nearby. If gear's slot is occupied, offer swap or leave. Both hands attack in one action.
- WASD and arrow keys are equivalent; keyboard and mobile support eight-way movement. Diagonals cannot cut corners.
- Keep the game in landscape. No orientation toggle. Offer Half, Native, Double zoom; Native is 1.0x.
- Bumping into enemies, stairs, items, and objects handles interaction. Stamina is used by Brace; Recovery heals on descent.
- Optional wall-autotile inspiration: the user's `underground-wall-autotile.js` neighbor-mask and sprite-frame mapping approach.

The superseded Pac-Man prompt was template input being replaced, not a game requirement.
