# 🚀 Vercel Deployment Guide for SportSense AI

## Quick Summary for Vercel
- **Framework**: None (Vanilla JavaScript)
- **Type**: Static Site
- **Build**: Not required
- **Environment Variables**: Supabase credentials

## Step-by-Step Deployment

### 1️⃣ **Prepare Your Repository**
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 2️⃣ **Sign Up for Vercel**
- Go to [vercel.com](https://vercel.com)
- Sign in with GitHub
- Grant repository access

### 3️⃣ **Import Project**
- Click **"New Project"**
- Select **"Import Git Repository"**
- Choose **SportSense-AI** repository
- Click **"Import"**

### 4️⃣ **Framework Configuration**
When Vercel asks for settings:

| Setting | Value |
|---------|-------|
| Framework Preset | `Other` or `Static Site` |
| Root Directory | `./` (default) |
| Build Command | Leave empty |
| Output Directory | `./` (default) |
| Install Command | Leave empty |

### 5️⃣ **Environment Variables Setup**

**Required Variables:**
```
VITE_SUPABASE_URL = https://fbjmqrxlwgqojqardgqo.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiam1xcnhsd2dxb2pxYXJkZ3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MTUyNjQsImV4cCI6MjA3MDM5MTI2NH0.uE0MtSSN5v1KmER0xSY-nRNPrj1u5RfFYW3pfIdzzBI
VITE_ELEVENLABS_API_KEY = your_elevenlabs_api_key_here
```

**How to Get ElevenLabs API Key:**
1. Go to [elevenlabs.io](https://elevenlabs.io)
2. Sign up/login to your account
3. Navigate to **Profile** → **API Keys**
4. Generate a new API key
5. Copy the key for Vercel setup

**How to Add in Vercel:**
1. Go to project **Settings**
2. Click **Environment Variables**
3. Add each variable:
   - **Name**: `VITE_SUPABASE_URL`
   - **Value**: Your Supabase URL
   - **Environment**: Select all (Production, Preview, Development)
4. Add second variable:
   - **Name**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: Your Supabase anon key
   - **Environment**: Select all
5. Add third variable:
   - **Name**: `VITE_ELEVENLABS_API_KEY`
   - **Value**: Your ElevenLabs API key
   - **Environment**: Select all
6. Click **Save**

### 6️⃣ **Deploy**
1. Click **"Deploy"** button
2. Wait 1-2 minutes for completion
3. Your app will be live at: `https://your-project-name.vercel.app`

### 7️⃣ **Custom Domain (Optional)**
1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow Vercel's DNS configuration instructions

## 🔧 Technical Details

### Project Structure for Vercel:
```
SportSense-AI/
├── welcome.html         # Landing page (entry point)
├── index.html          # Authenticated home page
├── login.html          # Authentication
├── profile.html        # User profile
├── dashboard.html      # Fitness dashboard
├── assets/             # Static assets
├── vercel.json         # Vercel configuration
└── README.md
```

### Framework Detection:
- **Language**: JavaScript
- **Framework**: None (Vanilla JS)
- **Build Tool**: None
- **Package Manager**: None
- **Dependencies**: External APIs only

### Routing:
- `/` → `welcome.html` (landing page)
- `/home` → `index.html` (authenticated home)
- All other routes serve static files

## ✅ Deployment Checklist

- [ ] Repository pushed to GitHub
- [ ] Vercel account connected to GitHub
- [ ] Project imported to Vercel
- [ ] Framework set to "Other/Static"
- [ ] **Environment variables added:**
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
  - [ ] `VITE_ELEVENLABS_API_KEY`
- [ ] Database schema applied to Supabase
- [ ] Authentication enabled in Supabase
- [ ] ElevenLabs account created and API key generated
- [ ] Deployment successful
- [ ] Live URL working
- [ ] User registration/login working
- [ ] Profile data saving to database
- [ ] Voice features working with ElevenLabs

## 🐛 Troubleshooting

### Common Issues:

**1. Build Fails**
- Solution: Ensure no package.json exists, or build command is empty

**2. Environment Variables Not Working**
- Solution: Check variable names start with `VITE_`
- Verify all environments are selected (Prod, Preview, Dev)
- Redeploy after adding new environment variables

**3. Supabase Connection Issues**
- Solution: Verify URL and anon key are correct
- Check Supabase project is active

**4. Authentication Not Working**
- Solution: Ensure email auth is enabled in Supabase
- Check RLS policies are correctly set

**5. ElevenLabs Voice Features Not Working**
- Solution: Verify API key is correct and active
- Check ElevenLabs account has sufficient credits
- Ensure `VITE_ELEVENLABS_API_KEY` is set in all environments
- Test API key in ElevenLabs dashboard first

## 🎉 Success!

Once deployed, your SportSense AI app will be live with:
- ✅ Full authentication system
- ✅ User profile management
- ✅ Database persistence
- ✅ Real-time updates
- ✅ Responsive design
- ✅ AI-powered voice coaching (ElevenLabs)

**Live URL**: `https://your-project-name.vercel.app`

---

*Need help? Check the main README.md or contact [Dharsan5](https://github.com/Dharsan5)*
