# Abilities and Sneak controls

Four positional bindings appear as 01–04 and map to keyboard keys 1–4 and the matching mobile buttons. New games bind Heal, then Wand, then two empty positions. A drag to an empty position moves the ability; a drag onto a populated position swaps them. Empty/invalid drops and return to the original position do not advance time. Accepted reassignment advances once.

Heal targets the player and restores up to 10 Health for 10 Mana. Wand chooses the nearest enemy within eight Manhattan tiles, breaking equal-distance ties by stable enemy ID; it deals 8 damage for 8 Mana. These values and target rules are provisional, centralized in the ability catalog, and can be tuned independently from slot assignment. An ability without enough Mana or a valid effect target is rejected without a message or tick.

Press C or the mobile Sneak control to toggle Sneak mode without advancing time. Sneak currently reduces enemy awareness from eight to four tiles. This is provisional and centralized in `GAME_TUNING`.

## Held movement timing

The first movement happens immediately. Keep the input held to use the applicable initial and repeat delays.

| Input | Movement | Initial delay | Repeat delay |
| --- | --- | ---: | ---: |
| WASD / Arrow key | Walk | 0.4 s | 0.2 s |
| WASD / Arrow key + Shift | Sprint | 0.25 s | 0.125 s |
| Left-click hold | Walk | 0.4 s | 0.2 s |
| Right-click hold | Sprint | 0.25 s | 0.125 s |
