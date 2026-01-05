@echo off
echo Starting IncidentPilot...
echo Server will be available at http://localhost:8080
echo Press Ctrl+C to stop the server
set NODE_ENV=production
node dist/index.cjs
pause
