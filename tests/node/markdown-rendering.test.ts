import type {} from "node:test";

const assert = require("node:assert/strict");
const test = require("node:test");

const markdown = require("./helpers/load-markdown.ts");

const renderingCases = [
  {
    name: "block and inline Markdown",
    input: "# Title\n\n**Bold** and *italic* with `code`.",
    expected: '<h1>Title</h1>\n<p><strong>Bold</strong> and <em>italic</em> with <code>code</code>.</p>'
  },
  {
    name: "HTML-like text is escaped",
    input: "Literal <TEST> & text",
    expected: "<p>Literal &lt;TEST&gt; &amp; text</p>"
  },
  {
    name: "fenced code",
    input: "```js\nconst value = \"<tag>\";\n```",
    expected: '<pre><code class="language-js">const value = &quot;&lt;tag&gt;&quot;;</code></pre>'
  }
];

for (const { name, input, expected } of renderingCases) {
  test(`renderMarkdown: ${name}`, () => {
    assert.equal(markdown.renderMarkdown(input), expected);
  });
}

const sanitizationCases = [
  {
    name: "allows HTTPS links with safe attributes",
    input: "[Open](https://example.com/docs)",
    expected: '<p><a href="https://example.com/docs" target="_blank" rel="noopener noreferrer">Open</a></p>'
  },
  {
    name: "allows same-document anchors",
    input: "[Jump](#target-heading)",
    expected: '<p><a href="#target-heading" data-preview-anchor="true">Jump</a></p>'
  },
  {
    name: "rejects JavaScript links",
    input: "[Unsafe](javascript:alert)",
    expected: "<p>Unsafe</p>"
  },
  {
    name: "rejects non-image data links",
    input: "[Unsafe](data:text/html;base64,SGVsbG8=)",
    expected: "<p>Unsafe</p>"
  }
];

for (const { name, input, expected } of sanitizationCases) {
  test(`URL sanitization: ${name}`, () => {
    assert.equal(markdown.renderMarkdown(input), expected);
  });
}
