# Handoff Report: Adversarial Security & Edge-Case Review (Reviewer 2)

## 1. Observation

### Codebase Observations
1. **Entry Point (`clean-reinstall.bat`)**:
   - Location: lines 1-28.
   - Detects `pwsh.exe` vs `powershell.exe`, executes `clean-reinstall.ps1` with `-NoProfile -ExecutionPolicy Bypass -File "%PS_SCRIPT%" %*`, and forwards `%ERRORLEVEL%`. Quotes paths and handles spaces in `%SCRIPT_DIR%`.
2. **Path Containment (`clean-reinstall.ps1`)**:
   - `Test-SafePathContainment` (lines 139-222):
     - Canonicalizes paths via `[System.IO.Path]::GetFullPath($Path).TrimEnd('\', '/')`.
     - Validates `$canonicalTarget.StartsWith($canonicalRoot + '\')`.
     - Verifies `$canonicalTarget -ne $canonicalRoot`.
     - Forbids root drives (`$canonicalTarget.Length -le 3` or `.Equals($rootDrive)`).
     - Protected manifest and lockfile blacklist (lines 192-208) prevents deleting lockfiles, configs, and source directories.
3. **Reparse Points and Junctions (`clean-reinstall.ps1`)**:
   - Lines 522-552 in `Get-DiscoveredProjects`:
     - Checks `[System.IO.FileAttributes]::ReparsePoint`.
     - Checks target path: if target escapes `$canonicalRoot`, logs warning and skips traversal (`continue`).
     - If reparse point is internal, logs debug and skips traversal to prevent circular loops.
4. **Secret Redaction Subsystem (`clean-reinstall.ps1`)**:
   - Lines 74-102:
     - Regex patterns cover NPM tokens (`//registry.npmjs.org/:_authToken=`), GitHub PATs (`ghp_*`, `github_pat_*`), Authorization Bearer tokens, AWS keys (`AKIA*`), URL basic auth credentials (`https://user:pass@host`), and JWTs (`eyJ...`).
     - Used in `Write-LogMessage` (line 114) and during real-time child process stream capture in `Invoke-ToolCommand` (line 856).
5. **Non-Interactive Confirmation Guard (`clean-reinstall.ps1`)**:
   - Lines 1264-1274:
     - Evaluates `$isInteractive = [Environment]::UserInteractive -and -not [Console]::IsInputRedirected`.
     - If invoked without operational arguments or `--yes` in a non-interactive shell, outputs an error and immediately exits with code 1 instead of prompting or hanging.
6. **E2E Test Suite Run (`tests/run-tests.ps1`)**:
   - Command: `powershell.exe -ExecutionPolicy Bypass -NoProfile -File tests/run-tests.ps1`
   - Result: 38/38 tests PASSED (Tier 1: 20/20, Tier 2: 8/8, Tier 3: 5/5, Tier 4: 5/5).
   - Execution Duration: 227.10s.
   - Exit code: 0.
7. **Adversarial Defect 1: Empty Repository Handling (`clean-reinstall.ps1`)**:
   - Location: `clean-reinstall.ps1` line 703 (`Invoke-SafeClean`) and line 884 (`Invoke-ReinstallAndBuild`).
   - Signature: `[Parameter(Mandatory=$true)][object[]]$Projects`.
   - Verbatim error reproduced when scanning an empty repository (`--clean-only --yes`):
     ```
     System.Management.Automation.ParameterBindingValidationException: Cannot bind argument to parameter 'Projects' because it is an empty array.
     At clean-reinstall.ps1:1295 char:43
     + $cleanSummary = Invoke-SafeClean -Projects $discoveredProjects ...
     ```
   - In `--dry-run`, this throws an unhandled `ParameterBindingValidationException` terminating the script.
   - In default, `--clean-only`, or `--install-only`, the try/catch sets `$hasErrors = $true` and exits with code 1 ("Clean & Reinstall completed with ERRORS.").
8. **Adversarial Defect 2: System Directory Subpath Bypass (`clean-reinstall.ps1`)**:
   - Location: `clean-reinstall.ps1` lines 174 and 1232.
   - Code:
     ```powershell
     foreach ($sysDir in $systemDirs) {
         if ($canonicalRoot.Equals($sysDir, [System.StringComparison]::OrdinalIgnoreCase)) { ... }
     }
     ```
   - Verbatim observation when running against `C:\Windows\System32`:
     Target Root `C:\Windows\System32` was accepted without error and directory scanning proceeded into `C:\Windows\System32`. The guard only checked exact equality against `C:\Windows`, allowing subdirectories of `C:\Windows`, `C:\Program Files`, and `C:\ProgramData` to bypass root guardrails.

---

## 2. Logic Chain

