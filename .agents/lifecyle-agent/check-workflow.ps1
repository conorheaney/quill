# Read-only repository workflow validator.
#
# This script intentionally remains a single PowerShell entry point because
# package.json, local agents, and CI-style checks already invoke it directly.
# The checks are grouped into four practical layers:
#   1. State and identity: active backlog rows and PRD locations.
#   2. Structure: PRD headings, History/Audit tables, and verification tables.
#   3. Evidence and links: evidence metadata, filenames, references, and paths.
#   4. Candidate consistency: product version agreement across release sources.
#
# The validator never edits files. It reports current violations so a workflow
# operation can repair them through the appropriate PRD or approved tooling
# change. Historical Closed records are generally warnings where current
# records would be errors; this keeps legacy history visible without making
# old records block all future work.
param(
    [switch]$Detailed
)

# Fail fast on unexpected PowerShell/runtime errors. Expected repository
# findings are collected in $errors and $warnings so the final report can show
# all actionable problems in one run.
$ErrorActionPreference = "Stop"

# Resolve all paths from the repository root rather than the caller's current
# directory. This makes npm invocation, direct invocation, and agent invocation
# behave identically.
$repoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$testCaseTemplatePath = Join-Path $repoRoot ".codex\skills\prd-testcase\references\TPL-TESTCASE.md"
$statusMapPath = Join-Path $repoRoot ".agents\lifecyle-agent\status-phase-map.json"
$backlogPath = Join-Path $repoRoot "BACKLOG.md"
# These collections separate blocking findings from legacy or informational
# findings. Any entry in $errors causes a non-zero exit code at the end.
$errors = [System.Collections.Generic.List[string]]::new()
$warnings = [System.Collections.Generic.List[string]]::new()
$requiredHeadings = @("Short Name", "Goal", "Context", "Scope", "Plan", "Acceptance Criteria", "Verification", "Next Step", "History", "Audit")
$verificationColumns = @("Test Case", "Criteria", "Product Version", "Status", "Description", "Evidence")
$allowedTestStatuses = @("planned", "open", "in progress", "complete", "blocked", "exception")
# Phase order is used only for validating History transitions. The canonical
# status/phase pairing remains owned by status-phase-map.json; do not duplicate
# that mapping here.
$phaseOrder = @("Backlog", "Plan", "Implement", "Test", "Closed")
# All workflow timestamps must be UTC with seven fractional-second digits.
$utcTimestampPattern = '^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{7}Z$'
# These values identify unfilled templates. The pattern is intentionally used
# for evidence metadata, not arbitrary PRD prose, so historical wording does
# not create excessive false positives.
$placeholderPattern = '(?i)^(?:pending|open|x\.y\.z|abc1234|tbd|not yet recorded|observed outcome\.?|human-readable|describe |list the )'
$statusPhaseMap = Get-Content -LiteralPath $statusMapPath -Raw | ConvertFrom-Json
$phaseDirectories = @("05 - Backlog", "10 - Plan", "15 - Implement", "20 - Test", "25 - Closed")
$phaseByDirectory = @{}
foreach ($directory in $phaseDirectories) {
    $phaseByDirectory[$directory] = $directory.Substring(5)
}

# Record a blocking finding. Do not throw for repository content errors: the
# caller should receive the complete set of failures in one report.
function Add-Error([string]$message) {
    $errors.Add($message)
}

# Record a non-blocking finding, normally a legacy Closed-record discrepancy or
# a stale historical link that should be repaired when that record is touched.
function Add-Warning([string]$message) {
    $warnings.Add($message)
}

# Split a simple pipe-delimited Markdown row. This deliberately handles the
# repository's table conventions without attempting to be a full Markdown
# parser; table cells containing literal pipes are outside this validator's
# current structural contract.
function Get-TableCells([string]$line) {
    return @($line.Trim().Trim('|').Split('|') | ForEach-Object { $_.Trim() })
}

