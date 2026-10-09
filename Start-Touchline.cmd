@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
 echo Bitte zuerst Node.js 22 oder neuer installieren: https://nodejs.org/
 pause
 exit /b 1
)
echo Touchline wird gestartet. Danach im Browser http://localhost:8765 oeffnen.
if exist .env (
 node --env-file=.env server.mjs
) else (
 node server.mjs
)
pause
