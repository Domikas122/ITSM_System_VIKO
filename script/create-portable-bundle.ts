import { execSync } from "child_process";
import { copyFileSync, mkdirSync, writeFileSync, cpSync } from "fs";
import { join } from "path";

const bundleDir = "IncidentPilot-Portable";
const rootDir = process.cwd();

console.log("🚀 Creating portable bundle...\n");

// Step 1: Build the application
console.log("📦 Building application...");
execSync("npm run build", { stdio: "inherit" });

// Step 2: Create bundle directory
console.log("\n📁 Creating bundle directory...");
try {
  mkdirSync(bundleDir, { recursive: true });
} catch (e) {
  // Directory might exist, that's okay
}

// Step 3: Copy built files
console.log("📋 Copying dist folder...");
cpSync(join(rootDir, "dist"), join(bundleDir, "dist"), { recursive: true });

// Step 4: Copy node_modules (production only)
console.log("📦 Installing production dependencies...");
cpSync(join(rootDir, "package.json"), join(bundleDir, "package.json"));
cpSync(join(rootDir, "package-lock.json"), join(bundleDir, "package-lock.json"));

// Install only production dependencies
execSync("npm ci --omit=dev", {
  cwd: bundleDir,
  stdio: "inherit",
});

// Step 5: Create start scripts
console.log("✍️  Creating start scripts...");

// Windows batch file
const windowsScript = `@echo off
echo Starting IncidentPilot...
echo Server will be available at http://localhost:8080
echo Press Ctrl+C to stop the server
set NODE_ENV=production
node dist/index.cjs
pause
`;
writeFileSync(join(bundleDir, "start.bat"), windowsScript);

// macOS/Linux shell script
const unixScript = `#!/bin/bash
echo "Starting IncidentPilot..."
echo "Server will be available at http://localhost:8080"
echo "Press Ctrl+C to stop the server"
export NODE_ENV=production
node dist/index.cjs
`;
writeFileSync(join(bundleDir, "start.sh"), unixScript);

// Make shell script executable on Unix systems
try {
  execSync(`chmod +x "${join(bundleDir, "start.sh")}"`);
} catch (e) {
  // Might fail on Windows, that's okay
}

// Step 6: Create README
console.log("📝 Creating README...");
const readme = `# IncidentPilot - Portable Edition

## Quick Start

### Windows:
1. Double-click \`start.bat\`
2. Wait for "Server running on port 8080" message
3. Open your browser to http://localhost:8080

### macOS/Linux:
1. Open Terminal in this folder
2. Run: \`./start.sh\`
3. Wait for "Server running on port 8080" message
4. Open your browser to http://localhost:8080

## Requirements
- No installation needed! Everything is included.
- Internet connection required for database access

## Configuration

### Environment Variables (Optional)
Create a \`.env\` file in this folder with:
\`\`\`
DATABASE_URL=your_database_url
OPENAI_API_KEY=your_openai_key
PORT=8080
\`\`\`

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
Version: ${new Date().toISOString().split('T')[0]}
`;
writeFileSync(join(bundleDir, "README.md"), readme);

// Step 7: Copy environment template
console.log("🔧 Creating .env template...");
const envTemplate = `# IncidentPilot Configuration
# Copy this file to .env and fill in your values

# Database Configuration
DATABASE_URL=postgresql://user:password@host/database

# OpenAI API Key (for AI analysis features)
OPENAI_API_KEY=sk-your-key-here

# Server Port (default: 8080)
PORT=8080

# Node Environment (keep as production)
NODE_ENV=production
`;
writeFileSync(join(bundleDir, ".env.example"), envTemplate);

console.log("\n✅ Portable bundle created successfully!");
console.log(`\n📦 Bundle location: ${bundleDir}`);
console.log("\n🎉 You can now:");
console.log("   1. Copy the entire folder to any computer");
console.log("   2. Run start.bat (Windows) or start.sh (macOS/Linux)");
console.log("   3. Access the app at http://localhost:8080\n");
