import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const VERSION_PATTERN = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;
const TAURI_VERSION_SOURCE = "../package.json";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDirectory, "..");

const packageJsonPath = path.join(repoRoot, "package.json");
const packageLockPath = path.join(repoRoot, "package-lock.json");
const cargoTomlPath = path.join(repoRoot, "src-tauri", "Cargo.toml");
const tauriConfigPath = path.join(repoRoot, "src-tauri", "tauri.conf.json");

function fail(message) {
  console.error(message);
  process.exit(1);
}

function detectLineEnding(text) {
  return text.includes("\r\n") ? "\r\n" : "\n";
}

function formatJson(value, lineEnding) {
  return `${JSON.stringify(value, null, 2).replace(/\n/g, lineEnding)}${lineEnding}`;
}

async function readJsonFile(filePath) {
  const text = await readFile(filePath, "utf8");
  return {
    text,
    value: JSON.parse(text)
  };
}

async function writeTextIfChanged(filePath, nextText, currentText) {
  if (nextText === currentText) {
    return false;
  }

  await writeFile(filePath, nextText, "utf8");
  return true;
}

function updateCargoVersion(cargoTomlText, targetVersion) {
  const packageSectionPattern = /(\[package\][\s\S]*?\nversion\s*=\s*")([^"]+)(")/;
  if (!packageSectionPattern.test(cargoTomlText)) {
    throw new Error("Unable to locate [package].version in src-tauri/Cargo.toml.");
  }

  return cargoTomlText.replace(packageSectionPattern, `$1${targetVersion}$3`);
}

function parseVersion(versionText) {
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

function incrementVersion(currentVersion) {
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

async function main() {
  const requestedVersion = process.argv[2];

  const [
    packageJsonFile,
    packageLockFile,
    cargoTomlText,
    tauriConfigFile
  ] = await Promise.all([
    readJsonFile(packageJsonPath),
    readJsonFile(packageLockPath),
    readFile(cargoTomlPath, "utf8"),
    readJsonFile(tauriConfigPath)
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
    packageJsonPath,
    formatJson(nextPackageJson, packageJsonLineEnding),
    packageJsonFile.text
  );
  const packageLockChanged = await writeTextIfChanged(
    packageLockPath,
    formatJson(nextPackageLock, packageLockLineEnding),
    packageLockFile.text
  );
  const cargoTomlChanged = await writeTextIfChanged(
    cargoTomlPath,
    nextCargoToml,
    cargoTomlText
  );

  if (!packageJsonChanged && !packageLockChanged && !cargoTomlChanged) {
    console.log(`Quill is already set to version ${targetVersion}. No files changed.`);
    return;
  }

  console.log(`Quill product version updated to ${targetVersion}.`);
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : String(error));
});
