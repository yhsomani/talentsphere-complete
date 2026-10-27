# Repository maintenance audit and proposed design

> Historical maintenance evidence. The Bash tool described below is absent in this checkout. Current Windows tooling and its limits are documented in [PROJECT_MAINTENANCE.md](../engineering/PROJECT_MAINTENANCE.md). Recorded passes are not fresh results.

> **Current checkout correction (2026-10-21, `a771a87b`):** `project-maintenance.sh` and `scripts/tests/project-maintenance.test.sh` are absent from both the working tree and tracked-file inventory. Commands and implementation results below are historical/proposed material, not runnable instructions or a verified deliverable in this checkout. Restoring a maintenance tool that changes build files requires explicit authorization under AGENTS.md; this documentation audit does not restore it.


Date: 2026-10-21. Status: implemented and locally verified; ready for operator review of the dry-run plan. No real repository cleanup or installation executed.

## Purpose and audit boundary

Provide the requested single interactive Bash entry point, `project-maintenance.sh`, for recursive discovery, reviewed cleanup, dependency restoration, validation, and reporting. The attached brief is the requirements source. The discovery and approved design below are preserved for traceability; the implementation evidence section records actual results separately.

Discovery used `find -P` from the physical repository root at every depth, pruning Git metadata and installed dependency trees. Manifest searches included Node, Python, JVM, .NET, PHP, Ruby, Go, Rust, and C/C++ project markers. Tooling files, package scripts, CI workflows, deployment scripts, TypeScript outputs, test outputs, and tracked-file provenance were inspected. Source-language inventory excluded generated distributions. Environment-file contents, credentials, database contents, and vault transaction payloads were not read.

Existing staged, unstaged, and untracked work is present and changing during the audit. It must not be reset, staged, or overwritten by this task. No deletion, dependency installation, application build, database operation, or project configuration change was performed for the audit.

## Detected projects and installation boundary

There are ten `package.json` files: one workspace root and nine members. `pnpm-workspace.yaml` includes `apps/*` and `packages/*`; the root `pnpm-lock.yaml` records those importers. The declared and locally available manager is `pnpm@11.7.0`. Local Node is v24.19.0; CI and Docker use Node 24. No separate nested installation boundary or competing lockfile was found outside installed dependencies.

| Project | Technology / purpose | Shared dependencies | Generated output observed |
|---|---|---|---|
| `.` | pnpm workspace; Vitest, Playwright, Prettier, TypeScript | Installation owner for all members | Root `node_modules`, `test-results` |
| `apps/api` | TypeScript, Node, Fastify HTTP API | config, contracts, domain | `dist`, `tsconfig.tsbuildinfo`, local `node_modules` |
| `apps/web` | TypeScript/TSX, React, React Router, Vite | ui | `dist`, `tsconfig.tsbuildinfo`, local `node_modules` |
| `apps/worker` | TypeScript, Node, PostgreSQL worker | domain, observability | `dist`, `tsconfig.tsbuildinfo`, local `node_modules` |
| `packages/config` | TypeScript, Zod environment validation | Workspace member | `dist`, `tsconfig.tsbuildinfo`, local `node_modules` |
| `packages/contracts` | TypeScript, Zod API contracts | Workspace member | `dist`, `tsconfig.tsbuildinfo`, local `node_modules` |
| `packages/domain` | TypeScript domain logic | Workspace member | `dist`, `tsconfig.tsbuildinfo`, local `node_modules` |
| `packages/observability` | TypeScript, Pino | Workspace member | `dist`, `tsconfig.tsbuildinfo`, local `node_modules` |
| `packages/testing` | TypeScript test helpers | domain | `dist`, `tsconfig.tsbuildinfo`, local `node_modules` |
| `packages/ui` | TypeScript shared UI package | Workspace member | `dist`, `tsconfig.tsbuildinfo`, local `node_modules` |

Each member's manifest and `tsconfig.json` were found. All member TypeScript configs emit to `./dist`; composite compilation writes incremental metadata. Vite also targets `apps/web/dist`. Root TypeScript references list all nine members. Root build scripts compile shared packages before applications.

Other languages and infrastructure actually present:

