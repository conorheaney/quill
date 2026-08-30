# TC-05 Evidence

| Field | Detail |
| --- | --- |
| PRD | [PRD-000044-TECH](../../docs/20%20-%20Test/PRD-000044-TECH.md) |
| Acceptance Criteria | AC-05 |
| Product Version | 1.1.1 |
| Status | complete |
| Recorded | 2026-08-30T21:30:00.0000000Z |
| Test | Converted TypeScript tests, helpers, and Node tooling preserve the repository command boundaries and authored-source inventory. |
| Result | PASS |

## Preconditions

- PRD-000044 is in `Test` and the committed product candidate is Quill `1.1.1`.
- The checkout contains the converted tests, helpers, and Node tooling from commit `1d2a5415571c7da2420b900a24a5520f85e86790`.
- Node.js, repository dependencies, and the Rust/Cargo toolchain are installed locally.

## Steps to Reproduce

1. Run `npm run typecheck` from the repository root.
2. Run `npm run build:frontend` and `npm run version:bump -- 1.1.1`.
3. Run `npm run smoke:dev` with an isolated `PORT`, then request the root shell, generated bundle, and mounted fragments.
4. Run `npx tauri build --debug` and inspect the generated debug executable and installer.
5. Run `npm test`.
6. Search `frontend`, `scripts`, and `tests` for authored `.js` and `.mjs` files.

## Expected Results

The preserved npm command names execute the converted TypeScript tooling; the smoke and packaged-build paths complete; the full Node/Rust suite passes; and no authored JavaScript or MJS remains in the migrated source trees.

## Evidence

- `npm run typecheck`, `npm run build:frontend`, and `npm run version:bump -- 1.1.1` completed successfully.
- The exact `npm run smoke:dev` command completed on the isolated port and its shell, bundle, and mounted fragments returned HTTP 200.
- `npx tauri build --debug` generated the Quill `1.1.1` debug executable and NSIS installer.
- `npm test` completed with 47 passing Node tests and 8 passing Rust tests.
- The authored source inventory returned zero `.js`/`.mjs` files under `frontend`, `scripts`, and `tests`.

Basic command output:

```text
> Quill@1.1.1 typecheck
> tsc --noEmit

> Quill@1.1.1 build:frontend
> node scripts/build-frontend.ts

Frontend built from C:\Projects\Tools\quill\frontend to C:\Projects\Tools\quill\dist.

> Quill@1.1.1 version:bump
> node scripts/bump-version.ts 1.1.1

Quill is already set to version 1.1.1. No files changed.

> Quill@1.1.1 smoke:dev
> npm run build:frontend && node scripts/serve-quill.ts

Quill dev server running at http://127.0.0.1:1423/
/ 200 bytes=312
/quill.html 200 bytes=9947
/scripts/quill-app.js 200 bytes=255997
/html/recent-files.html 200 bytes=528
/html/outline-pane.html 200 bytes=142
/html/markdown-pane.html 200 bytes=1597
/html/preview-pane.html 200 bytes=813

Finished `dev` profile [unoptimized + debuginfo] target(s) in 23.76s
Built application at: C:\Projects\Tools\quill\src-tauri\target\debug\quill-tauri.exe
Finished 1 bundle at:
    C:\Projects\Tools\quill\src-tauri\target\debug\bundle\nsis\Quill_1.1.1_x64-setup.exe

ℹ tests 47
ℹ pass 47
ℹ fail 0
test result: ok. 7 passed; 0 failed
test result: ok. 1 passed; 0 failed

authored-js-mjs-count=0
```
