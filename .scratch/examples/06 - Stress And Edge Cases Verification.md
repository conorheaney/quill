# Stress And Edge Cases Verification

This file is designed to be slightly awkward on purpose. It is still readable, but it includes enough mixed structure and imperfect-looking content to help expose edge-case rendering issues.

## Dense Mixed Content

Markdown renderers often look fine when each block type appears in isolation. Problems tend to appear when structures sit close together, when punctuation is heavy, or when inline formatting lives inside larger containers. This file concentrates those patterns into one place.

### List Followed By Quote

- Item one introduces a topic.
- Item two includes `inline code with symbols like * and _ and |`.
- Item three is followed immediately by a quote:

> A nearby block quote should remain separate from the list while still feeling structurally related in the rendered flow.

If the spacing here feels collapsed or inconsistent, that is useful verification feedback.

### Quote Followed By Table

> The next structure is a compact table.

| Scenario | Sample | Expected Reading |
| --- | --- | --- |
| Escaped-looking content | `alpha | beta` | One visible code span in one cell |
| Markdown in cell | *italic* and **bold** | Styled text without row damage |
| Link in cell | [Docs](https://docs.github.com/) | Link remains contained |

Transitions like quote-to-table are good at revealing layout discontinuities.

## Wrapped Paragraph Stress

This paragraph is intentionally written in a way that invites line wrapping in a narrow preview pane, which helps surface spacing issues, selection oddities, and any tendency for the renderer to insert surprising visual breaks when long prose runs across many lines in a constrained layout.

This second paragraph exists to show whether the block gap remains stable after a long wrapped block. A renderer that feels acceptable on short paragraphs can become noticeably uneven when the content wraps several times.

## Fences And Near-Fences

```json
{
  "name": "verification",
  "mode": "stress",
  "checks": ["lists", "quotes", "tables", "links", "images"]
}
```

The next line looks fence-adjacent but should remain ordinary text:

```not-a-real-language
Still just a fenced block with an unusual info string.
```

And here is an indented code sample:

    line one
    line two
    line three

Using both fenced and indented code in one file helps confirm the renderer does not normalize everything into one visual style accidentally.

## HTML-Like Text

Sometimes a document contains literal strings such as `<meta>`, `<script>`, or `<a href="#example">`. Those strings are useful because they reveal whether the renderer escapes them, treats them as live HTML, or behaves differently depending on whether they appear in body text, code spans, or fenced blocks.

For example:

- body text: <sample-tag>
- code span: `<sample-tag>`
- fenced code:

```html
<sample-tag attribute="value">demo</sample-tag>
```

## Broken And Missing References

[Missing local doc](./missing-doc.md)

![Missing local image](./missing-image.png)

[Probably invalid anchor](#definitely-not-present)

These are intentionally unresolved. They are useful for checking how the application presents missing local paths, non-existent anchors, and broken image targets.

## Final Mixed Section

1. Start with an ordered item.
2. Add a continuation paragraph under it.

   This continuation should remain attached to the numbered item.

3. Add a nested bullet list.

   - Nested item A
   - Nested item B with `inline code`
   - Nested item C with [an inline link](https://github.com/commonmark/commonmark-spec)

4. Finish with a short quote.

   > The goal is not perfect prose. The goal is a realistic, slightly messy structure that helps reveal weak spots.

## Closing Note

This file is most useful when you want one medium-sized document that is more stressful than a polished guide but still readable enough to inspect visually without feeling like synthetic noise.
