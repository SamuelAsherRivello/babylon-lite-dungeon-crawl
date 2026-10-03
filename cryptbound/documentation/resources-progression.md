# Resources and progression

## Attributes and meters

The active attributes are Health, Stamina, Offense, Defense, and Mana. Their values define the matching resource maximum. Vitality, Strength, Luck, Recovery, and Agility start at zero and do not affect gameplay. Resource bars use a 0–100 attribute domain: normal fill represents current value, a marker shows the current maximum, and the accessible label reports current and maximum values. XP is shown last with the level number.

For example, Health 20 with a maximum of 25 fills 20% of the 0–100 bar, with its marker at 25%. If equipment lowers the maximum to 10, current Health preserves 80% fullness and becomes 8. Zero maxima produce zero current value and no division by zero. Offense and Defense are derived from their attribute values and the current Stamina ratio.

## Provisional combat tuning

Starting Stamina is 25. Each attack costs 5 Stamina and each movement restores 10, clamped to the maximum. These are centralized provisional tuning values in `GAME_TUNING`. An attack that combines weapon effects still charges Stamina only once. A hit awards 1 XP and a kill awards the enemy's XP; excess is carried across the 100 XP threshold. Leveling increments the level count without a choice or pause.

Combat damage is resolved as a non-negative integer. Incoming damage is rounded to the nearest integer after Defense mitigation; melee and ability damage are also normalized to whole numbers before reducing enemy Health.

## Potions and death

Health and Mana potions refill the matching resource directly when below its maximum. They do not enter Inventory. At maximum, a potion remains on its world tile while the player walks over it. Walking does not regenerate Health or Mana.

Death resets the realm and run equipment/Inventory but retains base attributes, level/XP progress, and ability assignments. Equipment-derived maxima are removed with run equipment, and the fresh run's current resources use its new maxima.
