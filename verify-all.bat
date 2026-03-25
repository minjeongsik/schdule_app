@echo off
setlocal

cd /d "%~dp0"

echo [verify-all] Running server lint...
call npm.cmd --workspace server run lint
if errorlevel 1 goto :fail

echo [verify-all] Running server build...
call npm.cmd --workspace server run build
if errorlevel 1 goto :fail

echo [verify-all] Running client lint...
call npm.cmd --workspace client run lint
if errorlevel 1 goto :fail

echo [verify-all] Running client test...
call npm.cmd --workspace client run test
if errorlevel 1 goto :fail

echo [verify-all] Running client build...
call npm.cmd --workspace client run build
if errorlevel 1 goto :fail

echo [verify-all] All checks passed.
endlocal
exit /b 0

:fail
echo [verify-all] Verification failed. Check the messages above.
endlocal
exit /b 1
