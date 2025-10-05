# Railway Deployment Guide

## 🚀 Deploy Backend to Railway

### Step 1: Prepare Your Repository
1. Push your code to GitHub
2. Make sure all files are committed

### Step 2: Create Railway Project
1. Go to [Railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your `Voice-Bridge` repository

### Step 3: Configure Railway Settings

#### Environment Variables
Add these in Railway dashboard → Variables:

```
PORT=3000
OPENAI_KEY=your_actual_openai_key
UPLIFT_KEY=your_actual_upliftai_key
NODE_ENV=production
```

#### Build Settings
Railway will automatically detect the configuration from:
- `railway.json` - Railway-specific settings
- `nixpacks.toml` - Build configuration

### Step 4: Deploy
1. Railway will automatically build and deploy
2. Check the logs for any errors
3. Your backend will be available at: `https://your-app.railway.app`

### Step 5: Test Your Deployment
```bash
# Test the API
curl https://your-app.railway.app/api/init

# Test WhatsApp connection
curl -X POST https://your-app.railway.app/api/init
```

## 🔧 Configuration Files

### railway.json
- Defines start command and health checks
- Points to backend directory

### nixpacks.toml
- Configures build process
- Installs dependencies for both root and backend
- Builds TypeScript to JavaScript

## 📱 WhatsApp Bot Usage

1. **Initialize Bot**: `GET /api/init`
2. **Send Message**: `POST /api/send`
3. **Check Logs**: Monitor Railway logs for QR code

## 🛠️ Troubleshooting

### Common Issues:
1. **Build Fails**: Check TypeScript compilation
2. **Port Issues**: Ensure PORT environment variable is set
3. **Dependencies**: Verify all packages are in package.json

### Logs:
- Check Railway dashboard → Deployments → Logs
- Look for QR code in logs to connect WhatsApp

## 🔄 Updates
- Push to GitHub to trigger automatic redeployment
- Railway will rebuild and redeploy automatically
