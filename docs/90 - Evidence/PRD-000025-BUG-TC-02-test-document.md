# Angle-Bracket Rendering Test

Use this document to verify that literal angle-bracket text remains visible in each Markdown context.

Expected result for every case: `<TEST>` is visible as text, and the surrounding Markdown formatting is preserved.

## Normal paragraph

Text <TEST> text.

## Emphasis

Text *<TEST>* text.

## Strong text

Text **<TEST>** text.

## Heading

### <TEST>

## Unordered list item

- <TEST>

## Ordered list item

1. <TEST>

## Blockquote

> <TEST>

## Inline code

Text `<TEST>` text.

## Table cell

| Context | Value |
| --- | --- |
| Literal text | <TEST> |

## Link label

[<TEST>](https://example.com)

## Image alt text

![<TEST>](https://example.com/image.png)

## Raw HTML-like boundary check

This should remain literal text unless raw HTML is explicitly supported:

<span>text</span>

## Verification checklist

- [ ] `<TEST>` is visible in the normal paragraph.
- [ ] `<TEST>` is visible inside emphasis and strong text.
- [ ] `<TEST>` is visible in headings, lists, and blockquotes.
- [ ] `<TEST>` is visible inside inline code and table cells.
- [ ] `<TEST>` remains visible in link labels and image alt text.
- [ ] The raw HTML-like boundary behaves according to the product decision.