1. **Path Containment & Reparse Points**:
   - By enforcing `[System.IO.Path]::GetFullPath` on both target and root, directory traversal sequences (`..`, `.\`) are fully resolved prior to containment checks.
   - Because `$canonicalTarget.StartsWith($canonicalRoot + '\')` requires a strict child relationship, any relative attempt to escape to a sibling or parent folder fails the check.
   - By inspecting `[System.IO.FileAttributes]::ReparsePoint` and resolving junction/symlink targets, junctions pointing outside repository boundaries are identified and pruned prior to descent.
   - In `Invoke-SafeClean`, containment is verified a second time prior to deletion.
2. **Secret Redaction**:
   - Regex masking intercepts text before logging to disk or console. Child process execution pipes `2>&1` into `Sanitize-Text`, redacting credentials emitted by tools like npm or git.
3. **Non-Interactive Execution**:
   - Using `[Console]::IsInputRedirected` and `[Environment]::UserInteractive`, redirected standard input (pipes, CI/CD, batch runners) is detected. If arguments requiring user confirmation are missing, the script halts with code 1 rather than hanging indefinitely on `Read-Host`.
4. **Root Cause Analysis of Defect 1 (Empty Repositories)**:
   - When a repository has zero recognized manifests, `Get-DiscoveredProjects` returns `@()`.
   - In PowerShell, passing `@()` to a function parameter marked `[Parameter(Mandatory=$true)]` causes PowerShell's engine to fail parameter binding with `ParameterBindingValidationException`.
   - Main orchestrator dispatch (lines 1291-1324) does not check `if ($discoveredProjects.Count -eq 0)` before calling `Invoke-SafeClean` or `Invoke-ReinstallAndBuild`.
   - Consequently, clean-reinstall fails when run on any empty repository or non-manifest folder.
5. **Root Cause Analysis of Defect 2 (System Directory Subpaths)**:
   - Lines 174 and 1232 test `$canonicalRoot.Equals($sysDir)` and `$canonicalTarget.Equals($sysDir)`.
   - While `C:\Windows` matches `$env:SystemRoot`, `C:\Windows\System32` does not equal `C:\Windows`.
   - For system directories (`$env:SystemRoot`, `$env:ProgramFiles`, `${env:ProgramFiles(x86)}`, `$env:ProgramData`), protection must encompass both the root directory and all its descendants (`.Equals($sysDir) -or .StartsWith($sysDir + '\')`).

---

## 3. Caveats

- Testing was performed on Windows 11 with Windows PowerShell 5.1 and PowerShell Core 7+.
- Network drive UNC paths (`\\server\share`) and Windows Alternate Data Streams (ADS) were not evaluated as attack vectors.
- No source code modifications were made during this review, respecting the reviewer-only constraint.

---

## 4. Conclusion & Verdict

**Verdict: REQUEST_CHANGES**

### Integrity Check
- Hardcoded test results / expected outputs embedded in source: NONE.
- Dummy or facade implementations: NONE.
- Shortcuts bypassing core work: NONE.
- Fabricated verification outputs: NONE.
- Self-certifying work without genuine verification: NONE.
- **Integrity Status: PASSED (No integrity violations detected).**

The architecture, modular design, and test coverage across 38 E2E test cases are high quality. However, two major edge cases must be remediated before production release:
1. **Empty / Non-Manifest Directory Scan Failure**: Fix parameter binding on `Invoke-SafeClean` / `Invoke-ReinstallAndBuild` or short-circuit execution when `$discoveredProjects.Count -eq 0`.
2. **System Directory Subpath Bypass**: Extend system directory protection to include subdirectories for `SystemRoot`, `ProgramFiles`, `ProgramFiles(x86)`, and `ProgramData`.

---

## 5. Verification Method

To verify the test suite:
```powershell
powershell.exe -ExecutionPolicy Bypass -NoProfile -File tests/run-tests.ps1
```

To verify the two identified edge-case defects:
```powershell
# 1. Reproduce Defect 1 (Empty Repository Failure)
$tempEmpty = Join-Path $env:TEMP ("empty-test-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $tempEmpty | Out-Null
.\clean-reinstall.bat --root $tempEmpty --clean-only --yes
# Current Behavior: Exits with code 1 and "Clean & Reinstall completed with ERRORS."
# Expected Behavior: Discovers 0 projects and exits cleanly with code 0.

# 2. Reproduce Defect 2 (System Directory Subpath Bypass)
.\clean-reinstall.bat --root "C:\Windows\System32" --dry-run --yes
# Current Behavior: Begins scanning C:\Windows\System32
# Expected Behavior: Immediately halts with "FATAL: Targeted root is a critical Windows system directory." and exits with code 1.
```

---

## Detailed Findings & Fix Recommendations

### Finding 1 [Major]: Parameter Binding Failure on Empty Projects Array
- **Location**: `clean-reinstall.ps1`, lines 703, 884, and 1291-1324.
- **Problem**:
  In `Invoke-SafeClean` and `Invoke-ReinstallAndBuild`, `$Projects` is marked `[Parameter(Mandatory=$true)][object[]]$Projects`. Passing `@()` throws `ParameterBindingValidationException`.
- **Suggested Fix**:
  1. Remove `Mandatory=$true` or add default value:
     ```powershell
     [Parameter(Mandatory=$false)][object[]]$Projects = @()
     ```
  2. In main execution (line 1256), short-circuit if `$discoveredProjects.Count -eq 0`:
     ```powershell
     if ($discoveredProjects.Count -eq 0) {
         Write-LogMessage "No supported projects discovered across '$canonicalRoot'." -Level INFO
         Write-Host "No projects discovered." -ForegroundColor Yellow
         exit 0
     }
     ```

### Finding 2 [Major]: System Directory Guardrails Do Not Block Subdirectories
- **Location**: `clean-reinstall.ps1`, lines 163-177 and 1221-1236.
- **Problem**:
  The system directory guardrail checks only exact equality (`$canonicalRoot.Equals($sysDir)`). Subdirectories of system folders (`C:\Windows\System32`, `C:\Program Files\...`, `C:\ProgramData\...`) bypass the check.
- **Suggested Fix**:
  Distinguish between system directory roots (where all subfolders are protected) and user profile (where only the profile root itself is protected):
  ```powershell
  $strictSystemDirs = @(
      $env:SystemRoot,
      $env:ProgramFiles,
      ${env:ProgramFiles(x86)},
      $env:ProgramData
  ) | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | ForEach-Object {
      try { [System.IO.Path]::GetFullPath($_).TrimEnd('\', '/') } catch { $null }
  } | Where-Object { $null -ne $_ }

  foreach ($sysDir in $strictSystemDirs) {
      if ($canonicalRoot.Equals($sysDir, [System.StringComparison]::OrdinalIgnoreCase) -or
          $canonicalRoot.StartsWith($sysDir + '\', [System.StringComparison]::OrdinalIgnoreCase)) {
          Write-LogMessage "FATAL: Targeted root '$canonicalRoot' is within a critical Windows system directory. Aborting for safety." -Level ERROR
          exit 1
      }
  }

  # For USERPROFILE: protect the profile root itself, but permit user project subfolders
  if ($env:USERPROFILE) {
      $userProf = [System.IO.Path]::GetFullPath($env:USERPROFILE).TrimEnd('\', '/')
      if ($canonicalRoot.Equals($userProf, [System.StringComparison]::OrdinalIgnoreCase)) {
          Write-LogMessage "FATAL: Targeted root '$canonicalRoot' is the User Profile root. Aborting for safety." -Level ERROR
          exit 1
      }
  }
  ```
  Apply identical logic inside `Test-SafePathContainment` (lines 163-177).

---

## Adversarial Challenge Report

### Challenge Summary
- **Overall Risk Assessment**: MEDIUM-HIGH (Path containment and secret redaction are robust; system directory containment scope and empty input handling require hardening).

### Challenges
1. **Challenge C-1: Empty input crash / nonzero exit on zero-project repositories**
   - **Scenario**: Running clean-reinstall in an empty repo or a repo containing only Markdown / documentation files.
   - **Blast Radius**: Automated pipelines fail unexpectedly with error exit code 1 or unhandled exception.
   - **Mitigation**: Add zero-count guard and relax parameter mandatory flag.
2. **Challenge C-2: Accidental or malicious execution against System32 / Program Files**
   - **Scenario**: Script invoked with `--root C:\Windows\System32` or `--root "C:\Program Files\App"`.
   - **Blast Radius**: System scan proceeds into OS directories; if build/bin/dist folders exist, containment allows deletion.
   - **Mitigation**: Check `.StartsWith($sysDir + '\')` for strict system directory paths.

### Stress Test Results
- Path Traversal (`..\..\`) -> Successfully Blocked -> PASS
- Reparse Point / Junction Escape -> Successfully Skipped & Protected -> PASS
- Drive Root (`C:\`) -> Successfully Blocked -> PASS
- Non-Interactive Stdin Hang -> Successfully Exits with Code 1 -> PASS
- Secret Redaction in Streaming & Logs -> Successfully Redacted -> PASS
- Empty Directory Handling -> Crashes with `ParameterBindingValidationException` -> FAIL
- System Directory Subpath (`C:\Windows\System32`) -> Permitted without blocking -> FAIL
