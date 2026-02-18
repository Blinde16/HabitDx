# HabitDx - Local Testing & Deployment Guide

**Date:** February 16, 2026  
**Purpose:** Test HabitDx MVP before app store submission

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- ✅ Node.js installed
- ✅ npm or yarn installed
- ✅ Supabase account (free)
- ✅ OpenAI API key

---

## Step 1: Install Supabase CLI

```bash
# Install globally
npm install -g supabase

# Verify installation
supabase --version
```

---

## Step 2: Configure Environment Variables

1. **Add your OpenAI API key** to `.env`:

```bash
# Open .env file and replace:
OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE

# With your actual key (starts with sk-):
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
```

2. **Your Supabase keys are already configured** ✅:
   - URL: `https://wfslsrknguculwuplshq.supabase.co`
   - Anon Key: Already in `.env`

---

## Step 3: Deploy Edge Functions to Supabase

### First Time Setup

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref wfslsrknguculwuplshq
```

### Deploy Functions

**On Windows (PowerShell):**
```powershell
.\scripts\deploy-functions.ps1
```

**On Mac/Linux:**
```bash
chmod +x scripts/deploy-functions.sh
./scripts/deploy-functions.sh
```

**Manual Deployment (if scripts don't work):**
```bash
# Deploy each function
supabase functions deploy analyze-failure --no-verify-jwt
supabase functions deploy generate-habits --no-verify-jwt
supabase functions deploy weekly-iteration --no-verify-jwt

# Set the OpenAI API key secret
supabase secrets set OPENAI_API_KEY="your_key_here"
```

---

## Step 4: Run Database Migrations

```bash
# Apply all migrations to your Supabase project
supabase db push
```

This will create all necessary tables:
- `user_profiles`
- `habit_failure_profiles`
- `habit_stacks`
- `habits`
- `habit_logs`
- `weekly_iterations`

---

## Step 5: Start the Development Server

```bash
# Install dependencies (if not done yet)
npm install

# Start Expo dev server
npm start
```

---

## Step 6: Test in Browser (Recommended for MVP Testing)

1. After `npm start`, press `w` to open in **web browser**
2. Or navigate to: `http://localhost:19006`
3. Browser will open automatically

**Why Web First?**
- ✅ Fastest testing (no device/simulator needed)
- ✅ Easy debugging with browser dev tools
- ✅ All features work except device-specific (notifications)
- ✅ Perfect for testing the AI and core flows

---

## Step 7: Test the Complete User Journey

