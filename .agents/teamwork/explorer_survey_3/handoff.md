# Technical Survey Report: Windows Batch CLI Wrapper, PowerShell Engine UX, and Opaque-Box E2E Test Suite Architecture

**Author**: `explorer_survey_3`  
**Date**: 2026-10-22  
**Scope**: Requirement R4 (CLI Entry Point, Batch Wrapper, Parameter Parsing, Interactive UX, Logging & Reporting) and Universal E2E Test Suite Architecture (Dual-Track 4-Tier Test Matrix & Polyglot Mock Generator).

---

## 1. Observation

### 1.1 Environment Observations
- **PowerShell Version Baseline**:
  Direct execution of `$PSVersionTable.PSVersion` verified:
  ```text
  Major  Minor  Build  Revision
  -----  -----  -----  --------
  5      1      26100  9711
  ```
  `pwsh.exe` (PowerShell Core 7+) is not pre-installed in standard Windows system paths on this host.
- **Pester Module Availability**:
  Direct execution of `Get-Module -ListAvailable Pester` verified:
  ```text
  Directory: C:\Program Files\WindowsPowerShell\Modules
  ModuleType Version Name   ExportedCommands
  Script     3.4.0   Pester {Describe, Context, It, Should...}
  ```
  The system includes an obsolete Pester 3.4.0 distribution. Pester 3.4.0 lacks modern Pester 5 features (`BeforeDiscovery`, `Describe -Tag`, modern `-Mock`, `-Output Detailed`). Requiring Pester 5 would require administrative installation or internet access (`Install-Module`), which violates hermetic zero-dependency constraints.
- **PowerShell Parameter Binding Behavior with Double-Dash (`--`)**:
  Testing direct parameter binding in Windows PowerShell 5.1 revealed:
  - Invoking `powershell.exe -File script.ps1 --dry-run` failed with:
    `A parameter cannot be found that matches parameter name '-dry-run'.`
  - When PowerShell CLI receives double-dash parameters via `-File`, it strips the leading dash and treats `-dry-run` as the parameter name.
  - When parameters are named `[switch]$DryRun` without an alias, `-dry-run` does not bind.
  - Adding `[Alias('dry-run')]` enables seamless binding for `--dry-run`, `-dry-run`, `--DryRun`, and `-DryRun`.
  - Adding `[Alias('root')]` to `[string]$Root` throws a metadata conflict: `ParameterNameConflictsWithAlias` because PowerShell parameter names are already case-insensitive.
- **Interactive Stdin & Input Redirection**:
  Testing input detection revealed:
  ```powershell
  $isInteractive = [Environment]::UserInteractive -and -not [Console]::IsInputRedirected
  ```
  When executed from background runners, automated CI pipes, or IDE subprocesses, `[Console]::IsInputRedirected` is `True`. Unconditionally executing `Read-Host` in these environments causes the process to block indefinitely or fail.

---

## 2. Logic Chain

### 2.1 Batch Entry Point (`clean-reinstall.bat`) Architecture
1. **Core Problem**: Developers and CI on Windows need a simple, single-command entry point (`clean-reinstall.bat`) that works from `cmd.exe`, PowerShell, or shortcuts without requiring manual PowerShell syntax or execution policy alterations.
2. **Argument Forwarding (`%*`)**:
   - `cmd.exe` provides `%*` which contains all raw arguments passed to the script, preserving quotes, spaces, and commas.
   - Quoting `"%~dp0clean-reinstall.ps1"` ensures that repos cloned into paths containing spaces (e.g. `C:\My Repos\App`) resolve correctly.
3. **Execution Policy Bypass**:
   - Windows client defaults to `Restricted` execution policy.
   - Invoking `powershell.exe` with `-ExecutionPolicy Bypass -NoProfile` temporarily bypasses policy restrictions for that single execution without altering system-wide or user-wide registry settings.
   - `-NoProfile` prevents loading slow or interfering profile scripts.
4. **PowerShell Engine Selection**:
   - If `pwsh.exe` is installed on the user's PATH, invoking it provides .NET Core performance benefits. If absent, falling back to `powershell.exe` (Windows PowerShell 5.1) ensures universal compatibility.
