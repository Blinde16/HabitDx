# HabitDx - End-to-End Testing Guide

**Date:** February 16, 2026  
**Version:** 1.0.0  
**Purpose:** Manual testing guide for complete user journey

---

## 🧪 Complete User Journey Test

This guide walks through testing the entire HabitDx experience from signup to weekly iteration.

### Prerequisites
- [ ] Development environment running (`npm start`)
- [ ] Supabase project accessible
- [ ] OpenAI API key configured
- [ ] Physical device OR simulator (notifications require real device)

---

## Test Scenario: New User Complete Journey

**Estimated Time:** 15-20 minutes  
**Tester:** _________________  
**Date:** _________________

---

### Part 1: Authentication & Onboarding (5 minutes)

#### Step 1: Sign Up
1. [ ] Open app
2. [ ] Tap "Sign Up"
3. [ ] Enter email: test@habitdx.com
4. [ ] Enter password: Test123!
5. [ ] Tap "Create Account"
6. [ ] **Expected:** Navigate to welcome screen

#### Step 2: Welcome Screen
1. [ ] Read welcome message
2. [ ] Tap "Get Started"
3. [ ] **Expected:** Navigate to Past Failures screen

#### Step 3: Past Failures
1. [ ] Select 2-3 past habits (e.g., Exercise, Meditation)
2. [ ] Type in "Why did these fail?" field:
   ```
   "I always started too big and gave up after a week. No time in mornings, too tired at night."
   ```
3. [ ] Character counter shows count
4. [ ] Tap "Next"
5. [ ] **Expected:** Navigate to Constraints screen

#### Step 4: Constraints
1. [ ] Select energy pattern: "Morning"
2. [ ] Select schedule: "9-5 Job"
3. [ ] Select obstacles: "Lack of time", "Forgetfulness"
4. [ ] Tap "Next"
5. [ ] **Expected:** Navigate to Goals screen

#### Step 5: Goals
1. [ ] Select 2 goals (e.g., "Health & Fitness", "Mental Wellness")
2. [ ] Type in "Why does this matter?" field:
   ```
   "I want more energy and better focus for my work and family"
   ```
3. [ ] Tap "Next"
4. [ ] **Expected:** Navigate to Confirmation screen

#### Step 6: Confirmation
1. [ ] Review timeline preview
2. [ ] Tap "Analyze My Data"
3. [ ] **Expected:** Loading indicator, then navigate to Failure Profile screen
4. [ ] **Timing:** Should take 3-5 seconds

---

### Part 2: AI-Generated Profile & Habits (3 minutes)

#### Step 7: Failure Profile
1. [ ] Review failure patterns section
2. [ ] **Verify:** At least 2-3 patterns listed
3. [ ] **Verify:** Each pattern has name and description
4. [ ] Review root causes
5. [ ] Review personality insights
6. [ ] Scroll to bottom
7. [ ] Tap "Continue to Habits"
8. [ ] **Expected:** Generate habits (3-5 seconds), then navigate to Habits screen

#### Step 8: Habit Stack
1. [ ] **Verify:** 1-3 habits displayed
2. [ ] For each habit, verify:
   - [ ] Habit name present
   - [ ] Tiny version (≤2 minutes)
   - [ ] Anchor statement (After I...)
   - [ ] Celebration text
   - [ ] Rationale links to failure pattern
   - [ ] Schedule shows days
   - [ ] Reminder time present
3. [ ] Read stack rationale at bottom
4. [ ] Tap "Start Tracking"
5. [ ] **Expected:** Navigate to Notification Permission screen

#### Step 9: Notification Permission
1. [ ] Read notification benefits
2. [ ] Tap "Enable Notifications"
3. [ ] **Expected:** System permission dialog
4. [ ] Tap "Allow"
5. [ ] **Expected:** Navigate to Home screen (tabs)

---

### Part 3: Daily Check-in Experience (3 minutes)

#### Step 10: Home Screen
1. [ ] **Verify:** Today's date displayed
2. [ ] **Verify:** Habit cards show for today
3. [ ] **Verify:** Completion count shows (e.g., "0 of 3 completed")
4. [ ] **Verify:** Each card shows:
   - [ ] Habit name
   - [ ] Tiny version
   - [ ] Celebration text
   - [ ] Streak indicator or "Don't Miss Twice"
   - [ ] Checkbox or status

#### Step 11: Check In First Habit
1. [ ] Tap on first habit card
2. [ ] **Expected:** 
   - [ ] Checkmark animation
   - [ ] Success animation displays
   - [ ] Haptic feedback (on device)
   - [ ] Card state changes to "completed"
   - [ ] Completion count updates
3. [ ] Wait for animation to finish

#### Step 12: Check In Second Habit
1. [ ] Tap on second habit card
2. [ ] **Verify:** Same success behavior
3. [ ] **Verify:** Completion count now shows "2 of 3"

#### Step 13: Undo Check-in
1. [ ] Tap on completed habit
2. [ ] **Expected:** Alert asking to undo
3. [ ] Tap "Undo"
4. [ ] **Verify:** Card returns to unchecked state
5. [ ] **Verify:** Completion count decreases

#### Step 14: Skip Habit with Obstacle
1. [ ] Long-press on a habit card (or use skip button if visible)
2. [ ] **Expected:** Obstacle bottom sheet appears
3. [ ] Select obstacle: "No time"
4. [ ] Optionally add note
5. [ ] Tap "Save"
6. [ ] **Verify:** Card shows as skipped/logged

#### Step 15: Refresh Data
1. [ ] Pull down on screen to refresh
2. [ ] **Expected:** Loading indicator, then data reloads
3. [ ] **Verify:** All check-in states persist

