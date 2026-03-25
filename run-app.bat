@echo off
setlocal

cd /d "%~dp0"

if not exist "server\.env" (
  echo [run-app] server\.env not found. Copying from .env.example...
  copy /Y "server\.env.example" "server\.env" >nul
)

if not exist "node_modules" (
  echo [run-app] Installing root dependencies...
  call npm.cmd install
  if errorlevel 1 goto :fail
)

if not exist "node_modules\@prisma\client" (
  echo [run-app] Installing missing Prisma client package...
  call npm.cmd install
  if errorlevel 1 goto :fail
)

if not exist "server\prisma\dev.db" (
  echo [run-app] Preparing SQLite database...
  call npm.cmd --workspace server run prisma:generate
  if errorlevel 1 goto :fail

  call npm.cmd --workspace server run db:push
  if errorlevel 1 goto :fail

  call npm.cmd --workspace server run db:seed
  if errorlevel 1 goto :fail
) else (
  echo [run-app] SQLite database already exists. Skipping DB bootstrap.
)

echo [run-app] Starting Map Scheduler MVP in a new terminal...
start "Map Scheduler MVP" cmd /k "cd /d %~dp0 && npm.cmd run dev"

echo [run-app] Waiting for the dev servers to start...
timeout /t 5 /nobreak >nul

echo [run-app] Opening http://127.0.0.1:5173
start "" "http://127.0.0.1:5173"

endlocal
exit /b 0

:fail
echo [run-app] Startup failed. Check the messages above.
endlocal
exit /b 1
