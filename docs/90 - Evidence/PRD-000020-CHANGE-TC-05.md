# TC-05 Evidence

| Field | Detail |
| --- | --- |
| PRD | [PRD-000020-CHANGE](../25%20-%20Closed/PRD-000020-CHANGE.md) |
| Acceptance Criteria | AC-04 |
| Product Version | 1.0.4 |
| Status | complete |
| Recorded | 2026-07-25T22:19:03.3110614Z |
| Completed | 2026-07-25T22:27:36.6488922Z |
| Test | Open more than ten files; verify the Recent limit, valid reopening, and missing-file handling. |
| Result | PASS |

## Preconditions

> Legacy evidence record: this section was added to preserve the current evidence structure; no new test execution is implied.

## Steps to Reproduce

> Legacy evidence record: this section was added to preserve the current evidence structure; no new test execution is implied.

## Expected Results

> Legacy evidence record: this section was added to preserve the current evidence structure; no new test execution is implied.

## Evidence

![Quill Recent Files showing the latest ten entries](PRD-000020-CHANGE-TC-05-RECENT-LIMIT.png)

Valid file reopened:

![Quill showing a valid Recent entry reopened as the current document](PRD-000020-CHANGE-TC-05-VALID-REOPEN.png)

File available before rename:

![Quill Recent Files showing the file as available](PRD-000020-CHANGE-TC-05-AVAILABLE-ENTRY.png)

File renamed on disk:

![Windows Explorer showing the temporary renamed file](PRD-000020-CHANGE-TC-05-FILE-RENAMED.png)

File unavailable after rename:

![Quill marking the renamed Recent file unavailable while preserving the current document](PRD-000020-CHANGE-TC-05-UNAVAILABLE-ENTRY.png)