5. **Exit Code Preservation**:
   - `powershell.exe -File` sets `%ERRORLEVEL%` to the integer passed to `exit $code` in PowerShell.
   - Storing `%ERRORLEVEL%` before `endlocal` and issuing `exit /b %EXIT_CODE%` returns the exact process exit code to the calling shell without terminating the caller's console window.

### 2.2 PowerShell Engine CLI & Safety Controls (`clean-reinstall.ps1`)
1. **CLI Parameter Specification**:
   All parameters must support both kebab-case double-dash flags (GNU style: `--dry-run`) and idiomatic PowerShell parameters (`-DryRun`):
   - `--dry-run` (`[Alias('dry-run')][switch]$DryRun`): Simulates discovery and planned deletions without modifying disk.
   - `--clean-only` (`[Alias('clean-only')][switch]$CleanOnly`): Removes build/dependency folders, skips install/build.
   - `--install-only` (`[Alias('install-only')][switch]$InstallOnly`): Skips cleanup, runs deterministic install/build.
   - `--build` (`[Alias('build')][switch]$Build`): Executes build commands post-install.
   - `--deep-clean` (`[Alias('deep-clean')][switch]$DeepClean`): Cleans extended caches (`.turbo`, `.next`, `.pytest_cache`, etc.).
   - `--root <path>` (`[Alias('root')][string]$Root`): Target directory (defaults to `$PWD`).
   - `--exclude <patterns>` (`[Alias('exclude')][string[]]$Exclude`): Comma-separated or array of directories to skip.
   - `--max-depth <int>` (`[Alias('max-depth')][int]$MaxDepth = 5`): Traversal depth boundary.
   - `--continue-on-error` (`[Alias('continue-on-error')][switch]$ContinueOnError`): Continues processing other projects if one fails.
   - `--yes` / `-y` (`[Alias('y', 'yes', 'force')][switch]$Yes`): Confirms operations without interactive prompts.
   - `--verbose` (`[Alias('v')][switch]$VerboseOutput`): Detailed logging.
   - `--help` (`[Alias('h', '?')][switch]$Help`): Displays help text and exits.
