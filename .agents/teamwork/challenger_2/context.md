# Context: Challenger 2 (Empirical Boundary & Attack Stress Verification)

- Original Request: C:\Users\yashs\.gemini\antigravity\worktrees\talentsphere-complete\universal_project_clean_reinstall\.agents\teamwork\ORIGINAL_REQUEST.md
- Project Architecture: C:\Users\yashs\.gemini\antigravity\worktrees\talentsphere-complete\universal_project_clean_reinstall\PROJECT.md
- Test Readiness: C:\Users\yashs\.gemini\antigravity\worktrees\talentsphere-complete\universal_project_clean_reinstall\TEST_READY.md
- Implementation:
  - `clean-reinstall.bat`
  - `clean-reinstall.ps1`
- Test Suite:
  - `tests/run-tests.ps1`
- Working Directory: C:\Users\yashs\.gemini\antigravity\worktrees\talentsphere-complete\universal_project_clean_reinstall\.agents\teamwork\challenger_2

## Challenger Focus
1. Run and verify the full test suite: `powershell.exe -ExecutionPolicy Bypass -NoProfile -File tests/run-tests.ps1`.
2. Construct empirical attack harnesses:
   - Root containment bypass attempts: Target paths with tricky relative dots (`..`, `.\..\`, symlink/junction cycles).
   - System root protection: Targeting `C:\`, `C:\Windows`, etc.
   - Lockfile preservation stress test: Ensure no combination of flags (`--deep-clean`, `--clean-only`, `--build`) ever deletes lockfiles (`pnpm-lock.yaml`, `package-lock.json`, `Cargo.lock`, `poetry.lock`, etc.).
   - Process exit code verification under failure vs continue-on-error.
3. Deliver definitive verdict: APPROVE or REQUEST_CHANGES in handoff.md.
