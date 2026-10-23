## 2026-10-22T03:27:49Z
You are a Worker subagent (ID: worker_impl_1).
Your working directory is:
C:\Users\yashs\.gemini\antigravity\worktrees\talentsphere-complete\universal_project_clean_reinstall\.agents\teamwork\worker_impl_1

You MUST read the original user request verbatim from:
C:\Users\yashs\.gemini\antigravity\worktrees\talentsphere-complete\universal_project_clean_reinstall\.agents\teamwork\ORIGINAL_REQUEST.md

Read your context and technical survey reports:
- Context: C:\Users\yashs\.gemini\antigravity\worktrees\talentsphere-complete\universal_project_clean_reinstall\.agents\teamwork\worker_impl_1\context.md
- Project Architecture & Feature Inventory: C:\Users\yashs\.gemini\antigravity\worktrees\talentsphere-complete\universal_project_clean_reinstall\.agents\teamwork\orchestrator_1\PROJECT.md
- Survey 1 (Discovery & Cleanup): C:\Users\yashs\.gemini\antigravity\worktrees\talentsphere-complete\universal_project_clean_reinstall\.agents\teamwork\explorer_survey_1\handoff.md
- Survey 2 (Reinstall Matrix & Engine): C:\Users\yashs\.gemini\antigravity\worktrees\talentsphere-complete\universal_project_clean_reinstall\.agents\teamwork\explorer_survey_2\handoff.md
- Survey 3 (CLI, Logging & Batch Wrapper): C:\Users\yashs\.gemini\antigravity\worktrees\talentsphere-complete\universal_project_clean_reinstall\.agents\teamwork\explorer_survey_3\handoff.md

FILE OWNERSHIP:
You exclusively own and will create/write:
- clean-reinstall.bat (at project root)
- clean-reinstall.ps1 (at project root)
- PROJECT.md (at project root - copy/synchronize from .agents/teamwork/orchestrator_1/PROJECT.md)

You MUST NOT touch or modify any files inside `tests/`.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Tasks:
Build the production-grade, universal, safe, and reusable clean and reinstall engine covering all requirements R1-R4 and Milestones M1-M5:
1. `clean-reinstall.bat`:
   - Auto-detect `pwsh.exe` with fallback to `powershell.exe`.
   - Forward all arguments with `%*`, proper path quoting `"%~dp0clean-reinstall.ps1"`.
   - `-NoProfile -ExecutionPolicy Bypass`.
   - Forward exit code cleanly (`exit /b %EXIT_CODE%`).
2. `clean-reinstall.ps1`:
   - Full Windows PowerShell 5.1 and PS Core 7+ compatibility (no PS 7-only operators).
   - Parameter block with kebab-case aliases (`[Alias('dry-run')]`, etc.) matching all CLI flags in R4.
   - Mutually exclusive parameter validation.
   - Structured timestamped logger (`clean-reinstall_<timestamp>.log`) with token/secret regex redaction and colorized console output (`Write-Host -ForegroundColor`).
   - Strict path canonicalization and containment verification (`Test-SafePathContainment`) blocking root drives and Windows system directories.
   - Recursive depth-bounded directory scanner (`--max-depth`, default 5) with directory pruning (skipping dependency/artifact folders without descent).
   - Reparse point / junction boundary enforcement without .NET 6 dependencies.
   - Multi-ecosystem manifest and lockfile detection across Node, Python, .NET, Java/JVM, PHP, Ruby, Rust, Go, CMake/Make.
   - Monorepo workspace hierarchy detection (identifying workspace roots and marking member packages to prevent redundant reinstallations).
   - Safe cleanup engine with standard vs `--deep-clean` mappings and strict guardrails (NEVER deleting lockfiles, source files, `.env*`, `.git`, IDE files).
   - Deterministic reinstallation matrix with frozen/immutable lockfile commands, tool detection via PATH, wrapper preference (`mvnw.cmd`, `gradlew.bat`), post-install `--build`, real-time output streaming, `$LASTEXITCODE` preservation, and `--continue-on-error` support.
   - Interactive confirmation prompt when invoked without arguments, guarded against non-interactive stdin hanging.
   - Run summary reporting table and exit code protocol.

Verify your implementation by testing it locally on dummy/test cases.
Write your completion handoff report to:
C:\Users\yashs\.gemini\antigravity\worktrees\talentsphere-complete\universal_project_clean_reinstall\.agents\teamwork\worker_impl_1\handoff.md
Notify the orchestrator when complete.
