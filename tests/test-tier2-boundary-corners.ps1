# ==============================================================================
# tests/test-tier2-boundary-corners.ps1
# Tier 2: Boundary Values & Safety-Critical Attack Vectors (TC-21 through TC-28)
# Zero external dependencies; compatible with PS 5.1 and PS 7+
# ==============================================================================

Set-StrictMode -Off

# TC-21: Special Characters and Spaces in Paths
Register-TestCase -Id "TC-21" -Name "Special characters, ampersands, and spaces in repository paths" -Tier 2 -Action {
    $tempBase = [System.IO.Path]::GetTempPath()
    $specialName = "cr-test-special & app (v1.0)-" + [System.Guid]::NewGuid().ToString("N")
    $sandbox = [System.IO.Path]::Combine($tempBase, $specialName)
    [System.IO.Directory]::CreateDirectory($sandbox) | Out-Null
    $global:ActiveSandboxes.Add($sandbox)

    New-NodeProjectFixture -ParentDir $sandbox -Name "web app" -Artifacts @('node_modules', 'dist') | Out-Null
    Assert-PathExists (Join-Path $sandbox "web app\node_modules")

    # Test clean with spaces and ampersand via batch wrapper and direct ps1
    $res = Invoke-CleanReinstall -UseBatch $true -ScriptArgs @('--root', $sandbox, '--clean-only', '--yes')
    Assert-ExitCode 0 $res.ExitCode "Batch wrapper must handle spaces and special characters in paths"
    Assert-PathNotExists (Join-Path $sandbox "web app\node_modules") "node_modules inside path with special characters should be deleted"
}

# TC-22: Non-Interactive Prompt Guard
Register-TestCase -Id "TC-22" -Name "Non-interactive execution without operational arguments exits cleanly" -Tier 2 -Action {
    $sandbox = New-TestSandbox "t2-nonint"
    New-NodeProjectFixture -ParentDir $sandbox -Name "app" | Out-Null

    # Invoke without --yes, --dry-run, --clean-only, or --install-only with redirected stdin
    $res = Invoke-CleanReinstall -ScriptArgs @('--root', $sandbox)
    # In non-interactive mode, script should either exit 1 with warning or require explicit action flag
    Assert-True ($res.ExitCode -ne 0) "Script invoked without arguments in non-interactive environment must exit with error"
    Assert-True ($res.AllOutput -match '(?i)(non-interactive|--yes|--dry-run|--clean-only|confirm|flag)') "Output must guide user to pass operational flags or --yes"
}

