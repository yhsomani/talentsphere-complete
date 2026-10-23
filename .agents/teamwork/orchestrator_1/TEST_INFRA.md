# E2E Test Infra: universal_project_clean_reinstall

## Test Philosophy
- **Opaque-box, requirement-driven**: Tests derive strictly from `ORIGINAL_REQUEST.md` and user-facing specifications, with zero coupling to internal script implementation details.
- **Zero-Dependency Native Architecture**: Built using a pure PowerShell test runner (`tests/run-tests.ps1`) executing on standard Windows PowerShell 5.1 and PowerShell Core 7+, requiring no external modules (no Pester 5, no Node/npm packages).
- **Hermetic Sandbox**: All tests operate against dynamically created temporary directory fixtures (`[System.IO.Path]::GetTempPath()`), ensuring tests never mutate the actual workspace or user environment, and cleanly tear down on completion.
- **Methodology**: 4-Tier verification incorporating Category-Partition, Boundary Value Analysis, Pairwise Combinatorial Testing, and Realistic Polyglot Workload Scenarios.

## Feature Inventory Coverage
| # | Feature | Requirement | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|---|---------|-------------|:------:|:------:|:------:|:------:|
| 1 | Batch Entry Point (`clean-reinstall.bat`) | R4 | TC-01 | TC-21 | TC-29 | TC-34 |
| 2 | CLI Parameter Parsing & Aliases | R4 | TC-02 | TC-22 | TC-30 | TC-35 |
| 3 | Parameter Validation & Mutual Exclusivity | R4 | TC-03 | TC-22 | TC-30 | - |
| 4 | Structured Logging & Secret Redaction | R4 | TC-04 | TC-23 | TC-31 | TC-36 |
| 5 | Path Canonicalization & Containment Guard | R2 | TC-05 | TC-24 | TC-31 | TC-37 |
| 6 | Directory Scanner with `--max-depth` | R1 | TC-06 | TC-25 | TC-32 | TC-38 |
| 7 | Traversal Pruning (`node_modules`, etc.) | R1 | TC-07 | TC-25 | TC-32 | TC-38 |
| 8 | Reparse Point & Junction Boundary Security | R1 | TC-08 | TC-26 | TC-32 | TC-38 |
| 9 | Multi-Ecosystem Manifest Detection | R1 | TC-09..TC-11 | TC-27 | TC-33 | TC-34..TC-38 |
| 10 | Monorepo Workspace Resolution | R1 | TC-12 | TC-27 | TC-33 | TC-34, TC-38 |
| 11 | Safe Cleanup (Standard Clean) | R2 | TC-13 | TC-24 | TC-31 | TC-34..TC-38 |
| 12 | Deep Cleanup (`--deep-clean`) | R2 | TC-14 | TC-24 | TC-31 | TC-38 |
| 13 | Absolute Deletion Protection Guardrails | R2 | TC-15 | TC-24 | TC-31 | TC-34..TC-38 |
| 14 | Dry-Run Mode (`--dry-run`) | R2, R4 | TC-16 | TC-28 | TC-29 | TC-34 |
| 15 | Tool & Runtime PATH Detection | R3 | TC-17 | TC-28 | TC-33 | TC-34..TC-38 |
| 16 | Local Wrapper Preference | R3 | TC-18 | TC-28 | TC-33 | TC-37 |
| 17 | Deterministic Reinstallation Matrix | R3 | TC-19 | TC-28 | TC-33 | TC-34..TC-38 |
| 18 | Post-Install Rebuild (`--build`) | R3 | TC-20 | TC-28 | TC-30 | TC-36 |
| 19 | Streaming Output & Error Handling | R3, R4 | TC-17 | TC-28 | TC-33 | TC-36 |
| 20 | Interactive Confirmation Prompt | R4 | TC-02 | TC-22 | TC-29 | - |
| 21 | Colorized Console & Run Summary Table | R4 | TC-04 | TC-23 | TC-29 | TC-34..TC-38 |

## Test Architecture
- **Runner**: `tests/run-tests.ps1`
  - Invocation: `powershell.exe -ExecutionPolicy Bypass -NoProfile -File tests/run-tests.ps1 [-Tier <1|2|3|4|all>] [-Verbose]`
  - Output: Per-test assertion reporting, execution timing, colorized pass/fail metrics, exit code 0 on all pass, exit code 1 on any failure.
- **Fixture Generator**: `tests/test-fixtures-helper.ps1`
  - Helper functions to generate mock project trees in temp paths:
    - Node packages with `package.json`, `pnpm-lock.yaml`, `node_modules`, `dist`
    - Monorepos with `pnpm-workspace.yaml`, nested packages, shared lockfile
    - Python virtualenvs with `pyproject.toml`, `requirements.txt`, `.venv`, `__pycache__`
    - Rust crates with `Cargo.toml`, `Cargo.lock`, `target`
    - Java/JVM with `pom.xml`, `gradlew.bat`, `build`
    - .NET projects with `*.sln`, `*.csproj`, `bin`, `obj`
    - Reparse points / NTFS junctions escaping vs non-escaping
- **Assertion Engine**:
  - `Assert-PathExists(path)`, `Assert-PathNotExists(path)`
  - `Assert-FileContains(path, pattern)`, `Assert-FileNotContains(path, pattern)`
  - `Assert-ExitCode(expected, actual)`

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| TC-34 | Polyglot Monorepo Full Clean & Reinstall | Batch wrapper, workspace root resolution, node_modules clean, lockfile preservation, mock reinstall | High |
| TC-35 | Enterprise Polyglot Repo with Nested Submodules | Depth limits, multi-stack detection, standard vs deep clean | High |
| TC-36 | Full Pipeline with `--build` & Missing Tools | Tool PATH fallback, wrapper execution, build script execution, summary reporting | High |
| TC-37 | Safety Attack Vectors in Multi-Language Repo | Path canonicalization, junction traversal escaping root, lockfile/source protection | High |
| TC-38 | Mega Monorepo with Deep Caches & Workspace Packages | Monorepo root reinstall only, deep clean (.turbo, .next, .venv, target), continue-on-error | High |

## Coverage Thresholds
- Tier 1: 20 feature-level isolation tests
- Tier 2: 8 boundary, edge-case, and safety-critical attack vector tests
- Tier 3: 5 pairwise cross-feature combination tests
- Tier 4: 5 full-scale realistic polyglot monorepo application scenarios
- **Total: 38 comprehensive E2E test cases**
