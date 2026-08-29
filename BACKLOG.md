# Quill Backlog

`BACKLOG.md` is the canonical source of truth for PRD items, their overall status, and their current workflow phase. Promotion, structure, and code-authorization rules live in [.agents/lifecyle-agent/lifecyle-agent.md](.agents/lifecyle-agent/lifecyle-agent.md).

## Status

- `Proposed`
- `Planned`
- `In Progress`
- `Blocked`
- `Done`

## Backlogged

| ID                | Class  | Short Name                                | Status   | Phase   | Brief Description                                                                                                                                                                                |
| ----------------- | ------ | ----------------------------------------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| PRD-000003-CHANGE | CHANGE | Remove Cache Busting                      | Proposed | Backlog | Remove static asset query-string cache busting once the app's loading and release approach is settled.                                                                                           |
| PRD-000004-UI     | UI     | Accessibility Pass                        | Proposed | Backlog | Review keyboard behaviour, focus handling, labels, and error feedback across the editor and preview flows.                                                                                       |
| PRD-000019-CHANGE | CHANGE | Externalize Default Getting Started Guide | Proposed | Backlog | Store the default getting-started guide in a deployed Markdown document and load it through Quill's supported desktop runtime.                                                                   |
| PRD-000021-TECH   | TECH   | TypeScript Migration For Frontend Runtime | Proposed | Backlog | Plan and execute a staged TypeScript migration for Quill's frontend runtime and desktop bridge so the editor gains stronger module contracts, safer state handling, and better refactor support. |
| PRD-000023-CHANGE | CHANGE | Make AutoSave Persist Open Files          | Proposed | Backlog | Make AutoSave write changes to the current file with clear status feedback and a tuned save interval.                                                                                            |
| PRD-000028-TECH   | TECH   | Preserve Untouched Markdown Source         | Proposed | Backlog | Address `REV-001` by making Render-pane edits lossless outside the explicitly edited source range.                                                                                                 |
| PRD-000029-TECH   | TECH   | Make Saves Revision-Aware                   | Proposed | Backlog | Address `REV-002` by preventing stale asynchronous save completions from clearing newer dirty state.                                                                                               |
| PRD-000030-TECH   | TECH   | Harden Desktop Trust Boundary              | Proposed | Backlog | Address `REV-005` with CSP, path, file-type, size, error, and safe process-argument controls for the desktop bridge.                                                                               |
| PRD-000031-TECH   | TECH   | Decompose Application Controller           | Proposed | Backlog | Address `REV-006` by separating document-session, persistence, rendering, desktop, and code-image responsibilities from bootstrap composition.                                                  |
| PRD-000032-TECH   | TECH   | Bound Embedded Asset Persistence            | Proposed | Backlog | Address `REV-007` by bounding embedded assets, handling storage failures, and providing actionable recovery feedback.                                                                            |
| PRD-000033-TECH   | TECH   | Bound Preview Image Cache                   | Proposed | Backlog | Address `REV-008` with bounded image caching and invalidation for changed files and document transitions.                                                                                          |
| PRD-000034-TECH   | TECH   | Schedule Large-Document Rendering           | Proposed | Backlog | Address `REV-009` by coalescing render work and measuring large-document responsiveness without dropping edits.                                                                                    |
| PRD-000035-TECH   | TECH   | Consolidate Markdown Runtime Paths          | Proposed | Backlog | Address `REV-010` by establishing one canonical rendering path and removing duplicated helpers, constants, and unused exports.                                                                  |
| PRD-000036-TECH   | TECH   | Refresh Rendering After Save As             | Proposed | Backlog | Address `REV-011` by making file-path changes invalidate and rerender path-dependent assets immediately.                                                                                          |
| PRD-000037-TECH   | TECH   | Add Bootstrap Failure Boundary              | Proposed | Backlog | Address `REV-012` by showing an actionable fatal-startup state when packaged initialization fails.                                                                                               |
| PRD-000038-TECH   | TECH   | Make Recent-File Hydration Deterministic    | Proposed | Backlog | Address `REV-013` by preventing early recent-file activity from discarding persisted entries during hydration races.                                                                             |
| PRD-000042-UI     | UI     | Extend Theme Surface Colors                 | Proposed | Backlog | Apply the PRD-000043-UI semantic theme tokens to dialogs, popup borders, toasts, and highlighted areas while preserving readability and visual hierarchy. |
| PRD-000043-UI     | UI     | Refine Theme Token System                   | Proposed | Backlog | Establish a more cohesive, restrained visual language for Quill through semantic color roles, clearer elevation, focus states, and polished theme palettes. |

## In Progress

| ID | Class | Short Name | Status | Phase | Brief Description |
| --- | --- | --- | --- | --- | --- |
| PRD-000041-UI | UI | Remove Theme Gradients | In Progress | Implement | Remove gradient treatments from Quill's themes so the application has a more current, restrained visual style while preserving theme distinction and readability. |

## Done

