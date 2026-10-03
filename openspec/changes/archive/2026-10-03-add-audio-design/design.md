# Design

## Context

See [proposal.md](proposal.md) for motivation and scope. The current UI puts Settings in a React dialog, and `cryptbound/src/game/saves.js` already reads and writes a shared localStorage preference record. The in-progress game-event work in `cryptbound/src/game/dungeon.js` emits structured simulation events and `Game.jsx` subscribes to committed session results, which provides a natural boundary for audio reactions.

## Goals / Non-Goals

**Goals:**

- Keep browser audio, saved user preferences, and game simulation concerns separate.
- Ensure the URL mute is applied before any asset playback and cannot be undone during that page session.
- Use locally bundled sources with clearly recorded attribution/license information.

**Non-Goals:**

- Add audio to Babylon Lite rendering or make audio part of saved campaign state.
- Add an audio dependency, audio editor, track-selection UI, voice acting, or spatial audio.
- Promise subjective “not annoying” quality without an in-context listening review.

## Decisions

### Use a small browser-audio service outside simulation

Create a game audio module under `cryptbound/src/game/` that owns the SFX and Music buses, asset lookup, playback, and mapping from committed domain events to cues. React owns Settings controls and preference persistence; the dungeon simulation continues to emit events without importing or calling the audio service. This follows the existing session subscription boundary and avoids making audio alter game rules. Direct playback calls inside action reducers were considered and rejected because UI-only events such as drag acceptance do not belong in simulation.

Use native browser audio elements for bundled files, with looping enabled for music. Do not add a package unless implementation proves native playback insufficient. Start music only after the browser permits playback following a user gesture, and handle rejected autoplay without disrupting the game.

### Extend existing preferences compatibly

Add validated integer `sfxVolume` and `musicVolume` values in the 0–100 range and a boolean `muteAll` to the existing preferences record. Preserve Zoom, Camera, and Fullscreen fields. Older records missing audio fields receive proposed human-session levels of SFX 80 and Music 20, with Mute All off; malformed or out-of-range values resolve to safe defaults. Audio preferences remain device-level UI preferences, not campaign-save fields.

Parse `mute=1` once at app startup. It sets an in-memory hard mute that takes precedence over persisted levels and Mute All for that page session. The URL override does not overwrite saved player preferences. The Settings controls may still edit and save preferences during a muted session, but no playback occurs until the page is opened without the override.

### Keep playback event-driven and restrained

Map only accepted, relevant game events to cues. The session subscription can handle combat, pickup, chest, and descent events. Movement footsteps should be brief and quiet; cap repeated playback so held movement does not produce a harsh stream of overlapping sounds. Emit UI feedback for accepted/rejected inventory drops and successful ability use at the UI action boundary. Failed/cancelled drops and rejected gameplay actions must not accidentally play success cues.

All SFX share one bus; all music tracks share another. Effective bus gain combines the saved 0–100 level with Mute All and the URL hard mute. Keep the sound inventory and the diegetic/non-diegetic classification in project documentation beside the asset provenance.

### Bundle the three sourced candidate tracks

Use these proposed files under `cryptbound/public/assets/audio/music/`:

| Track | Source | License / loop evidence |
|---|---|---|
| Spooky Dungeon — Memoraphile / You're Perfect Studio | [OpenGameArt](https://opengameart.org/content/spooky-dungeon) | CC0 is listed; tagged loopable and seamless |
| JRPG - End Dungeon — HydroGene | [OpenGameArt](https://opengameart.org/content/jrpg-end-dungeon) | CC0; author says the track is loopable |
| Dungeon 04 — Beau Buckley / Fantasy Musica | [OpenGameArt](https://opengameart.org/content/dungeon-04) | CC BY-SA 4.0; OGG file includes loop metadata; credit Beau Buckley |

Download and bundle a suitable provided format, retain source filenames or document any renamed file, and include a credits/provenance file. The Dungeon 04 asset requires the applicable attribution and share-alike terms; verify redistribution details against the source license before bundling. These candidates meet the source-page loop criteria, but the project acceptance check still requires listening for seam quality and repetitiveness. Avoid automatic rapid track switching; keep the selected track steady for a session or change only at a realm transition.

## Risks / Trade-offs

- [Risk] Browser autoplay policy may reject music on initial page load. → Start or resume music on the first user gesture and treat autoplay rejection as a normal silent state.
- [Risk] Frequent turn-based actions can make otherwise suitable cues irritating. → Keep cues short and quiet, avoid loops for footsteps, cap overlaps, and verify in a representative play session.
- [Risk] User-supplied edits to URL or saved preferences could create unexpected audio. → Apply the `?mute=1` override before creating or playing any audio and give it precedence for the full page session.
- [Risk] CC-BY-SA redistribution obligations may be missed. → Store exact source, author, license, and required credit alongside the bundled file; validate the license terms during asset integration.

## Migration Plan

Extend the existing preference normalizer so prior localStorage records remain readable and retain their current Zoom, Camera, and Fullscreen values. If new audio code fails or is rolled back, remove only its UI/module and audio asset references; existing preference records remain valid and can safely ignore the added fields.
