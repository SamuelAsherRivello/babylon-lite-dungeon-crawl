# Design

## Context

See `proposal.md` for the motivation and scope. The repository is a root npm
project whose Vite app currently resides in `cryptbound/`; `vite.config.js`,
the package scripts, tests, GitHub Pages workflow, documentation, and browser
fixtures refer to that directory or to the old product/repository identity.
The runtime combines React UI, Babylon Lite content, local-save logic, and
static documentation, so the migration must update references without
changing those layer boundaries.

## Goals / Non-Goals

**Goals:**

- Make `Rogue's Dungeon` the sole shipped product name.
- Make `rogues-dungeon/` the application directory and
  `babylon-lite-rogues-dungeon` the project/repository identity.
- Keep imports, test paths, Vite root/base settings, Pages deployment, and
  browser checks internally consistent.
- Make the intentional fresh-start behavior explicit for local save data.
- Provide reproducible before/after test, build, and focused browser evidence.

**Non-Goals:**

- No gameplay, rendering, input, audio, progression, or save-schema feature
  changes.
- No new dependencies or renderer changes.
- No pull request creation.
- No remote repository rename or push unless the user separately authorizes
  and the remote rename is confirmed available.

## Decisions

1. **Use a filesystem rename followed by reference repair.** Rename the app
   directory to `rogues-dungeon/`, then update configuration, scripts, imports,
   tests, workflow paths, documentation, and generated-output references. This
   keeps the Vite root and test commands truthful instead of layering aliases
   around the old directory.

   *Alternative considered:* retain `cryptbound/` and only change labels.
   Rejected because the request explicitly requires the root project folder to
   be `rogues-dungeon`.

2. **Use the exact user-facing string `Rogue's Dungeon`.** Apply it to the
   HTML title, title bar, menus and other visible copy; use the lowercase
   kebab-case identifier `rogues-dungeon` for paths and the hyphenated
   repository identifier `babylon-lite-rogues-dungeon` for project metadata.

   *Alternative considered:* use typographic `Rogue’s Dungeon` everywhere.
   Rejected for consistency with the requested spelling and stable string
   matching in browser/source tests.

3. **Use a new local-save namespace.** Replace active `cryptbound.*`
   localStorage keys with `rogues-dungeon.*` keys and intentionally do not
   migrate old saves or preferences. This matches the confirmed decision to
   start fresh and avoids retaining old product identity in active persistence.

   *Alternative considered:* migrate or continue reading `cryptbound.*`.
   Rejected because this rename is explicitly allowed to start fresh.

4. **Treat the remote rename as a separate external operation.** Update local
   origin URLs only after the hosting repository is actually renamed and
   reachable. If access is unavailable, leave the remote unchanged and report
   the pending external action.

   *Alternative considered:* invent or preemptively replace the origin URL.
   Rejected because that could break fetch/push behavior.

5. **Verify at three levels.** Run the existing Node test suite and production
   build before and after; add one focused Playwright check for the title and
   served base path after implementation. Keep the known baseline tooltip
   failure visible rather than masking it.

## Risks / Trade-offs

- [Stale path reference] → Search the tracked tree for `cryptbound`, old base
  paths, and old repository identifiers after the rename; build and tests must
  run using only `rogues-dungeon/` paths.
- [Unexpected old save retention] → Remove active legacy-key reads, use the
  new namespace consistently, and test that new sessions use only the new
  keys.
- [Deployment link breakage] → Update Vite base and Pages workflow together;
  verify the generated site uses `/babylon-lite-rogues-dungeon/`.
- [Baseline test noise] → Record the pre-existing tooltip failure and compare
  the exact failing test after migration; do not claim a clean suite unless it
  is independently fixed.
- [Remote mismatch] → Do not rewrite `origin` without confirmed hosting
  state; report external rename work separately if it cannot be completed.

## Migration Plan

1. Capture `git status`, baseline `npm test`, and baseline `npm run build`.
2. Rename `cryptbound/` to `rogues-dungeon/` and update all tracked path and
   identity references, including lockfile metadata and deployment base URLs.
3. Run focused source/path checks and the post-migration Node tests/build.
4. Run the focused browser check against the renamed base path and visible
   title.
5. If a rollback is required, revert the migration commit/change as a unit;
   do not delete generated or user data, and preserve any save-key migration
   logic until compatibility is confirmed.
