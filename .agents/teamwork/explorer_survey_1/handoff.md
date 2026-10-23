# Technical Survey Report: Universal Project Discovery, Monorepos & Safe Cleanup (R1 & R2)

**Core Finding**: A production-grade universal clean-and-reinstall engine on Windows PowerShell 5.1 / 7+ requires an explicit, iterative depth-bounded directory scanner that prunes dependency/artifact trees prior to descent, treats Windows reparse points (junctions/symlinks) with strict boundary enforcement, identifies monorepo roots across 9 ecosystems to isolate reinstallation commands to workspace roots while cleaning member-level build artifacts, and enforces dual-layer path containment checks with strict guardrails preventing deletion of lockfiles, configuration, and source directories.

---

## 1. Observation

Direct testing was conducted in the active environment on Windows 11 with Windows PowerShell 5.1 (Build 26100 Revision 9711). The following direct observations were recorded:

### Observation 1.1: Runtime Environment & API Compatibility
- Command: `$PSVersionTable.PSVersion`
  - Output: `Major: 5, Minor: 1, Build: 26100, Revision: 9711`.
- Command: `Get-Command pwsh -ErrorAction SilentlyContinue`
  - Result: Failed (Exit code 1). PowerShell Core (`pwsh`) is not installed by default.
- Command: `[System.IO.Directory].GetMethod('ResolveLinkTarget') -eq $null`
  - Output: `True`.
  - Significance: `.NET Framework 4.8` (which powers Windows PowerShell 5.1) lacks `[System.IO.Directory]::ResolveLinkTarget` (added only in .NET 6+). Any code relying on this method will throw a terminating `MethodNotFoundException` on default Windows installations.

### Observation 1.2: Reparse Points (Junctions & Directory Symlinks) on Windows
- Command execution with temporary directory, junction, and DirectoryInfo inspection:
  - Reparse point attribute: `(($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0)` evaluates to `True`.
  - PowerShell extended properties: `$item.LinkType` returns `'Junction'`. `$item.Target` returns a `System.String[]` containing the target directory path.
  - Directory traversal vulnerability: Testing `[System.IO.Directory]::GetDirectories($repo, '*', [System.IO.SearchOption]::AllDirectories)` against a junction pointing to an external directory (`$outside\secret_dir`) resulted in:
    ```text
    - C:\...\repo\nested\esc_junc
    - C:\...\repo\nested\esc_junc\secret_dir
    ```
    `[System.IO.Directory]::GetDirectories` with `AllDirectories` blindly traversed outside the repository boundary through the junction.
  - Symlink creation privilege: Creating `ItemType SymbolicLink` failed with `Administrator privilege required for this operation`, whereas creating `ItemType Junction` succeeded without elevation.

### Observation 1.3: Real-World Monorepo Structure in Active Repository
- Workspace root: `C:\Users\yashs\.gemini\antigravity\worktrees\talentsphere-complete\universal_project_clean_reinstall`
  - Contains: `pnpm-workspace.yaml`, `package.json` (`"packageManager": "pnpm@11.7.0"`), and `pnpm-lock.yaml`.
  - Subdirectories: `apps/api`, `apps/web`, `apps/worker`, `packages/config`, `packages/contracts`, `packages/domain`, `packages/observability`, `packages/testing`, `packages/ui`.
  - Each child directory contains its own `package.json`.
  - Significance: If an automated script ran package manager reinstallation per discovered `package.json`, it would execute `pnpm install` 10 separate times, corrupting workspace linking, duplicating downloads, and breaking workspace dependencies (`workspace:*`).

### Observation 1.4: Path Canonicalization & Containment Test Results
- Function `Test-SafeDeletionPath` was evaluated against canonical attack vectors:
  - `Target = C:\repo\node_modules, Root = C:\repo` -> `IsSafe: True`
  - `Target = C:\repo\..\Windows\System32, Root = C:\repo` -> `IsSafe: False (Target escapes Project Root)`
  - `Target = C:\repo-sibling\node_modules, Root = C:\repo` -> `IsSafe: False (Target escapes Project Root)`
  - `Target = C:\repo, Root = C:\repo` -> `IsSafe: False (Target is identical to Project Root)`
  - `Target = C:\, Root = C:\repo` -> `IsSafe: False (Target is a drive root)`
  - `Target = C:\repo\apps\api\dist, Root = c:\Repo` -> `IsSafe: True (Case-insensitive match)`
  - `Target = C:\repo\.\apps\..\apps\api\..\..\node_modules, Root = C:\repo` -> `IsSafe: True (Resolves to C:\repo\node_modules)`

