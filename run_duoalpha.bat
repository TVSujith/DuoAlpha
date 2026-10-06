@echo off
title DuoAlpha Trading Terminal
echo ====================================================
echo             DUOALPHA TRADING TERMINAL
echo        Trade Together. Grow Together.
echo ====================================================
echo.
echo Starting DuoAlpha Server on http://localhost:5000 ...
start "DuoAlpha Server" cmd /k "cd server && npm start"
timeout /t 3 /nobreak >nul
echo Starting DuoAlpha Client on http://localhost:5173 ...
start "DuoAlpha Client" cmd /k "cd client && npm run dev"
timeout /t 2 /nobreak >nul
start http://localhost:5173
echo DuoAlpha is now running!