- JavaScript/MJS: database migration/seed tooling, release checks, icon generation, and E2E server bootstrap.
- Bash: `deploy/oracle/backup.sh` and `deploy/oracle/verify-restore.sh`.
- SQL: PostgreSQL migrations and seed data under `supabase`; not cleanup candidates.
- Python: `.audit/shoot.py`, a Playwright screenshot helper. No `pyproject.toml`, requirements file, virtual environment, or Python lockfile was found. Report it as an auxiliary script with unmanaged dependencies; do not install Python or infer a Python project.
- Docker/Compose/Caddy and GitHub Actions: container build, staging deployment configuration, and CI checks.
- HTML/CSS, webmanifest, fonts, icons, and screenshots are source/static/evidence assets, not automatically regenerable build output.
- No Java/Kotlin, .NET, PHP, Ruby, Go, Rust, C/C++, Android, or iOS project manifest was found. The future scanner should recognize their manifest names and report unsupported projects instead of guessing cleanup or install commands.

## Cleanup inventory and classification

Sizes below are approximate `du -sk` readings in KiB at discovery time, not promised reclaimable space. Linked/shared allocations and concurrent development can change them. No candidate was deleted. A regenerable classification is permission to propose a target, not authorization to delete it.

| Candidate | Category | Approx. KiB | Classification and evidence |
|---|---|---:|---|
| `apps/api/dist` | Build | 1164 | Regenerable candidate: configured TypeScript outDir |
| `apps/web/dist` | Build | 910 | Regenerable candidate: TypeScript and Vite outDir |
| `apps/worker/dist` | Build | 54 | Regenerable candidate: configured TypeScript outDir |
| `packages/config/dist` | Build | 40 | Regenerable candidate: configured TypeScript outDir |
| `packages/contracts/dist` | Build | 268 | Regenerable candidate: configured TypeScript outDir |
| `packages/domain/dist` | Build | 1330 | Regenerable candidate: configured TypeScript outDir |
| `packages/observability/dist` | Build | 19 | Regenerable candidate: configured TypeScript outDir |
| `packages/testing/dist` | Build | 18 | Regenerable candidate: configured TypeScript outDir |
| `packages/ui/dist` | Build | 21 | Regenerable candidate: configured TypeScript outDir |
| Nine member `tsconfig.tsbuildinfo` files | Build metadata | 480 combined | Regenerable candidate: composite TypeScript metadata; must clean with output to avoid stale incremental state |
| Root plus nine member `node_modules` directories | Dependencies | Root 150632; member readings 30–7177 each | Workspace-owned installations: one root frozen restore, not ten installs; linked/shared allocation is not additive |
| `test-results` | Test output | 11 | Regenerable candidate: Playwright/performance output; warn that diagnostic evidence is lost |
| `.audit` | Mixed source and evidence | 2528 | Prohibited as a cleanup directory: tracked Python source and baseline screenshots |
| `.playwright-cli` | Browser evidence | 178 | Preserve: tracked recordings and current-session evidence |
| `graphify-out/cache` | Tool cache | 764 | Review only: tracked files exist inside despite ignore pattern; no blanket deletion |
| `graphify-out` excluding cache | Analysis artifacts | Not measured | Review only: tracked reports, graphs, manifests and tool state |
| `supabase/.temp` | Tool state | 0 | Review only; no verified regeneration contract |
| `.reticle` and `apps/web/.reticle` | Verification state | Not measured | Preserve recordings, intent, contracts and cloud configuration |
| `TalentSphere` | Obsidian vault | Not measured | Protected user data, including `.obsidian-mcp` transactions, locks and trash |
| `BRAIN` | Project memory | Not measured | Protected documentation and execution history |
| `private-backups` when present | Database backups | Not measured | Always protected; backup scripts may also use an external BACKUP_DIR |

Git inspection found no tracked `dist` output, `*.tsbuildinfo`, or `test-results` content. The maintenance tool must repeat provenance checks immediately before execution and reject targets containing tracked or staged files, nested repositories, essential data, or symlinks. Ignore rules alone are insufficient evidence of safety.

Source-adjacent generated JavaScript, declarations, or map files must not be removed by extension alone. Familiar names such as `build`, `dist`, `cache`, `target`, or `vendor` are review-only without a demonstrated project-specific output contract.

## Existing scripts and operational risks