---

## 2. Logic Chain

From these observations, we derive the technical requirements, architecture, and specifications for Requirements R1 and R2.

### Section 2.1: Universal Project Discovery & Manifest Detection Specification

To support 9 diverse programming ecosystems without cross-language collision, project detection must follow an unambiguous precedence and manifest matrix.

```
                    ┌─────────────────────────────────────────┐
                    │      Directory Scanned at Depth <= 5    │
                    └────────────────────┬────────────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
    [Check Workspace Root Manifests]                [Check Project Manifests]
    - pnpm-workspace.yaml                           - package.json
    - package.json ("workspaces")                   - pyproject.toml / requirements.txt
    - Cargo.toml ([workspace])                      - *.sln / *.csproj / *.fsproj
    - *.sln / *.slnx                                - pom.xml / build.gradle(.kts)
    - go.work                                       - composer.json / Gemfile / go.mod
    - settings.gradle(.kts)                         - CMakeLists.txt / Makefile
                 │                                               │
                 └───────────────────────┬───────────────────────┘
                                         │
                                         ▼
                     [Resolve Package Manager & Lockfile]
                     [Determine Standalone vs Workspace Member]
```

#### Detailed Ecosystem Manifest Matrix

| Ecosystem | Manifest Files | Lockfiles / Identifiers | Package Manager Precedence Rules | Reinstall Command Target |
| :--- | :--- | :--- | :--- | :--- |
| **Node / JS / TS** | `package.json` | 1. `bun.lock`, `bun.lockb`<br>2. `pnpm-lock.yaml`<br>3. `yarn.lock`<br>4. `package-lock.json`<br>5. `npm-shrinkwrap.json` | 1. `packageManager` field in `package.json` takes priority (Corepack standard)<br>2. If `pnpm-workspace.yaml` present -> `pnpm`<br>3. Lockfile priority: `bun` -> `pnpm` -> `yarn` -> `npm`<br>4. Yarn version check: if `.yarnrc.yml` or `.yarn/releases` exists -> Yarn Berry; else Yarn Classic<br>5. Default fallback: `npm` | Workspace Root if member; project dir if standalone |
| **Python** | `pyproject.toml`, `setup.py`, `setup.cfg`, `requirements*.txt`, `Pipfile` | 1. `uv.lock`<br>2. `poetry.lock`<br>3. `Pipfile.lock`<br>4. `requirements.txt` (hashes) | 1. `uv.lock` or `[tool.uv]` in `pyproject.toml` -> `uv`<br>2. `poetry.lock` or `[tool.poetry]` in `pyproject.toml` -> `poetry`<br>3. `Pipfile.lock` or `Pipfile` -> `pipenv`<br>4. `pyproject.toml` / `requirements.txt` / `setup.py` -> `pip`<br>Note: Check for local `.venv` or `venv` directory | Local project directory (or workspace root if mono-repo virtualenv) |
| **.NET** | `*.sln`, `*.slnx`, `*.csproj`, `*.fsproj`, `*.vbproj` | `packages.lock.json`, `Directory.Packages.props` (CPM) | 1. `*.sln` or `*.slnx` at directory -> Solution Root (encompasses all child projects)<br>2. Standalone `*.csproj`/`*.fsproj` -> Single Project | Solution directory if `.sln` present; project directory otherwise |
| **Java / JVM** | Maven: `pom.xml`<br>Gradle: `build.gradle`, `build.gradle.kts`, `settings.gradle`, `settings.gradle.kts` | Maven: local `.m2`<br>Gradle: `gradle.lockfile` | 1. Local wrapper preference: `gradlew.bat` / `mvnw.cmd` takes precedence over global PATH<br>2. If both Maven and Gradle exist: prioritize Gradle if `gradlew.bat` or `settings.gradle` present, else Maven<br>3. Gradle multi-project: `settings.gradle(.kts)` indicates root | Root build directory |
| **PHP** | `composer.json` | `composer.lock` | 1. `composer.phar` in directory > global `composer`<br>2. Lockfile presence determines frozen install | Project directory |
| **Ruby** | `Gemfile` | `Gemfile.lock` | 1. `bundle` (Bundler)<br>2. Lockfile presence triggers `--frozen` | Project directory |
| **Rust** | `Cargo.toml` | `Cargo.lock` | 1. `Cargo.toml` with `[workspace]` -> Workspace Root<br>2. Standalone `Cargo.toml` -> Single Crate | Workspace root for workspace; crate dir for standalone |
| **Go** | `go.mod`, `go.work` | `go.sum`, `go.work.sum` | 1. `go.work` -> Go Workspace Root<br>2. `go.mod` -> Go Module | Workspace root if `go.work`; module dir otherwise |
| **CMake / Make** | `CMakeLists.txt`, `Makefile`, `makefile`, `GNUmakefile` | `CMakeCache.txt` | 1. `CMakeLists.txt` -> `cmake`<br>2. `Makefile` -> `make` / `mingw32-make` / `nmake` | Build directory |