# Return the lines between a level-two heading and the next level-two heading.
# Section extraction keeps History, Audit, and Verification checks independent
# from the exact amount of prose in surrounding PRD sections.
function Get-SectionLines([string[]]$lines, [string]$heading) {
    $headingIndex = [array]::IndexOf($lines, "## $heading")
    if ($headingIndex -lt 0) { return @() }
    $endIndex = $lines.Count
    for ($index = $headingIndex + 1; $index -lt $lines.Count; $index++) {
        if ($lines[$index] -match '^##\s+') { $endIndex = $index; break }
    }
    if ($endIndex -le ($headingIndex + 1)) { return @() }
    return @($lines[($headingIndex + 1)..($endIndex - 1)])
}

# Validate the minimum table shape shared by History and Audit: a header row
# followed by a Markdown separator row. More specific column checks belong to
# the caller because the two record types have different schemas.
function Test-MarkdownTable([string[]]$sectionLines, [string]$context) {
    $tableLines = @($sectionLines | Where-Object { $_ -match '^\s*\|' })
    if ($tableLines.Count -lt 2) {
        Add-Error "$context must contain a Markdown table with a header and separator row"
        return $false
    }
    if ($tableLines[1] -notmatch '^\s*\|\s*:?-{3,}:?') {
        Add-Error "$context Markdown table is missing its separator row"
        return $false
    }
    return $true
}

