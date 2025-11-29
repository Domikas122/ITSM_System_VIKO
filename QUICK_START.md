# Quick Start Guide — IncidentPilot

## Prerequisites
- Node.js (v20+) and npm installed
- macOS
- Microsoft Edge browser

## Setup

### 1. Install Dependencies
```bash
cd /Users/domikas122/Downloads/IncidentPilot
npm install
```

### 2. Run with VS Code (Recommended)
- Open the project in VS Code
- Go to **Run and Debug** (left sidebar)
- Select **"Run Server + Launch Edge"**
- Click the green **Play** button
- This will:
  - Build the client
  - Start the dev server on `http://localhost:8080`
  - Open Microsoft Edge automatically

### 3. Manual Run (Terminal)
```bash
npm run dev
```
Then open `http://localhost:8080` in your browser.

## Available npm Scripts
- `npm run dev` — Start development server
- `npm run build:client` — Build client (Vite)
- `npm run build` — Full build
- `npm run start` — Start production server
- `npm check` — Type check

## Debug Configurations
- **"Run Server + Launch Edge"** — Server + client build + Edge launch (recommended)
- **"Launch Edge (macOS)"** — Open Edge pointed at `localhost:8080`
- **"Launch Edge (Vite 5173)"** — Alt: If running Vite separately on port 5173
- **"Run Server (npm dev)"** — Start server only
- **"Build Client (npm build)"** — Build client only

## Troubleshooting

### Port Already in Use
If port 8080 is in use:
```bash
# Find process using port 8080
lsof -i :8080
# Kill it
kill -9 <PID>
```

### Dependencies Not Installed
```bash
npm install
```

### Edge Not Opening
Ensure Edge is installed and try:
```bash
open -a "Microsoft Edge" http://localhost:8080
```

## Project Structure
- `/client` — React frontend (Vite)
- `/server` — Express backend (Node.js)
- `/shared` — Shared types/schema
- `.vscode/` — VS Code config (launch/tasks)

## Notes
- Server listens on `localhost:8080` (not 0.0.0.0 for compatibility)
- Edge profile stored in `.vscode/edge-profile/` (ignored by git)
- Clean git history — `.vscode/edge-profile/` removed from commits
