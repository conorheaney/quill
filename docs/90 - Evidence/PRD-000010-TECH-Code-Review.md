# PRD-000010-TECH Code Review

## Review Record

| Field | Value |
| --- | --- |
| PRD | `PRD-000010-TECH` |
| Reviewed at | `2026-08-14T00:03:47.2172608Z` |
| Review type | Static architecture, correctness, resilience, security-boundary, maintainability, and testability review |
| Product version | `1.0.12` |
| Decision values | Every finding has a final `DEFER` disposition with an owning follow-on PRD; product implementation is outside this review record. |

## Priority Scale

| Priority | Meaning |
| --- | --- |
| 5 | Critical: credible data-loss, corruption, or trust-boundary risk; address first. |
| 4 | High: major regression exposure or structural risk; address in the first approved slices. |
| 3 | Medium: material performance, reliability, or maintainability cost. |
| 2 | Low: bounded robustness or cleanup improvement. |
| 1 | Minor: optional polish with limited operational impact. |

## Executive Summary

Quill has a sensible pane split and a deliberately small desktop bridge, but document correctness is not protected by a lossless source model or automated regression tests. The most important risks are the rendered editor's whole-document lossy round trip, stale asynchronous saves clearing the dirty state, and local draft content being overwritten rather than restored at startup.

The recommended first slice is a document-safety foundation: introduce regression tests, preserve source outside the specifically edited block, track document revisions across asynchronous saves, and make draft persistence recoverable. Security-boundary hardening and controller decomposition should follow once these behaviours are pinned down by tests.

## Review Ledger

| Review ID | Priority | Area | Finding | Recommendation | Decision (IMPLEMENT / DEFER) |
| --- | ---: | --- | --- | --- | --- |
| `REV-001` | 5 | Markdown integrity | Inline preview edits serialize the entire document through a deliberately limited block model, so unsupported or nuanced Markdown can be changed outside the edited block. | Introduce a lossless source-backed edit model and prove that unedited source ranges remain byte-for-byte stable. | `DEFER — PRD-000028-TECH` |
| `REV-002` | 5 | File persistence | An asynchronous save captures one content revision but unconditionally clears the dirty flag when it finishes, even if the user edited again while the write was pending. | Track monotonically increasing document revisions and only clear dirty state when the completed write matches the latest revision. | `DEFER — PRD-000029-TECH` |
| `REV-003` | 5 | Draft recovery | Local draft content is written but never read; startup loads the built-in guide and then overwrites the previous draft. | Add explicit draft recovery metadata and startup restoration; coordinate ownership with `PRD-000023-CHANGE`. | `DEFER — PRD-000023-CHANGE` |
| `REV-004` | 4 | Automated verification | No executable unit or integration test suite protects the parser, block conversion, persistence state machine, or Rust commands. | Own the repeatable test command and CI-oriented suites under the strengthened `PRD-000002-TECH`. | `DEFER — PRD-000002-TECH (complete)` |
| `REV-005` | 4 | Desktop trust boundary | The WebView has no CSP while custom commands accept arbitrary paths for reading text/images, writing files, and launching Explorer. | Define a restrictive CSP and harden every command with canonicalization, file-type/size rules, explicit error types, and safer process arguments. | `DEFER — PRD-000030-TECH` |
| `REV-006` | 4 | Architecture | The 950-line application controller owns bootstrap, document state, persistence, rendering, dialogs, code-image generation, recent files, and pane coordination through ordered `window.*` globals. | Extract a document-session state machine and narrow services before or alongside the staged TypeScript work in `PRD-000021-TECH`. | `DEFER — PRD-000031-TECH` |
| `REV-007` | 4 | Storage resilience | Dropped images and generated code images become base64 Markdown, while synchronous `localStorage` writes have no quota/error handling. | Bound embedded asset sizes, report persistence failures, and prefer file-backed assets or a durable draft store for large content. | `DEFER — PRD-000032-TECH` |
| `REV-008` | 3 | Image lifecycle | The preview image cache retains base64 promises indefinitely and does not detect files changed on disk. | Use a bounded cache with invalidation on document/path changes and file metadata, or short-lived object URLs. | `DEFER — PRD-000033-TECH` |
| `REV-009` | 3 | Render performance | Every input event synchronously reparses the full document, replaces the full preview DOM, rebuilds the outline, and starts image hydration. | Coalesce rendering with `requestAnimationFrame` or a short debounce, measure large documents, and avoid work when affected state is unchanged. | `DEFER — PRD-000034-TECH` |
| `REV-010` | 3 | Duplication and dead code | Markdown has two rendering routes, language normalization is duplicated, storage constants are duplicated/unused, and the exported `renderMarkdown` path has no caller. | Establish one canonical parsing/rendering path, centralize shared helpers/constants, and remove unused exports after coverage exists. | `DEFER — PRD-000035-TECH` |
| `REV-011` | 3 | Path-dependent rendering | Save As changes the current file path but does not rerender, leaving relative-image resolution based on the previous path until another edit occurs. | Treat a path change as document-context state and immediately rerender/re-hydrate path-dependent assets. | `DEFER — PRD-000036-TECH` |
| `REV-012` | 2 | Startup resilience | Bootstrap dynamically fetches fragments inside an async IIFE without a top-level failure boundary, so one missing asset can abort initialization without an in-app diagnostic. | Add a caught bootstrap boundary and a minimal fatal-startup view; consider build-time/static template composition. | `DEFER — PRD-000037-TECH` |
| `REV-013` | 2 | Recent-files state | Recent-file hydration can race with early user activity; if an entry is recorded first, hydration returns and silently discards the previously persisted list. | Await hydration before enabling the controller or merge persisted and in-memory entries deterministically. | `DEFER — PRD-000038-TECH` |

