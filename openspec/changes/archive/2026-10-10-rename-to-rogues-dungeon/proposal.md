# Proposal

## Why

The game has inconsistent identity text: the visible title says “Dungeon
Roguelite” while the project, storage keys, documentation, and deployment
path use “Cryptbound” or the template repository name. A single identity,
**Rogue's Dungeon**, will make the player-facing product and its repository
and app naming consistent before further development.

## What Changes

- Rename the user-facing game title everywhere in the shipped experience to
  `Rogue's Dungeon`, including the document title, main title bar, menus,
  browser-visible labels, and user-facing documentation.
- Rename the Vite application directory at the repository root from
  `cryptbound/` to `rogues-dungeon/` and update all source, test, asset,
  documentation, build-output, and configuration paths that reference it.
- Rename project/package identity and repository/deployment references to
  `babylon-lite-rogues-dungeon`, including the Vite base URL and live-demo
  links where applicable.
- Preserve gameplay behavior, save-slot semantics, renderer policy, audio
  behavior, release/version conventions, and existing asset provenance.
- Use new `rogues-dungeon.*` localStorage keys and intentionally start fresh;
  existing `cryptbound.*` local data is not migrated.
- Update the hosted repository and local `origin` when the rename is
  confirmed and accessible; otherwise leave the remote unchanged and report
  it as pending.
- Update active product references while preserving historical/archive
  references that document prior state.
- Run the existing test and build commands before the migration and again
  after it. The pre-migration baseline currently has one unrelated tooltip
  source-shape failure (87 passing, 1 failing) and a passing production build;
  post-migration verification must identify whether that baseline changed.

## Capabilities

### New Capabilities

None. This change does not introduce new gameplay or system behavior.

### Modified Capabilities

None. Existing gameplay requirements remain unchanged; this is a project and
identity migration. Specs are intentionally skipped.

## Impact

Affected areas include `package.json`, `package-lock.json`, `vite.config.js`,
GitHub Pages workflow configuration, README and documentation, HTML and
React UI strings, source/test import paths, asset references, URL parsing and
deployment-base assumptions, and the root application directory. The Git
repository itself must be renamed externally to
`babylon-lite-rogues-dungeon` if remote access and authorization are
available; local references and `origin` must be synchronized only after the
remote rename is confirmed.

Playwright can provide useful evidence for the browser-visible title and
served base path, so the apply phase should run one focused browser check
after the migration and retain the existing full applicable suite for final
verification.
