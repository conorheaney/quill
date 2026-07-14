param(
    [ValidateSet("debug", "release")]
    [string]$Mode = "release"
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot

Push-Location $repoRoot
try {
    Write-Host "Starting Quill Tauri workflow in '$Mode' mode..." -ForegroundColor Cyan
    Write-Host ""

    # Step 1: Run the dedicated Tauri prerequisite check for this repository before attempting
    # either a debug launch or a production build. Calling the prerequisite script directly from
    # inside this script keeps the workflow internal to the current PowerShell session instead of
    # spawning a second PowerShell process with its own ExecutionPolicy arguments. This still gives
    # us the same environment validation while keeping the wrapper simpler and easier to maintain.
    & (Join-Path $PSScriptRoot "check-tauri-prereqs.ps1")

    Write-Host ""

    if ($Mode -eq "debug") {
        # Step 2 (debug mode): Launch the Tauri development application through the repo's npm
        # script so the current desktop runtime can be exercised interactively. This is the fastest
        # way to confirm that Quill still starts correctly under Tauri and that runtime behaviors
        # such as desktop file loading, saving, and recent-file reopen logic are wired to the new
        # shell as expected. This command keeps running until the dev app is closed.
        npm run tauri:dev
    } else {
        # Step 2 (release mode): Build the production bundle through the repo's npm build script.
        # In this project that delegates to `tauri build`, which compiles the optimized release
        # executable and generates the Windows NSIS installer artifact intended for distribution,
        # release validation, or final handoff testing.
        npm run build
    }
} finally {
    Pop-Location
}
