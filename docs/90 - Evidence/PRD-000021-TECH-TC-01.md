# TC-01 Evidence

| Field | Detail |
| --- | --- |
| PRD | [PRD-000021-TECH](../../docs/25%20-%20Closed/PRD-000021-TECH.md) |
| Acceptance Criteria | AC-01, AC-02 |
| Product Version | 1.1.0 |
| Status | complete |
| Recorded | 2026-08-29T15:31:29.0772035Z |
| Test | Reproducible frontend build and generated resource verification. |
| Result | PASS |

## Preconditions

- Quill version `1.1.0` is checked out on `main`.
- Frontend dependencies are installed.
- No generated `dist/` output is relied upon before the build.

## Steps to Reproduce

1. Run `npm run build:frontend`.
2. Record the SHA-256 hash of `dist/scripts/quill-app.js`.
3. Run `npm run build:frontend` again.
4. Compare the two bundle hashes and verify the required generated files exist.

## Expected Results

The frontend build completes successfully, produces the runnable bundle and copied authored resources under `dist/`, and produces the same bundle hash on repeated builds.

## Evidence

Captured command output:

```text
dist\scripts\quill-app.js      154.7kb
dist\scripts\quill-app.js.map  227.1kb
Done in 14ms

dist\scripts\quill-app.js      154.7kb
dist\scripts\quill-app.js.map  227.1kb
Done in 12ms

firstHash=8ED9E7465EDA31E05879733B6298DB916DA21C2462DC210051077E65303350E7
secondHash=8ED9E7465EDA31E05879733B6298DB916DA21C2462DC210051077E65303350E7
reproducible=True
requiredFiles=True
```
