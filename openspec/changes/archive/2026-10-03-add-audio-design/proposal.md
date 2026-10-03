# Proposal

## Why

Cryptbound has no audio controls or event sound feedback, and unattended AI browser sessions need a reliable way to stay silent. A small, restrained sound set with independent volume controls can make combat and interface actions clearer while letting players tune or disable audio.

## What Changes

- Add independent SFX and Music volume controls from 0 to 100 in Settings, plus a Mute All control; persist the settings for ordinary sessions.
- Support `?mute=1` as a load-time override that silences every audio bus regardless of saved levels, and document it for AI testing.
- Add `cryptbound/public/assets/audio/sfx/` and `cryptbound/public/assets/audio/music/` for locally hosted assets.
- Add three free, loopable medieval-dungeon music candidates with source and license attribution. Treat the exact tracks as provisional until listened to in context for repetitiveness and loop seams.
- Add restrained diegetic game-world cues and non-diegetic interface feedback, including accepted and rejected equipment drops.

## Capabilities

### New Capabilities

- `game-audio`: User audio settings, silent URL override, event sound behavior, and sourced music assets.

### Modified Capabilities

- `game-integration-guidance`: Update the generic audio guidance to document the mute URL convention and allow intentionally requested, restrained music while preserving optional audio and UI mute requirements.

## Impact

Settings UI and preference persistence in `cryptbound/src/game/Game.jsx` and `cryptbound/src/game/saves.js`; audio playback and event integration under `cryptbound/src/game/` or `cryptbound/src/content/`; `cryptbound/public/assets/audio/`; audio provenance and the AI mute URL in project documentation; and the game-audio and game-integration-guidance specifications. No new dependency is assumed; implementation should use browser audio APIs unless repository inspection identifies an existing audio library.