---

### Section 2.2: Monorepo & Workspace Hierarchy Specification

Monorepos group multiple packages under a single root orchestration layer. Running package manager installs in sub-packages causes broken symlinks, broken workspace protocols (`workspace:*`), lockfile drift, and redundant network downloads.

#### Workspace Root Rules
A directory is classified as a **Workspace Root** (`IsWorkspaceRoot = $true`) if it contains any of:
1. `pnpm-workspace.yaml` (pnpm monorepo)
2. `package.json` with a non-null `"workspaces"` field (array or `{ "packages": [...] }`)
3. `lerna.json` (Lerna monorepo)
4. `turbo.json` (Turborepo)
5. `nx.json` (Nx monorepo)
6. `Cargo.toml` containing a `[workspace]` header table
7. One or more `*.sln` or `*.slnx` files (.NET Solution root)
8. `go.work` (Go Workspace)
9. `settings.gradle` or `settings.gradle.kts` containing `include` (Gradle multi-project)
10. `pom.xml` containing `<packaging>pom</packaging>` with `<modules>` (Maven multi-module)

#### Workspace Ownership & Parent-Child Logic
During directory traversal:
1. Maintain an active registry of discovered Workspace Roots: `$workspaceRoots = @()`.
2. When a manifest is discovered at path `$curr`:
   - Search `$workspaceRoots` for any root whose path is a strict ancestor of `$curr`:
     ```powershell
     $parentWs = $workspaceRoots | Where-Object {
         $curr.StartsWith($_.Path + '\', [System.StringComparison]::OrdinalIgnoreCase)
     } | Sort-Object { $_.Path.Length } | Select-Object -Last 1
     ```
   - If `$parentWs` is found, the current directory is assigned:
     - `IsWorkspaceMember = $true`
     - `WorkspaceRootPath = $parentWs.Path`
     - `WorkspaceType = $parentWs.Type`
   - If no ancestor workspace root is found:
     - `IsWorkspaceMember = $false`
     - `IsWorkspaceRoot = ($curr in $workspaceRoots)`

#### Clean vs Reinstall Policy for Workspaces
- **Cleanup Phase**:
  - Member packages ARE cleaned for their specific local build artifacts (e.g. `apps/web/.next`, `apps/api/dist`, `packages/ui/dist`, `services/sub/bin`, `services/sub/obj`).
  - Workspace root IS cleaned for shared root artifacts (e.g. root `node_modules`, `.turbo`, root `target`, root `.gradle`).
- **Reinstallation Phase**:
  - Member packages with `IsWorkspaceMember -eq $true` are **EXEMPT** from running dependency reinstallation (`[SKIP]`).
  - Dependency reinstallation is executed **EXCLUSIVELY at the Workspace Root**.
  - This guarantees that commands like `pnpm install --frozen-lockfile` or `dotnet restore Solution.sln` resolve and hoist all packages in a single deterministic pass.

---

### Section 2.3: Directory Traversal, Depth Limits & Reparse Point Guardrails

Traversing arbitrary user directories poses severe risks: massive performance degradation inside dependency trees, infinite loops from circular links, and accidental escape outside repository bounds.

