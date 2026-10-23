# Survey Explorer 2 Context: Deterministic Reinstallation & Build Specifications

- Original Request: C:\Users\yashs\.gemini\antigravity\worktrees\talentsphere-complete\universal_project_clean_reinstall\.agents\teamwork\ORIGINAL_REQUEST.md
- Project Root: C:\Users\yashs\.gemini\antigravity\worktrees\talentsphere-complete\universal_project_clean_reinstall
- Working Directory: C:\Users\yashs\.gemini\antigravity\worktrees\talentsphere-complete\universal_project_clean_reinstall\.agents\teamwork\explorer_survey_2

## Scope & Focus
1. Deterministic Reinstall Command Matrix:
   - For every package manager and manifest type:
     - pnpm: `pnpm install --frozen-lockfile` (fallback to `pnpm install` if no lockfile)
     - npm: `npm ci` (if `package-lock.json`), fallback to `npm install`
     - Yarn Berry: `yarn install --immutable`
     - Yarn Classic: `yarn install --frozen-lockfile`
     - Bun: `bun install --frozen-lockfile`
     - Python:
       - uv: `uv sync` or `uv pip install -r requirements.txt`
       - poetry: `poetry install` (and `poetry install --no-root`)
       - pipenv: `pipenv install` / `pipenv sync`
       - pip / venv: creating `.venv` via `python -m venv .venv` and installing requirements
     - .NET: `dotnet restore`
     - Rust: `cargo fetch` / `cargo build`
     - Go: `go mod download`
     - PHP: `composer install`
     - Ruby: `bundle install`
     - Java/JVM: `./gradlew` or `gradlew.bat` or `gradle build -x test`, `mvnw.cmd` / `mvnw` / `mvn dependency:resolve` or `mvn compile -DskipTests`
2. Tool Detection & Runtime Availability:
   - PATH detection via `where.exe` or `Get-Command` in PowerShell.
   - Local wrappers vs global CLIs (`mvnw.cmd`, `gradlew.bat`).
   - Graceful skip/warn when tools are missing: how missing runtimes are surfaced without crashing the whole pipeline.
3. Post-install Rebuild (`--build` flag):
   - Common build commands per stack (`npm run build`, `dotnet build`, `cargo build`, etc.).
   - Error handling & exit codes when builds fail, especially under `--continue-on-error`.
4. Command execution safety in PowerShell:
   - Output streaming, stderr capturing, execution failure detection (`$LASTEXITCODE`), environment variable isolation.
