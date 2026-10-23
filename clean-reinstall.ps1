# ============================================================================
# Universal Project Clean & Reinstall Engine
# Windows PowerShell 5.1 & PowerShell Core 7+ Universal Engine
# ============================================================================

param(
    [Alias('dry-run')]
    [switch]$DryRun,

    [Alias('clean-only')]
    [switch]$CleanOnly,

    [Alias('install-only')]
    [switch]$InstallOnly,

    [switch]$Build,

    [Alias('deep-clean')]
    [switch]$DeepClean,

    [string]$Root = (Get-Location).Path,

    [string[]]$Exclude = @(),

    [Alias('max-depth')]
    [int]$MaxDepth = 5,

    [Alias('continue-on-error')]
    [switch]$ContinueOnError,

    [Alias('y', 'force')]
    [switch]$Yes,

    [Alias('verbose', 'v')]
    [switch]$VerboseOutput,

    [Alias('h', '?')]
    [switch]$Help
)

# ----------------------------------------------------------------------------
# 1. Help & Usage Information
# ----------------------------------------------------------------------------
function Show-Help {
    Write-Host @"
Universal Project Clean & Reinstall Engine (Windows)
Usage:
    clean-reinstall.bat [options]
    clean-reinstall.ps1 [options]

Options:
    --dry-run             Simulate discovery and cleanup operations without deleting files or running installers.
    --clean-only          Remove build artifacts, dependency directories, and caches without reinstalling.
    --install-only        Reinstall dependencies without removing existing build/dependency directories.
    --build               Execute post-install build commands for detected projects/monorepos.
    --deep-clean          Remove extended build caches (.turbo, .next, .cache, .pytest_cache, .vs, etc.).
    --root <path>         Path to root directory to scan (default: current working directory).
    --exclude <patterns>  Comma-separated list or multiple patterns of directories to exclude from discovery.
    --max-depth <int>     Maximum directory traversal depth (default: 5).
    --continue-on-error   Continue processing subsequent projects if an installation or cleanup error occurs.
    --yes, -y             Confirm operations non-interactively (required for automated / CI executions).
    --verbose, -v         Enable detailed diagnostic output.
    --help, -h            Display this help message and exit.

Exit Codes:
    0   All operations succeeded (or were gracefully skipped).
    1   One or more errors occurred, or validation failed.
"@ -ForegroundColor Cyan
}

# ----------------------------------------------------------------------------
# 2. Secret Redaction & Logging Subsystem
# ----------------------------------------------------------------------------
$global:SecretPatterns = @(
    '(?i)(password|secret|token|api_?key)\s*[:=]\s*(["''][^"'']+["'']|[^\s,]+)',
    '//registry\.npmjs\.org/:_authToken=[a-zA-Z0-9_\-]+',
    'ghp_[a-zA-Z0-9]{36}',
    'github_pat_[a-zA-Z0-9_]{82}',
    'Bearer\s+[a-zA-Z0-9_\-\.]+',
    'AKIA[0-9A-Z]{16}',
    '(https?:\/\/)([^:\/\s]+):([^@\/\s]+)@',
    'eyJ[a-zA-Z0-9_\-]{10,}\.eyJ[a-zA-Z0-9_\-]{10,}\.[a-zA-Z0-9_\-]+'
)

function Sanitize-Text {
    param([string]$Text)
    if ([string]::IsNullOrEmpty($Text)) { return $Text }
    $sanitized = $Text
    foreach ($pattern in $global:SecretPatterns) {
        $sanitized = [regex]::Replace($sanitized, $pattern, {
            param($m)
            if ($m.Groups.Count -gt 2 -and $m.Groups[1].Value.StartsWith("http")) {
                return "$($m.Groups[1].Value)$($m.Groups[2].Value):[REDACTED]@"
            }
            if ($m.Groups.Count -gt 2) {
                return "$($m.Groups[1].Value)=[REDACTED]"
            }
            return "[REDACTED_SECRET]"
        })
    }
    return $sanitized
}

function Write-LogMessage {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [ValidateSet('INFO', 'SUCCESS', 'WARN', 'ERROR', 'DEBUG')]
        [string]$Level = 'INFO',
        [switch]$NoConsole
    )

    $timestamp = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss.fff')
    $sanitized = Sanitize-Text $Message
    $logLine = "[$timestamp] [$Level] $sanitized"

    if ($global:LogFilePath) {
        try {
            [System.IO.File]::AppendAllText($global:LogFilePath, "$logLine`r`n", [System.Text.Encoding]::UTF8)
        } catch {
            # In case log write fails, proceed without crashing
        }
    }

    if (-not $NoConsole) {
        switch ($Level) {
            'SUCCESS' { Write-Host $sanitized -ForegroundColor Green }
            'WARN'    { Write-Host $sanitized -ForegroundColor Yellow }
            'ERROR'   { Write-Host $sanitized -ForegroundColor Red }
            'DEBUG'   { if ($VerboseOutput) { Write-Host $sanitized -ForegroundColor DarkGray } }
            default   { Write-Host $sanitized }
        }
    }
}

