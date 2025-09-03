# 🚂 Railway Deployment Guide for STRAWHAT Music Bot

## 🎯 **Prerequisites:**
- ✅ Discord Bot Token
- ✅ GitHub account
- ✅ Railway account

## 🚀 **Step 1: Prepare Your Bot**

### **1.1 Check Your Files**
Make sure you have these essential files:
- ✅ `index.js` - Main bot file
- ✅ `package.json` - Dependencies
- ✅ `config.json` - Bot configuration
- ✅ `railway.json` - Railway configuration
- ✅ `commands/` folder - All bot commands
- ✅ `handlers/` folder - Event and command handlers

### **1.2 Update config.json**
Make sure your `config.json` has the correct values:
```json
{
  "token": "YOUR_BOT_TOKEN_HERE",
  "clientId": "YOUR_CLIENT_ID_HERE",
  "guildId": "YOUR_GUILD_ID_HERE",
  "bot": {
    "name": "STRAWHAT Music Bot",
    "activity": "🎵 Music | /help"
  }
}
```

## 🌐 **Step 2: Push to GitHub**

### **2.1 Initialize Git (if not already done)**
```bash
git init
git add .
git commit -m "Initial commit for Railway deployment"
```

### **2.2 Create GitHub Repository**
1. Go to [GitHub](https://github.com)
2. Click "New repository"
3. Name it `strawhat-music-bot`
4. Make it **Public** (Railway needs this)
5. Don't initialize with README

### **2.3 Push to GitHub**
```bash
git remote add origin https://github.com/YOUR_USERNAME/strawhat-music-bot.git
git branch -M main
git push -u origin main
```

## 🚂 **Step 3: Deploy to Railway**

### **3.1 Create Railway Account**
1. Go to [Railway](https://railway.app)
2. Sign up with GitHub
3. Complete setup

### **3.2 Create New Project**
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your `strawhat-music-bot` repository
4. Click "Deploy Now"

### **3.3 Configure Environment Variables**
In your Railway project dashboard:

1. Go to **Variables** tab
2. Add these environment variables:

```env
NODE_ENV=production
PORT=3000
```

### **3.4 Deploy Settings**
Railway will automatically:
- ✅ Detect Node.js project
- ✅ Install dependencies from `package.json`
- ✅ Use `npm start` command
- ✅ Monitor health at `/health` endpoint

## 🔧 **Step 4: Railway Configuration**

### **4.1 Automatic Deployments**
- ✅ **Auto-deploy** on every GitHub push
- ✅ **Health checks** every 30 seconds
- ✅ **Automatic restarts** on failure
- ✅ **Logs** available in Railway dashboard

### **4.2 Custom Domain (Optional)**
1. Go to **Settings** tab
2. Click **Generate Domain**
3. Railway provides a custom URL

### **4.3 Environment Variables (Advanced)**
You can also set these in Railway:
```env
NODE_ENV=production
RAILWAY_STATIC_URL=your-custom-domain
```

## 📊 **Step 5: Monitor Your Bot**

### **5.1 Railway Dashboard**
- **Deployments** - See deployment history
- **Logs** - Real-time bot logs
- **Metrics** - CPU, memory usage
- **Variables** - Environment configuration

### **5.2 Health Check**
Your bot automatically responds to:
- `https://your-domain.railway.app/health`
- Shows bot status, guild count, uptime

### **5.3 Bot Status**
- ✅ **Online** - Bot is running
- ✅ **Guilds** - Number of servers
- ✅ **Uptime** - How long bot has been running

## 🚨 **Troubleshooting**

### **Common Issues:**

#### **1. Bot Not Starting**
- Check **Logs** in Railway dashboard
- Verify `config.json` has correct token
- Ensure all dependencies are in `package.json`

#### **2. Commands Not Working**
- Check if bot has proper permissions
- Verify slash commands are registered
- Check bot is in your server

#### **3. Music Not Playing**
- Ensure DisTube plugins are installed
- Check voice channel permissions
- Verify bot can join voice channels

### **Debug Commands:**
```bash
# Check bot logs
railway logs

# Check bot status
curl https://your-domain.railway.app/health

# Restart bot
railway service restart
```

## 🌟 **Railway Benefits**

### **✅ Free Tier:**
- **500 hours/month** free
- **512MB RAM** per service
- **1GB storage**
- **Perfect for Discord bots!**

### **✅ Production Features:**
- **Auto-scaling** based on demand
- **Load balancing** for high traffic
- **SSL certificates** included
- **Global CDN** for fast access

### **✅ Monitoring:**
- **Real-time logs** and metrics
- **Health checks** and alerts
- **Performance analytics**
- **Error tracking**

## 🎉 **Success!**

Once deployed, your bot will:
- ✅ **Run 24/7** on Railway
- ✅ **Auto-restart** if it crashes
- ✅ **Scale automatically** with demand
- ✅ **Be accessible** from anywhere

## 🔗 **Useful Links**

- [Railway Dashboard](https://railway.app/dashboard)
- [Railway Documentation](https://docs.railway.app)
- [Discord Developer Portal](https://discord.com/developers/applications)
- [STRAWHAT Music Bot GitHub](https://github.com/YOUR_USERNAME/strawhat-music-bot)

---

**🎵 Your STRAWHAT Music Bot is now ready for Railway deployment!** 🚂 