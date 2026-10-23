# Technical Survey Report: Requirement R3 — Deterministic Dependency Reinstallation & Rebuild

**Author**: `explorer_survey_2`  
**Date**: 2026-10-22  
**Target Milestone**: R3 Engine Implementation (`clean-reinstall.ps1`)  
**Scope**: Deterministic Reinstallation Matrix, Tool/Runtime Detection via PATH, Local Wrappers, Post-install Rebuild (`--build`), and Robust PowerShell Execution & Error Handling.

---

## 1. Observation

Direct observations from examining requirements, project specifications, and runtime behavior on the Windows host environment:

### 1.1 Specification Citations
From `C:\Users\yashs\.gemini\antigravity\worktrees\talentsphere-complete\universal_project_clean_reinstall\.agents\teamwork\ORIGINAL_REQUEST.md`:
- **Line 23-28 (Requirement R3)**:
  > "Reinstall dependencies deterministically using existing lockfiles where present (`pnpm install --frozen-lockfile`, `npm ci`, `yarn install --immutable`, `poetry install`, `uv sync`, `cargo fetch/build`, `dotnet restore`, etc.). Respect local wrappers (`mvnw`, `gradlew`) when present; detect installed tools via PATH (`where.exe`) and gracefully warn/skip if a tool/runtime is absent without crashing the entire run. Support optional `--build` flag to run build commands post-install when standard build scripts or manifests exist. Support `--install-only` to perform reinstallation without prior cleanup."
- **Line 31-33 (Requirement R4)**:
  > "Supported CLI flags: `--dry-run`, `--clean-only`, `--install-only`, `--build`, `--deep-clean`, `--root <path>`, `--exclude <patterns>`, `--max-depth <int>`, `--continue-on-error`, `--verbose`, `--help`... Write structured timestamped log file... output colorized console summary... with nonzero exit code on errors."
- **Line 47-48 (Acceptance Criteria)**:
  > "- [ ] Accurately invokes frozen/immutable lockfile install commands matching detected package managers.  
  > - [ ] Missing CLI tools are logged with clean warnings without terminating unaffected independent projects when `--continue-on-error` is active."

### 1.2 Runtime Environment & PowerShell Quirks Observed on Host
Empirical tests were executed on the target Windows environment (`Windows 11 build 26100`):
1. **PowerShell Version**:
   - Command: `powershell -NoProfile -Command '$PSVersionTable.PSVersion'`
   - Result: `Major: 5, Minor: 1, Build: 26100, Revision: 9711` (Windows PowerShell 5.1).
   - `pwsh.exe` (PowerShell Core 7+) is **not installed** on PATH.
   - *Observation*: The PowerShell engine (`clean-reinstall.ps1`) **must** be strictly backward-compatible with Windows PowerShell 5.1 syntax (e.g. avoiding PS 7-only operators like `??`, `&&`, `||`, ternary operator `?:`).
2. **`Get-Command` Multi-Object Resolution**:
   - Command: `Get-Command pnpm -CommandType Application`
   - Result: Returns an array of two objects:
     1. `C:\Users\yashs\AppData\Roaming\npm\pnpm.cmd`
     2. `C:\Users\yashs\AppData\Roaming\npm\pnpm` (extensionless POSIX bash script installed by npm/corepack).
   - *Observation*: Calling `& $cmd.Source` directly when `$cmd` contains multiple items fails with a parameter binding error. Resolution logic must explicitly prioritize Windows executable extensions (`.cmd`, `.exe`, `.bat`).
3. **PowerShell `2>&1` and `NativeCommandError`**:
   - Command: `& cmd.exe /c 'echo std_msg & echo err_msg 1>&2 & exit 7' 2>&1`
   - Result: In Windows PowerShell 5.1, native stderr redirected through `2>&1` creates `System.Management.Automation.ErrorRecord` items.
   - If `$ErrorActionPreference = 'Stop'`, any native executable that writes informational progress to stderr (e.g., `git`, `npm`, `dotnet restore`, `curl`) immediately triggers a terminating exception even if the exit code is `0`.
   - Furthermore, piping raw `2>&1` into `Tee-Object` prints verbose PowerShell internal `NativeCommandError` frames.
   - Unwrapping lines via `$_.ToString()` inside `ForEach-Object` completely eliminates the error frames while preserving the raw stderr text and real-time streaming.
