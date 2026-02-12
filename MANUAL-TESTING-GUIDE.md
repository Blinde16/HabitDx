# Manual Testing Guide - Phases 2-4

**Date:** February 12, 2026  
**Status:** Ready for Manual Testing  
**Automated Tests:** ✅ 42/42 Passed

---

## Prerequisites

### 1. Run Database Migrations

**CRITICAL:** You must run the database migrations before testing!

#### Option A: Supabase Dashboard (Recommended)

1. Go to https://supabase.com/dashboard
2. Select your project: `wfslsrknguculwuplshq`
3. Click "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy the entire contents of `supabase/migrations/00_run_all_migrations.sql`
6. Paste into the SQL editor
7. Click "Run" (or press Cmd/Ctrl + Enter)
8. Verify success - you should see "Success. No rows returned"
9. Scroll to bottom of the file and run the verification queries separately

#### Option B: Individual Migration Files

If you prefer to run migrations one at a time:

1. Go to Supabase Dashboard → SQL Editor
2. Run each file in order:
   - `20260212000001_create_user_profiles.sql`
   - `20260212000002_create_habit_failure_profiles.sql`
   - `20260212000003_create_habit_stacks.sql`
   - `20260212000004_create_habits.sql`
   - `20260212000005_create_habit_logs.sql`
   - `20260212000006_create_weekly_iterations.sql`
   - `20260212000007_create_functions_and_triggers.sql`
   - `20260212000008_create_rls_policies.sql`

#### Verification

After running migrations, verify in Supabase Dashboard:

1. Go to "Table Editor"
2. You should see these tables:
   - `user_profiles`
   - `habit_failure_profiles`
   - `habit_stacks`
   - `habits`
   - `habit_logs`
   - `weekly_iterations`

3. Click on any table → "Policies" tab
4. Verify RLS is enabled and policies exist

### 2. Start the App

```bash
# Kill any existing Expo processes
# Then start fresh
npm start
```

Press `w` for web, `i` for iOS simulator, or `a` for Android emulator.

---

## Phase 2: Authentication Testing

### Test 1: User Sign Up

**Steps:**

1. Open the app - should land on login screen
2. Click "Create Account"
3. Fill in:
   - Name: "Test User"
   - Email: "test@example.com"
   - Password: "SecurePass123!"
4. Click "Create Account"

**Expected Results:**

- ✅ Loading spinner appears
- ✅ No errors shown
- ✅ Redirects to onboarding welcome screen
- ✅ Check Supabase Dashboard → Authentication → Users
  - New user should appear
- ✅ Check Supabase Dashboard → Table Editor → user_profiles
  - Profile auto-created with full_name = "Test User"

**Validation Checks:**

- [ ] Email validation works (try "invalid-email")
- [ ] Password strength indicator shows
- [ ] Password too short shows error (< 8 chars)
- [ ] Duplicate email shows error

---

### Test 2: User Sign In

**Steps:**

1. Sign out if signed in
2. On login screen, enter:
   - Email: "test@example.com"
   - Password: "SecurePass123!"
3. Click "Sign In"

**Expected Results:**

- ✅ Loading spinner appears
- ✅ No errors shown
- ✅ Redirects to home screen
- ✅ Home screen shows user email
- ✅ "View Profile" link visible

**Validation Checks:**

- [ ] Wrong password shows error
- [ ] Non-existent email shows error
- [ ] Empty fields show validation errors

---

### Test 3: Password Reset

**Steps:**

1. On login screen, click "Forgot Password?"
2. Enter email: "test@example.com"
3. Click "Send Reset Link"
4. Check email (or Supabase Dashboard → Authentication → Email Templates)
5. Click reset link in email
6. Should open reset-password screen
7. Enter new password: "NewSecurePass123!"
8. Click "Update Password"

**Expected Results:**

- ✅ Success message after sending email
- ✅ Reset link received
- ✅ Can set new password
- ✅ Redirects to login after password reset
- ✅ Can sign in with new password

---

### Test 4: Google OAuth (Optional - requires setup)

**Note:** This requires configuring Google OAuth in Supabase Dashboard.

**Steps:**

