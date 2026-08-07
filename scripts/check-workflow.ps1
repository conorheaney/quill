param(
    [switch]$Detailed
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$schemaPath = Join-Path $repoRoot ".codex\workflow\prd-schema.md"
$statusMapPath = Join-Path $repoRoot ".codex\workflow\status-phase-map.json"
$backlogPath = Join-Path $repoRoot "BACKLOG.md"
$errors = [System.Collections.Generic.List[string]]::new()
$warnings = [System.Collections.Generic.List[string]]::new()
$requiredHeadings = @("Short Name", "Goal", "Context", "Scope", "Plan", "Acceptance Criteria", "Verification", "Next Step", "History", "Audit")
$verificationColumns = @("Test Case", "Criteria", "Product Version", "Status", "Description", "Evidence")
$allowedTestStatuses = @("planned", "open", "in progress", "complete", "blocked", "exception")
$statusPhaseMap = Get-Content -LiteralPath $statusMapPath -Raw | ConvertFrom-Json
$phaseDirectories = @("05 - Backlog", "10 - Plan", "15 - Implement", "20 - Test", "25 - Closed")
$phaseByDirectory = @{}
foreach ($directory in $phaseDirectories) {
    $phaseByDirectory[$directory] = $directory.Substring(5)
}

function Add-Error([string]$message) {
    $errors.Add($message)
}

function Add-Warning([string]$message) {
    $warnings.Add($message)
}

function Get-TableCells([string]$line) {
    return @($line.Trim().Trim('|').Split('|') | ForEach-Object { $_.Trim() })
}

if (-not (Test-Path -LiteralPath $schemaPath)) { Add-Error "Missing shared schema: $schemaPath" }
if (-not (Test-Path -LiteralPath $statusMapPath)) { Add-Error "Missing status/phase map: $statusMapPath" }
if (-not (Test-Path -LiteralPath $backlogPath)) { Add-Error "Missing backlog: $backlogPath" }

$backlogEntries = @{}
if (Test-Path -LiteralPath $backlogPath) {
    foreach ($line in Get-Content -LiteralPath $backlogPath) {
        if ($line -notmatch '^\|\s*(PRD-\d{6}-[A-Z]+)\s*\|') { continue }
        $cells = Get-TableCells $line
        if ($cells.Count -lt 6) { Add-Error "Malformed backlog row: $line"; continue }
        $id = $cells[0]
        if ($backlogEntries.ContainsKey($id)) { Add-Error "Duplicate backlog ID: $id"; continue }
        $backlogEntries[$id] = [pscustomobject]@{ Class = $cells[1]; ShortName = $cells[2]; Status = $cells[3]; Phase = $cells[4]; Description = $cells[5] }
        $allowedPhases = @($statusPhaseMap.($cells[3]))
        if ($allowedPhases.Count -eq 0 -or $allowedPhases -notcontains $cells[4]) { Add-Error "$id has invalid status/phase pairing: $($cells[3]) / $($cells[4])" }
    }
}

$prdFiles = @()
foreach ($directory in $phaseDirectories) {
    $path = Join-Path $repoRoot "docs\$directory"
    if (Test-Path -LiteralPath $path) { $prdFiles += Get-ChildItem -LiteralPath $path -Filter "PRD-*.md" -File }
}

$filesById = @{}
foreach ($file in $prdFiles) {
    $id = $file.BaseName
    if ($filesById.ContainsKey($id)) { Add-Error "Duplicate PRD file: $id"; continue }
    $filesById[$id] = $file
    if (-not $backlogEntries.ContainsKey($id)) { Add-Error "PRD has no backlog row: $id"; continue }

    $directoryName = Split-Path -Leaf (Split-Path -Parent $file.FullName)
    $expectedPhase = $phaseByDirectory[$directoryName]
    $entry = $backlogEntries[$id]
    if ($entry.Phase -ne $expectedPhase) { Add-Error "$id backlog phase does not match folder: $($entry.Phase) / $expectedPhase" }

    $headings = @(Get-Content -LiteralPath $file.FullName | Where-Object { $_ -match '^##\s+(.+?)\s*$' } | ForEach-Object { $matches[1].Trim() })
    $positions = @{}
    foreach ($heading in $requiredHeadings) {
        $matchesForHeading = @($headings | Where-Object { $_ -eq $heading })
        if ($matchesForHeading.Count -eq 0) {
            if ($expectedPhase -eq "Closed") { Add-Warning "$id is a legacy Closed PRD missing exact heading: $heading" } else { Add-Error "$id is missing required heading: $heading" }
        } else { $positions[$heading] = [array]::IndexOf($headings, $heading) }
    }
    $lastPosition = -1
    foreach ($heading in $requiredHeadings) {
        if (-not $positions.ContainsKey($heading)) { continue }
        if ($positions[$heading] -lt $lastPosition) { Add-Error "$id required headings are out of order near: $heading"; break }
        $lastPosition = $positions[$heading]
    }
    $historyIndex = [array]::IndexOf($headings, "History")
    $auditIndex = [array]::IndexOf($headings, "Audit")
    if ($historyIndex -ge 0 -and $auditIndex -ge 0 -and $auditIndex -lt $historyIndex) { Add-Error "$id places Audit before History" }

    if ($expectedPhase -ne "Closed") {
        $lines = @(Get-Content -LiteralPath $file.FullName)
        $verificationHeadingIndex = [array]::IndexOf($lines, "## Verification")
        if ($verificationHeadingIndex -lt 0) {
            Add-Error "$id is missing its Verification section"
        } else {
            $verificationEndIndex = $lines.Count
            for ($lineIndex = $verificationHeadingIndex + 1; $lineIndex -lt $lines.Count; $lineIndex++) {
                if ($lines[$lineIndex] -match '^##\s+') { $verificationEndIndex = $lineIndex; break }
            }
            $verificationLines = @($lines[($verificationHeadingIndex + 1)..($verificationEndIndex - 1)])
            $headerIndex = -1
            for ($lineIndex = 0; $lineIndex -lt $verificationLines.Count; $lineIndex++) {
                if ($verificationLines[$lineIndex] -match '^\|\s*Test Case\s*\|\s*Criteria\s*\|\s*Product Version\s*\|\s*Status\s*\|\s*Description\s*\|\s*Evidence\s*\|\s*$') {
                    $headerIndex = $lineIndex
                    break
                }
            }
            if ($headerIndex -lt 0) {
                Add-Error "$id Verification is missing the required test-case tracking table"
            } else {
                $acceptanceText = (($lines -join [Environment]::NewLine) -split '## Acceptance Criteria', 2)[1]
                if ($null -ne $acceptanceText) { $acceptanceText = ($acceptanceText -split '## Verification', 2)[0] }
                $separatorIndex = $headerIndex + 1
                if ($separatorIndex -ge $verificationLines.Count -or $verificationLines[$separatorIndex] -notmatch '^\|\s*:?-{3,}:?\s*\|') {
                    Add-Error "$id Verification tracking table is missing its separator row"
                }
                $testCaseIds = @{}
                $testRowCount = 0
                for ($lineIndex = $separatorIndex + 1; $lineIndex -lt $verificationLines.Count; $lineIndex++) {
                    $line = $verificationLines[$lineIndex].Trim()
                    if ([string]::IsNullOrWhiteSpace($line) -or $line -notmatch '^\|') { continue }
                    $cells = Get-TableCells $line
                    if ($cells.Count -ne $verificationColumns.Count) {
                        Add-Error "$id Verification tracking row has $($cells.Count) columns; expected $($verificationColumns.Count): $line"
                        continue
                    }
                    $testCase = $cells[0].Trim().Trim('`')
                    if ($testCase -notmatch '^TC-\d{2}$') { Add-Error "$id has invalid test-case ID in Verification: $($cells[0])" }
                    if ($testCaseIds.ContainsKey($testCase)) { Add-Error "$id has duplicate test-case ID in Verification: $testCase" } else { $testCaseIds[$testCase] = $true }
                    if ([string]::IsNullOrWhiteSpace($cells[1])) {
                        Add-Error "$id $testCase is missing its acceptance-criteria mapping"
                    } else {
                        $criteriaIds = @($cells[1] -split ',' | ForEach-Object { $_.Trim().Trim('`') } | Where-Object { $_ })
                        foreach ($criteriaId in $criteriaIds) {
                            if ($criteriaId -notmatch '^AC-\d{2}$') { Add-Error "$id $testCase has invalid acceptance-criteria ID: $criteriaId"; continue }
                            if ($null -eq $acceptanceText -or $acceptanceText -notmatch [regex]::Escape($criteriaId)) { Add-Error "$id $testCase maps to missing acceptance criterion: $criteriaId" }
                        }
                    }
                    $status = $cells[3].Trim().Trim('`').ToLowerInvariant()
                    if ($allowedTestStatuses -notcontains $status) { Add-Error "$id $testCase has invalid test status: $($cells[3])" }
                    if ($status -eq "complete" -and $cells[5] -notmatch "PRD-\d{6}-[A-Z]+-TC-\d{2}") { Add-Error "$id $testCase is complete but has no linked evidence record" }
                    $testRowCount++
                }
                if ($testRowCount -eq 0) { Add-Error "$id Verification tracking table must contain at least one test-case row" }
            }
        }
    }
}

foreach ($id in $backlogEntries.Keys) {
    if (-not $filesById.ContainsKey($id)) { Add-Error "Backlog row has no PRD file in a phase folder: $id" }
}

$controlFiles = @("WORKFLOW.md", "BACKLOG.md", ".agents\local-agent.md") + @(Get-ChildItem -LiteralPath (Join-Path $repoRoot ".codex\skills") -Recurse -Filter "SKILL.md" -File | ForEach-Object { $_.FullName.Substring($repoRoot.Length + 1) })
foreach ($relativePath in $controlFiles) {
    $fullPath = Join-Path $repoRoot $relativePath
    foreach ($line in Get-Content -LiteralPath $fullPath) {
        $matches = [regex]::Matches($line, '\[[^\]]+\]\(([^)]+)\)')
        foreach ($match in $matches) {
            $target = $match.Groups[1].Value
            if ($target -match '^(https?|file):') { continue }
            $targetPath = Join-Path (Split-Path -Parent $fullPath) $target
            if (-not (Test-Path -LiteralPath $targetPath)) { Add-Error "Broken local link in $relativePath`: $target" }
        }
    }
}

if ($warnings.Count -gt 0) {
    Write-Host "Workflow warnings:" -ForegroundColor Yellow
    $warnings | ForEach-Object { Write-Host "- $_" -ForegroundColor Yellow }
}
if ($errors.Count -gt 0) {
    Write-Host "Workflow errors:" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host "- $_" -ForegroundColor Red }
    exit 1
}

