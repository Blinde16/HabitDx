# Blake's Quick Start - Test HabitDx NOW!

**Time to test:** 5 minutes setup + 15 minutes testing

---

## 🚀 What I Just Set Up For You

✅ **Web support** - Test in your browser (no device needed!)  
✅ **Edge Functions** - Already configured to use your Supabase keys  
✅ **Deployment scripts** - Easy PowerShell script for Windows  
✅ **Complete testing guide** - Step-by-step instructions

---

## 📋 What You Need to Do (5 Minutes)

### Step 1: Get Your OpenAI API Key (2 minutes)

1. Go to: https://platform.openai.com/api-keys
2. Sign up/login (free account works for testing)
3. Click "Create new secret key"
4. Copy the key (starts with `sk-proj-` or `sk-`)

### Step 2: Add API Key to .env (30 seconds)

Open your `.env` file and replace this line:
```
OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE
```

With your actual key:
```
OPENAI_API_KEY=sk-proj-abc123xyz...
```

**That's it for configuration!** Your Supabase keys are already set.

---

## Step 3: Install Supabase CLI (1 minute)

```powershell
npm install -g supabase
```

### Step 4: Login to Supabase (30 seconds)

```powershell
supabase login
```

This will open a browser for authentication.

### Step 5: Link Your Project (30 seconds)

```powershell
supabase link --project-ref wfslsrknguculwuplshq
```

### Step 6: Deploy Edge Functions (1 minute)

```powershell
.\scripts\deploy-functions.ps1
```

This deploys all 3 AI functions to Supabase.

### Step 7: Run Migrations (30 seconds)

```powershell
supabase db push
```

This creates all database tables.

---

## 🧪 Step 8: Start Testing! (15 minutes)

```powershell
npm start
```

Then press `w` to open in **browser**.

### Test Flow:

1. **Sign up:** test@habitdx.com / Test123!
2. **Onboarding:** Fill in some past habits (be creative!)
3. **AI Profile:** Wait 3-5 seconds - see your personalized analysis
4. **Habits:** Wait 2-4 seconds - see your generated habit stack
5. **Check-ins:** Tap habits to complete them
6. **Navigate:** Try all 3 tabs (Home, Insights, Settings)

---

## ✅ What Should Work

- ✅ Sign up and login
- ✅ All 5 onboarding screens
- ✅ AI failure profile generation (uses GPT-4o-mini)
- ✅ Habit stack generation (personalized to your data)
- ✅ Daily check-ins with animations
- ✅ Obstacle logging
- ✅ Streak tracking
- ✅ Settings and sign out
- ❌ Push notifications (only work on real devices)
- ⏸️ Weekly iteration (needs 7 days of check-in data)

---

## 🐛 If Something Breaks

### "Failed to generate profile"

**Check:**
```powershell
# Verify functions are deployed
supabase functions list

# Check logs
supabase functions logs analyze-failure
```

**Fix:**
```powershell
# Redeploy functions
.\scripts\deploy-functions.ps1
```

### "OpenAI API error"

**Check:**
- Is your API key correct in `.env`?
- Does it start with `sk-proj-` or `sk-`?
- Do you have credits? Check: https://platform.openai.com/usage

**Fix:**
```powershell
# Update the secret
supabase secrets set OPENAI_API_KEY="your_actual_key"
```

### "Database error"

**Check:**
```powershell
# Verify you're linked
supabase status
```

**Fix:**
```powershell
# Rerun migrations
supabase db push
```

---

## 💰 Testing Costs

**OpenAI API (per test user):**
- Profile: $0.0025
- Habits: $0.0003
- **Total: ~$0.003**

**10 test runs = $0.03** 💸

Very cheap for testing!

---

## 📸 What to Look For

### Good Signs ✅
- Profile has 2-3 specific patterns (not generic)
- Insights reference YOUR actual data
- Habits are tiny (≤2 minutes)
- Rationale explains WHY this habit for YOU
- Check-ins update immediately
- Animations play smoothly

### Red Flags ❌
- Generic advice ("be more consistent")
- Habits are too big (>5 minutes)
- No connection to your failure patterns
- Check-ins don't save
- App crashes

---

## 🎯 Success Criteria

**HabitDx is working if:**
1. ✅ You can complete onboarding
2. ✅ AI generates a personalized profile
3. ✅ Habits feel relevant to YOUR data
4. ✅ Check-ins save and persist
5. ✅ Navigation works smoothly

**If all 5 work:** 🎉 **MVP is production-ready!**

---

## 📝 After Testing

Please note:
1. Any bugs you find
2. Features that feel confusing
3. AI responses that seem generic
4. Anything that crashes

Then we can fix before app store submission!

---

## ⏭️ Next Steps After Testing

Once testing is complete:

1. **Document results** - What worked, what didn't
2. **Share feedback** - Any improvements needed?
3. **Decide on launch** - Ready for app stores?

---

## 🚀 Quick Commands Reference

```powershell
# Start development server
npm start

# Deploy Edge Functions
.\scripts\deploy-functions.ps1

# Run migrations
supabase db push

# Check function logs
supabase functions logs analyze-failure

# View secrets
supabase secrets list

# Redeploy after changes
supabase functions deploy analyze-failure --no-verify-jwt
```

---

## 📞 Having Issues?

Check the full **TESTING_GUIDE.md** for detailed troubleshooting.

---

**Ready to test? Let's go!** 🚀

```powershell
npm start
```

Then press `w` for web browser testing!
