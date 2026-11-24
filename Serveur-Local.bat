@echo off
title Cadence - Serveur Local
cd /d "%~dp0"
echo =======================================================
echo   Cadence - Suivi d'Habitudes Style GitHub
echo   Serveur local demarre sur http://localhost:5050
echo   Pour fermer : fermez cette fenetre
echo =======================================================
start http://localhost:5050
python -m http.server 5050