| Area | Existing commands/configuration | Maintenance treatment |
|---|---|---|
| Installation | CI/Docker: `pnpm install --frozen-lockfile` | One command at root; enforce declared manager version; inspect lifecycle scripts before requesting execution approval |
| Builds | Root `build`; each member `build`; web `tsc && vite build` | Opt-in; compile shared packages before applications; emits protected generated files |
| Type checks | Root `typecheck`: `tsc -b && tsc -p tests` | Emits build output and metadata; must be labeled write-producing, not read-only |
| Formatting | `lint`: Prettier check; `format`: Prettier write | Offer `lint`; never treat `format` as a validation check |
| Main tests | `test`, `test:unit`, `test:integration`, `test:security` | Vitest; API imports built workspace packages, so cleaning outputs can require a rebuild first |
| Browser tests | `test:e2e`, `test:playwright`, `test:a11y`, `test:performance` | Playwright Chromium and built outputs required; starts servers on 4000/4173; no separately named smoke script |
| PostgreSQL tests | `test:pg` | Requires an explicitly isolated test database; do not infer a safe target from available credentials |
| Migration integrity | `node --test scripts/tests/migration-integrity.test.mjs` | Local fixture-based validation; inspect independently of DB migration execution |
| Database writes | `db:migrate`, `db:seed`, scripts/migrate.mjs, scripts/seed.mjs | Excluded from routine maintenance; never auto-run |
| Release checks | scripts/release-preflight.mjs | Reads selected database and requires credentials; separate operator action |
| Client-secret scan | scripts/check-client-secrets.mjs | Requires built web bundle and synthetic sentinels; not automatically valid with real credentials |
| Asset generation | scripts/generate-icons.js | Writes required public icons; do not run as cleanup/validation |
| Test bootstrap | scripts/start-e2e-api.mjs | Imports API dist and starts a server; not a standalone health check |
| Deployment | deploy/oracle/Dockerfile, compose.yaml, Caddyfile | Document only; no Docker prune, compose down, volume removal, service restart, deployment or migration |
| Backup/restore | deploy/oracle/backup.sh, verify-restore.sh | Excluded; creates dumps or databases and has its own safety requirements |

Compose owns persistent `db_data`, `caddy_data`, and `caddy_config` volumes. These are never local cleanup targets. `.env*`, key material, database dumps, package manifests, lockfiles, configuration, source, migrations and static/public assets must survive every routine operation.

## Proposed Bash tool design for review

### 1. Interface and scope

One root `project-maintenance.sh` contains the reusable Bash functions and interactive menu requested in the brief (scan, build cleanup, dependency removal, cache cleanup, install, clean/reinstall, full maintenance/validation, individual selection, preview, export, exit). The same implementation exposes `--root PATH`, `--scan`, `--dry-run`, and explicit category/check selectors for fixture tests and automation. No shell configuration is sourced or evaluated.

Default execution never mutates anything. Read-only scans and dry runs write only to stdout; report export is a separately selected write. Execution requires displaying the complete plan and a fresh explicit confirmation. Empty input, EOF, invalid confirmation, and cancellation do not authorize operations. No `--yes` bypass is needed.

### 2. Discovery and project model

Canonicalize the root physically. Use NUL-delimited `find -P`, quoted paths, Bash arrays, and deduplicated physical directories. Skip `.git`, dependency internals, protected data, reports and repeatable literal path exclusions. Reject symlink roots and never traverse links. Detect nested manifests at arbitrary depth; determine workspace membership from configuration instead of treating every descendant as a member. Independent nested package-manager roots remain independent.

Node.js is already required by this repository and may be invoked only for safe JSON metadata parsing. Bash owns discovery, planning, validation, command execution, cleanup, menus, and reporting. Never execute configuration modules merely to discover their settings. Dynamic/ambiguous build output configuration is review-only. Recognize unsupported manifest families without implementing speculative package-manager adapters for absent technologies.

For Node projects, support manager selection from an unambiguous packageManager/lockfile/workspace combination. Use frozen modes for detected pnpm/npm/Yarn installations; ambiguous managers, missing lockfiles, unsupported workspace syntax and version mismatches block installation instead of generating lockfiles. Do not repeat workspace installation for members.

### 3. Candidate verification and selection

Every candidate records project, technology, manifest/lockfile, category, path, classification reason, estimated size if available, and safe/review/prohibited status. Use configured TypeScript/Vite outputs and verified framework/cache conventions. Unknown directories never become eligible solely by name.

