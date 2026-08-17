# PRD-000040-UI Planning Evidence

## Purpose

This document records the planning analysis for replacing Quill's native Tauri window chrome with a custom HTML title bar. It captures the proposed isolation boundary, current repository touchpoints, risks, decisions, and implementation-readiness checks. It is planning evidence, not implementation authorization.

## Requested Outcome

Replace the current Tauri/native window chrome with a slightly taller HTML title bar that contains:

- The current window title
- Minimize
- Restore/maximize toggle
- Close

Broader shell redesign, additional menus, tabs, and extra window actions remain out of scope.

## Confirmed Planning Decisions

1. **Title-bar height:** Use a fixed 40 px title bar, compared with the current packaged Windows chrome at the default 100% scaling.
2. **Maximize/restore:** Use one toggle control. It maximizes a normal window and restores a maximized window; its icon and accessible label follow the actual window state.
3. **Title source:** Keep the existing static title `Quill Markdown Editor` as the single source for the HTML title bar and native/taskbar title.
4. **Close confirmation:** Delegate close requests to the existing document/session confirmation flow. Close the native window only after that flow approves the request.
5. **Theme integration:** Reuse existing theme CSS variables and state patterns for background, text, border, accent, hover, active, and focus styles. Theme changes must update the title bar automatically.
6. **Supported runtime:** Verify the packaged Windows desktop application at 100% scaling across all available Quill themes. Other platforms are out of scope for this item.
7. **Double-click behavior:** Double-clicking the draggable title-bar area toggles maximize/restore. Double-clicking a control activates only that control.

## Current Architecture Findings

| Area | Current state | Planning implication |
| --- | --- | --- |
| Tauri decoration | `src-tauri/tauri.conf.json` sets `decorations` to `true` for the `main` window. | The implementation will need to move the window to a frameless/custom-chrome configuration. |
| Window dimensions | The main window is resizable, maximizable, minimizable, closable, and constrained by `minWidth`/`minHeight`. | Custom chrome must preserve these existing capabilities and constraints. |
| Native title | Tauri config currently names the window `Quill Markdown Editor`. | The visible HTML title and native/taskbar title need one defined source of truth. |
| HTML title | `code/quill.html` currently declares `<title>Quill</title>`. | Planning must resolve the difference between the HTML title and the Tauri title. |
| Desktop bridge | `code/scripts/desktop-bridge.js` currently exposes file, dialog, image, and application-version operations, but no window controls. | Add a narrow window adapter rather than distributing Tauri calls through application code. |
| Shell layout | `.shell` in `code/styles/quill.css` uses `height: 100vh` and `min-height: 100vh`. | The title bar must occupy an explicit layout row or the usable editor height may change unexpectedly. |
| Frontend loading | Scripts are loaded directly from `code/quill.html`, with `desktop-bridge.js` loaded before `quill-app.js`. | A focused window module can be added with minimal bootstrap wiring. |
| Permissions | `src-tauri/capabilities/default.json` enables `core:default` and `dialog:default` for the `main` window. | Required window permissions should be checked and kept to the minimum needed by the adapter. |

## Proposed Isolation Boundary

The feature can be contained in four layers:

```text
quill.html
  └── title-bar markup and mount point

window-chrome.css
  └── title-bar layout, states, focus styles, and drag-region rules

window-chrome.js
  └── control wiring, state synchronization, keyboard behavior, and callbacks

desktop-bridge.js
  └── narrow Tauri adapter for minimize, maximize/restore, close, drag, and title
```

### `window-chrome.js` responsibilities

- Bind the four visible title-bar elements.
- Invoke the bridge for minimize, maximize/restore, close, and drag operations.
- Synchronize the restore control with actual maximized state.
- Keep control elements out of the draggable region.
- Provide accessible names, focus behavior, and keyboard activation.
- Expose a small initialization contract, for example:

```text
initializeWindowChrome({
  title,
  onRequestClose,
  desktopBridge
})
```

The module should not own document persistence or unsaved-change policy.

### `desktop-bridge.js` responsibilities

Expose only the window operations needed by the module:

