# Tasks

## 1. Audio Preferences and Playback Foundation

- [x] 1.1 Extend preference validation and persistence with independent SFX/Music levels and Mute All; add focused coverage proving current Zoom, Camera, and Fullscreen fields remain compatible with older records.
- [x] 1.2 Add the browser audio service and apply `?mute=1` before any playback; add focused checks for the hard mute, persisted preference precedence, 0–100 gain mapping, Mute All, and ordinary-session behavior.
- [x] 1.3 Add SFX and Music sliders plus Mute All to the Settings dialog; verify accessible labels, live level changes, persistence after reload, and no audio-control UI outside Settings.

## 2. Assets and Event Cues

- [x] 2.1 Add the `cryptbound/public/assets/audio/sfx/` and `music/` catalogs with 4–10 licensed event effects and the three specified music tracks; record author, source, license, file mapping, and required credits in audio documentation, then verify every bundled file has a matching provenance entry.
- [x] 2.2 Map committed movement, combat, pickup, chest, and descent events to restrained diegetic cues; add focused tests that each intended event maps once and muted events remain silent.
- [x] 2.3 Map successful ability use and accepted/rejected equipment drops to non-diegetic cues; add focused tests for success/failure classification and ensure cancelled or unrelated drops produce no cue.
- [x] 2.4 Document every cue in the diegetic/non-diegetic inventory and document `?mute=1` for AI testing; verify the documentation matches the event catalog and Settings labels.

## 3. Listening and Integration Review

- [x] 3.1 Listen to all three tracks in the game context and verify loop transitions and non-intrusive repetition; adjust gain, track use, or replace a candidate that fails review while preserving its provenance. User reviewed and approved the three candidates.
- [x] 3.2 Run the focused audio and preference tests plus the existing build; verify `?mute=1` remains silent during movement, combat, UI actions, and reload while a normal session honors its saved settings.