Allow repeatable literal exclusions and explicit category-scoped cleanup approvals, with no executable configuration. Explicit approvals cannot override hard protection of manifests, lockfiles, source, secrets, databases, user data, tracked files, nested repositories, or paths outside the root. Do not delete a directory containing a protected descendant. Reject overlapping plans or collapse equivalent targets; account for shared workspace dependencies when selecting an individual member.

### 4. Execution safety

Build a plan before changing anything. Show exact deletion targets and command argument arrays, explain dependency recovery and loss of diagnostic output, validate tools and lockfiles, and then request confirmation. Recheck root containment, every ancestor, symlinks, provenance, protections and access immediately before deletion. Serialize mutations with a repository-local operation lock acquired only for approved execution; stale locks require inspection rather than automatic override.

No eval, shell command-string concatenation, global cache purge, lifecycle-script execution without disclosure/review, database writes, Docker cleanup, or automatic server termination. Commands use Bash argument arrays. Run only selected known validation scripts after inspecting their purpose; unknown scripts are displayed for manual review. Stop dependent steps after failed restore/build; independent failures contribute to a partial-failure exit status. A failed prerequisite must not leave dependencies removed with no viable restoration plan.

Trap INT/TERM, terminate only child processes started by this invocation, preserve completed operation records, and exit nonzero. No rollback promise: deleted ignored output cannot be recovered by Git; restore requires the recorded install/build commands and may require registry access. Recommend backups for anything not proven disposable. Refuse unsafe concurrent repository mutation; portable shell checks cannot eliminate malicious filesystem races or arbitrary behavior inside trusted project commands.

### 5. Validation and reports

Let users select lint/format checks, type checks, unit/integration/security tests, builds and configured smoke/browser checks. Explain prerequisites and whether each command writes output. Do not invent absent scripts or report skipped checks as passing. Full maintenance follows discovery, plan, prerequisites, confirmation, approved removal, frozen restore, selected checks, report.

Capture command stdout/stderr and exact exit codes privately. Persistent reports contain sanitized diagnostic output, allowlisted command descriptions, removed/skipped paths, failures, warnings, unsupported projects, final status and next actions. Never dump the environment or read `.env` for logging. Do not assume regex redaction can safely publish arbitrary command output: omit unsafe output and report its omission. Report directory creation/export requires selection; use restrictive permissions, timestamped filenames and collision avoidance; always exclude it from discovery/cleanup. Do not claim a space-reclaimed figure by summing shared or overlapping directory sizes.

Proposed exits: 0 success/no-op/cancel; 1 partial operation failure; 2 invalid arguments/input; 3 fatal discovery/safety/prerequisite error; 130 interruption; 143 termination. Interactive input errors redisplay the menu; final status retains any failure already encountered.

### 6. Test and verification plan

Create a Bash fixture test script under `scripts/tests` before production implementation, observe expected failures, then implement to pass. Every destructive test uses a disposable directory created and verified under the system temporary directory, never the real repository. Package-manager stubs may simulate failure/output/interruptions without network installs; actual discovery, planning and deletion run against the fixtures.

Cover root/deep projects, spaces and shell metacharacters, pnpm shared workspace versus independent npm/Yarn projects, unsupported language manifests, missing/ambiguous manifests/locks, missing tools, protected descendants, tracked files, symlinks both inside and outside scope, unknown build/cache/vendor names, permission errors where enforceable, failed restore, interrupts, exclusion/approval validation, overlapping targets, empty repositories, repeated runs, dry-run content and metadata preservation, report permissions/redaction, and exit codes. Permission tests must explicitly skip when the execution identity bypasses permissions, rather than claiming coverage.

Run `bash -n` and ShellCheck when available, then fixture tests. Apply `chmod +x project-maintenance.sh` without staging unrelated changes. Perform only read-only `--scan` and `--dry-run` against the real repository and preserve output for review. No actual repository cleanup or reinstall is authorized by this implementation request. Native macOS/Linux behavior needs evidence or must remain a stated limitation when verification is limited to Git Bash on Windows.

### 7. Deliverables and review boundary

Planned deliverables: `project-maintenance.sh`; `scripts/tests/project-maintenance.test.sh`; focused usage/safety documentation; this discovery report updated with implementation and validation evidence. No existing build/configuration file needs editing. App behavior, API boundaries, database schema, pricing and entitlements remain unchanged.

