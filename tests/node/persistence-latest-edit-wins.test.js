const assert = require("node:assert/strict");
const test = require("node:test");

const {
  createControlledWriter,
  createPersistenceSession
} = require("./helpers/persistence-contract");

function createDirtySession() {
  const writer = createControlledWriter();
  const session = createPersistenceSession({
    writer,
    documentId: "document-a",
    filePath: "C:/notes/a.md",
    content: "initial"
  });
  session.edit("revision one");
  return { session, writer };
}

test("a delayed save clears dirty state only when its revision is still current", async () => {
  const { session, writer } = createDirtySession();
  const pendingSave = session.save();

  assert.equal(writer.calls[0].snapshot.revision, 1);
  assert.equal(session.getState().dirty, true);

  writer.calls[0].resolve({ status: "saved" });
  assert.equal((await pendingSave).status, "saved");
  assert.equal(session.getState().dirty, false);
});

test("an edit made during a delayed save keeps the newer revision dirty", async () => {
  const { session, writer } = createDirtySession();
  const pendingSave = session.save();

  session.edit("revision two");
  writer.calls[0].resolve({ status: "saved" });

  assert.equal((await pendingSave).status, "stale");
  assert.deepEqual(session.getState(), {
    documentId: "document-a",
    filePath: "C:/notes/a.md",
    content: "revision two",
    revision: 2,
    dirty: true
  });
});

test("out-of-order save completion cannot overwrite the latest-edit-wins state", async () => {
  const { session, writer } = createDirtySession();
  const firstSave = session.save();
  session.edit("revision two");
  const secondSave = session.save();

  writer.calls[1].resolve({ status: "saved" });
  assert.equal((await secondSave).status, "saved");
  assert.equal(session.getState().dirty, false);

  writer.calls[0].resolve({ status: "saved" });
  assert.equal((await firstSave).status, "stale");
  assert.equal(session.getState().content, "revision two");
  assert.equal(session.getState().dirty, false);
});

test("failed and cancelled saves leave the current revision dirty", async (t) => {
  await t.test("failure", async () => {
    const { session, writer } = createDirtySession();
    const pendingSave = session.save();
    writer.calls[0].reject(new Error("disk unavailable"));

    const result = await pendingSave;
    assert.equal(result.status, "failed");
    assert.equal(result.error.message, "disk unavailable");
    assert.equal(session.getState().dirty, true);
  });

  await t.test("cancellation", async () => {
    const { session, writer } = createDirtySession();
    const pendingSave = session.save();
    writer.calls[0].resolve({ status: "cancelled" });

    assert.equal((await pendingSave).status, "cancelled");
    assert.equal(session.getState().dirty, true);
  });
});

test("a path change makes an in-flight save stale even if the path later matches", async () => {
  const { session, writer } = createDirtySession();
  const pendingSave = session.save();

  session.setPath("C:/notes/renamed.md");
  session.setPath("C:/notes/a.md");
  writer.calls[0].resolve({ status: "saved" });

  assert.equal((await pendingSave).status, "stale");
  assert.equal(session.getState().dirty, true);
});

test("a document change isolates the newly opened document from an old save", async () => {
  const { session, writer } = createDirtySession();
  const pendingSave = session.save();

  session.openDocument({
    documentId: "document-b",
    filePath: "C:/notes/b.md",
    content: "second document",
    dirty: false
  });
  writer.calls[0].resolve({ status: "saved" });

  assert.equal((await pendingSave).status, "stale");
  assert.deepEqual(session.getState(), {
    documentId: "document-b",
    filePath: "C:/notes/b.md",
    content: "second document",
    revision: 0,
    dirty: false
  });
});
