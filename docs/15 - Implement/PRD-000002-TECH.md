# PRD-000002-TECH

## Short Name

Establish Automated Test Suite

## Goal

Establish a repeatable automated test suite that protects Quill's Markdown integrity, document persistence, controller workflows, desktop commands, and highest-risk regression paths.

## Context

The refactor work created clearer module boundaries, which makes focused tests more practical and more valuable. The `PRD-000010-TECH` code review found that the repository has no executable JavaScript or Rust test suite, `cargo test` reports zero tests, and the existing browser smoke page is manual and timing-based. This leaves the priority-5 document-integrity, save-race, and draft-recovery risks without a durable regression harness.

## Scope

In:

- a single documented `npm test` command that runs every automated JavaScript and Rust test layer
- a root-level `tests/` folder containing all repository-authored automated test suites, fixtures, fakes, and supporting test data, organized by test layer
- table-driven Markdown parsing, rendering, sanitization, and block round-trip coverage using Node's built-in test runner
- source-preservation fixtures requiring byte-for-byte stability for untouched supported and unsupported Markdown, with normalization limited to the block explicitly edited through the Render pane
- document persistence and revision-state tests enforcing latest-edit-wins behavior across delayed and out-of-order saves, dirty-state transitions, and newest-draft recovery
- controller tests using fake desktop-bridge, storage, clock, and dialog dependencies, supported by only the behavior-preserving dependency seams required for deterministic testing
- a human-executed UI regression checklist for open, save, Save As, inline editing, desktop-bridge availability, and other critical application wiring
- Rust tests using isolated temporary files to cover current path/name behavior, MIME-by-extension decisions, read/write contracts, unusual filenames, empty or missing paths, and I/O errors
- deterministic, non-interactive execution with no network, user-file, user-storage, arbitrary-sleep, or hosted-CI dependency
- a risk-based coverage matrix instead of a numeric code-coverage threshold, including a defined regression-test handoff for the priority-5 findings owned by other PRDs

Out:

- a comprehensive visual-regression suite or full operating-system matrix
- automated browser testing, packaged-Tauri GUI automation, or visual regression; these may become later backlog work
- hosted CI service configuration; the automated command must be CI-compatible but will initially be run locally
- performance benchmarking beyond fixtures needed to keep tests deterministic
- implementation of the product fixes identified by `REV-001`, `REV-002`, or `REV-003`
- desktop trust-boundary policies owned by `REV-005`, including new size limits, signature validation, extension restrictions, canonicalization rules, or structured security errors
- unrelated product refactoring or feature work

## Plan

