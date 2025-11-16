# Quick Start Guide - Najm Althuraya

## 🚀 FASTEST WAY TO GET STARTED (5 MINUTES)

### Step 1: Database Setup (2 minutes)

1. Go to https://supabase.com and sign up
2. Create a new project named "najm-althuraya"
3. Save your database password!
4. Go to SQL Editor
5. Copy everything from `database/schema.sql` and paste it
6. Click RUN
7. Go to Project Settings → Database → Connection String
8. Copy the connection string (looks like: postgresql://postgres:password@host:5432/postgres)

### Step 2: Backend Deployment (2 minutes)

**Option A: Using Railway (Recommended)**

1. Go to https://railway.app and login with GitHub
2. Click "New Project" → "Empty Project"
3. Click "Deploy" → choose "GitHub Repo" or "Deploy from CLI"
4. Add these environment variables:
   ```
   DATABASE_URL=your_supabase_connection_string
   JWT_SECRET=make_this_a_long_random_string_xyz123abc456
   NODE_ENV=production
   PORT=5000
   CORS_ORIGIN=*
   ```
5. Your backend will be at: `https://your-app.railway.app`

**Option B: Using Render**

1. Go to https://render.com
2. New → Web Service
3. Connect your GitHub or upload code
4. Add same environment variables as above
5. Deploy

### Step 3: Frontend Deployment (1 minute)

1. Go to https://vercel.com and login
2. Import your Git repository (or drag & drop frontend folder)
3. Add environment variable:
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   ```
4. Deploy
5. Your frontend will be at: `https://your-app.vercel.app`

### Step 4: Connect Your Domain

1. In Vercel: Settings → Domains → Add `najum-althuraya.com`
2. Follow DNS instructions
3. Update CORS_ORIGIN in Railway to `https://najum-althuraya.com`

### Step 5: First Login

1. Go to https://najum-althuraya.com
2. Login with:
   - Email: admin@najum-althuraya.com
   - Password: admin123
3. IMMEDIATELY change password in Settings!

## 🎉 DONE!

You now have a fully functional transaction management system!

---

## 🆘 NEED HELP?

### Can't login?
- Check backend logs in Railway
- Verify DATABASE_URL is correct
- Make sure schema was run in Supabase

### Blank page?
- Check VITE_API_URL in Vercel
- Make sure backend is running
- Check browser console for errors

### CORS error?
- Update CORS_ORIGIN in Railway
- Should match your frontend URL

---

## 📞 SUPPORT CHECKLIST

Before asking for help:
- [ ] Supabase project created and schema run
- [ ] Backend deployed on Railway/Render
- [ ] Environment variables set correctly
- [ ] Frontend deployed on Vercel
- [ ] VITE_API_URL points to backend

---

## 💡 PRO TIPS

1. **Use Railway CLI for easier deployment:**
   ```bash
   npm install -g @railway/cli
   railway login
   railway init
   railway up
   ```

2. **Test locally first:**
   ```bash
   # Backend
   cd backend && npm install && npm start

   # Frontend (new terminal)
   cd frontend && npm install && npm run dev
   ```

3. **Monitor your app:**
   - Railway has real-time logs
   - Vercel shows deployment status
   - Supabase has query inspector

---

That's it! Happy managing! 🚀
