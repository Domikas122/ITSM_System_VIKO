# ŽYBIS - Railway.app Deployment Guide

## 🚀 Deploy to Railway in 5 Minutes

### Prerequisites
- GitHub account
- Railway account (sign up at https://railway.app)

---

## Step-by-Step Deployment

### 1. Push Your Code to GitHub

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - ŽYBIS incident management system"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR-USERNAME/zybis.git
git branch -M main
git push -u origin main
```

### 2. Deploy on Railway

1. **Go to Railway**: https://railway.app
2. **Click "Start a New Project"**
3. **Select "Deploy from GitHub repo"**
4. **Authorize GitHub** and select your `zybis` repository
5. Railway will automatically detect your Node.js app and start deploying!

### 3. Configure Environment Variables

In Railway dashboard, go to your project → **Variables** tab and add:

```env
NODE_ENV=production
SESSION_SECRET=<click "Generate" button for random string>
PUBLIC_URL=${{RAILWAY_PUBLIC_DOMAIN}}
HOST=0.0.0.0
```

Railway automatically provides `RAILWAY_PUBLIC_DOMAIN` variable.

### 4. Enable Public Access

1. In Railway dashboard, go to **Settings**
2. Under **Networking**, click **Generate Domain**
3. You'll get a URL like: `https://zybis.up.railway.app`

### 5. Done! 🎉

Your site is now live at the Railway-provided URL!

---

## Optional: Custom Domain

### Add Your Own Domain

1. Buy a domain (e.g., from Namecheap, Google Domains)
2. In Railway dashboard → **Settings** → **Networking**
3. Click **Custom Domain**
4. Add your domain: `zybis.yourdomain.com`
5. Railway will show you DNS records to add:
   - **CNAME** record: `zybis` → `your-app.up.railway.app`

6. Update environment variable:
```env
PUBLIC_URL=https://zybis.yourdomain.com
```

Railway automatically handles HTTPS certificates!

---

## Database Persistence

Railway includes persistent storage by default. Your SQLite database will persist between deployments.

**Backup Strategy:**
```bash
# Download database from Railway
railway run bash
# Then: cat incident-pilot.db > /tmp/backup.db
```

Or upgrade to PostgreSQL:
1. In Railway, click **New** → **Database** → **PostgreSQL**
2. Update your code to use PostgreSQL instead of SQLite

---

## Monitoring & Logs

### View Logs
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# View logs
railway logs
```

Or view in Railway dashboard → **Deployments** → Click deployment → **View Logs**

### Check App Status

Railway dashboard shows:
- CPU usage
- Memory usage
- Network traffic
- Deployment status

---

## Updating Your App

```bash
# Make changes to your code
git add .
git commit -m "Update: description of changes"
git push

# Railway automatically redeploys!
```

---

## Cost

**Free Tier Includes:**
- $5 credit per month
- Enough for hobby projects
- Automatic HTTPS
- 8GB RAM
- 8 vCPU

**If you need more:**
- Upgrade to Hobby plan: $5/month
- Developer plan: $20/month

---

## Security Checklist

Before going live:

- [x] ✅ HTTPS enabled automatically
- [x] ✅ Environment variables set
- [ ] ⚠️ Change default user passwords in database
- [ ] ⚠️ Generate strong `SESSION_SECRET`
- [ ] ⚠️ Set up monitoring alerts
- [ ] ⚠️ Test all features on production URL

---

## Troubleshooting

### Build Fails
Check Railway logs for errors. Common issues:
- Missing dependencies in package.json
- Build script errors
- Node version mismatch

### App Won't Start
- Check `npm start` works locally
- Verify environment variables are set
- Check Railway logs for startup errors

### Database Issues
- Railway includes persistent storage
- Database file: `./incident-pilot.db`
- Download backup regularly

### Need Help?
- Railway Discord: https://discord.gg/railway
- Railway Docs: https://docs.railway.app
- Railway Status: https://status.railway.app

---

## Quick Commands Reference

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link local project to Railway
railway link

# View logs
railway logs

# Run command on Railway
railway run node --version

# Open Railway dashboard
railway open

# Deploy from CLI
railway up
```

---

## Your App URLs

After deployment, you'll have:
- **Development**: http://zybis.filharmonija.local:8080
- **Railway**: https://zybis.up.railway.app
- **Custom domain** (optional): https://zybis.yourdomain.com

All URLs will work with your authentication system!

---

## Next Steps

1. ✅ Deploy to Railway (follow steps above)
2. 📧 Share the Railway URL with your team
3. 🔐 Change default passwords
4. 📊 Set up monitoring
5. 🎨 Optional: Add custom domain
6. 🚀 Go live!

**Your ŽYBIS incident management system is ready for the world! 🌍**
