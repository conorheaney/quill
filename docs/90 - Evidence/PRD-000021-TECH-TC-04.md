# TC-04 Evidence

| Field | Detail |
| --- | --- |
| PRD | [PRD-000021-TECH](../../docs/25%20-%20Closed/PRD-000021-TECH.md) |
| Acceptance Criteria | AC-05 |
| Product Version | 1.1.0 |
| Status | complete |
| Recorded | 2026-08-29T15:31:29.0772035Z |
| Test | Strict TypeScript diagnostics with mixed JavaScript and TypeScript compilation. |
| Result | PASS |

## Preconditions

- Quill version `1.1.0` is checked out on `main`.
- `tsconfig.json` enables `strict` diagnostics, `allowJs`, and `checkJs: false` for the staged migration.
- The TypeScript entry imports the remaining authored JavaScript modules.

## Steps to Reproduce

1. Run `npm run typecheck`.
2. Inspect `tsconfig.json` for `strict: true`, `allowJs: true`, and `checkJs: false`.
3. Run `npm run build:frontend` to compile the mixed entry surface.

## Expected Results

TypeScript diagnostics complete without errors, and esbuild compiles the TypeScript entry together with the remaining JavaScript modules into the frontend bundle.

## Evidence

Captured diagnostics output:

```text
> Quill@1.1.0 typecheck
> tsc --noEmit

Process completed with exit code 0.

Frontend mixed-surface build:
dist\scripts\quill-app.js      154.7kb
dist\scripts\quill-app.js.map  227.1kb
Done in 14ms
```
