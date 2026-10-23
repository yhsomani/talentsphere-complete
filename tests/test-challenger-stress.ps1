# ==============================================================================
# tests/test-challenger-stress.ps1
# Standalone Empirical Stress Test Suite for Challenger 1
# Tests deep nesting, special paths, corrupt manifests, and mixed monorepos.
# ==============================================================================

[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
Set-StrictMode -Off

$ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = [System.IO.Path]::GetFullPath((Join-Path $ScriptRoot ".."))
$BatScript = Join-Path $ProjectRoot "clean-reinstall.bat"
$PsScript = Join-Path $ProjectRoot "clean-reinstall.ps1"

# Import test fixtures helper
. (Join-Path $ScriptRoot "test-fixtures-helper.ps1")

Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host " STARTING CHALLENGER 1 EMPIRICAL STRESS TEST SUITE" -ForegroundColor Cyan
Write-Host " Target Bat: $BatScript" -ForegroundColor DarkCyan
Write-Host " Target Ps1: $PsScript" -ForegroundColor DarkCyan
Write-Host "================================================================================" -ForegroundColor Cyan

$StressResults = [System.Collections.Generic.List[PSCustomObject]]::new()

function Record-StressTest {
    param(
        [string]$ScenarioId,
        [string]$Name,
        [bool]$Passed,
        [string]$Details,
        [double]$DurationMs
    )
    $obj = [PSCustomObject]@{
        ScenarioId = $ScenarioId
        Name = $Name
        Passed = $Passed
        Details = $Details
        DurationMs = $DurationMs
    }
    $StressResults.Add($obj)
    $statusColor = if ($Passed) { 'Green' } else { 'Red' }
    $statusText = if ($Passed) { 'PASS' } else { 'FAIL' }
    Write-Host "[$ScenarioId] $Name ... $statusText (${DurationMs}ms)" -ForegroundColor $statusColor
    if (-not $Passed) {
        Write-Host "    FAILURE: $Details" -ForegroundColor Red
    }
}

# ==============================================================================
# SCENARIO 1: Deep Nested Repositories Exceeding --max-depth & Traversal Pruning
# ==============================================================================
Write-Host "`n--- Scenario 1: Deep Nested Repositories & Pruning ---" -ForegroundColor Yellow

$sw = [System.Diagnostics.Stopwatch]::StartNew()
$s1Root = New-TestSandbox -Prefix "cr-stress-s1"
try {
    # Hierarchy:
    # Level 1: Node project (depth 1)
    #   - inside level 1 node_modules: nested fake package.json at depth 2 (must be pruned!)
    # Level 3: Python project (depth 3)
    # Level 5: Rust project (depth 5)
    # Level 6: Python project (depth 6)
    # Level 7: Java project (depth 7)

    # 1. Level 1 (Node)
    $lvl1Dir = Join-Path $s1Root "lvl1"
    [System.IO.Directory]::CreateDirectory($lvl1Dir) | Out-Null
    [System.IO.File]::WriteAllText((Join-Path $lvl1Dir "package.json"), '{"name":"lvl1-node","version":"1.0.0"}')
    [System.IO.File]::WriteAllText((Join-Path $lvl1Dir "package-lock.json"), '{"name":"lvl1-node","lockfileVersion":3}')
    $lvl1NM = Join-Path $lvl1Dir "node_modules"
    $nestedFake = Join-Path $lvl1NM "fake-dep"
    [System.IO.Directory]::CreateDirectory($nestedFake) | Out-Null
    [System.IO.File]::WriteAllText((Join-Path $nestedFake "package.json"), '{"name":"fake-dep","version":"1.0.0"}')
    [System.IO.File]::WriteAllText((Join-Path $lvl1NM "dummy.txt"), 'mock node_modules')

    # 2. Level 3 (Python)
    $lvl3Dir = Join-Path $lvl1Dir "d2\lvl3"
    [System.IO.Directory]::CreateDirectory($lvl3Dir) | Out-Null
    [System.IO.File]::WriteAllText((Join-Path $lvl3Dir "pyproject.toml"), "[tool.poetry]`nname = `"lvl3-py`"`nversion = `"1.0`"")
    [System.IO.File]::WriteAllText((Join-Path $lvl3Dir "poetry.lock"), "# poetry lockfile")
    $lvl3Venv = Join-Path $lvl3Dir ".venv"
    [System.IO.Directory]::CreateDirectory($lvl3Venv) | Out-Null
    [System.IO.File]::WriteAllText((Join-Path $lvl3Venv "pyvenv.cfg"), "home = C:\Python")

    # 3. Level 5 (Rust)
    $lvl5Dir = Join-Path $lvl3Dir "d4\lvl5"
    [System.IO.Directory]::CreateDirectory($lvl5Dir) | Out-Null
    [System.IO.File]::WriteAllText((Join-Path $lvl5Dir "Cargo.toml"), "[package]`nname = `"lvl5-rust`"`nversion = `"0.1.0`"")
    [System.IO.File]::WriteAllText((Join-Path $lvl5Dir "Cargo.lock"), "# cargo lock")
    $lvl5Target = Join-Path $lvl5Dir "target"
    [System.IO.Directory]::CreateDirectory($lvl5Target) | Out-Null
    [System.IO.File]::WriteAllText((Join-Path $lvl5Target "rust-build.o"), "rust artifact")

    # 4. Level 6 (Python - beyond depth 5)
    $lvl6Dir = Join-Path $lvl5Dir "lvl6"
    [System.IO.Directory]::CreateDirectory($lvl6Dir) | Out-Null
    [System.IO.File]::WriteAllText((Join-Path $lvl6Dir "requirements.txt"), "requests==2.31.0")
    $lvl6Venv = Join-Path $lvl6Dir "venv"
    [System.IO.Directory]::CreateDirectory($lvl6Venv) | Out-Null
    [System.IO.File]::WriteAllText((Join-Path $lvl6Venv "pyvenv.cfg"), "home = C:\Python")

    # 5. Level 7 (Java - beyond depth 5)
    $lvl7Dir = Join-Path $lvl6Dir "lvl7"
    [System.IO.Directory]::CreateDirectory($lvl7Dir) | Out-Null
    [System.IO.File]::WriteAllText((Join-Path $lvl7Dir "pom.xml"), "<project><modelVersion>4.0.0</modelVersion><groupId>com.stress</groupId><artifactId>lvl7</artifactId><version>1.0</version></project>")
    $lvl7Target = Join-Path $lvl7Dir "target"
    [System.IO.Directory]::CreateDirectory($lvl7Target) | Out-Null
    [System.IO.File]::WriteAllText((Join-Path $lvl7Target "java-app.jar"), "java artifact")

    # TEST 1A: Run with --max-depth 5 --clean-only --yes
    $sw1a = [System.Diagnostics.Stopwatch]::StartNew()
    $res1a = & powershell.exe -ExecutionPolicy Bypass -NoProfile -File $PsScript --root $s1Root --max-depth 5 --clean-only --yes 2>&1
    $exit1a = $LASTEXITCODE
    $sw1a.Stop()

    $pass1a = ($exit1a -eq 0) -and
              (-not (Test-Path -LiteralPath $lvl1NM)) -and
              (Test-Path -LiteralPath (Join-Path $lvl1Dir "package.json")) -and
              (Test-Path -LiteralPath (Join-Path $lvl1Dir "package-lock.json")) -and
              (-not (Test-Path -LiteralPath $lvl3Venv)) -and
              (Test-Path -LiteralPath (Join-Path $lvl3Dir "poetry.lock")) -and
              (-not (Test-Path -LiteralPath $lvl5Target)) -and
              (Test-Path -LiteralPath (Join-Path $lvl5Dir "Cargo.lock")) -and
              (Test-Path -LiteralPath $lvl6Venv) -and # Level 6 venv MUST NOT be deleted (pruned by max-depth 5)
              (Test-Path -LiteralPath $lvl7Target)   # Level 7 target MUST NOT be deleted

    $details1a = "Exit=$exit1a, Lvl1NM Deleted=$(-not (Test-Path -LiteralPath $lvl1NM)), Lvl3Venv Deleted=$(-not (Test-Path -LiteralPath $lvl3Venv)), Lvl5Target Deleted=$(-not (Test-Path -LiteralPath $lvl5Target)), Lvl6Venv Preserved=$(Test-Path -LiteralPath $lvl6Venv), Lvl7Target Preserved=$(Test-Path -LiteralPath $lvl7Target)"
    Record-StressTest "STRESS-01A" "Max-depth 5 prunes depth 6+ and cleans depths 1-5" $pass1a $details1a $sw1a.ElapsedMilliseconds

    # TEST 1B: Run with --max-depth 2 --clean-only --yes
    # Re-create lvl3 venv to test depth 2 cutoff
    [System.IO.Directory]::CreateDirectory($lvl3Venv) | Out-Null
    [System.IO.File]::WriteAllText((Join-Path $lvl3Venv "pyvenv.cfg"), "home = C:\Python")
    $sw1b = [System.Diagnostics.Stopwatch]::StartNew()
    $res1b = & powershell.exe -ExecutionPolicy Bypass -NoProfile -File $PsScript --root $s1Root --max-depth 2 --clean-only --yes 2>&1
    $exit1b = $LASTEXITCODE
    $sw1b.Stop()

    $pass1b = ($exit1b -eq 0) -and (Test-Path -LiteralPath $lvl3Venv)
    $details1b = "Exit=$exit1b, Lvl3Venv (depth 3) Preserved at MaxDepth 2=$(Test-Path -LiteralPath $lvl3Venv)"
    Record-StressTest "STRESS-01B" "Max-depth 2 strictly cuts off discovery and cleanup at depth > 2" $pass1b $details1b $sw1b.ElapsedMilliseconds
} finally {
    Remove-TestSandbox -Path $s1Root
}

# ==============================================================================
# SCENARIO 2: Spaces and Special Characters in Paths
# ==============================================================================
Write-Host "`n--- Scenario 2: Spaces and Special Characters in Paths ---" -ForegroundColor Yellow

$s2Root = New-TestSandbox -Prefix "cr-stress-s2"
try {
    # Create folder with special chars: spaces, parentheses, ampersands, brackets, accents
    $specialSubDir = Join-Path $s2Root "App & Service (Prod) [v2.0] #tag! café_app"
    [System.IO.Directory]::CreateDirectory($specialSubDir) | Out-Null

    # Inside, create a Node project and a Python project in nested folders with spaces
    $nodeProj = Join-Path $specialSubDir "frontend client [web]"
    [System.IO.Directory]::CreateDirectory($nodeProj) | Out-Null
    [System.IO.File]::WriteAllText((Join-Path $nodeProj "package.json"), '{"name":"special-web","version":"1.0.0"}')
    [System.IO.File]::WriteAllText((Join-Path $nodeProj "package-lock.json"), '{"name":"special-web","lockfileVersion":3}')
    $nodeNM = Join-Path $nodeProj "node_modules"
    [System.IO.Directory]::CreateDirectory($nodeNM) | Out-Null
    [System.IO.File]::WriteAllText((Join-Path $nodeNM "artifact.js"), "artifact")
    [System.IO.File]::WriteAllText((Join-Path $nodeProj ".env"), "SECRET=val")

    $pyProj = Join-Path $specialSubDir "backend api (py)"
    [System.IO.Directory]::CreateDirectory($pyProj) | Out-Null
    [System.IO.File]::WriteAllText((Join-Path $pyProj "pyproject.toml"), "[tool.poetry]`nname = `"special-py`"`nversion = `"1.0`"")
    [System.IO.File]::WriteAllText((Join-Path $pyProj "poetry.lock"), "# lockfile")
    $pyVenv = Join-Path $pyProj ".venv"
    [System.IO.Directory]::CreateDirectory($pyVenv) | Out-Null
    [System.IO.File]::WriteAllText((Join-Path $pyVenv "pyvenv.cfg"), "home = C:\Python")

    # TEST 2A: Invoke clean-reinstall.bat with quotes around the special path
    $sw2a = [System.Diagnostics.Stopwatch]::StartNew()
    $res2a = & cmd.exe /c "`"$BatScript`" --root `"$specialSubDir`" --clean-only --yes" 2>&1
    $exit2a = $LASTEXITCODE
    $sw2a.Stop()

    $pass2a = ($exit2a -eq 0) -and
              (-not (Test-Path -LiteralPath $nodeNM)) -and
              (Test-Path -LiteralPath (Join-Path $nodeProj "package-lock.json")) -and
              (Test-Path -LiteralPath (Join-Path $nodeProj ".env")) -and
              (-not (Test-Path -LiteralPath $pyVenv)) -and
              (Test-Path -LiteralPath (Join-Path $pyProj "poetry.lock"))

    $details2a = "Exit=$exit2a, NodeNM Deleted=$(-not (Test-Path -LiteralPath $nodeNM)), PyVenv Deleted=$(-not (Test-Path -LiteralPath $pyVenv)), .env Preserved=$(Test-Path -LiteralPath (Join-Path $nodeProj ".env"))"
    Record-StressTest "STRESS-02A" "Batch wrapper handles spaces, ampersands, brackets and special chars" $pass2a $details2a $sw2a.ElapsedMilliseconds

    # TEST 2B: Invoke clean-reinstall.ps1 with --dry-run
    [System.IO.Directory]::CreateDirectory($nodeNM) | Out-Null
    $sw2b = [System.Diagnostics.Stopwatch]::StartNew()
    $res2b = & powershell.exe -ExecutionPolicy Bypass -NoProfile -File $PsScript --root $specialSubDir --dry-run --yes 2>&1
    $exit2b = $LASTEXITCODE
    $sw2b.Stop()

    $pass2b = ($exit2b -eq 0) -and (Test-Path -LiteralPath $nodeNM)
    $details2b = "Exit=$exit2b, Dry-run in special path preserved artifact=$(Test-Path -LiteralPath $nodeNM)"
    Record-StressTest "STRESS-02B" "Dry-run preserves artifacts in special character paths" $pass2b $details2b $sw2b.ElapsedMilliseconds
} finally {
    Remove-TestSandbox -Path $s2Root
}

# ==============================================================================
# SCENARIO 3: Corrupt or Empty Manifest Files
# ==============================================================================
Write-Host "`n--- Scenario 3: Corrupt or Empty Manifest Files ---" -ForegroundColor Yellow

$s3Root = New-TestSandbox -Prefix "cr-stress-s3"
try {
    # 1. Empty repository folder (0 files)
    $emptyDir = Join-Path $s3Root "empty-dir"
    [System.IO.Directory]::CreateDirectory($emptyDir) | Out-Null

    # 2. Corrupt JSON package.json
    $corruptJsonDir = Join-Path $s3Root "corrupt-json"
    [System.IO.Directory]::CreateDirectory($corruptJsonDir) | Out-Null
    [System.IO.File]::WriteAllText((Join-Path $corruptJsonDir "package.json"), '{"name": unclosed invalid json string ...')
    $corruptJsonNM = Join-Path $corruptJsonDir "node_modules"
    [System.IO.Directory]::CreateDirectory($corruptJsonNM) | Out-Null
    [System.IO.File]::WriteAllText((Join-Path $corruptJsonNM "mock.js"), "mock")

    # 3. 0-byte package.json
    $zeroByteDir = Join-Path $s3Root "zero-byte-json"
    [System.IO.Directory]::CreateDirectory($zeroByteDir) | Out-Null
    [System.IO.File]::WriteAllText((Join-Path $zeroByteDir "package.json"), '')
    $zeroByteNM = Join-Path $zeroByteDir "node_modules"
    [System.IO.Directory]::CreateDirectory($zeroByteNM) | Out-Null
    [System.IO.File]::WriteAllText((Join-Path $zeroByteNM "mock.js"), "mock")

    # 4. Corrupt TOML Cargo.toml
    $corruptCargoDir = Join-Path $s3Root "corrupt-cargo"
    [System.IO.Directory]::CreateDirectory($corruptCargoDir) | Out-Null
    [System.IO.File]::WriteAllText((Join-Path $corruptCargoDir "Cargo.toml"), '[package\ninvalid unclosed toml')
    $corruptCargoTarget = Join-Path $corruptCargoDir "target"
    [System.IO.Directory]::CreateDirectory($corruptCargoTarget) | Out-Null
    [System.IO.File]::WriteAllText((Join-Path $corruptCargoTarget "out.o"), "mock")

    # 5. Valid Node project
    $validDir = Join-Path $s3Root "valid-proj"
    [System.IO.Directory]::CreateDirectory($validDir) | Out-Null
    [System.IO.File]::WriteAllText((Join-Path $validDir "package.json"), '{"name":"valid-proj","version":"1.0.0"}')
    [System.IO.File]::WriteAllText((Join-Path $validDir "package-lock.json"), '{"name":"valid-proj","lockfileVersion":3}')
    $validNM = Join-Path $validDir "node_modules"
    [System.IO.Directory]::CreateDirectory($validNM) | Out-Null
    [System.IO.File]::WriteAllText((Join-Path $validNM "out.js"), "mock")

    # TEST 3A: Clean all with --continue-on-error --yes
    $sw3a = [System.Diagnostics.Stopwatch]::StartNew()
    $res3a = & powershell.exe -ExecutionPolicy Bypass -NoProfile -File $PsScript --root $s3Root --clean-only --yes --continue-on-error 2>&1
    $exit3a = $LASTEXITCODE
    $sw3a.Stop()

    $pass3a = ($exit3a -eq 0) -and
              (-not (Test-Path -LiteralPath $corruptJsonNM)) -and
              (-not (Test-Path -LiteralPath $zeroByteNM)) -and
              (-not (Test-Path -LiteralPath $corruptCargoTarget)) -and
              (-not (Test-Path -LiteralPath $validNM)) -and
              (Test-Path -LiteralPath (Join-Path $validDir "package-lock.json")) -and
              (Test-Path -LiteralPath (Join-Path $corruptJsonDir "package.json")) -and # Manifest itself must NEVER be deleted
              (Test-Path -LiteralPath (Join-Path $corruptCargoDir "Cargo.toml"))

    $details3a = "Exit=$exit3a, CorruptJsonNM Deleted=$(-not (Test-Path -LiteralPath $corruptJsonNM)), ZeroByteNM Deleted=$(-not (Test-Path -LiteralPath $zeroByteNM)), ValidNM Deleted=$(-not (Test-Path -LiteralPath $validNM)), Manifests Preserved=True"
    Record-StressTest "STRESS-03A" "Corrupt and 0-byte manifests are handled safely without crash" $pass3a $details3a $sw3a.ElapsedMilliseconds

    # TEST 3B: Run against empty directory only (0 projects)
    $sw3b = [System.Diagnostics.Stopwatch]::StartNew()
    $res3b = & powershell.exe -ExecutionPolicy Bypass -NoProfile -File $PsScript --root $emptyDir --clean-only --yes 2>&1
    $exit3b = $LASTEXITCODE
    $sw3b.Stop()

    # Empty directory should report 0 projects discovered and exit cleanly with 0
    $pass3b = ($exit3b -eq 0)
    $details3b = "Exit=$exit3b, Empty directory processed cleanly"
    Record-StressTest "STRESS-03B" "Empty directory with 0 manifests exits cleanly without containment crash" $pass3b $details3b $sw3b.ElapsedMilliseconds
} finally {
    Remove-TestSandbox -Path $s3Root
}

# ==============================================================================
# SCENARIO 4: Mixed Monorepo Containing Multiple Package Managers
# ==============================================================================
Write-Host "`n--- Scenario 4: Mixed Polyglot Monorepo ---" -ForegroundColor Yellow

$s4Root = New-TestSandbox -Prefix "cr-stress-s4"
try {
    # Structure:
    # Root: pnpm-workspace.yaml + package.json + root node_modules + .turbo
    # packages/web: Node package (pnpm member) + node_modules + dist
    # packages/api: Python FastAPI service (poetry.lock + .venv + __pycache__)
    # packages/worker: Rust service (Cargo.toml + Cargo.lock + target)
    # packages/tools: Bun tool (package.json + bun.lockb + node_modules)

    # 1. Root
    [System.IO.File]::WriteAllText((Join-Path $s4Root "pnpm-workspace.yaml"), "packages:`n  - 'packages/*'`n")
    [System.IO.File]::WriteAllText((Join-Path $s4Root "package.json"), '{"name":"polyglot-mono","private":true}')
    [System.IO.File]::WriteAllText((Join-Path $s4Root "pnpm-lock.yaml"), "lockfileVersion: '9.0'`nimporters:`n  .:`n")
    $rootNM = Join-Path $s4Root "node_modules"
    $rootTurbo = Join-Path $s4Root ".turbo"
    [System.IO.Directory]::CreateDirectory($rootNM) | Out-Null
    [System.IO.Directory]::CreateDirectory($rootTurbo) | Out-Null
    [System.IO.File]::WriteAllText((Join-Path $rootNM "pnpm-cache.txt"), "cache")
    [System.IO.File]::WriteAllText((Join-Path $rootTurbo "turbo.json"), "cache")

    $pkgsDir = Join-Path $s4Root "packages"
    [System.IO.Directory]::CreateDirectory($pkgsDir) | Out-Null

    # 2. Web (pnpm member)
    $webDir = Join-Path $pkgsDir "web"
    [System.IO.Directory]::CreateDirectory($webDir) | Out-Null
    [System.IO.File]::WriteAllText((Join-Path $webDir "package.json"), '{"name":"@mono/web","version":"1.0.0"}')
    $webNM = Join-Path $webDir "node_modules"
    $webDist = Join-Path $webDir "dist"
    [System.IO.Directory]::CreateDirectory($webNM) | Out-Null
    [System.IO.Directory]::CreateDirectory($webDist) | Out-Null
    [System.IO.File]::WriteAllText((Join-Path $webNM "web-mock.js"), "mock")
    [System.IO.File]::WriteAllText((Join-Path $webDist "bundle.js"), "bundle")

    # 3. API (Poetry)
    $apiDir = Join-Path $pkgsDir "api"
    [System.IO.Directory]::CreateDirectory($apiDir) | Out-Null
    [System.IO.File]::WriteAllText((Join-Path $apiDir "pyproject.toml"), "[tool.poetry]`nname = `"mono-api`"`nversion = `"0.1.0`"")
    [System.IO.File]::WriteAllText((Join-Path $apiDir "poetry.lock"), "# poetry lock")
    $apiVenv = Join-Path $apiDir ".venv"
    $apiPycache = Join-Path $apiDir "__pycache__"
    [System.IO.Directory]::CreateDirectory($apiVenv) | Out-Null
    [System.IO.Directory]::CreateDirectory($apiPycache) | Out-Null
    [System.IO.File]::WriteAllText((Join-Path $apiVenv "cfg.txt"), "venv")
    [System.IO.File]::WriteAllText((Join-Path $apiPycache "mod.pyc"), "pyc")

    # 4. Worker (Cargo)
    $workerDir = Join-Path $pkgsDir "worker"
    [System.IO.Directory]::CreateDirectory($workerDir) | Out-Null
    [System.IO.File]::WriteAllText((Join-Path $workerDir "Cargo.toml"), "[package]`nname = `"mono-worker`"`nversion = `"0.1.0`"")
    [System.IO.File]::WriteAllText((Join-Path $workerDir "Cargo.lock"), "# cargo lock")
    $workerTarget = Join-Path $workerDir "target"
    [System.IO.Directory]::CreateDirectory($workerTarget) | Out-Null
    [System.IO.File]::WriteAllText((Join-Path $workerTarget "worker.exe"), "bin")

    # 5. Tools (Bun)
    $toolsDir = Join-Path $pkgsDir "tools"
    [System.IO.Directory]::CreateDirectory($toolsDir) | Out-Null
    [System.IO.File]::WriteAllText((Join-Path $toolsDir "package.json"), '{"name":"@mono/tools","version":"1.0.0"}')
    [System.IO.File]::WriteAllText((Join-Path $toolsDir "bun.lockb"), "BUN_LOCK_MOCK")
    $toolsNM = Join-Path $toolsDir "node_modules"
    [System.IO.Directory]::CreateDirectory($toolsNM) | Out-Null
    [System.IO.File]::WriteAllText((Join-Path $toolsNM "tool.js"), "tool")

    # TEST 4A: Clean-only + deep-clean across mixed monorepo
    $sw4a = [System.Diagnostics.Stopwatch]::StartNew()
    $res4a = & powershell.exe -ExecutionPolicy Bypass -NoProfile -File $PsScript --root $s4Root --clean-only --deep-clean --yes 2>&1
    $exit4a = $LASTEXITCODE
    $sw4a.Stop()

    $pass4a = ($exit4a -eq 0) -and
              (-not (Test-Path -LiteralPath $rootNM)) -and
              (-not (Test-Path -LiteralPath $rootTurbo)) -and
              (-not (Test-Path -LiteralPath $webNM)) -and
              (-not (Test-Path -LiteralPath $webDist)) -and
              (-not (Test-Path -LiteralPath $apiVenv)) -and
              (-not (Test-Path -LiteralPath $apiPycache)) -and
              (-not (Test-Path -LiteralPath $workerTarget)) -and
              (-not (Test-Path -LiteralPath $toolsNM)) -and
              (Test-Path -LiteralPath (Join-Path $s4Root "pnpm-workspace.yaml")) -and
              (Test-Path -LiteralPath (Join-Path $s4Root "pnpm-lock.yaml")) -and
              (Test-Path -LiteralPath (Join-Path $apiDir "poetry.lock")) -and
              (Test-Path -LiteralPath (Join-Path $workerDir "Cargo.lock")) -and
              (Test-Path -LiteralPath (Join-Path $toolsDir "bun.lockb"))

    $details4a = "Exit=$exit4a, All artifacts purged, All lockfiles preserved=True"
    Record-StressTest "STRESS-04A" "Mixed monorepo cleans all artifacts while preserving all lockfiles" $pass4a $details4a $sw4a.ElapsedMilliseconds

    # TEST 4B: Discovery classification - verify non-Node packages are NOT marked as pnpm workspace members
    . (Resolve-Path $PsScript)
    $projs = Get-DiscoveredProjects -RootPath $s4Root
    $webProj = $projs | Where-Object { $_.RelativePath -like "*web" } | Select-Object -First 1
    $apiProj = $projs | Where-Object { $_.RelativePath -like "*api" } | Select-Object -First 1
    $workerProj = $projs | Where-Object { $_.RelativePath -like "*worker" } | Select-Object -First 1

    # In a valid polyglot monorepo:
    # web MUST be a workspace member of pnpm
    # api (Python) and worker (Rust) MUST NOT be workspace members of pnpm
    $pass4b = ($webProj.IsWorkspaceMember -eq $true) -and
              ($apiProj.IsWorkspaceMember -eq $false) -and
              ($workerProj.IsWorkspaceMember -eq $false)

    $details4b = "web.IsWorkspaceMember=$($webProj.IsWorkspaceMember) (expected True), api.IsWorkspaceMember=$($apiProj.IsWorkspaceMember) (expected False), worker.IsWorkspaceMember=$($workerProj.IsWorkspaceMember) (expected False)"
    Record-StressTest "STRESS-04B" "Polyglot subprojects (Python, Rust) are NOT hijacked as pnpm workspace members" $pass4b $details4b 100

    # TEST 4C: Reinstall CLI execution does not skip independent polyglot subprojects
    $res4c = & powershell.exe -ExecutionPolicy Bypass -NoProfile -File $PsScript --root $s4Root --install-only --yes --continue-on-error 2>&1
    $outText4c = ($res4c | Out-String)

    # In a proper polyglot monorepo, packages\api should NOT be skipped as 'Workspace Managed' by a Node pnpm root
    $pass4c = ($outText4c -notmatch "Subproject 'packages\\api' is managed by workspace root") -and
              ($outText4c -notmatch "packages\\api\s+Python\s+Workspace Member")

    $details4c = "packages\api was marked as Workspace Member and skipped from reinstall by pnpm root: $($outText4c -match 'packages\\api\s+Python\s+Workspace Member')"
    Record-StressTest "STRESS-04C" "Reinstallation does not skip polyglot subprojects due to workspace hijacking" $pass4c $details4c 100
} finally {
    Remove-TestSandbox -Path $s4Root
}

# ==============================================================================
# Summary
# ==============================================================================
Write-Host "`n================================================================================" -ForegroundColor Cyan
Write-Host " CHALLENGER 1 STRESS TEST SUMMARY" -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan

$totalTests = $StressResults.Count
$passedCount = ($StressResults | Where-Object { $_.Passed }).Count
$failedCount = ($StressResults | Where-Object { -not $_.Passed }).Count

Write-Host "Total Tests : $totalTests" -ForegroundColor Cyan
Write-Host "Passed      : $passedCount" -ForegroundColor Green
Write-Host "Failed      : $failedCount" -ForegroundColor $(if ($failedCount -eq 0) { 'Green' } else { 'Red' })

if ($failedCount -gt 0) {
    exit 1
} else {
    exit 0
}