4. **Exit Code Persistence**:
   - Testing `& cmd.exe /c '...' 2>&1 | ForEach-Object { ... }` confirmed that `$LASTEXITCODE` retains the original process exit code (e.g., `7`), provided no internal PowerShell cmdlet alters it.
5. **Batch File ErrorLevel Forwarding**:
   - Testing `powershell.exe -File script.ps1` confirmed that calling `exit $exitCode` in PowerShell correctly propagates to `%ERRORLEVEL%` in the wrapping batch script `clean-reinstall.bat`.
6. **Host Tool Availability Baseline**:
   - `node.exe`, `npm.cmd`, `pnpm.cmd`, `python.exe` are present.
   - `yarn`, `bun`, `dotnet`, `cargo`, `go`, `composer`, `ruby`, `gradle`, `mvn`, `uv` are absent on this test host. This validates the strict requirement for runtime presence checks and graceful skipping.

---

## 2. Logic Chain

From the observations above, the technical requirements for Requirement R3 decompose into four interconnected subsystems:

```
[Discovered Project Manifest]
           │
           ▼
[1. Resolve Ecosystem & Lockfile Mode]
   ├─ Lockfile present? ──► Select Frozen / Immutable Command
   └─ No lockfile?      ──► Select Standard Install Command
           │
           ▼
[2. Workspace / Monorepo Check]
   ├─ Root Workspace?   ──► Execute Reinstall at Root (links all packages)
   └─ Subpackage?       ──► Skip Reinstall (mark "Managed by Workspace Root")
           │
           ▼
[3. Tool & Wrapper Detection via PATH]
   ├─ Check Local Wrapper (mvnw.cmd, gradlew.bat)
   ├─ Check Global Executable via PATH (.cmd, .exe, .bat)
   └─ Not Found? ───────► Emit [WARN], mark "Skipped", continue / halt based on flag
           │
           ▼
[4. Robust Command Execution (PowerShell 5.1)]
   ├─ Set Working Directory ($projectRoot)
   ├─ Stream stdout & stderr cleanly to Console and Log File
   ├─ Capture $LASTEXITCODE
   └─ Handle Exit Code (Success / Failure / --continue-on-error)
           │
           ▼
[5. Optional Post-Install Rebuild (--build)]
   ├─ Detect Build Script / Target
   └─ Execute Ecosystem Build Command
```

---

### 2.1 Deterministic Reinstall Command Matrix

Below is the complete, authoritative reinstall command matrix across all supported ecosystems.