1. On login or signup screen, click "Continue with Google"
2. Complete Google sign-in flow
3. Should redirect back to app

**Expected Results:**

- ✅ OAuth flow completes
- ✅ User created in Supabase
- ✅ Profile auto-created
- ✅ Redirects to onboarding or home

---

### Test 5: Session Persistence

**Steps:**

1. Sign in to the app
2. Close the app completely
3. Reopen the app

**Expected Results:**

- ✅ Still signed in
- ✅ No need to sign in again
- ✅ Home screen loads immediately

---

### Test 6: Protected Routes

**Steps:**

1. Sign out
2. Try to access protected routes by manually navigating

**Expected Results:**

- ✅ Redirects to login when not authenticated
- ✅ Cannot access home, profile, or onboarding without auth

---

### Test 7: Sign Out

**Steps:**

1. Sign in
2. Go to home screen
3. Click "Sign Out"

**Expected Results:**

- ✅ Redirects to login screen
- ✅ Cannot go back to protected routes
- ✅ Session cleared

---

## Phase 3: Database & Profile Testing

### Test 8: View Profile

**Steps:**

1. Sign in
2. Click "View Profile"

**Expected Results:**

- ✅ Profile screen loads
- ✅ Shows user email
- ✅ Shows user ID
- ✅ Shows "Member since" date
- ✅ Shows full name
- ✅ Shows timezone
- ✅ Shows notification toggle

---

### Test 9: Edit Profile

**Steps:**

1. On profile screen, click "Edit"
2. Change full name to "Updated Name"
3. Change timezone to "America/Los_Angeles"
4. Toggle notifications off
5. Click "Save Changes"

**Expected Results:**

- ✅ Loading state during save
- ✅ Success message appears
- ✅ Changes reflected immediately
- ✅ Check Supabase Dashboard → user_profiles
  - full_name = "Updated Name"
  - timezone = "America/Los_Angeles"
  - notification_enabled = false
  - updated_at timestamp updated

---

### Test 10: Profile Edit Validation

**Steps:**

1. Click "Edit"
2. Clear full name field
3. Try to save

**Expected Results:**

- ✅ Validation error shown
- ✅ Cannot save with empty name

---

### Test 11: Row Level Security (RLS)

**This requires 2 test users!**

**Steps:**

1. Create User A: "usera@test.com"
2. Create User B: "userb@test.com"
3. Sign in as User A
4. Note User A's profile data
5. Sign out
6. Sign in as User B
7. Try to view User A's data

**Expected Results:**

- ✅ User B cannot see User A's profile
- ✅ User B cannot see User A's habits (once created)
- ✅ User B cannot see User A's logs (once created)

**Manual Verification in Supabase:**

1. Go to SQL Editor
2. Run query as User A:

```sql
SELECT * FROM user_profiles;
-- Should only return User A's profile
```

3. Try to query User B's data:

```sql
SELECT * FROM user_profiles WHERE id = '<user-b-id>';
-- Should return empty (RLS blocks it)
```

---

## Phase 4: Onboarding Testing

### Test 12: Onboarding Welcome Screen

**Steps:**

1. Create a new user account
2. After signup, should land on welcome screen

**Expected Results:**

- ✅ Welcome screen shows
- ✅ Progress indicator shows 1/5
- ✅ "Get Started" button visible
- ✅ "Skip" button visible
- ✅ Clicking "Get Started" goes to past failures screen

---

### Test 13: Past Failures Screen

**Steps:**

1. On past failures screen (2/5)
2. Select 2-3 habit chips (e.g., "Exercise", "Meditation")
3. Enter description: "I always started strong but lost motivation after 2 weeks"
4. Click "Next"

**Expected Results:**

- ✅ Progress indicator shows 2/5
- ✅ Multiple chips can be selected
- ✅ Character counter works (20-500 chars)
- ✅ "Next" disabled until valid input
- ✅ "Back" button works
- ✅ Clicking "Next" goes to constraints screen

**Validation Checks:**

- [ ] Cannot proceed with no habits selected
- [ ] Cannot proceed with description < 20 chars
- [ ] Cannot proceed with description > 500 chars
- [ ] Character counter updates in real-time