The user explicitly requested creation of this script. That authorizes its implementation and fixture-only destructive tests, subject to the requested Superpowers design review. It does not authorize real cleanup or installation in this working tree. `AGENTS.md` continues to protect existing build files, generated artifacts and installed dependencies from agent modification.

Alternatives considered: fixed hard-coded cleanup paths are shorter but miss independent deep projects; a generic multi-language cleanup engine adds unverified destructive behavior for absent stacks. The proposed design instead scans all relevant manifests, supports the detected JavaScript ecosystem, and reports unsupported stacks conservatively, as the brief permits.

The user approved this design and explicitly requested implementation. The script, fixture tests, implementation plan and usage documentation now exist; see the evidence below.

## Current verification evidence and limitations

- Read-only recursive project/configuration discovery ran successfully in Git Bash 5.3.15 on Windows.
- `find`, `git`, `du`, `stat`, Node and pnpm are available. ShellCheck was not found on PATH; it has not run.
- Dependency size measurement completed: root `node_modules` reported 150632 KiB, web 7177 KiB, and other members 30–40 KiB each. These are allocation readings, not a reliable reclaim estimate for the linked workspace.
- No application checks were run during the initial audit. Script verification evidence gathered after implementation is recorded below.
- Reticle is inapplicable to this CLI-only change and is not needed to verify Bash maintenance behavior.
- No migrations, security architecture, production configuration or application source changes are proposed.

## Implementation and verification evidence

Delivered files:

- `project-maintenance.sh` (absent in current checkout): executable Bash entry point, reusable functions, menu choices 0–10, explicit CLI selectors, safe discovery, workspace ownership, reviewed cleanup, frozen restoration, configured validation, private reports and interruption handling.
- `scripts/tests/project-maintenance.test.sh` (absent in current checkout): disposable-fixture suite. Package-manager invocations are stubbed; discovery, command planning, target validation, deletion, reporting and process cancellation execute for real inside temporary fixtures.
- [`../engineering/PROJECT_MAINTENANCE.md`](../engineering/PROJECT_MAINTENANCE.md): launch commands, selection flags, supported technology/configuration dialects, recovery, reporting, exit codes and platform limitations.
- `../superpowers/plans/2026-10-21-project-maintenance.md` (retired 2026-10-26; see `docs/final-project-documentation/08-ROADMAP-AND-DECISIONS.md` Appendix A/B; original in git history): implementation plan based on the approved design.

Verification completed so far:

| Requirement / gate | Authoritative result |
|---|---|
| Test-first implementation | Initial fixture invocation failed with `requested project-maintenance.sh is missing`; later safety findings were reproduced in disposable fixtures before fixes |
| Bash syntax | `bash -n project-maintenance.sh` and `bash -n scripts/tests/project-maintenance.test.sh` exit 0 |
| Executable script | `chmod +x` applied; `test -x project-maintenance.sh` passed in Git Bash |
| Fixture safety and behavior | Final fixed-content run: 74 assertions, zero failures, exit 0; raw stdout captured in `MAINTENANCE_FIXTURE_TESTS_2026-10-21.log` |
| Real recursive scan | `--scan` exit 0; ten Node manifests, nine members and one installation owner; raw stdout captured in `MAINTENANCE_SCAN_2026-10-21.log` |
| Real full preview | `--dry-run --operation full` exit 0; 29 proposed removal targets and 15 proposed commands; raw stdout captured in `MAINTENANCE_DRY_RUN_2026-10-21.log` |
| Real cleanup/install/build | None executed by this task; all mutation tests used disposable temporary repositories |
| Independent safety review | Final focused rechecks confirmed protected workspace ancestors and unsupported outside-root patterns refuse installation with exit 3; handwritten declarations and JS sources survive explicit cleanup approvals; no remaining important finding in the focused review |
| ShellCheck | Unavailable on PATH; not run or installed |
| Native symlink fixtures | Explicitly skipped: this host cannot create native symlinks with the current identity; ordinary Git Bash `ln -s` can silently copy instead |
| Real Unix permission denial | Explicitly skipped because Windows/this identity bypasses Unix mode-bit enforcement; simulated `find` permission/discovery failure is covered |
| Reticle | Skipped because this is CLI tooling without an application UI surface |

The final real scan and dry-run were repeated after the safety fixes and both exited 0. No root `maintenance-reports` directory or maintenance lock was created by these read-only invocations. A preceding expanded test run had one exit-code assertion failure while implementation edits were still occurring; that run was not treated as passing. The script and fixture source were then held fixed for a complete rerun, which passed all 74 assertions. All actual application build/type/test commands in the dry-run remain proposals, not executed validation results.

