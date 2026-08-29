import { cp, mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const scriptsDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptsDirectory, "..");
const frontendRoot = path.join(repositoryRoot, "frontend");
const distRoot = path.join(repositoryRoot, "dist");

await rm(distRoot, { recursive: true, force: true });
await mkdir(distRoot, { recursive: true });

for (const entry of await readdir(frontendRoot, { withFileTypes: true })) {
  if (entry.name !== "scripts") {
    await cp(path.join(frontendRoot, entry.name), path.join(distRoot, entry.name), { recursive: true });
  }
}

await build({
  absWorkingDir: repositoryRoot,
  entryPoints: ["frontend/scripts/entry.ts"],
  bundle: true,
  format: "iife",
  platform: "browser",
  sourcemap: true,
  outfile: "dist/scripts/quill-app.js",
  logLevel: "info"
});

console.log(`Frontend built from ${frontendRoot} to ${distRoot}.`);