#### Depth Limit Specification
- Default: `--max-depth 5`.
- Depth calculation relative to canonical repository root:
  ```powershell
  $depth = if ($currCanonical -eq $canonicalRepo) { 0 } else { ($currCanonical.Substring($canonicalRepo.Length).TrimStart('\')).Split('\').Length }
  if ($depth -gt $maxDepth) { continue }
  ```
- Subdirectory queuing stops when `$depth -ge $maxDepth`.

#### Pre-Descent Pruning (Skip List)
To avoid traversing tens of thousands of nested files, the scanner must prune candidate subdirectories **before** recursing:
- **Dependency folders**: `node_modules`, `.venv`, `venv`, `env`, `vendor`, `packages` (unless verified to contain workspace code), `bower_components`, `.bundle`.
- **Build / output folders**: `dist`, `build`, `out`, `target`, `bin`, `obj`, `.next`, `.nuxt`, `.turbo`, `.output`, `.svelte-kit`, `.parcel-cache`, `.docusaurus`, `storybook-static`, `cmake-build-debug`, `cmake-build-release`, `CMakeFiles`.
- **VCS & metadata**: `.git`, `.svn`, `.hg`, `.agents`, `.reticle`.
- **Cache folders**: `__pycache__`, `.pytest_cache`, `.mypy_cache`, `.ruff_cache`, `.tox`, `.nox`, `.gradle`, `.cargo`, `.m2`, `.cache`, `.vs`, `.idea`.
- **Custom excludes**: Any folder or wildcard matching user-supplied `--exclude <pattern>`.

#### Windows Reparse Point (Junction & Symlink) Boundary Enforcement
As observed in Observation 1.2, standard .NET traversal functions follow junctions into external directories. The engine must enforce:
1. **Reparse Point Identification**:
   ```powershell
   $isReparse = (($dirInfo.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0)
   ```
2. **Target Extraction without .NET 6 API**:
   In PowerShell 5.1, use the extended `Target` property on `DirectoryInfo`:
   ```powershell
   $rawTarget = if ($dirInfo.Target) { $dirInfo.Target[0] } else { $null }
   ```
3. **Containment Verification**:
   - If `$rawTarget` is relative, resolve against `$dirInfo.Parent.FullName`.
   - Canonicalize target: `$canonicalTarget = [System.IO.Path]::GetFullPath($rawTarget).TrimEnd('\')`.
   - Check if `$canonicalTarget.StartsWith($canonicalRepoRoot + '\', [System.StringComparison]::OrdinalIgnoreCase) -or ($canonicalTarget -eq $canonicalRepoRoot)`.
4. **Action on Reparse Points**:
   - If target points outside repository boundary: **REJECT and LOG WARNING** (`[SECURITY] Skipping escaping junction/symlink: '<Path>' -> points to external '<Target>'`).
   - If target points inside repository boundary: **SKIP DESCENT** to prevent duplicate project registration and circular traversal loops (`A -> B -> A`).

---

### Section 2.4: Safe & Comprehensive Cleanup Operations Specification

Cleanup must thoroughly remove generated build artifacts and dependency trees while guaranteeing zero data loss of human-written code, configuration, and lockfiles.

#### Comprehensive Cleanup Mapping Matrix

