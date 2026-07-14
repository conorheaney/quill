# Getting Started With Quill

Quill is a focused Markdown editor with a live rendered view and inline editing. It keeps the source and rendered output visible together.

## The First Look

When Quill opens, it loads this guide as the default document. The window is split into three useful areas:

- The sidebar contains the Quill identity and a clickable outline of your H1, H2, and H3 headings.
- The Markdown pane is where you write and edit the source text.
- The RENDER pane shows how that Markdown will look when rendered.

The source and render panes stay in sync as you work.

## Write Your First Document

1. Select the Markdown pane.
2. Replace the starter text or choose `NEW` for a clean document.
3. Use Markdown syntax, or use the formatting buttons for bold, italic, headings, bullet lists, and code blocks.
4. Watch the RENDER pane update as you type.

For example:

    # My Notes

    A short paragraph with **emphasis**.

    - One useful thought
    - Another useful thought

## Edit Inline

Documents open in read-only mode by default, so the rendered view is safe to click, inspect, and present without accidentally changing anything.

To edit from the rendered view:

1. Turn on `ALLOW INLINE EDITING` in the RENDER header.
2. Click a paragraph, heading, list, table, quote, or code block.
3. Make your changes in the inline editor frame.
4. Select the update icon to write the change back to Markdown, or the cancel icon to leave it alone.

Inline hover controls also let you delete a block, insert a block before or after it, or move it up and down. They are hidden again when inline editing is disabled.

## Open And Save Files

- `LOAD` opens a Markdown, text, or compatible file from your computer.
- `SAVE` writes back to the current file when the browser grants file access, or downloads a Markdown copy otherwise.
- `SAVE AS` creates a new Markdown file.
- `NEW` starts an untitled document with a small writing prompt.

Quill also supports local draft saving through `AUTOSAVE`. The save status appears as a toast notification.

## Navigate And Control The View

- Select an item in the Outline to jump to that heading.
- Use `SHOW MARKDOWN` to collapse or restore the source pane.
- Use `CYCLE THEME` to switch between available visual themes.
- Use the Markdown header buttons to apply formatting to the current selection or line.

## A Few Things To Know

- The Outline currently includes H1, H2, and H3 headings.
- Long outline entries wrap inside the sidebar; horizontal scrolling should not be necessary.
- The Markdown source remains editable even when inline editing is disabled.
- Quill is designed for local-first document workflows.

## Keep Going

Open a file, write in Markdown, and use the rendered view to review the result.

## Desktop Runtime Setup

Quill now targets Tauri for the desktop shell.

Before the first desktop run on Windows:

1. Install Node.js if it is not already available.
2. Install Rust with the MSVC toolchain from `rustup`.
3. Install Microsoft Visual Studio Build Tools with the `Desktop development with C++` workload.
4. Install the Microsoft Edge WebView2 runtime if your machine does not already have it.

Then bootstrap and run Quill:

1. Run `npm install` in the repo root.
2. Run `powershell -ExecutionPolicy Bypass -File .\scripts\check-tauri-prereqs.ps1` to confirm the Windows toolchain is ready.
3. Run `npm run tauri:dev` for the desktop app.
4. Run `npm run build` for the Windows bundle.

If you only want the browser shell during development, run `npm run web:dev` and open the local URL it prints.

For a fuller Windows setup and troubleshooting checklist, see [TAURI-WINDOWS-SETUP.md](C:/Users/conor/Documents/Markdown%20Editor/docs/TAURI-WINDOWS-SETUP.md).
