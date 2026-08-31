const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const repositoryRoot = path.resolve(__dirname, "../..");

function readRepositoryFile(relativePath: string): string {
  return fs.readFileSync(path.join(repositoryRoot, relativePath), "utf8");
}

test("Tauri registers a hidden main window and visible splash window", () => {
  const config = JSON.parse(readRepositoryFile("src-tauri/tauri.conf.json"));
  const windows = config.app.windows;
  const mainWindow = windows.find((window: { label: string }) => window.label === "main");
  const splashWindow = windows.find((window: { label: string }) => window.label === "splashscreen");

  assert.equal(mainWindow.visible, false);
  assert.equal(mainWindow.width, 1400);
  assert.equal(mainWindow.height, 900);
  assert.equal(splashWindow.visible, true);
  assert.equal(splashWindow.url, "splashscreen.html");
  assert.equal(splashWindow.width, 620);
  assert.equal(splashWindow.height, 440);
  assert.equal(splashWindow.resizable, false);
  assert.equal(splashWindow.center, true);

  const capability = JSON.parse(readRepositoryFile("src-tauri/capabilities/default.json"));
  assert.ok(capability.permissions.includes("core:window:allow-show"));
  assert.ok(capability.permissions.includes("core:window:allow-set-focus"));
});

test("startup handoff and retry wiring target the splash and main windows", () => {
  const bridge = readRepositoryFile("frontend/scripts/desktop-bridge.ts");
  const startup = readRepositoryFile("frontend/scripts/quill-app.ts");
  const splash = readRepositoryFile("frontend/scripts/splashscreen.ts");

  assert.match(bridge, /WebviewWindow\.getByLabel\("splashscreen"\)/);
  assert.match(bridge, /splashWindow\?\.close\(\)/);
  assert.match(bridge, /currentWindow\.show\(\)/);
  assert.match(bridge, /emitTo\("splashscreen", "startup-failed"\)/);
  assert.match(bridge, /listen\("startup-retry"/);
  assert.match(bridge, /MIN_SPLASH_DURATION_MS = 5000/);
  assert.match(bridge, /listen\("splash-ready"/);
  assert.match(bridge, /Math\.max\(0, MIN_SPLASH_DURATION_MS/);
  assert.match(startup, /desktopBridge\?\.completeStartup\(\)/);
  assert.match(startup, /QuillDesktop\?\.showStartupFailure\(\)/);
  assert.match(splash, /listen\("startup-failed"/);
  assert.match(splash, /emitTo\("main", "startup-retry"\)/);
  assert.match(splash, /emitTo\("main", "splash-ready"\)/);
});
