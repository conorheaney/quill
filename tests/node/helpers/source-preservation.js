const assert = require("node:assert/strict");

function replaceOwnedBytes(source, ownedSource, replacement) {
  const sourceBytes = Buffer.from(source, "utf8");
  const ownedBytes = Buffer.from(ownedSource, "utf8");
  const replacementBytes = Buffer.from(replacement, "utf8");
  const start = sourceBytes.indexOf(ownedBytes);

  assert.notEqual(start, -1, "owned source range must exist in the fixture");
  assert.equal(
    sourceBytes.indexOf(ownedBytes, start + ownedBytes.length),
    -1,
    "owned source range must be unique in the fixture"
  );

  const end = start + ownedBytes.length;
  return {
    sourceBytes,
    replacementBytes,
    start,
    end,
    resultBytes: Buffer.concat([
      sourceBytes.subarray(0, start),
      replacementBytes,
      sourceBytes.subarray(end)
    ])
  };
}

function assertOnlyOwnedRangeChanged(edit) {
  assert.deepEqual(
    edit.resultBytes.subarray(0, edit.start),
    edit.sourceBytes.subarray(0, edit.start),
    "bytes before the owned source range changed"
  );
  assert.deepEqual(
    edit.resultBytes.subarray(edit.start + edit.replacementBytes.length),
    edit.sourceBytes.subarray(edit.end),
    "bytes after the owned source range changed"
  );
}

module.exports = {
  assertOnlyOwnedRangeChanged,
  replaceOwnedBytes
};
