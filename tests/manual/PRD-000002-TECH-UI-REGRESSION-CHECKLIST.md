# PRD-000002-TECH manual UI regression checklist

This human-executed checklist covers `AC-06` and the planned `TC-06`. It is intentionally outside the automated `npm test` command. Automated browser testing, packaged-Tauri UI automation, and visual regression remain deferred.

## Execution record

Complete these fields for each Test-phase execution and copy the results into the canonical `TC-06` evidence record.

| Field | Value |
| --- | --- |
| Tester |  |
| UTC timestamp |  |
| Product version |  |
| Git commit |  |
| Windows version |  |
| Overall result | `pass`, `fail`, or `blocked` |
| Evidence locations |  |

## Global preconditions

1. Use the committed packaged candidate required by the PRD Test-phase contract; do not use an uncommitted development build for packaged-app cases.
2. Create a disposable working directory outside the repository. Copy `tests/fixtures/markdown/source-preservation/supported.md` and `unsupported.md` into it. Never edit the canonical fixtures.
3. Ensure the working directory is writable and note its absolute path in the evidence record.
4. Close any other Quill window that could modify the same files.
5. Record screenshots or concise observations for every failed or blocked expected result. Do not treat this checklist file as Test evidence by itself.

## Scenario summary

| Scenario | Workflow | Result |
| --- | --- | --- |
| `UI-01` | Packaged application startup |  |
| `UI-02` | Load a document |  |
| `UI-03` | Save an open document |  |
| `UI-04` | Save As |  |
| `UI-05` | Dirty-document prompts |  |
| `UI-06` | Render-pane inline editing |  |
| `UI-07` | Byte-exact source preservation |  |
| `UI-08` | Missing desktop bridge |  |

## UI-01 — Packaged application startup

### Steps

1. Launch the committed packaged Quill candidate normally.
2. Wait for the initial document and all three panes to render.
3. Inspect the header file controls, footer document label, Markdown source, Render pane, and displayed product version.

### Expected results

- Quill opens without an error dialog or indefinitely blank pane.
- The Outline, Markdown, and Render panes display and the starter document renders.
- `LOAD`, `SAVE`, `SAVE AS`, and `RECENT` are enabled because the packaged desktop bridge is available.
- The footer shows `Untitled draft` without a dirty `*` marker.
- The displayed product version matches the candidate version recorded above.

## UI-02 — Load a document

### Steps

1. Select `LOAD`.
2. Choose the disposable copy of `supported.md`.
3. Compare the Markdown pane and rendered content with the selected file.

### Expected results

- The selected document replaces the prior document only after selection succeeds.
- The Markdown pane contains the file content and the Render pane shows its heading, paragraph formatting, list, quote, code block, table, and final paragraph.
- The footer identifies `supported.md` without a dirty `*` marker.
- Quill reports that the document loaded and adds it to `RECENT` when a reusable full path is available.

## UI-03 — Save an open document

### Steps

1. With the disposable `supported.md` open, append `\n\nSaved regression line.` in the Markdown pane.
2. Confirm that the footer gains a dirty `*` marker and `SAVE` becomes visually accented.
3. Select `SAVE`.
4. Close and reopen the same file using `LOAD`.

### Expected results

- The Render pane updates before saving to include the new paragraph.
- Saving writes to the existing path without asking for a new destination.
- Quill reports a successful save, clears the dirty marker, and removes the dirty accent from `SAVE`.
- Reopening the file shows `Saved regression line.` in both source and rendered content.

## UI-04 — Save As

### Steps

1. Make a distinct source edit, such as appending `\n\nSave As regression line.`.
2. Select `SAVE AS`.
3. Choose a new path named `supported-save-as.md` in the disposable working directory.
4. Confirm the save, then inspect the footer and the new file on disk.
5. Use `LOAD` to reopen the original `supported.md` and then `supported-save-as.md`.

### Expected results

- `SAVE AS` always requests a destination and does not silently overwrite the current path.
- The new file contains the latest editor content, including `Save As regression line.`.
- The footer changes to `supported-save-as.md` and has no dirty marker after the save.
- The original and new files remain independently loadable with their respective content.

