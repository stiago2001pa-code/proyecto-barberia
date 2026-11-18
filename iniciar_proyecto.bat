@echo off
title Sistema Barberia - Inicio Rapido
setlocal
cd /d "%~dp0"

echo ========================================================
echo        INICIANDO SISTEMA DE GESTION DE BARBERIA
echo ========================================================
echo.

echo [1/2] Iniciando Servidor Backend API (Puerto 5000)...
start "1. Backend Barberia (Puerto 5000)" cmd /k "cd /d ""%~dp0backend"" && npm run dev"

echo Esperando 3 segundos...
ping 127.0.0.1 -n 4 >nul

echo [2/2] Iniciando Pagina Web Frontend (Puerto 3000)...
start "2. Frontend Web (Puerto 3000)" cmd /k "cd /d ""%~dp0frontend"" && npx pnpm dev"

echo Esperando a que compile...
ping 127.0.0.1 -n 5 >nul

echo.
echo ========================================================
echo   Abriendo la aplicacion en tu navegador...
echo   - Pagina Web:   http://localhost:3000
echo   - Backend API:  http://localhost:5000
echo ========================================================
start http://localhost:3000
exit
