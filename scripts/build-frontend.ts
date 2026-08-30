const { cp, mkdir, readdir, rm } = require("node:fs/promises") as typeof import("node:fs/promises");
const buildPath = require("node:path") as typeof import("node:path");
const { build } = require("esbuild") as typeof import("esbuild");

const buildScriptsDirectory = __dirname;
const buildRepositoryRoot = buildPath.resolve(buildScriptsDirectory, "..");
const buildFrontendRoot = buildPath.join(buildRepositoryRoot, "frontend");
const buildDistRoot = buildPath.join(buildRepositoryRoot, "dist");

async function buildFrontend(): Promise<void> {
  await rm(buildDistRoot, { recursive: true, force: true });
  await mkdir(buildDistRoot, { recursive: true });

  for (const entry of await readdir(buildFrontendRoot, { withFileTypes: true })) {
    if (entry.name !== "scripts") {
      await cp(buildPath.join(buildFrontendRoot, entry.name), buildPath.join(buildDistRoot, entry.name), { recursive: true });
    }
  }

  await build({
    absWorkingDir: buildRepositoryRoot,
    entryPoints: ["frontend/scripts/entry.ts"],
    bundle: true,
    format: "iife",
    platform: "browser",
    sourcemap: true,
    outfile: "dist/scripts/quill-app.js",
    logLevel: "info"
  });

  console.log(`Frontend built from ${buildFrontendRoot} to ${buildDistRoot}.`);
}

buildFrontend().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
