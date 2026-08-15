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

Commit and push the prepared `1.0.13` product candidate to `main`, then request explicit `prd-promote` validation to move this PRD into Test. Execute the manual UI checklist and formal verification evidence only after the PRD enters Test.

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
| 2026-08-14T19:02:49.4277990Z | Implementation scope | User authorized the first implementation slice as `AC-01` only. The current Next Step now limits work to the root test layout and canonical Node-plus-Rust `npm test` command; `AC-02` through `AC-09` remain outside this slice. |
| 2026-08-14T19:07:17.3354002Z | Implementation | Completed the `AC-01` harness slice. Added root `tests/node` and `tests/rust` targets, registered the Rust target in Cargo, documented the layout and canonical command in `tests/README.md`, and configured `npm test` to run Node before Rust. A clean combined run passed; controlled Node and Rust failures each made `npm test` exit with code 1. `AC-02` through `AC-09` were not implemented. |
| 2026-08-14T19:45:56.4544079Z | Implementation scope | User explicitly authorized the `AC-02` slice. Work was limited to maintainable table-driven Node coverage of the existing public Markdown API; product behavior and `AC-03` through `AC-09` remained outside this slice. |
| 2026-08-14T19:45:56.5563896Z | Implementation | Completed the `AC-02` Markdown suite in `tests/node/markdown.test.js`. The cases cover parsing, rendering, URL sanitization, table parsing and rendering, block conversion, and serialization. The canonical `npm test` command passed with 21 Node tests and 1 Rust harness test; no product source was changed. |
| 2026-08-14T19:50:53.4346900Z | Implementation clarification | User requested that the completed `AC-02` cases be split into logical file groups. The approved structure separates parsing, rendering and sanitization, tables, and serialization and block conversion, with shared browser-module setup isolated in a test helper. |
| 2026-08-14T19:50:53.5315398Z | Implementation | Reorganized the `AC-02` suite into four focused test files plus `tests/node/helpers/load-markdown.js`, preserving all assertions and updating the test-layout documentation. The canonical `npm test` command continued to pass with 21 Node tests and 1 Rust harness test. |
| 2026-08-14T21:04:48.3274504Z | Implementation scope | User explicitly authorized the `AC-03` slice. Work is limited to a byte-exact source-preservation fixture corpus and reusable owned-range contract tests; the out-of-scope `REV-001` product fix and `AC-04` through `AC-09` remain unchanged. |
| 2026-08-14T22:01:31.0372575Z | Implementation | Completed the `AC-03` source-preservation corpus and contract tests. Added supported and unsupported/nuanced Markdown source-and-expected fixture pairs plus a byte-oriented owned-range helper. The tests prove each fixture contains details the current whole-document serializer would alter, then verify that modeled block edits preserve every byte outside the unique owned range. The canonical suite passed with 25 Node tests and 1 Rust harness test; no product source or `REV-001` behavior changed. |
| 2026-08-14T22:10:05.2466278Z | Implementation scope | User explicitly authorized the `AC-04` slice. Work is limited to deterministic persistence contracts for deferred and out-of-order writes, newer edits, dirty state, failure and cancellation, path or document changes, and newest-draft recovery. The known `REV-002` and `REV-003` product fixes and `AC-05` through `AC-09` remain outside this slice. |
| 2026-08-14T22:12:28.7830354Z | Implementation | Completed the `AC-04` persistence-contract slice. Added a reusable test-only persistence session, controlled deferred writer, and revision-aware draft store, with tests for current and stale save completion, newer edits, out-of-order writes, failure, cancellation, path changes, document changes, and recovery of the newest draft per document. The canonical suite passed with 35 Node tests and 1 Rust harness test. No product source or `REV-002`/`REV-003` behavior changed. |
| 2026-08-14T22:16:39.0257439Z | Implementation scope | User explicitly authorized the `AC-05` slice. Work is limited to narrow, behavior-preserving controller seams and deterministic tests using fake desktop bridge, storage, clock, and dialog dependencies. Broader controller decomposition, product-behavior changes, and `AC-06` through `AC-09` remain outside this slice. |
| 2026-08-14T22:21:11.1468958Z | Implementation | Completed the `AC-05` controller-test slice. Extracted document new/load/save and draft-scheduling orchestration into a narrow injected controller while leaving pane, render, and persistence-policy ownership unchanged. Added fake desktop bridge, storage, clock, and dialog tests covering success, cancellation, failure, stale draft-timer replacement, and missing dependencies. The complete suite passed with 40 Node tests in non-isolated mode and 1 Rust harness test. |
| 2026-08-14T22:21:11.2639696Z | Verification constraint | The required canonical `npm test` command was attempted but Node's default isolated test runner could not spawn workers in the managed side-conversation sandbox (`EPERM`). The same full Node suite passed with `node --test --test-isolation=none`, and the unchanged `npm run test:rust` layer passed separately; no repository setting was weakened to bypass the sandbox restriction. |
| 2026-08-14T23:26:56.0396459Z | Implementation scope | User explicitly authorized the `AC-06` slice. Work is limited to a reproducible human-executed UI regression checklist covering packaged startup, open, save, Save As, dirty-change prompts, inline editing, source preservation, and missing desktop-bridge behavior. Checklist execution remains a Test-phase activity, and automated browser or packaged-Tauri UI testing plus `AC-07` through `AC-09` remain outside this slice. |
| 2026-08-14T23:28:26.7309830Z | Implementation | Completed the `AC-06` documentation slice. Added `tests/manual/PRD-000002-TECH-UI-REGRESSION-CHECKLIST.md` with global preconditions, an execution-record scaffold, reproducible steps, and observable expected results for eight packaged and missing-bridge UI scenarios. Linked the manual suite from `tests/README.md` and explicitly kept it outside `npm test`; checklist execution and `TC-06` evidence remain deferred to Test. `git diff --check` and the workflow checker passed, with only the pre-existing legacy workflow warnings. |
| 2026-08-14T23:33:21.4661295Z | Implementation scope | User explicitly authorized the `AC-07` slice. Work is limited to isolated Rust tests of current path/name helpers, MIME-by-extension decisions, Markdown read/write contracts, unusual filenames, empty or missing paths, and representative I/O failures. Future trust-boundary policy and `AC-08` through `AC-09` remain outside this slice. |
| 2026-08-14T23:35:59.5138355Z | Implementation | Completed the `AC-07` Rust coverage slice. Added six tests under `tests/rust/desktop_commands.rs`, connected as a test-only module to the existing desktop command implementation, and documented the Rust layout. The tests use unique temporary directories and cover path/name extraction, case-insensitive MIME decisions, successful Markdown reads and writes, overwrite behavior, unusual Unicode and spaced filenames, empty paths, missing files or parents, directory misuse, and representative I/O failures without adding future trust-boundary policy. The Rust suite passed with six command-contract tests plus the existing harness; the controlled Rust failure returned exit code 1 as designed. The 40-test Node suite passed with the established non-isolated fallback. Canonical `npm test` remained blocked before its Rust step because the managed side-conversation sandbox denied Node worker spawning with `EPERM`; repository settings were not weakened. |
| 2026-08-14T23:48:37.1187269Z | Implementation scope | User explicitly authorized the `AC-08` slice. Work is limited to deterministic test-runtime guardrails, a risk-based coverage matrix, and supporting documentation. The `AC-09` product-fix ownership mapping and seeded-failure completion remain outside this slice. |
| 2026-08-14T23:50:10.0901635Z | Implementation | Completed the `AC-08` determinism and risk-coverage slice. Added `tests/RISK-COVERAGE-MATRIX.md` as the non-percentage coverage authority, documented the approved deterministic substitutes, and added `tests/node/determinism-contract.test.js` to guard the built-in runner configuration and reject known network, real storage/dialog, wall-clock, fixed-sleep, user-home, randomness, browser-runner, and coverage-package dependencies. The complete 43-test Node suite passed in the established non-isolated sandbox mode, both Rust targets passed with seven tests total, `git diff --check` passed, and the workflow checker passed with only pre-existing legacy warnings. Canonical `npm test` was attempted and remained blocked by the managed sandbox's Node worker `spawn EPERM`; no repository setting was weakened. `AC-09` remains open. |
| 2026-08-15T00:01:51.6775715Z | Implementation scope | User explicitly authorized the remaining `AC-09` slice through `prd-implement`. Work is limited to mapping the `REV-001` through `REV-003` regression contracts to owning product-fix PRDs and activation points, guarding those handoffs, and demonstrating the existing Node and Rust seeded-failure signals; the product fixes themselves remain out of scope. |
| 2026-08-15T00:01:51.7718202Z | Implementation | Completed `AC-09`. Added explicit owner, activation-point, regression-contract, and actionable-failure mappings for `REV-001` and `REV-002` to `PRD-000010-TECH` and `REV-003` to `PRD-000023-CHANGE`; added an automated matrix guard and documented the exact PowerShell seeded-failure procedure. The non-isolated Node suite passed with 44 tests and the Rust suite passed with seven tests. Controlled Node and Rust failures produced their intended messages and non-zero exits of 1 and 101. Canonical `npm test` was attempted and remained blocked by the managed sandbox's Node worker `spawn EPERM`; the fallback verified the same layer assertions without weakening repository settings. |
| 2026-08-15T02:14:07.8929023Z | Candidate preparation | Prepared product candidate `1.0.13`. The Tauri release build and NSIS bundle completed successfully, and root `quill.exe` was overwritten from the release executable with matching SHA-256 `0AA209E38D52A4985B295B4FCA73099AB6731206BB3BB295DEDFC334B7AE57CF`. All 24 JavaScript files passed syntax checks, the non-isolated Node suite passed 44 tests, the Rust suite passed seven tests, `git diff --check` passed, and the workflow checker passed with 112 pre-existing legacy warnings. Canonical `npm test` was attempted but the managed sandbox again denied Node worker spawning with `EPERM`; the established non-isolated Node fallback and unchanged Rust command verified the same layers. The PRD remains in Implement pending the candidate commit and push checkpoints. |

## Legacy Notes

- This PRD includes a repaired `Backlog` capture from an earlier consistency sweep, so the original creation event was not recorded just in time.

