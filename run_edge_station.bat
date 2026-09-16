@echo off
title AeroGuard Multi-UAV Fleet Twin (Edge Station)
echo Starting AeroGuard Multi-UAV Fleet Twin on http://127.0.0.1:8080 ...
start http://127.0.0.1:8080
python edge_station.py
pause
