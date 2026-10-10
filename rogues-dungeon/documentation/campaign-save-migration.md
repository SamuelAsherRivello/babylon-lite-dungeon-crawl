# Campaign save migration

New campaigns use version 3. Supported version-1 and version-2 campaigns are migrated in memory when a Saved Game is read. A version-1 original JSON is copied to `rogues-dungeon.slot.v1-backup.<slot>` before the version-3 campaign replaces `rogues-dungeon.slot.<slot>`.

## Version mapping

| Earlier data | Version 3 data |
| --- | --- |
| `floor` map, seed, depth/Level, entities, and `floor.time` (or top-level `time`) | Retained as the current floor and game time; legacy depth maps to Dungeon Level |
| `progression.difficulty` | Retained when present; older saves initialize hidden Difficulty from Dungeon Level |
| `world`, `realm`, `player.x`, `player.y` | Retained; missing world/realm use the legacy default world and floor Level |
| Legacy primary resource attributes | Rebuilt from the version-3 balance profile; current Health/Stamina/Mana fullness ratios are retained |
| `agility` | Renamed to persistent `stealth` |
| `progression.level`, `xp`, `totalKills` | Retained with the current XP threshold and an empty pending-upgrade queue unless one is already valid |
| Hand equipment and body/head/leg equipment | Deterministically mapped to the two Weapons and two Armor positions; overflow remains in Inventory |
| Legacy pending choice/dialog state | Discarded; it is uncommitted UI state and grants no progression |
| Counters and objective, when present | Retained; missing values use new-campaign defaults |
| Legacy message/Log | Starts a fresh Log; formatted messages are not replayed |
| Vitality, Strength, Luck, Recovery | Retained when present |
| Generated enemies | Gain awareness, action cooldown, and next eligible action state |

An item encountered more than once under the same legacy ID is migrated only once. Items that cannot be equipped in the two matching positions remain in Inventory rather than being dropped.

## Floor-size expansion

New floors use a 100 by 100 tile grid and place a new run at the central tile. When a valid saved campaign contains the older 40 by 20 active floor, loading it embeds that terrain in the center of a 100 by 100 wall-filled map. The player, floor start, and every entity move by the same offset, preserving their relative coordinates, time, progression, and active layout. A floor already sized 100 by 100 is not shifted again.

Dungeon Level starts at 1 and increases at each exit. Hidden Difficulty also starts at 1, increases at each exit, and affects enemy generation. On death, the new generated floor returns to Dungeon Level 1 with Time, run resources, equipment, Inventory, and run counters reset; saved attributes, XP progression, ability bindings, and Difficulty remain.

## Failure and rollback

The migration function is pure: invalid or unsupported input throws without changing storage. A read reports that Saved Game as invalid and preserves its original bytes. On successful migration, the exact original JSON is backed up before the primary key is replaced. If backup writing fails, the primary record has not yet been touched. If replacing the primary record fails, the original is still present in the backup. Normal version-3 autosaves do not remove that backup.

To roll back to a build that understands version 1, restore the corresponding `rogues-dungeon.slot.v1-backup.<slot>` bytes to `rogues-dungeon.slot.<slot>` while the game is closed. Version-3 saves are not reversible through this migration.

## New-game tuning

Migration preserves supported saved progression. It does not apply new-run balance tuning to an existing character. New-game attribute values and ability costs/effects are separate balance decisions documented in the campaign rules.
