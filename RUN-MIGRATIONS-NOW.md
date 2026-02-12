# 🚨 RUN MIGRATIONS NOW

**CRITICAL:** The database migrations must be run before testing the app!

---

## Quick Start (5 minutes)

### Step 1: Open Supabase Dashboard

1. Go to: https://supabase.com/dashboard
2. Select project: `wfslsrknguculwuplshq`
3. Click **"SQL Editor"** in the left sidebar

### Step 2: Run the Migration

1. Click **"New Query"**
2. Open this file: `supabase/migrations/00_run_all_migrations.sql`
3. **Copy the ENTIRE contents** (it's a big file - 400+ lines)
4. **Paste** into the SQL Editor
5. Click **"Run"** (or press Cmd/Ctrl + Enter)

### Step 3: Verify Success

You should see: **"Success. No rows returned"**

If you see errors, read them carefully and let me know.

### Step 4: Verify Tables Created

1. In Supabase Dashboard, click **"Table Editor"**
2. You should see these 6 new tables:
   - ✅ `user_profiles`
   - ✅ `habit_failure_profiles`
   - ✅ `habit_stacks`
   - ✅ `habits`
   - ✅ `habit_logs`
   - ✅ `weekly_iterations`

### Step 5: Verify RLS Enabled

1. Click on any table (e.g., `user_profiles`)
2. Click the **"Policies"** tab
3. You should see:
   - 🔒 RLS enabled
   - 📋 Multiple policies listed

---

## What This Migration Does

This consolidated migration file:

1. **Creates 6 tables** for your app's data
2. **Sets up relationships** between tables (foreign keys)
3. **Creates indexes** for fast queries
4. **Enables Row Level Security** so users can only see their own data
5. **Creates 6 database functions** for automation
6. **Sets up 3 triggers** for auto-updating timestamps and profiles
7. **Creates 20+ RLS policies** for data security

---

## After Migration

Once migrations are complete:

1. ✅ Mark this task done
2. 📱 Start the app: `npm start`
3. 🧪 Follow `MANUAL-TESTING-GUIDE.md`
4. 🐛 Report any bugs you find

---

## If You Get Errors

### Error: "relation already exists"

This means you've run the migration before. That's okay! The migration uses `IF NOT EXISTS` and `DROP POLICY IF EXISTS`, so it's safe to run multiple times.

### Error: "permission denied"

Make sure you're logged into the correct Supabase project and have admin access.

### Error: "syntax error"

Make sure you copied the ENTIRE file contents. The file is 400+ lines, so scroll all the way to the bottom before copying.

---

## Alternative: Run Individual Migrations

If you prefer to run migrations one at a time (for debugging):

1. Run in this order:
   - `20260212000001_create_user_profiles.sql`
   - `20260212000002_create_habit_failure_profiles.sql`
   - `20260212000003_create_habit_stacks.sql`
   - `20260212000004_create_habits.sql`
   - `20260212000005_create_habit_logs.sql`
   - `20260212000006_create_weekly_iterations.sql`
   - `20260212000007_create_functions_and_triggers.sql`
   - `20260212000008_create_rls_policies.sql`

2. Run each file in Supabase SQL Editor
3. Verify no errors before moving to next

---

## Verification Queries

After running the migration, you can verify everything worked by running these queries in SQL Editor:

### Check all tables exist:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'user_profiles',
    'habit_failure_profiles',
    'habit_stacks',
    'habits',
    'habit_logs',
    'weekly_iterations'
  )
ORDER BY table_name;
```

**Expected:** 6 rows returned

### Check RLS is enabled:

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'user_profiles',
    'habit_failure_profiles',
    'habit_stacks',
    'habits',
    'habit_logs',
    'weekly_iterations'
  );
```

**Expected:** 6 rows with `rowsecurity = true`

### Check policies exist:

```sql
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Expected:** 20+ rows (multiple policies per table)

---

## ✅ Checklist

- [ ] Opened Supabase Dashboard
- [ ] Navigated to SQL Editor
- [ ] Copied entire `00_run_all_migrations.sql` file
- [ ] Pasted into SQL Editor
- [ ] Clicked "Run"
- [ ] Saw "Success" message
- [ ] Verified 6 tables exist in Table Editor
- [ ] Verified RLS enabled on all tables
- [ ] Ran verification queries (optional)
- [ ] Ready to test the app!

---

## 🎉 Once Complete

**Delete this file** - it's a one-time task. The migrations are now in your database and don't need to be run again (unless you reset your database).

Then move on to: `MANUAL-TESTING-GUIDE.md`
