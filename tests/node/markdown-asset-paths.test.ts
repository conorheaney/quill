import type {} from "node:test";

const assert = require("node:assert/strict");
const test = require("node:test");

const { rebaseRelativeImageReferences } = require("./helpers/load-markdown.ts");

test("Save As rebases relative image references to the new document directory", () => {
  const source = "![editor](PRD-000047-UI-TC-02-editor.png)\n\n![other](../images/other.png)";
  const rebased = rebaseRelativeImageReferences(
    source,
    "C:/Projects/Tools/quill/docs/90 - Evidence/PRD-000047-UI-TC-02.md",
    "C:/Temp/copyofdoc.md"
  );

  assert.equal(
    rebased,
    "![editor](..\\Projects\\Tools\\quill\\docs\\90 - Evidence\\PRD-000047-UI-TC-02-editor.png)\n\n![other](..\\Projects\\Tools\\quill\\docs\\images\\other.png)"
  );
});

test("Save As leaves external image references unchanged", () => {
  const source = "![remote](https://example.com/image.png) ![absolute](C:/images/image.png)";
  assert.equal(
    rebaseRelativeImageReferences(source, "C:/notes/current.md", "C:/Temp/copy.md"),
    source
  );
});