1. **Establish the canonical command, folder layout, and runner contract.** Create a root-level `tests/` folder as the single home for all repository-authored automated tests, fixtures, fakes, and supporting test data, with clear subfolders for each layer. Configure one root `npm test` command to run the complete automated suite from that structure. Use Node's built-in `node:test` runner for JavaScript tests and `cargo test --manifest-path src-tauri/Cargo.toml` for Rust tests, configuring explicit test targets where needed so Rust test sources also remain under the root test folder. The command must stop with a non-zero exit code when either layer fails. Do not add Jest, Vitest, Playwright, browser downloads, or hosted-CI configuration.
2. **Create the Markdown table-driven suite.** Build focused cases around the public parsing, rendering, inline-token, URL-sanitization, table, block-conversion, and Markdown-serialization paths. Organize cases as readable input/expected-output tables so edge cases can be extended without duplicating harness code.
3. **Build the source-preservation corpus.** Add fixtures containing both supported and unsupported Markdown, nuanced whitespace, blank-line structure, nested or uncommon syntax, code fences, tables, escaped content, links, and literal HTML-like text. Untouched documents and untouched ranges must remain byte-for-byte stable. When a Render-pane block is explicitly edited, only that block's owned source range may normalize; unsupported content that cannot be edited losslessly must remain unchanged.
4. **Model persistence and revision races.** Introduce deterministic fake writes and a controllable clock or deferred-promise mechanism. Cover a save snapshot followed by a newer edit, overlapping saves completing out of order, failed and cancelled saves, document/path changes during a save, dirty-state clearing only for the matching latest revision, and recovery of the newest locally persisted draft. The tests define the latest-edit-wins contract; implementation of the known `REV-002` and `REV-003` product corrections remains with their owning work.
5. **Create narrow controller test seams.** Extract or inject only the document-session, desktop-bridge, storage, clock, and dialog boundaries needed to test controller behavior without a browser or user machine. Preserve user-visible behavior and keep broader `quill-app.js` decomposition under its existing refactoring ownership. Cover success, cancellation, failure, stale completion, and missing-dependency paths.
6. **Define the manual UI regression suite.** Replace automated browser integration in this PRD with a human-executed checklist. Specify preconditions, steps, and observable expected results for application startup, open, save, Save As, dirty-state prompts, inline editing, source preservation, missing desktop bridge, and the critical controller workflows protected below the UI. Keep this checklist outside `npm test` and record executions during the Test phase when relevant.
7. **Add isolated Rust coverage.** Test pure helpers directly and exercise current read/write command contracts in per-test temporary directories. Cover path/name extraction, MIME selection by extension, successful Markdown reads and writes, empty and missing paths, unusual filenames, and representative I/O failures. Do not touch user files. Record future trust-boundary cases in a reusable matrix, but do not add failing or skipped assertions for policies not yet implemented.
8. **Enforce determinism and risk ownership.** Keep automated tests independent of network access, user storage, real dialogs, wall-clock timing, fixed sleeps, execution order, and prior runs. Use a risk-based coverage matrix rather than a percentage gate. Map `REV-001`, `REV-002`, and `REV-003` to their required regression contracts and owning PRDs so those tests are activated with the corresponding fixes while the canonical suite remains actionable and green.
9. **Deliver in safety-first slices.** Implement the root harness and Markdown tests first, then source-preservation fixtures, persistence/controller fakes, Rust tests, and finally the manual UI checklist and documentation. After each slice, run the canonical command and retain a deliberate seeded-failure check proving that the layer reports a non-zero result when an assertion is broken.

## Acceptance Criteria

- `AC-01`: All repository-authored automated tests, fixtures, fakes, and supporting test data are stored under the root-level `tests/` folder, and one documented `npm test` command runs the complete Node and Rust suites from that structure locally and returns a non-zero exit code if either layer fails.
- `AC-02`: Table-driven Node tests cover Quill's Markdown parsing, rendering, sanitization, table, block-conversion, and serialization boundaries with maintainable input/expected-output cases.
- `AC-03`: The fixture corpus requires byte-for-byte preservation of untouched supported and unsupported Markdown, while permitting normalization only inside the source range of a block explicitly edited through the Render pane.
- `AC-04`: Deterministic persistence tests define latest-edit-wins behavior for delayed and out-of-order saves, newer edits, dirty-state transitions, failure/cancellation, path or document changes, and recovery of the newest local draft.
- `AC-05`: Controller tests use fake desktop-bridge, storage, clock, and dialog dependencies through narrow behavior-preserving seams, without authorizing broader application refactoring.
- `AC-06`: A human-executed UI regression checklist defines reproducible preconditions, steps, and expected results for the critical application workflows; automated browser and packaged-Tauri UI testing are explicitly deferred.
- `AC-07`: Rust tests use isolated temporary files and cover current path/name helpers, MIME-by-extension decisions, read/write contracts, unusual filenames, empty or missing paths, and representative I/O failures without implementing future trust-boundary policy.
- `AC-08`: Automated tests require no network, user files, user storage, real dialogs, fixed sleeps, execution order, browser download, or hosted-CI service, and coverage is governed by the documented risk matrix rather than a numeric percentage.
- `AC-09`: The coverage matrix maps the `REV-001`, `REV-002`, and `REV-003` regression contracts to their owning product-fix work, and each automated layer has a demonstrated seeded-failure path that makes `npm test` fail predictably.

## Verification

