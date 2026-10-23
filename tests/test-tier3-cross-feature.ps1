# ==============================================================================
# tests/test-tier3-cross-feature.ps1
# Tier 3: Pairwise Cross-Feature Combination Tests (TC-29 through TC-33)
# Zero external dependencies; compatible with PS 5.1 and PS 7+
# ==============================================================================

Set-StrictMode -Off

# TC-29: Monorepo + --dry-run + --yes
Register-TestCase -Id "TC-29" -Name "Monorepo combined with --dry-run and --yes" -Tier 3 -Action {
    $sandbox = New-TestSandbox "t3-mono-dryrun"
    $monoRoot = New-MonorepoFixture -ParentDir $sandbox -Name "mono" -Type "pnpm" -Packages @('apps/web', 'apps/api', 'packages/core')
    
    $webNm = Join-Path $monoRoot "apps\web\node_modules"
    $apiDist = Join-Path $monoRoot "apps\api\dist"
    $rootTurbo = Join-Path $monoRoot ".turbo"
    Assert-PathExists $webNm
    Assert-PathExists $apiDist
    Assert-PathExists $rootTurbo

    $res = Invoke-CleanReinstall -ScriptArgs @('--root', $monoRoot, '--dry-run', '--yes', '--verbose')
    Assert-ExitCode 0 $res.ExitCode "Dry run on monorepo must return exit code 0"

    # All files and directories must remain intact
    Assert-PathExists $webNm "Member node_modules must remain intact under --dry-run"
    Assert-PathExists $apiDist "Member dist must remain intact under --dry-run"
    Assert-PathExists $rootTurbo "Root .turbo must remain intact under --dry-run"

    # Output should reflect all 3 members and workspace root
    Assert-True ($res.AllOutput -match 'web') "apps/web must be in planned summary"
    Assert-True ($res.AllOutput -match 'api') "apps/api must be in planned summary"
    Assert-True ($res.AllOutput -match 'core') "packages/core must be in planned summary"
}

# TC-30: --clean-only + --deep-clean Across Polyglot Projects
Register-TestCase -Id "TC-30" -Name "--clean-only paired with --deep-clean across polyglot projects" -Tier 3 -Action {
    $sandbox = New-TestSandbox "t3-clean-deep"
    $nodeDir = New-NodeProjectFixture -ParentDir $sandbox -Name "node-svc" -Artifacts @('node_modules', '.turbo', '.next', 'dist')
    $pyDir = New-PythonProjectFixture -ParentDir $sandbox -Name "py-svc" -Artifacts @('.venv', '__pycache__') -WithDeepCleanArtifacts
    $rustDir = New-RustProjectFixture -ParentDir $sandbox -Name "rust-svc" -Artifacts @('target')

    $res = Invoke-CleanReinstall -ScriptArgs @('--root', $sandbox, '--clean-only', '--deep-clean', '--yes')
    Assert-ExitCode 0 $res.ExitCode "Combined --clean-only and --deep-clean must return exit code 0"

    # Standard and deep artifacts must be purged
    Assert-PathNotExists (Join-Path $nodeDir "node_modules") "node_modules must be deleted"
    Assert-PathNotExists (Join-Path $nodeDir ".turbo") ".turbo must be deleted under --deep-clean"
    Assert-PathNotExists (Join-Path $nodeDir ".next") ".next must be deleted under --deep-clean"
    Assert-PathNotExists (Join-Path $nodeDir "dist") "dist must be deleted"
    Assert-PathNotExists (Join-Path $pyDir ".venv") ".venv must be deleted"
    Assert-PathNotExists (Join-Path $pyDir "__pycache__") "__pycache__ must be deleted"
    Assert-PathNotExists (Join-Path $pyDir ".pytest_cache") ".pytest_cache must be deleted under --deep-clean"
    Assert-PathNotExists (Join-Path $rustDir "target") "target must be deleted"

    # Lockfiles and sources must remain
    Assert-PathExists (Join-Path $nodeDir "package.json")
    Assert-PathExists (Join-Path $pyDir "pyproject.toml")
    Assert-PathExists (Join-Path $rustDir "Cargo.toml")
}

# TC-31: Safety Containment under --dry-run and --deep-clean
Register-TestCase -Id "TC-31" -Name "Safety containment cannot be bypassed by --dry-run or --deep-clean" -Tier 3 -Action {
    # Verify drive root rejection even when --dry-run is supplied
    $resDry = Invoke-CleanReinstall -ScriptArgs @('--root', 'C:\', '--dry-run', '--yes')
    Assert-True ($resDry.ExitCode -ne 0) "Drive root 'C:\' must be rejected even under --dry-run"

    # Verify system dir rejection even when --deep-clean is supplied
    $sysDir = $env:SystemRoot
    if ($sysDir) {
        $resDeep = Invoke-CleanReinstall -ScriptArgs @('--root', $sysDir, '--deep-clean', '--yes')
        Assert-True ($resDeep.ExitCode -ne 0) "System directory must be rejected even under --deep-clean"
    }
}

# TC-32: Monorepo with --exclude and --clean-only
Register-TestCase -Id "TC-32" -Name "Monorepo with --exclude pattern and --clean-only" -Tier 3 -Action {
    $sandbox = New-TestSandbox "t3-mono-exclude"
    $monoRoot = New-MonorepoFixture -ParentDir $sandbox -Name "mono" -Type "pnpm" -Packages @('apps/web', 'apps/api', 'packages/shared')

    $webNm = Join-Path $monoRoot "apps\web\node_modules"
    $apiNm = Join-Path $monoRoot "apps\api\node_modules"
    $sharedNm = Join-Path $monoRoot "packages\shared\node_modules"

    Assert-PathExists $webNm
    Assert-PathExists $apiNm
    Assert-PathExists $sharedNm

    # Run clean-only excluding apps/api
    $res = Invoke-CleanReinstall -ScriptArgs @('--root', $monoRoot, '--exclude', '*api*', '--clean-only', '--yes')
    Assert-ExitCode 0 $res.ExitCode "Clean with exclude should return exit code 0"

    # apps/web and packages/shared should be cleaned
    Assert-PathNotExists $webNm "apps/web node_modules should be cleaned"
    Assert-PathNotExists $sharedNm "packages/shared node_modules should be cleaned"

    # apps/api MUST be preserved
    Assert-PathExists $apiNm "apps/api node_modules must be preserved due to --exclude"
}

# TC-33: --continue-on-error Across Multiple Projects
Register-TestCase -Id "TC-33" -Name "--continue-on-error continues processing independent projects upon error" -Tier 3 -Action {
    $sandbox = New-TestSandbox "t3-cont-error"
    # Project 1: valid Node project with node_modules
    $nodeDir = New-NodeProjectFixture -ParentDir $sandbox -Name "valid-node" -Artifacts @('node_modules')
    
    # Project 2: project with missing tool (e.g. ruby or composer)
    $rubyDir = Join-Path $sandbox "ruby-app"
    [System.IO.Directory]::CreateDirectory($rubyDir) | Out-Null
    [System.IO.File]::WriteAllText((Join-Path $rubyDir "Gemfile"), "source 'https://rubygems.org'`ngem 'rails'", [System.Text.Encoding]::UTF8)

    $res = Invoke-CleanReinstall -ScriptArgs @('--root', $sandbox, '--continue-on-error', '--clean-only', '--yes')
    Assert-ExitCode 0 $res.ExitCode "Execution under --continue-on-error should finish cleanly"

    # Valid project should have been cleaned
    Assert-PathNotExists (Join-Path $nodeDir "node_modules") "valid-node node_modules should be cleaned"
}
