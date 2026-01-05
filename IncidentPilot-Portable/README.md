# IncidentPilot - Portable Edition

## Quick Start

### Windows:
1. Double-click `start.bat`
2. Wait for "Server running on port 8080" message
3. Open your browser to http://localhost:8080

### macOS/Linux:
1. Open Terminal in this folder
2. Run: `./start.sh`
3. Wait for "Server running on port 8080" message
4. Open your browser to http://localhost:8080

## Requirements
- No installation needed! Everything is included.
- Internet connection required for database access

## Configuration

### Environment Variables (Optional)
Create a `.env` file in this folder with:
```
DATABASE_URL=your_database_url
OPENAI_API_KEY=your_openai_key
PORT=8080
```

## Troubleshooting

### Port Already in Use
If port 8080 is busy:
1. Find and stop the process using port 8080
2. Or edit start script to use different port

### Database Connection Issues
- Ensure your DATABASE_URL is correct
- Check internet connection
- Verify database is accessible

## Support
For issues, check the logs in the terminal window.

---
Version: 2026-01-05