| Ecosystem | Manifest / Detection | Lockfile | Deterministic Install Command | Fallback Command (No Lockfile) | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **pnpm** | `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml` | `pnpm-lock.yaml` | `pnpm install --frozen-lockfile` | `pnpm install` | `--frozen-lockfile` is default in CI, strictly fails if `pnpm-lock.yaml` is out of sync. |
| **npm** | `package.json`, `package-lock.json` | `package-lock.json`, `npm-shrinkwrap.json` | `npm ci` | `npm install` | `npm ci` strictly requires lockfile, bypasses package.json resolution, and guarantees clean install. |
| **Yarn Berry (v2+)** | `package.json`, `.yarnrc.yml`, or `yarn.lock` with `__metadata` | `yarn.lock` | `yarn install --immutable` | `yarn install` | Berry uses `--immutable` (alias `--immutable-cache`). Fails if lockfile would change. |
| **Yarn Classic (v1.x)** | `package.json`, `yarn.lock` (header `# yarn lockfile v1`) | `yarn.lock` | `yarn install --frozen-lockfile` | `yarn install` | Classic does not recognize `--immutable`. Must use `--frozen-lockfile`. |
| **Bun** | `package.json`, `bun.lockb` or `bun.lock` | `bun.lockb`, `bun.lock` | `bun install --frozen-lockfile` | `bun install` | Bun uses `--frozen-lockfile` to prevent updating lockfile. |
| **Python: uv** | `pyproject.toml` (with `[tool.uv]`), `uv.lock` | `uv.lock` | `uv sync --frozen` | `uv sync` | `uv sync --frozen` creates/syncs `.venv` without updating `uv.lock`. If only `requirements.txt`, runs `uv pip install -r requirements.txt`. |
| **Python: Poetry** | `pyproject.toml` (with `[tool.poetry]`), `poetry.lock` | `poetry.lock` | `poetry install --sync` | `poetry install` | `--sync` synchronizes environment (removes obsolete packages). |
| **Python: Pipenv** | `Pipfile`, `Pipfile.lock` | `Pipfile.lock` | `pipenv sync` | `pipenv install` | `pipenv sync` installs exact versions from `Pipfile.lock` without resolving. |
| **Python: venv + pip** | `requirements.txt`, `setup.py`, generic `pyproject.toml` | None (or pinned `requirements.txt`) | Step 1: `python -m venv .venv`<br>Step 2: `.\.venv\Scripts\python.exe -m pip install -r requirements.txt` | `.\.venv\Scripts\python.exe -m pip install -e .` | Directly invokes venv python binary on Windows to avoid execution policy or environment leakage. |
| **.NET** | `*.sln`, `*.slnx`, `*.csproj`, `*.fsproj` | `packages.lock.json` | `dotnet restore --locked-mode` (if lockfile present) | `dotnet restore` | `--locked-mode` prevents updating lockfile and fails if lockfile is out of sync. |
| **Rust** | `Cargo.toml`, `Cargo.lock` | `Cargo.lock` | `cargo fetch --locked` | `cargo fetch` | `cargo fetch --locked` downloads all network dependencies to local cache without building. |
| **Go** | `go.mod`, `go.sum` | `go.sum` | `go mod download` | `go mod download` | `go.sum` provides cryptographic integrity verification. |
| **PHP (Composer)** | `composer.json`, `composer.lock` | `composer.lock` | `composer install --no-interaction --prefer-dist` | `composer install --no-interaction --prefer-dist` | `composer install` reads lockfile by default and installs exact versions. |
| **Ruby (Bundler)** | `Gemfile`, `Gemfile.lock` | `Gemfile.lock` | `bundle install` | `bundle install` | Respects `Gemfile.lock` if present. Can pass `bundle config set --local frozen 'true'` for strict immutability. |
| **Java (Maven)** | `pom.xml`, `mvnw.cmd` | Local repo / pom | `.\mvnw.cmd dependency:resolve` (or `mvn dependency:resolve`) | `mvn dependency:resolve` | Resolves and downloads all dependencies to local `~/.m2` repository without compiling. |
| **Java (Gradle)** | `build.gradle`, `build.gradle.kts`, `gradlew.bat` | `gradle.lockfile` (optional) | `.\gradlew.bat --refresh-dependencies` | `gradle --refresh-dependencies` | Forces dependency resolution and populates Gradle cache. |
| **C / C++ (CMake)** | `CMakeLists.txt` | `CMakePresets.json` | `cmake -B build -S .` | `cmake -B build -S .` | Generates native build tree in `build/`. |

---

### 2.2 Monorepo & Workspace Reinstallation Rules

When a repository contains a monorepo workspace root:
1. **Root Installation Execution**:
   - The package manager command (`pnpm install`, `npm ci`, `yarn install`, `cargo fetch`, `dotnet restore <sln>`) **MUST be executed only at the workspace root**.
   - Package managers in workspace mode automatically inspect all declared package members and install/link their dependencies simultaneously.
2. **Subpackage Skip Rule**:
   - When traversing discovered subdirectories that belong to a detected parent workspace root, the reinstallation step for the subpackage must be **skipped**.
   - Output log message:
     ```
     [INFO] Subproject 'apps/web' is managed by workspace root at '.' — skipping redundant package install.
     ```
   - In the summary report, record status:
     `Status = "Skipped (Workspace Managed)"`
