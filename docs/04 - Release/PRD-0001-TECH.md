# PRD-0001-TECH

## Short Name

Split UI Controller

## Goal

Reduce the size and responsibility breadth of the main UI controller by reshaping the app around the Shell, the Outline Pane, the Markdown Pane, and the Preview Pane.

## Context

The app structure had become harder to follow because shell layout, pane behavior, shared state, file flows, and preview editing were mixed together.

## Scope

In:

- shell and pane boundary definition
- pane HTML extraction
- pane logic extraction
- code and HTML naming cleanup for the shell-and-panes model

Out:

- framework adoption
- broad CSS naming cleanup
- unrelated product changes

## Next Step

Use the new module boundaries to drive `PRD-0002-TECH` test coverage.

## History

| Timestamp | Stage |
| --- | --- |

## Audit

| Timestamp | Type | Detail |
| --- | --- | --- |
| Legacy | Backfill | Historical stage-transition timestamps were not captured before the audit structure was introduced. |

## Status

Done

## Objective

Reduce the size and responsibility breadth of the main UI controller by reshaping the app around the real UI concepts: the Shell, the Outline Pane, the Markdown Pane, and the Preview Pane.

## Current Problem

The current UI controller and page structure currently mix:

- shell layout and global controls
- outline pane rendering and navigation
- markdown pane editing and formatting actions
- preview pane rendering and inline editing
- cross-pane state and event wiring
- file, autosave, theme, dialog, and snippet flows

This makes both the UI structure and the implementation harder to follow than they need to be.

## Proposed Target Structure

| Element | Role |
| --- | --- |
| Shell entrypoint | Compose the pane components and own app-level orchestration. |
| Outline Pane component | Own outline rendering, heading tracking, and outline navigation behaviour. |
| Markdown Pane component | Own source editing, formatting actions, drag/drop, shortcuts, and markdown input interactions. |
| Preview Pane component | Own rendered block output, inline editing, block actions, preview scrolling, and preview-side interactions. |
| Pane HTML fragments | Hold the markup for the Outline Pane, Markdown Pane, and Preview Pane components. |

The Shell is not treated as a component in this pass. The panes are.

## Plan

### Phase 1: Define the shell and pane boundaries

- Separate current responsibilities into Shell, Outline Pane, Markdown Pane, and Preview Pane concerns.
- Identify the small set of app-level state and callbacks that must remain in the Shell.
- Preserve existing global contracts with `window.QuillMarkdown`, `window.QuillConfig`, and `window.QuillStorage`.

### Phase 2: Split the HTML by component

- Move the pane markup into dedicated component HTML files.
- Keep the Shell markup in the main page, including shell-level dialogs, toasts, footer, and app chrome.
- Recompose the full page from the Shell plus pane component fragments.

### Phase 3: Split the pane logic

- Move outline-specific logic into the Outline Pane component.
- Move source-editor and formatting logic into the Markdown Pane component.
- Move rendered-preview and inline-edit logic into the Preview Pane component.
- Keep cross-pane coordination, file flows, dialogs, autosave, theme, and bootstrapping in the Shell unless a responsibility is clearly pane-local.

### Phase 4: Refactor names for clarity

- Rename variables, IDs, and structural labels in code and HTML to match the Shell / Outline Pane / Markdown Pane / Preview Pane model.
- Leave CSS class names alone in this pass unless a rename is required to keep the UI working.
- Capture any deferred CSS naming cleanup as follow-on work rather than mixing it into this refactor.

### Phase 5: Rebuild the shell wiring

- Reduce the main UI controller to shell bootstrapping, shared state, component composition, and cross-pane event wiring.
- Make pane dependencies explicit so each pane can be understood as a component with a clear interface.

## Design Rules

- Prefer the four UI concepts over finer-grained utility splits in this pass.
- Avoid introducing a framework or build step as part of this refactor.
- Keep browser compatibility aligned with the current Electron renderer environment.
- Split HTML as part of the refactor, not as deferred cleanup.
- Refactor names in code and HTML to match the new concepts.
- Leave CSS structure and CSS naming largely unchanged for now.
- Favour explicit pane interfaces over hidden cross-module DOM queries where practical.

## Deliverables

- New pane component scripts.
- New pane component HTML files.
- A smaller shell entrypoint.
- An updated main page that acts as the Shell and composes the pane components.
- A short note in [BACKLOG.md](C:/Users/conor/Documents/Markdown%20Editor/docs/BACKLOG.md) kept aligned with implementation status when work starts or completes.

## Progress Update

- The shell now mounts the Outline Pane, Markdown Pane, and Preview Pane from separate HTML fragments.
- Pane-specific logic is split into dedicated component scripts, with the shell retaining shared state and cross-pane coordination.
- Naming in code and HTML has been moved toward the shell-and-panes model while preserving the current stylesheet approach for this pass.
- Script syntax checks are passing after the split.
- Browser-side smoke verification now covers pane mounting, markdown-to-preview sync, outline updates, inline preview editing, autosave, code snippet insertion, save, save-as, load, pane collapse, and theme switching.

## Acceptance Criteria

- The main UI controller is primarily shell orchestration code.
- Outline Pane, Markdown Pane, and Preview Pane each have their own script and HTML component file.
- No user-visible regressions in editing, preview updates, outline navigation, autosave, load/save, or code snippet creation.
- The pane components have clear ownership and minimal cross-coupling.
- Future work such as automated tests can target modules without needing the entire app bootstrapped.

## Verification

- Run a syntax check across all extracted scripts.
- Launch the app and confirm:
  - default document load
  - typing updates preview and word count
  - inline preview editing still writes back to Markdown
  - outline navigation and active heading highlighting still work
  - autosave, load, save, and save-as still work
  - code snippet dialog still generates embeddable image Markdown

## Completion Evidence

- The shell-and-pane split is implemented in the current app structure.
- The pane markup is mounted from separate HTML fragments by the shell.
- The pane behaviors are split into dedicated component scripts.
- A real browser smoke check now proves the core user flows for this refactor pass.

## Risks

- Shared mutable state may become harder to follow if extraction is done without a single state model.
- HTML composition may become awkward if pane fragments are split without a simple loading strategy.
- Preview editing and file-save flows are regression-prone because they combine state mutation and UI updates.

## Follow-on Work

- Use the new module boundaries to drive `PRD-0002-TECH` test coverage.
- Revisit whether some helpers should become pure utilities once the first split is stable.
