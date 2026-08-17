# TC-07 Evidence

| Field | Detail |
| --- | --- |
| PRD | [PRD-000002-TECH](../../docs/25%20-%20Closed/PRD-000002-TECH.md) |
| Acceptance Criteria | AC-07 |
| Product Version | 1.0.13 |
| Status | complete |
| Recorded | 2026-08-15T12:19:14.9893178Z |
| Test | PASS: Run Rust helper and command tests against isolated temporary files, including successful, unusual-path, empty-path, missing-path, and I/O-failure cases. |
| Result | All 6 Rust helper and desktop-command contract tests passed with 0 failures; the Rust harness also passed, and `npm run test:rust` exited with code `0`. |

## Preconditions

- Use product version `1.0.13`.
- Run from the repository root with Rust, Cargo, Node.js, and project dependencies available.
- Ensure `QUILL_TEST_SEED_FAILURE` is unset.
- Keep `tests/rust/desktop_commands.rs` and `tests/rust/test_harness.rs` unchanged before execution.
- Permit the test suite to create and remove uniquely named directories under the operating system temporary directory; do not use user files.

## Steps to Reproduce

1. Confirm the checked-out commit is `af9df91f1de93a23523a460c3b87f5f665276d6e` and the product version is `1.0.13`.
2. Clear `QUILL_TEST_SEED_FAILURE`.
3. Run `npm run test:rust` from the repository root.
4. Verify path/name extraction for nested, spaced, symbol-bearing, and Unicode filenames.
5. Verify case-insensitive MIME selection for supported image extensions and the fallback for unknown or absent extensions.
6. Verify Markdown read, write, and overwrite contracts in isolated temporary directories.
7. Verify empty paths, missing files and parent directories, directory misuse, and representative I/O failures return errors.
8. Confirm every temporary test directory is removed by the test fixture cleanup.
9. Record the command output, test counts, exit code, and failures under Evidence.

## Expected Results

All six helper and desktop-command contract tests pass, along with the Rust harness, and the command exits with code `0`. Reads and writes operate only on isolated temporary files; unusual filenames and MIME-by-extension behavior match the current contract; invalid paths and representative I/O failures return errors; and no future trust-boundary policy is introduced.

## Evidence

| Check | Result |
| --- | --- |
| Candidate | Version `1.0.13`;; seed variable unset |
| Executed command | `npm run test:rust` |
| Outcome | 7 passed total; 0 failed; exit `0`; 6 helper/command tests plus 1 Rust harness test |
| Path/name coverage | Nested paths and filenames containing spaces, symbols, and Unicode passed. |
| MIME coverage | PNG, JPEG/JPG, GIF, WebP, SVG, and BMP mappings passed case-insensitively; unknown and absent extensions returned `application/octet-stream`. |
| Read/write coverage | Isolated Markdown read, initial write, overwrite, returned metadata, and persisted content checks passed. |
| Error coverage | Empty read/write paths, missing files, missing parent directories, reading a directory, and writing to a directory returned errors as expected. |
| Isolation | Tests created unique directories under the operating system temporary directory and removed them through fixture cleanup; no user files were used. |
| Sources | [Rust command suite](../../tests/rust/desktop_commands.rs); [Rust harness](../../tests/rust/test_harness.rs); [desktop commands](../../src-tauri/src/main.rs) |