# ----------------------------------------------------------------------------
# 3. Path Canonicalization & Containment Guard Subsystem
# ----------------------------------------------------------------------------
function Test-SafePathContainment {
    param(
        [Parameter(Mandatory=$true)][string]$TargetPath,
        [Parameter(Mandatory=$true)][string]$RootPath
    )

    if ([string]::IsNullOrWhiteSpace($TargetPath) -or [string]::IsNullOrWhiteSpace($RootPath)) {
        return $false
    }

    try {
        $canonicalRoot = [System.IO.Path]::GetFullPath($RootPath).TrimEnd('\', '/')
        $canonicalTarget = [System.IO.Path]::GetFullPath($TargetPath).TrimEnd('\', '/')
    } catch {
        return $false
    }

    # Forbid Root Drives (e.g. C:, C:\, D:\)
    $rootDrive = [System.IO.Path]::GetPathRoot($canonicalTarget).TrimEnd('\', '/')
    if ($canonicalTarget.Equals($rootDrive, [System.StringComparison]::OrdinalIgnoreCase) -or $canonicalTarget.Length -le 3) {
        return $false
    }

    # Forbid Critical Windows System Directories
    $strictSystemDirs = @(
        $env:SystemRoot,
        $env:ProgramFiles,
        ${env:ProgramFiles(x86)},
        $env:ProgramData
    ) | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | ForEach-Object {
        try { [System.IO.Path]::GetFullPath($_).TrimEnd('\', '/') } catch { $null }
    } | Where-Object { $null -ne $_ }

    foreach ($sysDir in $strictSystemDirs) {
        if ($canonicalTarget.Equals($sysDir, [System.StringComparison]::OrdinalIgnoreCase) -or
            $canonicalTarget.StartsWith($sysDir + '\', [System.StringComparison]::OrdinalIgnoreCase) -or
            $canonicalRoot.Equals($sysDir, [System.StringComparison]::OrdinalIgnoreCase) -or
            $canonicalRoot.StartsWith($sysDir + '\', [System.StringComparison]::OrdinalIgnoreCase)) {
            return $false
        }
    }

    if ($env:USERPROFILE) {
        $userProf = [System.IO.Path]::GetFullPath($env:USERPROFILE).TrimEnd('\', '/')
        if ($canonicalTarget.Equals($userProf, [System.StringComparison]::OrdinalIgnoreCase) -or
            $canonicalRoot.Equals($userProf, [System.StringComparison]::OrdinalIgnoreCase)) {
            return $false
        }
    }

    # Target MUST NOT be identical to the Project Root itself
    if ($canonicalTarget.Equals($canonicalRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
        return $false
    }

    # Target MUST be strictly inside Project Root (with trailing separator check)
    $rootWithSlash = $canonicalRoot + '\'
    if (-not $canonicalTarget.StartsWith($rootWithSlash, [System.StringComparison]::OrdinalIgnoreCase)) {
        return $false
    }

    # Check Guardrail: Must not match protected file patterns
    $targetName = [System.IO.Path]::GetFileName($canonicalTarget)
    $protectedPatterns = @(
        'package-lock.json', 'pnpm-lock.yaml', 'yarn.lock', 'bun.lock', 'bun.lockb',
        'Cargo.lock', 'poetry.lock', 'uv.lock', 'Pipfile.lock', 'composer.lock', 'Gemfile.lock', 'packages.lock.json', 'go.sum', 'go.work.sum', 'gradle.lockfile',
        'package.json', 'pnpm-workspace.yaml', 'lerna.json', 'turbo.json', 'nx.json',
        'pyproject.toml', 'setup.py', 'setup.cfg', 'Pipfile', 'requirements*.txt',
        'pom.xml', 'build.gradle*', 'settings.gradle*', 'gradlew*', 'mvnw*',
        '*.sln', '*.slnx', '*.csproj', '*.fsproj', '*.vbproj', 'Directory.Build.props', 'Directory.Packages.props', 'global.json', 'nuget.config',
        'composer.json', 'Gemfile', 'Cargo.toml', 'go.mod', 'go.work', 'CMakeLists.txt', 'Makefile', 'makefile', 'GNUmakefile',
        '.git', '.gitignore', '.gitattributes', '.github',
        '.env*'
    )

    foreach ($pattern in $protectedPatterns) {
        if ($targetName -like $pattern) {
            return $false
        }
    }

    # Source code and configuration directory blacklist
    $sourceDirBlacklist = @(
        'src', 'lib', 'app', 'apps', 'packages', 'components', 'pages', 'routes',
        'services', 'include', 'docs', 'documentation', 'scripts', 'tools',
        'config', 'public', 'assets', 'tests', 'test', 'spec', '.vscode', '.idea'
    )

    if ($sourceDirBlacklist -contains $targetName) {
        return $false
    }

    return $true
}

# ----------------------------------------------------------------------------
# 4. Discovery, Reparse Point & Workspace Resolution Engine
# ----------------------------------------------------------------------------
function Get-DiscoveredProjects {
    param(
        [Parameter(Mandatory=$true)][string]$RootPath,
        [Parameter(Mandatory=$false)][int]$MaxDepth = 5,
        [Parameter(Mandatory=$false)][string[]]$Exclude = @()
    )

    try {
        $canonicalRoot = [System.IO.Path]::GetFullPath($RootPath).TrimEnd('\', '/')
    } catch {
        Write-LogMessage "Invalid root path: $RootPath" -Level ERROR
        return @()
    }

    # Normalize user excludes
    $normalizedExcludes = @()
    foreach ($item in $Exclude) {
        if ($item) {
            $parts = $item.Split(',', [System.StringSplitOptions]::RemoveEmptyEntries)
            foreach ($p in $parts) {
                $trimmed = $p.Trim()
                if ($trimmed) { $normalizedExcludes += $trimmed }
            }
        }
    }

    # Folders that must be pruned before descending during directory scan
    $pruneFolderNames = @(
        'node_modules', '.venv', 'venv', 'env', 'vendor', 'bower_components', '.bundle',
        'dist', 'build', 'out', 'target', 'bin', 'obj', '.next', '.nuxt', '.turbo', '.output',
        '.svelte-kit', '.parcel-cache', '.docusaurus', 'storybook-static', 'cmake-build-debug',
        'cmake-build-release', 'CMakeFiles',
        '__pycache__', '.pytest_cache', '.mypy_cache', '.ruff_cache', '.tox', '.nox', '.gradle',
        '.cargo', '.m2', '.cache', '.vs', '.idea',
        '.git', '.svn', '.hg', '.agents', '.reticle'
    )

    $queue = New-Object System.Collections.Queue
    $queue.Enqueue([PSCustomObject]@{ Path = $canonicalRoot; Depth = 0 })

    $rawProjects = @()
    $workspaceRoots = @()

    while ($queue.Count -gt 0) {
        $item = $queue.Dequeue()
        $currPath = $item.Path
        $currDepth = $item.Depth

        # Identify manifests in currPath
        $manifestFiles = @(Get-ChildItem -LiteralPath $currPath -File -Force -ErrorAction SilentlyContinue)
        $manifestNames = $manifestFiles | ForEach-Object { $_.Name }

        # Check for Workspace Roots
        $isWorkspaceRoot = $false
        $workspaceType = $null

        if ($manifestNames -contains 'pnpm-workspace.yaml') {
            $isWorkspaceRoot = $true
            $workspaceType = 'pnpm'
        } elseif ($manifestNames -contains 'lerna.json') {
            $isWorkspaceRoot = $true
            $workspaceType = 'lerna'
        } elseif ($manifestNames -contains 'turbo.json') {
            $isWorkspaceRoot = $true
            $workspaceType = 'turbo'
        } elseif ($manifestNames -contains 'nx.json') {
            $isWorkspaceRoot = $true
            $workspaceType = 'nx'
        } elseif ($manifestNames -contains 'go.work') {
            $isWorkspaceRoot = $true
            $workspaceType = 'go-work'
        } elseif ($manifestNames -contains 'settings.gradle' -or $manifestNames -contains 'settings.gradle.kts') {
            $isWorkspaceRoot = $true
            $workspaceType = 'gradle-root'
        } elseif (($manifestNames | Where-Object { $_ -like '*.sln' -or $_ -like '*.slnx' }).Count -gt 0) {
            $isWorkspaceRoot = $true
            $workspaceType = 'dotnet-sln'
        } elseif ($manifestNames -contains 'package.json') {
            try {
                $pkgContent = Get-Content -LiteralPath (Join-Path $currPath 'package.json') -Raw -ErrorAction SilentlyContinue
                if ($pkgContent -match '"workspaces"\s*:') {
                    $isWorkspaceRoot = $true
                    $workspaceType = 'npm-workspaces'
                }
            } catch {}
        } elseif ($manifestNames -contains 'Cargo.toml') {
            try {
                $cargoContent = Get-Content -LiteralPath (Join-Path $currPath 'Cargo.toml') -Raw -ErrorAction SilentlyContinue
                if ($cargoContent -match '\[workspace\]') {
                    $isWorkspaceRoot = $true
                    $workspaceType = 'cargo-workspace'
                }
            } catch {}
        } elseif ($manifestNames -contains 'pom.xml') {
            try {
                $pomContent = Get-Content -LiteralPath (Join-Path $currPath 'pom.xml') -Raw -ErrorAction SilentlyContinue
                if ($pomContent -match '<packaging>\s*pom\s*</packaging>' -and $pomContent -match '<modules>') {
                    $isWorkspaceRoot = $true
                    $workspaceType = 'maven-parent'
                }
            } catch {}
        }

        if ($isWorkspaceRoot) {
            $workspaceRoots += [PSCustomObject]@{
                Path = $currPath
                WorkspaceType = $workspaceType
            }
        }

        # Detect project manifests and ecosystems in currPath
        $detectedEcosystem = $null
        $detectedManifest = $null
        $detectedPM = $null
        $detectedLock = $null

        # 1. Node / JS / TS
        if ($manifestNames -contains 'package.json') {
            $detectedEcosystem = 'Node'
            $detectedManifest = 'package.json'

            if ($manifestNames -contains 'bun.lock' -or $manifestNames -contains 'bun.lockb') {
                $detectedPM = 'bun'
                $detectedLock = if ($manifestNames -contains 'bun.lock') { 'bun.lock' } else { 'bun.lockb' }
            } elseif ($manifestNames -contains 'pnpm-lock.yaml') {
                $detectedPM = 'pnpm'
                $detectedLock = 'pnpm-lock.yaml'
            } elseif ($manifestNames -contains 'yarn.lock') {
                $detectedLock = 'yarn.lock'
                $isBerry = $false
                if ($manifestNames -contains '.yarnrc.yml' -or (Test-Path -LiteralPath (Join-Path $currPath '.yarn/releases'))) {
                    $isBerry = $true
                } else {
                    try {
                        $yarnLockHead = Get-Content -LiteralPath (Join-Path $currPath 'yarn.lock') -TotalCount 10 -ErrorAction SilentlyContinue
                        if (($yarnLockHead -join "`n") -match '__metadata') { $isBerry = $true }
                    } catch {}
                }
                $detectedPM = if ($isBerry) { 'yarn-berry' } else { 'yarn-classic' }
            } elseif ($manifestNames -contains 'package-lock.json') {
                $detectedPM = 'npm'
                $detectedLock = 'package-lock.json'
            } elseif ($manifestNames -contains 'npm-shrinkwrap.json') {
                $detectedPM = 'npm'
                $detectedLock = 'npm-shrinkwrap.json'
            } else {
                # Inspect packageManager field in package.json
                try {
                    $pkgJson = Get-Content -LiteralPath (Join-Path $currPath 'package.json') -Raw -ErrorAction SilentlyContinue
                    if ($pkgJson -match '"packageManager"\s*:\s*"([a-zA-Z0-9_\-]+)@') {
                        $detectedPM = $matches[1]
                    }
                } catch {}
                if (-not $detectedPM) {
                    $detectedPM = if ($manifestNames -contains 'pnpm-workspace.yaml') { 'pnpm' } else { 'npm' }
                }
            }
        }
        # 2. Python
        elseif ($manifestNames -contains 'pyproject.toml' -or ($manifestNames | Where-Object { $_ -like 'requirements*.txt' }).Count -gt 0 -or $manifestNames -contains 'setup.py' -or $manifestNames -contains 'setup.cfg' -or $manifestNames -contains 'Pipfile') {
            $detectedEcosystem = 'Python'
            $detectedManifest = if ($manifestNames -contains 'pyproject.toml') { 'pyproject.toml' } elseif ($manifestNames -contains 'Pipfile') { 'Pipfile' } else { ($manifestNames | Where-Object { $_ -like 'requirements*.txt' } | Select-Object -First 1) }
            if (-not $detectedManifest) { $detectedManifest = 'setup.py' }

            if ($manifestNames -contains 'uv.lock') {
                $detectedPM = 'uv'
                $detectedLock = 'uv.lock'
            } elseif ($manifestNames -contains 'poetry.lock') {
                $detectedPM = 'poetry'
                $detectedLock = 'poetry.lock'
            } elseif ($manifestNames -contains 'Pipfile.lock') {
                $detectedPM = 'pipenv'
                $detectedLock = 'Pipfile.lock'
            } else {
                # Check pyproject.toml contents for tool indication
                $pyprojContent = ''
                if ($manifestNames -contains 'pyproject.toml') {
                    try { $pyprojContent = Get-Content -LiteralPath (Join-Path $currPath 'pyproject.toml') -Raw -ErrorAction SilentlyContinue } catch {}
                }
                if ($pyprojContent -match '\[tool\.uv\]') {
                    $detectedPM = 'uv'
                } elseif ($pyprojContent -match '\[tool\.poetry\]') {
                    $detectedPM = 'poetry'
                } elseif ($manifestNames -contains 'Pipfile') {
                    $detectedPM = 'pipenv'
                } else {
                    $detectedPM = 'pip'
                }
            }
        }
        # 3. .NET
        elseif (($manifestNames | Where-Object { $_ -like '*.sln' -or $_ -like '*.slnx' -or $_ -like '*.csproj' -or $_ -like '*.fsproj' -or $_ -like '*.vbproj' }).Count -gt 0) {
            $detectedEcosystem = '.NET'
            $slnFile = $manifestNames | Where-Object { $_ -like '*.sln' -or $_ -like '*.slnx' } | Select-Object -First 1
            $projFile = $manifestNames | Where-Object { $_ -like '*.csproj' -or $_ -like '*.fsproj' -or $_ -like '*.vbproj' } | Select-Object -First 1
            $detectedManifest = if ($slnFile) { $slnFile } else { $projFile }
            $detectedPM = 'dotnet'
            if ($manifestNames -contains 'packages.lock.json') {
                $detectedLock = 'packages.lock.json'
            }
        }
        # 4. Java / JVM
        elseif ($manifestNames -contains 'pom.xml' -or $manifestNames -contains 'build.gradle' -or $manifestNames -contains 'build.gradle.kts' -or $manifestNames -contains 'settings.gradle' -or $manifestNames -contains 'settings.gradle.kts') {
            $detectedEcosystem = 'Java'
            if ($manifestNames -contains 'build.gradle' -or $manifestNames -contains 'build.gradle.kts' -or $manifestNames -contains 'settings.gradle' -or $manifestNames -contains 'settings.gradle.kts') {
                $detectedManifest = if ($manifestNames -contains 'build.gradle') { 'build.gradle' } elseif ($manifestNames -contains 'build.gradle.kts') { 'build.gradle.kts' } else { 'settings.gradle' }
                $detectedPM = 'gradle'
                if ($manifestNames -contains 'gradle.lockfile') { $detectedLock = 'gradle.lockfile' }
            } else {
                $detectedManifest = 'pom.xml'
                $detectedPM = 'mvn'
            }
        }
        # 5. Rust
        elseif ($manifestNames -contains 'Cargo.toml') {
            $detectedEcosystem = 'Rust'
            $detectedManifest = 'Cargo.toml'
            $detectedPM = 'cargo'
            if ($manifestNames -contains 'Cargo.lock') { $detectedLock = 'Cargo.lock' }
        }
        # 6. PHP
        elseif ($manifestNames -contains 'composer.json') {
            $detectedEcosystem = 'PHP'
            $detectedManifest = 'composer.json'
            $detectedPM = 'composer'
            if ($manifestNames -contains 'composer.lock') { $detectedLock = 'composer.lock' }
        }
        # 7. Ruby
        elseif ($manifestNames -contains 'Gemfile') {
            $detectedEcosystem = 'Ruby'
            $detectedManifest = 'Gemfile'
            $detectedPM = 'bundle'
            if ($manifestNames -contains 'Gemfile.lock') { $detectedLock = 'Gemfile.lock' }
        }
        # 8. Go
        elseif ($manifestNames -contains 'go.mod' -or $manifestNames -contains 'go.work') {
            $detectedEcosystem = 'Go'
            $detectedManifest = if ($manifestNames -contains 'go.work') { 'go.work' } else { 'go.mod' }
            $detectedPM = 'go'
            if ($manifestNames -contains 'go.work.sum') {
                $detectedLock = 'go.work.sum'
            } elseif ($manifestNames -contains 'go.sum') {
                $detectedLock = 'go.sum'
            }
        }
        # 9. CMake / Make
        elseif ($manifestNames -contains 'CMakeLists.txt' -or $manifestNames -contains 'Makefile' -or $manifestNames -contains 'makefile' -or $manifestNames -contains 'GNUmakefile') {
            $detectedEcosystem = 'CMake'
            $detectedManifest = if ($manifestNames -contains 'CMakeLists.txt') { 'CMakeLists.txt' } else { 'Makefile' }
            $detectedPM = if ($manifestNames -contains 'CMakeLists.txt') { 'cmake' } else { 'make' }
        }

        if ($detectedEcosystem) {
            $relPath = if ($currPath -eq $canonicalRoot) { '.' } else { $currPath.Substring($canonicalRoot.Length + 1) }
            $rawProjects += [PSCustomObject]@{
                Path = $currPath
                RelativePath = $relPath
                Ecosystem = $detectedEcosystem
                ManifestFile = $detectedManifest
                PackageManager = $detectedPM
                Lockfile = $detectedLock
                IsWorkspaceRoot = $isWorkspaceRoot
                IsWorkspaceMember = $false
                WorkspaceRootPath = $null
                WorkspaceType = $workspaceType
                CleanTargets = @()
            }
        }

        # Queue child directories if below MaxDepth
        if ($currDepth -lt $MaxDepth) {
            $subDirs = @(Get-ChildItem -LiteralPath $currPath -Directory -Force -ErrorAction SilentlyContinue)
            foreach ($sub in $subDirs) {
                $subName = $sub.Name
                $subFullName = $sub.FullName

                # 1. Check user exclude patterns
                $isUserExcluded = $false
                foreach ($exc in $normalizedExcludes) {
                    if ($subName -like $exc -or $subFullName -like "*\$exc*" -or $subFullName -like "*/$exc*") {
                        $isUserExcluded = $true
                        break
                    }
                }
                if ($isUserExcluded) {
                    Write-LogMessage "Skipping user-excluded directory: '$subFullName'" -Level DEBUG
                    continue
                }

                # 2. Check pre-descent prune folder names
                if ($pruneFolderNames -contains $subName) {
                    Write-LogMessage "Pruning directory from traversal: '$subFullName'" -Level DEBUG
                    continue
                }

                # 3. Check for Reparse Point (Junction or Symlink)
                $isReparse = (($sub.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0)
                if ($isReparse) {
                    # Extract target without .NET 6 API
                    $rawTarget = if ($sub.Target -is [array]) { $sub.Target[0] } else { $sub.Target }
                    if ($rawTarget) {
                        try {
                            $targetCandidate = if ([System.IO.Path]::IsPathRooted($rawTarget)) {
                                $rawTarget
                            } else {
                                Join-Path $currPath $rawTarget
                            }
                            $canonicalTarget = [System.IO.Path]::GetFullPath($targetCandidate).TrimEnd('\', '/')
                            $isInside = $canonicalTarget.StartsWith($canonicalRoot + '\', [System.StringComparison]::OrdinalIgnoreCase) -or ($canonicalTarget -eq $canonicalRoot)
                            if (-not $isInside) {
                                Write-LogMessage "[SECURITY] Skipping escaping junction/symlink: '$subFullName' -> points to external '$canonicalTarget'" -Level WARN
                                continue
                            } else {
                                # Internal reparse points: skip descent to prevent circular loops
                                Write-LogMessage "Skipping internal reparse point to prevent traversal cycles: '$subFullName'" -Level DEBUG
                                continue
                            }
                        } catch {
                            continue
                        }
                    } else {
                        # If target cannot be determined, safely skip traversal
                        Write-LogMessage "Skipping indeterminate reparse point: '$subFullName'" -Level DEBUG
                        continue
                    }
                }

                # Enqueue valid subdirectory
                $queue.Enqueue([PSCustomObject]@{ Path = $subFullName; Depth = ($currDepth + 1) })
            }
        }
    }

    # Resolve Monorepo Workspace Members vs Standalone Projects
    foreach ($p in $rawProjects) {
        if ($p.IsWorkspaceRoot) {
            continue
        }

        # Look for ancestor workspace root
        $parentWs = $workspaceRoots | Where-Object {
            $p.Path.StartsWith($_.Path + '\', [System.StringComparison]::OrdinalIgnoreCase) -and (
                ($_.WorkspaceType -match 'pnpm|npm|yarn|lerna|turbo|nx' -and $p.Ecosystem -eq 'Node') -or
                ($_.WorkspaceType -match 'cargo' -and $p.Ecosystem -eq 'Rust') -or
                ($_.WorkspaceType -match 'go' -and $p.Ecosystem -eq 'Go') -or
                ($_.WorkspaceType -match 'dotnet|\.net' -and $p.Ecosystem -eq '.NET') -or
                ($_.WorkspaceType -match 'gradle|maven' -and $p.Ecosystem -eq 'Java')
            )
        } | Sort-Object { $_.Path.Length } | Select-Object -Last 1

        if ($parentWs) {
            $p.IsWorkspaceMember = $true
            $p.WorkspaceRootPath = $parentWs.Path
            $p.WorkspaceType = $parentWs.WorkspaceType
        }
    }

    # Resolve Clean Targets for each project
    foreach ($p in $rawProjects) {
        $p.CleanTargets = @(Resolve-ProjectCleanTargets -Project $p -DeepClean $DeepClean -RootPath $canonicalRoot)
    }

    return $rawProjects
}

# ----------------------------------------------------------------------------
# 5. Resolve Project Clean Targets
# ----------------------------------------------------------------------------
function Resolve-ProjectCleanTargets {
    param(
        [Parameter(Mandatory=$true)][object]$Project,
        [Parameter(Mandatory=$true)][bool]$DeepClean,
        [Parameter(Mandatory=$true)][string]$RootPath
    )

    $targets = @()
    $pPath = $Project.Path
    $eco = $Project.Ecosystem

    # Candidate directory names per ecosystem
    $candidateDirs = @()
    $candidateFiles = @()

    switch ($eco) {
        'Node' {
            $candidateDirs += @('node_modules', 'dist', 'build', 'out', '.next', '.nuxt', '.output', '.turbo', '.svelte-kit', '.parcel-cache', '.docusaurus', 'storybook-static')
            if ($DeepClean) {
                $candidateDirs += @('coverage', '.nyc_output', '.cache')
                $candidateFiles += @('.eslintcache', '.tsbuildinfo')
            }
        }
        'Python' {
            $candidateDirs += @('.venv', 'venv', 'env', '__pycache__', 'build', 'dist')
            if ($DeepClean) {
                $candidateDirs += @('.pytest_cache', '.mypy_cache', '.ruff_cache', '.tox', '.nox', 'htmlcov')
                $candidateFiles += @('.coverage')
            }
        }
        '.NET' {
            $candidateDirs += @('bin', 'obj', 'TestResults')
            if ($DeepClean) {
                $candidateDirs += @('.vs', 'BenchmarkDotNet.Artifacts')
            }
        }
        'Java' {
            $candidateDirs += @('target', 'build', '.gradle')
            if ($DeepClean) {
                $candidateFiles += @('.flattened-pom.xml', '.gradletasknamecache')
            }
        }
        'PHP' {
            $candidateDirs += @('vendor')
            if ($DeepClean) {
                $candidateFiles += @('.phpunit.result.cache')
            }
        }
        'Ruby' {
            $candidateDirs += @('.bundle', 'vendor\bundle')
            if ($DeepClean) {
                $candidateDirs += @('coverage')
            }
        }
        'Rust' {
            $candidateDirs += @('target')
        }
        'Go' {
            $candidateDirs += @('vendor')
            if ($DeepClean) {
                $candidateFiles += @('coverage.out', 'profile.out')
            }
        }
        'CMake' {
            $candidateDirs += @('build', 'cmake-build-debug', 'cmake-build-release', 'CMakeFiles')
            $candidateFiles += @('CMakeCache.txt')
            if ($DeepClean) {
                $candidateFiles += @('Makefile.cmake', 'cmake_install.cmake')
            }
        }
    }

    # Python egg-info and dist-info wildcards
    if ($eco -eq 'Python') {
        $eggDirs = Get-ChildItem -LiteralPath $pPath -Directory -Force -ErrorAction SilentlyContinue | Where-Object { $_.Name -like '*.egg-info' -or $_.Name -like '*.dist-info' }
        foreach ($d in $eggDirs) {
            $candidateDirs += $d.Name
        }
    }

    # Verify and collect existing directory targets
    foreach ($dirName in $candidateDirs) {
        $fullTarget = Join-Path $pPath $dirName
        if (Test-Path -LiteralPath $fullTarget -PathType Container) {
            if (Test-SafePathContainment -TargetPath $fullTarget -RootPath $RootPath) {
                $targets += [PSCustomObject]@{
                    Path = [System.IO.Path]::GetFullPath($fullTarget).TrimEnd('\', '/')
                    Type = 'Directory'
                }
            }
        }
    }

    # Verify and collect existing file targets
    foreach ($fileName in $candidateFiles) {
        $fullTarget = Join-Path $pPath $fileName
        if (Test-Path -LiteralPath $fullTarget -PathType Leaf) {
            if (Test-SafePathContainment -TargetPath $fullTarget -RootPath $RootPath) {
                $targets += [PSCustomObject]@{
                    Path = [System.IO.Path]::GetFullPath($fullTarget)
                    Type = 'File'
                }
            }
        }
    }

    return $targets
}

# ----------------------------------------------------------------------------
# 6. Safe Cleanup Engine
# ----------------------------------------------------------------------------
function Invoke-SafeClean {
    param(
        [Parameter(Mandatory=$false)][AllowEmptyCollection()][object[]]$Projects = @(),
        [Parameter(Mandatory=$false)][bool]$DryRun = $false,
        [Parameter(Mandatory=$false)][bool]$DeepClean = $false,
        [Parameter(Mandatory=$false)][string]$RootPath = (Get-Location).Path,
        [Parameter(Mandatory=$false)][bool]$ContinueOnError = $false
    )

    if (-not $Projects -or $Projects.Count -eq 0) {
        return [PSCustomObject]@{
            CleanedCount = 0
            SkippedCount = 0
            FailedCount  = 0
        }
    }

    $cleanedCount = 0
    $skippedCount = 0
    $failedCount = 0
    $deletedPaths = @{}

    Write-LogMessage "=================================================================" -Level INFO
    Write-LogMessage "CLEANUP PHASE $(if ($DryRun) { '[DRY-RUN SIMULATION]' } else { '' })" -Level INFO
    Write-LogMessage "=================================================================" -Level INFO

    foreach ($project in $Projects) {
        $targets = @($project.CleanTargets)
        if ($targets.Count -eq 0) {
            continue
        }

        Write-LogMessage "Project '$($project.RelativePath)' ($($project.Ecosystem)) - $($targets.Count) target(s)" -Level INFO

        foreach ($targetItem in $targets) {
            $targetPath = $targetItem.Path

            # Prevent duplicate deletions if targets overlap
            if ($deletedPaths.ContainsKey($targetPath)) {
                continue
            }
            $deletedPaths[$targetPath] = $true

            # Double-check containment before any deletion attempt
            if (-not (Test-SafePathContainment -TargetPath $targetPath -RootPath $RootPath)) {
                Write-LogMessage "[SECURITY] Refusing deletion of uncontained or protected target: '$targetPath'" -Level ERROR
                $failedCount++
                if (-not $ContinueOnError) {
                    throw "Security violation: Attempted to delete uncontained target '$targetPath'."
                }
                continue
            }

            if ($DryRun) {
                Write-LogMessage "  [DRY-RUN] Would remove: '$targetPath'" -Level INFO
                $cleanedCount++
            } else {
                try {
                    if ($targetItem.Type -eq 'Directory') {
                        if (Test-Path -LiteralPath $targetPath -PathType Container) {
                            # Clear read-only attributes on nested files
                            Get-ChildItem -LiteralPath $targetPath -Recurse -Force -ErrorAction SilentlyContinue | ForEach-Object {
                                if ($_.IsReadOnly) { $_.IsReadOnly = $false }
                            }

                            $deleted = $false
                            for ($attempt = 1; $attempt -le 3; $attempt++) {
                                try {
                                    [System.IO.Directory]::Delete($targetPath, $true)
                                    $deleted = $true
                                    break
                                } catch {
                                    Start-Sleep -Milliseconds 200
                                }
                            }

                            if (-not $deleted) {
                                Remove-Item -LiteralPath $targetPath -Recurse -Force -ErrorAction Stop
                            }
                            Write-LogMessage "  [CLEAN] Removed directory: '$targetPath'" -Level SUCCESS
                            $cleanedCount++
                        }
                    } else {
                        if (Test-Path -LiteralPath $targetPath -PathType Leaf) {
                            $fInfo = New-Object System.IO.FileInfo($targetPath)
                            if ($fInfo.IsReadOnly) { $fInfo.IsReadOnly = $false }
                            [System.IO.File]::Delete($targetPath)
                            Write-LogMessage "  [CLEAN] Removed file: '$targetPath'" -Level SUCCESS
                            $cleanedCount++
                        }
                    }
                } catch {
                    $errMsg = "Failed to remove '$targetPath': $($_.Exception.Message)"
                    Write-LogMessage "  [ERROR] $errMsg" -Level ERROR
                    $failedCount++
                    if (-not $ContinueOnError) {
                        throw $_
                    }
                }
            }
        }
    }

    return [PSCustomObject]@{
        CleanedCount = $cleanedCount
        SkippedCount = $skippedCount
        FailedCount  = $failedCount
    }
}

# ----------------------------------------------------------------------------
# 7. Tool Resolution & Deterministic Reinstall/Build Engine
# ----------------------------------------------------------------------------
function Resolve-Executable {
    param(
        [Parameter(Mandatory=$true)][string]$ToolName,
        [Parameter(Mandatory=$false)][string]$ProjectPath = $null
    )

    # 1. Local wrappers check
    if ($ProjectPath) {
        if ($ToolName -eq 'mvn' -or $ToolName -eq 'mvnw') {
            $mvnwCmd = Join-Path $ProjectPath 'mvnw.cmd'
            if (Test-Path -LiteralPath $mvnwCmd) { return $mvnwCmd }
            $mvnwBat = Join-Path $ProjectPath 'mvnw.bat'
            if (Test-Path -LiteralPath $mvnwBat) { return $mvnwBat }
        }
        if ($ToolName -eq 'gradle' -or $ToolName -eq 'gradlew') {
            $gradlewBat = Join-Path $ProjectPath 'gradlew.bat'
            if (Test-Path -LiteralPath $gradlewBat) { return $gradlewBat }
            $gradlewCmd = Join-Path $ProjectPath 'gradlew.cmd'
            if (Test-Path -LiteralPath $gradlewCmd) { return $gradlewCmd }
        }
    }

    # 2. System PATH check via Get-Command
    $cmds = @(Get-Command -Name $ToolName -CommandType Application -ErrorAction SilentlyContinue)
    if ($cmds.Count -gt 0) {
        # Prioritize Windows executables (.cmd, .exe, .bat) over extensionless POSIX scripts
        $winExe = $cmds | Where-Object { $_.Source -match '\.(cmd|exe|bat)$' } | Select-Object -First 1
        if ($winExe) { return $winExe.Source }
        return $cmds[0].Source
    }

    return $null
}

function Invoke-ToolCommand {
    param(
        [Parameter(Mandatory=$true)][string]$Executable,
        [Parameter(Mandatory=$false)][string[]]$ArgumentList = @(),
        [Parameter(Mandatory=$false)][string]$WorkingDirectory = $PWD.Path,
        [Parameter(Mandatory=$false)][string]$LogFile = $null,
        [Parameter(Mandatory=$false)][bool]$ContinueOnError = $false
    )

    Push-Location -LiteralPath $WorkingDirectory
    try {
        $previousEAP = $ErrorActionPreference
        $ErrorActionPreference = 'Continue'

        & $Executable @ArgumentList 2>&1 | ForEach-Object {
            $line = $_.ToString()
            $sanitized = Sanitize-Text $line
            [Console]::WriteLine($sanitized)
            if ($LogFile) {
                try {
                    [System.IO.File]::AppendAllText($LogFile, "$sanitized`r`n", [System.Text.Encoding]::UTF8)
                } catch {}
            }
        }

        $exitCode = if ($null -ne $LASTEXITCODE) { $LASTEXITCODE } else { 0 }
        $ErrorActionPreference = $previousEAP

        if ($exitCode -ne 0) {
            $errMsg = "Command '$Executable $($ArgumentList -join ' ')' failed with exit code $exitCode in '$WorkingDirectory'."
            Write-LogMessage $errMsg -Level ERROR
            if (-not $ContinueOnError) {
                throw [System.InvalidOperationException]::new($errMsg)
            }
        }

        return $exitCode
    } finally {
        Pop-Location
    }
}

function Invoke-ReinstallAndBuild {
    param(
        [Parameter(Mandatory=$false)][AllowEmptyCollection()][object[]]$Projects = @(),
        [Parameter(Mandatory=$false)][bool]$Build = $false,
        [Parameter(Mandatory=$false)][bool]$ContinueOnError = $false,
        [Parameter(Mandatory=$false)][string]$LogFile = $null,
        [Parameter(Mandatory=$false)][string]$RootPath = ''
    )

    if (-not $Projects -or $Projects.Count -eq 0) {
        return [PSCustomObject]@{
            InstalledCount = 0
            SkippedCount   = 0
            FailedCount    = 0
            Results        = @()
        }
    }

    $installedCount = 0
    $skippedCount = 0
    $failedCount = 0
    $results = @()

    Write-LogMessage "=================================================================" -Level INFO
    Write-LogMessage "REINSTALLATION PHASE" -Level INFO
    Write-LogMessage "=================================================================" -Level INFO

    foreach ($project in $Projects) {
        $pRel = $project.RelativePath
        $pPath = $project.Path
        $eco = $project.Ecosystem
        $pm = $project.PackageManager

        # Rule: Skip reinstallation for workspace members (handled at workspace root)
        if ($project.IsWorkspaceMember) {
            $effectiveRoot = if (-not [string]::IsNullOrWhiteSpace($RootPath)) {
                $RootPath
            } elseif ($canonicalRoot) {
                $canonicalRoot
            } elseif ($Root) {
                $Root
            } else {
                (Get-Location).Path
            }
            try { $effectiveRoot = [System.IO.Path]::GetFullPath($effectiveRoot).TrimEnd('\', '/') } catch {}

            $wsRel = if ($project.WorkspaceRootPath -and $effectiveRoot -and $project.WorkspaceRootPath.StartsWith($effectiveRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
                $project.WorkspaceRootPath.Substring($effectiveRoot.Length).TrimStart('\', '/')
            } else {
                $project.WorkspaceRootPath
            }
            if ([string]::IsNullOrEmpty($wsRel)) { $wsRel = '.' }

            Write-LogMessage "[INFO] Subproject '$pRel' is managed by workspace root '$wsRel' - skipping redundant package install." -Level INFO
            $skippedCount++
            $results += [PSCustomObject]@{
                Path      = $pRel
                Ecosystem = $eco
                Operation = 'Install'
                Status    = 'Skipped (Workspace Managed)'
            }
            continue
        }

        # Resolve deterministic command and arguments
        $exeName = $null
        $exeArgs = @()

        switch ($eco) {
            'Node' {
                if ($pm -eq 'pnpm') {
                    $exeName = 'pnpm'
                    $exeArgs = if ($project.Lockfile) { @('install', '--frozen-lockfile') } else { @('install') }
                } elseif ($pm -eq 'bun') {
                    $exeName = 'bun'
                    $exeArgs = if ($project.Lockfile) { @('install', '--frozen-lockfile') } else { @('install') }
                } elseif ($pm -eq 'yarn-berry') {
                    $exeName = 'yarn'
                    $exeArgs = if ($project.Lockfile) { @('install', '--immutable') } else { @('install') }
                } elseif ($pm -eq 'yarn-classic') {
                    $exeName = 'yarn'
                    $exeArgs = if ($project.Lockfile) { @('install', '--frozen-lockfile') } else { @('install') }
                } else {
                    $exeName = 'npm'
                    $exeArgs = if ($project.Lockfile) { @('ci') } else { @('install') }
                }
            }
            'Python' {
                if ($pm -eq 'uv') {
                    $exeName = 'uv'
                    $exeArgs = if ($project.Lockfile) { @('sync', '--frozen') } else { @('sync') }
                } elseif ($pm -eq 'poetry') {
                    $exeName = 'poetry'
                    $exeArgs = if ($project.Lockfile) { @('install', '--sync') } else { @('install') }
                } elseif ($pm -eq 'pipenv') {
                    $exeName = 'pipenv'
                    $exeArgs = if ($project.Lockfile) { @('sync') } else { @('install') }
                } else {
                    $exeName = 'python'
                    $reqFile = if ($project.ManifestFile -like 'requirements*.txt') { $project.ManifestFile } else { 'requirements.txt' }
                    $exeArgs = @('-m', 'pip', 'install', '-r', $reqFile)
                }
            }
            '.NET' {
                $exeName = 'dotnet'
                $exeArgs = if ($project.Lockfile) { @('restore', '--locked-mode') } else { @('restore') }
            }
            'Java' {
                if ($pm -eq 'gradle') {
                    $exeName = 'gradle'
                    $exeArgs = @('--refresh-dependencies')
                } else {
                    $exeName = 'mvn'
                    $exeArgs = @('dependency:resolve')
                }
            }
            'PHP' {
                $exeName = 'composer'
                $exeArgs = @('install', '--no-interaction', '--prefer-dist')
            }
            'Ruby' {
                $exeName = 'bundle'
                $exeArgs = @('install')
            }
            'Rust' {
                $exeName = 'cargo'
                $exeArgs = if ($project.Lockfile) { @('fetch', '--locked') } else { @('fetch') }
            }
            'Go' {
                $exeName = 'go'
                $exeArgs = @('mod', 'download')
            }
            'CMake' {
                $exeName = 'cmake'
                $exeArgs = @('-B', 'build', '-S', '.')
            }
        }

        if (-not $exeName) {
            Write-LogMessage "[WARN] Could not determine installer executable for '$pRel'. Skipping." -Level WARN
            $skippedCount++
            $results += [PSCustomObject]@{
                Path      = $pRel
                Ecosystem = $eco
                Operation = 'Install'
                Status    = 'Skipped (No Installer)'
            }
            continue
        }

        # Resolve tool path (checking local wrapper first)
        $resolvedExe = Resolve-Executable -ToolName $exeName -ProjectPath $pPath
        if (-not $resolvedExe) {
            Write-LogMessage "[WARN] Tool '$exeName' was not found on PATH. Skipping project at '$pRel'." -Level WARN
            $skippedCount++
            $results += [PSCustomObject]@{
                Path      = $pRel
                Ecosystem = $eco
                Operation = 'Install'
                Status    = 'Skipped (Tool Missing)'
            }
            continue
        }

        # Execute installer
        Write-LogMessage "[INSTALL] Running '$resolvedExe $($exeArgs -join ' ')' in '$pRel'..." -Level INFO
        try {
            $cmdCode = Invoke-ToolCommand -Executable $resolvedExe -ArgumentList $exeArgs -WorkingDirectory $pPath -LogFile $LogFile -ContinueOnError $ContinueOnError
            if ($cmdCode -eq 0) {
                $installedCount++
                $results += [PSCustomObject]@{
                    Path      = $pRel
                    Ecosystem = $eco
                    Operation = 'Install'
                    Status    = 'Installed'
                }
            } else {
                $failedCount++
                $results += [PSCustomObject]@{
                    Path      = $pRel
                    Ecosystem = $eco
                    Operation = 'Install'
                    Status    = 'Failed'
                }
                if (-not $ContinueOnError) {
                    break
                }
            }
        } catch {
            $failedCount++
            $results += [PSCustomObject]@{
                Path      = $pRel
                Ecosystem = $eco
                Operation = 'Install'
                Status    = 'Failed'
            }
            if (-not $ContinueOnError) {
                break
            }
        }
    }

    # Optional Post-Install Build Phase (--build)
    if ($Build -and ($failedCount -eq 0 -or $ContinueOnError)) {
        Write-LogMessage "=================================================================" -Level INFO
        Write-LogMessage "BUILD PHASE (--build)" -Level INFO
        Write-LogMessage "=================================================================" -Level INFO

        foreach ($project in $Projects) {
            $pRel = $project.RelativePath
            $pPath = $project.Path
            $eco = $project.Ecosystem

            $buildExe = $null
            $buildArgs = @()

            switch ($eco) {
                'Node' {
                    # Check package.json scripts for "build"
                    try {
                        $pkgRaw = Get-Content -LiteralPath (Join-Path $pPath 'package.json') -Raw -ErrorAction SilentlyContinue
                        if ($pkgRaw -match '"build"\s*:') {
                            $buildExe = if ($project.PackageManager -match 'pnpm') { 'pnpm' } elseif ($project.PackageManager -match 'bun') { 'bun' } elseif ($project.PackageManager -match 'yarn') { 'yarn' } else { 'npm' }
                            $buildArgs = @('run', 'build')
                        }
                    } catch {}
                }
                '.NET' {
                    $buildExe = 'dotnet'
                    $buildArgs = @('build', '--no-restore')
                }
                'Rust' {
                    $buildExe = 'cargo'
                    $buildArgs = if ($project.IsWorkspaceRoot) { @('build', '--workspace', '--locked') } else { @('build', '--locked') }
                }
                'Go' {
                    $buildExe = 'go'
                    $buildArgs = @('build', './...')
                }
                'Java' {
                    if ($project.PackageManager -eq 'gradle') {
                        $buildExe = 'gradle'
                        $buildArgs = @('assemble', '-x', 'test')
                    } else {
                        $buildExe = 'mvn'
                        $buildArgs = @('compile', '-DskipTests')
                    }
                }
                'CMake' {
                    $buildExe = 'cmake'
                    $buildArgs = @('--build', 'build', '--config', 'Release')
                }
                'PHP' {
                    try {
                        $compRaw = Get-Content -LiteralPath (Join-Path $pPath 'composer.json') -Raw -ErrorAction SilentlyContinue
                        if ($compRaw -match '"build"\s*:') {
                            $buildExe = 'composer'
                            $buildArgs = @('run-script', 'build', '--no-interaction')
                        }
                    } catch {}
                }
                'Python' {
                    try {
                        $pyprojRaw = Get-Content -LiteralPath (Join-Path $pPath 'pyproject.toml') -Raw -ErrorAction SilentlyContinue
                        if ($pyprojRaw -match '\[build-system\]' -or (Test-Path -LiteralPath (Join-Path $pPath 'setup.py'))) {
                            $buildExe = 'python'
                            $buildArgs = @('-m', 'build')
                        }
                    } catch {}
                }
            }

            if ($buildExe) {
                $resolvedBuildExe = Resolve-Executable -ToolName $buildExe -ProjectPath $pPath
                if ($resolvedBuildExe) {
                    Write-LogMessage "[BUILD] Building '$pRel' using '$resolvedBuildExe $($buildArgs -join ' ')'..." -Level INFO
                    try {
                        $bCode = Invoke-ToolCommand -Executable $resolvedBuildExe -ArgumentList $buildArgs -WorkingDirectory $pPath -LogFile $LogFile -ContinueOnError $ContinueOnError
                        if ($bCode -eq 0) {
                            $results += [PSCustomObject]@{
                                Path      = $pRel
                                Ecosystem = $eco
                                Operation = 'Build'
                                Status    = 'Built'
                            }
                        } else {
                            $failedCount++
                            $results += [PSCustomObject]@{
                                Path      = $pRel
                                Ecosystem = $eco
                                Operation = 'Build'
                                Status    = 'Failed'
                            }
                            if (-not $ContinueOnError) { break }
                        }
                    } catch {
                        $failedCount++
                        $results += [PSCustomObject]@{
                            Path      = $pRel
                            Ecosystem = $eco
                            Operation = 'Build'
                            Status    = 'Failed'
                        }
                        if (-not $ContinueOnError) { break }
                    }
                } else {
                    Write-LogMessage "[WARN] Build tool '$buildExe' not found on PATH. Skipping build for '$pRel'." -Level WARN
                }
            }
        }
    }

    return [PSCustomObject]@{
        InstalledCount = $installedCount
        SkippedCount   = $skippedCount
        FailedCount    = $failedCount
        Results        = $results
    }
}

# ----------------------------------------------------------------------------
# 8. Main Orchestrator, Interactive UX & Summary Reporting
# ----------------------------------------------------------------------------
if ($MyInvocation.InvocationName -ne '.') {
    if ($Help) {
        Show-Help
        exit 0
    }

    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

# 8.1 Validate Mutually Exclusive Flags
if ($CleanOnly -and $InstallOnly) {
    Write-LogMessage "Error: --clean-only and --install-only are mutually exclusive." -Level ERROR
    exit 1
}

# 8.2 Validate MaxDepth
if ($MaxDepth -lt 0) {
    Write-LogMessage "Error: --max-depth must be a non-negative integer." -Level ERROR
    exit 1
}

# 8.3 Canonicalize Root and Guard Against Root Drives / System Directories
try {
    $canonicalRoot = [System.IO.Path]::GetFullPath($Root).TrimEnd('\', '/')
} catch {
    Write-LogMessage "Error: Invalid root directory path '$Root'." -Level ERROR
    exit 1
}

if (-not (Test-Path -LiteralPath $canonicalRoot -PathType Container)) {
    Write-LogMessage "Error: Root path does not exist or is not a directory: '$canonicalRoot'" -Level ERROR
    exit 1
}

$rootDrive = [System.IO.Path]::GetPathRoot($canonicalRoot).TrimEnd('\', '/')
if ($canonicalRoot.Equals($rootDrive, [System.StringComparison]::OrdinalIgnoreCase) -or $canonicalRoot.Length -le 3) {
    Write-LogMessage "FATAL: Targeted root '$canonicalRoot' is a drive or filesystem root. Aborting for safety." -Level ERROR
    exit 1
}

$strictSystemDirs = @(
    $env:SystemRoot,
    $env:ProgramFiles,
    ${env:ProgramFiles(x86)},
    $env:ProgramData
) | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | ForEach-Object {
    try { [System.IO.Path]::GetFullPath($_).TrimEnd('\', '/') } catch { $null }
} | Where-Object { $null -ne $_ }

foreach ($sysDir in $strictSystemDirs) {
    if ($canonicalRoot.Equals($sysDir, [System.StringComparison]::OrdinalIgnoreCase) -or
        $canonicalRoot.StartsWith($sysDir + '\', [System.StringComparison]::OrdinalIgnoreCase)) {
        Write-LogMessage "FATAL: Targeted root '$canonicalRoot' is a critical Windows system directory. Aborting for safety." -Level ERROR
        exit 1
    }
}

if ($env:USERPROFILE) {
    $userProf = [System.IO.Path]::GetFullPath($env:USERPROFILE).TrimEnd('\', '/')
    if ($canonicalRoot.Equals($userProf, [System.StringComparison]::OrdinalIgnoreCase)) {
        Write-LogMessage "FATAL: Targeted root '$canonicalRoot' is the User Profile root. Aborting for safety." -Level ERROR
        exit 1
    }
}

# 8.4 Initialize Structured Log File
$timestamp = (Get-Date).ToString('yyyyMMdd_HHmmss')
$global:LogFilePath = Join-Path $canonicalRoot "clean-reinstall_$timestamp.log"
try {
    [System.IO.File]::WriteAllText($global:LogFilePath, "=== Universal Clean & Reinstall Log - $(Get-Date) ===`r`n", [System.Text.Encoding]::UTF8)
} catch {
    # If root is not writable, fallback to temp path
    $global:LogFilePath = Join-Path ([System.IO.Path]::GetTempPath()) "clean-reinstall_$timestamp.log"
    [System.IO.File]::WriteAllText($global:LogFilePath, "=== Universal Clean & Reinstall Log - $(Get-Date) ===`r`n", [System.Text.Encoding]::UTF8)
}

Write-LogMessage "Target Root: $canonicalRoot" -Level INFO
Write-LogMessage "Log File:    $global:LogFilePath" -Level INFO

# 8.5 Discovery Scan
Write-LogMessage "Scanning for projects (Max Depth: $MaxDepth)..." -Level INFO
$discoveredProjects = @(Get-DiscoveredProjects -RootPath $canonicalRoot -MaxDepth $MaxDepth -Exclude $Exclude)

$totalTargetsCount = 0
foreach ($p in $discoveredProjects) {
    $totalTargetsCount += @($p.CleanTargets).Count
}

Write-LogMessage "Discovered $($discoveredProjects.Count) project(s) with $totalTargetsCount target artifact(s)." -Level SUCCESS

# 8.6 Interactive Confirmation Prompt Guard
$isInteractive = [Environment]::UserInteractive -and -not [Console]::IsInputRedirected
$isNoArgsInvocation = ($PSBoundParameters.Count -eq 0) -or 
                      ($PSBoundParameters.Count -eq 1 -and $PSBoundParameters.ContainsKey('Root'))

if ($isNoArgsInvocation -and -not $Yes -and -not $DryRun) {
    if (-not $isInteractive) {
        Write-LogMessage "Error: Script invoked without arguments in a non-interactive environment." -Level ERROR
        Write-LogMessage "Pass explicit operational flags (e.g. --clean-only, --dry-run) or pass --yes to confirm in scripts." -Level ERROR
        exit 1
    }

    Write-Host "`nPlanned Operations Summary:" -ForegroundColor Cyan
    Write-Host "Discovered $($discoveredProjects.Count) projects across '$canonicalRoot'"
    Write-Host "Target artifact directories/files to delete: $totalTargetsCount"
    Write-Host "`nProceed with cleanup and reinstallation? [y/N]: " -NoNewline -ForegroundColor Yellow
    $ans = Read-Host
    if ($ans -notmatch '^[yY](es)?$') {
        Write-LogMessage "Operation cancelled by user." -Level INFO
        exit 0
    }
}

# 8.7 Execution Dispatch
if ($discoveredProjects.Count -eq 0) {
    Write-LogMessage "No matching projects discovered in '$canonicalRoot'. Nothing to clean or reinstall." -Level INFO
    $stopwatch.Stop()
    $elapsedSec = [math]::Round($stopwatch.Elapsed.TotalSeconds, 2)

    Write-Host "`n=================================================================" -ForegroundColor Cyan
    Write-Host "RUN SUMMARY REPORT" -ForegroundColor Cyan
    Write-Host "=================================================================" -ForegroundColor Cyan
    Write-Host "No projects discovered." -ForegroundColor Yellow
    Write-Host "-----------------------------------------------------------------" -ForegroundColor Gray
    Write-Host "Total Discovered Projects: 0" -ForegroundColor White
    Write-Host "Elapsed Time:              $elapsedSec seconds" -ForegroundColor White
    Write-Host "Log File:                  $global:LogFilePath" -ForegroundColor Gray
    Write-Host "=================================================================`n" -ForegroundColor Cyan

    Write-LogMessage "Clean & Reinstall completed SUCCESSFULLY." -Level SUCCESS
    exit 0
}

$hasErrors = $false
$cleanSummary = $null
$installSummary = $null

if ($DryRun) {
    $cleanSummary = Invoke-SafeClean -Projects $discoveredProjects -DryRun $true -DeepClean $DeepClean -RootPath $canonicalRoot -ContinueOnError $ContinueOnError
} elseif ($CleanOnly) {
    try {
        $cleanSummary = Invoke-SafeClean -Projects $discoveredProjects -DryRun $false -DeepClean $DeepClean -RootPath $canonicalRoot -ContinueOnError $ContinueOnError
        if ($cleanSummary.FailedCount -gt 0) { $hasErrors = $true }
    } catch {
        $hasErrors = $true
    }
} elseif ($InstallOnly) {
    try {
        $installSummary = Invoke-ReinstallAndBuild -Projects $discoveredProjects -Build $Build -ContinueOnError $ContinueOnError -LogFile $global:LogFilePath
        if ($installSummary.FailedCount -gt 0) { $hasErrors = $true }
    } catch {
        $hasErrors = $true
    }
} else {
    # Default: Clean first, then Reinstall
    try {
        $cleanSummary = Invoke-SafeClean -Projects $discoveredProjects -DryRun $false -DeepClean $DeepClean -RootPath $canonicalRoot -ContinueOnError $ContinueOnError
        if ($cleanSummary.FailedCount -gt 0) { $hasErrors = $true }
    } catch {
        $hasErrors = $true
    }

    if (-not $hasErrors -or $ContinueOnError) {
        try {
            $installSummary = Invoke-ReinstallAndBuild -Projects $discoveredProjects -Build $Build -ContinueOnError $ContinueOnError -LogFile $global:LogFilePath
            if ($installSummary.FailedCount -gt 0) { $hasErrors = $true }
        } catch {
            $hasErrors = $true
        }
    }
}

$stopwatch.Stop()
$elapsedSec = [math]::Round($stopwatch.Elapsed.TotalSeconds, 2)

# 8.8 Tabular Run Summary Report
Write-Host "`n=================================================================" -ForegroundColor Cyan
Write-Host "RUN SUMMARY REPORT" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

$summaryRows = @()
foreach ($p in $discoveredProjects) {
    $typeStr = if ($p.IsWorkspaceRoot) { "Workspace Root ($($p.WorkspaceType))" } elseif ($p.IsWorkspaceMember) { "Workspace Member" } else { "Standalone" }
    $targetsCount = @($p.CleanTargets).Count
    $cleanStatus = if ($targetsCount -eq 0) { "No Artifacts" } elseif ($DryRun) { "Simulated ($targetsCount)" } elseif ($InstallOnly) { "Skipped" } else { "Cleaned ($targetsCount)" }
    
    $installStatus = "Not Run"
    if ($installSummary -and $installSummary.Results) {
        $pRes = $installSummary.Results | Where-Object { $_.Path -eq $p.RelativePath }
        if ($pRes) {
            $installStatus = ($pRes | ForEach-Object { "$($_.Operation): $($_.Status)" }) -join '; '
        }
    } elseif ($p.IsWorkspaceMember -and -not $CleanOnly -and -not $DryRun) {
        $installStatus = "Skipped (Workspace Managed)"
    }

    $summaryRows += [PSCustomObject]@{
        Project     = $p.RelativePath
        Ecosystem   = $p.Ecosystem
        Structure   = $typeStr
        CleanStatus = $cleanStatus
        Install     = $installStatus
    }
}

if ($summaryRows.Count -gt 0) {
    $summaryRows | Format-Table -AutoSize | Out-String | Write-Host
} else {
    Write-Host "No projects discovered." -ForegroundColor Yellow
}

Write-Host "-----------------------------------------------------------------" -ForegroundColor Gray
Write-Host "Total Discovered Projects: $($discoveredProjects.Count)" -ForegroundColor White
if ($cleanSummary) {
    Write-Host "Artifacts Cleaned:         $($cleanSummary.CleanedCount)" -ForegroundColor $(if ($cleanSummary.CleanedCount -gt 0) { 'Green' } else { 'White' })
    if ($cleanSummary.FailedCount -gt 0) {
        Write-Host "Clean Failures:            $($cleanSummary.FailedCount)" -ForegroundColor Red
    }
}
if ($installSummary) {
    Write-Host "Projects Reinstalled:      $($installSummary.InstalledCount)" -ForegroundColor $(if ($installSummary.InstalledCount -gt 0) { 'Green' } else { 'White' })
    Write-Host "Projects Skipped:          $($installSummary.SkippedCount)" -ForegroundColor Yellow
    if ($installSummary.FailedCount -gt 0) {
        Write-Host "Reinstall Failures:        $($installSummary.FailedCount)" -ForegroundColor Red
    }
}
Write-Host "Elapsed Time:              $elapsedSec seconds" -ForegroundColor White
Write-Host "Log File:                  $global:LogFilePath" -ForegroundColor Gray
Write-Host "=================================================================`n" -ForegroundColor Cyan

if ($hasErrors) {
    Write-LogMessage "Clean & Reinstall completed with ERRORS." -Level ERROR
    exit 1
} else {
    Write-LogMessage "Clean & Reinstall completed SUCCESSFULLY." -Level SUCCESS
    exit 0
}
}

