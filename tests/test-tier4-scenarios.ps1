# ==============================================================================
# tests/test-tier4-scenarios.ps1
# Tier 4: Realistic Polyglot Monorepo Application Scenarios (TC-34 through TC-38)
# Zero external dependencies; compatible with PS 5.1 and PS 7+
# ==============================================================================

Set-StrictMode -Off

# TC-34: Polyglot Monorepo Full Clean & Reinstall
Register-TestCase -Id "TC-34" -Name "Polyglot Monorepo Full Clean & Reinstall (Next.js, Express, Rust, Python)" -Tier 4 -Action {
    $sandbox = New-TestSandbox "t4-polyglot-mono"

    # 1. Root pnpm monorepo with apps/web, apps/api, packages/ui
    $monoRoot = New-MonorepoFixture -ParentDir $sandbox -Name "talentsphere" -Type "pnpm" `
        -Packages @('apps/web', 'apps/api', 'packages/ui') `
        -RootArtifacts @('node_modules', '.turbo') `
        -PackageArtifacts @('node_modules', 'dist')

    # Add .next to apps/web
    $webNext = Join-Path $monoRoot "apps\web\.next"
    [System.IO.Directory]::CreateDirectory($webNext) | Out-Null
    [System.IO.File]::WriteAllText((Join-Path $webNext "build-manifest.json"), "{}", [System.Text.Encoding]::UTF8)

    # 2. Add Rust worker crate inside services/worker
    $servicesDir = Join-Path $monoRoot "services"
    [System.IO.Directory]::CreateDirectory($servicesDir) | Out-Null
    $rustDir = New-RustProjectFixture -ParentDir $servicesDir -Name "worker" -Artifacts @('target')

    # 3. Add Python FastAPI service inside services/ml
    $pyDir = New-PythonProjectFixture -ParentDir $servicesDir -Name "ml" -Tool "poetry" -Artifacts @('.venv', '__pycache__') -WithDeepCleanArtifacts

    # Add sensitive environment files to root and services
    [System.IO.File]::WriteAllText((Join-Path $monoRoot ".env.production"), "DATABASE_URL=postgres://prod_db:secret@prod/db", [System.Text.Encoding]::UTF8)
    [System.IO.File]::WriteAllText((Join-Path $monoRoot "apps\web\.env.local"), "NEXT_PUBLIC_API_URL=https://api.internal", [System.Text.Encoding]::UTF8)

    # Verify initial artifacts exist
    Assert-PathExists (Join-Path $monoRoot "node_modules")
    Assert-PathExists (Join-Path $monoRoot ".turbo")
    Assert-PathExists (Join-Path $monoRoot "apps\web\node_modules")
    Assert-PathExists (Join-Path $monoRoot "apps\web\dist")
    Assert-PathExists $webNext
    Assert-PathExists (Join-Path $rustDir "target")
    Assert-PathExists (Join-Path $pyDir ".venv")
    Assert-PathExists (Join-Path $pyDir "__pycache__")

    # Run clean via batch wrapper
    $res = Invoke-CleanReinstall -UseBatch $true -ScriptArgs @('--root', $monoRoot, '--clean-only', '--deep-clean', '--yes', '--verbose')
    Assert-ExitCode 0 $res.ExitCode "Batch wrapper clean on polyglot monorepo must return exit code 0"

    # Verify all artifacts removed
    Assert-PathNotExists (Join-Path $monoRoot "node_modules") "Root node_modules must be deleted"
    Assert-PathNotExists (Join-Path $monoRoot ".turbo") "Root .turbo must be deleted"
    Assert-PathNotExists (Join-Path $monoRoot "apps\web\node_modules") "Member node_modules must be deleted"
    Assert-PathNotExists (Join-Path $monoRoot "apps\web\dist") "Member dist must be deleted"
    Assert-PathNotExists $webNext "apps/web .next must be deleted"
    Assert-PathNotExists (Join-Path $rustDir "target") "Rust target must be deleted"
    Assert-PathNotExists (Join-Path $pyDir ".venv") "Python .venv must be deleted"
    Assert-PathNotExists (Join-Path $pyDir "__pycache__") "Python __pycache__ must be deleted"

    # Verify 100% preservation of all manifests, lockfiles, environment configs, and sources
    Assert-PathExists (Join-Path $monoRoot "pnpm-lock.yaml") "Root pnpm-lock.yaml must be preserved"
    Assert-PathExists (Join-Path $monoRoot "pnpm-workspace.yaml") "pnpm-workspace.yaml must be preserved"
    Assert-PathExists (Join-Path $monoRoot ".env.production") "Root .env.production must be preserved"
    Assert-PathExists (Join-Path $monoRoot "apps\web\.env.local") "apps/web/.env.local must be preserved"
    Assert-PathExists (Join-Path $rustDir "Cargo.lock") "Rust Cargo.lock must be preserved"
    Assert-PathExists (Join-Path $rustDir "Cargo.toml") "Rust Cargo.toml must be preserved"
    Assert-PathExists (Join-Path $pyDir "poetry.lock") "Python poetry.lock must be preserved"
    Assert-PathExists (Join-Path $pyDir "pyproject.toml") "Python pyproject.toml must be preserved"
}

# TC-35: Enterprise Polyglot Repo with Nested Submodules
Register-TestCase -Id "TC-35" -Name "Enterprise Polyglot Repo with Nested Submodules and Depth Limits" -Tier 4 -Action {
    $sandbox = New-TestSandbox "t4-enterprise-sub"

    # Multi-level repository structure:
    # sandbox/platform/core/node-pkg (depth 3)
    # sandbox/platform/services/py-svc (depth 3)
    # sandbox/legacy/old-app (excluded)
    # sandbox/deep/a/b/c/d/deep-crate (depth 6)

    $coreDir = Join-Path $sandbox "platform\core"
    $svcDir = Join-Path $sandbox "platform\services"
    $legacyDir = Join-Path $sandbox "legacy"
    $deepDir = Join-Path $sandbox "deep\a\b\c\d"

    New-NodeProjectFixture -ParentDir $coreDir -Name "node-core" -Artifacts @('node_modules') | Out-Null
    New-PythonProjectFixture -ParentDir $svcDir -Name "py-svc" -Artifacts @('.venv') | Out-Null
    New-NodeProjectFixture -ParentDir $legacyDir -Name "legacy-app" -Artifacts @('node_modules') | Out-Null
    New-RustProjectFixture -ParentDir $deepDir -Name "deep-crate" -Artifacts @('target') | Out-Null

    # Run with max-depth 4 and exclude legacy
    $res = Invoke-CleanReinstall -ScriptArgs @('--root', $sandbox, '--max-depth', '4', '--exclude', '*legacy*', '--clean-only', '--yes')
    Assert-ExitCode 0 $res.ExitCode

    # node-core and py-svc at depth 3 must be cleaned
    Assert-PathNotExists (Join-Path $coreDir "node-core\node_modules") "node-core should be cleaned"
    Assert-PathNotExists (Join-Path $svcDir "py-svc\.venv") "py-svc should be cleaned"

    # legacy-app must be untouched due to exclude
    Assert-PathExists (Join-Path $legacyDir "legacy-app\node_modules") "legacy-app should be preserved by --exclude"

    # deep-crate beyond depth 4 must be untouched
    Assert-PathExists (Join-Path $deepDir "deep-crate\target") "deep-crate beyond max-depth 4 must be untouched"
}

# TC-36: Full Pipeline with --build and Wrapper Scripts
Register-TestCase -Id "TC-36" -Name "Full Pipeline with --build, Local Wrappers, and Streaming Output" -Tier 4 -Action {
    $sandbox = New-TestSandbox "t4-pipeline"

    # Java project with mock mvnw.cmd wrapper
    $javaProj = New-JavaProjectFixture -ParentDir $sandbox -Name "backend-api" -Type "maven" -WithWrapper $true
    
    # Node project with mock build script
    $nodeProj = New-NodeProjectFixture -ParentDir $sandbox -Name "frontend" -Scripts @{ build = "echo MOCK_FRONTEND_BUILD" }

    $res = Invoke-CleanReinstall -ScriptArgs @('--root', $sandbox, '--build', '--yes', '--verbose')
    Assert-ExitCode 0 $res.ExitCode "Pipeline run should succeed"

    # Assert wrapper was called
    Assert-PathExists (Join-Path $javaProj "mvnw_executed.txt") "mvnw.cmd must have been executed by the reinstallation engine"
}

# TC-37: Safety Attack Vectors in Enterprise Multi-Language Repo
Register-TestCase -Id "TC-37" -Name "Safety Attack Vectors (escaping junctions, read-only artifacts, .env protections)" -Tier 4 -Action {
    $sandbox = New-TestSandbox "t4-attack-vectors"
    $externalSecret = New-TestSandbox "t4-secret-vault"

    # Setup secret vault outside sandbox
    [System.IO.File]::WriteAllText((Join-Path $externalSecret "company_secrets.key"), "SUPER_CONFIDENTIAL_KEY", [System.Text.Encoding]::UTF8)

    # Project inside sandbox
    $appDir = New-NodeProjectFixture -ParentDir $sandbox -Name "web-app" -Artifacts @('node_modules') -WithEnv

    # 1. Create escaping junction pointing to external secret vault
    $juncDir = Join-Path $sandbox "vault-junction"
    New-JunctionFixture -LinkPath $juncDir -TargetPath $externalSecret | Out-Null

    # 2. Add read-only file inside node_modules
    $roFile = Join-Path $appDir "node_modules\readonly-cache.dat"
    [System.IO.File]::WriteAllText($roFile, "cached data", [System.Text.Encoding]::UTF8)
    (Get-Item $roFile).Attributes = [System.IO.FileAttributes]::ReadOnly

    # Execute clean
    $res = Invoke-CleanReinstall -ScriptArgs @('--root', $sandbox, '--clean-only', '--yes')
    Assert-ExitCode 0 $res.ExitCode

    # Assertions:
    # External secret vault MUST NOT be touched
    Assert-PathExists (Join-Path $externalSecret "company_secrets.key") "External secret vault MUST NOT be modified or deleted"
    # Internal node_modules MUST be deleted despite read-only file
    Assert-PathNotExists (Join-Path $appDir "node_modules") "Internal node_modules must be deleted"
    # Internal .env MUST be preserved
    Assert-PathExists (Join-Path $appDir ".env") ".env file must be preserved"
    Assert-PathExists (Join-Path $appDir ".env.local") ".env.local file must be preserved"
}

# TC-38: Mega Monorepo Deep Cache Clearance and Clean Rebuild
Register-TestCase -Id "TC-38" -Name "Mega Monorepo Deep Cache Clearance (.turbo, .next, .venv, target)" -Tier 4 -Action {
    $sandbox = New-TestSandbox "t4-mega-mono"

    # Create root monorepo
    $monoRoot = New-MonorepoFixture -ParentDir $sandbox -Name "enterprise-mono" -Type "pnpm" `
        -Packages @('apps/portal', 'apps/admin', 'packages/sdk', 'packages/tokens') `
        -RootArtifacts @('node_modules', '.turbo', '.cache') `
        -PackageArtifacts @('node_modules', 'dist')

    # Add deep caches to members
    $portalNext = Join-Path $monoRoot "apps\portal\.next"
    $adminNext = Join-Path $monoRoot "apps\admin\.next"
    [System.IO.Directory]::CreateDirectory($portalNext) | Out-Null
    [System.IO.Directory]::CreateDirectory($adminNext) | Out-Null
    [System.IO.File]::WriteAllText((Join-Path $portalNext "trace"), "next trace", [System.Text.Encoding]::UTF8)
    [System.IO.File]::WriteAllText((Join-Path $adminNext "trace"), "next trace", [System.Text.Encoding]::UTF8)

    # Add Python service with deep caches
    $pySvc = New-PythonProjectFixture -ParentDir (Join-Path $monoRoot "services") -Name "analytics" -Tool "uv" -WithDeepCleanArtifacts

    # Add Rust service
    $rustSvc = New-RustProjectFixture -ParentDir (Join-Path $monoRoot "services") -Name "indexer" -Artifacts @('target')

    # Run clean-only with deep-clean
    $res = Invoke-CleanReinstall -ScriptArgs @('--root', $monoRoot, '--clean-only', '--deep-clean', '--yes')
    Assert-ExitCode 0 $res.ExitCode "Mega monorepo clean must succeed"

    # Verify deep caches cleared across the entire repository
    Assert-PathNotExists (Join-Path $monoRoot ".turbo")
    Assert-PathNotExists (Join-Path $monoRoot ".cache")
    Assert-PathNotExists $portalNext
    Assert-PathNotExists $adminNext
    Assert-PathNotExists (Join-Path $pySvc ".pytest_cache")
    Assert-PathNotExists (Join-Path $pySvc ".venv")
    Assert-PathNotExists (Join-Path $rustSvc "target")

    # Verify all project manifests remain intact
    Assert-PathExists (Join-Path $monoRoot "pnpm-workspace.yaml")
    Assert-PathExists (Join-Path $monoRoot "apps\portal\package.json")
    Assert-PathExists (Join-Path $monoRoot "apps\admin\package.json")
    Assert-PathExists (Join-Path $monoRoot "packages\sdk\package.json")
    Assert-PathExists (Join-Path $monoRoot "packages\tokens\package.json")
    Assert-PathExists (Join-Path $pySvc "pyproject.toml")
    Assert-PathExists (Join-Path $rustSvc "Cargo.toml")
}
