# Project: Universal Project Clean & Reinstall

## Architecture
The universal clean-and-reinstall system provides a dual-layer toolset:
1. `clean-reinstall.bat`: Zero-setup Windows batch entry point that automatically detects `pwsh.exe` or `powershell.exe`, bypasses execution policy for the process (`-ExecutionPolicy Bypass -NoProfile`), transparently quotes arguments (`%*`), and forwards the process exit code.
2. `clean-reinstall.ps1`: The core engine written to be 100% compatible with Windows PowerShell 5.1 and PowerShell Core 7+. It comprises five modular functional layers:
   - **CLI & Parameter Layer**: Parameter binding with kebab-case aliases (`[Alias('dry-run')]`, etc.), mutual exclusivity validation, and interactive confirmation prompt.
   - **Logging & Redaction Layer**: Structured timestamped logging (`clean-reinstall_<timestamp>.log`), regex-based token/secret redaction, and colorized console output (`Write-Host -ForegroundColor`).
   - **Discovery & Workspace Engine**: Recursive depth-bounded directory scanner (`--max-depth`, default 5), directory pruning (skipping dependency/artifact folders without descent), reparse point / junction boundary enforcement, multi-ecosystem manifest detection (9+ stacks), and monorepo workspace hierarchy resolution (tagging workspace members vs workspace roots).
   - **Safe Cleanup Engine**: Target artifact folder resolution (standard vs `--deep-clean`), strict path canonicalization and containment verification (blocking root drives, system dirs, and parent directory escapes), and absolute protection of source code, lockfiles, and environment files.
   - **Deterministic Reinstallation & Build Engine**: Tool detection via PATH (`Get-Command` executable resolution), wrapper resolution (`mvnw.cmd`, `gradlew.bat`), frozen/immutable lockfile command matrix, post-install build execution (`--build`), and real-time output streaming with `$LASTEXITCODE` preservation under `--continue-on-error`.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Batch Wrapper (`clean-reinstall.bat`) | Forwarding `%*`, path quoting (`%~dp0`), pwsh/powershell fallback, execution policy bypass, exit code forwarding | M1 | Survey R4 |
