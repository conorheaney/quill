# TC-08 Evidence

| Field | Detail |
| --- | --- |
| PRD | [PRD-000002-TECH](../../docs/25%20-%20Closed/PRD-000002-TECH.md) |
| Acceptance Criteria | AC-08 |
| Product Version | 1.0.13 |
| Git Commit | af9df91f1de93a23523a460c3b87f5f665276d6e |
| Status | complete |
| Recorded | 2026-08-15T12:22:18.7464941Z |
| Test | PASS: Run the automated suite from a clean local state and verify it needs no network, browser, real dialogs, user data, fixed sleeps, prior results, or hosted-CI environment. |
| Result | The managed sandbox blocked the canonical Node worker processes with `spawn EPERM`, but the documented non-isolated execution passed all 44 identical Node assertions and the unchanged Rust command passed all 7 tests, each with exit `0`; the determinism contracts and risk matrix confirmed the required runtime independence. |

## Preconditions

- Use product version `1.0.13` at Git commit `af9df91f1de93a23523a460c3b87f5f665276d6e`.
- Run from the repository root with Node.js, Rust, Cargo, and the committed project dependencies available.
- Ensure `QUILL_TEST_SEED_FAILURE` is unset and use no prior test output as an input.
- Use the managed local sandbox without browser automation, real dialogs, user files, user storage, or a hosted-CI service.
- Keep the automated test sources, runner configuration, and risk matrix unchanged before execution.

## Steps to Reproduce

1. Confirm the checked-out commit is `af9df91f1de93a23523a460c3b87f5f665276d6e`, the product version is `1.0.13`, and `QUILL_TEST_SEED_FAILURE` is unset.
2. Run `npm test` from the repository root and record whether both automated layers execute.
3. If the managed sandbox denies Node worker creation with `spawn EPERM`, run `node --test --test-isolation=none` to execute the identical Node assertions without worker processes.
4. Run `npm run test:rust` separately when the canonical command cannot reach the Rust layer because of the sandbox restriction.
5. Confirm `tests/node/determinism-contract.test.js` passes its runner, dependency, external-API, nondeterministic-API, and risk-matrix checks.
6. Review `tests/RISK-COVERAGE-MATRIX.md` for explicit risk-based coverage and the absence of a numeric coverage threshold.
7. Confirm the automated sources use repository fixtures, injected fakes, controlled promises or sequences, and isolated temporary directories instead of external state.
8. Record commands, outcomes, test counts, runtime-independence checks, and environmental limitations under Evidence.

## Expected Results

All Node and Rust assertions pass with exit code `0` using only local deterministic resources. The suite requires no network, browser, real dialogs, user files, user storage, wall-clock timing, fixed sleeps, execution order, prior results, browser download, numeric coverage threshold, or hosted-CI service. A managed-sandbox worker restriction may require the documented non-isolated Node execution without changing the tested assertions or repository configuration.

## Evidence

| Check | Result |
| --- | --- |
| Candidate | Version `1.0.13`; commit `af9df91f1de93a23523a460c3b87f5f665276d6e`; `QUILL_TEST_SEED_FAILURE` unset |
| Canonical command | `npm test` attempted; Node worker creation was denied by the managed sandbox with `spawn EPERM` before assertions executed, so the command exited `1` and did not reach Rust. |
| Node fallback | `node --test --test-isolation=none` executed the identical Node assertions: 44 passed, 0 failed, exit `0`. |
| Rust layer | `npm run test:rust`: 7 passed, 0 failed, exit `0`; 6 isolated helper/command tests plus 1 harness test. |
| Runtime independence | The determinism contract rejected network clients, real browser storage/dialogs, wall-clock or fixed-sleep timing, user-home lookup, and uncontrolled randomness across automated Node and Rust sources. |
| Runner dependencies | The root scripts use built-in `node --test` and `cargo test`; no browser runner, browser download, or code-coverage package is configured. |
| Test state | Repository fixtures, injected fake ports, controlled promises and sequence values, and per-test temporary directories replaced user data and external state; the passing fallback followed the blocked canonical attempt without consuming prior results. |
| Coverage policy | [Risk coverage matrix](../../tests/RISK-COVERAGE-MATRIX.md) governs critical, high, and moderate risks; every listed row is `covered`, and numeric code-coverage thresholds are explicitly excluded. |
| Sources | [Determinism contract](../../tests/node/determinism-contract.test.js); [test documentation](../../tests/README.md); [risk coverage matrix](../../tests/RISK-COVERAGE-MATRIX.md) |
