# Project maintenance

> **Current checkout correction (2026-10-21, `a771a87b`):** `project-maintenance.sh` and `scripts/tests/project-maintenance.test.sh` are absent from both the working tree and tracked-file inventory. Commands and implementation results below are historical/proposed material, not runnable instructions or a verified deliverable in this checkout. Restoring a maintenance tool that changes build files requires explicit authorization under AGENTS.md; this documentation audit does not restore it.


Run from the repository root in Bash:

```bash
./project-maintenance.sh
```

If the executable bit was not preserved by the checkout:

```bash
chmod +x project-maintenance.sh
./project-maintenance.sh
```

The script opens a menu for scanning, build cleanup, dependency removal, cache cleanup, installation, combined maintenance, individual project selection, dry-run previews and report export. Menu option 11 deletes all recursively discovered *verified* build artifacts and caches; menu option 12 installs frozen dependencies and rebuilds all supported projects. Choosing a mutation shows the exact targets and commands, validates prerequisites, then requires the exact confirmation `APPLY`. Empty input or EOF cancels. Report-only export requires `EXPORT`. Cleanup is irreversible; ignored artifacts have no Git rollback. Stop dev servers/builds before maintenance and keep backups of anything that is not disposable.

## Read-only inspection

```bash
./project-maintenance.sh --scan
./project-maintenance.sh --dry-run --operation full
./project-maintenance.sh --scan --sizes
```

Scanning and dry-run write nothing to the target repository. Disk measurements are opt-in because traversing dependency installations can be slow; readings are not additive in linked workspaces. `--scan`, `--dry-run` and `--execute` are mutually exclusive. No configuration module or arbitrary project command is executed during discovery.

## Selecting operations

```bash
# Review one member's build cleanup, without changing anything.
./project-maintenance.sh --dry-run --operation build --project apps/web

# Restore once at the workspace root, with a fresh confirmation prompt.
./project-maintenance.sh --execute --operation install --project .

# Choose validation commands; order is preserved.
./project-maintenance.sh --dry-run --operation validate --check build --check unit --check integration

# Exclude an exact subtree; exclusions are literal, not shell globs.
./project-maintenance.sh --dry-run --operation full --exclude path/to/independent-project

# Explicitly classify a reviewed, regenerable local cache. Hard protections remain.
./project-maintenance.sh --dry-run --operation caches --approve-cleanup caches:tools/generated-cache

# Explicit report export after a scan; requires typing EXPORT.
./project-maintenance.sh --scan --export-report
```

`--root PATH` inspects another explicitly chosen project boundary. Repeat `--project`, `--exclude`, `--approve-cleanup` and `--check` as needed. A selected workspace member cannot remove a shared installation without selecting the workspace owner. A root workspace install installs its members once; a genuinely independent deep project gets its own command. A combined reinstall cleans selected build output and dependency installations before frozen installation; use `--operation rebuild` (menu option 12) to clean verified build/cache output, install frozen dependencies, and rebuild the discovered workspace.

## Supported projects

The script is Bash, with existing Node used only to parse JSON data. Bash 3.2 or newer and standard `find`, Git, `rm`, `mkdir`, `mktemp`, `mv`, `chmod`, `wc`, `date` and `sleep` are required. `du` is optional for `--sizes`. It adds no package dependency.

- Node projects are discovered recursively outside protected/dependency directories, including independently configured deep subprojects.
- pnpm workspaces use the repository's simple `packages:` YAML list. npm/Yarn workspace arrays and `{packages: [...]}` are recognized. Literal path components and single-component globs work. Unsupported workspace syntax, negative patterns, recursive `**` patterns and overlapping nested workspace definitions block installation rather than guessing ownership. Commands also refuse workspace scopes containing excluded/protected projects or their pruned ancestors.
- Manager declarations and lockfiles must agree. Ambiguous managers, missing lockfiles, symlink manifests/locks, unsupported managers and declared-version mismatches block execution before removal. No lockfile is generated or deleted.
- Frozen restores use `pnpm install --frozen-lockfile --ignore-scripts`, `npm ci --ignore-scripts`, Yarn 1 frozen installs with scripts disabled, or Yarn modern immutable installs with `YARN_ENABLE_SCRIPTS=false`.
- Lifecycle scripts are deliberately disabled during installation. Review any required native-addon/build approvals and run them manually afterwards. This can prevent an application build until those project-specific steps are completed; restore success alone is not application validation.
- TypeScript outputs are eligible when a safely parsed `tsconfig.json` explicitly identifies an in-project `outDir`. Composite metadata is paired with that output. Ambiguous JSONC, inherited/dynamic output configuration and Vite-only output conventions remain review-only instead of executing configuration code.
- Known Playwright `test-results` output is classified when this repository's Playwright config exists. Losing diagnostic output is called out in the plan. Other caches require explicit review/approval.
- Common Python, JVM, .NET, PHP, Ruby, Go, Rust, C/C++, Swift and Deno manifests are reported as unsupported for execution. The actual repository is a Node monorepo; `.audit/shoot.py` is a preserved auxiliary script without a Python dependency manifest. This tool does not install absent language runtimes or speculate about their cleanup conventions.

