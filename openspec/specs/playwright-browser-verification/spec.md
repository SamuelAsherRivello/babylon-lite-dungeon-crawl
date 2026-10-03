# playwright-browser-verification Specification

## Purpose
Provide useful, phase-aware browser verification without slowing OpenSpec work
that does not need a browser session.

## Requirements

### Requirement: Local browser-verification capability
The project SHALL provide a documented, repository-root browser-verification command backed by a project development dependency and a locally configured Chromium target. Generated reports, traces, screenshots, and local browser data SHALL remain untracked.

#### Scenario: Developer prepares browser verification
- **WHEN** a developer follows the documented local setup for browser verification
- **THEN** they can install the supported browser target and run the documented command without adding a production dependency

#### Scenario: Browser run creates diagnostics
- **WHEN** a browser-verification run produces reports or failure artifacts
- **THEN** those generated files do not appear as files to commit

### Requirement: Phase-aware browser verification selection
OpenSpec guidance SHALL treat browser verification as optional for each change and SHALL select it only when it supports the active phase's purpose. Explore and proposal guidance SHALL assess and record the need for browser coverage without launching a browser session.

#### Scenario: Exploration or proposal assesses a change
- **WHEN** an OpenSpec explore or proposal workflow considers a change
- **THEN** it identifies whether browser-visible behavior needs coverage without installing browsers, starting a server, or running browser tests

#### Scenario: Change has no browser-visible behavior
- **WHEN** a change affects only pure game logic, documentation, or configuration with no browser interaction contract
- **THEN** its plan records browser verification as not applicable and does not make it a delivery gate

### Requirement: Time-bounded apply verification
When a change includes a browser-visible interaction, persistence, fullscreen, layout, or browser-integration contract, its apply tasks SHALL define one focused smoke check. Apply guidance SHALL run that check once after the related implementation group is complete, not after every edit or unrelated task.

#### Scenario: Apply implements a selected browser flow
- **WHEN** the related implementation group and focused browser test are complete
- **THEN** the apply workflow runs that focused check once and records its result before proceeding

#### Scenario: Automated game session starts
- **WHEN** a browser test opens Cryptbound
- **THEN** its application URL includes `?mute=1`

### Requirement: Thorough finalization verification
Finalization guidance SHALL run all browser checks relevant to the completed change and MAY add relevant viewport, input, persistence, fullscreen, or interaction coverage. It SHALL report unavailable browser capabilities or failed checks rather than treating broad browser coverage as complete without evidence.

#### Scenario: Finalizing a change with browser coverage
- **WHEN** the completed change selected browser verification
- **THEN** finalization runs the applicable browser suite and records the executed coverage and outcome

#### Scenario: Finalization cannot exercise a required browser capability
- **WHEN** an applicable browser check cannot run in the available environment
- **THEN** finalization reports the limitation and does not claim that check passed