## Detailed Findings

### REV-001 — Lossy whole-document round trip from inline editing

**Evidence**

- [parseMarkdownBlocks](../../frontend/scripts/markdown.ts#L545) recognizes only headings, fenced code, simple tables, contiguous blockquotes, flat ordered/unordered lists, and paragraphs. It trims paragraph lines and drops blank-line structure.
- [blocksToMarkdown](../../frontend/scripts/markdown.ts#L689) reconstructs every block with normalized spacing and syntax.
- [onBlocksCommitted](../../frontend/scripts/quill-app.ts#L404) serializes all preview blocks and replaces the full Markdown textarea after editing one rendered block.

**Impact**

Opening inline editing and changing one block can rewrite unrelated content. Nested lists, task-list markers, indented code, thematic breaks, raw HTML, comments, reference definitions, unusual fence syntax, table alignment, deliberate blank lines, and other unsupported constructs can be normalized or lost. This is a document-corruption risk because the UI presents the operation as a local block update.

**Recommendation**

Represent blocks with stable IDs plus source offsets and patch only the selected source range. If a library AST is adopted, retain raw source slices/trivia for unsupported nodes rather than serializing the entire document from the reduced model. Disable inline editing for a block when a lossless write-back cannot be guaranteed.

**Completion signal**

A corpus covering supported and unsupported Markdown proves that editing one block changes only its owned source range; all other bytes remain unchanged.

### REV-002 — Stale save completion can clear newer dirty state

**Evidence**

- [handleSaveDocument](../../frontend/scripts/quill-app.ts#L346) captures `markdownPane.getValue()` before awaiting the desktop write.
- After the await, it calls the typed document-status boundary after the desktop write.
- Input occurring during the write calls `markDirty(true)`, but there is no revision token or pending-save identity.

**Impact**

If the user types while a save is in progress, the disk can contain the older snapshot while Quill reports the newer editor contents as clean. A subsequent close may therefore omit the unsaved-change warning.

**Recommendation**

Increment a document revision on every mutation. Capture `{revision, content, path}` at save start and clear dirty state only if the completed revision still equals the current revision and the active document/path has not changed. Serialize or supersede overlapping writes and expose pending/failed state explicitly.

**Completion signal**

An automated delayed-write test edits during save and verifies that the dirty marker remains set until the newest revision is written successfully.

### REV-003 — Autosave draft is overwritten, not recovered

**Evidence**

- [storage.ts](../../frontend/scripts/storage.ts#L12) exposes `saveDraft` but no corresponding draft read operation.
- Startup calls `setDocumentContent(DEFAULT_CONTENT, ...)` in [quill-app.ts](../../frontend/scripts/quill-app.ts), then writes that content back to draft storage when autosave is enabled.
- [setDocumentContent](../../frontend/scripts/quill-app.ts#L212) also persists content unconditionally, independent of the autosave preference.

**Impact**

A previous local draft cannot be recovered through the application and is overwritten by the getting-started guide on the next launch. The autosave toggle also does not consistently control draft writes.

**Recommendation**

Define draft metadata containing content, source path, document ID, revision, dirty state, and timestamp. Restore or offer recovery before loading fallback content. Route all draft writes through one persistence coordinator that respects the preference and reports failures. `PRD-000023-CHANGE` already owns expanded autosave behaviour, so triage should decide whether this finding is implemented there or in the first safety slice of this PRD.

**Completion signal**

Restart tests cover untitled and file-backed dirty drafts, autosave disabled, explicit discard, and successful disk save without silently losing recoverable content.

### REV-004 — No automated regression suite

**Evidence**

- [package.json](../../package.json) has no `test`, lint, or type-check script.
- Repository search found no JavaScript or Rust unit-test definitions.
- `cargo test --manifest-path src-tauri/Cargo.toml` compiled successfully but reported `0 passed; 0 failed; 0 tests`.
- [frontend/smoke-check.html](../../frontend/smoke-check.html) is a useful manual/browser harness but is not invoked by a repository script and has timing-based assertions presented only as JSON output.

**Impact**

The most complex code—Markdown parsing and serialization—has repeatedly accumulated edge-case fixes without a durable executable safety net. Refactoring the controller or parser would carry disproportionate regression risk.

**Recommendation**

Create fast table-driven unit tests for Markdown/token/URL/path helpers, round-trip corpus tests, controller tests with fake bridge/storage ports, browser integration coverage for save/load/inline editing, and Rust tests for path validation and MIME decisions. Make one command run them locally and in CI. Coordinate with the existing `PRD-000002-TECH` rather than duplicating ownership.

**Completion signal**

The repository has a documented test command that fails on a seeded regression for each priority-5 finding.

### REV-005 — Broad desktop command surface with CSP disabled

**Evidence**

- [tauri.conf.json](../../src-tauri/tauri.conf.json) sets `app.security.csp` to `null`.
- [main.rs](../../src-tauri/src/main.rs#L59) accepts frontend-provided paths directly for reading Markdown, writing content, reading arbitrary image bytes, and revealing paths in Explorer.
- Image reads have no file-size ceiling, canonical-path policy, or verified MIME inspection; MIME is inferred from extension.
- Explorer is launched with a manually composed raw argument at [main.rs:105](../../src-tauri/src/main.rs#L105).

**Impact**

Any future frontend injection or compromised packaged asset would inherit a powerful local-filesystem bridge. Unlimited reads can also cause memory pressure, and raw argument construction is fragile around unusual filenames.

**Recommendation**

Adopt a restrictive CSP compatible with packaged assets. Canonicalize paths, separate user-dialog grants from subsequent reopen grants, restrict write/read extensions where practical, validate image signatures and size before encoding, return structured error codes, and pass Explorer arguments through safe OS-specific APIs. Add negative tests for empty, missing, oversized, non-image, quoted, UNC, and traversal-like paths.

**Completion signal**

Security tests demonstrate denied out-of-policy operations, CSP is non-null, and allowed desktop workflows continue to pass.

### REV-006 — Application controller has too many responsibilities

**Evidence**

- [quill-app.ts](../../frontend/scripts/quill-app.ts) owns bootstrap and composition while typed adapters own document/session state, draft persistence, rendering, image hydration, dialogs, recent files, keyboard commands, and pane synchronization.
- Modules communicate through ordered `window.Quill*` globals, with script order declared manually in [quill.html:187-196](../../frontend/quill.html#L187).
- `shellState` mixes document identity, transient dialog state, UI preferences, scroll coordination, and persistence timing.

**Impact**

Changes to one workflow can affect unrelated behaviours, state transitions are hard to test without a full DOM, and missing/misordered globals fail at runtime. A direct TypeScript conversion would type the coupling without first improving ownership.

**Recommendation**

Extract: (1) a pure `DocumentSession` state machine, (2) a persistence coordinator, (3) a render coordinator, (4) a desktop gateway, and (5) the code-image tool. Keep pane controllers focused on DOM interaction. Pass dependencies explicitly and make state transitions observable. Align the module format and contracts with `PRD-000021-TECH`.

**Completion signal**

Document open/edit/save/new/recovery transitions can be tested without constructing the full application DOM, and `quill-app.ts` remains composition/bootstrap rather than business logic.

### REV-007 — Embedded assets can exhaust synchronous draft storage

**Evidence**

- Dropped images are converted to data URLs with `FileReader.readAsDataURL` in [file-drop-controller.ts](../../frontend/scripts/file-drop-controller.ts).
- Code-snippet images are inserted as canvas data URLs in [code-image-tool.ts](../../frontend/scripts/code-image-tool.ts).
- Every edit schedules a synchronous `localStorage.setItem` through [storage.ts:12-14](../../frontend/scripts/storage.ts#L12), with no `try/catch` or error result.

**Impact**

One or more large images can rapidly expand the Markdown document, block the UI during serialization, exceed WebView storage quota, and leave the persistent “SAVING...” toast misleadingly unresolved after an exception.

**Recommendation**

Set explicit asset and document size limits, catch and classify quota failures, and show persistent recovery guidance. Prefer copying dropped/generated assets beside a saved document or storing drafts in a durable desktop-managed store instead of localStorage.

**Completion signal**

Oversized input is rejected or handled without freezing, data loss, or false saved status; quota-failure tests produce an actionable in-app message.

### REV-008 — Preview image cache is unbounded and stale

**Evidence**

- [desktop-bridge.ts:37-55](../../frontend/scripts/desktop-bridge.ts#L37) stores a promise containing each image's base64 payload in a process-lifetime `Map`.
- Successful entries are never evicted or invalidated, including after a file changes on disk or the active document changes.

**Impact**

Long sessions that open many image-heavy documents retain all decoded payloads and can display stale image content for a reused path.

**Recommendation**

Use a bounded LRU keyed by canonical path plus file metadata, clear document-scoped entries on path/document transitions, and consider object URLs with explicit revocation rather than long-lived base64 strings.

**Completion signal**

Cache size is bounded, changed files refresh, and document switches release entries that are no longer needed.

### REV-009 — Full synchronous render pipeline runs on every keystroke

**Evidence**

- [handleMarkdownInput](../../frontend/scripts/quill-app.ts#L193) immediately calls the complete render pipeline for every textarea input event.
- [preview-renderer.ts](../../frontend/scripts/preview-renderer.ts) reparses Markdown, hydrates images, counts words, and triggers layout work.
- [preview-pane.ts:185-203](../../frontend/scripts/preview-pane.ts#L185) replaces the full preview DOM and performs heading layout reads after each render.

**Impact**

Work grows with total document size rather than the edit, and repeated DOM replacement/layout can produce typing latency, scroll instability, and redundant image work on larger documents.

**Recommendation**

Coalesce input through `requestAnimationFrame` or a measured short debounce, separate parse/render/outline/image phases, avoid rebuilding unchanged structures, and add performance fixtures for large prose, tables, and image-heavy documents before considering incremental rendering.

**Completion signal**

Defined large-document fixtures meet an agreed input-to-preview latency budget without dropping the latest edit.

### REV-010 — Duplicate and unused parsing/configuration paths

**Evidence**

- `markdown.ts` contains both `renderMarkdown` and the active `parseMarkdownBlocks` plus `renderBlockContent` route; repository search found no caller for exported `renderMarkdown`.
- `normaliseLanguage` exists in [markdown.ts](../../frontend/scripts/markdown.ts) and the coordinator’s injected code-dialog boundary.
- Storage keys are declared in [app-config.ts:7-8](../../frontend/scripts/app-config.ts#L7) but unused there, while the live copies are in `storage.ts`.
- `RECENT_FILES_LIMIT` is independently declared in `storage.ts` and `recent-files.ts`.

**Impact**

Fixes can land in one path but not another, dead code obscures the supported architecture, and repeated constants can drift silently.

**Recommendation**

After tests cover behaviour, delete the unused renderer or make one route canonical, export one language normalizer, and centralize shared persistence constants/validation. Record an explicit supported-Markdown contract.

**Completion signal**

Each behaviour has one owning implementation and repository search shows no duplicated live constants or unused renderer exports.

### REV-011 — Save As leaves relative-image context stale

**Evidence**

- Rendering derives image context from the typed document-status boundary inside [preview-renderer.ts](../../frontend/scripts/preview-renderer.ts).
- Save/Save As updates the typed document-status boundary in [quill-app.ts](../../frontend/scripts/quill-app.ts).

**Impact**

After saving an untitled document or saving into another directory, relative images can remain unresolved—or remain resolved against the old directory—until a later edit forces a render.

**Recommendation**

Make document path a first-class render-context dependency. When it changes, invalidate path-based image cache entries and rerun path-dependent rendering immediately without marking document content dirty.

**Completion signal**

An integration test saves the same relative-image Markdown into two directories and verifies immediate resolution against the new location each time.

### REV-012 — Bootstrap failures have no application-level boundary

**Evidence**

- [quill-app.ts](../../frontend/scripts/quill-app.ts) starts the async bootstrap.
- Recent-files and theme-selector templates are fetched at runtime; failed responses throw during initialization in [quill-app.ts](../../frontend/scripts/quill-app.ts).

**Impact**

A missing/corrupt packaged fragment or unexpected initialization error can leave the window partially mounted with only a console rejection, providing no recovery guidance.

**Recommendation**

Wrap bootstrap in one error boundary that records the failing stage and renders a minimal accessible fatal-startup panel. Consider composing essential templates at build time so packaged startup has fewer runtime asset dependencies.

**Completion signal**

A test intentionally removes or rejects one fragment and verifies a readable error state rather than a partially initialized shell.

### REV-013 — Recent-file hydration can discard persisted entries

**Evidence**

- Startup calls `recentFilesController.hydrate()` without awaiting it in [quill-app.ts](../../frontend/scripts/quill-app.ts).
- If an entry is recorded before storage resolves, [recent-files.ts:274](../../frontend/scripts/recent-files.ts#L274) returns when `state.entries.length` is nonzero instead of merging the stored list.

**Impact**

Fast user activity or slower storage can reduce the visible recent list to the new in-memory entry for that session, with later persistence potentially replacing the prior list.

**Recommendation**

Hydrate before enabling recent-file actions, or merge by normalized path with deterministic precedence and one limit constant. Make hydration state meaningful and test concurrent record/hydrate orderings.

**Completion signal**

Both orderings—hydrate then record, and record while hydrate is pending—produce the same deduplicated recent-file list.

## Recommended Work Sequence

1. **Safety harness:** decide ownership for `REV-004`, then add regression tests for `REV-001`, `REV-002`, `REV-003`, and `REV-007` before refactoring.
2. **Document integrity:** implement the approved lossless edit strategy (`REV-001`) and revision-aware persistence (`REV-002`/`REV-003`).
3. **Trust boundary:** harden CSP and desktop commands (`REV-005`) while preserving the tested file workflows.
4. **Ownership refactor:** extract the document session and coordinators (`REV-006`), consolidating duplicate paths (`REV-010`).
5. **Runtime resilience:** address render scheduling, cache/path invalidation, startup failure handling, and hydration ordering (`REV-008`, `REV-009`, `REV-011`, `REV-012`, `REV-013`).

## Review Method and Limitations

The review traced the full frontend script set, HTML bootstrap order, storage and desktop bridge, Rust command handlers, Tauri configuration/capabilities, package scripts, and production helper scripts. All frontend JavaScript files passed `node --check`. The Rust project compiled under `cargo test`, which reported zero tests. No product source was changed and no packaged interactive test was performed; runtime and performance impacts called out above are reasoned from the executed paths and should be converted into reproducible tests before implementation.
