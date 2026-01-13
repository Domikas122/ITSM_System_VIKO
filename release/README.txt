IncidentPilot - Incident Management System
===========================================

LIVE SYSTEM ACCESS
------------------
System URL: https://incident-pilot.fly.dev

Test Accounts:
  Admin:     domikas122 / mkl123MKL
  Test User: var.pav / abc123ABC

TESTING GUIDE
-------------
1. Login with either account above
2. Admin account has full access to:
   - Create/edit/delete incidents
   - User management
   - AI analysis features
   - System configuration

3. Test user account can:
   - View incidents
   - Create new incidents
   - Add comments and updates

4. Key features to test:
   - Create incident with description
   - AI-powered incident analysis
   - Similar incident matching
   - Status updates and timeline
   - Search and filtering
   - Dark/light theme toggle

QUICK START (Local Installation)
---------------------------------

Windows:
1. Double-click IncidentPilot-win.exe
2. Wait for "Server running on port 8080" message
3. Open browser to http://localhost:8080

macOS:
1. Right-click IncidentPilot-macos and select "Open"
   (First time only - macOS security prompt)
2. Or run in Terminal: ./IncidentPilot-macos
3. Wait for "Server running on port 8080" message
4. Open browser to http://localhost:8080

IMPORTANT
---------
- Keep the "dist" folder in the same directory as the executable!
- The executable and "dist" folder must stay together

CONFIGURATION (Optional)
------------------------
Create a .env file in this folder with:

DATABASE_URL=postgresql://user:password@host/database
OPENAI_API_KEY=sk-your-key-here
PORT=8080

REQUIREMENTS
------------
- No Node.js installation needed
- Internet connection required for database access
- Port 8080 must be available

TROUBLESHOOTING
---------------

Port already in use:
- Find and stop the process using port 8080
- Or set PORT=3000 in .env file

macOS Security Warning:
- Go to System Preferences > Security & Privacy
- Click "Open Anyway" for IncidentPilot-macos

Cannot connect to database:
- Check DATABASE_URL in .env file
- Verify internet connection
- Confirm database is accessible

---
Built: 2026-01-05
Version: 1.0.0