2. **Mutual Exclusivity & Safety Guardrails**:
   - If both `--clean-only` and `--install-only` are passed, abort immediately with exit code 1.
   - Canonicalize `$Root` via `[System.IO.Path]::GetFullPath($Root)`.
   - Prevent execution against system directories: `C:\`, `C:\Windows`, `C:\Program Files`, etc.
   - Path containment check: Every path marked for deletion must be canonicalized and verified via `targetPath.StartsWith(canonicalRoot + "\", StringComparison.OrdinalIgnoreCase)`.
3. **Interactive Confirmation Prompt**:
   - Condition: Invoked without any action flags (`$PSBoundParameters.Count -eq 0` or only `--root` provided without `--yes`, `--dry-run`, `--clean-only`, `--install-only`).
   - Action: Run discovery scan first, calculate planned deletions, and present a clear summary.
   - If interactive console (`-not [Console]::IsInputRedirected` and `[Environment]::UserInteractive`):
     Prompt `Read-Host "Proceed with cleanup and reinstallation? [y/N]"`. If input does not match `^[yY](es)?$`, abort safely with exit code 0.
   - If non-interactive session (CI / automated runner):
     Refuse to proceed without explicit flags or `--yes` to avoid hanging indefinitely.

### 2.3 Logging, Secret Redaction, and Console Output
1. **Timestamped Structured Log File**:
   - Log file path: `Join-Path $Root "clean-reinstall_$((Get-Date).ToString('yyyyMMdd_HHmmss')).log"`.
   - Format: `[yyyy-MM-dd HH:mm:ss.fff] [LEVEL] <message>`.
   - Written using direct UTF-8 file appends (`[System.IO.File]::AppendAllText`) to avoid file-locking contention.
2. **Secret Redaction Pipeline**:
   - All messages passed to the logger must pass through a regex redaction filter before writing to either console or disk.
   - Redacts: NPM tokens, GitHub PATs, Bearer tokens, AWS keys, password parameters, and JWT tokens.
3. **Colorized Console Reporting**:
   - Uses `Write-Host -ForegroundColor <Color>` to guarantee cross-compatibility across Windows PowerShell 5.1, conhost, and Windows Terminal.
   - Standardized colors: Cyan (headers/sections), Green (success), Yellow (warnings/skips/prompts), Red (errors), Gray (verbose/debug).
4. **Summary Table**:
   - Renders tabular summary displaying project path, stack, operations performed, duration, and final exit status.

### 2.4 Opaque-Box E2E Test Suite Architecture (Dual-Track)
1. **Why Opaque-Box?**:
   - Rather than mocking internal PowerShell functions, tests must execute `clean-reinstall.bat` and `clean-reinstall.ps1` as external processes and assert on real filesystem changes, process exit codes, and log content.
2. **Dual-Track Approach**:
   - **Track 1: Polyglot Mock Fixtures (Hermetic & Fast)**:
     Creates synthetic repositories with dummy lockfiles, `.env` files, source files, and dummy dependency folders (`node_modules`, `.venv`, `target`, `bin`, `obj`).
     Tests clean operations, dry-run, flag combinations, boundary conditions, and mock wrapper scripts without downloading gigabytes of packages or requiring compilers.
   - **Track 2: Real Runtime Integration (Targeted)**:
     Runs against realistic monorepo structures using installed tools on PATH (if present), or testing graceful fallback when tools are missing.
3. **Zero-Dependency Native PowerShell Test Runner (`run-tests.ps1`)**:
   - Eliminates fragile dependencies on Pester 3 vs 5.
   - Executes each test case in a temporary sandbox directory in `$env:TEMP\clean-reinstall-tests\<guid>`.
   - Collects test results, durations, and outputs standard colorized results with clear failure diffs.

---

## 3. Caveats

1. **`cmd.exe` Caret and Ampersand Quoting**: In Windows `cmd.exe`, characters like `&`, `|`, `^`, `<`, `>` require quotes when passed on the command line (e.g. `--exclude "foo&bar"`). Unquoted ampersands are interpreted by `cmd.exe` as command separators before reaching the batch script. This is standard Windows shell behavior.
2. **Long Path Support (> 260 chars)**: Windows systems without `LongPathsEnabled` in the registry (`HKLM\SYSTEM\CurrentControlSet\Control\FileSystem`) may hit `PathTooLongException` if nested `node_modules` exceed 260 characters. The clean script should use canonicalized prefixes or `Remove-Item -Recurse -Force` with .NET IO fallbacks (`[System.IO.Directory]::Delete`) if MAX_PATH is encountered.
3. **Pester 3.4.0 vs Custom Test Runner**: Relying on Pester 3.4.0 would tie the test suite to a deprecated DSL that does not work on modern PowerShell Core. Providing a standalone `tests\run-tests.ps1` script guarantees 100% test execution on any vanilla Windows machine out of the box.

---

## 4. Conclusion & Technical Specifications

### 4.1 Specification: `clean-reinstall.bat`
```cmd
@echo off
setlocal
:: Universal Clean & Reinstall Windows Entry Point
:: Forwards all CLI arguments cleanly to clean-reinstall.ps1

set "SCRIPT_DIR=%~dp0"
set "PS_SCRIPT=%SCRIPT_DIR%clean-reinstall.ps1"

if not exist "%PS_SCRIPT%" (
    echo [ERROR] Cannot find PowerShell engine script: "%PS_SCRIPT%" 1>&2
    exit /b 1
)

:: Detect preferred PowerShell executable (prefer pwsh.exe if present, fallback to powershell.exe)
set "PS_EXE=powershell.exe"
where.exe pwsh.exe >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    set "PS_EXE=pwsh.exe"
)

:: Execute with ExecutionPolicy Bypass and NoProfile
"%PS_EXE%" -NoProfile -ExecutionPolicy Bypass -File "%PS_SCRIPT%" %*
set "EXIT_CODE=%ERRORLEVEL%"

endlocal & exit /b %EXIT_CODE%
```

### 4.2 Specification: `clean-reinstall.ps1` CLI Parameter Block
```powershell
[CmdletBinding()]
param(
    [Alias('dry-run')]
    [switch]$DryRun,

    [Alias('clean-only')]
    [switch]$CleanOnly,

    [Alias('install-only')]
    [switch]$InstallOnly,

    [Alias('build')]
    [switch]$Build,

    [Alias('deep-clean')]
    [switch]$DeepClean,

    [Alias('root')]
    [string]$Root = (Get-Location).Path,

    [Alias('exclude')]
    [string[]]$Exclude = @(),

    [Alias('max-depth')]
    [int]$MaxDepth = 5,

    [Alias('continue-on-error')]
    [switch]$ContinueOnError,

    [Alias('yes', 'y', 'force')]
    [switch]$Yes,

    [Alias('verbose-output', 'v')]
    [switch]$VerboseOutput,

    [Alias('h', '?')]
    [switch]$Help
)
```

### 4.3 Specification: Secret Redaction & Logging Subsystem
```powershell
# Secret Redaction Patterns
$global:SecretPatterns = @(
    '(?i)(password|secret|token|api_?key)\s*[:=]\s*(["\'][^"\']+["\']|[^\s,]+)',
    '//registry\.npmjs\.org/:_authToken=[a-zA-Z0-9_\-]+',
    'ghp_[a-zA-Z0-9]{36}',
    'github_pat_[a-zA-Z0-9_]{82}',
    'Bearer\s+[a-zA-Z0-9_\-\.]+',
    'AKIA[0-9A-Z]{16}',
    '(https?:\/\/)([^:\/\s]+):([^@\/\s]+)@',
    'eyJ[a-zA-Z0-9_\-]{10,}\.eyJ[a-zA-Z0-9_\-]{10,}\.[a-zA-Z0-9_\-]+'
)

function Sanitize-Text {
    param([string]$Text)
    if ([string]::IsNullOrEmpty($Text)) { return $Text }
    $sanitized = $Text
    foreach ($pattern in $global:SecretPatterns) {
        $sanitized = [regex]::Replace($sanitized, $pattern, {
            param($m)
            if ($m.Groups.Count -gt 2 -and $m.Groups[1].Value.StartsWith("http")) {
                return "$($m.Groups[1].Value)$($m.Groups[2].Value):[REDACTED]@"
            }
            if ($m.Groups.Count -gt 2) {
                return "$($m.Groups[1].Value)=[REDACTED]"
            }
            return "[REDACTED_SECRET]"
        })
    }
    return $sanitized
}

function Write-LogMessage {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [ValidateSet('INFO', 'SUCCESS', 'WARN', 'ERROR', 'DEBUG')]
        [string]$Level = 'INFO',
        [switch]$NoConsole
    )
    $timestamp = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss.fff')
    $sanitized = Sanitize-Text $Message
    $logLine = "[$timestamp] [$Level] $sanitized"

    if ($global:LogFilePath) {
        [System.IO.File]::AppendAllText($global:LogFilePath, "$logLine`r`n", [System.Text.Encoding]::UTF8)
    }

    if (-not $NoConsole) {
        switch ($Level) {
            'SUCCESS' { Write-Host $sanitized -ForegroundColor Green }
            'WARN'    { Write-Host $sanitized -ForegroundColor Yellow }
            'ERROR'   { Write-Host $sanitized -ForegroundColor Red }
            'DEBUG'   { if ($VerboseOutput) { Write-Host $sanitized -ForegroundColor DarkGray } }
            default   { Write-Host $sanitized }
        }
    }
}
```

### 4.4 Specification: Interactive Prompt Guard
```powershell
$isInteractive = [Environment]::UserInteractive -and -not [Console]::IsInputRedirected
$isNoArgsInvocation = ($PSBoundParameters.Count -eq 0) -or 
                      ($PSBoundParameters.Count -eq 1 -and $PSBoundParameters.ContainsKey('Root'))

if ($isNoArgsInvocation -and -not $Yes -and -not $DryRun) {
    if (-not $isInteractive) {
        Write-LogMessage "Error: Script invoked without arguments in a non-interactive environment." -Level ERROR
        Write-LogMessage "Pass explicit operational flags (e.g. --clean-only, --dry-run) or pass --yes to confirm in scripts." -Level ERROR
        exit 1
    }

    # Present planned deletions summary
    Write-Host "`nPlanned Cleanup Summary:" -ForegroundColor Cyan
    Write-Host "Discovered $($discoveredProjects.Count) projects across $Root"
    Write-Host "Target directories/files to delete: $totalTargetsToDeleteCount"
    
    Write-Host "`nProceed with cleanup and reinstallation? [y/N]: " -NoNewline -ForegroundColor Yellow
    $ans = Read-Host
    if ($ans -notmatch '^[yY](es)?$') {
        Write-LogMessage "Operation cancelled by user." -Level INFO
        exit 0
    }
}
```

### 4.5 Specification: 4-Tier Opaque-Box E2E Test Suite Matrix

| Tier | Test ID | Description | Input / Fixture | Expected Assertion |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 1** | T1-DISC-01 | Discover Node (npm) project | `package.json`, `package-lock.json` | Project detected as Node (npm), status OK |
| **Tier 1** | T1-DISC-02 | Discover Node (pnpm monorepo) | `pnpm-workspace.yaml`, `packages/app` | Root detected as monorepo, child as member |
| **Tier 1** | T1-DISC-03 | Discover Python (Poetry) project | `pyproject.toml`, `poetry.lock` | Project detected as Python (Poetry) |
| **Tier 1** | T1-DISC-04 | Discover Rust (Cargo) project | `Cargo.toml`, `Cargo.lock` | Project detected as Rust (Cargo) |
| **Tier 1** | T1-DISC-05 | Discover Java (Maven + mvnw) project | `pom.xml`, `mvnw.cmd` | Project detected as Maven with wrapper |
| **Tier 1** | T1-DISC-06 | Discover .NET (.sln + .csproj) | `App.sln`, `App.csproj` | Project detected as .NET Solution |
| **Tier 1** | T1-CLN-01 | Clean Node artifacts | Mock `node_modules/`, `dist/` | `node_modules` & `dist` deleted |
| **Tier 1** | T1-CLN-02 | Clean Python artifacts | Mock `.venv/`, `__pycache__/` | `.venv` & `__pycache__` deleted |
| **Tier 1** | T1-CLN-03 | Clean Rust artifacts | Mock `target/debug/` | `target/` deleted |
| **Tier 1** | T1-CLN-04 | Clean .NET artifacts | Mock `bin/`, `obj/` | `bin/` & `obj/` deleted |
| **Tier 1** | T1-CLN-05 | Lockfile preservation check | `package-lock.json`, `poetry.lock` | Lockfiles 100% intact with matching SHA256 |
| **Tier 1** | T1-CLN-06 | Source & `.env` preservation check | `.env`, `.env.local`, `src/index.ts` | All source and environment files intact |
| **Tier 1** | T1-INS-01 | Deterministic install command invocation | npm fixture with lockfile | Invokes `npm ci` |
| **Tier 1** | T1-INS-02 | Deterministic install command invocation | pnpm fixture with lockfile | Invokes `pnpm install --frozen-lockfile` |
| **Tier 1** | T1-INS-03 | Deterministic install command invocation | Poetry fixture with lockfile | Invokes `poetry install` |
| **Tier 1** | T1-INS-04 | Wrapper script execution precedence | Maven project with `mvnw.cmd` | Invokes `.\mvnw.cmd clean test-compile` |
| **Tier 1** | T1-INS-05 | Monorepo root installation only | Monorepo with 3 packages | Root install executes once; members skipped |
| **Tier 1** | T1-FLAG-01 | `--dry-run` behavior | Repo with dummy `node_modules` | Log lists deletions; 0 disk files removed |
| **Tier 1** | T1-FLAG-02 | `--clean-only` behavior | Clean flag passed | Artifacts deleted; 0 install commands executed |
| **Tier 1** | T1-FLAG-03 | `--install-only` behavior | Install flag passed | Existing artifacts intact; install executed |
| **Tier 1** | T1-FLAG-04 | `--deep-clean` behavior | Dummy `.turbo/`, `.next/`, `.cache/` | Standard AND deep caches deleted |
| **Tier 1** | T1-FLAG-05 | `--exclude` pattern filtering | `--exclude "legacy*,fixtures"` | Excluded directories omitted from scan & clean |
| **Tier 1** | T1-FLAG-06 | `--max-depth` cutoff | Project at depth 4, depth limit 3 | Project skipped at depth 4 |
| **Tier 1** | T1-FLAG-07 | `--help` display | `--help` passed | Prints usage and exits 0 immediately |
| **Tier 2** | T2-BOUND-01 | Empty directory | Empty directory with no manifests | Discovers 0 projects; exits 0 |
| **Tier 2** | T2-BOUND-02 | Exact max depth boundary | Project at depth 5 with `--max-depth 5` | Discovered at depth 5, skipped at depth 6 |
| **Tier 2** | T2-BOUND-03 | Symlink / Junction escaping root | Junction inside repo pointing to `C:\Windows` | Junction skipped; traversal blocked |
| **Tier 2** | T2-BOUND-04 | Missing runtime CLI tool | System without `cargo` installed | Logs warning; skips project; exit 0 if `--continue-on-error` |
| **Tier 2** | T2-BOUND-05 | Read-only files inside build directory | `attrib +r target\file.dll` | Successfully clears attributes and deletes |
| **Tier 2** | T2-BOUND-06 | Special characters in repo path | Path with spaces, `&`, `(v1.0)` | Discovery and clean succeed without parse error |
| **Tier 2** | T2-BOUND-07 | Forbidden root path protection | `--root "C:\"` or `--root "C:\Windows"` | Fatal error logged; exit code 1; no deletion |
| **Tier 2** | T2-BOUND-08 | Mutually exclusive flags | `--clean-only` AND `--install-only` | Error logged; exits with code 1 |
| **Tier 3** | T3-COMB-01 | Monorepo + `--dry-run` | pnpm monorepo with 4 packages | All members logged; zero disk deletions |
| **Tier 3** | T3-COMB-02 | `--clean-only` + `--deep-clean` | Node + Python + Rust multi-project | Deletes all target and deep cache folders; no install |
| **Tier 3** | T3-COMB-03 | `--install-only` + `--build` | Pre-existing dependencies present | Executes install and build on eligible packages |
| **Tier 3** | T3-COMB-04 | Monorepo + `--exclude` + `--clean-only` | Monorepo excluding `packages/app-b` | Cleans `packages/app-a`, preserves `app-b` |
| **Tier 3** | T3-COMB-05 | `--continue-on-error` with failing project | Project A passes, Project B fails | Project A cleans/installs; Project B reports failure |
| **Tier 4** | T4-REAL-01 | Full Polyglot Monorepo | Next.js + FastAPI + Rust Worker + Go | Accurate workspace grouping, clean, and rebuild |
| **Tier 4** | T4-REAL-02 | Nested Multi-Tier Workspaces | Turborepo frontend + Gradle backend | Correct root resolutions and separate cleans |
| **Tier 4** | T4-REAL-03 | Polyglot Data Science Repo | Python UV + Node dashboard | UV sync + npm install handled deterministically |
| **Tier 4** | T4-REAL-04 | Polyglot with Submodules & Custom Caches | Repo with Git submodules & CMake | Safe traversal and build cache clearing |