# Resolve a relative Markdown link to a filesystem path.
#
# Markdown links may contain URL-escaped spaces and may include anchors or
# query strings. External URLs, file URLs, and Windows absolute paths are not
# repository-local references and are intentionally skipped.
function Get-RelativeTargetPath([string]$sourcePath, [string]$target) {
    $cleanTarget = ($target -split '[#?]', 2)[0].Trim()
    if ([string]::IsNullOrWhiteSpace($cleanTarget)) { return $null }
    if ($cleanTarget -match '^(?i)(https?|file|mailto):') { return $null }
    if ($cleanTarget -match '^[A-Za-z]:[\\/]') { return $null }
    try { $decodedTarget = [Uri]::UnescapeDataString($cleanTarget) } catch { $decodedTarget = $cleanTarget }
    $decodedTarget = $decodedTarget.Replace('/', '\')
    return (Join-Path (Split-Path -Parent $sourcePath) $decodedTarget)
}

# Validate the repository's canonical UTC timestamp format. This checks shape;
# PowerShell's date parser is not used because it accepts many non-canonical
# representations that the workflow contract deliberately rejects.
function Test-ValidTimestamp([string]$value, [string]$context) {
    if ($value -notmatch $utcTimestampPattern) {
        Add-Error "$context has invalid UTC timestamp: $value"
        return $false
    }
    return $true
}

# Identify common untouched template values in evidence metadata.
function Test-PlaceholderValue([string]$value) {
    if ([string]::IsNullOrWhiteSpace($value)) { return $true }
    return $value.Trim() -match $placeholderPattern
}

# Validate phase history independently from the current PRD folder.
#
# The normal transition graph is Backlog -> Plan -> Implement -> Test -> Closed,
# with Test -> Implement allowed when testing discovers additional code work.
# Closed records are treated as legacy when their historical sequence predates
# the current contract, so discrepancies are warnings rather than blockers.
function Test-History([string[]]$lines, [string]$id, [string]$expectedPhase, [bool]$legacy) {
    $historyLines = Get-SectionLines $lines "History"
    if (-not (Test-MarkdownTable $historyLines "$id History")) { return }
    $rows = @($historyLines | Where-Object { $_ -match '^\s*\|' })
    $entries = @()
    foreach ($row in ($rows | Select-Object -Skip 2)) {
        $cells = Get-TableCells $row
        if ($cells.Count -lt 2) { Add-Error "$id History row has fewer than two columns: $row"; continue }
        $timestamp = $cells[0]
        $stage = $cells[1]
        Test-ValidTimestamp $timestamp "$id History" | Out-Null
        if ($phaseOrder -notcontains $stage) {
            $message = "$id History contains invalid phase: $stage"
            if ($legacy) { Add-Warning $message } else { Add-Error $message }
            continue
        }
        $entries += [pscustomobject]@{ Timestamp = $timestamp; Stage = $stage }
    }
    if ($entries.Count -eq 0) { return }
    if ($entries[0].Stage -ne "Backlog") {
        $message = "$id History must begin at Backlog"
        if ($legacy) { Add-Warning $message } else { Add-Error $message }
    }
    for ($index = 1; $index -lt $entries.Count; $index++) {
        $from = $entries[$index - 1].Stage
        $to = $entries[$index].Stage
        $valid = (($from -eq "Backlog" -and $to -eq "Plan") -or
            ($from -eq "Plan" -and $to -eq "Implement") -or
            ($from -eq "Implement" -and $to -eq "Test") -or
            ($from -eq "Test" -and ($to -eq "Closed" -or $to -eq "Implement")))
        if (-not $valid) {
            $message = "$id History has invalid transition: $from -> $to"
            if ($legacy) { Add-Warning $message } else { Add-Error $message }
        }
    }
    if ($expectedPhase -and $entries[-1].Stage -ne $expectedPhase) {
        $message = "$id History ends at $($entries[-1].Stage), expected $expectedPhase"
        if ($legacy) { Add-Warning $message } else { Add-Error $message }
    }
}

# Validate Audit as a timestamped three-column record. Audit content is not
# semantically interpreted here; it is the durable place for decisions,
# evidence, risks, approvals, exceptions, and clarifications.
function Test-Audit([string[]]$lines, [string]$id, [bool]$legacy) {
    $auditLines = Get-SectionLines $lines "Audit"
    if (-not (Test-MarkdownTable $auditLines "$id Audit")) { return }
    $rows = @($auditLines | Where-Object { $_ -match '^\s*\|' })
    foreach ($row in ($rows | Select-Object -Skip 2)) {
        $cells = Get-TableCells $row
        if ($cells.Count -lt 3) {
            $message = "$id Audit row has fewer than three columns: $row"
            if ($legacy) { Add-Warning $message } else { Add-Error $message }
            continue
        }
        Test-ValidTimestamp $cells[0] "$id Audit" | Out-Null
        if ([string]::IsNullOrWhiteSpace($cells[1]) -or [string]::IsNullOrWhiteSpace($cells[2])) {
            $message = "$id Audit contains an empty type or detail: $row"
            if ($legacy) { Add-Warning $message } else { Add-Error $message }
        }
    }
}

# Validate a test-case evidence record.
#
# Strict mode is used when a verification row claims complete, because a
# complete result must have real metadata and the canonical reproducibility
# sections. Non-strict mode inventories historical evidence records and emits
# warnings so old records remain visible without blocking unrelated work.
function Test-EvidenceRecord([System.IO.FileInfo]$file, [string]$expectedProductVersion, [string]$expectedTestCase, [bool]$strict) {
    $lines = @(Get-Content -LiteralPath $file.FullName)
    $metadata = @{}
    foreach ($line in $lines) {
        if ($line -match '^\|\s*([^|]+?)\s*\|\s*([^|]*?)\s*\|\s*$') { $metadata[$matches[1].Trim()] = $matches[2].Trim() }
    }
    foreach ($field in @("PRD", "Acceptance Criteria", "Product Version", "Status", "Recorded", "Test", "Result")) {
        if (-not $metadata.ContainsKey($field) -or [string]::IsNullOrWhiteSpace($metadata[$field])) {
            $message = "$($file.Name) evidence record is missing metadata: $field"
            if ($strict) { Add-Error $message } else { Add-Warning $message }
        }
    }
    if ($metadata.ContainsKey("Product Version") -and (Test-PlaceholderValue $metadata["Product Version"])) { Add-Error "$($file.Name) has placeholder Product Version" }
    if ($metadata.ContainsKey("Result") -and $metadata["Result"] -notmatch '^(PASS|FAIL)$') {
        $message = "$($file.Name) Result must be exactly PASS or FAIL"
        if ($strict) { Add-Error $message } else { Add-Warning $message }
    }
    if ($metadata.ContainsKey("Test") -and $metadata["Test"] -match '(?i)\bpass\b|\bfail\b') {
        $message = "$($file.Name) Test must contain only the description and no pass/fail wording"
        if ($strict) { Add-Error $message } else { Add-Warning $message }
    }
    if ($metadata.ContainsKey("Recorded")) { Test-ValidTimestamp $metadata["Recorded"] "$($file.Name) Recorded" | Out-Null }
    if ($expectedProductVersion -and $metadata.ContainsKey("Product Version") -and $metadata["Product Version"] -ne $expectedProductVersion) { Add-Error "$($file.Name) product version does not match verification row: $($metadata["Product Version"]) / $expectedProductVersion" }
    if ($expectedTestCase -and $metadata.ContainsKey("PRD") -and $metadata["PRD"] -notmatch [regex]::Escape($expectedTestCase)) { Add-Error "$($file.Name) does not identify expected test case: $expectedTestCase" }
    $headings = @($lines | Where-Object { $_ -match '^##\s+(.+?)\s*$' } | ForEach-Object { $matches[1].Trim() })
    $required = @("Preconditions", "Steps to Reproduce", "Expected Results", "Evidence")
    $positions = @{}
    foreach ($heading in $required) { $positions[$heading] = [array]::IndexOf($headings, $heading) }
    for ($index = 0; $index -lt $required.Count; $index++) {
        if ($positions[$required[$index]] -lt 0 -or ($index -gt 0 -and $positions[$required[$index]] -lt $positions[$required[$index - 1]])) {
            $message = "$($file.Name) evidence headings are missing or out of order near $($required[$index])"
            if ($strict) { Add-Error $message } else { Add-Warning $message }
        }
    }
}

# Confirm the shared control files exist before validating their consumers.
# Missing authority files are always blocking because the validator would
# otherwise be operating without the repository's declared contract.
if (-not (Test-Path -LiteralPath $testCaseTemplatePath)) { Add-Error "Missing test-case evidence template: $testCaseTemplatePath" }
if (-not (Test-Path -LiteralPath $statusMapPath)) { Add-Error "Missing status/phase map: $statusMapPath" }
if (-not (Test-Path -LiteralPath $backlogPath)) { Add-Error "Missing backlog: $backlogPath" }

# Validate the canonical test-case template before inspecting generated
# evidence. New evidence records must preserve the required reproducibility
# section order even when an individual record is later marked legacy.
if (Test-Path -LiteralPath $testCaseTemplatePath) {
    $templateLines = @(Get-Content -LiteralPath $testCaseTemplatePath)
    $templateHeadings = @(0..($templateLines.Count - 1) | ForEach-Object {
        if ($templateLines[$_] -match '^##\s+(.+?)\s*$') { $matches[1].Trim() }
    })
    $requiredTestCaseHeadings = @("Preconditions", "Steps to Reproduce", "Expected Results", "Evidence")
    $templatePositions = @{}
    foreach ($heading in $requiredTestCaseHeadings) {
        $headingIndex = [array]::IndexOf($templateHeadings, $heading)
        if ($headingIndex -lt 0) {
            Add-Error "Test-case evidence template is missing required heading: $heading"
        } else {
            $templatePositions[$heading] = $headingIndex
        }
    }
    $lastTemplatePosition = -1
    foreach ($heading in $requiredTestCaseHeadings) {
        if (-not $templatePositions.ContainsKey($heading)) { continue }
        if ($templatePositions[$heading] -lt $lastTemplatePosition) {
            Add-Error "Test-case evidence template headings are out of order near: $heading"
            break
        }
        $lastTemplatePosition = $templatePositions[$heading]
    }
}

# Layer 1: parse BACKLOG.md as the active Backlog-phase index. Items in every
# other phase are identified by their folder and do not belong in this file.
$backlogEntries = @{}
if (Test-Path -LiteralPath $backlogPath) {
    $backlogSection = ""
    foreach ($line in Get-Content -LiteralPath $backlogPath) {
        if ($line -match '^##\s+(.+?)\s*$') { $backlogSection = $matches[1].Trim(); continue }
        if ($line -notmatch '^\|\s*(PRD-\d{6}-[A-Z]+)\s*\|') { continue }
        $cells = Get-TableCells $line
        if ($cells.Count -lt 6) { Add-Error "Malformed backlog row: $line"; continue }
        $id = $cells[0]
        if ($backlogEntries.ContainsKey($id)) { Add-Error "Duplicate backlog ID: $id"; continue }
        $backlogEntries[$id] = [pscustomobject]@{ Class = $cells[1]; ShortName = $cells[2]; Status = $cells[3]; Phase = $cells[4]; Description = $cells[5]; Section = $backlogSection }
        if ($cells[3] -ne "Proposed" -or $cells[4] -ne "Backlog") { Add-Error "$id must be listed only as Proposed / Backlog in BACKLOG.md" }
        if ($backlogSection -ne "Backlog") { Add-Error "$id is in BACKLOG.md section '$backlogSection'; active backlog rows must be under 'Backlog'" }
    }
}

# Discover canonical PRD files in the five lifecycle phase folders and the
# blocked holding folder. Evidence and scratch Markdown files are excluded.
$prdFiles = @()
$allPrdDirectories = $phaseDirectories + @("06 - Blocked")
foreach ($directory in $allPrdDirectories) {
    $path = Join-Path $repoRoot "docs\$directory"
    if (Test-Path -LiteralPath $path) { $prdFiles += Get-ChildItem -LiteralPath $path -Filter "PRD-*.md" -File }
}

# Layer 2: validate PRD identity, phase placement, structure, history, audit,
# and verification content against the folder state and, for Backlog items,
# the active backlog entry found above.
$filesById = @{}
foreach ($file in $prdFiles) {
    $id = $file.BaseName
    if ($filesById.ContainsKey($id)) { Add-Error "Duplicate PRD file: $id"; continue }
    $filesById[$id] = $file
    $directoryName = Split-Path -Leaf (Split-Path -Parent $file.FullName)
    $isBlocked = ($directoryName -eq "06 - Blocked")
    $expectedPhase = if ($isBlocked) { $null } else { $phaseByDirectory[$directoryName] }
    $entry = $backlogEntries[$id]
    if ($expectedPhase -eq "Backlog") {
        if (-not $entry) { Add-Error "Backlog PRD has no backlog row: $id" }
        elseif ($entry.Phase -ne "Backlog") { Add-Error "$id backlog phase does not match folder: $($entry.Phase) / Backlog" }
    } elseif ($entry) {
        Add-Error "$id has a BACKLOG.md row but is not in the Backlog folder"
    }

    $lines = @(Get-Content -LiteralPath $file.FullName)
    $headings = @($lines | Where-Object { $_ -match '^##\s+(.+?)\s*$' } | ForEach-Object { $matches[1].Trim() })
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
    $legacyClosed = ($expectedPhase -eq "Closed")
    if ($historyIndex -ge 0) { Test-History $lines $id $expectedPhase $legacyClosed }
    if ($auditIndex -ge 0) { Test-Audit $lines $id $legacyClosed }

    if ($expectedPhase -and $expectedPhase -ne "Closed") {
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
                    if ($status -eq "complete") {
                        $evidenceMatch = [regex]::Match($cells[5], '\]\(([^)]+)\)')
                        if (-not $evidenceMatch.Success) {
                            Add-Error "$id $testCase is complete but has no linked evidence record"
                        } else {
                            $evidenceTarget = $evidenceMatch.Groups[1].Value
                            $evidencePath = Get-RelativeTargetPath $file.FullName $evidenceTarget
                            if (-not $evidencePath -or -not (Test-Path -LiteralPath $evidencePath -PathType Leaf)) {
                                Add-Error "$id $testCase links to missing evidence record: $evidenceTarget"
                            } else {
                                $evidenceFile = Get-Item -LiteralPath $evidencePath
                                if ($evidenceFile.Name -cnotmatch '^PRD-') { Add-Error "$id $testCase evidence filename must begin with uppercase PRD-: $($evidenceFile.Name)" }
                                if ($evidenceFile.BaseName -notmatch ('^' + [regex]::Escape($id) + '(?:-[A-Z]+)?-' + [regex]::Escape($testCase) + '$')) { Add-Error "$id $testCase evidence filename does not identify the expected record: $($evidenceFile.Name)" }
                                Test-EvidenceRecord $evidenceFile $cells[2].Trim().Trim('`') $id $true
                            }
                        }
                    }
                    $testRowCount++
                }
                if ($testRowCount -eq 0) { Add-Error "$id Verification tracking table must contain at least one test-case row" }
            }
        }
    }
}