$evidencePath = Join-Path $repoRoot "docs\90 - Evidence"
$evidenceCount = if (Test-Path -LiteralPath $evidencePath) { @(Get-ChildItem -LiteralPath $evidencePath -Filter "PRD-*.md" -File).Count } else { 0 }
$summary = "Workflow check passed: $($backlogEntries.Count) tracked items, $($prdFiles.Count) canonical phase PRDs, and $evidenceCount evidence records."
if ($Detailed -or $warnings.Count -gt 0) {
    $backlogPhaseSummary = @($backlogEntries.Values | Group-Object Phase | Sort-Object Name | ForEach-Object { "$($_.Name)=$($_.Count)" }) -join ", "
    $backlogStatusSummary = @($backlogEntries.Values | Group-Object Status | Sort-Object Name | ForEach-Object { "$($_.Name)=$($_.Count)" }) -join ", "
    $prdPhaseSummary = @($prdFiles | Group-Object { Split-Path (Split-Path $_.FullName -Parent) -Leaf } | Sort-Object Name | ForEach-Object { "$($_.Name)=$($_.Count)" }) -join ", "
    $summary += " Phases: $backlogPhaseSummary; statuses: $backlogStatusSummary; folders: $prdPhaseSummary; warnings: $($warnings.Count)."
}
Write-Host $summary -ForegroundColor Green
