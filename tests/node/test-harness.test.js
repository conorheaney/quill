const assert = require("node:assert/strict");
const test = require("node:test");

test("Node test layer is wired into the canonical command", () => {
  assert.notEqual(
    process.env.QUILL_TEST_SEED_FAILURE,
    "node",
    "Controlled Node test-layer failure was requested."
  );
});
