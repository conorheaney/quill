global.window = {
  location: {
    href: "https://quill.test/document.md"
  }
};

require("../../../frontend/scripts/markdown.js");

module.exports = global.window.QuillMarkdown;
