const testWindow = {
  location: {
    href: "https://quill.test/document.md"
  }
} as unknown as Window;

Object.assign(globalThis, { window: testWindow });

require("../../../frontend/scripts/markdown.ts");

module.exports = testWindow.QuillMarkdown;



