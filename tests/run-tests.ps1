# ==============================================================================
# tests/run-tests.ps1
# Zero-Dependency Native PowerShell E2E Test Runner
# Fully compatible with Windows PowerShell 5.1 and PowerShell Core 7+
# ==============================================================================

[CmdletBinding()]
param(
    [ValidateSet('1', '2', '3', '4', 'all')]
    [string]$Tier = 'all',

    [string]$TestId = $null,

    [switch]$FailFast,

    [switch]$VerboseOutput
)

Set-StrictMode -Off
$ErrorActionPreference = 'Continue'

$runnerDir = $PSScriptRoot
$repoRoot = [System.IO.Path]::GetFullPath((Join-Path $runnerDir ".."))
$fixturesHelper = [System.IO.Path]::Combine($runnerDir, "test-fixtures-helper.ps1")

if (-not (Test-Path $fixturesHelper)) {
    Write-Host "[FATAL] Missing fixtures helper: $fixturesHelper" -ForegroundColor Red
    exit 1
}

# Import Fixtures Helper
. $fixturesHelper

# Global test registry
$global:RegisteredTests = [System.Collections.Generic.List[hashtable]]::new()

function Register-TestCase {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)][string]$Id,
        [Parameter(Mandatory=$true)][string]$Name,
        [Parameter(Mandatory=$true)][int]$Tier,
        [Parameter(Mandatory=$true)][scriptblock]$Action
    )
    $global:RegisteredTests.Add(@{
        Id = $Id
        Name = $Name
        Tier = $Tier
        Action = $Action
    })
}

# Load Tier test files
$tierFiles = @(
    @{ Tier = 1; Path = [System.IO.Path]::Combine($runnerDir, "test-tier1-feature-coverage.ps1") },
    @{ Tier = 2; Path = [System.IO.Path]::Combine($runnerDir, "test-tier2-boundary-corners.ps1") },
    @{ Tier = 3; Path = [System.IO.Path]::Combine($runnerDir, "test-tier3-cross-feature.ps1") },
    @{ Tier = 4; Path = [System.IO.Path]::Combine($runnerDir, "test-tier4-scenarios.ps1") }
)

foreach ($tf in $tierFiles) {
    if (Test-Path $tf.Path) {
        . $tf.Path
    }
}

# Filter tests
$selectedTests = @($global:RegisteredTests | Where-Object {
    $tierMatch = ($Tier -eq 'all') -or ($_.Tier.ToString() -eq $Tier)
    $idMatch = [string]::IsNullOrEmpty($TestId) -or ($_.Id -like "*$TestId*")
    $tierMatch -and $idMatch
})

Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host " Universal Clean & Reinstall - Opaque-Box E2E Test Runner" -ForegroundColor Cyan
Write-Host (" PowerShell Version : " + $PSVersionTable.PSVersion.ToString()) -ForegroundColor Cyan
Write-Host (" Target Repository  : " + $repoRoot) -ForegroundColor Cyan
Write-Host (" Filter: Tier=" + $Tier + ", TestId=" + $TestId + " | Total Registered: " + $global:RegisteredTests.Count + ", Selected: " + $selectedTests.Count) -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan

$passedCount = 0
$failedCount = 0
$skippedCount = 0
$results = [System.Collections.Generic.List[hashtable]]::new()

$totalStopwatch = [System.Diagnostics.Stopwatch]::StartNew()

try {
    foreach ($test in $selectedTests) {
        $testStopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        $status = "PASS"
        $errorMsg = ""

        Write-Host -NoNewline ("[" + $test.Id + "] (Tier " + $test.Tier + ") " + $test.Name + " ... ")

        try {
            & $test.Action
        } catch {
            $status = "FAIL"
            $errorMsg = $_.Exception.Message
        } finally {
            $testStopwatch.Stop()
            Cleanup-AllSandboxes
        }

        $elapsedMs = $testStopwatch.ElapsedMilliseconds
        $elapsedStr = [string]::Format(" ({0}ms)", $elapsedMs)

        if ($status -eq "PASS") {
            $passedCount++
            Write-Host "PASS" -ForegroundColor Green -NoNewline
            Write-Host $elapsedStr -ForegroundColor DarkGray
        } else {
            $failedCount++
            Write-Host "FAIL" -ForegroundColor Red -NoNewline
            Write-Host $elapsedStr -ForegroundColor DarkGray
            Write-Host ("   -> Error: " + $errorMsg) -ForegroundColor Yellow
            if ($FailFast) {
                Write-Host ""
                Write-Host "[FAIL-FAST] Terminating execution on first failure." -ForegroundColor Red
                break
            }
        }

        $results.Add(@{
            Id = $test.Id
            Name = $test.Name
            Tier = $test.Tier
            Status = $status
            ElapsedMs = $elapsedMs
            Error = $errorMsg
        })
    }
} finally {
    $totalStopwatch.Stop()
    Cleanup-AllSandboxes
}

Write-Host ""
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host " Test Execution Summary" -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host (" Total Selected : " + $selectedTests.Count)
Write-Host (" Passed         : " + $passedCount) -ForegroundColor Green
$failColor = if ($failedCount -gt 0) { "Red" } else { "Green" }
Write-Host (" Failed         : " + $failedCount) -ForegroundColor $failColor
Write-Host (" Total Time     : " + $totalStopwatch.Elapsed.TotalSeconds.ToString("F2") + "s")
Write-Host "================================================================================" -ForegroundColor Cyan

if ($failedCount -gt 0) {
    Write-Host ""
    Write-Host "Failed Test Details:" -ForegroundColor Red
    foreach ($res in $results | Where-Object { $_.Status -eq "FAIL" }) {
        Write-Host (" - [" + $res.Id + "] " + $res.Name + ": " + $res.Error) -ForegroundColor Yellow
    }
    exit 1
} else {
    Write-Host ""
    Write-Host "All tests passed successfully!" -ForegroundColor Green
    exit 0
}