| Test Case | Criteria | Product Version | Status | Description | Evidence |
| --- | --- | --- | --- | --- | --- |
| `TC-01` | `AC-01` | `pending` | `planned` | Verify all repository-authored automated test assets are located under root `tests/`; run `npm test`, verify that it invokes the Node and Rust layers from that structure, then seed one controlled failure in each layer and confirm a non-zero result. | Not yet recorded. |
| `TC-02` | `AC-02` | `pending` | `planned` | Run representative table-driven Markdown cases and verify parsing, rendering, sanitization, table, conversion, and serialization results. | Not yet recorded. |
| `TC-03` | `AC-03` | `pending` | `planned` | Exercise supported and unsupported corpus fixtures, verifying byte stability outside the one explicitly edited block range. | Not yet recorded. |
| `TC-04` | `AC-04` | `pending` | `planned` | Use deferred fake writes and draft storage to verify latest-edit-wins behavior across newer edits, out-of-order completion, failures, path changes, and recovery. | Not yet recorded. |
| `TC-05` | `AC-05` | `pending` | `planned` | Run controller success, cancellation, failure, stale-completion, and missing-dependency cases using the approved fake dependencies. | Not yet recorded. |
| `TC-06` | `AC-06` | `pending` | `planned` | Execute the documented human UI regression checklist and record results for the critical open, save, Save As, inline-editing, source-preservation, and bridge-availability workflows. | Not yet recorded. |
| `TC-07` | `AC-07` | `pending` | `planned` | Run Rust helper and command tests against isolated temporary files, including successful, unusual-path, empty-path, missing-path, and I/O-failure cases. | Not yet recorded. |
| `TC-08` | `AC-08` | `pending` | `planned` | Run the automated suite from a clean local state and verify it needs no network, browser, real dialogs, user data, fixed sleeps, prior results, or hosted-CI environment. | Not yet recorded. |
| `TC-09` | `AC-09` | `pending` | `planned` | Review the risk matrix and verify each priority-5 regression contract has an explicit owner, activation point, and actionable failure signal. | Not yet recorded. |

## Next Step

Validate this expanded plan for promotion readiness, then explicitly promote the item to `Implement` before making test-harness or product-source changes.

## History

| Timestamp | Stage |
| --- | --- |
| 2026-07-12T13:09:10.6398072Z | Backlog |
| 2026-08-14T18:28:36.3507180Z | Plan |
| 2026-08-14T18:53:01.8793931Z | Implement |

## Audit

| Timestamp | Type | Detail |
| --- | --- | --- |
| 2026-07-12T13:09:21.2378048Z | Backfill | Replaced the placeholder `Backlog` timestamp during the consistency sweep. The original PRD creation time was not captured; the item remains in `Backlog` and is waiting to move into `10 - Plan`. |
| 2026-08-14T18:18:16.3763969Z | Requirement shaping | User approved strengthening this existing PRD instead of creating a duplicate for `REV-004`. Scope now incorporates the automated-verification findings from [PRD-000010-TECH-Code-Review.md](../90%20-%20Evidence/PRD-000010-TECH-Code-Review.md), including controller, browser-integration, Rust-command, and CI-ready coverage. |
| 2026-08-14T18:28:36.4540367Z | Promotion | User confirmed promotion from Backlog to Plan after the identity, structure, alignment, and workflow checks passed. |
| 2026-08-14T18:43:52.5117142Z | Requirement shaping | Expanded the Plan through a user-directed `prd-grill-me` pass. Decisions: one canonical `npm test`; built-in `node:test` plus `cargo test`; byte-exact untouched-source preservation; latest-edit-wins persistence contracts; narrow fakeable controller seams; human-executed UI regression instead of automated browser testing; isolated current-contract Rust tests; deterministic local execution without hosted CI; and risk-based coverage without a percentage gate. Product fixes for `REV-001` through `REV-003` and trust-boundary policy from `REV-005` remain outside this PRD. |
| 2026-08-14T18:51:20.8128936Z | Requirement clarification | User required all repository-authored automated tests and their supporting assets to be stored in a root-level `tests/` folder. The plan, acceptance criterion, and verification case now make that layout explicit for both Node and Rust test layers. |
| 2026-08-14T18:53:01.8793931Z | Promotion | User confirmed promotion from Plan to Implement after identity, structure, content, alignment, and workflow checks passed. |

## Legacy Notes

- This PRD includes a repaired `Backlog` capture from an earlier consistency sweep, so the original creation event was not recorded just in time.

