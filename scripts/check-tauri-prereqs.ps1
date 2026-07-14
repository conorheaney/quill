$ErrorActionPreference = "Stop"

Write-Host "Checking Quill Tauri prerequisites..." -ForegroundColor Cyan
Write-Host ""

try {
    npm exec tauri info
    Write-Host ""
    Write-Host "If rustc, cargo, or Visual Studio Build Tools are still missing, install them before running 'npm run tauri:dev'." -ForegroundColor Yellow
} catch {
    Write-Error $_
    exit 1
}
