# 🚀 Deploy Backend to Render (5 Minutes)

## **Step 1: Create Render Account**
→ https://render.com
- Sign up (free)
- Connect your GitHub account

## **Step 2: Create Web Service**
1. Click **"New"** → **"Web Service"**
2. Click **"Connect GitHub"**
3. Search: **`shesafe`**
4. Select your repo
5. Click **"Connect"**

## **Step 3: Configure Service**
```
Name:              shesafe-backend
Environment:       Node
Region:            Oregon (or closest)
Branch:            main
Build Command:     cd server && npm install
Start Command:     cd server && node server.js
Plan:              Free
```

## **Step 4: Add Environment Variables**
Click **"Advanced"** and add:

```
PORT=5000
NODE_ENV=production
JWT_SECRET=your_super_secret_jwt_key_change_me_in_production_$(openssl rand -hex 32)
MONGO_URI=mongodb+srv://shesafe_user:PASSWORD@cluster0.xxxxx.mongodb.net/shesafe?retryWrites=true&w=majority
CLIENT_URL=https://client-ashy-seven-81.vercel.app
```

**Replace:**
- `PASSWORD` → Your MongoDB password
- `cluster0.xxxxx` → Your actual cluster URL

## **Step 5: Deploy!**
Click **"Create Web Service"**
Wait 5-10 minutes for deployment

## **Step 6: Copy Backend URL**
After deployment, copy your URL:
```
https://your-shesafe-backend.onrender.com
```

## **Step 7: Update Frontend**
Go to Vercel Dashboard → Your project → Settings → Environment Variables
Add/Update:
```
REACT_APP_API_URL=https://your-shesafe-backend.onrender.com
```

---

## ✅ **Test Your App**
Visit: https://client-ashy-seven-81.vercel.app
- Login with: `priya@shesafe.com` / `demo1234`
- All features should work!

---

## 🔧 **Troubleshooting**

**"Build failed"**
- Check Render logs
- Ensure `server/package.json` has correct scripts

**"Cannot connect to MongoDB"**
- Verify IP whitelist includes `0.0.0.0/0`
- Check username/password in connection string

**"CORS error"**
- Update `CLIENT_URL` in Render to match your Vercel URL

---

## 🎯 **Your URLs**
- **Frontend:** https://client-ashy-seven-81.vercel.app
- **Backend:** [Your Render URL]
- **Database:** MongoDB Atlas (connected)

**Time: ~10 minutes total** ⏱️