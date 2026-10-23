## 2026-10-22T03:16:25Z
From: 79edc2cf-e6f2-404f-a41c-95bb7e6638fd
Priority: MESSAGE_PRIORITY_HIGH

You are an Explorer subagent (ID: explorer_survey_1).
Your working directory is:
C:\Users\yashs\.gemini\antigravity\worktrees\talentsphere-complete\universal_project_clean_reinstall\.agents\teamwork\explorer_survey_1
Read your context file at:
C:\Users\yashs\.gemini\antigravity\worktrees\talentsphere-complete\universal_project_clean_reinstall\.agents\teamwork\explorer_survey_1\context.md
You MUST read the original user request verbatim from:
C:\Users\yashs\.gemini\antigravity\worktrees\talentsphere-complete\universal_project_clean_reinstall\.agents\teamwork\ORIGINAL_REQUEST.md

Your Task:
Conduct an authoritative technical survey on Requirements R1 & R2:
1. Universal Project Discovery & Manifest Detection:
   - Identify detection rules, precedence, and manifest files for Node/JS/TS (npm, yarn classic/berry, pnpm, bun), Python (pip, poetry, pipenv, uv, venv/.venv), .NET (.sln, .csproj, .fsproj), Java/JVM (Maven pom.xml, Gradle build.gradle/kts, mvnw/gradlew), PHP (Composer), Ruby (Bundler), Rust (Cargo), Go (go.mod), CMake/Make.
2. Monorepo & Workspace Hierarchies:
   - Rules for identifying workspace roots (pnpm-workspace.yaml, package.json workspaces, lerna.json, turbo.json, nx.json, Cargo.toml workspace, .sln).
   - How to track parent-child workspace relationships so nested member packages are identified as workspace members (cleaned individually if needed, but dependency reinstallation ONLY occurs at the workspace root).
3. Directory Traversal & Boundaries:
   - Directory traversal depth limits (--max-depth default 5).
   - Pruning/skipping rules during scan (never traverse into node_modules, .venv, vendor, target, bin, obj, .next, etc.).
   - Symlink and junction handling on Windows: how to detect reparse points, verify if target stays within repo root, and reject/skip escaping links.
4. Safe & Comprehensive Cleanup Operations:
   - Exact mapping of folders and file patterns to clean per technology stack (both standard and --deep-clean).
   - Guardrails: What must NEVER be deleted under any circumstances (lockfiles, source files, .env*, .git, IDE files).
   - Path Canonicalization: Exact PowerShell method to canonicalize paths, verify containment inside repo root, and block root/system drive deletion.

Output:
Write a comprehensive, structured technical survey report to:
C:\Users\yashs\.gemini\antigravity\worktrees\talentsphere-complete\universal_project_clean_reinstall\.agents\teamwork\explorer_survey_1\handoff.md
Update your progress.md regularly. When finished, send a message to bb6dcb32-d3ac-4651-8fc2-f7bb78753a0c / orchestrator informing that your report is ready.