## UI-05 — Dirty-document prompts

### Steps

1. Modify the Markdown source and confirm that the footer shows a dirty `*` marker.
2. Select `LOAD`, then cancel the Quill unsaved-changes confirmation.
3. Verify the current content, path, and dirty marker, then select `LOAD` again.
4. Accept the Quill confirmation and select a different disposable Markdown file in the native picker.
5. Modify that document, select `NEW`, and cancel the Quill confirmation.
6. Select `NEW` again and accept the confirmation.

### Expected results

- Cancelling either Quill confirmation preserves the current document, file identity, and dirty state.
- Accepting the load confirmation permits the native picker; selecting a file replaces the document and clears the dirty marker.
- Accepting the new-document confirmation replaces the current content with the untitled prompt, clears the current file identity, and clears the dirty marker.
- Cancelling the native file picker after accepting a load confirmation leaves the current document unchanged.

## UI-06 — Render-pane inline editing

### Steps

1. Select `NEW` and ensure the new document is clean.
2. Turn on `ALLOW INLINE EDITING` in the Render header.
3. Select a rendered paragraph to open its inline editor.
4. Replace the paragraph text with `Updated through the Render pane.` and activate the `UPDATE` checkmark.
5. Turn `ALLOW INLINE EDITING` off and attempt to select the same paragraph again.

### Expected results

- Enabling inline editing changes the toggle state and exposes the inline editor when a rendered block is selected.
- Activating `UPDATE` closes the inline editor, updates the rendered paragraph and corresponding Markdown source, and marks the document dirty.
- Disabling inline editing returns the Render pane to read-only behavior and prevents the inline editor from reopening.

## UI-07 — Byte-exact source preservation

### Preconditions

- Start from a fresh disposable copy of `tests/fixtures/markdown/source-preservation/unsupported.md` named `unsupported-working.md`.
- The canonical expected result is `tests/fixtures/markdown/source-preservation/unsupported-edited.md`.

### Steps

1. Load `unsupported-working.md` in packaged Quill.
2. Enable `ALLOW INLINE EDITING` and select the paragraph beginning `Editable paragraph keeps`.
3. Replace the complete inline-editor content with `Updated paragraph keeps [the reference][quill] intact.` and activate `UPDATE`.
4. Select `SAVE`, then close Quill so no file handle remains open.
5. From the repository root, compare the saved file with the expected fixture:

   ```powershell
   Get-FileHash -Algorithm SHA256 '<work-dir>\unsupported-working.md', 'tests\fixtures\markdown\source-preservation\unsupported-edited.md'
   ```

### Expected results

- Only the explicitly edited paragraph changes in the Markdown pane.
- YAML front matter, nested task/list syntax, raw HTML, definition syntax, indented code, thematic break, blank lines, and the reference definition remain present and unchanged.
- The two SHA-256 hashes are identical, proving byte-for-byte equality with the expected owned-range edit.
- Any mismatch is recorded as a failed Test-phase result; this checklist does not authorize the out-of-scope source-preservation product fix.

## UI-08 — Missing desktop bridge

This is a human negative-path check of the development page, not a supported browser runtime or an automated browser test.

### Steps

1. From the repository root, run `npm run smoke:dev`.
2. Open `http://127.0.0.1:1420/quill.html` in a browser without injecting `window.QuillDesktop`.
3. Inspect the file controls and the persistent status message.
4. Edit the Markdown source and confirm that the Render pane still updates.
5. Stop the development server with `Ctrl+C`.

### Expected results

- The page loads without crashing even though the desktop bridge is absent.
- `LOAD`, `SAVE`, `SAVE AS`, and `RECENT` are disabled; `NEW` and local editing remain available.
- A persistent `Quill desktop app required` message explains that file actions are unavailable outside the packaged app.
- Source editing continues to update the Render pane without attempting a browser file-system fallback.

## Completion rule

`TC-06` may be marked complete only when all applicable scenarios have a recorded result against the exact packaged candidate. A failed or blocked scenario must remain visible in the Test evidence and follow the lifecycle contract; completing this checklist during Implement does not itself verify or pass `TC-06`.