| Tech Stack | Standard Clean Folders & Files | Deep Clean Additional Folders & Files (`--deep-clean`) |
| :--- | :--- | :--- |
| **Node / JS / TS** | Folders: `node_modules`, `dist`, `build`, `out`, `.next`, `.nuxt`, `.output`, `.turbo`, `.svelte-kit`, `.parcel-cache`, `.docusaurus`, `storybook-static` | Files: `.eslintcache`, `.tsbuildinfo`, `npm-debug.log*`, `yarn-error.log*`, `pnpm-debug.log*`, `lerna-debug.log*`<br>Folders: `coverage`, `.nyc_output`, `.cache` |
| **Python** | Folders: `.venv`, `venv`, `env`, `__pycache__`, `build`, `dist`, `*.egg-info`, `*.dist-info`<br>Files: `*.pyc`, `*.pyo`, `*.pyd` | Folders: `.pytest_cache`, `.mypy_cache`, `.ruff_cache`, `.tox`, `.nox`, `htmlcov`<br>Files: `.coverage`, `.coverage.*` |
| **.NET** | Folders: `bin`, `obj`, `TestResults`<br>Old root package folders (if verified NuGet cache) | Folders: `.vs` (Visual Studio local cache; only temp files/suo)<br>Folders: `BenchmarkDotNet.Artifacts` |
| **Java / JVM** | Folders: `target` (Maven), `build` (Gradle), `.gradle` (Gradle project cache) | Files: `.flattened-pom.xml`, `.gradletasknamecache` |
| **PHP** | Folders: `vendor` | Files: `.phpunit.result.cache` |
| **Ruby** | Folders: `vendor/bundle`, `.bundle` | Folders: `coverage` |
| **Rust** | Folders: `target` | None (Cargo.lock is strictly protected) |
| **Go** | Folders: `vendor` (if created via `go mod vendor`), local `bin/` | Files: `coverage.out`, `profile.out` |
| **CMake / Make** | Folders: `build`, `cmake-build-*`, `CMakeFiles`<br>Files: `CMakeCache.txt` | Files: `Makefile.cmake`, `cmake_install.cmake`, `*.o`, `*.obj`, `*.a`, `*.lib`, `*.dll`, `*.so`, `*.dylib` |

#### Absolute Guardrails: What Must NEVER Be Deleted

Under no circumstances may any of the following be deleted, even under `--deep-clean`:
1. **Lockfiles**:
   - `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`, `bun.lock`, `bun.lockb`
   - `poetry.lock`, `uv.lock`, `Pipfile.lock`
   - `packages.lock.json`
   - `composer.lock`
   - `Gemfile.lock`
   - `Cargo.lock`
   - `go.sum`, `go.work.sum`
2. **Project Manifests**:
   - `package.json`, `pnpm-workspace.yaml`, `lerna.json`, `turbo.json`, `nx.json`
   - `pyproject.toml`, `setup.py`, `setup.cfg`, `requirements*.txt`, `Pipfile`
   - `*.sln`, `*.slnx`, `*.csproj`, `*.fsproj`, `*.vbproj`, `Directory.Build.props`, `Directory.Packages.props`, `global.json`, `nuget.config`
   - `pom.xml`, `build.gradle`, `build.gradle.kts`, `settings.gradle`, `settings.gradle.kts`, `gradlew*`, `mvnw*`
   - `composer.json`, `Gemfile`, `Cargo.toml`, `go.mod`, `go.work`, `CMakeLists.txt`, `Makefile`
3. **Environment & Secrets**:
   - `.env*` (`.env`, `.env.local`, `.env.development`, `.env.production`, `.env.test`, `.env.example`, etc.)
4. **Version Control**:
   - `.git`, `.gitignore`, `.gitattributes`, `.github`
5. **IDE Settings**:
   - `.vscode`, `.idea`
6. **Source Code Directories (Directory Blacklist)**:
   - `src`, `lib`, `app`, `apps`, `packages`, `components`, `pages`, `routes`, `services`, `include`, `docs`, `documentation`, `scripts`, `tools`, `config`, `public`, `assets`, `tests`, `test`, `spec`.

---

### Section 2.5: Path Canonicalization & Containment Verification Specification

To prevent catastrophic deletion of parent directories, root drives, or operating system paths, the engine must implement a dual-layer path validation guard.

#### Path Canonicalization Algorithm (PowerShell)

