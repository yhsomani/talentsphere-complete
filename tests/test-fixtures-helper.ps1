# ==============================================================================
# tests/test-fixtures-helper.ps1
# Hermetic Mock Fixtures Generator and Assertion Engine
# Zero-dependency helper for clean-reinstall E2E test suite
# Fully compatible with Windows PowerShell 5.1 and PowerShell Core 7+
# ==============================================================================

Set-StrictMode -Off

$global:ActiveSandboxes = [System.Collections.Generic.List[string]]::new()

function New-TestSandbox {
    [CmdletBinding()]
    param(
        [string]$Prefix = "cr-test"
    )
    $tempBase = [System.IO.Path]::GetTempPath()
    $guid = [System.Guid]::NewGuid().ToString("N")
    $sandboxPath = [System.IO.Path]::Combine($tempBase, "$Prefix-$guid")
    
    [System.IO.Directory]::CreateDirectory($sandboxPath) | Out-Null
    $global:ActiveSandboxes.Add($sandboxPath)
    return $sandboxPath
}

function Remove-TestSandbox {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Path
    )
    if ([System.IO.Directory]::Exists($Path)) {
        try {
            # Reset read-only attributes on files and folders
            Get-ChildItem -Path $Path -Recurse -Force -ErrorAction SilentlyContinue | ForEach-Object {
                try {
                    $_.Attributes = [System.IO.FileAttributes]::Normal
                } catch {}
            }
            [System.IO.Directory]::Delete($Path, $true)
        } catch {
            Start-Sleep -Milliseconds 150
            try {
                [System.IO.Directory]::Delete($Path, $true)
            } catch {
                # Fallback to cmd.exe rmdir
                & cmd.exe /c "rmdir /s /q `"$Path`"" 2>&1 | Out-Null
            }
        }
    }
    if ($global:ActiveSandboxes.Contains($Path)) {
        $global:ActiveSandboxes.Remove($Path) | Out-Null
    }
}

function Cleanup-AllSandboxes {
    [CmdletBinding()]
    param()
    foreach ($sandbox in @($global:ActiveSandboxes)) {
        Remove-TestSandbox -Path $sandbox
    }
}

function New-NodeProjectFixture {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)][string]$ParentDir,
        [Parameter(Mandatory=$true)][string]$Name,
        [ValidateSet('npm', 'pnpm', 'yarn-classic', 'yarn-berry', 'bun')]
        [string]$PackageManager = 'npm',
        [bool]$WithLockfile = $true,
        [string[]]$Artifacts = @('node_modules', 'dist'),
        [hashtable]$Scripts = @{ build = "echo build" },
        [switch]$WithEnv
    )
    $projectDir = [System.IO.Path]::Combine($ParentDir, $Name)
    [System.IO.Directory]::CreateDirectory($projectDir) | Out-Null

    # package.json
    $scriptsObj = @{}
    foreach ($k in $Scripts.Keys) { $scriptsObj[$k] = $Scripts[$k] }
    
    $pkgJson = @{
        name = $Name
        version = "1.0.0"
        scripts = $scriptsObj
    }
    if ($PackageManager -eq 'pnpm') {
        $pkgJson['packageManager'] = 'pnpm@9.0.0'
    } elseif ($PackageManager -eq 'yarn-berry') {
        $pkgJson['packageManager'] = 'yarn@4.1.0'
    }
    $pkgJsonText = ConvertTo-Json -InputObject $pkgJson -Depth 5
    [System.IO.File]::WriteAllText([System.IO.Path]::Combine($projectDir, "package.json"), $pkgJsonText, [System.Text.Encoding]::UTF8)

    # Lockfile
    if ($WithLockfile) {
        switch ($PackageManager) {
            'npm' {
                [System.IO.File]::WriteAllText([System.IO.Path]::Combine($projectDir, "package-lock.json"), '{"name":"' + $Name + '","lockfileVersion":3}', [System.Text.Encoding]::UTF8)
            }
            'pnpm' {
                [System.IO.File]::WriteAllText([System.IO.Path]::Combine($projectDir, "pnpm-lock.yaml"), "lockfileVersion: '9.0'`nimporters:`n  .:`n", [System.Text.Encoding]::UTF8)
            }
            'yarn-classic' {
                [System.IO.File]::WriteAllText([System.IO.Path]::Combine($projectDir, "yarn.lock"), "# yarn lockfile v1`n", [System.Text.Encoding]::UTF8)
            }
            'yarn-berry' {
                [System.IO.File]::WriteAllText([System.IO.Path]::Combine($projectDir, "yarn.lock"), "__metadata:`n  version: 6`n", [System.Text.Encoding]::UTF8)
                [System.IO.File]::WriteAllText([System.IO.Path]::Combine($projectDir, ".yarnrc.yml"), "nodeLinker: node-modules`n", [System.Text.Encoding]::UTF8)
            }
            'bun' {
                [System.IO.File]::WriteAllText([System.IO.Path]::Combine($projectDir, "bun.lockb"), "BUN_LOCK_BINARY_MOCK", [System.Text.Encoding]::UTF8)
            }
        }
    }

    # Artifacts
    foreach ($art in $Artifacts) {
        $artPath = [System.IO.Path]::Combine($projectDir, $art)
        [System.IO.Directory]::CreateDirectory($artPath) | Out-Null
        [System.IO.File]::WriteAllText([System.IO.Path]::Combine($artPath, "dummy-output.txt"), "dummy artifact content", [System.Text.Encoding]::UTF8)
    }

    # Source files
    $srcDir = [System.IO.Path]::Combine($projectDir, "src")
    [System.IO.Directory]::CreateDirectory($srcDir) | Out-Null
    [System.IO.File]::WriteAllText([System.IO.Path]::Combine($srcDir, "index.js"), "console.log('Hello from $Name');", [System.Text.Encoding]::UTF8)

    # Environment files if requested
    if ($WithEnv) {
        [System.IO.File]::WriteAllText([System.IO.Path]::Combine($projectDir, ".env"), "API_KEY=secret_env_value`nDATABASE_URL=postgres://localhost", [System.Text.Encoding]::UTF8)
        [System.IO.File]::WriteAllText([System.IO.Path]::Combine($projectDir, ".env.local"), "SECRET_LOCAL=very_secret", [System.Text.Encoding]::UTF8)
    }

    return $projectDir
}

