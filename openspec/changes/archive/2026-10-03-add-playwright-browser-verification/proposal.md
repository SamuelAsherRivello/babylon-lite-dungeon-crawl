# Proposal

## Why

Cryptbound's current checks are fast Node tests and production builds, which
cannot exercise real browser behavior such as keyboard and pointer input,
persisted preferences, fullscreen, or responsive presentation. Add Playwright
browser verification without allowing it to slow the exploration, proposal, or
ordinary implementation loops that OpenSpec skills are meant to support.

## What Changes

- Add Playwright as a project development dependency, with a local Chromium
  browser target and a documented browser-test command.
- Add a small, deterministic browser smoke suite for targeted user-visible
  Cryptbound flows. Browser sessions will use `?mute=1`.
- Establish a phase-aware verification policy: explore and proposal select
  coverage without launching a browser; apply runs one focused browser check
  after the related implementation group is complete; finalization runs all
  browser checks relevant to the completed change and may include a broader
  interaction and viewport matrix.
- Add the policy to OpenSpec project context and proposal/design/task rules,
  making Playwright optional for individual changes rather than a universal
  delivery gate.
- Ignore generated Playwright reports, artifacts, and local browser data while
  preserving source tests and configuration in version control.

## Capabilities

### New Capabilities

- `playwright-browser-verification`: Time-bounded, phase-aware browser
  verification that complements the existing focused Node tests for Cryptbound.

### Modified Capabilities

- None.

## Impact

- Affected project tooling: `package.json`, lockfile, npm scripts, Playwright
  configuration, browser test sources, and `.gitignore`.
- Affected project guidance: `openspec/config.yaml` and browser-testing
  documentation.
- Adds the `@playwright/test` development dependency and a downloaded Chromium
  runtime during setup; no production runtime behavior, renderer fallback, or
  application API changes are proposed.
