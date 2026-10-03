# Campaign save migration

New campaigns use version 2. A supported version-1 campaign is migrated in memory when its Saved Game is read, then the original JSON is copied to `cryptbound.slot.v1-backup.<slot>` before the version-2 campaign replaces `cryptbound.slot.<slot>`.

## Version mapping

| Version 1 data | Version 2 data |
| --- | --- |
| `floor` map, seed, depth/Level, entities, and `floor.time` (or top-level `time`) | Retained as the current floor and game time; legacy depth maps to Dungeon Level |
| `progression.difficulty` | Retained when present; older saves initialize hidden Difficulty from Dungeon Level |
| `world`, `realm`, `player.x`, `player.y` | Retained; missing world/realm use the legacy default world and floor Level |
| `progression.stats.health` / legacy vitality, `stamina`, `offense` / `strength`, `defense`, and `mana` | Active Health, Stamina, Offense, Defense, and Mana attributes |
| `player.hp` and resource values | Current Health/Stamina/Mana, capped by migrated attributes |
| `progression.level`, `xp`, `totalKills` | Retained with the v2 XP threshold |
| Hand equipment and body/head/leg equipment | Deterministically mapped to the two Weapons and two Armor positions; overflow remains in Inventory |
| Legacy pending choice/dialog state | Discarded; it is uncommitted UI state and grants no progression |
| Counters and objective, when present | Retained; missing values use new-campaign defaults |
| Legacy message/Log | Starts a fresh v2 Log; formatted messages are not replayed |
| Vitality, Strength, Luck, Recovery, Agility | Initialized to zero |

An item encountered more than once under the same legacy ID is migrated only once. Items that cannot be equipped in the two matching positions remain in Inventory rather than being dropped.

Dungeon Level starts at 1 and increases at each exit. Hidden Difficulty also starts at 1, increases at each exit, and affects enemy generation. On death, the new generated floor returns to Dungeon Level 1 with Time, run resources, equipment, Inventory, and run counters reset; saved attributes, XP progression, ability bindings, and Difficulty remain.

## Failure and rollback

The migration function is pure: invalid or unsupported input throws without changing storage. A read reports that Saved Game as invalid and preserves its original bytes. On successful migration, the exact original JSON is backed up before the primary key is replaced. If backup writing fails, the primary record has not yet been touched. If replacing the primary record fails, the original is still present in the backup. Normal version-2 autosaves do not remove that backup.

To roll back to a build that understands version 1, restore the corresponding `cryptbound.slot.v1-backup.<slot>` bytes to `cryptbound.slot.<slot>` while the game is closed. Version-2 saves are not reversible through this migration.

## New-game tuning

Migration preserves supported saved progression. It does not apply new-run balance tuning to an existing character. New-game attribute values and ability costs/effects are separate balance decisions documented in the campaign rules.
