# Context: Forensic Auditor 1 (Integrity Forensics & Anticheat Verification)

- Original Request: C:\Users\yashs\.gemini\antigravity\worktrees\talentsphere-complete\universal_project_clean_reinstall\.agents\teamwork\ORIGINAL_REQUEST.md
- Project Architecture: C:\Users\yashs\.gemini\antigravity\worktrees\talentsphere-complete\universal_project_clean_reinstall\PROJECT.md
- Test Readiness: C:\Users\yashs\.gemini\antigravity\worktrees\talentsphere-complete\universal_project_clean_reinstall\TEST_READY.md
- Implementation:
  - `clean-reinstall.bat`
  - `clean-reinstall.ps1`
- Test Suite:
  - `tests/run-tests.ps1`
  - `tests/test-fixtures-helper.ps1`
  - `tests/*`
- Working Directory: C:\Users\yashs\.gemini\antigravity\worktrees\talentsphere-complete\universal_project_clean_reinstall\.agents\teamwork\auditor_1

## Auditor Integrity Checks
1. Hardcoded Output Check:
   - Verify that neither `clean-reinstall.bat` nor `clean-reinstall.ps1` contains hardcoded test outputs, strings meant solely to fool test assertions, or mock outputs bypasses.
2. Facade Implementation Check:
   - Verify that the scanning, path canonicalization, reparse point detection, deletion, and command execution logic is genuine, functional, and production-grade.
3. Test Suite Integrity Check:
   - Verify that tests in `tests/` execute real commands against genuine temporary sandboxes rather than using dummy or auto-passing tautologies (`$true -eq $true`).
4. Rule & Policy Conformance:
   - Zero tolerance for cheating or fabricated verification.
5. Deliver definitive verdict: CLEAN or INTEGRITY VIOLATION in handoff.md.
