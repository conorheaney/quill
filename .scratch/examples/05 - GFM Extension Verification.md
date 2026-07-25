# GFM Extension Verification

This file is a local verification input based on public GitHub Flavored Markdown behavior. It is designed to exercise features that go beyond strict CommonMark, especially tables, task lists, and autolink-style content.

## Task Lists

- [x] Completed task items should render as checked.
- [ ] Open task items should render as unchecked.
- [ ] A task item can contain longer text without breaking layout.
- [ ] A renderer should avoid converting ordinary bracket patterns into task items unless they match the expected syntax.

Task lists are common in practical markdown usage, especially for planning notes, release checklists, and issue tracking.

## Tables

| Area | Expected Behavior | Risk To Watch |
| --- | --- | --- |
| Headers | Header row should remain visually distinct | Header/body blur |
| Alignment | Cells should stay aligned across rows | Column drift |
| Long content | Long text should wrap without breaking the table | Overflow or row distortion |
| Inline formatting | Code, emphasis, and links inside cells should still render sensibly | Escaped or malformed cell content |

Here is a second table with slightly more awkward content:

| Case | Example | Notes |
| --- | --- | --- |
| Inline code | `alpha | beta` | The pipe should stay inside the code span rather than splitting the cell. |
| Emphasis | **Important** item | Styling should remain inside the cell. |
| Link | [GitHub Docs](https://docs.github.com/) | Link rendering should not break the row. |
| Long prose | A renderer may need to wrap this content across several visual lines depending on the pane width and font metrics in the host application. | Useful for narrow-pane testing. |

## Strikethrough

GitHub Flavored Markdown commonly supports ~~strikethrough~~. If your renderer claims GFM support, this should usually display as expected and should not bleed into nearby punctuation or whitespace.

## Autolink-Like Content

These plain URLs are useful for smoke checking auto-link behavior:

- https://github.github.com/gfm/
- https://spec.commonmark.org/current/
- https://docs.github.com/

If the renderer does not auto-link bare URLs, that may be expected depending on the implementation target. The point is simply to make the behavior visible.

## Mixed Practical Checklist

### Review Pass

1. Confirm table headers are readable.
2. Confirm task boxes align with text.
3. Confirm long cells do not distort neighboring rows.
4. Confirm inline code containing punctuation stays literal.
5. Confirm links inside cells remain usable if the host allows interaction.

### Release Readiness Notes

- [x] Syntax examples loaded
- [x] Nested formatting included
- [ ] Optional live-link interaction checked
- [ ] Narrow-pane rendering checked

## Collapsible HTML

<details>
<summary>Expandable detail block</summary>

This raw HTML block is included because many GitHub-oriented markdown flows allow a limited set of HTML patterns alongside markdown. It is useful for seeing whether the renderer preserves, sanitizes, ignores, or visibly escapes the structure.

- Item one
- Item two
- Item three

</details>

## Inline HTML

Here is a small inline HTML sample: <kbd>Ctrl</kbd> + <kbd>S</kbd>.

Depending on the renderer, that may be preserved as inline HTML, sanitized, or shown literally. Any of those can be acceptable if they are intentional and consistent.

## Reference Links And Notes

This file also includes reference-style links to keep the structure closer to practical docs.

- [GFM Spec][gfm-spec]
- [GitHub Writing Guide][gh-guide]

[gfm-spec]: https://github.github.com/gfm/
[gh-guide]: https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax

## Final Check Section

> This document is most useful when you want to answer a practical question:
> does the renderer behave like a modern GitHub-style markdown surface for the features that real users commonly reach for?

That is different from strict parser conformance. It is more about applied behavior than formal minimal syntax support.