- `minimize()`
- `toggleMaximize()` or explicit maximize/restore operations
- `isMaximized()` and, if supported, state-change listening
- `close()`
- `startDragging()`
- `setTitle(title)`

This keeps Tauri-specific APIs out of `quill-app.js`, the document controller, and the title-bar view.

### Application integration responsibilities

The existing application should provide only the boundary data:

- Current title value
- Optional title-update notification when the active document changes
- `onRequestClose` callback for unsaved-change confirmation

Close confirmation should remain with the document/session controller. The window module should request closing, not duplicate persistence policy.

## Key Risks and Controls

### Dragging and resizing

Frameless windows require an explicit draggable area. Buttons must not be draggable, and window-edge resizing must remain available. Verify clicking, dragging, double-clicking the title bar, and resizing from all supported edges.

### Maximize and restore state

The restore control must follow the actual window state, including taskbar actions, Windows snap behavior, title-bar double-click behavior if supported, and fullscreen transitions. Avoid relying only on local button state.

### Close and unsaved content

The custom close button could bypass an existing unsaved-change decision unless it delegates to the document/session controller. Define the close contract before implementation and test both clean and dirty documents.

### Title consistency

The Tauri title (`Quill Markdown Editor`) and HTML title (`Quill`) currently differ. Choose one source of truth and update the visible title and native title consistently when the active document changes.

### Layout and usable height

The current shell fills `100vh`. The title bar should be a deliberate shell row, with the remaining content using the available height. Avoid adding a title bar that simply overlays or steals space from the editor panes.

### Accessibility

Use real buttons with accessible names, visible focus states, keyboard activation, sensible tab order, and no focus trap in the draggable area. Verify controls at the keyboard and with accessibility inspection.

### Platform, theme, and DPI behavior

The title bar must follow the currently selected Quill theme rather than introducing a separate or permanently fixed chrome palette. Reuse the existing theme tokens and styling ownership where practical, and ensure the title bar updates immediately when the user switches themes. Verify icon alignment, hit targets, contrast, focus indication, borders, shadows, and behavior when maximized in every available theme and at supported scaling levels in the packaged Windows application.

### Tauri permissions and packaging

Confirm the required window APIs are available through the configured capability and that the bridge works in the packaged runtime, not only in a development browser-like environment. Keep the permission surface narrow.

## Expected Change Surface

Likely implementation files:

- `code/quill.html` — title-bar markup and script/style inclusion
- `code/styles/quill.css` or a dedicated title-bar stylesheet — shell/title-bar layout
- `code/scripts/window-chrome.js` — isolated UI behavior
- `code/scripts/desktop-bridge.js` — Tauri window adapter
- `code/scripts/quill-app.js` or the document controller — title and close callbacks only
- `src-tauri/tauri.conf.json` — custom/frameless window configuration
- Focused tests and packaged-runtime evidence — control behavior, accessibility, and layout

No broad refactor should be required if these boundaries are maintained.

## Planning Decisions Needed

All planning decisions are resolved as recorded in [Confirmed Planning Decisions](#confirmed-planning-decisions).

## Implementation Readiness Checklist

- [x] Tauri decoration and required window permissions are specified.
- [x] Title-bar markup, layout row, and exact 40 px height are specified.
- [x] Drag region and resize behavior are specified.
- [x] Window bridge API is specified and isolated from application logic.
- [x] Maximize/restore state synchronization is specified.
- [x] Title propagation is specified.
- [x] Selected-theme integration is specified, including live theme switching and contrast/focus states.
- [x] Unsaved-close behavior is specified.
- [x] Accessibility and keyboard expectations are specified.
- [x] Packaged-runtime verification covers clean and dirty documents, state changes, themes, and 100% scaling.

## Evidence Summary

The feature is ready to move into implementation as a small, isolated shell module with a narrow application integration boundary. The highest-risk behaviors now have explicit decisions and verification coverage: maximize/restore synchronization, close confirmation for unsaved documents, title-source consistency, selected-theme integration, and preserving usable layout height after introducing the custom title bar.
