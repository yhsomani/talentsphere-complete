# Repository maintenance audit and proposed design

Date: 2026-10-21. Status: discovery complete; design awaiting review; script not implemented or tested.

## Purpose and audit boundary

Provide the requested single interactive Bash entry point, `project-maintenance.sh`, for recursive discovery, reviewed cleanup, dependency restoration, validation, and reporting. The attached brief is the requirements source. This document records the read-only discovery results and a concrete proposed design, not implementation evidence.

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

Review requested: approve the above design before production implementation. This is an audit/proposed-design artifact; it does not claim that the requested script or tests exist yet.

## Current verification evidence and limitations

- Read-only recursive project/configuration discovery ran successfully in Git Bash 5.3.15 on Windows.
- `find`, `git`, `du`, `stat`, Node and pnpm are available. ShellCheck was not found on PATH; it has not run.
- Dependency size measurement completed: root `node_modules` reported 150632 KiB, web 7177 KiB, and other members 30–40 KiB each. These are allocation readings, not a reliable reclaim estimate for the linked workspace.
- No application checks were run during the audit; no script syntax, fixture or dry-run result exists before implementation.
- Reticle is inapplicable to this CLI-only change and is not needed to verify Bash maintenance behavior.
- No migrations, security architecture, production configuration or application source changes are proposed.