3. **Workspace Identification Markers**:
   - pnpm: `pnpm-workspace.yaml` at root.
   - npm: `package.json` with `"workspaces"` property at root.
   - Yarn: `package.json` with `"workspaces"` property or `.yarnrc.yml` at root.
   - Cargo: `Cargo.toml` with `[workspace]` table.
   - .NET: `*.sln` or `*.slnx` file containing references to child `.csproj` files.

---

### 2.3 Tool & Runtime Detection Architecture (Windows PATH & Wrappers)

To avoid crashing when external runtimes are missing on a developer's machine:

#### Step 1: Preference for Local Project Wrappers
Before searching global system PATH, check whether the project repository provides its own self-bootstrapping wrapper:
- **Maven**: Look for `mvnw.cmd` or `mvnw.bat` in the project root directory. (Note: Extensionless `mvnw` is a POSIX shell script and will fail when executed directly on Windows).
- **Gradle**: Look for `gradlew.bat` or `gradlew.cmd` in the project root directory.
- If the wrapper exists, use the wrapper's absolute path directly.

#### Step 2: Global Tool Resolution via PowerShell `Get-Command`
If no local wrapper exists, resolve the tool from system PATH:
```powershell
function Resolve-ExecutablePath {
    param([string]$ToolName)

    # Use native PowerShell cmdlet with -CommandType Application
    $commands = @(Get-Command -Name $ToolName -CommandType Application -ErrorAction SilentlyContinue)
    if ($commands.Count -eq 0) {
        return $null
    }

    # On Windows, prioritize executable binary extensions (.cmd, .exe, .bat)
    # over extensionless POSIX scripts installed by node/corepack
    $winExe = $commands | Where-Object { $_.Source -match '\.(cmd|exe|bat)$' } | Select-Object -First 1
    if ($winExe) {
        return $winExe.Source
    }

    # Fallback to first resolved executable
    return $commands[0].Source
}
```

#### Step 3: Graceful Skip & Warning Protocol
If `Resolve-ExecutablePath` returns `$null`:
- Emit a clean warning to the console:
  ```powershell
  Write-Warning "Tool '$ToolName' was not found on PATH. Skipping project at '$ProjectPath'."
  ```
- Record the project result in the audit accumulator:
  ```powershell
  [PSCustomObject]@{
      Path    = $ProjectPath
      Stack   = $Stack
      Action  = "Install"
      Status  = "Skipped"
      Reason  = "Tool '$ToolName' not found on PATH"
  }
  ```
- **Do not throw an unhandled terminating exception**. Proceed to the next discovered project.

---

### 2.4 Post-Install Rebuild (`--build` flag) Conventions

When the user specifies `--build`:
After successful dependency reinstallation, verify whether a build command exists for the project stack:

| Ecosystem | Condition / Detection | Exact Build Command | Notes |
| :--- | :--- | :--- | :--- |
| **Node / JS / TS** | `package.json` contains `"build"` in `"scripts"` object | `pnpm run build`<br>`npm run build`<br>`yarn build`<br>`bun run build` | If `"build"` script is absent, log `[INFO] No 'build' script found in package.json; skipping build.` |
| **.NET** | `.sln` or `.csproj` present | `dotnet build --no-restore` | Passes `--no-restore` to leverage the fresh restore. |
| **Rust** | `Cargo.toml` present | `cargo build --locked` | For workspace root, pass `--workspace`. |
| **Go** | `go.mod` present | `go build ./...` | Compiles all packages in the module recursively. |
| **Java (Maven)** | `pom.xml` present | `.\mvnw.cmd compile -DskipTests` (or `mvn compile -DskipTests`) | Uses wrapper if present. Skips unit tests to focus on build verification. |
| **Java (Gradle)** | `build.gradle` present | `.\gradlew.bat assemble -x test` (or `gradle assemble -x test`) | Uses wrapper if present. Skips tests to focus on compilation. |
| **PHP (Composer)** | `composer.json` contains `"build"` in `"scripts"` | `composer run-script build --no-interaction` | If `"build"` script is absent, skip gracefully. |
| **Python** | `pyproject.toml` contains `[build-system]` or `setup.py` exists | `python -m build` (or `uv build`, `poetry build`) | If application/script without build-system, skip gracefully. |
| **C / C++ (CMake)** | `CMakeLists.txt` present | `cmake --build build --config Release` | Compiles generated build tree. |

