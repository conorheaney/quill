# Quill tests

All repository-authored automated tests, fixtures, fakes, and supporting test data belong under this root-level `tests/` directory.

## Layout

- `node/`: JavaScript tests run by Node's built-in test runner.
  - `determinism-contract.test.ts`: runner, dependency, source-independence, and risk-matrix guardrails.
  - `markdown-parsing.test.ts`: Markdown block parsing cases.
  - `markdown-rendering.test.ts`: Markdown rendering, escaping, and URL-sanitization cases.
  - `markdown-tables.test.ts`: table-cell splitting and table-rendering cases.
  - `markdown-serialization.test.ts`: block conversion and Markdown serialization cases.
  - `markdown-source-preservation.test.ts`: byte-exact source-preservation contract cases.
  - `persistence-latest-edit-wins.test.ts`: deterministic save-race and dirty-state contracts.
  - `persistence-draft-recovery.test.ts`: newest-draft recovery contracts.
  - `controller-workflows.test.ts`: controller success, cancellation, failure, stale-timer, and missing-dependency workflows using fake ports.
  - `helpers/`: shared Node-test setup for browser-oriented modules.
- `fixtures/markdown/source-preservation/`: supported and unsupported Markdown source/expected pairs for owned-range edit contracts.
- `manual/`: human-executed regression checklists kept outside the automated command.
  - `PRD-000002-TECH-UI-REGRESSION-CHECKLIST.md`: packaged UI and missing-desktop-bridge scenarios planned for `TC-06`.
- `rust/`: Rust tests covering the canonical harness plus isolated desktop helper and command contracts.
  - `test_harness.rs`: canonical Rust-layer wiring and controlled-failure check.
  - `desktop_commands.rs`: path/name, MIME, Markdown read/write, unusual-path, empty-path, missing-path, and I/O-failure cases using per-test temporary directories.
- `RISK-COVERAGE-MATRIX.md`: risk-prioritized automated coverage obligations and current coverage, used instead of a numeric code-coverage threshold.

## Canonical command

Run the complete automated suite from the repository root:

```powershell
npm test
```

The command runs the Node layer first and the Rust layer second. It returns a non-zero exit code as soon as either layer fails.

Manual checklists under `manual/` are not discovered or run by `npm test`; execute them only when the applicable PRD verification step calls for human UI regression.

## Determinism contract

Automated tests must not require network access, user files, user storage, real dialogs, wall-clock timing, fixed sleeps, browser downloads, execution order, prior-run state, or a hosted CI service. Use repository fixtures, injected fakes, controlled promises and sequence values, or per-test temporary directories instead. `determinism-contract.test.ts` protects the canonical runner and rejects known external or nondeterministic runtime APIs in the automated test sources.

Coverage work follows `RISK-COVERAGE-MATRIX.md`. Quill does not use a numeric line, branch, function, or statement percentage as its coverage gate.

## Harness failure check

The harness tests support controlled failures through `QUILL_TEST_SEED_FAILURE`. From PowerShell, verify the Node signal with:

```powershell
$env:QUILL_TEST_SEED_FAILURE = "node"
npm test
$LASTEXITCODE
Remove-Item Env:QUILL_TEST_SEED_FAILURE
```

The Node harness reports `Controlled Node test-layer failure was requested.` and `npm test` returns a non-zero exit code before running Rust.

Verify the Rust signal with:

```powershell
$env:QUILL_TEST_SEED_FAILURE = "rust"
npm test
$LASTEXITCODE
Remove-Item Env:QUILL_TEST_SEED_FAILURE
```

The Node layer passes, the Rust harness reports `Controlled Rust test-layer failure was requested.`, and `npm test` returns a non-zero exit code. Always clear the variable before a normal run.

If a managed sandbox prevents Node's default runner from spawning workers, use `npm run test:node -- --test-isolation=none` to demonstrate the Node assertion and run `npm run test:rust` separately to demonstrate the Rust assertion. This fallback verifies the same layer signals but does not replace the canonical `npm test` contract.
