# TC-01 Evidence

| Field | Detail |
| --- | --- |
| PRD | [PRD-000002-TECH](../../docs/25%20-%20Closed/PRD-000002-TECH.md) |
| Acceptance Criteria | AC-01 |
| Product Version | 1.0.13 |
| Status | complete |
| Recorded | 2026-08-15T11:43:12.6674792Z |
| Test | Verified the root test structure, canonical Node-and-Rust `npm test` command, and controlled error signals for both automated layers. |
| Result | PASS |

## Preconditions

- Check outfor product version `1.0.13` with Node.js, npm, and the Rust toolchain available.
- Start at the repository root with no `QUILL_TEST_SEED_FAILURE` environment variable set.
- Use `tests/README.md` as the documented test-layout and harness-failure procedure.

## Steps to Reproduce

1. Inspect the repository-authored automated suites, fixtures, fakes, and supporting test data and confirm they are located beneath the root `tests/` directory.
2. Inspect `package.json` and `src-tauri/Cargo.toml`; confirm `npm test` runs `npm run test:node` followed by `npm run test:rust`, and the Rust test targets resolve to files beneath `tests/rust/`.
3. Run `npm test` from the repository root with `QUILL_TEST_SEED_FAILURE` unset and record the Node results, Rust results, and final exit code.
4. Set `QUILL_TEST_SEED_FAILURE` to `node`, run `npm test`, and record the controlled Node failure message and non-zero exit code; then clear the environment variable.
5. Set `QUILL_TEST_SEED_FAILURE` to `rust`, run `npm test`, and record the passing Node layer, controlled Rust failure message, and non-zero exit code; then clear the environment variable.

## Expected Results

All repository-authored automated test assets are beneath root `tests/`. A clean `npm test` invokes and passes both the Node and Rust layers. The Node seed reports `Controlled Node test-layer failure was requested.` and exits non-zero before Rust runs. The Rust seed allows Node to pass, reports `Controlled Rust test-layer failure was requested.`, and exits non-zero. The failure-seed environment variable is absent after each controlled check.

## Evidence

- Structure: `rg --files tests` returned 23 test suites, fixtures, helpers, manuals, and supporting documents beneath root `tests/`; the targeted search found no automated `*.test.js`, `*.spec.js`, or `*test*.rs` files outside that directory.
- Harness configuration: `package.json` defines `npm test` as `npm run test:node && npm run test:rust`; the layer commands are `node --test` and `cargo test --manifest-path src-tauri/Cargo.toml`. The Cargo `test-harness` target resolves to `../tests/rust/test_harness.rs`.
- Clean canonical run: `npm test` passed 44 Node tests, six Rust desktop-command tests, and one Rust harness test; exit code `0`.
- Controlled Node failure: with `QUILL_TEST_SEED_FAILURE=node`, the Node layer passed 43 tests and failed the harness test with `Controlled Node test-layer failure was requested.`; `npm test` exited `1` before invoking Rust.
- Controlled Rust failure: with `QUILL_TEST_SEED_FAILURE=rust`, all 44 Node tests and six Rust desktop-command tests passed, then the Rust harness failed with `Controlled Rust test-layer failure was requested.`; `npm test` exited `101`.
- Cleanup: `QUILL_TEST_SEED_FAILURE` was removed after the controlled runs and confirmed absent.
