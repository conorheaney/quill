# TC-02 Evidence

| Field | Detail |
| --- | --- |
| PRD | [PRD-000021-TECH](../../docs/25%20-%20Closed/PRD-000021-TECH.md) |
| Acceptance Criteria | AC-03 |
| Product Version | 1.1.0 |
| Status | complete |
| Recorded | 2026-08-29T15:31:29.0772035Z |
| Test | Preserved test, frontend-build, smoke, and packaged-build command contract. |
| Result | PASS |

## Preconditions

- Quill version `1.1.0` is checked out on `main`.
- The release candidate has been built from the current source.
- Rust, Node.js, npm, and Tauri build prerequisites are available.

## Steps to Reproduce

1. Run `npm test`.
2. Run `npm run build:frontend`.
3. Run `npm run build`.
4. Run `npm run smoke:dev` and verify the local server response.

## Expected Results

All preserved command names execute successfully against the new layout, including Node and Rust tests, frontend compilation, the packaged Tauri build, and smoke-server startup.

## Evidence

Captured test output:

```text
npm test
ℹ tests 47
ℹ pass 47
ℹ fail 0
Rust: 7 passed; 0 failed
Rust harness: 1 passed; 0 failed

npm run build:frontend
Done in 14ms

npm run build
Finished `release` profile [optimized]
Built application at: src-tauri\target\release\quill-tauri.exe
Finished 1 bundle at:
src-tauri\target\release\bundle\nsis\Quill_1.1.0_x64-setup.exe

npm run smoke:dev
Quill dev server running at http://127.0.0.1:1420/
```
