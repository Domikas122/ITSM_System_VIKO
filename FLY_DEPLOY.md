# Fly.io Deployment Guide

Fly.io offers a generous **free tier** with **3 shared-cpu VMs** and **3GB persistent storage** with no auto-sleep. Perfect for ŽYBIS.

## 5-Minute Setup

### 1. Install Fly CLI
```bash
# macOS
brew install flyctl

# Verify installation
flyctl version
```

### 2. Login to Fly.io
```bash
flyctl auth login
```
Creates/logs into your Fly.io account in browser.

### 3. Create App
```bash
flyctl launch
```
Answer prompts:
- **App Name**: `incident-pilot` (or your choice)
- **Region**: Select closest to you (e.g., `ams` for Europe)
- **Database**: NO (we use SQLite)
- **Postgres**: NO
- **Deploy now?**: NO (we'll set up secrets first)

### 4. Set Production Secrets
```bash
# Generate a strong SESSION_SECRET (use any random string generator)
flyctl secrets set SESSION_SECRET="your-random-secret-here"
flyctl secrets set NODE_ENV="production"
```

Replace `your-random-secret-here` with a strong random string:
```bash
# Generate one:
openssl rand -base64 32
```

### 5. Deploy
```bash
flyctl deploy
```

That's it! Your app will be live at `https://incident-pilot.fly.dev`

---

## Important Configurations

### Environment Variables
Your secrets are set via:
```bash
flyctl secrets set VAR_NAME="value"
```

View secrets:
```bash
flyctl secrets list
```

### Persistent Storage
SQLite data persists automatically in the VM. To backup:
```bash
flyctl ssh console -C "cat incident-pilot.db" > incident-pilot.db.backup
```

### Logs & Monitoring
```bash
# View logs
flyctl logs

# SSH into app
flyctl ssh console

# Monitor metrics
flyctl status
```

### Custom Domain
Add your domain:
```bash
flyctl certs create your-domain.com
```

Then add DNS CNAME record pointing to Fly.io (they'll show instructions).

---

## Free Tier Limits
- ✅ 3 shared-cpu VMs (includes 1 free app)
- ✅ 3GB persistent storage total
- ✅ 160GB outbound bandwidth/month
- ✅ Automatic HTTPS
- ✅ No auto-sleep
- ❌ Premium support not included

## Scaling (if needed)
```bash
flyctl scale vm shared-cpu-1x --memory 512 --count 1
```

---

## Troubleshooting

**App won't start?**
```bash
flyctl logs -n 50
```

**Need to rebuild?**
```bash
flyctl deploy --no-cache
```

**Want to destroy?**
```bash
flyctl apps destroy incident-pilot
```

**Update after git push?**
```bash
flyctl deploy
```

---

## Next Steps

1. Commit `fly.toml`:
   ```bash
   git add fly.toml && git commit -m "Add Fly.io deployment config"
   ```

2. Push to GitHub:
   ```bash
   git push origin main
   ```

3. Deploy to Fly.io:
   ```bash
   flyctl deploy
   ```

Done! Your app is live. 🚀
