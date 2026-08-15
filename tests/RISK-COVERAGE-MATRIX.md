# Automated test risk coverage matrix

This matrix governs Quill's automated test coverage. Coverage decisions are based on the consequence and regression likelihood of each behavior, not a line, branch, function, or statement percentage. A change that affects a listed behavior must preserve its required coverage or update this matrix with a documented rationale.

## Coverage rules

- `Critical`: data loss, source corruption, stale state, or a broken canonical test signal. Exhaustive deterministic contract cases are required for known boundaries.
- `High`: a core editing or desktop workflow can fail, but recovery remains possible. Representative success, cancellation, edge, and failure cases are required.
- `Moderate`: a localized behavior can regress without corrupting a document. Table-driven representative cases are required where automation is practical.
- Automated coverage must remain independent of network access, user files, user storage, real dialogs, wall-clock timing, fixed sleeps, browser downloads, execution order, prior runs, and hosted CI services.
- Test doubles, controlled promises, explicit sequence values, repository fixtures, and per-test temporary directories are the approved deterministic substitutes.
- Numeric code-coverage thresholds are not used. Missing risk coverage is visible as a matrix row whose status is not `covered`.

## Matrix

| Risk area | Priority | Required coverage | Current automated coverage | Status |
| --- | --- | --- | --- | --- |
| Markdown parsing changes document structure incorrectly | High | Table-driven block-boundary and syntax cases | `tests/node/markdown-parsing.test.js` | covered |
| Markdown rendering or URL sanitization emits incorrect or unsafe output | High | Table-driven rendering, escaping, link, and sanitization cases | `tests/node/markdown-rendering.test.js` | covered |
| Table parsing or rendering changes cell boundaries or content | High | Escaped-cell and inline-rendering cases | `tests/node/markdown-tables.test.js` | covered |
| Block conversion or serialization changes supported Markdown unexpectedly | High | Table-driven block conversion and serialization cases | `tests/node/markdown-serialization.test.js` | covered |
| Render-pane edits alter bytes outside the owned source range | Critical | Supported and unsupported fixture pairs with byte-exact outside-range assertions | `tests/node/markdown-source-preservation.test.js` | covered |
| Delayed or out-of-order saves clear newer dirty state | Critical | Controlled deferred writes covering current, stale, failed, cancelled, path-change, and document-change outcomes | `tests/node/persistence-latest-edit-wins.test.js` | covered |
| Draft recovery selects stale content | Critical | Explicit revision, saved-sequence, and document-identity cases | `tests/node/persistence-draft-recovery.test.js` | covered |
| Controller orchestration mishandles success, cancellation, failure, stale timers, or missing dependencies | High | Injected fake bridge, storage, clock, dialogs, and event ports | `tests/node/controller-workflows.test.js` | covered |
| Desktop path, MIME, read, or write contracts regress | High | Pure-helper cases and isolated per-test temporary-file contracts | `tests/rust/desktop_commands.rs` | covered |
| Canonical runner stops reporting a failing automated layer | Critical | Node and Rust harness assertions with controlled failure support | `tests/node/test-harness.test.js`; `tests/rust/test_harness.rs` | covered |
| Test implementation gains an external or environment-dependent runtime requirement | Critical | Static determinism contract over automated sources and root runner configuration | `tests/node/determinism-contract.test.js` | covered |

## Priority-5 regression handoff

The product fixes remain outside `PRD-000002-TECH`. Their owning PRD must activate the listed contract against the production implementation during its approved Implement phase. Until then, the contract remains an actionable model of the required behavior and must stay green in the canonical suite.

| Review finding | Required product contract | Owning product-fix PRD | Activation point | Regression contract and failure signal |
| --- | --- | --- | --- | --- |
| `REV-001` | A Render-pane edit changes only its owned source range; every untouched byte remains stable. | `PRD-000010-TECH` | Activate when its approved refactoring slice introduces the lossless source-backed edit model. | `tests/node/markdown-source-preservation.test.js` reports the first unexpected byte change outside the owned range. |
| `REV-002` | A stale save completion cannot clear dirty state for a newer revision. | `PRD-000010-TECH` | Activate when its approved refactoring slice introduces revision-aware production persistence. | `tests/node/persistence-latest-edit-wins.test.js` identifies the save ordering and dirty revision that violated latest-edit-wins. |
| `REV-003` | Startup recovery selects the newest valid draft without overwriting it with default content. | `PRD-000023-CHANGE` | Activate while replacing the current local-draft behavior with the planned file-persistence and recovery policy. | `tests/node/persistence-draft-recovery.test.js` identifies the document identity or revision sequence recovered incorrectly. |

If an owner or activation point changes during planning, update this matrix and the owning PRD's audit record before implementing the product fix.

## Seeded-failure signal

`QUILL_TEST_SEED_FAILURE=node` makes the Node harness fail with `Controlled Node test-layer failure was requested.` `QUILL_TEST_SEED_FAILURE=rust` lets Node complete and then makes the Rust harness fail with `Controlled Rust test-layer failure was requested.` In both cases the canonical `npm test` command returns a non-zero exit code; exact PowerShell commands are documented in `tests/README.md`.

## Review rule

Review this matrix whenever a change adds a new persistence path, source transformation, controller dependency, desktop command, or test runtime dependency. Priority-5 product-fix ownership and activation handoffs are intentionally reserved for `AC-09`.
