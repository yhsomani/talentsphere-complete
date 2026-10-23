# Survey Explorer 3 Context: CLI Entry Point, Logging, Reporting & E2E Test Architecture

- Original Request: C:\Users\yashs\.gemini\antigravity\worktrees\talentsphere-complete\universal_project_clean_reinstall\.agents\teamwork\ORIGINAL_REQUEST.md
- Project Root: C:\Users\yashs\.gemini\antigravity\worktrees\talentsphere-complete\universal_project_clean_reinstall
- Working Directory: C:\Users\yashs\.gemini\antigravity\worktrees\talentsphere-complete\universal_project_clean_reinstall\.agents\teamwork\explorer_survey_3

## Scope & Focus
1. Batch Wrapper & PowerShell Entry Point:
   - `clean-reinstall.bat` forwarding all arguments cleanly to `clean-reinstall.ps1`.
   - Windows cmd.exe argument quoting/escaping (`%*`, quotes preservation, spaces in paths).
   - PowerShell execution policy bypass (`-ExecutionPolicy Bypass -NoProfile`).
   - PowerShell version compatibility (PowerShell 5.1 built-in Windows Desktop edition vs PowerShell Core 7+).
2. CLI Parameters & Interactive Mode:
   - `--dry-run`, `--clean-only`, `--install-only`, `--build`, `--deep-clean`, `--root <path>`, `--exclude <patterns>`, `--max-depth <int>`, `--continue-on-error`, `--verbose`, `--help`.
   - Interactive prompt when invoked without arguments: summarizing planned deletions and requiring confirmation (Y/N) before proceeding.
   - Non-interactive mode (e.g. when flags are passed or when piped/automated).
3. Logging & Colorized Console Reporting:
   - Structured timestamped log file (`clean-reinstall_<timestamp>.log`). Sanitization (no tokens/secrets leaked).
   - Colorized console output (ANSI / `Write-Host` fallback).
   - Exit code protocol (0 for success, non-zero for errors/failures).
4. Opaque-box E2E Test Suite Architecture:
   - Polyglot mock fixtures creation (temporary directories with simulated Node, Python, Rust, Go, Java, .NET, Monorepos).
   - Test runner framework (e.g., Pester or custom PowerShell test harness runner).
   - Test Tier structure (Tier 1: Feature Coverage, Tier 2: Boundary/Edge Cases, Tier 3: Cross-Feature Interactions, Tier 4: Real-World Polyglot Monorepo Scenarios).
   - Assertion mechanisms (inspecting directory trees, file contents, preserved lockfiles, log files, exit codes).
