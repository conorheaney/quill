import type {} from "node:test";

const assert = require("node:assert/strict");
const test = require("node:test");

const markdown = require("./helpers/load-markdown.ts");

const parsingCases = [
  {
    name: "headings and paragraphs",
    input: "## Heading\n\nFirst line\nsecond line",
    expected: [
      { type: "heading", level: 2, content: "Heading" },
      { type: "paragraph", content: "First line\nsecond line" }
    ]
  },
  {
    name: "lists and blockquotes",
    input: "- Alpha\n- Beta\n\n1. First\n2. Second\n\n> Quoted\n> Again",
    expected: [
      { type: "ul", items: ["Alpha", "Beta"] },
      { type: "ol", items: ["First", "Second"] },
      { type: "blockquote", lines: ["Quoted", "Again"] }
    ]
  },
  {
    name: "fenced code language normalization",
    input: "```js\nconst value = 1;\n```",
    expected: [
      { type: "code", language: "javascript", content: "const value = 1;" }
    ]
  },
  {
    name: "table rows",
    input: "| Name | Value |\n| --- | --- |\n| Quill | Editor |",
    expected: [
      {
        type: "table",
        rows: [
          ["Name", "Value"],
          ["---", "---"],
          ["Quill", "Editor"]
        ]
      }
    ]
  }
];

for (const { name, input, expected } of parsingCases) {
  test(`parseMarkdownBlocks: ${name}`, () => {
    assert.deepEqual(markdown.parseMarkdownBlocks(input), expected);
  });
}

test("getMarkdownBlockRanges maps source blocks to exact source spans", () => {
  const input = "# Heading\n\nFirst paragraph\nsecond line\n\n- One\n- Two";

  assert.deepEqual(markdown.getMarkdownBlockRanges(input), [
    { start: 0, end: 9 },
    { start: 11, end: 38 },
    { start: 40, end: 51 }
  ]);
});
