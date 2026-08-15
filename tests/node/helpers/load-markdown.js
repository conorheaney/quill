global.window = {
  location: {
    href: "https://quill.test/document.md"
  }
};

require("../../../code/scripts/markdown.js");

module.exports = global.window.QuillMarkdown;