---

### 2.5 Robust PowerShell Execution & Error Handling

To achieve real-time streaming, exit code capture, and dual logging in Windows PowerShell 5.1 and PS 7+:

#### The `Invoke-ToolCommand` Engine Pattern
```powershell
function Invoke-ToolCommand {
    param(
        [Parameter(Mandatory=$true)][string]$Executable,
        [Parameter(Mandatory=$false)][string[]]$ArgumentList = @(),
        [Parameter(Mandatory=$false)][string]$WorkingDirectory = $PWD.Path,
        [Parameter(Mandatory=$false)][string]$LogFile = $null,
        [Parameter(Mandatory=$false)][switch]$ContinueOnError
    )

    # 1. Change to target project directory with guaranteed recovery
    Push-Location -Path $WorkingDirectory
    try {
        # 2. Prevent PS 5.1 from crashing on benign native stderr writes
        $previousEAP = $ErrorActionPreference
        $ErrorActionPreference = 'Continue'

        # 3. Stream stdout and stderr in real time
        & $Executable @ArgumentList 2>&1 | ForEach-Object {
            $line = $_.ToString()
            # Stream directly to host console
            [Console]::WriteLine($line)

            # Append to log file if logging is active
            if ($LogFile) {
                [System.IO.File]::AppendAllText($LogFile, ($line + [Environment]::NewLine))
            }
        }

        # 4. Capture native exit code
        $exitCode = $LASTEXITCODE
        $ErrorActionPreference = $previousEAP

        # 5. Evaluate exit code
        if ($exitCode -ne 0) {
            $errMsg = "Command '$Executable $($ArgumentList -join ' ')' failed with exit code $exitCode in '$WorkingDirectory'."
            Write-Error $errMsg

            if ($LogFile) {
                [System.IO.File]::AppendAllText($LogFile, ("[ERROR] " + $errMsg + [Environment]::NewLine))
            }

            if (-not $ContinueOnError) {
                # Halt immediately if --continue-on-error was not specified
                throw [System.InvalidOperationException]::new($errMsg)
            }
        }

        return $exitCode
    }
    finally {
        Pop-Location
    }
}
```

#### Behavior Matrix: Default vs `--continue-on-error`

| Scenario | Default Mode (No `--continue-on-error`) | `--continue-on-error` Mode |
| :--- | :--- | :--- |
| **Tool Missing on PATH** | Log warning `[WARN]`, mark project `Skipped`, continue to next project. | Log warning `[WARN]`, mark project `Skipped`, continue to next project. |
| **Install Command Fails (`exitCode != 0`)** | Log error `[ERROR]`, mark project `Failed`, **abort execution immediately**, print summary, exit script with `exit 1` (or `$exitCode`). | Log error `[ERROR]`, mark project `Failed`, **continue to next project**, process all remaining targets. |
| **Build Command Fails (`exitCode != 0`)** | Log error `[ERROR]`, mark project `Failed`, **abort execution immediately**, print summary, exit script with `exit 1`. | Log error `[ERROR]`, mark project `Failed`, **continue to next project**, process all remaining targets. |
| **Final Exit Code** | `0` if all succeeded; non-zero immediately upon first failure. | `0` if all succeeded/skipped; `1` if at least one project failed. |

---

## 3. Caveats

1. **Yarn Berry Zero-Install Mode**:
   - If a repository uses Yarn Berry with Zero-Install enabled (i.e. `.yarn/cache` is checked into version control), running `yarn install --immutable` completes purely offline from cache without requiring network access.
2. **Multiple Python Requirements Files**:
   - While `requirements.txt` is standard, some repositories split dependencies (e.g. `requirements-dev.txt`, `requirements/base.txt`). The discovery engine should check for `requirements.txt` first, or inspect `requirements/` directory if standard `requirements.txt` is missing.