function New-MonorepoFixture {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)][string]$ParentDir,
        [Parameter(Mandatory=$true)][string]$Name,
        [ValidateSet('pnpm', 'npm', 'yarn')]
        [string]$Type = 'pnpm',
        [string[]]$Packages = @('apps/web', 'apps/api', 'packages/shared'),
        [string[]]$RootArtifacts = @('node_modules', '.turbo'),
        [string[]]$PackageArtifacts = @('node_modules', 'dist')
    )
    $repoRoot = [System.IO.Path]::Combine($ParentDir, $Name)
    [System.IO.Directory]::CreateDirectory($repoRoot) | Out-Null

    # Root package.json
    $rootPkg = @{
        name = "$Name-monorepo"
        private = $true
    }
    if ($Type -eq 'pnpm') {
        $rootPkg['packageManager'] = 'pnpm@9.0.0'
        $workspaceYaml = "packages:`n"
        foreach ($pkg in $Packages) {
            $workspaceYaml += "  - '$pkg'`n"
        }
        [System.IO.File]::WriteAllText([System.IO.Path]::Combine($repoRoot, "pnpm-workspace.yaml"), $workspaceYaml, [System.Text.Encoding]::UTF8)
        [System.IO.File]::WriteAllText([System.IO.Path]::Combine($repoRoot, "pnpm-lock.yaml"), "lockfileVersion: '9.0'`nimporters:`n", [System.Text.Encoding]::UTF8)
    } elseif ($Type -eq 'npm') {
        $rootPkg['workspaces'] = @($Packages)
        [System.IO.File]::WriteAllText([System.IO.Path]::Combine($repoRoot, "package-lock.json"), '{"name":"' + $Name + '","lockfileVersion":3}', [System.Text.Encoding]::UTF8)
    } elseif ($Type -eq 'yarn') {
        $rootPkg['workspaces'] = @($Packages)
        [System.IO.File]::WriteAllText([System.IO.Path]::Combine($repoRoot, "yarn.lock"), "# yarn lockfile v1`n", [System.Text.Encoding]::UTF8)
    }

    $rootPkgText = ConvertTo-Json -InputObject $rootPkg -Depth 5
    [System.IO.File]::WriteAllText([System.IO.Path]::Combine($repoRoot, "package.json"), $rootPkgText, [System.Text.Encoding]::UTF8)

    # Root Artifacts
    foreach ($art in $RootArtifacts) {
        $artPath = [System.IO.Path]::Combine($repoRoot, $art)
        [System.IO.Directory]::CreateDirectory($artPath) | Out-Null
        [System.IO.File]::WriteAllText([System.IO.Path]::Combine($artPath, "root-art.txt"), "root artifact", [System.Text.Encoding]::UTF8)
    }

    # Root Source / Git / Env
    [System.IO.File]::WriteAllText([System.IO.Path]::Combine($repoRoot, ".env"), "ROOT_SECRET=root_secret_val", [System.Text.Encoding]::UTF8)
    $gitDir = [System.IO.Path]::Combine($repoRoot, ".git")
    [System.IO.Directory]::CreateDirectory($gitDir) | Out-Null
    [System.IO.File]::WriteAllText([System.IO.Path]::Combine($gitDir, "HEAD"), "ref: refs/heads/main", [System.Text.Encoding]::UTF8)

    # Subpackages
    foreach ($pkgRel in $Packages) {
        $pkgDir = [System.IO.Path]::Combine($repoRoot, $pkgRel)
        [System.IO.Directory]::CreateDirectory($pkgDir) | Out-Null

        $pkgLeaf = [System.IO.Path]::GetFileName($pkgRel)
        $subPkg = @{
            name = "@$Name/$pkgLeaf"
            version = "1.0.0"
            scripts = @{ build = "echo building $pkgLeaf" }
        }
        $subPkgText = ConvertTo-Json -InputObject $subPkg -Depth 5
        [System.IO.File]::WriteAllText([System.IO.Path]::Combine($pkgDir, "package.json"), $subPkgText, [System.Text.Encoding]::UTF8)

        $srcDir = [System.IO.Path]::Combine($pkgDir, "src")
        [System.IO.Directory]::CreateDirectory($srcDir) | Out-Null
        [System.IO.File]::WriteAllText([System.IO.Path]::Combine($srcDir, "index.ts"), "export const name = '$pkgLeaf';", [System.Text.Encoding]::UTF8)

        # Package Artifacts
        foreach ($art in $PackageArtifacts) {
            $artPath = [System.IO.Path]::Combine($pkgDir, $art)
            [System.IO.Directory]::CreateDirectory($artPath) | Out-Null
            [System.IO.File]::WriteAllText([System.IO.Path]::Combine($artPath, "$pkgLeaf-art.txt"), "$pkgLeaf artifact", [System.Text.Encoding]::UTF8)
        }
    }

    return $repoRoot
}