| 2 | CLI Parameter Parsing & Aliases | Support double-dash kebab-case flags (`--dry-run`, `--clean-only`, `--install-only`, `--build`, `--deep-clean`, `--root`, `--exclude`, `--max-depth`, `--continue-on-error`, `--yes`, `--verbose`, `--help`) | M1 | Survey R4 |
| 3 | Parameter Validation & Mutex | Mutually exclusive flag checks (e.g. `--clean-only` and `--install-only`), integer boundary checks | M1 | Survey R4 |
| 4 | Structured Logging & Secret Redaction | Timestamped file logger (`clean-reinstall_<timestamp>.log`), regex redacting NPM tokens, GitHub PATs, Bearer tokens, AWS keys, passwords | M1 | Survey R4 |
| 5 | Path Canonicalization & Containment Guard | Resolve canonical paths, verify targets are strictly inside project root, forbid drive root (`C:\`) and Windows system dirs | M1 | Survey R2 |
| 6 | Directory Scanner with `--max-depth` | Iterative/recursive directory scan bounded by configurable depth limit (default 5) | M2 | Survey R1 |
| 7 | Traversal Pruning | Skip scanning into dependency/output directories (`node_modules`, `.venv`, `vendor`, `target`, `bin`, `obj`, `.next`, etc.) | M2 | Survey R1 |
| 8 | Reparse Point & Junction Boundary Security | Detect reparse points/junctions, verify link targets remain inside repository root, reject escaping links (compatible with PS 5.1 / .NET 4.8) | M2 | Survey R1 |
| 9 | Multi-Ecosystem Manifest Detection | Identify Node, Python, .NET, Java/JVM, PHP, Ruby, Rust, Go, CMake/Make manifests and lockfiles | M2 | Survey R1 |
| 10 | Monorepo Workspace Root & Member Resolution | Detect workspace roots (pnpm, npm/yarn, lerna, turbo, nx, cargo, sln, go.work); mark nested packages as workspace-managed | M2 | Survey R1 |
| 11 | Safe Cleanup Mapping (Standard Clean) | Map tech stacks to local artifact directories (`node_modules`, `.venv`, `bin`, `obj`, `target`, `dist`, `vendor`) | M3 | Survey R2 |
| 12 | Deep Cleanup (`--deep-clean`) | Extended cache removal (`.turbo`, `.next`, `.nuxt`, `__pycache__`, `.pytest_cache`, `.cache`, etc.) | M3 | Survey R2 |
| 13 | Absolute Deletion Guardrails | Strict preservation of source code, lockfiles (`pnpm-lock.yaml`, `package-lock.json`, `yarn.lock`, `poetry.lock`, `Cargo.lock`, etc.), `.env*`, `.git`, IDE files | M3 | Survey R2 |
| 14 | Dry-Run Simulation (`--dry-run`) | Enumerate and display planned deletions without altering disk state | M3 | Survey R2 |
| 15 | Tool & Runtime PATH Detection | Detect CLI availability using `Get-Command` executable resolution (`.cmd`, `.exe`, `.bat`); graceful warn/skip if missing | M4 | Survey R3 |
| 16 | Local Wrapper Preference | Prioritize local project wrappers (`mvnw.cmd`/`mvnw`, `gradlew.bat`/`gradlew`) over global PATH installations | M4 | Survey R3 |
| 17 | Deterministic Reinstallation Matrix | Execute frozen/immutable lockfile commands matching detected package managers; install ONLY at workspace root for monorepos | M4 | Survey R3 |
| 18 | Post-Install Rebuild (`--build`) | Trigger build commands post-reinstallation when standard build scripts or manifests exist | M4 | Survey R3 |
| 19 | Streaming Output & Error Handling | Stream process stdout/stderr without `NativeCommandError` frames, preserve `$LASTEXITCODE`, support `--continue-on-error` | M4 | Survey R3 |
| 20 | Interactive Confirmation Prompt | Present summary of planned deletions and require Y/N confirmation when invoked without arguments; guard non-interactive sessions | M5 | Survey R4 |
| 21 | Colorized Console Output & Run Summary | Format tabular summary of discovered, cleaned, reinstalled, skipped, and failed projects with proper process exit code | M5 | Survey R4 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | CLI, Logging, & Safety Guardrails | `clean-reinstall.bat`, CLI parameter definitions & kebab aliases, logging with secret redaction, path canonicalization & containment guardrails | none | PLANNED |
| M2 | Project Discovery, Reparse Points & Workspace Engine | Depth-bounded scanner, directory pruning, reparse point boundary check, multi-stack manifest detection, monorepo workspace resolution | M1 | PLANNED |
| M3 | Safe Cleanup & Dry-Run Engine | Standard vs deep cleanup mappings, dry-run simulation, absolute lockfile & source protection guardrails, safe directory deletion | M1, M2 | PLANNED |
| M4 | Deterministic Reinstallation & Build Engine | Tool availability checks, wrapper resolution, deterministic frozen/immutable command matrix, `--build` execution, streaming output & error handling | M1, M2 | PLANNED |
| M5 | Interactive UX, Summary Reporting & Assembly | Interactive confirmation prompt, non-interactive stdin guard, colorized console output, final summary table & exit code protocol | M1, M2, M3, M4 | PLANNED |
| M6 | Final Acceptance: E2E Test Suite & Adversarial Hardening | Pass 100% of Dual-Track E2E Test Suite (Tiers 1-4, 38+ test cases) followed by Phase 2 white-box adversarial coverage hardening (Tier 5) | M1, M2, M3, M4, M5, Test Track | PLANNED |

## Interface Contracts
### CLI & Entry Contract
- `clean-reinstall.bat [args...]` -> Calls `clean-reinstall.ps1 [args...]` via `-ExecutionPolicy Bypass -NoProfile -File "%~dp0clean-reinstall.ps1" %*` and returns `%ERRORLEVEL%`.
- `clean-reinstall.ps1` accepts:
  - `-DryRun` / `--dry-run` [switch]
  - `-CleanOnly` / `--clean-only` [switch]
  - `-InstallOnly` / `--install-only` [switch]
  - `-Build` / `--build` [switch]
  - `-DeepClean` / `--deep-clean` [switch]
  - `-Root` / `--root` [string] (default: current directory)
  - `-Exclude` / `--exclude` [string[]]
  - `-MaxDepth` / `--max-depth` [int] (default: 5)
  - `-ContinueOnError` / `--continue-on-error` [switch]
  - `-Yes` / `--yes` / `-y` [switch]
  - `-VerboseOutput` / `--verbose` [switch]
  - `-Help` / `--help` / `-h` [switch]

### Internal Engine Contracts
- `Test-SafePathContainment(string $targetPath, string $rootPath) -> [bool]`
  - Returns `$true` only if canonical target is strictly a descendant of canonical root, not identical, and root is not a drive/system root.
- `Get-DiscoveredProjects(string $rootPath, int $maxDepth, string[] $excludes) -> [DiscoveredProject[]]`
  - Returns array of project objects with properties: `Path`, `RelativePath`, `Ecosystem`, `ManifestFile`, `PackageManager`, `Lockfile`, `IsWorkspaceRoot`, `IsWorkspaceMember`, `WorkspaceRootPath`, `CleanTargets`.
- `Invoke-SafeClean(DiscoveredProject[] $projects, bool $dryRun, bool $deepClean) -> [CleanSummary]`
  - Deletes target directories safely or simulates deletions. Emits clean statistics.
- `Invoke-ReinstallAndBuild(DiscoveredProject[] $projects, bool $build, bool $continueOnError) -> [InstallSummary]`
  - Executes deterministic package manager commands on standalone projects and workspace roots; skips workspace members for installation.

## Code Layout
- `clean-reinstall.bat`: Main Windows batch wrapper
- `clean-reinstall.ps1`: Unified production PowerShell engine containing all layers
- `tests/`:
  - `tests/run-tests.ps1`: Zero-dependency native PowerShell E2E test runner
  - `tests/test-tier1-feature-coverage.ps1`: Tier 1 feature tests (>=5 tests per feature)
  - `tests/test-tier2-boundary-corners.ps1`: Tier 2 boundary, depth, junction, and guardrail tests
  - `tests/test-tier3-cross-feature.ps1`: Tier 3 pairwise cross-feature combination tests
  - `tests/test-tier4-scenarios.ps1`: Tier 4 realistic polyglot monorepo workload tests