---

### Test 14: Constraints Screen

**Steps:**

1. On constraints screen (3/5)
2. Select energy time: "Morning"
3. Select schedule types: "Consistent" and "Busy"
4. Select obstacles: "Time" and "Motivation"
5. Click "Next"

**Expected Results:**

- ✅ Progress indicator shows 3/5
- ✅ Can select one energy time
- ✅ Can select multiple schedule types
- ✅ Can select multiple obstacles
- ✅ "Next" disabled until all selected
- ✅ "Back" returns to past failures screen
- ✅ Clicking "Next" goes to goals screen

---

### Test 15: Goals Screen

**Steps:**

1. On goals screen (4/5)
2. Select 3 goals (e.g., "Health", "Productivity", "Mindfulness")
3. Enter motivation: "I want to build sustainable habits that stick"
4. Click "Next"

**Expected Results:**

- ✅ Progress indicator shows 4/5
- ✅ Can select up to 3 goals
- ✅ Cannot select more than 3 goals
- ✅ Character counter works (20-300 chars)
- ✅ "Next" disabled until valid input
- ✅ "Back" returns to constraints screen
- ✅ Clicking "Next" goes to confirmation screen

**Validation Checks:**

- [ ] Cannot proceed with 0 goals
- [ ] Cannot select more than 3 goals
- [ ] Cannot proceed with motivation < 20 chars
- [ ] Cannot proceed with motivation > 300 chars

---

### Test 16: Confirmation Screen

**Steps:**

1. On confirmation screen (5/5)
2. Review timeline
3. Toggle notifications on
4. Click "Analyze My Data"

**Expected Results:**

- ✅ Progress indicator shows 5/5
- ✅ Timeline displays correctly
- ✅ Notification toggle works
- ✅ Loading state during submission
- ✅ Redirects to home screen after success
- ✅ Check Supabase Dashboard → user_profiles:
  - past_failures array populated
  - constraints JSONB populated
  - goals array populated
  - onboarding_completed = true
  - notification_enabled = true/false based on toggle

---

### Test 17: Onboarding Progress Persistence

**Steps:**

1. Start onboarding
2. Fill out past failures screen
3. Go to constraints screen
4. Close the app completely
5. Reopen the app

**Expected Results:**

- ✅ Onboarding resumes at constraints screen
- ✅ Past failures data preserved
- ✅ Progress indicator correct

---

### Test 18: Onboarding Skip

**Steps:**

1. Start onboarding
2. Click "Skip" on welcome screen

**Expected Results:**

- ✅ Shows confirmation dialog
- ✅ Confirms skip action
- ✅ Signs out user
- ✅ Returns to login screen

---

### Test 19: Onboarding Cannot Be Accessed After Completion

**Steps:**

1. Complete onboarding
2. Try to navigate to onboarding screens

**Expected Results:**

- ✅ Redirects to home screen
- ✅ Cannot access onboarding routes
- ✅ onboarding_completed flag prevents re-entry

---

## Edge Cases & Error Handling

### Test 20: Network Offline During Sign Up

**Steps:**

1. Disconnect from internet
2. Try to sign up

**Expected Results:**

- ✅ Error message shown
- ✅ User-friendly error (not technical)
- ✅ Can retry after reconnecting

---

### Test 21: Network Offline During Onboarding Submit

**Steps:**

1. Complete onboarding
2. Disconnect from internet
3. Click "Analyze My Data"

**Expected Results:**

- ✅ Error message shown
- ✅ Data preserved locally
- ✅ Can retry after reconnecting

---

### Test 22: Very Long Text Inputs

**Steps:**

1. In onboarding, try to exceed character limits
2. Type 501 characters in past failures description

**Expected Results:**

- ✅ Character counter shows 501/500
- ✅ Input turns red or shows error
- ✅ Cannot proceed

---

### Test 23: Special Characters in Inputs

**Steps:**

1. Use special characters in name: "Test User 👋"
2. Use special characters in password: "P@ssw0rd!#$%"
3. Use emojis in onboarding text

**Expected Results:**

