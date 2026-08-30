# TC-06 Evidence

| Field | Detail |
| --- | --- |
| PRD | [PRD-000044-TECH](../../docs/20%20-%20Test/PRD-000044-TECH.md) |
| Acceptance Criteria | AC-06 |
| Product Version | 1.1.1 |
| Status | complete |
| Recorded | 2026-08-30T21:45:00.0000000Z |
| Test | Clean-checkout enforcement, reproducibility, full verification, smoke, package, and compatibility-shim checks. |
| Result | FAIL |

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
8. Apply the verified line-ending-safe helper correction and rerun strict/full checks in the working tree and clean clone.

## Expected Results

The committed candidate should pass all checks from a clean checkout, produce identical frontend output on consecutive builds, pass smoke and package checks, and contain no compatibility/global-loading remnants or authored JavaScript/MJS.

## Evidence

- The clean clone passed `npm run typecheck`, frontend build, two-build reproducibility, exact `npm run smoke:dev` HTTP checks, and `npx tauri build --debug`.
- The clean clone initially failed `npm test` at 46 passing / 1 failing Node test because `source-preservation.test.ts` could not find its multiline owned range after normal Windows checkout line-ending conversion.
- The working-tree correction in `tests/node/helpers/source-preservation.ts` supports LF and CRLF owned-range matching while preserving the actual source bytes; after that correction, the working tree and corrected clean clone passed `npm run typecheck` and `npm test` with 47 Node and 8 Rust tests passing.
- Authored source/config searches in the clean clone returned zero `withGlobalTauri`, `window.__TAURI__`, or `__TAURI__` matches and zero authored `.js`/`.mjs` files.
- TC-06 remains failed for the committed `1.1.1` candidate because the correction is currently uncommitted. A new committed candidate and rerun are required before this acceptance criterion can pass.

Basic command output:

```text
clean clone: status empty

> Quill@1.1.1 typecheck
> tsc --noEmit

ℹ tests 47
ℹ pass 46
ℹ fail 1
✖ owned-range edit preserves all other bytes: unsupported and nuanced Markdown
AssertionError [ERR_ASSERTION]: owned source range must exist in the fixture

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

After the working-tree helper correction:
ℹ tests 47
ℹ pass 47
ℹ fail 0
test result: ok. 7 passed; 0 failed
test result: ok. 1 passed; 0 failed
```
