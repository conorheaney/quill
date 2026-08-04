param(
    [string]$ProjectRoot = (Get-Location).Path,
    [switch]$Force
)

$ErrorActionPreference = 'Stop'
$KitRoot = Split-Path -Parent $PSScriptRoot
$ProjectRoot = (Resolve-Path -LiteralPath $ProjectRoot).Path

function Copy-KitFile([string]$Source, [string]$Destination) {
    $target = Join-Path $ProjectRoot $Destination
    if ((Test-Path -LiteralPath $target) -and -not $Force) {
        Write-Host "Skipped existing $Destination"
        return
    }
    $parent = Split-Path -Parent $target
    New-Item -ItemType Directory -Force -Path $parent | Out-Null
    Copy-Item -LiteralPath (Join-Path $KitRoot $Source) -Destination $target -Force
    Write-Host "Created $Destination"
}

Copy-KitFile 'templates\WORKFLOW.md' 'WORKFLOW.md'
Copy-KitFile 'templates\BACKLOG.md' 'BACKLOG.md'
Copy-KitFile 'templates\local-agent.md' '.agents\local-agent.md'
Copy-KitFile 'templates\TESTCASE.md' 'TESTCASE.md'

foreach ($folder in @('00 - Backlog', '01 - Plan', '02 - Implement', '03 - Test', '04 - Release', '90 - Evidence')) {
    New-Item -ItemType Directory -Force -Path (Join-Path $ProjectRoot "docs\$folder") | Out-Null
}

foreach ($skill in @('grill-me', 'prd-backlog', 'prd-promote', 'prd-implement')) {
    Copy-KitFile "skills\$skill\SKILL.md" ".codex\skills\$skill\SKILL.md"
}

Write-Host "PRD workflow initialized at $ProjectRoot"
