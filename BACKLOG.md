# Quill Backlog

`BACKLOG.md` is the canonical source of truth for PRD items, their overall status, and their current workflow phase. Promotion, structure, and code-authorization rules live in [WORKFLOW.md](C:/Users/conor/Documents/Markdown%20Editor/WORKFLOW.md).

## Status

- `Proposed`
- `Planned`
- `In Progress`
- `Blocked`
- `Done`

## Backlogged

| ID | Class | Short Name | Status | Phase | Brief Description |
| --- | --- | --- | --- | --- | --- |
| PRD-000002-TECH | TECH | Add Core Tests | Proposed | Backlog | Add automated coverage for Markdown parsing, block conversion, and persistence behaviour. |
| PRD-000003-CHANGE | CHANGE | Remove Cache Busting | Proposed | Backlog | Remove static asset query-string cache busting once the app's loading and release approach is settled. |
| PRD-000004-UI | UI | Accessibility Pass | Proposed | Backlog | Review keyboard behaviour, focus handling, labels, and error feedback across the editor and preview flows. |
| PRD-000008-TECH | TECH | Refactor Stylesheet Structure | Proposed | Backlog | Reshape the CSS into clearer sections and ownership boundaries so shell, panes, dialogs, and theme tokens are easier to maintain. |
| PRD-000009-UI | UI | Predefined Theme Picker | Proposed | Backlog | Let users choose from a set of predefined themes instead of only cycling between the current built-in options. |
| PRD-000010-TECH | TECH | Critical Codebase Review And Refactor | Proposed | Backlog | Review the current codebase critically, document the highest-value structural issues, and carry out follow-on refactoring to improve maintainability. |

## In Progress

| ID | Class | Short Name | Status | Phase | Brief Description |
| --- | --- | --- | --- | --- | --- |

## Done

| ID | Class | Short Name | Status | Phase | Brief Description |
| --- | --- | --- | --- | --- | --- |
| PRD-000001-TECH | TECH | Split UI Controller | Done | Release | Reshape the app around a Shell plus Outline Pane, Markdown Pane, and Preview Pane components, including HTML and code naming cleanup. |
| PRD-000005-CHANGE | CHANGE | Bump App Version | Done | Release | Update the packaged app version to the semver-safe equivalent of release label `1.02`. |
| PRD-000006-UI | UI | Recent Files Picker | Done | Release | Let users quickly reopen one of the 10 most recently opened files. |
| PRD-000007-TECH | TECH | Remove Electron Runtime | Done | Release | Replace Electron with Tauri, preserve the desktop file workflows, and ship the desktop runtime and Windows installer from the verified Tauri path. |
| PRD-000011-BUG | BUG | Fix Fenced Markdown Load State | Done | Release | Prevent fenced code blocks from breaking preview and outline updates during file open, leaving Quill in a half-loaded state. |
| PRD-000012-BUG | BUG | Fix Escaped Pipe Table Rendering | Done | Release | Prevent render-pane tables from showing extra cells when a cell contains a literal Markdown pipe character as content. |
| PRD-000013-BUG | BUG | Fix Render Stop After Table | Done | Release | Prevent HTML-like text inside backticked table-cell content from corrupting Quill's live preview render path and stopping the rest of the document from rendering. |
| PRD-000014-BUG | BUG | Fix Table Cell Link Rendering | Done | Release | Make markdown links inside render-pane table cells behave correctly, including same-document anchor links that should jump to the matching heading within the current rendered markdown, without causing backticked href-like content in general markdown to over-link the rest of the line. |
| PRD-000015-CHANGE | CHANGE | Enable Tauri Window Chrome | Done | Release | Turn standard window chrome back on in the Tauri desktop configuration instead of keeping the desktop shell frameless. |
