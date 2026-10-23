@echo off
setlocal
:: ============================================================================
:: Universal Clean & Reinstall Windows Entry Point
:: Forwards all CLI arguments cleanly to clean-reinstall.ps1
:: ============================================================================

set "SCRIPT_DIR=%~dp0"
set "PS_SCRIPT=%SCRIPT_DIR%clean-reinstall.ps1"

if not exist "%PS_SCRIPT%" (
    echo [ERROR] Cannot find PowerShell engine script: "%PS_SCRIPT%" 1>&2
    exit /b 1
)

:: Detect preferred PowerShell executable (prefer pwsh.exe if present, fallback to powershell.exe)
set "PS_EXE=powershell.exe"
where.exe pwsh.exe >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    set "PS_EXE=pwsh.exe"
)

:: Execute with ExecutionPolicy Bypass and NoProfile, forwarding all arguments
"%PS_EXE%" -NoProfile -ExecutionPolicy Bypass -File "%PS_SCRIPT%" %*
set "EXIT_CODE=%ERRORLEVEL%"

endlocal & exit /b %EXIT_CODE%
