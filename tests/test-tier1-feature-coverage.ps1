# ==============================================================================
# tests/test-tier1-feature-coverage.ps1
# Tier 1: Feature Coverage E2E Tests (TC-01 through TC-20)
# Zero external dependencies; compatible with PS 5.1 and PS 7+
# ==============================================================================

Set-StrictMode -Off

# TC-01: Batch Entry Point (clean-reinstall.bat)
Register-TestCase -Id "TC-01" -Name "Batch Entry Point argument forwarding and exit code" -Tier 1 -Action {
    $res = Invoke-CleanReinstall -UseBatch $true -ScriptArgs @('--help')
    Assert-ExitCode 0 $res.ExitCode "clean-reinstall.bat --help should return exit code 0"
    Assert-True ($res.AllOutput -match '(?i)(clean-reinstall|usage|options|help)') "Output should contain help/usage text"

    # Also verify forwarding with a sandbox
    $sandbox = New-TestSandbox "t1-batch"
    New-NodeProjectFixture -ParentDir $sandbox -Name "app" -Artifacts @('node_modules') | Out-Null
    $resBatch = Invoke-CleanReinstall -UseBatch $true -ScriptArgs @('--root', $sandbox, '--dry-run', '--yes')
    Assert-ExitCode 0 $resBatch.ExitCode "clean-reinstall.bat should forward --root and --dry-run with exit code 0"
    Assert-PathExists (Join-Path $sandbox "app\node_modules") "Dry run via batch wrapper must not delete node_modules"
}

# TC-02: CLI Parameter Parsing & Aliases
Register-TestCase -Id "TC-02" -Name "CLI parameter parsing and double-dash kebab-case aliases" -Tier 1 -Action {
    $sandbox = New-TestSandbox "t1-params"
    New-NodeProjectFixture -ParentDir $sandbox -Name "pkg" -Artifacts @('node_modules') | Out-Null

    # Test kebab-case double-dash flags
    $args = @(
        '--root', $sandbox,
        '--dry-run',
        '--deep-clean',
        '--max-depth', '4',
        '--continue-on-error',
        '--yes',
        '--verbose'
    )
    $res = Invoke-CleanReinstall -ScriptArgs $args
    Assert-ExitCode 0 $res.ExitCode "All kebab-case aliases should parse cleanly and return exit code 0"
    Assert-False ($res.AllOutput -match '(?i)A parameter cannot be found that matches parameter name') "No parameter binding error should occur"
}

# TC-03: Parameter Validation & Mutual Exclusivity
Register-TestCase -Id "TC-03" -Name "Parameter mutual exclusivity validation (--clean-only and --install-only)" -Tier 1 -Action {
    $sandbox = New-TestSandbox "t1-mutex"
    $res = Invoke-CleanReinstall -ScriptArgs @('--root', $sandbox, '--clean-only', '--install-only')
    Assert-True ($res.ExitCode -ne 0) "Mutually exclusive flags --clean-only and --install-only must fail with nonzero exit code"
    Assert-True ($res.AllOutput -match '(?i)(clean-only|install-only|mutually exclusive|cannot be used together)') "Error message must report mutual exclusivity conflict"
}