Available check selectors are `lint`, `typecheck`, `unit`, `integration`, `security`, `test`, `build`, `smoke` and `e2e`. Missing scripts are reported as skipped. Only inspected command forms run; unknown scripts and pre/post hooks require manual review and are refused. Recursive pnpm builds also inspect member build scripts/hooks. Formatting checks are supported; formatting writes, migrations, seeding, deployment, Docker cleanup, database tests against an inferred target, global cache purges and automatic server termination are excluded.

In this repository the root typecheck emits output, API/worker/tests import built shared packages, and Playwright needs Chromium and free server ports. A cleanup or dependency restore alone does not prove the app works. Choose builds before dependent checks, and read failed/skipped results.

## Safety and reports

No directory is deletable merely because it is named `dist`, `build`, `cache`, `target` or `vendor`. Candidate rows show the owner, category, evidence, classification and optional size. Only verified/explicitly approved candidates reach the execution plan; every target is checked again immediately before deletion.

Hard protections cover source/configuration, environment files and credentials, databases/dumps/migrations, original public assets, documentation, user data, nested repositories, tracked/staged files, excluded descendants, Reticle/browser evidence and the Obsidian vault. Dependency cleanup allows installed package source/configuration but still refuses embedded secrets and data. Symlink roots/ancestors are rejected; dependency symlinks are unlinked with their installation and never traversed. Generated declarations/maps/assets inside verified output directories are distinguished from original source/static input.

A repository-local `.project-maintenance.lock` serializes approved operations. An existing lock is never overridden automatically; investigate whether a run is active before removing a stale lock manually. This does not synchronize external dev servers or defend against a malicious concurrent filesystem writer. Do not run maintenance across bind mounts or other externally managed storage. Installation and selected validation run trusted repository/tooling code after review; this script is not a sandbox for hostile projects.

Confirmed execution and explicit export create private timestamped logs under `maintenance-reports/`, excluded from scanning and cleanup. Logs record selected operations, paths, classifications, skipped items, commands, exact exit codes, failures, warnings and final status. Raw command stdout/stderr is captured in a mode-600 temporary file, counted and removed; arbitrary output is withheld from logs to avoid publishing credentials. On failure, rerun the displayed command privately for full diagnostics. No environment dump or `.env` contents are logged. A failed restore/build stops dependent commands, and incomplete work is never reported as a pass. Removed space is not asserted from overlapping/shared allocations.

SIGINT/SIGTERM stop the invocation-owned command process group, remove private capture files and the lock, retain the report and return 130/143. Deleted artifacts stay deleted. Other errors use 1 for partial failures, 2 for invalid arguments, and 3 for fatal safety/prerequisite/discovery/reporting errors. Cancellation/no-op uses 0; interactive invalid input redisplays the menu.

## Tests and portability

```bash
bash -n project-maintenance.sh
bash -n scripts/tests/project-maintenance.test.sh
bash scripts/tests/project-maintenance.test.sh
shellcheck project-maintenance.sh scripts/tests/project-maintenance.test.sh # if installed
```

The tests create disposable temporary repositories, use stub package managers for command outcomes, and never delete real project output or download packages. They cover recursive discovery, spaces, workspace boundaries, dry-run preservation, confirmations, unknown/protected paths, Git provenance, exclusions, restoration failures, hooks, private reports and descendant cancellation. Native symlink and permission-denial checks explicitly skip when the host cannot enforce them.

The implementation uses portable Bash/Unix forms intended for macOS/Linux; verification in this environment uses Git Bash on Windows. Native macOS/Linux and Bash 3.2 have not been executed here. Git Bash may copy instead of creating native symlinks, and Windows ACLs do not necessarily enforce Unix mode bits. The fixture suite detects these cases instead of presenting a false pass. WSL and ShellCheck are not installed on this host.

See [the repository audit and validation record](../reports/MAINTENANCE_AUDIT_2026-10-21.md) for detected projects, approximate candidate sizes, verification results and remaining limitations. Existing build files and agent instructions are unchanged by this implementation; real cleanup/reinstallation is an operator action requiring review of the exact current plan.