```powershell
function Test-SafeDeletionPath {
    param(
        [Parameter(Mandatory=$true)][string]$TargetPath,
        [Parameter(Mandatory=$true)][string]$RootPath
    )

    # 1. Canonicalize full paths using .NET Path engine
    try {
        $canonicalRoot = [System.IO.Path]::GetFullPath($RootPath).TrimEnd('\', '/')
        $canonicalTarget = [System.IO.Path]::GetFullPath($TargetPath).TrimEnd('\', '/')
    } catch {
        return @{ IsSafe = $false; Reason = "Invalid path syntax: $($_.Exception.Message)" }
    }

    # 2. Guard against empty or whitespace paths
    if ([string]::IsNullOrWhiteSpace($canonicalRoot) -or [string]::IsNullOrWhiteSpace($canonicalTarget)) {
        return @{ IsSafe = $false; Reason = "Path is null or whitespace" }
    }

    # 3. Forbid Root Drives (e.g. C:, C:\, D:\, \\server\share)
    $rootDrive = [System.IO.Path]::GetPathRoot($canonicalTarget).TrimEnd('\', '/')
    if ($canonicalTarget.Equals($rootDrive, [System.StringComparison]::OrdinalIgnoreCase) -or $canonicalTarget.Length -le 3) {
        return @{ IsSafe = $false; Reason = "Target is a drive or filesystem root: '$canonicalTarget'" }
    }

    # 4. Forbid Critical System Directories
    $systemDirs = @(
        $env:SystemRoot,
        $env:ProgramFiles,
        ${env:ProgramFiles(x86)},
        $env:ProgramData,
        $env:USERPROFILE
    ) | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | ForEach-Object {
        [System.IO.Path]::GetFullPath($_).TrimEnd('\', '/')
    }

    foreach ($sysDir in $systemDirs) {
        if ($canonicalTarget.Equals($sysDir, [System.StringComparison]::OrdinalIgnoreCase)) {
            return @{ IsSafe = $false; Reason = "Target is a critical system directory: '$canonicalTarget'" }
        }
    }

    # 5. Target MUST NOT be identical to the Project Root itself
    if ($canonicalTarget.Equals($canonicalRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
        return @{ IsSafe = $false; Reason = "Target is identical to Project Root: '$canonicalTarget'" }
    }

    # 6. Target MUST be strictly inside Project Root (enforce trailing separator!)
    $rootWithSlash = $canonicalRoot + '\'
    if (-not $canonicalTarget.StartsWith($rootWithSlash, [System.StringComparison]::OrdinalIgnoreCase)) {
        return @{ IsSafe = $false; Reason = "Target '$canonicalTarget' escapes Project Root '$canonicalRoot'" }
    }

    # 7. Check Guardrail: Must not match protected file patterns or source directory blacklist
    $targetName = [System.IO.Path]::GetFileName($canonicalTarget)
    $protectedPatterns = @(
        'package-lock.json', 'pnpm-lock.yaml', 'yarn.lock', 'bun.lock', 'bun.lockb',
        'Cargo.lock', 'poetry.lock', 'uv.lock', 'Pipfile.lock', 'composer.lock', 'Gemfile.lock', 'packages.lock.json', 'go.sum', 'go.work.sum',
        'package.json', 'pnpm-workspace.yaml', 'lerna.json', 'turbo.json', 'nx.json',
        'pyproject.toml', 'setup.py', 'setup.cfg', 'Pipfile', 'requirements*.txt',
        'pom.xml', 'build.gradle*', 'settings.gradle*', 'gradlew*', 'mvnw*',
        '*.sln', '*.slnx', '*.csproj', '*.fsproj', '*.vbproj', 'Directory.Build.props', 'Directory.Packages.props', 'global.json', 'nuget.config',
        'composer.json', 'Gemfile', 'Cargo.toml', 'go.mod', 'go.work', 'CMakeLists.txt', 'Makefile', 'makefile', 'GNUmakefile',
        '.git', '.gitignore', '.gitattributes', '.github',
        '.env*'
    )

    foreach ($pattern in $protectedPatterns) {
        if ($targetName -like $pattern) {
            return @{ IsSafe = $false; Reason = "Target matches strictly protected file pattern: '$pattern'" }
        }
    }

    $sourceDirBlacklist = @(
        'src', 'lib', 'app', 'apps', 'packages', 'components', 'pages', 'routes',
        'services', 'include', 'docs', 'documentation', 'scripts', 'tools',
        'config', 'public', 'assets', 'tests', 'test', 'spec', '.vscode', '.idea'
    )

    if ($sourceDirBlacklist -contains $targetName) {
        return @{ IsSafe = $false; Reason = "Target matches blacklisted source/config directory: '$targetName'" }
    }

    return @{
        IsSafe = $true
        CanonicalTarget = $canonicalTarget
        CanonicalRoot = $canonicalRoot
    }
}
```

---

## 3. Caveats