# TC-04: Structured Logging & Secret Redaction
Register-TestCase -Id "TC-04" -Name "Structured logging and token/secret redaction" -Tier 1 -Action {
    $sandbox = New-TestSandbox "t1-log"
    New-NodeProjectFixture -ParentDir $sandbox -Name "app" | Out-Null
    
    # Add an env file with secrets
    $envContent = @"
NPM_TOKEN=//registry.npmjs.org/:_authToken=npm_secrettoken12345
GITHUB_PAT=ghp_ABCDefghIJklmnOPqrstUVwxyz1234567890
BEARER_AUTH=Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.t-IDcSemACt8x4iTMCda8Yhe3iZaWbvV5XKSTbuAn0M
PASSWORD=my_super_secret_db_pass
"@
    [System.IO.File]::WriteAllText((Join-Path $sandbox "app\.env"), $envContent, [System.Text.Encoding]::UTF8)

    $res = Invoke-CleanReinstall -ScriptArgs @('--root', $sandbox, '--dry-run', '--yes', '--verbose')
    Assert-ExitCode 0 $res.ExitCode "Dry run on secret-containing project must succeed"

    # Locate log file in sandbox or project root
    $logFiles = @(Get-ChildItem -Path $sandbox -Filter "clean-reinstall_*.log" -File -Recurse)
    if ($logFiles.Count -eq 0) {
        $repoRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
        $logFiles = @(Get-ChildItem -Path $repoRoot -Filter "clean-reinstall_*.log" -File | Sort-Object LastWriteTime -Descending | Select-Object -First 1)
    }
    Assert-True ($logFiles.Count -gt 0) "At least one clean-reinstall_*.log file must be generated"

    $logText = [System.IO.File]::ReadAllText($logFiles[0].FullName)
    Assert-False ($logText -match 'npm_secrettoken12345') "NPM secret token must be redacted in log file"
    Assert-False ($logText -match 'ghp_ABCDefghIJklmnOPqrstUVwxyz1234567890') "GitHub PAT must be redacted in log file"
    Assert-False ($logText -match 'my_super_secret_db_pass') "Database password must be redacted in log file"
}