The real full preview proposes nine `dist` directories, nine incremental metadata files, ten local `node_modules` directories, and Playwright `test-results`. Commands are one root frozen pnpm restore with scripts disabled, one root recursive build, one root lint, the root/member configured typechecks, and root unit/integration tests. A preview is not a cleanup approval or a validation pass. Dependency descendant checks are deferred until execution prerequisites to avoid traversing installations during every scan; they can still prohibit removal if secrets/data are found.

`graphify-out/cache` remains prohibited because it contains tracked files. `supabase/.temp` remains review-only. Vault state, Reticle/browser evidence, source/static inputs, migrations, environment files and backups are preserved. No database, auth, RLS, pricing, API, application source or existing build-configuration changes were made by this task.

A before/after hash/size/mtime comparison sampled 55 protected existing files. It detected concurrent changes in `apps/web/tsconfig.tsbuildinfo`, `apps/web/vite.audit.config.ts`, and `playwright.audit.config.ts` while other work was active. This task only invoked the real maintenance script with scan/dry-run flags; it did not write those paths. The comparison therefore cannot be cited as proof that the entire shared checkout stayed unchanged. Fixture fingerprints and the implementation's separate read-only paths provide the maintenance-specific evidence; other agents' staged/committed work was left untouched.

Reports produced by the script are timestamped private logs in an excluded `maintenance-reports` directory after confirmation. The raw verification stdout files beside this document are separate audit artifacts captured by the host and may be ignored by the repository's existing `*.log` rule. No credentials or raw package-manager output are stored in them.

Known limitations and manual actions:

- Native macOS/Linux, Bash 3.2, native symlinks and Unix permission enforcement still need execution on a suitable host. The implementation uses portable Bash constructs; this environment verifies Git Bash only.
- Overlapping nested workspace definitions, unsupported/negative/recursive workspace glob syntax, dynamic/inherited/JSONC output configuration, unreviewed scripts and unsupported language ecosystems fail closed or remain review-only. They do not trigger guessed installations or deletion.
- Yarn PnP/archive cleanup has no adapter; only verified local `node_modules` installations are removable. Yarn restore commands are detected, but actual Yarn/npm network installs were not performed here.
- Install lifecycle scripts are disabled. Review required native-addon setup separately; a successful restore is not proof that build or application checks pass.
- Use an isolated test database for database checks and a suitable browser/runtime for E2E checks; neither is automatically provisioned by maintenance.
- Do not use cleanup across bind mounts or concurrently changing repositories. Portable shell validation does not defend against a malicious concurrent filesystem writer.
- Actual cleanup/reinstallation remains an operator decision after inspecting the exact current plan and typing `APPLY`; no such authorization was requested or inferred during implementation.

Final completion status: the requested script, tests, usage documentation, repository inventory and dry-run evidence are delivered. No existing build file was intentionally changed by this task; no migration or application security/behavior change was needed. Verification limits above remain explicit, particularly unsupported project/configuration dialects and platforms unavailable on this host.


## Archived Bash usage reference

The following preserves the unique usage/portability details formerly in the engineering guide. It is historical; the named Bash implementation is absent.

### Archived Bash guide

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


## Original Windows tool requirements

Preserved from root `ORIGINAL_REQUEST.md`. This is historical requirements/evidence, not a current execution result or permission to mutate protected build files.

### Archived request

## 2026-10-22T03:12:14Z

Build a production-grade, universal, safe, and reusable Windows batch script (`clean-reinstall.bat`) paired with a robust PowerShell engine (`clean-reinstall.ps1`) to recursively discover, clean, and reinstall dependencies across multi-language projects, monorepos, and nested polyglot repositories.

Working directory: C:\Users\yashs\.gemini\antigravity\worktrees\talentsphere-complete\universal_project_clean_reinstall

## Requirements