- ✅ Special characters accepted
- ✅ Emojis work
- ✅ Data saved correctly

---

## Database Function Tests

### Test 24: Auto Profile Creation

**Steps:**

1. Create new user via signup
2. Immediately check Supabase Dashboard → user_profiles

**Expected Results:**

- ✅ Profile created automatically
- ✅ full_name = user's name or email
- ✅ created_at and updated_at set
- ✅ Default values applied (timezone, notifications)

---

### Test 25: Updated At Trigger

**Steps:**

1. Edit profile
2. Check updated_at timestamp in Supabase

**Expected Results:**

- ✅ updated_at timestamp changes
- ✅ created_at timestamp unchanged

---

## Performance Tests

### Test 26: App Load Time

**Steps:**

1. Close app
2. Open app
3. Time how long until home screen appears

**Expected Results:**

- ✅ Loads in < 3 seconds
- ✅ No white screen flash
- ✅ Smooth transition

---

### Test 27: Form Responsiveness

**Steps:**

1. Type quickly in onboarding forms
2. Toggle chips rapidly

**Expected Results:**

- ✅ No lag
- ✅ Character counter updates smoothly
- ✅ Chips toggle instantly

---

## Cross-Platform Tests

### Test 28: Web Platform

**Steps:**

1. Run `npm run web`
2. Test all auth flows
3. Test onboarding

**Expected Results:**

- ✅ All features work on web
- ✅ localStorage used instead of SecureStore
- ✅ Styling looks good

---

### Test 29: iOS Platform

**Steps:**

1. Run on iOS simulator or device
2. Test all flows

**Expected Results:**

- ✅ All features work on iOS
- ✅ SecureStore used for session
- ✅ Native feel

---

### Test 30: Android Platform

**Steps:**

1. Run on Android emulator or device
2. Test all flows

**Expected Results:**

- ✅ All features work on Android
- ✅ SecureStore used for session
- ✅ Native feel

---

## Checklist Summary

### Phase 2: Authentication (7 tests)

- [ ] Test 1: User Sign Up
- [ ] Test 2: User Sign In
- [ ] Test 3: Password Reset
- [ ] Test 4: Google OAuth (optional)
- [ ] Test 5: Session Persistence
- [ ] Test 6: Protected Routes
- [ ] Test 7: Sign Out

### Phase 3: Database & Profile (4 tests)

- [ ] Test 8: View Profile
- [ ] Test 9: Edit Profile
- [ ] Test 10: Profile Edit Validation
- [ ] Test 11: Row Level Security

### Phase 4: Onboarding (8 tests)

- [ ] Test 12: Welcome Screen
- [ ] Test 13: Past Failures Screen
- [ ] Test 14: Constraints Screen
- [ ] Test 15: Goals Screen
- [ ] Test 16: Confirmation Screen
- [ ] Test 17: Progress Persistence
- [ ] Test 18: Onboarding Skip
- [ ] Test 19: Cannot Access After Completion

### Edge Cases (4 tests)

- [ ] Test 20: Network Offline During Sign Up
- [ ] Test 21: Network Offline During Onboarding
- [ ] Test 22: Very Long Text Inputs
- [ ] Test 23: Special Characters

### Database Functions (2 tests)

- [ ] Test 24: Auto Profile Creation
- [ ] Test 25: Updated At Trigger

### Performance (2 tests)

- [ ] Test 26: App Load Time
- [ ] Test 27: Form Responsiveness

### Cross-Platform (3 tests)

- [ ] Test 28: Web Platform
- [ ] Test 29: iOS Platform
- [ ] Test 30: Android Platform

---

## Recording Test Results

As you complete each test, mark it with:

- ✅ PASS - Works as expected
- ❌ FAIL - Does not work, needs fixing
- ⚠️ PARTIAL - Works but has issues

Document any failures in `TESTING-STATUS.md` under "Known Issues".

---

## After Testing

Once all tests pass:

1. Update `TESTING-STATUS.md` with results
2. Update phase roadmaps to mark as "Fully Tested"
3. Commit test results
4. Move to Phase 5

If tests fail:

1. Document the failure
2. Create a fix
3. Retest
4. Repeat until all pass
