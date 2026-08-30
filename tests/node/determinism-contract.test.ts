import type { Dirent } from "node:fs";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const repositoryRoot = path.resolve(__dirname, "..", "..");
const testsRoot = path.join(repositoryRoot, "tests");
const thisFile = path.resolve(__filename);

function listFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry: Dirent) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? listFiles(entryPath) : [entryPath];
  });
}

function automatedSources(): string[] {
  return listFiles(path.join(testsRoot, "node"))
    .concat(listFiles(path.join(testsRoot, "rust")))
    .filter((filePath: string) => /\.(?:js|ts|rs)$/.test(filePath))
    .filter((filePath: string) => path.resolve(filePath) !== thisFile);
}

test("canonical suite uses built-in local runners without browser or coverage packages", () => {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(repositoryRoot, "package.json"), "utf8")
  );
  const dependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };

  assert.equal(packageJson.scripts.test, "npm run test:node && npm run test:rust");
  assert.equal(packageJson.scripts["test:node"], "node --test");
  assert.equal(
    packageJson.scripts["test:rust"],
    "cargo test --manifest-path src-tauri/Cargo.toml"
  );

  for (const disallowedPackage of [
    "@playwright/test",
    "c8",
    "jest",
    "playwright",
    "puppeteer",
    "vitest"
  ]) {
    assert.equal(
      dependencies[disallowedPackage],
      undefined,
      `${disallowedPackage} must not become a test runtime dependency`
    );
  }
});

test("automated sources avoid external and nondeterministic runtime APIs", () => {
  const forbiddenPatterns = [
    ["network client", /\brequire\(["'](?:node:)?(?:dgram|dns|http|https|net|tls)["']\)|\bfetch\s*\(|\bXMLHttpRequest\b|\bWebSocket\b/],
    ["real browser storage or desktop dialog", /\b(?:localStorage|sessionStorage)\b|@tauri-apps\/plugin-dialog|window\.QuillDesktop/],
    ["wall-clock or fixed-sleep timing", /\bDate\.now\s*\(|\bnew Date\s*\(|SystemTime::now\s*\(|Instant::now\s*\(|thread::sleep\s*\(|tokio::time::sleep\s*\(/],
    ["user-home lookup", /\bhomedir\s*\(|process\.env\.(?:HOME|USERPROFILE)|dirs::home_dir/],
    ["uncontrolled randomness", /\bMath\.random\s*\(|\brandomUUID\s*\(|\brand::|\bthread_rng\s*\(/]
  ];

  for (const filePath of automatedSources()) {
    const source = fs.readFileSync(filePath, "utf8");
    const relativePath = path.relative(repositoryRoot, filePath);

    for (const [label, pattern] of forbiddenPatterns) {
      assert.doesNotMatch(source, pattern, `${relativePath} uses ${label}`);
    }
  }
});

test("risk matrix governs the automated layers without a percentage threshold", () => {
  const matrix = fs.readFileSync(
    path.join(testsRoot, "RISK-COVERAGE-MATRIX.md"),
    "utf8"
  );

  assert.match(matrix, /Numeric code-coverage thresholds are not used\./);
  assert.match(matrix, /\| Markdown parsing/);
  assert.match(matrix, /\| Render-pane edits/);
  assert.match(matrix, /\| Delayed or out-of-order saves/);
  assert.match(matrix, /\| Controller orchestration/);
  assert.match(matrix, /\| Desktop path, MIME, read, or write contracts/);
  assert.match(matrix, /\| Canonical runner/);

  const riskRows = matrix
    .split(/\r?\n/)
    .filter((line: string) => /\| (?:Critical|High|Moderate) \|/.test(line));
  assert.ok(riskRows.length > 0, "risk matrix must contain prioritized coverage rows");
  for (const row of riskRows) {
    assert.match(row, /\| covered \|$/, `uncovered risk row: ${row}`);
  }
});

test("priority-5 findings retain explicit owners and activation signals", () => {
  const matrix = fs.readFileSync(
    path.join(testsRoot, "RISK-COVERAGE-MATRIX.md"),
    "utf8"
  );
  const expectedOwners = new Map([
    ["REV-001", "PRD-000010-TECH"],
    ["REV-002", "PRD-000010-TECH"],
    ["REV-003", "PRD-000023-CHANGE"]
  ]);
  const handoffRows = matrix
    .split(/\r?\n/)
    .filter((line: string) => /^\| `REV-00[123]` \|/.test(line));

  assert.equal(handoffRows.length, expectedOwners.size);
  for (const [finding, owner] of expectedOwners) {
    const row = handoffRows.find((line: string) => line.includes(`\`${finding}\``));
    assert.ok(row, `${finding} must have a handoff row`);
    assert.match(row, new RegExp(`\\\`${owner}\\\``));
    assert.match(row, /Activate /);
    assert.match(row, /tests\/node\/.+\.test\.(js|ts)/);
    assert.match(row, /(reports|identifies) /);
  }

  assert.match(matrix, /QUILL_TEST_SEED_FAILURE=node/);
  assert.match(matrix, /QUILL_TEST_SEED_FAILURE=rust/);
  assert.match(matrix, /canonical `npm test` command returns a non-zero exit code/);
});