### R1. Universal Project Discovery & Detection
- Recursively scan repository directories up to configurable `--max-depth` (default 5).
- Identify project manifests and technology stacks: Node/JS/TS (npm, Yarn Classic/Berry, pnpm, Bun), Python (pip, poetry, pipenv, uv, venv/.venv), .NET (.sln, .csproj, .fsproj), Java/JVM (Maven pom.xml, Gradle build.gradle/build.gradle.kts, wrappers mvnw/gradlew), PHP (Composer), Ruby (Bundler), Rust (Cargo), Go (go.mod), CMake/Make.
- Monorepo & Workspace awareness: Detect root workspaces (pnpm-workspace.yaml, npm/yarn workspaces, Lerna, Turborepo, Nx, cargo workspaces, etc.). When a workspace root manages nested packages, execute installation only at the workspace root to prevent duplicate/conflicting package manager runs.
- Prevent traversal into dependency or generated output directories (`node_modules`, `.venv`, `vendor`, `target`, `bin`, `obj`, `.next`, etc.) and reject symlinks/junctions pointing outside repository boundaries.

### R2. Safe & Comprehensive Cleanup Operations
- Remove build outputs, local dependency folders, and temporary caches according to detected technology (e.g., `node_modules`, `.venv`, `__pycache__`, `.pytest_cache`, `.turbo`, `.next`, `.nuxt`, `dist`, `build`, `bin`, `obj`, `target`, `vendor`).
- Strict Guardrails: Never delete source files, configuration (`.env*`, `.git`, IDE settings), manifests (`package.json`, `pom.xml`, etc.), or lockfiles (`package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`, `Cargo.lock`, `poetry.lock`, etc.).
- Path validation: Canonicalize every target path and verify it is strictly within the selected project root before deletion. Forbid root drives (e.g. `C:\`) or system directories.
- Optional `--deep-clean` flag for cleaning additional local caches, and `--clean-only` to skip reinstall.

### R3. Deterministic Dependency Reinstallation & Rebuild
- Reinstall dependencies deterministically using existing lockfiles where present (`pnpm install --frozen-lockfile`, `npm ci`, `yarn install --immutable`, `poetry install`, `uv sync`, `cargo fetch/build`, `dotnet restore`, etc.).
- Respect local wrappers (`mvnw`, `gradlew`) when present; detect installed tools via PATH (`where.exe`) and gracefully warn/skip if a tool/runtime is absent without crashing the entire run.
- Support optional `--build` flag to run build commands post-install when standard build scripts or manifests exist.
- Support `--install-only` to perform reinstallation without prior cleanup.

### R4. Command-Line Interface, Safety Controls & Reporting
- Batch entry point `clean-reinstall.bat` forwarding all arguments cleanly to `clean-reinstall.ps1`.
- Supported CLI flags: `--dry-run`, `--clean-only`, `--install-only`, `--build`, `--deep-clean`, `--root <path>`, `--exclude <patterns>`, `--max-depth <int>`, `--continue-on-error`, `--verbose`, `--help`.
- Interactive confirmation when invoked with no arguments, summarizing planned deletions and asking for confirmation.
- Write structured timestamped log file (excluding tokens or secrets) and output a colorized console summary of discovered, cleaned, installed, skipped, and failed projects with nonzero exit code on errors.

## Acceptance Criteria

### Project Detection & Workspace Awareness
- [ ] Correctly identifies polyglot structures and marks monorepo packages as workspace-managed without individual redundant installs.
- [ ] Ignores dependency folders during discovery and skips symlinks escaping the repository root.

### Safety & Deletion Verifications
- [ ] `--dry-run` prints exact paths that would be removed without modifying disk state.
- [ ] Running cleanup removes generated folders (`node_modules`, `.venv`, `dist`, `target`, `bin`, `obj`) while 100% preserving lockfiles, `.env`, `.git`, and source code.
- [ ] Path canonicalization strictly blocks attempts to delete paths outside the target root.

### Reinstallation & Diagnostics
- [ ] Accurately invokes frozen/immutable lockfile install commands matching detected package managers.
- [ ] Missing CLI tools are logged with clean warnings without terminating unaffected independent projects when `--continue-on-error` is active.
- [ ] Detailed run summary and log file produced with counts of discovered, cleaned, reinstalled, and failed projects.


## Historical Windows test readiness

Preserved from root `TEST_READY.md`. This is historical requirements/evidence, not a current execution result or permission to mutate protected build files.

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


## Windows implementation plan location

The former root `PROJECT.md` was byte-identical to the retained [orchestrator plan](../../.agents/teamwork/orchestrator_1/PROJECT.md). Its PLANNED milestones and safety claims are historical. Current source takes precedence.
