# Cryptbound

Cryptbound is a single-player medieval dungeon roguelite. Explore a procedural crypt one grid step at a time, fight between turns, gather equipment, and carry permanent character growth into each new descent.

## Original AI Prompt

<details>
<summary>Read the full original prompt (edited for grammar, punctuation, spelling, and formatting)</summary>

```text
Use $ai-skills-create-game to replace this prompt with a 2D single-player dungeon-crawling game. The game saves to local storage and has three save slots. Character stats improve over time and save to storage. Each time you die, you restart in a procedural dungeon. It's a roguelite-style game.

Use the template project's 2DPixelPerfect style with a 1.0 render scale, so each tile keeps its original size for a crisp look. Use WASD to walk one grid space at a time; each move advances the on-screen “Time: 1” counter by one. Enemies can move only when time advances, and they move one grid space per time unit.

Use assets formatted for Tiled. I'll provide folders to copy from and use for the assets; let them inspire the hero, enemies, pickups, items, and environment.
```
</details>

## Live Demo

- [Play Cryptbound](https://samuelasherrivello.github.io/babylon-lite-dungeon-crawl/)

## Images

<a href="cryptbound/documentation/screenshot01.png"><img src="cryptbound/documentation/screenshot01.png" width="640" alt="Cryptbound dungeon gameplay with the player exploring a procedural crypt" /></a>

## Table of Contents

1. [Getting Started](#getting-started)
2. [Project Details](#project-details)
3. [Credits](#credits)

## Getting Started

1. Install Node.js and run `npm install` from the repository root.
2. Run `npm run dev` and open the localhost URL Vite prints, or run `npm run dev:open` to launch a silent browser session for testing (`?mute=1`).
3. Run `npm run build` to create the production site in `cryptbound/dist/`.

## URL Arguments

- `?randomSeed=235234` starts a deterministic new campaign with that unsigned 32-bit seed when an empty save slot is selected. Existing saves resume unchanged.
- `?mute=1` mutes all audio, including when combined as `?randomSeed=235234&mute=1`.

The 50 unwalkable tiles closest to a new run's start room use the wall edge, corner, and solid wall-face frames demonstrated by `Tiled_Examples/wall_combinations01.tmx`. The rest of the procedural map retains the general wall treatment.

## Controls

- Move one tile with WASD or the arrow keys. Pair directions for diagonal movement.
- On touch devices, use the on-screen eight-way pad.
- Bump into enemies to attack, gear to collect/equip, chests to open, and stairs to descend.
- Click the center diamond on the movement pad to Brace.
- Use Zoom to select Half (0.5×), Native (1.0×), or Double (2.0×).

Every accepted move advances Time by one and gives enemies one action. Blocked moves do not spend a turn. Diagonals cannot pass between blocked corners. The three local campaign slots autosave the current run after each turn. Death restarts the dungeon run while retaining stats, level, and unspent experience.

## Project Details

- `cryptbound/src/game/` contains dungeon generation, turn rules, progression, and local save-slot logic.
- `cryptbound/src/content/` and `cryptbound/src/ui/` contain the game surface and viewport UI.
- `cryptbound/public/assets/` contains supplied Tiled-compatible pixel art and sample maps.
- `openspec/changes/build-cryptbound-roguelite/` contains the active implementation proposal, specs, design, and task list.
- [`cryptbound/documentation/original-prompt.md`](cryptbound/documentation/original-prompt.md) records the original game request and clarifications.
- [`cryptbound/documentation/asset-provenance.md`](cryptbound/documentation/asset-provenance.md) records artwork origin and license status.

## Release

The project uses the repository's GitHub Pages and Release workflows. Build and verify the project before pushing to `main`; run the Release workflow to bump the version and publish a tagged release.

## Credits

- Samuel Asher Rivello - Over 25 years of game development XP (2026)
- Provided as-is under the [MIT License](LICENSE).
