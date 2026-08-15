# TC-09 Evidence

| Field | Detail |
| --- | --- |
| PRD | [PRD-000002-TECH](../../docs/25%20-%20Closed/PRD-000002-TECH.md) |
| Acceptance Criteria | AC-09 |
| Product Version | 1.0.13 |
| Git Commit | af9df91f1de93a23523a460c3b87f5f665276d6e |
| Status | complete |
| Recorded | 2026-08-15T12:56:44.4555135Z |
| Test | PASS: Review the risk matrix, verify that each priority-5 regression contract has an explicit owner, activation point, and actionable failure signal, and demonstrate the controlled Node and Rust failure paths. |
| Result | All three priority-5 handoffs were complete and guarded by an automated matrix test. The managed sandbox blocked canonical Node worker creation with `spawn EPERM`; the documented fallback passed all 44 Node and 7 Rust tests, while the controlled Node and Rust failures emitted the expected messages and exited `1` and `101`. |

## Preconditions

- Use product version `1.0.13` at Git commit `af9df91f1de93a23523a460c3b87f5f665276d6e`.
- Run from the repository root with Node.js, Rust, Cargo, and the committed project dependencies available.
- Keep `tests/RISK-COVERAGE-MATRIX.md`, the automated tests, and the root test scripts unchanged before execution.
- Ensure `QUILL_TEST_SEED_FAILURE` is unset before and after the test.

## Steps to Reproduce

1. Review the priority-5 handoff table in `tests/RISK-COVERAGE-MATRIX.md` and confirm that `REV-001`, `REV-002`, and `REV-003` each specify a product contract, owning PRD, activation point, and regression test with an actionable failure signal.
2. Run `npm test` to execute the clean canonical suite.
3. If the managed sandbox blocks Node worker creation with `spawn EPERM`, run `npm run test:node -- --test-isolation=none` and `npm run test:rust` as the documented fallback.
4. Set `QUILL_TEST_SEED_FAILURE=node`, run the Node layer using the available canonical or documented fallback path, and record its message and non-zero exit code.
5. Clear the seed, set `QUILL_TEST_SEED_FAILURE=rust`, confirm the Node layer passes, run the Rust layer, and record its message and non-zero exit code.
6. Clear `QUILL_TEST_SEED_FAILURE` and confirm it is unset.

## Expected Results

The matrix provides complete ownership, activation, and failure-signal handoffs for `REV-001`, `REV-002`, and `REV-003`. Clean Node and Rust layers pass. The controlled Node and Rust seeds produce their documented actionable messages and non-zero exits, and the seed variable is cleared afterward.

## Evidence

| Check | Result |
| --- | --- |
| Candidate | Version `1.0.13`; commit `af9df91f1de93a23523a460c3b87f5f665276d6e`. |
| `REV-001` handoff | Contract: preserve every byte outside the Render-pane edit's owned range; owner: `PRD-000010-TECH`; activation: lossless source-backed edit implementation; signal: `markdown-source-preservation.test.js` reports the first unexpected outside-range byte change. |
| `REV-002` handoff | Contract: stale save completion cannot clear a newer revision's dirty state; owner: `PRD-000010-TECH`; activation: revision-aware production persistence; signal: `persistence-latest-edit-wins.test.js` identifies the violating save order and dirty revision. |
| `REV-003` handoff | Contract: startup recovers the newest valid draft without default-content overwrite; owner: `PRD-000023-CHANGE`; activation: file-persistence and recovery policy replacement; signal: `persistence-draft-recovery.test.js` identifies the incorrect document identity or revision sequence. |
| Automated matrix guard | `priority-5 findings retain explicit owners and activation signals` passed during the clean 44-test Node run. |
| Canonical attempt | `npm test` exited `1` because the managed sandbox denied Node worker creation with `spawn EPERM` before assertions executed. |
| Clean fallback | `npm run test:node -- --test-isolation=none`: 44 passed, 0 failed, exit `0`; `npm run test:rust`: 7 passed, 0 failed, exit `0`. |
| Node failure signal | With `QUILL_TEST_SEED_FAILURE=node`, the Node layer reported `Controlled Node test-layer failure was requested.` with 43 passed, 1 failed, exit `1`. |
| Rust failure signal | With `QUILL_TEST_SEED_FAILURE=rust`, the Node layer passed 44 tests before Rust reported `Controlled Rust test-layer failure was requested.` and exited `101`. |
| Cleanup | `QUILL_TEST_SEED_FAILURE` was cleared and confirmed unset after execution. |
| Sources | [Risk coverage matrix](../../tests/RISK-COVERAGE-MATRIX.md); [determinism contract](../../tests/node/determinism-contract.test.js); [test documentation](../../tests/README.md) |
