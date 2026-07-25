# CommonMark Core Verification

This file is a local verification input inspired by the public CommonMark materials. It is not a verbatim mirror of the spec. Instead, it collects the kinds of structures that are useful when checking how a markdown renderer behaves with core syntax.

## Headings

Markdown heading handling tends to look simple until the file mixes multiple styles and content shapes. A renderer should distinguish between heading levels clearly, preserve ordering, and avoid leaking formatting into nearby paragraphs. This section exists to provide a straightforward outline for sidebar or heading navigation checks.

### Subheading Depth

Heading depth matters for outline generation, anchor creation, spacing, and visual rhythm. Files like this help expose whether the preview collapses levels together, over-indents the outline, or drops a heading entirely after another complex block appears later in the document.

#### Small Structural Note

Some renderers behave correctly on a tiny sample but begin to drift once the document includes lists, quotes, and code near heading boundaries. That is one reason medium-sized verification files are often more useful than isolated one-line tests.

## Paragraphs

Markdown paragraphs should flow naturally across wrapped lines.
They should usually remain part of the same paragraph unless a blank line separates them.
That means soft line handling matters, especially in documentation that is manually wrapped for readability.

This second paragraph is intentionally separated by a blank line so it should render as a distinct block. A renderer that merges these two paragraphs or inserts unexpected line breaks would be exposing a useful verification signal.

## Emphasis

You should see normal inline emphasis such as *italics*, **bold**, and ***combined emphasis***. Code spans like `literal markers such as * or _` should remain literal instead of triggering inline styling inside the code span.

Another useful check is punctuation adjacency: words like **strong**, *emphasis*, and `code` should not consume trailing punctuation unless the markup actually includes it.

## Lists

- Unordered list items should line up correctly.
- Nested content should remain visually associated with the right parent item.
- A renderer should not flatten everything into one level.

1. Ordered lists should preserve numbering structure.
2. They should continue naturally through multiple items.
3. Nested bullets beneath them should remain nested.

   - This child bullet is nested under the ordered list.
   - It gives the renderer a chance to prove indentation handling.

4. A following ordered item should continue after the nested block.

## Block Quotes

> A block quote should be visually distinct from body text.
>
> It should also preserve paragraph separation inside the quote when blank lines are present.
>
> > Nested block quotes should render inside the parent quote rather than escaping from it.

Block quotes are useful because they often reveal precedence bugs when mixed with lists, headings, or code fences.

## Code

Inline code like `const value = 3` should remain within the flow of a sentence. It should not be interpreted as emphasis or as a link just because it contains punctuation.

```js
function renderPreview(markdown) {
  const status = "ok";
  return { markdown, status };
}
```

Fenced code blocks should keep spacing and avoid merging into nearby paragraphs. The language hint should remain visible to any syntax-highlighting layer that chooses to use it.

```text
Plain text fences are useful too.
They make it easier to see whether the renderer treats
non-code-looking content any differently inside a fence.
```

## Links

An inline link such as [CommonMark](https://spec.commonmark.org/current/) should render cleanly and remain clickable if the application supports live links. A reference-style link should work as well, like [Spec Repo][spec-repo].

[spec-repo]: https://github.com/commonmark/commonmark-spec

Reference definitions should not create visible clutter in the body when rendered normally.

## Images

An image reference is useful even when the target is intentionally absent:

![Missing sample image](./missing-commonmark-image.png)

That gives you a way to inspect broken-image behavior, placeholder behavior, or fallback text behavior without needing to ship an actual asset beside the file.

## Thematic Break

---

The break above should split the document into visible sections. It is a small feature, but it often reveals whether the renderer handles transitions cleanly after several earlier block types.

## Mixed Structure

1. A list item can include a paragraph.

   This continuation paragraph should stay attached to the list item rather than becoming a free-standing body paragraph.

2. It can also include a block quote.

   > Quoted material inside a list item is a useful structural stress case.

3. And it can include a code block.

   ```bash
   npm run verify-markdown
   ```

The point of this section is not to be exhaustive. It is to create a realistic mixed-structure document that makes block precedence visible at a glance.

## Closing Notes

This file should be useful for:

- outline generation
- heading anchors
- wrapped paragraphs
- inline emphasis
- nested lists
- block quotes
- fenced code
- reference links
- broken image handling
- mixed block precedence

Because it is moderate in size and structure-rich, it should behave more like a real working document than a tiny feature demo.
