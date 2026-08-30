# TC-03 Evidence

| Field | Detail |
| --- | --- |
| PRD | [PRD-000044-TECH](../../docs/20%20-%20Test/PRD-000044-TECH.md) |
| Acceptance Criteria | AC-03 |
| Product Version | 1.1.1 |
| Status | complete |
| Recorded | 2026-08-30T21:13:15.4929801Z |
| Test | Stateful document, persistence, controller, desktop-command, and recent-file boundaries preserve cancellation, failure, and latest-edit-wins behavior. |
| Result | PASS |

## Preconditions

- PRD-000044 is in `Test` and the committed product candidate is Quill `1.1.1`.
- The checkout contains the converted stateful and native-boundary modules from commit `1d2a5415571c7da2420b900a24a5520f85e86790`.
- Node.js, repository dependencies, and the Rust/Cargo toolchain are installed locally.

## Steps to Reproduce

1. Run `npm run typecheck` from the repository root.
2. Run `node --test tests/node/controller-workflows.test.ts tests/node/persistence-latest-edit-wins.test.ts tests/node/persistence-draft-recovery.test.ts`.
3. Run `npm test` to execute the complete Node and Rust suite.
4. Review [recent-files.ts](../../frontend/scripts/recent-files.ts), [document-controller.ts](../../frontend/scripts/document-controller.ts), [desktop-bridge.ts](../../frontend/scripts/desktop-bridge.ts), and [persistence-contract.ts](../../tests/node/helpers/persistence-contract.ts) against the state transitions and native command tests.

## Expected Results

Strict diagnostics report no errors; the focused stateful suite passes all 17 tests; the canonical suite passes all 47 Node and 8 Rust tests; and the converted controllers preserve cancellation, failure, external-change, recent-file, and latest-edit-wins boundaries.

## Evidence

- `npm run typecheck` completed with exit code 0 and no diagnostics.
- The focused stateful suite completed with 17 passing tests and 0 failures.
- `npm test` completed with 47 passing Node tests and 8 passing Rust tests.
- The Rust desktop command tests exercised isolated read, write, inspect, verify, image-data, and Explorer command behavior; the typed bridge maps to the same registered command names.
- The candidate commit is [1d2a541](https://github.com/conorheaney/quill/commit/1d2a5415571c7da2420b900a24a5520f85e86790) and the product version is `1.1.1`.

Basic command output:

```text
> Quill@1.1.1 typecheck
> tsc --noEmit

ℹ tests 17
ℹ pass 17
ℹ fail 0

ℹ tests 47
ℹ pass 47
ℹ fail 0
test result: ok. 7 passed; 0 failed
test result: ok. 1 passed; 0 failed
```
