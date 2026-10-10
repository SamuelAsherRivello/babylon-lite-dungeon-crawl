# Resources and progression

## Deterministic combat resources

New characters begin with 30 Health, 16 Stamina, 12 Mana, and 1 innate Defense. They begin with an equipped Wooden Stick that deals 8 base damage. A basic floor-one Rat has 12 Health, 3 attack, 6-tile awareness, and acts every two turns once aware. This makes the opening enemy take two stick attacks to defeat, while a full-health character can walk directly into and defeat three adjacent Rats without dying. Skeletons begin appearing from floor two; they are the tougher type, starting at 20 Health and 6 attack.

Attacks cost 4 Stamina. Each accepted ground move restores 2 Stamina plus the Recovery rank, without exceeding maximum Stamina. Health and Mana never regenerate from movement. Current Stamina produces a deterministic readiness multiplier from 75% to 100%: it applies to both weapon Offense and Defense. An enemy hit is its attack minus effective Defense, with a minimum of 1 damage; there are no hit, critical, block, or damage-range rolls.

Health potions restore 10 Health and Mana potions restore 8 Mana when the matching resource is below its maximum. Potions are collected during movement and therefore add no turn beyond that move.

## Persistent ranks and equipment

Resources use Health, Stamina, Offense, Defense, Mana, and XP meters. Defense is mainly earned from armor and shields; the base 1 Defense only provides a small starting buffer. Equipment modifiers remain visible in the attribute panel.

The five persistent ranks start at zero and apply deterministic effects:

| Rank | Effect |
| --- | --- |
| Vitality | +3 maximum Health per rank |
| Strength | +1 weapon Offense per rank |
| Luck | +1 deterministic chest/discovery loot tier for every two ranks |
| Recovery | +1 Stamina restored by each accepted ground move per rank |
| Stealth | -1 effective enemy awareness tile for every two ranks, to a minimum of one |

When XP reaches its threshold, play pauses after the action that earned it and presents three distinct stat choices from a deterministic rotation. Choosing a stat applies its effect immediately and costs no additional turn. Further tactical actions are rejected until the pending choice is resolved.

## Mana abilities and death

Heal restores up to 8 Health for 5 Mana. Wand targets the nearest enemy in eight Manhattan tiles and deals 7 deterministic damage for 4 Mana. Invalid or unaffordable casts do not spend Mana or advance time.

Death resets the realm and run equipment/Inventory but retains persistent ranks, level/XP progress, and ability assignments. Resource fullness is preserved when a maximum changes through an upgrade, migration, or equipment change.
