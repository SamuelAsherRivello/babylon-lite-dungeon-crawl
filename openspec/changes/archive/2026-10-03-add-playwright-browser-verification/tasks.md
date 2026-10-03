# Tasks

## 1. Add the local browser runner

- [x] 1.1 Add `@playwright/test` as a development dependency and the root `test:browser` (focused selection) and `test:browser:full` (unfiltered) scripts; install the supported Chromium target and verify the local `playwright` CLI reports its version.
- [x] 1.2 Add root Playwright configuration that starts the existing Vite app on a stable local URL under its Pages base path, targets only Chromium, and retains trace, screenshot, and video diagnostics only on failure; verify the focused script can list the discovered browser tests without starting an unrelated service.
- [x] 1.3 Ignore Playwright report, result, and local browser-data directories while preserving source configuration and tests; verify a diagnostic-output dry run leaves no generated artifact staged for commit.

## 2. Add focused browser coverage and usage guidance

- [x] 2.1 Add a tagged browser smoke spec under `cryptbound/test/browser/` that opens the initial game page through `?mute=1` and verifies stable browser-owned entry UI and controls without requiring a WebGPU world session; run its focused selection once after that test group is complete. Verified by `npm run test:browser` (2 passed).
- [x] 2.2 Document Chromium setup, the focused and full commands, silent URL requirement, browser-capability limitations, and the policy that pure logic remains in Node tests; verify each documented command and URL matches package scripts and configuration.

## 3. Encode phase-aware OpenSpec policy

- [x] 3.1 Update `openspec/config.yaml` context and proposal/design/task rules so Playwright supports the active skill's goal: explore and proposal select coverage without execution, apply runs one targeted check after its related group, and finalization runs the full applicable suite; verify proposal and apply instructions expose the policy without changing generated skills.
- [x] 3.2 State in the browser-verification documentation that a change without browser-visible behavior records Playwright as not applicable, while finalization reports unavailable required browser capabilities rather than claiming coverage; verify this matches the added OpenSpec capability scenarios.

## 4. Verify the integrated workflow

- [x] 4.1 Run `npm test`, `npm run build`, the focused browser smoke selection, and `npm run test:browser:full`; verify the Node suite and build retain their existing behavior and record any unavailable external browser capability distinctly. Verified: Node suite (73 passed), production build successful, smoke suite (2 passed), and full browser suite (5 passed); WebGPU visual review used Microsoft Edge because the Playwright Chromium target has no WebGPU adapter in this environment.
- [x] 4.2 Run strict OpenSpec validation for `add-playwright-browser-verification` and inspect the change diff; verify the proposal, capability delta, design, and tasks consistently preserve the phase-aware time budget.
