import type {} from "node:test";

const assert = require("node:assert/strict");
const test = require("node:test");

const markdown = require("./helpers/load-markdown.ts");

const blockConversionCases = [
  {
    name: "heading",
    block: { type: "heading", level: 3, content: "Section" },
    expected: "### Section"
  },
  {
    name: "code",
    block: { type: "code", language: "javascript", content: "const x = 1;" },
    expected: "```javascript\nconst x = 1;\n```"
  },
  {
    name: "ordered list",
    block: { type: "ol", items: ["One", "Two"] },
    expected: "1. One\n2. Two"
  },
  {
    name: "table",
    block: { type: "table", rows: [["A", "B"], ["---", "---"], ["1", "2"]] },
    expected: "| A | B |\n| --- | --- |\n| 1 | 2 |"
  }
];

for (const { name, block, expected } of blockConversionCases) {
  test(`blockToMarkdown: ${name}`, () => {
    assert.equal(markdown.blockToMarkdown(block), expected);
  });
}

test("blocksToMarkdown serializes blocks with canonical blank lines", () => {
  const blocks = [
    { type: "heading", level: 1, content: "Title" },
    { type: "paragraph", content: "Paragraph" },
    { type: "ul", items: ["Alpha", "Beta"] }
  ];

  assert.equal(
    markdown.blocksToMarkdown(blocks),
    "# Title\n\nParagraph\n\n- Alpha\n- Beta"
  );
});
