# Functional Issues — Code-Level Findings

**Date:** April 2026  
**Method:** Static code review of all major source files  
**Scope:** Logic bugs, state management, edge cases, configuration dependencies

---

## Critical Issues

### F-001: Settings page exposes unconfigured environment variables
**File:** `src/app/(tabs)/settings.tsx`  
**Lines:** 207-265 (beta feedback section), 278-307 (privacy/terms), 316-328 (support email)  
**Behavior:** When env vars are not set, tapping Privacy Policy shows: "Privacy Policy Not Configured — Add EXPO_PUBLIC_PRIVACY_POLICY_URL after you publish the policy." Similar alerts for feedback URL, community URL, exit survey URL, terms URL, and support email. The support email subtitle shows raw text "Configure EXPO_PUBLIC_SUPPORT_EMAIL."  
**Impact:** Destroys user trust. Looks like broken/unfinished software. Critical demo risk.  
**Fix:** Hide items when env vars are not configured, OR show generic "Coming soon" placeholder.  
**Effort:** Low

### F-002: "Skip for now" in onboarding calls signOut()
**File:** `src/components/onboarding/OnboardingAiChat.tsx:130-135`  
**Behavior:** The "Skip for now" button in the AI chat onboarding signs the user out completely and redirects to login.  
**Impact:** Users who want to explore the app without completing onboarding are logged out. Confusing and looks like a bug.  
**Fix:** Navigate to home screen (empty state) instead of signing out, or remove the button.  
**Effort:** Low

### F-003: Auto-missed habit detection based on reminder time
**File:** `src/stores/checkinStore.ts:97-107`  
**Behavior:** If current time is past the habit's `reminder_time` and the habit hasn't been checked in, it's marked as `missed`. This means a habit scheduled for 7 AM shows as "missed" if a user opens the app at 2 PM — even though the user may not have opened the app yet.  
**Impact:** Punishes users who check in later in the day. Especially hostile to shift workers, busy parents, and anyone with non-standard schedules.  
**Fix:** Only mark as "missed" at end of day (11:59 PM) or on next-day data load. Remove the time-based auto-miss logic.  
**Effort:** Medium

---

## High-Severity Issues

### F-004: Undo check-in doesn't truly delete the record
**File:** `src/stores/checkinStore.ts:164-193`  
**Lines:** 183-185 — comment says "Note: HabitService would need deleteCheckIn method"  
**Behavior:** Undo logs a new check-in with `completed: false` instead of deleting the original. This means the database accumulates false completion records.  
**Impact:** Data integrity issue. Could skew weekly insights and completion stats.  
**Fix:** Implement `deleteCheckIn` method in HabitService and call it for undo.  
**Effort:** Medium

### F-005: Streak calculation doesn't account for non-scheduled days
**File:** `src/stores/checkinStore.ts:254-291`  
**Behavior:** `calculateStreak()` iterates backwards day-by-day and breaks the streak on any day without a completed log — even if the habit wasn't scheduled that day (e.g., weekday-only habits break streak over weekends).  
**Impact:** False streak resets for habits not scheduled every day. Undermines the reward system.  
**Fix:** Cross-reference `habit.days_of_week` and skip non-scheduled days in the streak calculation.  
**Effort:** Medium

### F-006: Console.log statements in production code
**File:** `src/app/(onboarding)/confirmation.tsx:24-27`  
**Behavior:** `console.log('[Confirmation] Starting submission...')` and `console.log('[Confirmation] Onboarding data:', JSON.stringify(data))` output user data to browser console.  
**Impact:** Visible in browser dev tools during demo. Leaks user data structure.  
**Fix:** Remove or replace with structured logger calls.  
**Effort:** Trivial

### F-007: Legacy welcome.tsx shows loading flash
**File:** `src/app/(onboarding)/welcome.tsx`  
**Behavior:** Shows "Opening onboarding..." with a spinner before redirecting to `/chat`. If someone navigates here (deep link, back button), they see a brief loading state.  
**Impact:** Minor but unprofessional during demo.  
**Fix:** Make the redirect instant or remove this route entirely.  
**Effort:** Low

---

## Medium-Severity Issues

### F-008: Insights require 5+ check-ins — no progressive disclosure
**File:** `src/app/(tabs)/insights.tsx:116-199`  
**Behavior:** New users see an empty Insights screen with "You need at least 5 check-ins to generate insights." No estimated timeline or context for when this becomes available.  
**Impact:** Underwhelming for new users. Dead-end tab for first-week users.  
**Fix:** Show estimated time to unlock ("Check in 3 more times to unlock your first insight") or hide the tab until unlocked.  
**Effort:** Low

### F-009: Habit generation doesn't adapt to shift work
**File:** Supabase Edge Function (not in local code) — inferred from behavior  
**Behavior:** Even when "Shift work" is selected as schedule type, the AI may generate habits with morning-centric timing.  
**Impact:** Diane persona walkthrough showed habits scheduled for 7 AM for a night-shift worker.  
**Fix:** Include stronger schedule constraints in the AI prompt for habit generation.  
**Effort:** Medium (Edge Function change)

### F-010: No individual habit editing
**File:** `src/app/(onboarding)/habits.tsx`  
**Behavior:** Users can view their habits and "Regenerate Habits" (which replaces the entire stack) but cannot edit individual habit names, anchors, celebration text, reminder times, or scheduled days.  
**Impact:** Power users can't customize. Regeneration is destructive — users lose habits they liked.  
**Fix:** Add per-habit edit form (new screen or inline editing).  
**Effort:** High

---

## Configuration Dependencies

These features break or show embarrassing messages when env vars are not set:

| Feature | Env Var | Behavior When Missing |
|---------|---------|----------------------|
| Beta Feedback link | `EXPO_PUBLIC_BETA_FEEDBACK_URL` | Alert: "Feedback Form Not Configured" |
| Beta Community link | `EXPO_PUBLIC_BETA_COMMUNITY_URL` | Alert: "Community Link Not Configured" |
| Exit Survey link | `EXPO_PUBLIC_BETA_EXIT_SURVEY_URL` | Alert: "Exit Survey Not Configured" |
| Privacy Policy link | `EXPO_PUBLIC_PRIVACY_POLICY_URL` | Alert: "Privacy Policy Not Configured" |
| Terms of Service link | `EXPO_PUBLIC_TERMS_URL` | Alert: "Terms Not Configured" |
| Support Email | `EXPO_PUBLIC_SUPPORT_EMAIL` | Shows raw "Configure EXPO_PUBLIC_SUPPORT_EMAIL" as subtitle text |
| Supabase | `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` | App completely non-functional |
| OpenAI (via Edge Functions) | `OPENAI_API_KEY` (server-side) | AI features fail with errors |
