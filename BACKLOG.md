# Quill Backlog

`BACKLOG.md` indexes only PRDs currently in `docs/05 - Backlog/`. The PRD folder controls the item's active lifecycle phase; blocked PRDs are held in `docs/06 - Blocked/` and are not listed here. Promotion, structure, and code-authorization rules live in [.agents/lifecyle-agent/lifecyle-agent.md](.agents/lifecyle-agent/lifecyle-agent.md).

## Backlog

| ID                | Class  | Short Name                                | Status   | Phase   | Brief Description |
| ----------------- | ------ | ----------------------------------------- | -------- | ------- | ----------------- |
| PRD-000003-CHANGE | CHANGE | Remove Cache Busting                      | Proposed | Backlog | Remove static asset query-string cache busting once the app's loading and release approach is settled. |
| PRD-000004-UI     | UI     | Accessibility Pass                        | Proposed | Backlog | Review keyboard behaviour, focus handling, labels, and error feedback across the editor and preview flows. |
| PRD-000019-CHANGE | CHANGE | Externalize Default Getting Started Guide | Proposed | Backlog | Store the default getting-started guide in a deployed Markdown document and load it through Quill's supported desktop runtime. |
| PRD-000023-CHANGE | CHANGE | Make AutoSave Persist Open Files          | Proposed | Backlog | Make AutoSave write changes to the current file with clear status feedback and a tuned save interval. |
| PRD-000028-TECH   | TECH   | Preserve Untouched Markdown Source         | Proposed | Backlog | Address `REV-001` by making Render-pane edits lossless outside the explicitly edited source range. |
| PRD-000029-TECH   | TECH   | Make Saves Revision-Aware                 | Proposed | Backlog | Address `REV-002` by preventing stale asynchronous save completions from clearing newer dirty state. |
| PRD-000030-TECH   | TECH   | Harden Desktop Trust Boundary            | Proposed | Backlog | Address `REV-005` with CSP, path, file-type, size, error, and safe process-argument controls for the desktop bridge. |
| PRD-000031-TECH   | TECH   | Decompose Application Controller          | Proposed | Backlog | Address `REV-006` by separating document-session, persistence, rendering, desktop, and code-image responsibilities from bootstrap composition. |
| PRD-000032-TECH   | TECH   | Bound Embedded Asset Persistence           | Proposed | Backlog | Address `REV-007` by bounding embedded assets, handling storage failures, and providing actionable recovery feedback. |
| PRD-000033-TECH   | TECH   | Bound Preview Image Cache                 | Proposed | Backlog | Address `REV-008` with bounded image caching and invalidation for changed files and document transitions. |
| PRD-000034-TECH   | TECH   | Schedule Large-Document Rendering         | Proposed | Backlog | Address `REV-009` by coalescing render work and measuring large-document responsiveness without dropping edits. |
| PRD-000035-TECH   | TECH   | Consolidate Markdown Runtime Paths        | Proposed | Backlog | Address `REV-010` by establishing one canonical rendering path and removing duplicated helpers, constants, and unused exports. |
| PRD-000036-TECH   | TECH   | Refresh Rendering After Save As           | Proposed | Backlog | Address `REV-011` by making file-path changes invalidate and rerender path-dependent assets immediately. |
| PRD-000037-TECH   | TECH   | Add Bootstrap Failure Boundary            | Proposed | Backlog | Address `REV-012` by showing an actionable fatal-startup state when packaged initialization fails. |
| PRD-000038-TECH   | TECH   | Make Recent-File Hydration Deterministic  | Proposed | Backlog | Address `REV-013` by preventing early recent-file activity from discarding persisted entries during hydration races. |
| PRD-000042-UI     | UI     | Extend Theme Surface Colors               | Proposed | Backlog | Apply the PRD-000043-UI semantic theme tokens to dialogs, popup borders, toasts, and highlighted areas while preserving readability and visual hierarchy. |
| PRD-000043-UI     | UI     | Refine Theme Token System                 | Proposed | Backlog | Establish a more cohesive, restrained visual language for Quill through semantic color roles, clearer elevation, focus states, and polished theme palettes. |
| PRD-000045-CHANGE | CHANGE | Remove AutoSave Features                 | Proposed | Backlog | Remove automatic saving and its dedicated UI, timers, draft-recovery plumbing, tests, and unused dependencies while preserving manual Save and Save As. |
| PRD-000047-UI     | UI     | Add Compact Startup Window                | Proposed | Backlog | Show startup in a compact centered window sized around the loading surface, then expand to Quill's configured default dimensions when ready. |