# Every backlog item must have exactly one canonical PRD file. The reverse check
# complements the PRD-side "has backlog row" check above.
foreach ($id in $backlogEntries.Keys) {
    if (-not $filesById.ContainsKey($id)) { Add-Error "Backlog row has no PRD file in a phase folder: $id" }
}

# Layer 3a: validate every local Markdown link in PRDs, evidence records, and
# workflow-control documents. Checking the full documentation graph catches
# stale phase links that the old control-file-only scan could not see.
$controlFiles = @("AGENTS.md", ".agents\lifecyle-agent\lifecyle-agent.md", "BACKLOG.md") + @(Get-ChildItem -LiteralPath (Join-Path $repoRoot ".codex\skills") -Recurse -Filter "SKILL.md" -File | ForEach-Object { $_.FullName.Substring($repoRoot.Length + 1) })
$documentationFiles = @(
    @(Get-ChildItem -LiteralPath (Join-Path $repoRoot "docs") -Recurse -Filter "*.md" -File | ForEach-Object { $_.FullName }) +
    @($controlFiles | ForEach-Object { Join-Path $repoRoot $_ })
) | Sort-Object -Unique
foreach ($fullPath in $documentationFiles) {
    $relativePath = $fullPath.Substring($repoRoot.Length + 1)
    $rawText = Get-Content -LiteralPath $fullPath -Raw
    $matches = [regex]::Matches($rawText, '\[[^\]]*\]\(([^)]+)\)')
    foreach ($match in $matches) {
        $target = $match.Groups[1].Value.Trim()
        $targetPath = Get-RelativeTargetPath $fullPath $target
        if ($null -eq $targetPath) { continue }
        if (-not (Test-Path -LiteralPath $targetPath)) {
            if ($relativePath -match '^docs\\(?:25 - Closed|90 - Evidence)\\') {
                Add-Warning "Broken legacy local link in $relativePath`: $target"
            } else {
                Add-Error "Broken local link in $relativePath`: $target"
            }
        }
    }
}

