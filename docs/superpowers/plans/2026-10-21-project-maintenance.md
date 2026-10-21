# Project Maintenance Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans for native execution; the user approved the design and requested implementation in this session.

**Goal:** Deliver the complete interactive Bash maintenance tool and prove its safety using disposable fixture repositories and real read-only previews.

**Architecture:** Bash handles discovery, candidate verification, planning, selection, execution, and reporting. Existing Node performs JSON metadata reads only. Workspace owners install once; ambiguous and unsupported projects remain visible without guessed mutations.

**Tech Stack:** Bash 3.2+, standard Unix utilities, Git, existing Node/package managers; no new dependencies.

**Spec:** `docs/reports/MAINTENANCE_AUDIT_2026-10-21.md` and the attached original brief.

## Global constraints

- Do not edit existing build files, package manifests, lockfiles, source or CI configuration.
- No real repository cleanup, installation, builds or emitting typechecks during verification.
- Dry-run and scan must not write to their target repository; report export is explicit.
- Confirm exact actions before execution; never remove source, secrets, user data or tracked files.
- Run destructive tests only in verified disposable temporary fixture directories.
- Preserve pre-existing staged and unstaged work; no commit, branch move or publication is requested.

## Review focus

- An output directory can contain source, a nested repository or secrets: block the whole target.
- Workspace glob membership differs from ancestry: independent nested projects must install independently.
- Symlinked ancestors and changed targets must fail revalidation before deletion.
- Failed prerequisites must block cleanup before dependencies disappear.
- EOF, interruptions, invalid input and reporting errors must not become successful executions.

## Task 1: Discovery and safety fixtures

Files: create `scripts/tests/project-maintenance.test.sh`; create `project-maintenance.sh`.

- [ ] Write fixture tests for scan, recursive boundaries, dry-run preservation, cleanup confirmation and protected targets.
- [ ] Run tests and observe expected failure because `project-maintenance.sh` does not exist.
- [ ] Implement CLI parsing, read-only recursive discovery, project/workspace metadata and candidate classification.
- [ ] Verify empty/deep/space-containing projects, missing/ambiguous manifests, unsupported stacks, symlinks and exclusions.

## Task 2: Planned operations and interactive execution

Interfaces: `--scan`, `--dry-run`, `--operation`, `--project`, `--check`, `--exclude`, `--approve-cleanup`, `--execute`, `--export-report`, `--root`.

- [ ] Extend tests for installation deduplication, missing tools/locks, failures, interruption and report handling before implementing those behaviors.
- [ ] Implement exact plan previews, category/project selection, prerequisites, confirmation, protected-target rechecks and operation lock.
- [ ] Implement frozen dependency restores, selected validation checks, error aggregation and private output capture with secret-safe summary reporting.
- [ ] Implement menu choices 0–10 and explicit report export.
- [ ] Run all fixture tests; verify invalid input/EOF, repeated executions and no writes in dry-run.

## Task 3: Documentation and authoritative verification

Files: create `docs/engineering/PROJECT_MAINTENANCE.md`; update maintenance audit with actual evidence.

- [ ] Run `chmod +x`, `bash -n` for implementation/tests, and ShellCheck if installed.
- [ ] Run disposable fixture suite; document platform/permission skips honestly.
- [ ] Run real `--scan` and `--dry-run`, verify target filesystem and Git changes remain untouched, save reviewable results outside cleanup candidates.
- [ ] Obtain fresh safety review, resolve findings with regression tests and rerun relevant checks.
- [ ] Document launch commands, menu/CLI behavior, supported/unsupported stacks, security limits and final status.

## Execution record

Design approved by the user. Native implementation is authorized. Work is additive in the user's current checkout to preserve concurrent work and the existing index; no Git integration operations will run. Verification evidence and deviations will be recorded in the audit report rather than treating these checkboxes as proof of completion.
