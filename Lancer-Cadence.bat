@echo off
title Cadence — Clear Glass Edition
setlocal enabledelayedexpansion

cd /d "%~dp0"

:: 1. Démarrer le serveur de persistance data.json en arrière-plan s'il n'est pas déjà actif
powershell -NoProfile -Command "try { $client = New-Object System.Net.Sockets.TcpClient('127.0.0.1', 5050); $client.Close() } catch { Start-Process python -ArgumentList 'server.py' -WindowStyle Hidden }"

:: 2. Brève pause pour laisser le socket s'ouvrir
timeout /t 1 /nobreak >nul

:: 3. Lancer Edge en mode application fenêtrée dédiée (Clear Glass)
set "EDGE_X86=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
set "EDGE_X64=C:\Program Files\Microsoft\Edge\Application\msedge.exe"
set "APP_URL=http://localhost:5050"

if exist "%EDGE_X86%" (
    start "" "%EDGE_X86%" --app="%APP_URL%" --window-size=1180,780
    exit
)

if exist "%EDGE_X64%" (
    start "" "%EDGE_X64%" --app="%APP_URL%" --window-size=1180,780
    exit
)

:: Fallback au navigateur par défaut
start "" "%APP_URL%"
exit