# Layer 3b: inventory evidence artifacts independently of verification rows.
# This catches orphaned lowercase files, malformed test-record names, and old
# records whose metadata or section structure no longer matches the template.
$evidencePath = Join-Path $repoRoot "docs\90 - Evidence"
$evidenceFiles = if (Test-Path -LiteralPath $evidencePath) { @(Get-ChildItem -LiteralPath $evidencePath -File) } else { @() }
foreach ($evidenceFile in $evidenceFiles) {
    if ($evidenceFile.Name -cnotmatch '^PRD-') { Add-Error "Evidence filename must begin with uppercase PRD-: $($evidenceFile.Name)" }
    if ($evidenceFile.Extension -ieq '.md' -and $evidenceFile.Name -cmatch '^PRD-\d{6}(?:-[A-Z]+)?-TC-\d{2}\.md$') {
        Test-EvidenceRecord $evidenceFile $null $null $false
    }
}

# Layer 4: validate the static product-version sources that candidate builds
# depend on. This is intentionally a source-consistency check, not a build:
# executable hashes and packaged artifacts belong to prd-patch and Test.
$packageJsonPath = Join-Path $repoRoot "package.json"
$packageLockPath = Join-Path $repoRoot "package-lock.json"
$cargoPath = Join-Path $repoRoot "src-tauri\Cargo.toml"
if ((Test-Path -LiteralPath $packageJsonPath) -and (Test-Path -LiteralPath $packageLockPath)) {
    try {
        $packageVersion = (Get-Content -LiteralPath $packageJsonPath -Raw | ConvertFrom-Json).version
        $lockVersionMatch = Select-String -LiteralPath $packageLockPath -Pattern '^\s*"version"\s*:\s*"([^"]+)"' | Select-Object -First 1
        $lockVersion = if ($lockVersionMatch) { $lockVersionMatch.Matches[0].Groups[1].Value } else { $null }
        if (-not $lockVersion) { Add-Error "package-lock.json does not contain a root version" }
        if ($packageVersion -ne $lockVersion) { Add-Error "Product version mismatch between package.json and package-lock.json: $packageVersion / $lockVersion" }
    } catch { Add-Error "Unable to parse product version files: $($_.Exception.Message)" }
}
if ((Test-Path -LiteralPath $packageJsonPath) -and (Test-Path -LiteralPath $cargoPath)) {
    try {
        $packageVersion = (Get-Content -LiteralPath $packageJsonPath -Raw | ConvertFrom-Json).version
        $cargoVersionMatch = Select-String -LiteralPath $cargoPath -Pattern '^version\s*=\s*"([^"]+)"' | Select-Object -First 1
        if ($cargoVersionMatch -and $packageVersion -ne $cargoVersionMatch.Matches[0].Groups[1].Value) { Add-Error "Product version mismatch between package.json and Cargo.toml: $packageVersion / $($cargoVersionMatch.Matches[0].Groups[1].Value)" }
    } catch { Add-Error "Unable to validate Cargo product version: $($_.Exception.Message)" }
}

