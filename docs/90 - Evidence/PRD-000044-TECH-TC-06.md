# TC-06 Evidence

| Field | Detail |
| --- | --- |
| PRD | [PRD-000044-TECH](../../docs/25%20-%20Closed/PRD-000044-TECH.md) |
| Acceptance Criteria | AC-06 |
| Product Version | 1.1.1 |
| Status | complete |
| Recorded | 2026-08-30T22:15:00.0000000Z |
| Test | Clean-checkout enforcement, reproducibility, full verification, smoke, package, and compatibility-shim checks. |
| Result | PASS |

## Preconditions

- PRD-000044 is in `Test` and the committed product candidate is Quill `1.1.1` at commit `1d2a5415571c7da2420b900a24a5520f85e86790`.
- A clean local clone was created from that commit; its initial Git status was empty.
- Node.js, repository dependencies, and the Rust/Cargo toolchain are installed locally.

## Steps to Reproduce

1. Create a clean local clone of the committed candidate and link the installed dependencies.
2. Run `npm run typecheck` and `npm run build:frontend`.
3. Run `npm test` from the clean clone.
4. Run two consecutive frontend builds and compare bundle/source-map hashes.
5. Run `npm run smoke:dev` on an isolated port and request the shell, generated bundle, and mounted fragments.
6. Run `npx tauri build --debug`.
7. Search authored source/config paths for compatibility globals, obsolete loading, and `.js`/`.mjs` files.
8. Rerun strict/full checks from a fresh clean clone of the committed correction.

## Expected Results

The committed candidate should pass all checks from a clean checkout, produce identical frontend output on consecutive builds, pass smoke and package checks, and contain no compatibility/global-loading remnants or authored JavaScript/MJS.

## Evidence

- The clean clone passed `npm run typecheck`, frontend build, two-build reproducibility, exact `npm run smoke:dev` HTTP checks, and `npx tauri build --debug`.
- The first pre-correction candidate exposed a Windows line-ending failure in the source-preservation helper. The committed correction in `tests/node/helpers/source-preservation.ts` supports LF and CRLF owned-range matching while preserving the actual source bytes.
- A fresh clean clone of commit `8816d5c` passed `npm run typecheck` and `npm test` with 47 Node and 8 Rust tests passing.
- Authored source/config searches in the clean clone returned zero `withGlobalTauri`, `window.__TAURI__`, or `__TAURI__` matches and zero authored `.js`/`.mjs` files.
- TC-06 passes for the committed `1.1.1` candidate at commit `8816d5c`.

Basic command output:

```text
clean clone commit: 8816d5c

> Quill@1.1.1 typecheck
> tsc --noEmit

ℹ tests 47
ℹ pass 47
ℹ fail 0

bundle-equal=True
map-equal=True

Quill dev server running at http://127.0.0.1:1424/
/ 200 bytes=324
/quill.html 200 bytes=9964
/scripts/quill-app.js 200 bytes=256621
/html/recent-files.html 200 bytes=547
/html/outline-pane.html 200 bytes=145
/html/markdown-pane.html 200 bytes=1621
/html/preview-pane.html 200 bytes=814

Finished 1 bundle at:
    C:\Users\conor\AppData\Local\Temp\quill-clean-tc06-clone\src-tauri\target\debug\bundle\nsis\Quill_1.1.1_x64-setup.exe

withGlobalTauri-authored-count=0
window.__TAURI__-authored-count=0
__TAURI__-authored-count=0
authored-js-mjs-count=0

ℹ tests 47
ℹ pass 47
ℹ fail 0
test result: ok. 7 passed; 0 failed
test result: ok. 1 passed; 0 failed
```