1. **PowerShell 5.1 vs 7 Reparse APIs**: As demonstrated in Observation 1.1, `[System.IO.Directory]::ResolveLinkTarget` is unavailable on Windows PowerShell 5.1 (.NET Framework 4.8). The engine must rely on PowerShell's extended `$item.Target` property rather than newer .NET methods.
2. **Ambiguity of `packages/` directory**: In older .NET solutions, NuGet deposited package binaries into a solution-level `packages/` folder. In Node monorepos, `packages/` contains all workspace source libraries. Deleting `packages/` in a Node monorepo is catastrophic. The rule is: `packages/` is blacklisted by default; it may ONLY be cleaned in a .NET project if it contains a `repositories.config` file confirming it is a legacy NuGet package cache.
3. **Virtualenv vs `.env` file**: A common defect in naive scripts is treating any item named `.env*` as a virtual environment. The engine must check `[System.IO.Directory]::Exists($path)` AND verify the existence of `pyvenv.cfg` or `Scripts/python.exe` before treating any folder as a Python virtualenv. Files named `.env` are strictly protected secrets.
4. **Locked Files on Windows**: On Windows, files held open by running processes (e.g. IDEs, Node dev servers, language servers) throw `UnauthorizedAccessException` or `IOException` during deletion. The cleanup engine should use a retry loop (e.g. 3 attempts with 200ms delay) and, if `--continue-on-error` is specified, log a warning without crashing the entire run.

---

## 4. Conclusion

1. **Discovery Architecture**: Project discovery should be implemented as a breadth-first search (queue-based) traversal rather than unbounded recursion, bounded strictly by `--max-depth` (default 5).
2. **Reparse Point Defense**: All directories must be checked for `[System.IO.FileAttributes]::ReparsePoint`. Escaping junctions/symlinks must be rejected immediately; internal junctions/symlinks must be skipped during discovery descent to prevent infinite loops.
3. **Workspace Ownership**: When a Workspace Root is identified (`pnpm-workspace.yaml`, `"workspaces"`, `[workspace]`, `*.sln`, etc.), all descendant projects within that subtree must be registered as workspace members. Members are cleaned for local output artifacts, but dependency reinstallation must be executed exclusively at the workspace root.
4. **Deterministic Deletion Safety**: Every path candidate for deletion must pass `Test-SafeDeletionPath`, guaranteeing canonical root containment, drive-root rejection, system directory rejection, lockfile protection, and source directory blacklisting.

---

## 5. Verification Method

Workers implementing R1 and R2 can independently verify compliance with this specification using the following concrete automated test suite:

### Test 1: Reparse Point & Boundary Rejection Verification
Run this PowerShell verification script:
```powershell
$temp = [System.IO.Path]::Combine([System.IO.Path]::GetTempPath(), [System.Guid]::NewGuid().ToString())
$outside = [System.IO.Path]::Combine([System.IO.Path]::GetTempPath(), [System.Guid]::NewGuid().ToString())
try {
    New-Item -ItemType Directory -Path "$temp\repo\nested" -Force | Out-Null
    New-Item -ItemType Directory -Path "$outside\secret" -Force | Out-Null
    New-Item -ItemType File -Path "$outside\secret\manifest.txt" -Force | Out-Null
    New-Item -ItemType Junction -Path "$temp\repo\nested\esc_junc" -Target "$outside" | Out-Null

    # Verify discovery ignores external files through escaping junction
    # Invalidation condition: any item from $outside appears in discovered projects
} finally {
    Remove-Item -Recurse -Force $temp, $outside -ErrorAction SilentlyContinue
}
```

### Test 2: Path Containment Guard Verification
Execute the test cases defined in Observation 1.4:
- Invalidation condition: `Test-SafeDeletionPath` returns `IsSafe: True` for any path outside `$RootPath`, for `$RootPath` itself, for drive roots (e.g. `C:\`), for `.env*`, or for lockfiles (`pnpm-lock.yaml`, `package-lock.json`, `Cargo.lock`, etc.).

### Test 3: Monorepo Root Reinstallation Isolation Verification
Create a mock monorepo with root `pnpm-workspace.yaml` and member `apps/web/package.json`:
- Invalidation condition: Dependency reinstallation is invoked in `apps/web/` instead of exclusively at the monorepo root.