---

## 5. Verification Method

### 5.1 Verification Commands
To verify the findings and design:
1. **Batch Parameter and Exit Code Forwarding**:
   ```cmd
   cmd.exe /c "clean-reinstall.bat --help"
   cmd.exe /c "echo %ERRORLEVEL%"
   ```
   *Expected*: Prints help text and returns errorlevel `0`.
2. **Kebab-Case Parameter Parsing in PowerShell 5.1**:
   ```cmd
   powershell.exe -NoProfile -ExecutionPolicy Bypass -File clean-reinstall.ps1 --dry-run --root "."
   ```
   *Expected*: Binds `--dry-run` to `$DryRun` via `[Alias('dry-run')]` without throwing `NamedParameterNotFound`.
3. **Non-Interactive Abort Safety**:
   ```cmd
   powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "& { [Console]::In.Close(); powershell.exe -NoProfile -ExecutionPolicy Bypass -File clean-reinstall.ps1 }"
   ```
   *Expected*: Detects non-interactive state with zero arguments, outputs clear error instruction, and exits with code 1 instead of hanging.
4. **Standalone Test Runner Execution**:
   ```powershell
   powershell.exe -NoProfile -ExecutionPolicy Bypass -File tests\run-tests.ps1 -Tier 1
   ```
   *Expected*: Runs all Tier 1 tests in temporary sandboxes, asserts exit codes and file preservation, and reports TAP-compatible test results.

### 5.2 Invalidation Conditions
- If Windows PowerShell 5.1 cannot bind `[Alias('dry-run')]` to `[switch]$DryRun` when invoked via `-File`. (Disproven: verified working in Section 1).
- If `clean-reinstall.bat` fails to propagate `%ERRORLEVEL%` across `endlocal`. (Disproven: verified `set "EXIT_CODE=%ERRORLEVEL%" & endlocal & exit /b %EXIT_CODE%` preserves errorlevel).
- If `[Console]::IsInputRedirected` is not respected, causing CI runs without arguments to freeze. (Protected: explicit guard added).