---

### Part 4: Navigation & Insights (2 minutes)

#### Step 16: Insights Tab
1. [ ] Tap "Insights" tab at bottom
2. [ ] **Verify:** Empty state or "Generate Insight" button
3. [ ] **Expected:** Message explaining weekly insights
4. [ ] **Note:** Can't generate insight without 7 days of data
5. [ ] Read explanation of how insights work

#### Step 17: Settings Tab
1. [ ] Tap "Settings" tab at bottom
2. [ ] **Verify:** User email displayed
3. [ ] **Verify:** Notifications section present
4. [ ] Toggle notifications off
5. [ ] **Expected:** Toggle animates, no errors
6. [ ] Toggle notifications back on

#### Step 18: Test Notification
1. [ ] Tap "Test Notification"
2. [ ] **Expected:** Alert "Check your notifications!"
3. [ ] Check notifications tray
4. [ ] **Verify:** Test notification received
5. [ ] Tap notification
6. [ ] **Expected:** App opens

---

### Part 5: Weekly Iteration (Simulated Test - 3 minutes)

**Note:** This requires 7 days of data. For testing, you can manually create habit logs in the database OR wait 7 days.

#### Step 19: Generate Weekly Insight (If Data Exists)
1. [ ] Go to Insights tab
2. [ ] Tap "Generate This Week's Insight"
3. [ ] **Expected:** Loading indicator (4-6 seconds)
4. [ ] **Expected:** Insight screen appears

#### Step 20: Review Insight
1. [ ] **Verify:** Completion stats show percentage
2. [ ] **Verify:** Per-habit breakdown present
3. [ ] **Verify:** Patterns detected section (if any)
4. [ ] **Verify:** AI insights paragraph
5. [ ] **Verify:** Adjustment recommendation (if applicable)

#### Step 21: Accept Adjustment (If Recommended)
1. [ ] Read adjustment recommendation
2. [ ] **Verify:** Shows current vs. suggested value
3. [ ] **Verify:** Rationale explains why
4. [ ] Tap "Apply This Adjustment"
5. [ ] **Expected:** Confirmation alert
6. [ ] Tap "Apply"
7. [ ] **Expected:** Success message
8. [ ] Go to Home tab
9. [ ] **Verify:** Habit updated with new value

---

### Part 6: Sign Out & Sign Back In (1 minute)

#### Step 22: Sign Out
1. [ ] Go to Settings tab
2. [ ] Scroll to bottom
3. [ ] Tap "Sign Out"
4. [ ] **Expected:** Confirmation alert
5. [ ] Tap "Sign Out"
6. [ ] **Expected:** Navigate to login screen

#### Step 23: Sign Back In
1. [ ] Enter same email: test@habitdx.com
2. [ ] Enter same password: Test123!
3. [ ] Tap "Sign In"
4. [ ] **Expected:** Navigate to Home screen
5. [ ] **Verify:** All previous data still present
6. [ ] **Verify:** Check-in states preserved

---

## 🐛 Common Issues & Solutions

### Issue: AI Generation Fails
**Symptoms:** Error message, no profile/habits generated  
**Solutions:**
- Check OpenAI API key is valid
- Check internet connection
- Check Supabase Edge Function logs
- Verify environment variables

### Issue: Notifications Don't Deliver
**Symptoms:** No notifications received  
**Solutions:**
- Must use physical device (not simulator)
- Check notification permissions granted
- Verify Expo push token generated
- Check notification scheduled correctly

### Issue: Check-in Doesn't Save
**Symptoms:** Check-in reverts on refresh  
**Solutions:**
- Check internet connection
- Check Supabase connection
- Verify RLS policies allow inserts
- Check browser console for errors

### Issue: Weekly Iteration Won't Generate
**Symptoms:** Error or "Not enough data"  
**Solutions:**
- Need at least 5 check-ins in past 7 days
- Check Edge Function logs
- Verify OpenAI API key works
- Check completion stats calculation

---

## ✅ Test Completion Checklist

### Critical Paths
- [ ] Sign up flow works
- [ ] Onboarding completes successfully
- [ ] Failure profile generates with meaningful content
- [ ] Habit stack generates with proper structure
- [ ] Check-in updates immediately and persists
- [ ] Notifications can be enabled
- [ ] Settings allow sign out
- [ ] Sign in restores previous state

### Edge Cases Tested
- [ ] Undo check-in works
- [ ] Refresh preserves data
- [ ] Navigation between tabs works
- [ ] No crashes encountered
- [ ] All loading states display
- [ ] All error messages are user-friendly

### Performance
- [ ] App feels responsive
- [ ] No lag during interactions
- [ ] Animations run smoothly
- [ ] API calls complete in reasonable time

---

## 📊 Test Results

**Tester:** _________________  
**Date:** _________________  
**Duration:** _______ minutes  
**Issues Found:** _________________  
**Status:** [ ] PASS [ ] FAIL  

**Notes:**
_______________________________________________
_______________________________________________
_______________________________________________

---

## 🚀 Ready for Production?

If all tests pass:
- ✅ Critical paths work
- ✅ No crashes
- ✅ Data persists correctly
- ✅ Performance is acceptable
- ✅ UI is polished

**Then:** ✅ **READY FOR PRODUCTION!**

---

## 📞 Report Issues

Found a bug? Report it:
- **GitHub Issues:** https://github.com/Blinde16/HabitDx/issues
- **Format:** [BUG] Brief description
- **Include:** Steps to reproduce, expected vs actual behavior, screenshots

---

**Testing Complete!** 🎉

If all tests passed, HabitDx is ready to help people build sustainable habits!
