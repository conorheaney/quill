# TC-03 Evidence

| Field | Detail |
| --- | --- |
| PRD | [PRD-000002-TECH](../../docs/25%20-%20Closed/PRD-000002-TECH.md) |
| Acceptance Criteria | AC-03 |
| Product Version | 1.0.13 |
| Status | complete |
| Recorded | 2026-08-15T11:57:29.1822323Z |
| Test | Exercise the supported and unsupported Markdown corpus fixtures and verify byte stability outside the one explicitly edited block range. |
| Result | PASS |

## Preconditions

- Use the repository state for product version `1.0.13`.
- Run from the repository root with Node.js and the project dependencies available.
- Ensure `QUILL_TEST_SEED_FAILURE` is unset.
- Keep the source and expected fixture pairs under `tests/fixtures/markdown/source-preservation/` unchanged before execution.

## Steps to Reproduce

1. Confirm the checked-out commit is `af9df91f1de93a23523a460c3b87f5f665276d6e` and the product version is `1.0.13`.
2. Run `node --test tests/node/markdown-source-preservation.test.ts`.
3. Confirm the supported and unsupported/nuanced source fixtures each contain details that Quill's whole-document serializer would alter.
4. Confirm each modeled edit replaces one unique owned source range and matches its corresponding expected edited fixture byte for byte.
5. Confirm the byte sequences before and after the owned range are identical to the original source fixture in both corpus cases.
6. Record the command output, test count, exit code, and any failed assertion under Evidence, then set the Test, Result, and Status fields to the observed outcome.

## Expected Results

All four source-preservation tests pass with exit code `0`. Both corpus fixtures demonstrate meaningful whole-document normalization risk, while each modeled block edit changes only its unique owned source range and preserves every byte outside that range.

## Evidence

| Check | Result |
| --- | --- |
| Candidate | Version `1.0.13`;; seed variable unset |
| Isolated command | `node --test tests/node/markdown-source-preservation.test.ts` blocked by sandbox `spawn EPERM`; 0 assertions executed |
| Executed fallback | `node --test --test-isolation=none tests/node/markdown-source-preservation.test.ts` |
| Outcome | 4 passed; 0 failed; exit `0`; duration `22.305 ms` |
| Coverage | Editing one section leaves everything before and after it completely unchanged, including unusual or complex Markdown formatting. |
| Sources | [Test suite](../../tests/node/markdown-source-preservation.test.ts); [byte-range assertions](../../tests/node/helpers/source-preservation.ts) |

