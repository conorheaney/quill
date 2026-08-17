# TC-04 Evidence

| Field | Detail |
| --- | --- |
| PRD | [PRD-000002-TECH](../../docs/25%20-%20Closed/PRD-000002-TECH.md) |
| Acceptance Criteria | AC-04 |
| Product Version | 1.0.13 |
| Status | complete |
| Recorded | 2026-08-15T12:03:01.8108082Z |
| Test | PASS: Use deferred fake writes and revision-aware draft storage to verify latest-edit-wins behavior across newer edits, out-of-order completion, failures, cancellation, path changes, document changes, and recovery. |
| Result | All 10 persistence assertions passed with 0 failures and exit code `0` under the documented non-isolated Node fallback. The initial isolated run was blocked before assertion execution by the managed sandbox with `spawn EPERM`. |

## Preconditions

- Use product version `1.0.13`.
- Run from the repository root with Node.js and the project dependencies available.
- Ensure `QUILL_TEST_SEED_FAILURE` is unset.
- Keep the persistence suites and `tests/node/helpers/persistence-contract.js` unchanged before execution.

## Steps to Reproduce

1. Confirm the checked-out commit is `af9df91f1de93a23523a460c3b87f5f665276d6e` and the product version is `1.0.13`.
2. Clear `QUILL_TEST_SEED_FAILURE`.
3. Run `node --test tests/node/persistence-latest-edit-wins.test.js tests/node/persistence-draft-recovery.test.js`.
4. If the managed sandbox blocks worker spawning with `spawn EPERM`, run the same files with `node --test --test-isolation=none tests/node/persistence-latest-edit-wins.test.js tests/node/persistence-draft-recovery.test.js`.
5. Verify current saves clear only matching dirty revisions; newer edits and out-of-order stale completions cannot overwrite the latest state.
6. Verify failed and cancelled saves remain dirty, and path or document changes make in-flight saves stale.
7. Verify recovery selects the highest revision for the requested document and retains the newest draft after a failed disk save.
8. Record the command output, assertion count, exit code, and any failures under Evidence.

## Expected Results

All targeted assertions pass with exit code `0`. A save clears dirty state only when its snapshot still matches the active document, path generation, and revision. Newer edits and later saves remain authoritative when writes complete out of order. Failed or cancelled saves remain dirty and recoverable. Path or document changes make in-flight saves stale, and draft recovery restores the highest revision for the requested document, including after a failed disk save.

## Evidence

| Check | Result |
| --- | --- |
| Candidate | Version `1.0.13`;; seed variable unset |
| Isolated command | `node --test tests/node/persistence-latest-edit-wins.test.js tests/node/persistence-draft-recovery.test.js` blocked by sandbox `spawn EPERM`; 0 assertions executed |
| Executed fallback | `node --test --test-isolation=none tests/node/persistence-latest-edit-wins.test.js tests/node/persistence-draft-recovery.test.js` |
| Outcome | 10 passed; 0 failed; exit `0`; duration `21.1196 ms` |
| Save-race coverage | Current and delayed saves, newer edits, out-of-order completion, failure, cancellation, path changes, and document changes passed. |
| Draft coverage | Highest-revision recovery and newest-draft retention after failed disk save passed. |
| Sources | [Latest-edit-wins suite](../../tests/node/persistence-latest-edit-wins.test.js); [draft-recovery suite](../../tests/node/persistence-draft-recovery.test.js); [persistence fakes](../../tests/node/helpers/persistence-contract.js) |

