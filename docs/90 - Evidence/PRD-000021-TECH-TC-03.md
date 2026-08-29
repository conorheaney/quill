# TC-03 Evidence

| Field | Detail |
| --- | --- |
| PRD | [PRD-000021-TECH](../../docs/25%20-%20Closed/PRD-000021-TECH.md) |
| Acceptance Criteria | AC-04 |
| Product Version | 1.1.0 |
| Status | complete |
| Recorded | 2026-08-29T15:31:29.0772035Z |
| Test | Automated generated-app serving, asset loading, and runtime adapter smoke checks. |
| Result | PASS |

## Preconditions

- `npm run smoke:dev` is running from the repository root.
- The generated frontend is served from `dist/` at `http://127.0.0.1:1420/`.

## Steps to Reproduce

1. Start `npm run smoke:dev`.
2. Request `/`, `/quill.html`, `/scripts/quill-app.js`, `/styles/quill.css`, and `/quill-icon.png` from the local server.
3. Inspect the app HTML and generated bundle for the bundled entry, bridge adapter, and Markdown runtime.
4. Verify `dist/smoke-check.html` exists.

## Expected Results

The generated app and required resources return successfully, the HTML references the generated bundle, and the bundle contains the bridge and Markdown runtime adapters. The browser smoke harness is available for the manual TC-05 checks.

## Evidence

Captured HTTP and runtime probe output:

```text
/ status=200 bytes=312
/quill.html status=200 bytes=9947
/scripts/quill-app.js status=200 bytes=158420
/styles/quill.css status=200 bytes=26023
/quill-icon.png status=200 bytes=921070
bundleTag=True
bridgeAdapterInBundle=True
markdownRuntimeInBundle=True
smokeHarnessPresent=True
```