# Emit all collected findings after every layer has run. Keeping reporting at
# the end prevents the first failure from hiding later state/evidence issues.
if ($warnings.Count -gt 0) {
    Write-Host "Workflow warnings:" -ForegroundColor Yellow
    $warnings | ForEach-Object { Write-Host "- $_" -ForegroundColor Yellow }
}
if ($errors.Count -gt 0) {
    Write-Host "Workflow errors:" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host "- $_" -ForegroundColor Red }
    exit 1
}

$evidenceCount = if (Test-Path -LiteralPath $evidencePath) { @(Get-ChildItem -LiteralPath $evidencePath -Filter "PRD-*.md" -File).Count } else { 0 }
$summary = "Workflow check passed: $($backlogEntries.Count) active backlog items, $($prdFiles.Count) canonical PRDs, and $evidenceCount evidence records."
if ($Detailed -or $warnings.Count -gt 0) {
    $backlogPhaseSummary = @($backlogEntries.Values | Group-Object Phase | Sort-Object Name | ForEach-Object { "$($_.Name)=$($_.Count)" }) -join ", "
    $backlogStatusSummary = @($backlogEntries.Values | Group-Object Status | Sort-Object Name | ForEach-Object { "$($_.Name)=$($_.Count)" }) -join ", "
    $prdPhaseSummary = @($prdFiles | Group-Object { Split-Path (Split-Path $_.FullName -Parent) -Leaf } | Sort-Object Name | ForEach-Object { "$($_.Name)=$($_.Count)" }) -join ", "
    $summary += " Phases: $backlogPhaseSummary; statuses: $backlogStatusSummary; folders: $prdPhaseSummary; warnings: $($warnings.Count)."
}
Write-Host $summary -ForegroundColor Green
