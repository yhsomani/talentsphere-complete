# Context: Core Engine Remediation Pass (Iteration 2)

- Original Request: C:\Users\yashs\.gemini\antigravity\worktrees\talentsphere-complete\universal_project_clean_reinstall\.agents\teamwork\ORIGINAL_REQUEST.md
- Project Architecture: C:\Users\yashs\.gemini\antigravity\worktrees\talentsphere-complete\universal_project_clean_reinstall\PROJECT.md
- Gate Status & Feedback: C:\Users\yashs\.gemini\antigravity\worktrees\talentsphere-complete\universal_project_clean_reinstall\.agents\teamwork\orchestrator_1\GATE_STATUS.md
- Reviewer 1 Findings: C:\Users\yashs\.gemini\antigravity\worktrees\talentsphere-complete\universal_project_clean_reinstall\.agents\teamwork\reviewer_1\handoff.md
- Reviewer 2 Findings: C:\Users\yashs\.gemini\antigravity\worktrees\talentsphere-complete\universal_project_clean_reinstall\.agents\teamwork\reviewer_2\handoff.md
- Challenger 1 Findings: C:\Users\yashs\.gemini\antigravity\worktrees\talentsphere-complete\universal_project_clean_reinstall\.agents\teamwork\challenger_1\handoff.md
- Working Directory: C:\Users\yashs\.gemini\antigravity\worktrees\talentsphere-complete\universal_project_clean_reinstall\.agents\teamwork\worker_impl_2
- Implementation File to Modify: `clean-reinstall.ps1`

## Specific Defects to Fix in `clean-reinstall.ps1`:
1. **Empty Repository Handling (Parameter Binding & Dispatch)**:
   - In `Invoke-SafeClean` (line 703) and `Invoke-ReinstallAndBuild` (line 884):
     Change parameter declaration from `[Parameter(Mandatory=$true)][object[]]$Projects` to:
     `[Parameter(Mandatory=$false)][AllowEmptyCollection()][object[]]$Projects = @()`
     And at start of both functions: if `(-not $Projects -or $Projects.Count -eq 0)`, return immediately with 0 counts.
   - In the main execution driver (around lines 1285-1320):
     If `($discoveredProjects.Count -eq 0)`:
     Write-LogMessage "No matching projects discovered in '$canonicalRoot'. Nothing to clean or reinstall." -Level INFO
     Skip clean and reinstall blocks, print summary showing 0 discovered, and exit cleanly with code 0.
2. **System Directory Subpath Guardrail**:
   - In `Test-SafePathContainment` (line 174) and Root Validation (line 1232):
     Currently only checks: `.Equals($sysDir, [System.StringComparison]::OrdinalIgnoreCase)`.
     Update to:
     `if ($canonicalRoot.Equals($sysDir, [System.StringComparison]::OrdinalIgnoreCase) -or $canonicalRoot.StartsWith($sysDir + '\', [System.StringComparison]::OrdinalIgnoreCase))`
     This prevents targeting subdirectories inside Windows, Program Files, ProgramData, or User Profile roots.
3. **Cross-Ecosystem Workspace Member Hijacking**:
   - In `Get-DiscoveredProjects` (lines 566-576):
     When searching for ancestor workspace root for `$p`:
     Ensure the workspace type matches the child project's ecosystem!
     ```powershell
     $parentWs = $workspaceRoots | Where-Object {
         $p.Path.StartsWith($_.Path + '\', [System.StringComparison]::OrdinalIgnoreCase) -and (
             ($_.WorkspaceType -match 'pnpm|npm|yarn' -and $p.Ecosystem -eq 'Node') -or
             ($_.WorkspaceType -eq 'Cargo' -and $p.Ecosystem -eq 'Rust') -or
             ($_.WorkspaceType -eq 'Go' -and $p.Ecosystem -eq 'Go') -or
             ($_.WorkspaceType -eq '.NET' -and $p.Ecosystem -eq '.NET') -or
             ($_.WorkspaceType -eq 'Gradle' -and $p.Ecosystem -eq 'Java')
         )
     } | Sort-Object { $_.Path.Length } | Select-Object -Last 1
     ```
     This ensures a Python or Rust project inside a folder under `pnpm-workspace.yaml` is NOT marked as a workspace member of pnpm, and receives its own dependencies!
4. **WorkspaceRootPath Substring Safety**:
   - In `Invoke-ReinstallAndBuild` (lines 907-910):
     Replace:
     `$wsRel = $project.WorkspaceRootPath.Substring($canonicalRoot.Length).TrimStart('\', '/')`
     With safe path relative logic:
     ```powershell
     $wsRel = if ($project.WorkspaceRootPath.StartsWith($canonicalRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
         $project.WorkspaceRootPath.Substring($canonicalRoot.Length).TrimStart('\', '/')
     } else {
         $project.WorkspaceRootPath
     }
     if ([string]::IsNullOrEmpty($wsRel)) { $wsRel = '.' }
     ```

## Verification:
Run both:
1. `powershell.exe -ExecutionPolicy Bypass -NoProfile -File tests/run-tests.ps1`
2. `powershell.exe -ExecutionPolicy Bypass -NoProfile -File tests/test-challenger-stress.ps1`
Verify 100% pass across both test suites!
