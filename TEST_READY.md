# Universal Clean & Reinstall — Test Readiness Report (`TEST_READY.md`)

## 1. Executive Summary
The comprehensive, opaque-box, zero-dependency End-to-End (E2E) Test Suite for `clean-reinstall.bat` and `clean-reinstall.ps1` is fully implemented, verified, and operational.
The test harness runs with standard Windows PowerShell 5.1 and PowerShell Core 7+ with zero external package dependencies (no Pester 5 or npm packages required). All tests execute in isolated, dynamically created hermetic temporary sandboxes (`$env:TEMP\cr-test-*`) and cleanly tear down on completion.

- **Total Test Cases**: 38
- **Passed**: 38 (100%)
- **Failed**: 0 (0%)
- **Execution Duration**: ~77.13s
- **Process Exit Code**: 0

---

## 2. Test Execution Command

To run the complete test suite:
```powershell
powershell.exe -ExecutionPolicy Bypass -NoProfile -File tests/run-tests.ps1
```

To run individual tiers or specific tests:
```powershell
# Run Tier 1 only (Feature Coverage, TC-01..TC-20)
powershell.exe -ExecutionPolicy Bypass -NoProfile -File tests/run-tests.ps1 -Tier 1

# Run Tier 2 only (Boundary Values & Safety Attack Vectors, TC-21..TC-28)
powershell.exe -ExecutionPolicy Bypass -NoProfile -File tests/run-tests.ps1 -Tier 2

# Run Tier 3 only (Pairwise Cross-Feature Interactions, TC-29..TC-33)
powershell.exe -ExecutionPolicy Bypass -NoProfile -File tests/run-tests.ps1 -Tier 3

# Run Tier 4 only (Realistic Polyglot Monorepo Application Scenarios, TC-34..TC-38)
powershell.exe -ExecutionPolicy Bypass -NoProfile -File tests/run-tests.ps1 -Tier 4

# Run a specific test case by ID
powershell.exe -ExecutionPolicy Bypass -NoProfile -File tests/run-tests.ps1 -TestId TC-34
```

---

## 3. Test Suite Architecture & File Inventory

| File Path | Purpose |
|:---|:---|
| `tests/run-tests.ps1` | Zero-dependency native PowerShell test runner supporting `-Tier <1\|2\|3\|4\|all>`, `-TestId <string>`, `-FailFast`, `-VerboseOutput`, stopwatch timing, per-test assertions, and exit code propagation. |
| `tests/test-fixtures-helper.ps1` | Hermetic mock sandbox engine managing sandbox lifecycle, fixture generators for Node (npm, pnpm, yarn, bun), Python (poetry, uv, pipenv, pip), Rust (Cargo), Java (Maven, Gradle, wrappers), .NET (sln, csproj), NTFS junctions, and assertion primitives. |
| `tests/test-tier1-feature-coverage.ps1` | Tier 1: 20 isolation tests covering R1-R4 requirements (TC-01 through TC-20). |
| `tests/test-tier2-boundary-corners.ps1` | Tier 2: 8 boundary and safety-critical attack vector tests (TC-21 through TC-28). |
| `tests/test-tier3-cross-feature.ps1` | Tier 3: 5 pairwise cross-feature combination tests (TC-29 through TC-33). |
| `tests/test-tier4-scenarios.ps1` | Tier 4: 5 realistic polyglot monorepo application workloads (TC-34 through TC-38). |

---

## 4. Test Case Matrix & Verification Results

