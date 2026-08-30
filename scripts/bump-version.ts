const { readFile, writeFile } = require("node:fs/promises") as typeof import("node:fs/promises");
const bumpPath = require("node:path") as typeof import("node:path");

type JsonObject = Record<string, any>;

const VERSION_PATTERN = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;
const TAURI_VERSION_SOURCE = "../package.json";

const bumpScriptDirectory = __dirname;
const bumpRepoRoot = bumpPath.resolve(bumpScriptDirectory, "..");

const bumpPackageJsonPath = bumpPath.join(bumpRepoRoot, "package.json");
const bumpPackageLockPath = bumpPath.join(bumpRepoRoot, "package-lock.json");
const bumpCargoTomlPath = bumpPath.join(bumpRepoRoot, "src-tauri", "Cargo.toml");
const bumpTauriConfigPath = bumpPath.join(bumpRepoRoot, "src-tauri", "tauri.conf.json");

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

function detectLineEnding(text: string): string {
  return text.includes("\r\n") ? "\r\n" : "\n";
}

function formatJson(value: unknown, lineEnding: string): string {
  return `${JSON.stringify(value, null, 2).replace(/\n/g, lineEnding)}${lineEnding}`;
}

async function readJsonFile(filePath: string): Promise<{ text: string; value: JsonObject }> {
  const text = await readFile(filePath, "utf8");
  return {
    text,
    value: JSON.parse(text)
  };
}

async function writeTextIfChanged(filePath: string, nextText: string, currentText: string): Promise<boolean> {
  if (nextText === currentText) {
    return false;
  }

  await writeFile(filePath, nextText, "utf8");
  return true;
}

function updateCargoVersion(cargoTomlText: string, targetVersion: string): string {
  const packageSectionPattern = /(\[package\][\s\S]*?\nversion\s*=\s*")([^"]+)(")/;
  if (!packageSectionPattern.test(cargoTomlText)) {
    throw new Error("Unable to locate [package].version in src-tauri/Cargo.toml.");
  }

  return cargoTomlText.replace(packageSectionPattern, `$1${targetVersion}$3`);
}

function parseVersion(versionText: string): { major: number; minor: number; patch: number; prerelease: string } | null {
  const match = VERSION_PATTERN.exec(versionText);
  if (!match) {
    return null;
  }

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    prerelease: match[4] || ""
  };
}

function incrementVersion(currentVersion: string): string {
  const parsed = parseVersion(currentVersion);
  if (!parsed) {
    throw new Error(`Current product version "${currentVersion}" is not a supported semver value.`);
  }

  if (!parsed.prerelease) {
    return `${parsed.major}.${parsed.minor}.${parsed.patch + 1}`;
  }

  const prereleaseParts = parsed.prerelease.split(".");
  const lastPart = prereleaseParts[prereleaseParts.length - 1];
  if (!/^\d+$/.test(lastPart)) {
    throw new Error(
      `Current prerelease version "${currentVersion}" does not end in a numeric segment. Pass an explicit target version instead.`
    );
  }

  prereleaseParts[prereleaseParts.length - 1] = String(Number(lastPart) + 1);
  return `${parsed.major}.${parsed.minor}.${parsed.patch}-${prereleaseParts.join(".")}`;
}

async function bumpVersion(): Promise<void> {
  const requestedVersion = process.argv[2] as string | undefined;

  const [
    packageJsonFile,
    packageLockFile,
    cargoTomlText,
    tauriConfigFile
  ] = await Promise.all([
    readJsonFile(bumpPackageJsonPath),
    readJsonFile(bumpPackageLockPath),
    readFile(bumpCargoTomlPath, "utf8"),
    readJsonFile(bumpTauriConfigPath)
  ]);

  if (tauriConfigFile.value.version !== TAURI_VERSION_SOURCE) {
    fail(`src-tauri/tauri.conf.json must derive its version from "${TAURI_VERSION_SOURCE}" before bumping versions.`);
  }

  const currentVersion = packageJsonFile.value.version;
  const targetVersion = requestedVersion || incrementVersion(currentVersion);

  if (!VERSION_PATTERN.test(targetVersion)) {
    fail(
      `Invalid product version "${targetVersion}". Use semver such as 1.0.4, 1.0.4-qa.1, or 1.0.4-rc.1.`
    );
  }

  const nextPackageJson = {
    ...packageJsonFile.value,
    version: targetVersion
  };

  const packageLockRoot = packageLockFile.value.packages && packageLockFile.value.packages[""];
  if (!packageLockRoot || typeof packageLockRoot !== "object") {
    fail('package-lock.json is missing the root packages[""] entry.');
  }

  const nextPackageLock = {
    ...packageLockFile.value,
    version: targetVersion,
    packages: {
      ...packageLockFile.value.packages,
      "": {
        ...packageLockRoot,
        version: targetVersion
      }
    }
  };

  const nextCargoToml = updateCargoVersion(cargoTomlText, targetVersion);

  const filesToChange = [
    "package.json",
    "package-lock.json",
    "src-tauri/Cargo.toml"
  ];

  const packageJsonLineEnding = detectLineEnding(packageJsonFile.text);
  const packageLockLineEnding = detectLineEnding(packageLockFile.text);

  console.log(`Preparing Quill product version bump from ${currentVersion} to ${targetVersion}.`);
  console.log("Files owned by this command:");
  filesToChange.forEach((filePath) => {
    console.log(`- ${filePath}`);
  });

  const packageJsonChanged = await writeTextIfChanged(
    bumpPackageJsonPath,
    formatJson(nextPackageJson, packageJsonLineEnding),
    packageJsonFile.text
  );
  const packageLockChanged = await writeTextIfChanged(
    bumpPackageLockPath,
    formatJson(nextPackageLock, packageLockLineEnding),
    packageLockFile.text
  );
  const cargoTomlChanged = await writeTextIfChanged(
    bumpCargoTomlPath,
    nextCargoToml,
    cargoTomlText
  );

  if (!packageJsonChanged && !packageLockChanged && !cargoTomlChanged) {
    console.log(`Quill is already set to version ${targetVersion}. No files changed.`);
    return;
  }

  console.log(`Quill product version updated to ${targetVersion}.`);
}

bumpVersion().catch((error: unknown) => {
  fail(error instanceof Error ? error.message : String(error));
});