3. **Java Wrapper Execution Permissions**:
   - On Windows, `mvnw.cmd` and `gradlew.bat` do not require executable bit permissions (unlike Linux `chmod +x`). However, if a repository only contains `mvnw` (extensionless POSIX script) without `mvnw.cmd`, it cannot be invoked directly by Windows cmd/PowerShell. The tool resolution must fall back to global `mvn` on PATH.
4. **ExecutionPolicy and Script Execution**:
   - The batch entry point `clean-reinstall.bat` must invoke PowerShell with `-ExecutionPolicy Bypass -NoProfile` to guarantee execution regardless of the user's default machine ExecutionPolicy.

---

## 4. Conclusion

1. **Reinstallation Matrix**:
   Deterministic, frozen lockfile reinstallation is achievable across all 11+ target stacks by enforcing explicit CLI flags (`--frozen-lockfile`, `npm ci`, `--immutable`, `uv sync --frozen`, `poetry install --sync`, `dotnet restore --locked-mode`, `cargo fetch --locked`).
2. **Workspace Discipline**:
   Reinstall operations must strictly execute at the detected Workspace Root for monorepos (pnpm, npm, Yarn, Cargo, .NET solutions), while subpackages must skip reinstall to prevent corrupted symlinks or duplicated downloads.
3. **PowerShell 5.1 Compatibility**:
   PowerShell 5.1 is the active Windows engine. Tool detection using `Get-Command -CommandType Application` with `.cmd`/`.exe`/`.bat` filtering is robust, non-blocking, and avoids subprocess overhead.
4. **Clean Streaming & Exit Code Capture**:
   Piping native commands through `2>&1 | ForEach-Object { $_.ToString() }` while setting `$ErrorActionPreference = 'Continue'` completely solves the PowerShell `NativeCommandError` bug, guarantees live streaming to console, appends to the log file, and cleanly preserves `$LASTEXITCODE`.
5. **Clear Error Policy**:
   Missing tools are skipped with clean warnings. Command execution failures halt immediately under default mode, or continue processing independent projects when `--continue-on-error` is active, terminating with code `1` if any project failed.

---

## 5. Verification Method

To independently verify all findings and logic on any Windows system:

### 5.1 Verifying Tool Resolution
Run in PowerShell:
```powershell
# Verify that Get-Command correctly resolves pnpm.cmd over extensionless pnpm
$cmds = @(Get-Command pnpm -CommandType Application -ErrorAction SilentlyContinue)
$target = $cmds | Where-Object { $_.Source -match '\.(cmd|exe|bat)$' } | Select-Object -First 1
Write-Host "Resolved: $($target.Source)"
# Assert target is a valid Windows executable
if ($target.Source -notmatch '\.(cmd|exe|bat)$') { throw "Resolution failed" }
```

### 5.2 Verifying Stderr Unwrapping & Exit Code Preservation
Run in PowerShell:
```powershell
$testScript = {
    $prev = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    & cmd.exe /c "echo stdout_sample & echo stderr_sample 1>&2 & exit 19" 2>&1 | ForEach-Object {
        $line = $_.ToString()
        [Console]::WriteLine("LINE: $line")
    }
    $code = $LASTEXITCODE
    $ErrorActionPreference = $prev
    return $code
}
$result = & $testScript
# Assert exit code 19 was preserved and no terminating error was thrown
if ($result -ne 19) { throw "Exit code was not 19; got $result" }
Write-Host "Exit code test passed successfully."
```

### 5.3 Verifying Wrapper Execution with Spaces in Path
Run in PowerShell:
```powershell
$tempDir = Join-Path ([System.IO.Path]::GetTempPath()) "clean reinstall test with spaces"
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
$batFile = Join-Path $tempDir "test-wrapper.bat"
Set-Content -Path $batFile -Value "@echo off`r`necho WRAPPER_SUCCESS %*`r`nexit 0"
try {
    $output = & $batFile "arg1" "arg with spaces"
    Write-Host "Output: $output"
    if ($output -notmatch "WRAPPER_SUCCESS") { throw "Wrapper invocation failed" }
}
finally {
    Remove-Item -Recurse -Force $tempDir
}
```