function New-PythonProjectFixture {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)][string]$ParentDir,
        [Parameter(Mandatory=$true)][string]$Name,
        [ValidateSet('poetry', 'uv', 'pipenv', 'pip')]
        [string]$Tool = 'poetry',
        [bool]$WithLockfile = $true,
        [string[]]$Artifacts = @('.venv', '__pycache__', 'dist'),
        [switch]$WithDeepCleanArtifacts
    )
    $projectDir = [System.IO.Path]::Combine($ParentDir, $Name)
    [System.IO.Directory]::CreateDirectory($projectDir) | Out-Null

    switch ($Tool) {
        'poetry' {
            [System.IO.File]::WriteAllText([System.IO.Path]::Combine($projectDir, "pyproject.toml"), "[tool.poetry]`nname = `"$Name`"`nversion = `"0.1.0`"`n", [System.Text.Encoding]::UTF8)
            if ($WithLockfile) {
                [System.IO.File]::WriteAllText([System.IO.Path]::Combine($projectDir, "poetry.lock"), "# Poetry lockfile`n", [System.Text.Encoding]::UTF8)
            }
        }
        'uv' {
            [System.IO.File]::WriteAllText([System.IO.Path]::Combine($projectDir, "pyproject.toml"), "[project]`nname = `"$Name`"`nversion = `"0.1.0`"`n[tool.uv]`n", [System.Text.Encoding]::UTF8)
            if ($WithLockfile) {
                [System.IO.File]::WriteAllText([System.IO.Path]::Combine($projectDir, "uv.lock"), "version = 1`n", [System.Text.Encoding]::UTF8)
            }
        }
        'pipenv' {
            [System.IO.File]::WriteAllText([System.IO.Path]::Combine($projectDir, "Pipfile"), "[[source]]`nurl = `"https://pypi.org/simple`"`n", [System.Text.Encoding]::UTF8)
            if ($WithLockfile) {
                [System.IO.File]::WriteAllText([System.IO.Path]::Combine($projectDir, "Pipfile.lock"), '{"_meta":{}}', [System.Text.Encoding]::UTF8)
            }
        }
        'pip' {
            [System.IO.File]::WriteAllText([System.IO.Path]::Combine($projectDir, "requirements.txt"), "pytest>=7.0.0`nrequests>=2.28.0`n", [System.Text.Encoding]::UTF8)
        }
    }

    # Artifacts
    foreach ($art in $Artifacts) {
        $artPath = [System.IO.Path]::Combine($projectDir, $art)
        [System.IO.Directory]::CreateDirectory($artPath) | Out-Null
        if ($art -eq '.venv') {
            # Put pyvenv.cfg so it resembles real virtualenv
            [System.IO.File]::WriteAllText([System.IO.Path]::Combine($artPath, "pyvenv.cfg"), "home = C:\\Python\\`nversion = 3.11.0", [System.Text.Encoding]::UTF8)
        }
        [System.IO.File]::WriteAllText([System.IO.Path]::Combine($artPath, "dummy.pyc"), "compiled bytecode", [System.Text.Encoding]::UTF8)
    }

    if ($WithDeepCleanArtifacts) {
        $pytestCache = [System.IO.Path]::Combine($projectDir, ".pytest_cache")
        [System.IO.Directory]::CreateDirectory($pytestCache) | Out-Null
        [System.IO.File]::WriteAllText([System.IO.Path]::Combine($pytestCache, "cache.json"), "{}", [System.Text.Encoding]::UTF8)
    }

    # Source & Env
    $srcDir = [System.IO.Path]::Combine($projectDir, "src")
    [System.IO.Directory]::CreateDirectory($srcDir) | Out-Null
    [System.IO.File]::WriteAllText([System.IO.Path]::Combine($srcDir, "main.py"), "print('hello python')", [System.Text.Encoding]::UTF8)
    [System.IO.File]::WriteAllText([System.IO.Path]::Combine($projectDir, ".env"), "PY_ENV=development", [System.Text.Encoding]::UTF8)

    return $projectDir
}

