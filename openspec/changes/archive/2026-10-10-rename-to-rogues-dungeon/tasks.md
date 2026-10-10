# Tasks

## 1. Capture and prepare the migration

- [x] 1.1 Record clean/dirty Git state, run `npm test`, and run `npm run build` from the repository root; verify the baseline results are documented, including the known tooltip source-shape failure if it remains.
- [x] 1.2 Inventory all tracked references to `Cryptbound`, `cryptbound`, `Dungeon Roguelite`, `babylon-lite-dungeon-crawl`, and the old Pages base path; verify the inventory covers source, tests, docs, workflow, package metadata, and generated-output assumptions.

## 2. Rename the application and project identity

- [x] 2.1 Rename the root application directory from `cryptbound/` to `rogues-dungeon/` and update Vite root, npm scripts, test paths, imports, asset paths, and documentation links; verify no active configuration points at a missing `cryptbound/` path.
- [x] 2.2 Update package and lockfile identity, repository/deployment identifiers, Vite base URL, GitHub Pages workflow paths, and live-demo links to `babylon-lite-rogues-dungeon`; verify package metadata and generated build paths agree.
- [x] 2.3 Replace active shipped user-facing title and product copy with the exact ASCII string `Rogue's Dungeon`; preserve historical/archive references that document prior state, and verify active source/config/docs contain no stale user-facing old title.
- [x] 2.4 Replace active `cryptbound.*` localStorage keys with `rogues-dungeon.*` keys and intentionally do not migrate old local data; verify new sessions use only the new namespace and existing migration tests remain valid for their documented legacy campaign formats.

## 3. Verify the renamed application

- [x] 3.1 Run the full configured `npm test` command from the repository root; verify the result is compared against the recorded baseline and any remaining failure is identified as pre-existing or fixed.
- [x] 3.2 Run `npm run build`; verify Vite builds successfully from `rogues-dungeon/` and emits the `/babylon-lite-rogues-dungeon/` deployment base.
- [x] 3.3 Run one focused Playwright browser check against the renamed base path; verify the browser title and visible title bar show `Rogue's Dungeon` and the app loads without a stale-path error.
- [x] 3.4 Re-run the stale-reference search and inspect `git diff --check`; verify only intentional rename, identity, compatibility, documentation, and test updates remain.
- [x] 3.5 If the hosting repository rename is confirmed and accessible, update and verify `origin` points to `babylon-lite-rogues-dungeon`; otherwise report the external remote rename as pending and do not invent a new URL.
