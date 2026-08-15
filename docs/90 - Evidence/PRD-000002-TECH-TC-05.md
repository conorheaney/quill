# TC-05 Evidence

| Field | Detail |
| --- | --- |
| PRD | [PRD-000002-TECH](../../docs/25%20-%20Closed/PRD-000002-TECH.md) |
| Acceptance Criteria | AC-05 |
| Product Version | 1.0.13 |
| Git Commit | af9df91f1de93a23523a460c3b87f5f665276d6e |
| Status | complete |
| Recorded | 2026-08-15T12:07:45.5490609Z |
| Test | PASS: Run controller success, cancellation, failure, stale-completion, and missing-dependency cases using the approved fake desktop bridge, storage, clock, and dialog dependencies. |
| Result | All 5 controller workflow assertions passed with 0 failures and exit code `0` under the documented non-isolated Node fallback. The initial isolated run was blocked before assertion execution by the managed sandbox with `spawn EPERM`. |

## Preconditions

- Use product version `1.0.13` at Git commit `af9df91f1de93a23523a460c3b87f5f665276d6e`.
- Run from the repository root with Node.js and the project dependencies available.
- Ensure `QUILL_TEST_SEED_FAILURE` is unset.
- Keep `tests/node/controller-workflows.test.js` and its approved fake dependencies unchanged before execution.

## Steps to Reproduce

1. Confirm the checked-out commit is `af9df91f1de93a23523a460c3b87f5f665276d6e` and the product version is `1.0.13`.
2. Clear `QUILL_TEST_SEED_FAILURE`.
3. Run `node --test tests/node/controller-workflows.test.js`.
4. If the managed sandbox blocks worker spawning with `spawn EPERM`, run the same file with `node --test --test-isolation=none tests/node/controller-workflows.test.js`.
5. Verify successful load, save, and new-document results are applied through the controller callbacks.
6. Verify dialog and desktop cancellations do not apply document callbacks.
7. Verify desktop failures are reported without applying a document result.
8. Verify rescheduling a draft clears the stale timer and persists only the latest content.
9. Verify missing desktop bridge, dialog, storage, and clock dependencies return explicit unavailable outcomes.
10. Record the command output, assertion count, exit code, and any failures under Evidence.

## Expected Results

All targeted assertions pass with exit code `0`. Successful controller operations apply the expected callbacks; cancellations leave callbacks untouched; failures report an error without applying a document result; stale draft timers are cleared so only the latest content persists; and missing dependencies return explicit unavailable outcomes.

## Evidence

| Check | Result |
| --- | --- |
| Candidate | Version `1.0.13`; commit `af9df91f1de93a23523a460c3b87f5f665276d6e`; seed variable unset |
| Isolated command | `node --test tests/node/controller-workflows.test.js` blocked by sandbox `spawn EPERM`; 0 assertions executed |
| Executed fallback | `node --test --test-isolation=none tests/node/controller-workflows.test.js` |
| Outcome | 5 passed; 0 failed; exit `0`; duration `19.7222 ms` |
| Success coverage | Load, save, and new-document results passed with expected bridge payloads and callbacks. |
| Cancellation and failure coverage | Dirty-dialog cancellation, desktop cancellation, and desktop failure paths passed without applying stale document results. |
| Stale-completion coverage | Draft rescheduling cleared the stale timer and persisted only the latest content. |
| Missing-dependency coverage | Desktop bridge, dialog, storage, and clock omissions returned explicit unavailable outcomes. |
| Sources | [Controller workflow suite](../../tests/node/controller-workflows.test.js); [controller fakes](../../tests/node/helpers/controller-fakes.js); [document controller](../../code/scripts/document-controller.js) |