function New-RustProjectFixture {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)][string]$ParentDir,
        [Parameter(Mandatory=$true)][string]$Name,
        [bool]$WithLockfile = $true,
        [string[]]$Artifacts = @('target')
    )
    $projectDir = [System.IO.Path]::Combine($ParentDir, $Name)
    [System.IO.Directory]::CreateDirectory($projectDir) | Out-Null

    [System.IO.File]::WriteAllText([System.IO.Path]::Combine($projectDir, "Cargo.toml"), "[package]`nname = `"$Name`"`nversion = `"0.1.0`"`nedition = `"2021`"`n", [System.Text.Encoding]::UTF8)
    if ($WithLockfile) {
        [System.IO.File]::WriteAllText([System.IO.Path]::Combine($projectDir, "Cargo.lock"), "# Cargo lockfile`nversion = 3`n", [System.Text.Encoding]::UTF8)
    }

    foreach ($art in $Artifacts) {
        $debugDir = [System.IO.Path]::Combine($projectDir, "$art\debug")
        [System.IO.Directory]::CreateDirectory($debugDir) | Out-Null
        [System.IO.File]::WriteAllText([System.IO.Path]::Combine($debugDir, "$Name.exe"), "binary data", [System.Text.Encoding]::UTF8)
    }

    $srcDir = [System.IO.Path]::Combine($projectDir, "src")
    [System.IO.Directory]::CreateDirectory($srcDir) | Out-Null
    [System.IO.File]::WriteAllText([System.IO.Path]::Combine($srcDir, "main.rs"), "fn main() { println!(`"Hello Rust`"); }", [System.Text.Encoding]::UTF8)

    return $projectDir
}

function New-JavaProjectFixture {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)][string]$ParentDir,
        [Parameter(Mandatory=$true)][string]$Name,
        [ValidateSet('maven', 'gradle')]
        [string]$Type = 'maven',
        [bool]$WithWrapper = $true
    )
    $projectDir = [System.IO.Path]::Combine($ParentDir, $Name)
    [System.IO.Directory]::CreateDirectory($projectDir) | Out-Null

    if ($Type -eq 'maven') {
        [System.IO.File]::WriteAllText([System.IO.Path]::Combine($projectDir, "pom.xml"), "<project><modelVersion>4.0.0</modelVersion><groupId>com.test</groupId><artifactId>$Name</artifactId><version>1.0</version></project>", [System.Text.Encoding]::UTF8)
        if ($WithWrapper) {
            $mvnwBat = "@echo off`r`necho [MOCK MVNW] args: %*`r`necho MVNW_CALLED > `"%~dp0mvnw_executed.txt`"`r`nexit /b 0"
            [System.IO.File]::WriteAllText([System.IO.Path]::Combine($projectDir, "mvnw.cmd"), $mvnwBat, [System.Text.Encoding]::UTF8)
        }
        $targetDir = [System.IO.Path]::Combine($projectDir, "target")
        [System.IO.Directory]::CreateDirectory($targetDir) | Out-Null
        [System.IO.File]::WriteAllText([System.IO.Path]::Combine($targetDir, "$Name.jar"), "jar content", [System.Text.Encoding]::UTF8)
    } else {
        [System.IO.File]::WriteAllText([System.IO.Path]::Combine($projectDir, "build.gradle"), "plugins { id 'java' }", [System.Text.Encoding]::UTF8)
        if ($WithWrapper) {
            $gradlewBat = "@echo off`r`necho [MOCK GRADLEW] args: %*`r`necho GRADLEW_CALLED > `"%~dp0gradlew_executed.txt`"`r`nexit /b 0"
            [System.IO.File]::WriteAllText([System.IO.Path]::Combine($projectDir, "gradlew.bat"), $gradlewBat, [System.Text.Encoding]::UTF8)
        }
        $buildDir = [System.IO.Path]::Combine($projectDir, "build")
        [System.IO.Directory]::CreateDirectory($buildDir) | Out-Null
        [System.IO.File]::WriteAllText([System.IO.Path]::Combine($buildDir, "$Name.jar"), "jar content", [System.Text.Encoding]::UTF8)
    }

    $srcDir = [System.IO.Path]::Combine($projectDir, "src\main\java")
    [System.IO.Directory]::CreateDirectory($srcDir) | Out-Null
    [System.IO.File]::WriteAllText([System.IO.Path]::Combine($srcDir, "App.java"), "public class App { public static void main(String[] args) {} }", [System.Text.Encoding]::UTF8)

    return $projectDir
}

function New-DotNetProjectFixture {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)][string]$ParentDir,
        [Parameter(Mandatory=$true)][string]$Name,
        [bool]$WithSolution = $true
    )
    $projectDir = [System.IO.Path]::Combine($ParentDir, $Name)
    [System.IO.Directory]::CreateDirectory($projectDir) | Out-Null

    if ($WithSolution) {
        [System.IO.File]::WriteAllText([System.IO.Path]::Combine($projectDir, "$Name.sln"), "Microsoft Visual Studio Solution File, Format Version 12.00", [System.Text.Encoding]::UTF8)
    }
    [System.IO.File]::WriteAllText([System.IO.Path]::Combine($projectDir, "$Name.csproj"), "<Project Sdk=`"Microsoft.NET.Sdk`"><PropertyGroup><TargetFramework>net8.0</TargetFramework></PropertyGroup></Project>", [System.Text.Encoding]::UTF8)

    $binDir = [System.IO.Path]::Combine($projectDir, "bin\Debug\net8.0")
    $objDir = [System.IO.Path]::Combine($projectDir, "obj\Debug\net8.0")
    [System.IO.Directory]::CreateDirectory($binDir) | Out-Null
    [System.IO.Directory]::CreateDirectory($objDir) | Out-Null
    [System.IO.File]::WriteAllText([System.IO.Path]::Combine($binDir, "$Name.dll"), "dll mock", [System.Text.Encoding]::UTF8)
    [System.IO.File]::WriteAllText([System.IO.Path]::Combine($objDir, "$Name.pdb"), "pdb mock", [System.Text.Encoding]::UTF8)

    [System.IO.File]::WriteAllText([System.IO.Path]::Combine($projectDir, "Program.cs"), "System.Console.WriteLine(`"Hello .NET`");", [System.Text.Encoding]::UTF8)

    return $projectDir
}

function New-JunctionFixture {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)][string]$LinkPath,
        [Parameter(Mandatory=$true)][string]$TargetPath
    )
    try {
        New-Item -ItemType Junction -Path $LinkPath -Target $TargetPath -Force -ErrorAction Stop | Out-Null
        return $true
    } catch {
        # Fallback to cmd.exe mklink /J
        & cmd.exe /c "mklink /J `"$LinkPath`" `"$TargetPath`"" 2>&1 | Out-Null
        return (Test-Path $LinkPath)
    }
}

function New-MockTool {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)][string]$Directory,
        [Parameter(Mandatory=$true)][string]$ToolName,
        [int]$ExitCode = 0,
        [string]$LogFile = $null
    )
    [System.IO.Directory]::CreateDirectory($Directory) | Out-Null
    $batPath = [System.IO.Path]::Combine($Directory, "$ToolName.cmd")
    
    $logSnippet = if ($LogFile) {
        "echo [%DATE% %TIME%] $ToolName called with: %* >> `"$LogFile`"`r`n"
    } else {
        ""
    }
    $batContent = "@echo off`r`n$logSnippet" + "echo [MOCK $ToolName] %*`r`nexit /b $ExitCode`r`n"
    [System.IO.File]::WriteAllText($batPath, $batContent, [System.Text.Encoding]::ASCII)
    return $batPath
}

# ==============================================================================
# Assertion Engine
# ==============================================================================

function Assert-True {
    param([bool]$Condition, [string]$Message = "Expected condition to be True")
    if (-not $Condition) {
        throw "ASSERTION FAILED: $Message"
    }
}

function Assert-False {
    param([bool]$Condition, [string]$Message = "Expected condition to be False")
    if ($Condition) {
        throw "ASSERTION FAILED: $Message"
    }
}

function Assert-PathExists {
    param([string]$Path, [string]$Message = "")
    $msg = if ($Message) { $Message } else { "Expected path to exist: '$Path'" }
    if (-not (Test-Path $Path)) {
        throw "ASSERTION FAILED: $msg"
    }
}

function Assert-PathNotExists {
    param([string]$Path, [string]$Message = "")
    $msg = if ($Message) { $Message } else { "Expected path to NOT exist: '$Path'" }
    if (Test-Path $Path) {
        throw "ASSERTION FAILED: $msg"
    }
}

function Assert-FileContains {
    param([string]$Path, [string]$Pattern, [string]$Message = "")
    Assert-PathExists $Path "Cannot check content; file does not exist: '$Path'"
    $content = [System.IO.File]::ReadAllText($Path)
    $msg = if ($Message) { $Message } else { "Expected file '$Path' to contain pattern '$Pattern'" }
    if ($content -notmatch $Pattern) {
        throw "ASSERTION FAILED: $msg"
    }
}

function Assert-FileNotContains {
    param([string]$Path, [string]$Pattern, [string]$Message = "")
    if (-not (Test-Path $Path)) { return }
    $content = [System.IO.File]::ReadAllText($Path)
    $msg = if ($Message) { $Message } else { "Expected file '$Path' to NOT contain pattern '$Pattern'" }
    if ($content -match $Pattern) {
        throw "ASSERTION FAILED: $msg"
    }
}

function Assert-ExitCode {
    param([int]$Expected, [int]$Actual, [string]$Message = "")
    $msg = if ($Message) { $Message } else { "Expected exit code $Expected but got $Actual" }
    if ($Expected -ne $Actual) {
        throw "ASSERTION FAILED: $msg"
    }
}

function Invoke-CleanReinstall {
    [CmdletBinding()]
    param(
        [string[]]$ScriptArgs = @(),
        [bool]$UseBatch = $false,
        [string]$WorkingDir = $null
    )
    $repoRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
    $ps1 = [System.IO.Path]::Combine($repoRoot, "clean-reinstall.ps1")
    $bat = [System.IO.Path]::Combine($repoRoot, "clean-reinstall.bat")

    $oldPwd = (Get-Location).Path
    if ($WorkingDir -and (Test-Path $WorkingDir)) {
        Set-Location $WorkingDir
    }

    $stdoutLines = [System.Collections.Generic.List[string]]::new()
    $stderrLines = [System.Collections.Generic.List[string]]::new()
    $exitCode = 0

    try {
        if ($UseBatch) {
            if (-not (Test-Path $bat)) {
                return @{
                    ExitCode = -999
                    Stdout = ""
                    Stderr = "Batch file not found: $bat"
                    AllOutput = "Batch file not found: $bat"
                }
            }
            $argStr = ($ScriptArgs | ForEach-Object {
                if ($_ -match '\s') { "`"$_`"" } else { $_ }
            }) -join " "

            $pinfo = [System.Diagnostics.ProcessStartInfo]::new()
            $pinfo.FileName = "cmd.exe"
            $pinfo.Arguments = "/c `"`"$bat`" $argStr`""
            $pinfo.RedirectStandardOutput = $true
            $pinfo.RedirectStandardError = $true
            $pinfo.UseShellExecute = $false
            $pinfo.CreateNoWindow = $true

            $proc = [System.Diagnostics.Process]::Start($pinfo)
            $stdoutTask = $proc.StandardOutput.ReadToEndAsync()
            $stderrTask = $proc.StandardError.ReadToEndAsync()
            $proc.WaitForExit()
            $exitCode = $proc.ExitCode
            $stdout = $stdoutTask.Result
            $stderr = $stderrTask.Result
        } else {
            if (-not (Test-Path $ps1)) {
                return @{
                    ExitCode = -999
                    Stdout = ""
                    Stderr = "PowerShell script not found: $ps1"
                    AllOutput = "PowerShell script not found: $ps1"
                }
            }
            $argList = @("-NoProfile", "-ExecutionPolicy", "Bypass", "-File", $ps1) + $ScriptArgs
            $pinfo = [System.Diagnostics.ProcessStartInfo]::new()
            $pinfo.FileName = "powershell.exe"
            # Format arguments safely
            $formattedArgs = ($argList | ForEach-Object {
                if ($_ -match '\s') { "`"$_`"" } else { $_ }
            }) -join " "
            $pinfo.Arguments = $formattedArgs
            $pinfo.RedirectStandardOutput = $true
            $pinfo.RedirectStandardError = $true
            $pinfo.UseShellExecute = $false
            $pinfo.CreateNoWindow = $true

            $proc = [System.Diagnostics.Process]::Start($pinfo)
            $stdoutTask = $proc.StandardOutput.ReadToEndAsync()
            $stderrTask = $proc.StandardError.ReadToEndAsync()
            $proc.WaitForExit()
            $exitCode = $proc.ExitCode
            $stdout = $stdoutTask.Result
            $stderr = $stderrTask.Result
        }
    } finally {
        Set-Location $oldPwd
    }

    $allOut = "$stdout`n$stderr".Trim()
    return @{
        ExitCode = $exitCode
        Stdout = $stdout
        Stderr = $stderr
        AllOutput = $allOut
    }
}
