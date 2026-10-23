# Survey Explorer 1 Context: Project Discovery, Monorepos & Safe Cleanup Specifications

- Original Request: C:\Users\yashs\.gemini\antigravity\worktrees\talentsphere-complete\universal_project_clean_reinstall\.agents\teamwork\ORIGINAL_REQUEST.md
- Project Root: C:\Users\yashs\.gemini\antigravity\worktrees\talentsphere-complete\universal_project_clean_reinstall
- Working Directory: C:\Users\yashs\.gemini\antigravity\worktrees\talentsphere-complete\universal_project_clean_reinstall\.agents\teamwork\explorer_survey_1

## Scope & Focus
1. Project manifest & technology stack detection specifications:
   - Node/JS/TS (npm `package.json`, yarn classic/berry `.yarnrc` / `yarn.lock`, pnpm `pnpm-lock.yaml`, bun `bun.lockb` / `bun.lock`)
   - Python (`pyproject.toml`, `setup.py`, `setup.cfg`, `requirements.txt`, `Pipfile`, `poetry.lock`, `uv.lock`, `.venv`, `venv`)
   - .NET (`*.sln`, `*.csproj`, `*.fsproj`)
   - Java/JVM (`pom.xml`, `build.gradle`, `build.gradle.kts`, `mvnw`, `mvnw.cmd`, `gradlew`, `gradlew.bat`)
   - PHP (`composer.json`, `composer.lock`)
   - Ruby (`Gemfile`, `Gemfile.lock`)
   - Rust (`Cargo.toml`, `Cargo.lock`)
   - Go (`go.mod`, `go.sum`)
   - CMake / Make (`CMakeLists.txt`, `Makefile`)
2. Monorepo & Workspace Hierarchy specifications:
   - Root workspace manifests (`pnpm-workspace.yaml`, npm/yarn `workspaces` field in `package.json`, `lerna.json`, `turbo.json`, `nx.json`, Cargo workspace `[workspace]` in `Cargo.toml`, .NET solution `*.sln`)
   - Workspace ownership logic: how nested packages are detected as member packages of a parent workspace root, so dependency install is ONLY run at the workspace root while clean operations target appropriate local build/artifact folders.
3. Safe Cleanup Specifications:
   - Target folders per tech stack (`node_modules`, `.venv`, `__pycache__`, `.pytest_cache`, `.turbo`, `.next`, `.nuxt`, `dist`, `build`, `bin`, `obj`, `target`, `vendor`, etc.)
   - Strict deletion guardrails: Never delete source files, lockfiles, `.env*`, `.git`, IDE folders (`.vscode`, `.idea`).
   - Path canonicalization on Windows: canonical full path checks, symlink / junction detection (skip or reject symlinks escaping project root), preventing root drive or system dir deletion.
   - `--deep-clean` vs standard clean differences.