| ID | Class | Short Name | Status | Phase | Brief Description |
| --- | --- | --- | --- | --- | --- |
| PRD-000040-UI | UI | Replace Tauri Chrome With HTML Title Bar | Done | Closed | Replace the current Tauri window chrome with a slightly taller HTML title bar containing the current title plus minimize, restore, and close controls. |
| PRD-000039-CHANGE | CHANGE | Synchronize Markdown And Render Scrolling | Done | Closed | Synchronize edit-driven and manual pane navigation while showing the corresponding current block in both panes. |
| PRD-000027-CHANGE | CHANGE | Detect External File Changes | Done | Closed | Detect when the open file changes outside Quill and prompt the user with safe choices when Quill regains focus. |
| PRD-000002-TECH | TECH | Establish Automated Test Suite | Done | Closed | Establish repeatable automated coverage for Markdown integrity, document persistence, controller workflows, desktop commands, and CI-ready regression checks. |
| PRD-000010-TECH | TECH | Critical Codebase Review And Refactor | Done | Closed | Complete the documented code review and hand off all findings to owning PRDs without implementing follow-on product fixes in this item. |
| PRD-000016-CHANGE | CHANGE | Limit Recent Files To Tauri | Done | Closed | Restrict the Recent Files option to the Tauri desktop runtime instead of exposing it in non-Tauri paths. |
| PRD-000001-TECH | TECH | Split UI Controller | Done | Closed | Reshape the app around a Shell plus Outline Pane, Markdown Pane, and Preview Pane components, including HTML and code naming cleanup. |
| PRD-000005-CHANGE | CHANGE | Bump App Version | Done | Closed | Update the packaged app version to the semver-safe equivalent of release label `1.02`. |
| PRD-000006-UI | UI | Recent Files Picker | Done | Closed | Let users quickly reopen one of the 10 most recently opened files. |
| PRD-000007-TECH | TECH | Remove Electron Runtime | Done | Closed | Replace Electron with Tauri, preserve the desktop file workflows, and ship the desktop runtime and Windows installer from the verified Tauri path. |
| PRD-000011-BUG | BUG | Fix Fenced Markdown Load State | Done | Closed | Prevent fenced code blocks from breaking preview and outline updates during file open, leaving Quill in a half-loaded state. |
| PRD-000012-BUG | BUG | Fix Escaped Pipe Table Rendering | Done | Closed | Prevent render-pane tables from showing extra cells when a cell contains a literal Markdown pipe character as content. |
| PRD-000013-BUG | BUG | Fix Render Stop After Table | Done | Closed | Prevent HTML-like text inside backticked table-cell content from corrupting Quill's live preview render path and stopping the rest of the document from rendering. |
| PRD-000014-BUG | BUG | Fix Table Cell Link Rendering | Done | Closed | Make markdown links inside render-pane table cells behave correctly, including same-document anchor links that should jump to the matching heading within the current rendered markdown, without causing backticked href-like content in general markdown to over-link the rest of the line. |
| PRD-000015-CHANGE | CHANGE | Enable Tauri Window Chrome | Done | Closed | Turn standard window chrome back on in the Tauri desktop configuration instead of keeping the desktop shell frameless. |
| PRD-000008-TECH | TECH | Refactor Stylesheet Structure | Done | Closed | Reshape the CSS into clearer sections and ownership boundaries so shell, panes, dialogs, and theme tokens are easier to maintain. Break themes into separate named stylesheets covering colors, fonts, and rendering styles. |
| PRD-000017-TECH | TECH | Centralize Product Version Source | Done | Closed | Centralize Quill's product version in one shared source that both the UI and Tauri build configuration can consume so the displayed version and shipped build stay aligned. |
| PRD-000018-BUG | BUG | Fix Relative Image Rendering | Done | Closed | Render valid Markdown images in the application render view, including fully specified local image paths as well as relative and online image sources. |
| PRD-000020-CHANGE | CHANGE | Remove Browser Mode Paths | Done | Closed | Remove broader browser-mode code paths so Quill is shaped around the packaged desktop runtime as its supported end-user experience. |
| PRD-000022-BUG | BUG | Fix Minimal Document Render Layout | Done | Closed | Keep the Render pane full-height and top-aligned when a new or minimal document is displayed. |
| PRD-000009-UI | UI | Expanded Theme Selector | Done | Closed | Add more built-in themes and replace the cycle-only theme control with a named dropdown selector that persists the user's choice. |
| PRD-000024-UI | UI | Compact Outline Pane | Done | Closed | Remove the Outline header and non-essential spacing around Outline entries so more headings fit vertically while navigation and hierarchy remain clear. |
| PRD-000025-BUG | BUG | Fix Angle Bracket Rendering | Done | Closed | Preserve literal angle-bracket text such as `<TEST>` when it appears in a normal rendered Markdown paragraph. |
| PRD-000026-CHANGE | CHANGE | Improve Recent Files Usability | Done | Closed | Make stale entries visible earlier, keep the current file from unexpectedly reordering the list, overlay row removal controls, and add copy-path and Explorer actions. |
