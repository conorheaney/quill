import type {} from "node:test";

const assert = require("node:assert/strict");
const test = require("node:test");

const markdown = require("./helpers/load-markdown.ts");

const tableSplitCases = [
  {
    name: "trims outer pipes and cells",
    input: "| Name | Value |",
    expected: ["Name", "Value"]
  },
  {
    name: "keeps escaped pipes in one cell",
    input: String.raw`| left\|right | next |`,
    expected: [String.raw`left\|right`, "next"]
  },
  {
    name: "keeps pipes inside matching code fences",
    input: "| `left|right` | next |",
    expected: ["`left|right`", "next"]
  }
];

for (const { name, input, expected } of tableSplitCases) {
  test(`splitTableCells: ${name}`, () => {
    assert.deepEqual(markdown.splitTableCells(input), expected);
  });
}

test("renderTableFromRows renders inline Markdown in headers and cells", () => {
  const rows = [
    ["**Name**", "Link"],
    ["---", "---"],
    ["Quill", "[Docs](https://example.com/docs)"]
  ];

  assert.equal(
    markdown.renderTableFromRows(rows),
    '<table><thead><tr><th><strong>Name</strong></th><th>Link</th></tr></thead><tbody><tr><td>Quill</td><td><a href="https://example.com/docs" target="_blank" rel="noopener noreferrer">Docs</a></td></tr></tbody></table>'
  );
});
