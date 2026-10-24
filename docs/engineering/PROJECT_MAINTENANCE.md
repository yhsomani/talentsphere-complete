# Project maintenance tooling

Source cross-check: `431c425a`, 2026-10-23. The current tool is
[clean-reinstall.bat](../../clean-reinstall.bat) with
[clean-reinstall.ps1](../../clean-reinstall.ps1). The older Bash
`project-maintenance.sh` and its test script are absent. Their unique usage,
requirements and test history are preserved in the
[maintenance archive](../reports/MAINTENANCE_AUDIT_2026-10-21.md).

## Current execution path

The batch wrapper selects `pwsh.exe` when available, otherwise `powershell.exe`,
forwards arguments to the engine and propagates its exit code. It explicitly
uses process-scoped ExecutionPolicy Bypass; this is source behavior, not an
instruction to bypass a host refusal.

The engine binds PowerShell parameters, validates the root, initializes a log,
discovers projects/workspaces, resolves cleanup candidates, optionally prompts,
then cleans and/or invokes installers/builds. `Get-DiscoveredProjects`,
`Test-SafePathContainment`, `Resolve-ProjectCleanTargets`, `Invoke-SafeClean`,
`Resolve-Executable`, `Invoke-ToolCommand` and `Invoke-ReinstallAndBuild` are the
existing extension points. It recognizes multiple ecosystem manifests and uses
workspace membership to skip redundant member installations. Runtime correctness
for every ecosystem is unverified by this documentation pass.

Use native parameter spelling when inspecting help:

```powershell
powershell.exe -NoProfile -File .\clean-reinstall.ps1 -Help
```

`-DryRun`, `-CleanOnly`, `-InstallOnly`, `-Build`, `-DeepClean`, `-Root`, `-Exclude`,
`-MaxDepth` (default 5), `-ContinueOnError`, `-Yes` and `-VerboseOutput` are declared
parameters. The script also advertises double-dash aliases; cross-shell parsing
was not exercised here.

## Important differences from the historical safety claims

- Dry-run skips cleanup/install execution but **writes a timestamped log** under
  the selected root, falling back to the temporary directory. It is not a
  zero-filesystem-write inspection.
- The confirmation branch applies to an invocation without arguments. Explicit
  operation flags can execute without another confirmation; do not assume every
  mutation prompts or that `-Yes` is always required.
- Cleanup/install/build changes generated outputs and dependency directories.
  Under [AGENTS.md](../../AGENTS.md), agents cannot run these operations without
  explicit authorization for protected build-file changes.
- Logging redacts selected secret patterns; that is not proof that arbitrary
  installer output cannot contain private data.
- Source contains path-containment/reparse checks and cleanup guards. Historical
  test passes are not certification against races or every filesystem/platform.

## Tests and historical material

`tests/run-tests.ps1` loads four tier files and accepts `-Tier`, `-TestId`,
`-FailFast` and `-VerboseOutput`. Fixtures and stress probes are in `tests/`.
They create/delete files and launch the maintenance engine; they were not run
for this documentation-only change. Review their effects before execution under
the build-file restriction.

The archive retains the original request and the 38-case test report, including
its empty-project-array defect finding. That finding is historical and was not
reproduced here. The duplicate root implementation plan was removed; its exact
copy remains in `.agents/teamwork/orchestrator_1/PROJECT.md`.
