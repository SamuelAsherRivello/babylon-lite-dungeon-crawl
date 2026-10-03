# Design

## Context

See [proposal.md](proposal.md) for motivation. The repository is an ESM npm
project: Vite runs from the repository root with `cryptbound/` as its root and
serves the application under `/babylon-lite-dungeon-crawl/`. Its current test
command uses Node's built-in test runner for pure content, game, audio, and UI
logic. It has no browser-test dependency or runner, though the game already
documents `?mute=1` for silent automated sessions.

## Goals / Non-Goals

**Goals:**

- Provide a project-local Chromium-backed browser runner and stable root-level
  commands for a focused smoke run and a complete run.
- Keep browser execution out of explore and proposal; make a single targeted
  run available at the end of the related apply implementation group.
- Give finalization an evidence-based full-suite command without requiring a
  full device matrix for unrelated changes.
- Cover browser-owned behavior while retaining the existing Node tests as the
  primary checks for pure game logic.

**Non-Goals:**

- Replacing Node tests, adding a production dependency, changing the game
  renderer, adding a renderer fallback, or making every OpenSpec change run a
  browser.
- Modifying generated OpenSpec skills. The policy belongs in project context,
  artifact rules, documented commands, and the tasks created from them.

## Decisions

### Use the project-local Playwright test runner with one Chromium target

Add `@playwright/test` as a development dependency and keep its configuration
at the repository root, alongside the Vite configuration. The Playwright
configuration will start the existing Vite dev command on a fixed local port,
wait for the existing GitHub Pages base path, and locate browser specs under
`cryptbound/test/browser/`. Tests will navigate with `?mute=1`; trace,
screenshot, and video capture will be retained only when a test fails.

`@playwright/test` provides both the assertion runner and `playwright` CLI,
matching the project's ESM/Node tooling without adding a second test runtime.
A global browser executable or a remote browser service was rejected because
it would make repeatable project setup and offline diagnosis less reliable.

### Separate focused apply runs from full finalization runs

Expose a focused browser command that accepts a tag/selection for one
browser-visible flow, and a full command that executes all browser specs. An
apply task creates or updates a narrowly scoped spec, then runs that selection
once after the task group is complete. It does not restart Chromium after each
edit. The finalization workflow uses the full command when the completed
change selected browser coverage, and expands viewports or input coverage only
when that change's acceptance criteria need it.

Running the full suite at every apply checkpoint was rejected because it
converts broad future coverage into delay for an unrelated implementation.
Deferring every browser test until finalization was rejected because it makes
browser-specific failures harder to isolate.

### Keep browser tests on browser-owned contracts

The initial smoke coverage will exercise stable UI contracts that can be
observed from the initial application page, such as loading through the Pages
base URL, accessible menu and settings controls, and the silent-session
contract. It will not duplicate unit-level game rules or require a WebGPU
world session merely to test navigation. A future change that needs renderer,
fullscreen, storage, pointer, keyboard, or responsive evidence adds a focused
tagged browser spec and names its required browser capability in its tasks.

This preserves Babylon Lite's WebGPU-only policy: browser tests report an
unavailable required capability rather than introducing an alternate renderer
or treating the missing coverage as passed.

### Make the policy available through supported OpenSpec inputs

Add the phase policy to `openspec/config.yaml` context so explore and apply
receive it, and add concise proposal, design, and task rules so new planning
artifacts make a deliberate coverage decision. Document setup and commands in
the application documentation. Do not edit generated OpenSpec skills; the
finalization macro already derives applicable validation from the completed
change's tasks and documented commands.

## Risks / Trade-offs

- **[Chromium is not installed or cannot download]** → Document the explicit
  local browser-install command and report the missing capability as a blocked
  check rather than hiding it.
- **[Headless environment lacks a required WebGPU or fullscreen capability]**
  → Keep the baseline smoke suite renderer-independent; require a change that
  depends on that capability to report environment-limited finalization.
- **[Browser suite grows into an apply bottleneck]** → Keep apply selections
  tagged and focused, reserve the unfiltered suite for finalization, and avoid
  unconditional viewport matrices.
- **[Browser checks duplicate unit coverage]** → Test only real page and
  browser integration contracts; retain domain behavior tests in Node.

## Migration Plan

1. Add the development dependency, lockfile entry, browser configuration,
   tagged smoke spec, commands, ignored outputs, and documentation.
2. Install Chromium and run the focused smoke command once against the local
   Vite server; run the existing Node suite and production build unchanged.
3. Record the phase-aware policy in OpenSpec configuration and validate this
   change's artifacts.

Rollback removes the development dependency, browser configuration, source
tests, commands, documentation, and policy together; no stored player data or
production asset requires migration.
