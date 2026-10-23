# Original User Request

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
