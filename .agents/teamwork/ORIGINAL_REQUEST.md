# Original User Request Archive

## 2026-10-22T03:25:38Z — TALENTSPHERE MASTER REPOSITORY AUDIT & AGILE ROADMAP TASK

You are the Teamwork Multi-Agent Engineering Group (Principal Architect, Product Manager, Full-Stack Engineer, Data Integrity Specialist, Application Security Engineer, QA & Reliability Engineer, DevOps/Ops Specialist, and Code Reviewer).

Conduct the complete audit of repository `https://github.com/yhsomani/talentsphere-complete.git` in workspace `C:\Users\yashs\.gemini\antigravity\worktrees\talentsphere-complete\repository_audit_roadmap`.

Current HEAD: `83dc7d24` on branch `repository_audit_roadmap`.

Requirements:
1. Baseline Verification & Diagnostics:
   - Typecheck (`tsc -b && tsc -p tests` clean).
   - Vitest unit tests (55 files, 627 passed).
   - Vitest integration tests (50 files, 402 passed).
   - Security tests (`tests/security`, 5 files, 101 passed).
   - PostgreSQL suite (`vitest.pg.config.ts`, 8 files: require `TEST_DATABASE_URL`).
   - Playwright E2E suite (`core-loop.spec.ts`, `frontend-fixes.spec.ts` verified passing 7/7 and 6/6; note port 4000/5173 isolation).
   - Build (`pnpm build` clean).
2. Audit all 173 canonical features (F-01 through F-173) against code, fastify routes (~274 routes in `apps/api/src/server.ts`), domain packages (`packages/domain`), UI (`apps/web`), and database migrations (`supabase/migrations/` 49 migrations).
3. Audit Architecture, Security & Durability:
   - ADR-015 single-writer PostgreSQL persistence (`DURABLE_ROUTES`) vs process-memory Maps (~220 routes returning `x-talentsphere-durability: ephemeral`).
   - Work-history proof of control (corporate email HMAC challenge, single-use referee voucher tokens).
   - Auth & Session security (HMAC PBKDF2 floor, session revocation table `revoked_sessions`, RLS policies).
   - AI Governance (`AI_PROHIBITED` server enforcement, quota metering, local heuristic `generateCareerAssistantResponse`).
   - External integrations (Resend adapter, simulated billing mode, staging docker compose on Oracle ARM64).
4. Reconcile GitHub Issues #44 through #50 and PRs #40–#58.
5. Define Release Scope (Core Career Loop: Candidate -> Evidence -> Verification -> Jobs -> Application -> Recruiter Review -> Outcome).
6. Build actionable, deduplicated Backlog with stable IDs, registry priority, urgency (P0-P3), Given/When/Then acceptance criteria, and specific verification tests.
7. Construct dependency-aware Sprint Roadmap across Stages A through F.
8. Produce the complete suite of audit deliverables in `docs/reports/` and update project memory in `BRAIN/MEMORY.md`.

Return a detailed summary of findings, deliverables written, and strategic conclusions.

---

## 2026-10-22T03:12:14Z — CLEAN REINSTALL UTILITY TASK

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
