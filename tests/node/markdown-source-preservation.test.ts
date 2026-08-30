import type {} from "node:test";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const markdown = require("./helpers/load-markdown.ts");
const {
  assertOnlyOwnedRangeChanged,
  replaceOwnedBytes
} = require("./helpers/source-preservation.ts");

const fixtureRoot = path.join(
  __dirname,
  "..",
  "fixtures",
  "markdown",
  "source-preservation"
);

const preservationCases = [
  {
    name: "supported Markdown",
    sourceFile: "supported.md",
    expectedFile: "supported-edited.md",
    ownedSource: "A paragraph with **bold**, *emphasis*, and [a link](https://example.com).",
    replacement: "An updated paragraph with **stronger** text."
  },
  {
    name: "unsupported and nuanced Markdown",
    sourceFile: "unsupported.md",
    expectedFile: "unsupported-edited.md",
    ownedSource: "Editable paragraph keeps [a reference][quill] and  two spaces before a hard break.  \nThe second line belongs to the same block.",
    replacement: "Updated paragraph keeps [the reference][quill] intact."
  }
];

function readFixture(fileName: string): Buffer {
  return fs.readFileSync(path.join(fixtureRoot, fileName));
}

for (const fixture of preservationCases) {
  test(`source-preservation corpus is meaningful: ${fixture.name}`, () => {
    const source = readFixture(fixture.sourceFile).toString("utf8");
    const wholeDocumentRoundTrip = markdown.blocksToMarkdown(
      markdown.parseMarkdownBlocks(source)
    );

    assert.notEqual(
      wholeDocumentRoundTrip,
      source,
      "fixture must contain source details that whole-document serialization would alter"
    );
  });

  test(`owned-range edit preserves all other bytes: ${fixture.name}`, () => {
    const source = readFixture(fixture.sourceFile).toString("utf8");
    const expected = readFixture(fixture.expectedFile);
    const edit = replaceOwnedBytes(
      source,
      fixture.ownedSource,
      fixture.replacement
    );

    assertOnlyOwnedRangeChanged(edit);
    assert.deepEqual(edit.resultBytes, expected);
  });
}
