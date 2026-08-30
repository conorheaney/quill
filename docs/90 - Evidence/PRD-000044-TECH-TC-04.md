# TC-04 Evidence

| Field | Detail |
| --- | --- |
| PRD | [PRD-000044-TECH](../../docs/20%20-%20Test/PRD-000044-TECH.md) |
| Acceptance Criteria | AC-04 |
| Product Version | 1.1.1 |
| Status | complete |
| Recorded | 2026-08-30T21:20:00.0000000Z |
| Test | Frontend startup and UI-coordination assets are built, served, and present in the packaged candidate. |
| Result | PASS |

## Preconditions

- PRD-000044 is in `Test` and the committed product candidate is Quill `1.1.1`.
- The checkout contains the converted coordinator and UI modules from commit `1d2a5415571c7da2420b900a24a5520f85e86790`.
- Node.js, repository dependencies, and the Rust/Cargo toolchain are installed locally.

## Steps to Reproduce

1. Run `npm run typecheck` from the repository root.
2. Run `npm run build:frontend`.
3. Start `node scripts/serve-quill.ts` with `PORT=1421` and request the root shell, generated bundle, and mounted UI fragments.
4. Inspect the release executable, installer, and synchronized root executable with size and SHA-256 checks.
5. Run `npm test` to execute the complete Node and Rust suite.

## Expected Results

Strict diagnostics pass; the frontend bundle is generated; the shell and all required mounted fragments return HTTP 200; the packaged candidate artifacts exist and the root executable matches the release executable; and the canonical Node/Rust suite passes.

## Evidence

- `npm run typecheck` completed with exit code 0 and no diagnostics.
- `npm run build:frontend` generated `dist/scripts/quill-app.js` and its source map.
- The local typed smoke server returned HTTP 200 for `/`, `/quill.html`, `/scripts/quill-app.js`, `/html/recent-files.html`, `/html/outline-pane.html`, `/html/markdown-pane.html`, and `/html/preview-pane.html`.
- The release executable, installer, and root executable were present; the root and release executable hashes matched.
- `npm test` completed with 47 passing Node tests and 8 passing Rust tests.

Basic command output:

```text
> Quill@1.1.1 typecheck
> tsc --noEmit

> Quill@1.1.1 build:frontend
> node scripts/build-frontend.ts

dist\scripts\quill-app.js      250.0kb
dist\scripts\quill-app.js.map  401.1kb
Frontend built from C:\Projects\Tools\quill\frontend to C:\Projects\Tools\quill\dist.

/ 200 bytes=312
/quill.html 200 bytes=9947
/scripts/quill-app.js 200 bytes=255997
/html/recent-files.html 200 bytes=528
/html/outline-pane.html 200 bytes=142
/html/markdown-pane.html 200 bytes=1597
/html/preview-pane.html 200 bytes=813

C:\Projects\Tools\quill\src-tauri\target\release\quill-tauri.exe bytes=10146304 sha256=439DF71A3BB653189A86B81B0022ECF11D2A8CE16A95910EBD98E2EB91771C60
C:\Projects\Tools\quill\src-tauri\target\release\bundle\nsis\Quill_1.1.1_x64-setup.exe bytes=3033556 sha256=94A337D669F6C51B98E42A2AA8150AB45A00C830D1E938D458DB05C56AD0EEC9
C:\Projects\Tools\quill\quill.exe bytes=10146304 sha256=439DF71A3BB653189A86B81B0022ECF11D2A8CE16A95910EBD98E2EB91771C60

ℹ tests 47
ℹ pass 47
ℹ fail 0
test result: ok. 7 passed; 0 failed
test result: ok. 1 passed; 0 failed
```