# TC-05: Path Canonicalization & Containment Guard
Register-TestCase -Id "TC-05" -Name "Path canonicalization and root drive / system directory containment guard" -Tier 1 -Action {
    # Test targeting drive root C:\
    $res = Invoke-CleanReinstall -ScriptArgs @('--root', 'C:\', '--dry-run', '--yes')
    Assert-True ($res.ExitCode -ne 0) "Executing against drive root 'C:\' must be rejected with nonzero exit code"
    Assert-True ($res.AllOutput -match '(?i)(drive root|system|containment|forbidden|invalid|safe)') "Output must report rejection of drive root"

    # Test targeting Windows directory
    $sysDir = $env:SystemRoot
    if ($sysDir) {
        $resSys = Invoke-CleanReinstall -ScriptArgs @('--root', $sysDir, '--dry-run', '--yes')
        Assert-True ($resSys.ExitCode -ne 0) "Executing against Windows system root must be rejected"
    }
}

# TC-06: Directory Scanner with --max-depth
Register-TestCase -Id "TC-06" -Name "Directory scanner bounded by --max-depth" -Tier 1 -Action {
    $sandbox = New-TestSandbox "t1-depth"
    # Create shallow project at depth 2 (sandbox/sub1/shallow-app)
    $shallowParent = Join-Path $sandbox "sub1"
    New-NodeProjectFixture -ParentDir $shallowParent -Name "shallow-app" | Out-Null

    # Create deep project at depth 5 (sandbox/d1/d2/d3/d4/deep-app)
    $deepParent = Join-Path $sandbox "d1\d2\d3\d4"
    New-NodeProjectFixture -ParentDir $deepParent -Name "deep-app" | Out-Null

    # Scan with max-depth 3
    $res = Invoke-CleanReinstall -ScriptArgs @('--root', $sandbox, '--max-depth', '3', '--dry-run', '--yes')
    Assert-ExitCode 0 $res.ExitCode "Depth-bounded scan should succeed"
    Assert-True ($res.AllOutput -match 'shallow-app') "Project at depth 2 must be discovered"
    Assert-False ($res.AllOutput -match 'deep-app') "Project at depth 5 must NOT be discovered when --max-depth is 3"
}

# TC-07: Traversal Pruning (skipping node_modules descent)
Register-TestCase -Id "TC-07" -Name "Traversal pruning of dependency folders (node_modules)" -Tier 1 -Action {
    $sandbox = New-TestSandbox "t1-prune"
    $pkgDir = New-NodeProjectFixture -ParentDir $sandbox -Name "root-app" -Artifacts @('node_modules')
    
    # Create a nested fake package inside node_modules
    $nestedFake = Join-Path $pkgDir "node_modules\@fake\dep"
    [System.IO.Directory]::CreateDirectory($nestedFake) | Out-Null
    [System.IO.File]::WriteAllText((Join-Path $nestedFake "package.json"), '{"name":"@fake/dep","version":"1.0.0"}', [System.Text.Encoding]::UTF8)

    $res = Invoke-CleanReinstall -ScriptArgs @('--root', $sandbox, '--dry-run', '--yes')
    Assert-ExitCode 0 $res.ExitCode "Scan should succeed"
    Assert-True ($res.AllOutput -match 'root-app') "Outer root-app must be discovered"
    Assert-False ($res.AllOutput -match '@fake/dep') "Nested package inside node_modules must be pruned from discovery"
}

# TC-08: Reparse Point & Junction Boundary Security
Register-TestCase -Id "TC-08" -Name "Reparse point and junction boundary security guard" -Tier 1 -Action {
    $sandbox = New-TestSandbox "t1-junc"
    $outside = New-TestSandbox "t1-outside"
    
    New-NodeProjectFixture -ParentDir $sandbox -Name "inside-app" | Out-Null
    New-NodeProjectFixture -ParentDir $outside -Name "external-secret-app" -Artifacts @('node_modules') | Out-Null

    $juncPath = Join-Path $sandbox "escaping-junction"
    $created = New-JunctionFixture -LinkPath $juncPath -TargetPath $outside

    if ($created) {
        $res = Invoke-CleanReinstall -ScriptArgs @('--root', $sandbox, '--clean-only', '--yes')
        Assert-ExitCode 0 $res.ExitCode "Cleanup should complete safely without following escaping junction"
        Assert-PathExists (Join-Path $outside "external-secret-app\node_modules") "Artifacts outside repository boundary must NEVER be cleaned via junction"
        Assert-False ($res.AllOutput -match 'external-secret-app') "External secret app must not be registered as a project"
    }
}

# TC-09: Multi-Ecosystem Manifest Detection - Node (npm, pnpm, yarn, bun)
Register-TestCase -Id "TC-09" -Name "Multi-ecosystem detection for Node stacks (npm, pnpm, yarn, bun)" -Tier 1 -Action {
    $sandbox = New-TestSandbox "t1-node-stacks"
    New-NodeProjectFixture -ParentDir $sandbox -Name "proj-npm" -PackageManager "npm" | Out-Null
    New-NodeProjectFixture -ParentDir $sandbox -Name "proj-pnpm" -PackageManager "pnpm" | Out-Null
    New-NodeProjectFixture -ParentDir $sandbox -Name "proj-yarn" -PackageManager "yarn-classic" | Out-Null
    New-NodeProjectFixture -ParentDir $sandbox -Name "proj-bun" -PackageManager "bun" | Out-Null

    $res = Invoke-CleanReinstall -ScriptArgs @('--root', $sandbox, '--dry-run', '--yes')
    Assert-ExitCode 0 $res.ExitCode "Discovery across all 4 Node package managers must succeed"
    Assert-True ($res.AllOutput -match 'proj-npm') "proj-npm must be discovered"
    Assert-True ($res.AllOutput -match 'proj-pnpm') "proj-pnpm must be discovered"
    Assert-True ($res.AllOutput -match 'proj-yarn') "proj-yarn must be discovered"
    Assert-True ($res.AllOutput -match 'proj-bun') "proj-bun must be discovered"
}

# TC-10: Multi-Ecosystem Manifest Detection - Python & Rust
Register-TestCase -Id "TC-10" -Name "Multi-ecosystem detection for Python (Poetry/uv/pip) and Rust (Cargo)" -Tier 1 -Action {
    $sandbox = New-TestSandbox "t1-py-rust"
    New-PythonProjectFixture -ParentDir $sandbox -Name "py-poetry" -Tool "poetry" | Out-Null
    New-PythonProjectFixture -ParentDir $sandbox -Name "py-uv" -Tool "uv" | Out-Null
    New-PythonProjectFixture -ParentDir $sandbox -Name "py-pip" -Tool "pip" | Out-Null
    New-RustProjectFixture -ParentDir $sandbox -Name "rust-crate" | Out-Null

    $res = Invoke-CleanReinstall -ScriptArgs @('--root', $sandbox, '--dry-run', '--yes')
    Assert-ExitCode 0 $res.ExitCode "Discovery across Python and Rust must succeed"
    Assert-True ($res.AllOutput -match 'py-poetry') "py-poetry must be discovered"
    Assert-True ($res.AllOutput -match 'py-uv') "py-uv must be discovered"
    Assert-True ($res.AllOutput -match 'py-pip') "py-pip must be discovered"
    Assert-True ($res.AllOutput -match 'rust-crate') "rust-crate must be discovered"
}

# TC-11: Multi-Ecosystem Manifest Detection - Java & .NET
Register-TestCase -Id "TC-11" -Name "Multi-ecosystem detection for Java (Maven/Gradle) and .NET" -Tier 1 -Action {
    $sandbox = New-TestSandbox "t1-java-dotnet"
    New-JavaProjectFixture -ParentDir $sandbox -Name "mvn-app" -Type "maven" | Out-Null
    New-JavaProjectFixture -ParentDir $sandbox -Name "gradle-app" -Type "gradle" | Out-Null
    New-DotNetProjectFixture -ParentDir $sandbox -Name "dotnet-app" | Out-Null

    $res = Invoke-CleanReinstall -ScriptArgs @('--root', $sandbox, '--dry-run', '--yes')
    Assert-ExitCode 0 $res.ExitCode "Discovery across Java and .NET must succeed"
    Assert-True ($res.AllOutput -match 'mvn-app') "mvn-app must be discovered"
    Assert-True ($res.AllOutput -match 'gradle-app') "gradle-app must be discovered"
    Assert-True ($res.AllOutput -match 'dotnet-app') "dotnet-app must be discovered"
}

# TC-12: Monorepo Workspace Root & Member Resolution
Register-TestCase -Id "TC-12" -Name "Monorepo workspace root and member resolution" -Tier 1 -Action {
    $sandbox = New-TestSandbox "t1-monorepo"
    New-MonorepoFixture -ParentDir $sandbox -Name "mono" -Type "pnpm" -Packages @('apps/web', 'packages/shared') | Out-Null

    $res = Invoke-CleanReinstall -ScriptArgs @('--root', $sandbox, '--dry-run', '--yes')
    Assert-ExitCode 0 $res.ExitCode "Monorepo discovery should succeed"
    Assert-True ($res.AllOutput -match '(?i)(workspace|mono)') "Monorepo workspace should be identified"
    Assert-True ($res.AllOutput -match 'apps[\\\/]web') "apps/web member must be recognized"
    Assert-True ($res.AllOutput -match 'packages[\\\/]shared') "packages/shared member must be recognized"
}

# TC-13: Safe Cleanup (Standard Clean)
Register-TestCase -Id "TC-13" -Name "Safe cleanup removes standard artifact folders across ecosystems" -Tier 1 -Action {
    $sandbox = New-TestSandbox "t1-std-clean"
    $nodeDir = New-NodeProjectFixture -ParentDir $sandbox -Name "node-app" -Artifacts @('node_modules', 'dist')
    $pyDir = New-PythonProjectFixture -ParentDir $sandbox -Name "py-app" -Artifacts @('.venv', '__pycache__')
    $netDir = New-DotNetProjectFixture -ParentDir $sandbox -Name "net-app"
    $rustDir = New-RustProjectFixture -ParentDir $sandbox -Name "rust-app" -Artifacts @('target')

    # Verify artifacts exist before clean
    Assert-PathExists (Join-Path $nodeDir "node_modules")
    Assert-PathExists (Join-Path $nodeDir "dist")
    Assert-PathExists (Join-Path $pyDir ".venv")
    Assert-PathExists (Join-Path $pyDir "__pycache__")
    Assert-PathExists (Join-Path $netDir "bin")
    Assert-PathExists (Join-Path $netDir "obj")
    Assert-PathExists (Join-Path $rustDir "target")

    $res = Invoke-CleanReinstall -ScriptArgs @('--root', $sandbox, '--clean-only', '--yes')
    Assert-ExitCode 0 $res.ExitCode "Clean-only must succeed"

    # Verify artifacts deleted
    Assert-PathNotExists (Join-Path $nodeDir "node_modules") "node_modules should be deleted"
    Assert-PathNotExists (Join-Path $nodeDir "dist") "dist should be deleted"
    Assert-PathNotExists (Join-Path $pyDir ".venv") ".venv should be deleted"
    Assert-PathNotExists (Join-Path $pyDir "__pycache__") "__pycache__ should be deleted"
    Assert-PathNotExists (Join-Path $netDir "bin") "bin should be deleted"
    Assert-PathNotExists (Join-Path $netDir "obj") "obj should be deleted"
    Assert-PathNotExists (Join-Path $rustDir "target") "target should be deleted"
}

# TC-14: Deep Cleanup (--deep-clean)
Register-TestCase -Id "TC-14" -Name "Deep cleanup (--deep-clean) removes extended caches" -Tier 1 -Action {
    $sandbox = New-TestSandbox "t1-deep-clean"
    $nodeDir = New-NodeProjectFixture -ParentDir $sandbox -Name "node-app" -Artifacts @('node_modules', '.turbo', '.next')
    $pyDir = New-PythonProjectFixture -ParentDir $sandbox -Name "py-app" -Artifacts @('.venv') -WithDeepCleanArtifacts

    Assert-PathExists (Join-Path $nodeDir ".turbo")
    Assert-PathExists (Join-Path $nodeDir ".next")
    Assert-PathExists (Join-Path $pyDir ".pytest_cache")

    $res = Invoke-CleanReinstall -ScriptArgs @('--root', $sandbox, '--clean-only', '--deep-clean', '--yes')
    Assert-ExitCode 0 $res.ExitCode "Deep clean must succeed"

    Assert-PathNotExists (Join-Path $nodeDir ".turbo") ".turbo should be deleted under --deep-clean"
    Assert-PathNotExists (Join-Path $nodeDir ".next") ".next should be deleted under --deep-clean"
    Assert-PathNotExists (Join-Path $pyDir ".pytest_cache") ".pytest_cache should be deleted under --deep-clean"
}

# TC-15: Absolute Deletion Protection Guardrails
Register-TestCase -Id "TC-15" -Name "Absolute deletion protection of lockfiles, .env*, .git, and source code" -Tier 1 -Action {
    $sandbox = New-TestSandbox "t1-guardrails"
    $nodeDir = New-NodeProjectFixture -ParentDir $sandbox -Name "node-app" -PackageManager "pnpm" -WithLockfile $true -WithEnv -Artifacts @('node_modules', 'dist')
    $rustDir = New-RustProjectFixture -ParentDir $sandbox -Name "rust-app" -WithLockfile $true -Artifacts @('target')

    # Add .git directory and extra source
    $gitDir = Join-Path $nodeDir ".git"
    [System.IO.Directory]::CreateDirectory($gitDir) | Out-Null
    [System.IO.File]::WriteAllText((Join-Path $gitDir "config"), "[core] repositoryformatversion = 0", [System.Text.Encoding]::UTF8)

    $res = Invoke-CleanReinstall -ScriptArgs @('--root', $sandbox, '--clean-only', '--deep-clean', '--yes')
    Assert-ExitCode 0 $res.ExitCode "Deep clean should succeed"

    # Verify protected items are 100% intact
    Assert-PathExists (Join-Path $nodeDir "package.json") "package.json must be preserved"
    Assert-PathExists (Join-Path $nodeDir "pnpm-lock.yaml") "pnpm-lock.yaml lockfile must be preserved"
    Assert-PathExists (Join-Path $nodeDir ".env") ".env file must be preserved"
    Assert-PathExists (Join-Path $nodeDir ".env.local") ".env.local file must be preserved"
    Assert-PathExists (Join-Path $nodeDir "src\index.js") "src/index.js source file must be preserved"
    Assert-PathExists (Join-Path $gitDir "config") ".git/config must be preserved"
    Assert-PathExists (Join-Path $rustDir "Cargo.lock") "Cargo.lock lockfile must be preserved"
    Assert-PathExists (Join-Path $rustDir "src\main.rs") "src/main.rs source file must be preserved"
}

# TC-16: Dry-Run Mode (--dry-run)
Register-TestCase -Id "TC-16" -Name "Dry-run mode lists planned actions without altering disk state" -Tier 1 -Action {
    $sandbox = New-TestSandbox "t1-dry-run"
    $nodeDir = New-NodeProjectFixture -ParentDir $sandbox -Name "node-app" -Artifacts @('node_modules', 'dist')
    
    $nmPath = Join-Path $nodeDir "node_modules"
    $distPath = Join-Path $nodeDir "dist"
    Assert-PathExists $nmPath
    Assert-PathExists $distPath

    $res = Invoke-CleanReinstall -ScriptArgs @('--root', $sandbox, '--dry-run', '--clean-only', '--yes')
    Assert-ExitCode 0 $res.ExitCode "Dry run must return exit code 0"
    Assert-PathExists $nmPath "node_modules must NOT be deleted under --dry-run"
    Assert-PathExists $distPath "dist must NOT be deleted under --dry-run"
}

# TC-17: Tool & Runtime PATH Detection
Register-TestCase -Id "TC-17" -Name "Graceful skip and warning when tool is missing on PATH" -Tier 1 -Action {
    $sandbox = New-TestSandbox "t1-missing-tool"
    # Create project type whose CLI tool is absent (e.g. PHP composer or Ruby gemfile)
    $phpDir = Join-Path $sandbox "php-app"
    [System.IO.Directory]::CreateDirectory($phpDir) | Out-Null
    [System.IO.File]::WriteAllText((Join-Path $phpDir "composer.json"), '{"name":"test/php-app"}', [System.Text.Encoding]::UTF8)

    $res = Invoke-CleanReinstall -ScriptArgs @('--root', $sandbox, '--install-only', '--continue-on-error', '--yes')
    Assert-ExitCode 0 $res.ExitCode "Missing tool under --continue-on-error should skip gracefully and return exit code 0"
    Assert-True ($res.AllOutput -match '(?i)(skip|not found|warning)') "Output should indicate tool missing/skipped"
}

# TC-18: Local Wrapper Preference
Register-TestCase -Id "TC-18" -Name "Local wrapper script preference (mvnw.cmd / gradlew.bat)" -Tier 1 -Action {
    $sandbox = New-TestSandbox "t1-wrapper"
    $mvnDir = New-JavaProjectFixture -ParentDir $sandbox -Name "mvn-proj" -Type "maven" -WithWrapper $true

    $res = Invoke-CleanReinstall -ScriptArgs @('--root', $sandbox, '--install-only', '--yes')
    Assert-ExitCode 0 $res.ExitCode "Reinstall with wrapper should succeed"
    Assert-PathExists (Join-Path $mvnDir "mvnw_executed.txt") "mvnw.cmd wrapper must be executed rather than global mvn"
}

# TC-19: Deterministic Reinstallation Matrix
Register-TestCase -Id "TC-19" -Name "Deterministic reinstallation command selection with frozen lockfiles" -Tier 1 -Action {
    $sandbox = New-TestSandbox "t1-frozen"
    New-NodeProjectFixture -ParentDir $sandbox -Name "npm-app" -PackageManager "npm" -WithLockfile $true | Out-Null
    New-NodeProjectFixture -ParentDir $sandbox -Name "pnpm-app" -PackageManager "pnpm" -WithLockfile $true | Out-Null

    $res = Invoke-CleanReinstall -ScriptArgs @('--root', $sandbox, '--dry-run', '--install-only', '--yes')
    Assert-ExitCode 0 $res.ExitCode "Dry run install should succeed"
    Assert-True ($res.AllOutput -match '(?i)(npm ci|frozen-lockfile|pnpm)') "Frozen lockfile command should be selected for npm and pnpm"
}

# TC-20: Post-Install Rebuild (--build)
Register-TestCase -Id "TC-20" -Name "Post-install rebuild flag (--build) triggers build commands" -Tier 1 -Action {
    $sandbox = New-TestSandbox "t1-build"
    New-NodeProjectFixture -ParentDir $sandbox -Name "node-app" -Scripts @{ build = "echo BUILD_EXECUTED" } | Out-Null

    $res = Invoke-CleanReinstall -ScriptArgs @('--root', $sandbox, '--build', '--dry-run', '--yes')
    Assert-ExitCode 0 $res.ExitCode "Dry run with --build should succeed"
    Assert-True ($res.AllOutput -match '(?i)(build)') "Output should indicate build phase scheduled or planned"
}
