# 🚀 Thriftika Deployment Guide

This guide covers deploying Thriftika to Fly.io (backend) and Vercel/Netlify (frontend).

## 📋 Prerequisites

- [Fly.io account](https://fly.io)
- [Vercel account](https://vercel.com) or [Netlify account](https://netlify.com)
- [MongoDB Atlas](https://mongodb.com/atlas) database
- Gmail account for email (optional)

## 🗄️ Database Setup (MongoDB Atlas)

1. Create a free cluster at [MongoDB Atlas](https://mongodb.com/atlas)
2. Create a database user
3. Whitelist your IP (0.0.0.0/0 for Fly.io)
4. Get your connection string

## 🔧 Backend Deployment (Fly.io)

### 1. Install Fly CLI
```bash
# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex

# Or download from: https://fly.io/docs/flyctl/install/
```

### 2. Login to Fly.io
```bash
fly auth login
```

### 3. Initialize Fly App
```bash
fly launch --name thriftika-backend
# Answer prompts:
# - Choose organization: your account
# - Region: choose closest (e.g., London, Frankfurt)
# - No to PostgreSQL
# - No to Redis
```

### 4. Configure Environment Variables
```bash
fly secrets set NODE_ENV=production
fly secrets set MONGODB_URI="your-mongodb-atlas-connection-string"
fly secrets set JWT_SECRET="your-secure-jwt-secret"
fly secrets set SESSION_SECRET="your-secure-session-secret"
fly secrets set GOOGLE_CLIENT_ID="your-google-client-id"
fly secrets set GOOGLE_CLIENT_SECRET="your-google-client-secret"
fly secrets set EMAIL_USER="your-email@gmail.com"
fly secrets set EMAIL_PASS="your-gmail-app-password"
fly secrets set FRONTEND_URL="https://your-frontend-domain.com"
fly secrets set BACKEND_URL="https://thriftika-backend.fly.dev"
```

### 5. Deploy Backend
```bash
fly deploy
```

### 6. Get Backend URL
```bash
fly status
# Note the URL: https://thriftika-backend.fly.dev
```

## 🎨 Frontend Deployment

### Option A: Vercel

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy Frontend**
```bash
# From project root
vercel --prod

# Or deploy only client
cd client
vercel --prod
```

4. **Configure Environment Variables**
```bash
vercel env add VITE_API_URL
# Enter: https://thriftika-backend.fly.dev
```

5. **Update API Proxy URL**
Edit `vercel.json` and replace `your-fly-app.fly.dev` with your actual Fly.io URL.

### Option B: Netlify

1. **Install Netlify CLI**
```bash
npm i -g netlify-cli
```

2. **Login to Netlify**
```bash
netlify login
```

3. **Deploy Frontend**
```bash
# From project root
netlify deploy --prod --dir=client/dist

# Or link to existing site
netlify link
netlify build
netlify deploy --prod
```

4. **Configure Environment Variables**
```bash
netlify env:set VITE_API_URL https://thriftika-backend.fly.dev
```

5. **Update API Proxy URL**
Edit `netlify.toml` and replace `your-fly-app.fly.dev` with your actual Fly.io URL.

## 🔄 Update URLs

After deployment, update these URLs in your environment variables:

### Fly.io Secrets:
```bash
fly secrets set FRONTEND_URL="https://your-frontend-domain.vercel.app"
```

### Frontend Environment:
- **Vercel**: Update `vercel.json` with correct Fly.io URL
- **Netlify**: Update `netlify.toml` with correct Fly.io URL

## 🧪 Testing Deployment

1. **Test Backend API**
```bash
curl https://thriftika-backend.fly.dev/api/products
```

2. **Test Frontend**
- Visit your Vercel/Netlify URL
- Try registering/logging in
- Check if products load

## 🚨 Common Issues

### Backend Issues:
- **Port Error**: Fly.io uses port 8080 internally
- **Database**: Ensure MongoDB Atlas allows Fly.io IPs
- **Environment**: Use `fly secrets` for sensitive data

### Frontend Issues:
- **API Calls**: Ensure VITE_API_URL points to Fly.io backend
- **CORS**: Backend allows frontend domain
- **Build**: Ensure build commands work

### Email Issues:
- **Gmail**: Enable "Less secure app access" or use App Passwords
- **Development**: Emails are simulated in dev mode

## 📊 Monitoring

### Fly.io:
```bash
fly logs
fly status
fly scale count 2  # Scale to 2 instances
```

### Vercel/Netlify:
- Check dashboard for errors
- Monitor build logs
- View analytics

## 🔒 Security Checklist

- ✅ JWT secrets are secure and random
- ✅ Database credentials are in environment variables
- ✅ HTTPS is enabled automatically
- ✅ CORS is configured for your frontend domain
- ✅ Sensitive data not in git (check .gitignore)

## 🎉 You're Live!

Your Thriftika marketplace is now deployed and accessible worldwide! 🎊

**URLs:**
- Frontend: `https://your-frontend-domain.com`
- Backend: `https://thriftika-backend.fly.dev`