### Test Account
Create a test account (don't use your real email):
- **Email:** `test@habitdx.com`
- **Password:** `Test123!`

### Complete Flow (15 minutes)

1. **Sign Up** ✅
   - Create account
   - Verify it navigates to onboarding

2. **Onboarding** ✅
   - Complete all 5 screens
   - Add past habits
   - Select constraints
   - Define goals

3. **AI Failure Profile** ✅
   - Wait 3-5 seconds for generation
   - Verify patterns are personalized
   - Check if insights reference your data

4. **Habit Stack Generation** ✅
   - Wait 2-4 seconds for generation
   - Verify habits are tiny (≤2 minutes)
   - Check anchors and celebrations
   - Verify rationale links to failure patterns

5. **Daily Check-ins** ✅
   - Tap to check in a habit
   - Verify success animation
   - Try undo
   - Log an obstacle

6. **Navigation** ✅
   - Switch between Home/Insights/Settings tabs
   - Verify all screens load
   - Check settings controls

7. **Weekly Iteration** (Optional - requires 7 days of data)
   - Generate insight
   - Review recommendations
   - Accept/decline adjustment

---

## 🐛 Troubleshooting

### Issue: Edge Functions Not Working

**Symptoms:**
- "Failed to generate profile"
- "Edge Function error"

**Solutions:**

1. **Check if functions are deployed:**
   ```bash
   supabase functions list
   ```
   Should show: `analyze-failure`, `generate-habits`, `weekly-iteration`

2. **Check if OPENAI_API_KEY secret is set:**
   ```bash
   supabase secrets list
   ```
   Should show: `OPENAI_API_KEY`

3. **Check function logs:**
   ```bash
   supabase functions logs analyze-failure
   ```

4. **Verify OpenAI API key works:**
   ```bash
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer YOUR_OPENAI_KEY"
   ```

### Issue: Database Connection Failed

**Symptoms:**
- "Failed to fetch"
- "Connection error"

**Solutions:**

1. **Verify Supabase URL and key in `.env`:**
   ```bash
   EXPO_PUBLIC_SUPABASE_URL=https://wfslsrknguculwuplshq.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_yX6PGoz3NYpo5-KxRYi7Tg_gtnFl31f
   ```

2. **Check if tables exist:**
   - Go to https://supabase.com/dashboard
   - Select your project
   - Go to Table Editor
   - Verify tables: `user_profiles`, `habits`, etc.

3. **Run migrations if tables don't exist:**
   ```bash
   supabase db push
   ```

### Issue: Web App Won't Start

**Symptoms:**
- `npm start` fails
- Port already in use

**Solutions:**

1. **Clear npm cache:**
   ```bash
   npm cache clean --force
   rm -rf node_modules
   npm install
   ```

2. **Try different port:**
   ```bash
   EXPO_DEVTOOLS_LISTEN_ADDRESS=localhost:8080 npm start
   ```

3. **Check for other processes using port 19006:**
   ```bash
   # Windows
   netstat -ano | findstr :19006
   
   # Mac/Linux
   lsof -i :19006
   ```

### Issue: OpenAI API Errors

**Symptoms:**
- "OpenAI API error: 401"
- "Invalid API key"

**Solutions:**

1. **Verify API key is correct** (starts with `sk-proj-` or `sk-`):
   - Go to https://platform.openai.com/api-keys
   - Create new key if needed
   - Update `.env` file

2. **Check API key has credits:**
   - Go to https://platform.openai.com/usage
   - Verify you have available credits

3. **Redeploy the secret:**
   ```bash
   supabase secrets set OPENAI_API_KEY="your_actual_key"
   ```

---

## 📊 Testing Checklist

Use this to verify everything works:

### Authentication
- [ ] Can sign up with email
- [ ] Can log in
- [ ] Session persists on refresh
- [ ] Can sign out

### Onboarding
- [ ] All 5 screens load
- [ ] Can input data
- [ ] Validation works
- [ ] Navigates to next screen

### AI Profile Generation
- [ ] Loading indicator shows
- [ ] Profile generates (3-5 seconds)
- [ ] Patterns are specific to my data
- [ ] Insights reference my habits
- [ ] Can navigate to habits

### Habit Generation
- [ ] Loading indicator shows
- [ ] Habits generate (2-4 seconds)
- [ ] Habits are tiny (≤2 minutes)
- [ ] Anchors make sense
- [ ] Rationale links to patterns
- [ ] Can start tracking

### Daily Check-ins
- [ ] Home screen loads habits
- [ ] Can check in (tap)
- [ ] Success animation plays
- [ ] Can undo
- [ ] Can log obstacles
- [ ] Data persists on refresh

### Navigation
- [ ] All 3 tabs work
- [ ] Can switch between tabs
- [ ] Data persists across tabs

### Settings
- [ ] Shows user email
- [ ] Can toggle settings
- [ ] Can sign out

---

## 🚀 Next: Testing on Mobile Devices

Once web testing is complete, test on real devices:

### iOS (Requires Mac)
```bash
npm run ios
```

### Android
```bash
npm run android
```

### Physical Device (Best for notifications)
1. Install Expo Go app
2. Scan QR code from `npm start`
3. Test full experience with notifications

---

## 📝 Cost During Testing

**OpenAI API Usage:**
- Profile generation: ~$0.0025 per user
- Habit generation: ~$0.0003 per user
- Weekly iteration: ~$0.002 per user
- **Total per test user:** ~$0.005

**10 test users = ~$0.05** 💸

**Supabase:**
- Free tier: 500MB database, 2GB bandwidth
- Perfect for testing!

---

## ✅ When Testing is Complete

Once you've verified everything works:

1. **Document any bugs found** in GitHub Issues
2. **Update NEXT_STEPS.md** with launch information
3. **Prepare app store assets** (screenshots, icon)
4. **Submit to app stores** when ready

---

## 🆘 Need Help?

**Common Commands:**

```bash
# Check Supabase project status
supabase status

# View Edge Function logs
supabase functions logs analyze-failure

# List deployed functions
supabase functions list

# List secrets
supabase secrets list

# Restart dev server
# Press Ctrl+C, then npm start
```

**Useful Links:**
- Supabase Dashboard: https://supabase.com/dashboard
- OpenAI Usage: https://platform.openai.com/usage
- Expo Dev Tools: http://localhost:19006

---

## 🎉 Success!

If you can:
- ✅ Sign up
- ✅ Complete onboarding
- ✅ Generate AI profile
- ✅ Generate habits
- ✅ Check in habits
- ✅ Navigate the app

**Then HabitDx is working perfectly and ready for app store submission!** 🚀
