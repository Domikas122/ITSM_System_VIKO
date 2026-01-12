# ŽYBIS - Deployment Guide

## Making Your Site Publicly Accessible

### Option 1: Cloud Hosting (Recommended)

**Popular Services:**
- **Railway.app** - Easy deployment, free tier available
- **Render.com** - Free tier with automatic HTTPS
- **Fly.io** - Global deployment
- **DigitalOcean App Platform** - Simple deployment
- **AWS/Azure/GCP** - Enterprise options

**Steps for Railway/Render:**
1. Push your code to GitHub
2. Connect your repository to Railway/Render
3. Set environment variables:
   - `NODE_ENV=production`
   - `SESSION_SECRET=<generate-random-string>`
   - `PUBLIC_URL=https://your-app.railway.app`
4. Deploy automatically

### Option 2: VPS (Virtual Private Server)

**Services:** DigitalOcean, Linode, AWS EC2, etc.

**Setup:**
```bash
# 1. SSH into your server
ssh user@your-server-ip

# 2. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install PM2 (process manager)
sudo npm install -g pm2

# 4. Clone your project
git clone <your-repo-url>
cd IncidentPilot

# 5. Install dependencies
npm install

# 6. Build the client
npm run build:client

# 7. Create production .env file
nano .env
```

**Production .env:**
```env
NODE_ENV=production
PORT=8080
HOST=0.0.0.0
PUBLIC_URL=https://zybis.yourdomain.com
SESSION_SECRET=<long-random-secret-here>
COOKIE_DOMAIN=.yourdomain.com
```

**8. Start with PM2:**
```bash
pm2 start npm --name "zybis" -- start
pm2 save
pm2 startup
```

### Option 3: Docker Container

**Create `Dockerfile`:**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build:client
EXPOSE 8080
CMD ["npm", "start"]
```

**Deploy to:**
- Docker Hub + any cloud provider
- Kubernetes cluster
- Docker Swarm

### Domain Setup

**1. Get a domain** (from Namecheap, Google Domains, etc.)

**2. Point DNS to your server:**
- A Record: `zybis.yourdomain.com` → Your server IP

**3. Set up HTTPS with Let's Encrypt:**
```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d zybis.yourdomain.com
```

**4. Configure Nginx as reverse proxy:**
```nginx
server {
    listen 80;
    server_name zybis.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name zybis.yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/zybis.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/zybis.yourdomain.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Security Checklist

Before going public:

- [ ] Change `SESSION_SECRET` to a long random string
- [ ] Enable HTTPS (required for production)
- [ ] Set `NODE_ENV=production`
- [ ] Update default user passwords
- [ ] Configure firewall (only ports 80, 443, 22 open)
- [ ] Set up database backups
- [ ] Configure rate limiting
- [ ] Set up monitoring (UptimeRobot, etc.)
- [ ] Add logging (PM2 logs, cloud logging)

### Quick Start: Railway.app (Easiest)

1. **Install Railway CLI:**
```bash
npm install -g @railway/cli
```

2. **Login and deploy:**
```bash
railway login
railway init
railway up
```

3. **Set environment variables in Railway dashboard**

4. **Done!** Railway gives you a URL like `zybis.up.railway.app`

### Database Note

Your app uses SQLite (`incident-pilot.db`). For production:
- **Cloud hosting:** SQLite works but consider PostgreSQL for better reliability
- **VPS:** SQLite is fine, ensure regular backups
- **Multiple servers:** Must use PostgreSQL or MySQL (shared database)

### Monitoring Your App

**PM2 Dashboard:**
```bash
pm2 monit
pm2 logs zybis
```

**Health check endpoint:** Add to `server/routes.ts`:
```typescript
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});
```

### Support

For deployment help:
- Railway docs: https://docs.railway.app
- Render docs: https://render.com/docs
- DigitalOcean tutorials: https://www.digitalocean.com/community/tutorials
