# Quill Backlog

`BACKLOG.md` is the canonical source of truth for PRD items, their overall status, and their current workflow phase. Promotion, structure, and code-authorization rules live in [.agents/lifecyle-agent/lifecyle-agent.md](.agents/lifecyle-agent/lifecyle-agent.md).

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
| PRD-000009-UI | UI | Expanded Theme Selector | In Progress | Implement | Add more built-in themes and replace the cycle-only theme control with a named dropdown selector that persists the user's choice. |
| PRD-000010-TECH | TECH | Critical Codebase Review And Refactor | Proposed | Backlog | Review the current codebase critically, document the highest-value structural issues, and carry out follow-on refactoring to improve maintainability. |
| PRD-000019-CHANGE | CHANGE | Externalize Default Getting Started Guide | Proposed | Backlog | Store the default getting-started guide in a deployed Markdown document and load it through Quill's supported desktop runtime. |
| PRD-000021-TECH | TECH | TypeScript Migration For Frontend Runtime | Proposed | Backlog | Plan and execute a staged TypeScript migration for Quill's frontend runtime and desktop bridge so the editor gains stronger module contracts, safer state handling, and better refactor support. |
| PRD-000023-CHANGE | CHANGE | Make AutoSave Persist Open Files | Proposed | Backlog | Make AutoSave write changes to the current file with clear status feedback and a tuned save interval. |
| PRD-000025-BUG | BUG | Fix Angle Bracket Rendering | Done | Closed | Preserve literal angle-bracket text such as `<TEST>` when it appears in a normal rendered Markdown paragraph. |
| PRD-000024-UI | UI | Compact Outline Pane | Done | Closed | Remove the Outline header and non-essential spacing around Outline entries so more headings fit vertically while navigation and hierarchy remain clear. |

## In Progress

| ID | Class | Short Name | Status | Phase | Brief Description |
| --- | --- | --- | --- | --- | --- |

## Done

| ID | Class | Short Name | Status | Phase | Brief Description |
| --- | --- | --- | --- | --- | --- |
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
