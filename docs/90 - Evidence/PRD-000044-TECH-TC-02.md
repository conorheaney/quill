# TC-02 Evidence

| Field | Detail |
| --- | --- |
| PRD | [PRD-000044-TECH](../../docs/25%20-%20Closed/PRD-000044-TECH.md) |
| Acceptance Criteria | AC-02 |
| Product Version | 1.1.1 |
| Status | complete |
| Recorded | 2026-08-30T21:11:40.6203924Z |
| Test | Phase 3 leaf modules preserve Markdown parsing, rendering, serialization, source preservation, and table behavior under strict TypeScript checks. |
| Result | PASS |

## Preconditions

- PRD-000044 is in `Test` and the committed product candidate is Quill `1.1.1`.
- The checkout contains the TypeScript leaf modules and converted Markdown test suite from commit `1d2a5415571c7da2420b900a24a5520f85e86790`.
- Node.js, repository dependencies, and the Rust/Cargo toolchain are installed locally.

## Steps to Reproduce

1. Run `npm run typecheck` from the repository root.
2. Run `node --test tests/node/markdown-parsing.test.ts tests/node/markdown-rendering.test.ts tests/node/markdown-tables.test.ts tests/node/markdown-serialization.test.ts tests/node/markdown-source-preservation.test.ts`.
3. Run `npm test` to execute the complete Node and Rust suite at the phase boundary.

## Expected Results

Strict TypeScript diagnostics report no errors; the focused Markdown suite passes all 25 tests; and the canonical suite passes all Node and Rust tests without changing the leaf-module behavior.

## Evidence

- `npm run typecheck` completed with exit code 0 and no diagnostics.
- The focused Markdown suite completed with 25 passing tests and 0 failures.
- `npm test` completed with 47 passing Node tests and 8 passing Rust tests.
- The converted sources are [markdown.ts](../../frontend/scripts/markdown.ts), [storage.ts](../../frontend/scripts/storage.ts), [app-config.ts](../../frontend/scripts/app-config.ts), [outline-pane.ts](../../frontend/scripts/outline-pane.ts), and [markdown-pane.ts](../../frontend/scripts/markdown-pane.ts).

Basic command output:

```text
> Quill@1.1.1 typecheck
> tsc --noEmit

ℹ tests 25
ℹ pass 25
ℹ fail 0

ℹ tests 47
ℹ pass 47
ℹ fail 0
test result: ok. 7 passed; 0 failed
test result: ok. 1 passed; 0 failed
```
