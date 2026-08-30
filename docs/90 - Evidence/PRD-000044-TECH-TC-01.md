# TC-01 Evidence

| Field | Detail |
| --- | --- |
| PRD | [PRD-000044-TECH](../../docs/20%20-%20Test/PRD-000044-TECH.md) |
| Acceptance Criteria | AC-01 |
| Product Version | 1.1.1 |
| Status | complete |
| Recorded | 2026-08-30T21:10:34.3850166Z |
| Test | Shared TypeScript contracts and native bridge signatures are ready for verification. |
| Result | PASS |

## Preconditions

- PRD-000044 is in `Test` and the committed product candidate is Quill `1.1.1`.
- The checkout is on commit `1d2a5415571c7da2420b900a24a5520f85e86790` with the release candidate available.
- Node.js, the repository dependencies, and the Rust/Cargo toolchain are installed locally.

## Steps to Reproduce

1. Run `npm run typecheck` from the repository root.
2. Run `npm test` to execute the Node and Rust contract layers.
3. Review [contracts.ts](../../frontend/scripts/contracts.ts), [desktop-bridge.ts](../../frontend/scripts/desktop-bridge.ts), and the native command implementations under `src-tauri/src/` against the bridge payload and method definitions.
4. Compare the bridge command names and payload boundaries with the native registrations and record the observed result.

## Expected Results

The shared TypeScript contracts compile without diagnostics, the Node and Rust contract tests execute successfully, and the typed desktop bridge preserves the existing native command names, payload shapes, and result boundaries.

## Evidence

- `npm run typecheck` completed with exit code 0 and no diagnostics.
- `npm test` completed with 47 passing Node tests and 8 passing Rust tests.
- The typed bridge invokes `read_markdown_file`, `write_markdown_file`, `inspect_markdown_file`, `verify_markdown_file`, `read_image_data_url`, and `reveal_in_explorer`; the same commands are registered in `src-tauri/src/main.rs` and exercised by `tests/rust/desktop_commands.rs`.
- The candidate commit is [1d2a541](https://github.com/conorheaney/quill/commit/1d2a5415571c7da2420b900a24a5520f85e86790) and the product version is `1.1.1`.

Basic command output:

```text
> Quill@1.1.1 typecheck
> tsc --noEmit

ℹ tests 47
ℹ pass 47
ℹ fail 0
test result: ok. 7 passed; 0 failed
test result: ok. 1 passed; 0 failed
```