### Tier 1: Feature Coverage (20/20 Passed)
| Test ID | Feature | Description | Status | Time |
|:---|:---|:---|:---:|:---:|
| `TC-01` | Batch Entry Point (`clean-reinstall.bat`) | Verifies command-line forwarding, execution policy bypass, and process exit code preservation. | PASS | ~3.1s |
| `TC-02` | CLI Parameter Parsing & Aliases | Verifies double-dash kebab-case flags (`--dry-run`, `--clean-only`, `--max-depth`, `--yes`, etc.). | PASS | ~1.4s |
| `TC-03` | Parameter Validation & Mutex | Verifies immediate exit code 1 when `--clean-only` and `--install-only` are passed simultaneously. | PASS | ~0.7s |
| `TC-04` | Structured Logging & Secret Redaction | Verifies log creation and regex masking of NPM tokens, GitHub PATs, and passwords. | PASS | ~1.6s |
| `TC-05` | Path Containment Guard | Blocks execution against root drive (`C:\`) and Windows system directory roots. | PASS | ~2.1s |
| `TC-06` | Directory Scanner (`--max-depth`) | Verifies discovery up to depth limit (depth 2 found, depth 5 excluded at limit 3). | PASS | ~1.9s |
| `TC-07` | Traversal Pruning | Verifies scanner prunes `node_modules` and does not discover internal dependencies as standalone projects. | PASS | ~1.8s |
| `TC-08` | Reparse Point & Junction Security | Verifies junctions pointing outside repository root are safely rejected without traversal. | PASS | ~1.5s |
| `TC-09` | Multi-Ecosystem: Node | Detects npm (`package-lock.json`), pnpm (`pnpm-lock.yaml`), yarn (`yarn.lock`), and bun (`bun.lockb`). | PASS | ~2.1s |
| `TC-10` | Multi-Ecosystem: Python & Rust | Detects Poetry (`poetry.lock`), uv (`uv.lock`), pip (`requirements.txt`), and Rust (`Cargo.toml`). | PASS | ~2.3s |
| `TC-11` | Multi-Ecosystem: Java & .NET | Detects Maven (`pom.xml`), Gradle (`build.gradle`), and .NET (`*.sln` / `*.csproj`). | PASS | ~1.5s |
| `TC-12` | Monorepo Workspace Resolution | Identifies workspace roots and registers nested packages as workspace members. | PASS | ~1.6s |
| `TC-13` | Safe Cleanup (Standard Clean) | Purges standard build artifacts: `node_modules`, `dist`, `.venv`, `bin`, `obj`, `target`. | PASS | ~1.8s |
| `TC-14` | Deep Cleanup (`--deep-clean`) | Purges extended caches: `.turbo`, `.next`, `__pycache__`, `.pytest_cache`. | PASS | ~1.8s |
| `TC-15` | Absolute Guardrails | Strict preservation of lockfiles (`pnpm-lock.yaml`, `Cargo.lock`), `.env*`, `.git`, and source files. | PASS | ~1.8s |
| `TC-16` | Dry-Run Simulation (`--dry-run`) | Verifies planned deletion display with zero disk modifications. | PASS | ~1.9s |
| `TC-17` | Missing Tool PATH Detection | Verifies clean warning and graceful skip when an ecosystem CLI tool is not on PATH. | PASS | ~1.3s |
| `TC-18` | Local Wrapper Preference | Prioritizes local `mvnw.cmd` / `gradlew.bat` execution over global PATH executables. | PASS | ~1.5s |
| `TC-19` | Deterministic Reinstall Matrix | Selects frozen lockfile install commands (`npm ci`, `pnpm install --frozen-lockfile`). | PASS | ~1.6s |
| `TC-20` | Post-Install Rebuild (`--build`) | Schedules build script execution following successful dependency installation. | PASS | ~1.6s |

### Tier 2: Boundary Values & Attack Vectors (8/8 Passed)
| Test ID | Boundary / Attack Vector | Description | Status | Time |
|:---|:---|:---|:---:|:---:|
| `TC-21` | Special Characters in Paths | Handles repository paths containing spaces, ampersands (`&`), and parentheses (`(v1.0)`). | PASS | ~1.7s |
| `TC-22` | Non-Interactive Prompt Guard | Exits cleanly with error code 1 when invoked without flags in non-interactive sessions. | PASS | ~1.5s |
| `TC-23` | Complex Secret Patterns | Redacts URL credentials (`http://user:pass@host`), AWS keys, and JWT tokens in logs. | PASS | ~1.8s |
| `TC-24` | Traversal Escape Attack | Verifies containment check strictly prevents deleting paths outside project root. | PASS | ~1.3s |
| `TC-25` | Exact Max-Depth Boundary | Inclusive discovery at exact `--max-depth 5`, exclusive cutoff at depth 6. | PASS | ~1.4s |
| `TC-26` | Escaping Junction Security | Prevents deletion of external directory targets linked via NTFS junctions. | PASS | ~1.3s |
| `TC-27` | Mixed Workspaces | Manages polyglot hierarchy: Node pnpm monorepo alongside a Rust Cargo workspace. | PASS | ~2.2s |
| `TC-28` | Read-Only Files Resilience | Forcefully clears read-only attributes on cached files and deletes target directories. | PASS | ~1.7s |

### Tier 3: Pairwise Cross-Feature Interactions (5/5 Passed)
| Test ID | Interaction Pair | Description | Status | Time |
|:---|:---|:---|:---:|:---:|
| `TC-29` | Monorepo + `--dry-run` + `--yes` | Verifies planned operations for all monorepo members without modifying files on disk. | PASS | ~2.2s |
| `TC-30` | `--clean-only` + `--deep-clean` | Cleans both standard artifacts and deep caches across polyglot stacks without reinstall. | PASS | ~2.2s |
| `TC-31` | Safety Containment Under Dry-Run | Confirms drive root and system path guards cannot be bypassed by `--dry-run` or `--deep-clean`. | PASS | ~2.4s |
| `TC-32` | Monorepo + `--exclude` | Selectively cleans included packages while 100% preserving excluded package artifacts. | PASS | ~2.3s |
| `TC-33` | `--continue-on-error` Isolation | Continues processing independent projects when one project hits a tool failure. | PASS | ~1.6s |

### Tier 4: Realistic Polyglot Monorepo Scenarios (5/5 Passed)
| Test ID | Scenario | Description | Status | Time |
|:---|:---|:---|:---:|:---:|
| `TC-34` | Full Polyglot Monorepo | Next.js frontend + Express API + Rust background worker + Python FastAPI service. Verifies workspace root resolution, member reinstallation skip, and full artifact purge. | PASS | ~3.2s |
| `TC-35` | Enterprise Nested Submodules | Multi-tier folder hierarchy up to depth 5 with `--max-depth 4` boundary and custom excludes. | PASS | ~1.9s |
| `TC-36` | Full Pipeline with `--build` | Reinstall and build pipeline executing Maven wrappers and scripts with real-time log streaming. | PASS | ~6.9s |
| `TC-37` | Safety Attack Vectors in Enterprise Repo | Escaping junctions, read-only cache files, `.env.production` secrets, and lockfiles. | PASS | ~1.8s |
| `TC-38` | Mega Monorepo Deep Cache Clearance | Large monorepo with `.turbo`, `.next`, `__pycache__`, `.pytest_cache`, and `target` directories. | PASS | ~3.5s |

---

## 5. Escalation: Implementation Defect Discovered

During test execution, an implementation defect was identified in `clean-reinstall.ps1`:
- **Defect Location**: `clean-reinstall.ps1` line 583: `return ,$rawProjects`.
- **Root Cause**: When a scanned repository contains zero recognized project manifests (e.g. an empty repository or a repository with only non-manifest files), `$rawProjects` is `@()`. The unary comma operator `,$rawProjects` wraps the empty array into a 1-element array whose first element is `@()`.
- **Symptom**: Calling `$discoveredProjects = @(Get-DiscoveredProjects ...)` yields an array of `Count = 1`, where element 0 has empty properties (`Path = $null`). Subsequent calls to `Resolve-ProjectCleanTargets` evaluate `Join-Path "" $candidate`, resolving candidate artifact directory names against `$PWD` (the host working directory). If any folder exists in `$PWD`, it is added to clean targets; `Test-SafePathContainment` then correctly detects that the target is outside the scanned root and throws a fatal security exception (`exit 1`).
- **Recommended Fix for Implementing Agent**:
  In `clean-reinstall.ps1` around line 583, update the return statement:
  ```powershell
  if ($rawProjects.Count -eq 0) {
      return @()
  }
  return ,$rawProjects
  ```