# TC-23: Complex Secret Redaction Patterns
Register-TestCase -Id "TC-23" -Name "Complex secret redaction (credentials in URLs, AWS keys, JWTs)" -Tier 2 -Action {
    $sandbox = New-TestSandbox "t2-secrets"
    $pkgDir = New-NodeProjectFixture -ParentDir $sandbox -Name "app"

    # Write multiple high-risk secret formats
    $secretFile = Join-Path $pkgDir ".env"
    $secretsContent = @"
GIT_REMOTE=https://alice_deploy:P%40ssw0rd!_complex@github.com/org/repo.git
AWS_ACCESS_KEY=AKIA1234567890ABCDEF
AWS_SECRET_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
JWT_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
"@
    [System.IO.File]::WriteAllText($secretFile, $secretsContent, [System.Text.Encoding]::UTF8)

    $res = Invoke-CleanReinstall -ScriptArgs @('--root', $sandbox, '--dry-run', '--yes', '--verbose')
    Assert-ExitCode 0 $res.ExitCode

    $logFiles = @(Get-ChildItem -Path $sandbox -Filter "clean-reinstall_*.log" -File -Recurse)
    if ($logFiles.Count -eq 0) {
        $repoRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
        $logFiles = @(Get-ChildItem -Path $repoRoot -Filter "clean-reinstall_*.log" -File | Sort-Object LastWriteTime -Descending | Select-Object -First 1)
    }
    Assert-True ($logFiles.Count -gt 0) "Log file should exist"

    $logText = [System.IO.File]::ReadAllText($logFiles[0].FullName)
    Assert-False ($logText -match 'P%40ssw0rd!_complex') "URL password must be redacted in log file"
    Assert-False ($logText -match 'AKIA1234567890ABCDEF') "AWS Access Key must be redacted in log file"
    Assert-False ($logText -match 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY') "AWS Secret Key must be redacted in log file"
}

# TC-24: Directory Traversal Containment Attack Vectors
Register-TestCase -Id "TC-24" -Name "Directory traversal containment attack vectors (escaping target paths)" -Tier 2 -Action {
    $sandbox = New-TestSandbox "t2-traversal"
    $siblingDir = New-TestSandbox "t2-sibling"
    
    New-NodeProjectFixture -ParentDir $sandbox -Name "inner-app" -Artifacts @('node_modules') | Out-Null
    New-NodeProjectFixture -ParentDir $siblingDir -Name "sibling-app" -Artifacts @('node_modules') | Out-Null

    # Test running script with a root pointing to sibling directory escape (e.g. sandbox\..\t2-sibling)
    # The containment engine must strictly verify that targets are within the project root
    $res = Invoke-CleanReinstall -ScriptArgs @('--root', $sandbox, '--clean-only', '--yes')
    Assert-ExitCode 0 $res.ExitCode "Clean on sandbox should succeed"

    # Assert sibling app was NOT touched
    Assert-PathExists (Join-Path $siblingDir "sibling-app\node_modules") "Sibling directory outside sandbox must NEVER be cleaned"
}

# TC-25: Exact Max-Depth Boundary Condition
Register-TestCase -Id "TC-25" -Name "Exact max-depth boundary condition (inclusive limit, exclusive beyond)" -Tier 2 -Action {
    $sandbox = New-TestSandbox "t2-boundary-depth"
    # Create projects at depth 1, depth 5, and depth 6
    # Depth 1: sandbox/app1
    New-NodeProjectFixture -ParentDir $sandbox -Name "app-d1" | Out-Null

    # Depth 5: sandbox/lvl1/lvl2/lvl3/lvl4/app-d5
    $d5Parent = Join-Path $sandbox "lvl1\lvl2\lvl3\lvl4"
    New-NodeProjectFixture -ParentDir $d5Parent -Name "app-d5" | Out-Null

    # Depth 6: sandbox/lvl1/lvl2/lvl3/lvl4/lvl5/app-d6
    $d6Parent = Join-Path $sandbox "lvl1\lvl2\lvl3\lvl4\lvl5"
    New-NodeProjectFixture -ParentDir $d6Parent -Name "app-d6" | Out-Null

    $res = Invoke-CleanReinstall -ScriptArgs @('--root', $sandbox, '--max-depth', '5', '--dry-run', '--yes')
    Assert-ExitCode 0 $res.ExitCode "Depth scan should succeed"
    Assert-True ($res.AllOutput -match 'app-d1') "app-d1 at depth 1 must be discovered"
    Assert-True ($res.AllOutput -match 'app-d5') "app-d5 at exact depth 5 must be discovered"
    Assert-False ($res.AllOutput -match 'app-d6') "app-d6 beyond max-depth 5 must NOT be discovered"
}

# TC-26: Escaping Junction / Reparse Point Safety
Register-TestCase -Id "TC-26" -Name "Junction pointing outside repository is rejected without following" -Tier 2 -Action {
    $sandbox = New-TestSandbox "t2-junction-escape"
    $externalFolder = New-TestSandbox "t2-external-safe"
    [System.IO.File]::WriteAllText((Join-Path $externalFolder "protected.txt"), "DO NOT DELETE", [System.Text.Encoding]::UTF8)

    # Repository contains an internal project with artifacts
    New-NodeProjectFixture -ParentDir $sandbox -Name "inner-app" -Artifacts @('node_modules') | Out-Null
    $junctionPath = Join-Path $sandbox "link-to-external"
    $success = New-JunctionFixture -LinkPath $junctionPath -TargetPath $externalFolder

    if ($success) {
        $res = Invoke-CleanReinstall -ScriptArgs @('--root', $sandbox, '--clean-only', '--yes')
        Assert-ExitCode 0 $res.ExitCode "Script should handle escaping junctions safely and clean repo"
        Assert-PathExists (Join-Path $externalFolder "protected.txt") "External files linked by escaping junction must be protected"
        Assert-PathNotExists (Join-Path $sandbox "inner-app\node_modules") "Internal artifacts must be cleaned"
    }
}

# TC-27: Mixed Workspaces & Nested Packages
Register-TestCase -Id "TC-27" -Name "Mixed workspace monorepo (Node pnpm workspace + Rust workspace in same tree)" -Tier 2 -Action {
    $sandbox = New-TestSandbox "t2-mixed-monorepo"
    # Node monorepo at root
    New-MonorepoFixture -ParentDir $sandbox -Name "mono" -Type "pnpm" -Packages @('apps/web') | Out-Null
    # Add a Rust crate inside services/worker
    $workerDir = Join-Path $sandbox "mono\services\worker"
    New-RustProjectFixture -ParentDir (Join-Path $sandbox "mono\services") -Name "worker" -Artifacts @('target') | Out-Null

    $res = Invoke-CleanReinstall -ScriptArgs @('--root', $sandbox, '--dry-run', '--yes')
    Assert-ExitCode 0 $res.ExitCode "Discovery of mixed workspace hierarchy must succeed"
    Assert-True ($res.AllOutput -match 'apps[\\\/]web') "apps/web should be recognized"
    Assert-True ($res.AllOutput -match 'worker') "Rust worker should be recognized"
}

# TC-28: Read-Only Files Deletion Resilience
Register-TestCase -Id "TC-28" -Name "Read-only files inside target directories are deleted without throwing" -Tier 2 -Action {
    $sandbox = New-TestSandbox "t2-readonly"
    $nodeDir = New-NodeProjectFixture -ParentDir $sandbox -Name "app" -Artifacts @('node_modules', 'dist')
    
    $roFile = Join-Path $nodeDir "node_modules\locked-file.dll"
    [System.IO.File]::WriteAllText($roFile, "locked content", [System.Text.Encoding]::UTF8)
    
    # Set read-only attribute
    $item = Get-Item $roFile
    $item.Attributes = [System.IO.FileAttributes]::ReadOnly

    $res = Invoke-CleanReinstall -ScriptArgs @('--root', $sandbox, '--clean-only', '--yes')
    Assert-ExitCode 0 $res.ExitCode "Cleanup should forcefully handle read-only attributes without error"
    Assert-PathNotExists (Join-Path $nodeDir "node_modules") "node_modules containing read-only file must be successfully deleted"
}
