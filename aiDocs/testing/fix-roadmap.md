# Fix Roadmap — Prioritized Action Plan

**Date:** April 2026  
**Source:** Multi-persona testing findings ([`walkthrough-findings.md`](walkthrough-findings.md), [`cross-persona-synthesis.md`](cross-persona-synthesis.md), [`functional-issues.md`](functional-issues.md), [`ux-critique.md`](ux-critique.md))  
**Structure:** Grouped by priority tier with effort estimates and implementation guidance

**Persona map (for traceability):** **Marcus** — power user / data; **Diane** — shift work, guilt-prone; **Raj** — evaluator / science rigor; **Gloria** — low-tech, accessibility; **Jordan** — career goals, form path; **Tyler** — ADHD, binary tracking / streaks.

---

## Tier 1: Must Fix Before Presentation

These issues will surface during a live demo and damage credibility, or are rated **Critical** in [`cross-persona-synthesis.md`](cross-persona-synthesis.md) for trust and home-screen behavior.

### 1.1 Hide unconfigured Settings items
- **Issue:** Settings shows raw env var names and "Not Configured" alerts when tapping Privacy Policy, Terms, Beta Feedback, Community, Exit Survey, and Support Email
- **Evidence:** Gloria walkthrough (trust destroyed); **Raj** (evaluator persona) — unfinished polish undermines credibility; synthesis "Likely Demo Bottlenecks" #1
- **Files:** `src/app/(tabs)/settings.tsx` — lines 207-265, 278-307, 316-328
- **Fix:** Wrap each settings item in a conditional that hides it when the env var is falsy. OR replace alert text with "Coming soon" placeholder.
- **Implementation:**
  ```
  For each link item, check: if (!appConfig.betaFeedbackUrl) return null;
  For support email subtitle: show "Contact us" instead of the raw env var name
  ```
- **Effort:** Low (30 min)
- **Demo relevant:** YES — critical

### 1.2 Fix "Skip for now" to not sign user out
- **Issue:** "Skip for now" in onboarding chat calls `signOut()` and redirects to login
- **Evidence:** Diane walkthrough (wanted to skip onboarding, not leave); Tyler path if shown; synthesis demo bottleneck #6
- **Files:** `src/components/onboarding/OnboardingAiChat.tsx:130-135`
- **Fix:** Navigate to `/(tabs)/home` instead (empty state will show "No Habits Yet — Complete onboarding"). OR remove the button entirely.
- **Implementation:**
  ```tsx
  // Replace:
  await signOut();
  router.replace('/(auth)/login');
  // With:
  router.replace('/(tabs)/home');
  ```
- **Effort:** Low (15 min)
- **Demo relevant:** YES

### 1.3 Remove console.log from confirmation.tsx
- **Issue:** `console.log` statements output user data to browser dev tools
- **Evidence:** Marcus (inspects devtools); synthesis demo bottleneck #5
- **File:** `src/app/(onboarding)/confirmation.tsx:24-27`
- **Fix:** Delete the `console.log` lines, or replace with `logInfo()` calls
- **Effort:** Trivial (5 min)
- **Demo relevant:** YES

### 1.4 Rename "Failure Profile" to "Habit Profile" (and reduce clinical sting)
- **Issue:** "Failure Profile" creates shame/clinical framing; **"HabitDx" + "Dx"** plus "Failure" reads medical to Gloria; reinforces failure identity for Tyler
- **Evidence:** Diane (shame trigger), Gloria (medical alarm), Tyler (failure identity), Raj (framing vs. science); synthesis Critical pattern on naming
- **Files to update:**
  - `src/app/(onboarding)/failure-profile.tsx` — title text "Your Habit Failure Profile"
  - `src/app/(tabs)/settings.tsx` — "View Failure Profile" link text
  - `src/components/onboarding/OnboardingAiChat.tsx` — if any references
  - `src/lib/failureProfileService.ts` — share message text
  - Any AI prompts in Edge Functions that reference "Failure Profile"
- **Fix:** Replace all user-facing instances of "Failure Profile" with "Habit Profile" or "Pattern Profile." Internal code names (function names, DB tables) can stay for now. **Follow-up (Tier 2 / copy):** soften "Root Causes" / purely diagnostic labels where [`ux-critique.md`](ux-critique.md) flags clinical tone without clinical relationship.
- **Effort:** Low (30 min) for rename; additional copy passes tracked in Tier 4
- **Demo relevant:** YES — evaluators will ask about the naming

### 1.5 Prepare a pre-seeded demo account
- **Issue:** New accounts can't show Insights, have no habit history, show empty states
- **Evidence:** Marcus (Insights gated); synthesis adoption #6 and demo bottleneck #3 — all personas for "hero" features
- **Fix:** Create a Supabase test account with:
  - Completed onboarding
  - Active habit/failure profile output
  - 3 habits with 7+ days of check-in data (mix of completed and missed)
  - At least 1 generated weekly insight
  - Some obstacle logs
- **Effort:** Medium (1 hour — manual data seeding or script)
- **Demo relevant:** YES — required for showing Insights and populated Home

### 1.6 Fix auto-missed detection timing
- **Issue:** Habits marked "missed" if past `reminder_time`, even if the user has not opened the app yet — **red X and "missed" read as punitive**, especially when auto-triggered ([`ux-critique.md`](ux-critique.md) guilt pipeline).
- **Evidence:** **Critical** in synthesis (Diane, Tyler, **Marcus**); Diane shift-work walkthrough; Tyler multi-day miss spiral; F-003
- **File:** `src/stores/checkinStore.ts:97-107`
- **Fix:** Remove the time-based auto-miss. Only mark as "missed" at end of day (11:59 PM) or when the next day's habits load. Treat same-day habits as pending (`not_done`) until end of day or explicit user action.
- **Implementation:**
  ```tsx
  // Remove this block:
  const isPastReminder = now > reminderTime;
  // Replace with:
  const isPastReminder = false; // Always show as not_done until explicitly missed
  ```
  Then add missed-detection logic to `fetchTodaysHabits` for **previous** day habits only.
- **Effort:** Medium (1-2 hours)
- **Demo relevant:** YES — seeded account can hide this, but evaluators asking about "missed" logic still get the real story; **adoption bottleneck #1** in synthesis

---

## Tier 2: Should Fix If Time Allows

Strong persona pull: **Gloria** (discoverability), **Jordan / Raj** (login pitch), **Diane / Tyler** (copy), **Marcus / Tyler** (progress memory + Insights emptiness).

### 2.1 Home screen affordances — tap to complete + long-press for obstacles
- **Issue:** (a) Help text is `text-xs text-gray-400` — fails WCAG contrast, invisible to many users. (b) **Long-press for obstacles is undiscoverable** — synthesis **High** across Gloria, Diane, Raj.
- **Evidence:** Gloria (could not discover tap; never found long-press); [`ux-critique.md`](ux-critique.md) accessibility table
- **Files:** `src/app/(tabs)/home.tsx` (e.g. ~327-329 for hint text); consider first-run coach marks on first habit card
- **Fix options:**
  1. Increase hint text to `text-sm text-gray-600` (minimal)
  2. One-time tooltip or coach mark: **tap** to complete, **long-press** if you could not do it today
  3. Subtle tap / long-press affordance on first incomplete habit (best)
- **Effort:** Low (option 1: 10 min) to Medium (option 3: 1-2 hours)
- **Demo relevant:** YES — presenter knows the gestures; observers and Gloria-like users do not

### 2.2 Add value proposition to login screen
- **Issue:** Login screen has no explanation of what HabitDx does
- **Evidence:** Gloria, **Jordan**, **Raj** — synthesis; [`ux-critique.md`](ux-critique.md) (first impression / login)
- **File:** `src/app/(auth)/login.tsx`
- **Fix:** Add above the form:
  ```
  "Understand why your habits fail. Build ones that stick."
  - AI-powered habit diagnosis
  - Personalized tiny habits
  - Weekly adjustments that adapt to you
  ```
- **Effort:** Low (30 min)
- **Demo relevant:** YES — first thing evaluators see

### 2.3 Soften "Don't miss twice" warning copy
- **Issue:** Current copy feels accusatory when the miss was not a choice (child sick, shift work, executive dysfunction)
- **Evidence:** **Diane**, **Tyler** — High; Marcus/Raj find it motivating — synthesis: needs **context-aware** delivery long-term; short-term soften copy
- **File:** `src/app/(tabs)/home.tsx:306-316`
- **Fix:** Replace:
  ```
  "You missed yesterday. One skip is fine—but two in a row starts a pattern. Let's get back on track today!"
  ```
  With something like:
  ```
  "Welcome back! Yesterday didn't happen — that's okay. Today is a fresh chance. Even the tiny version counts."
  ```
- **Effort:** Low (15 min)
- **Demo relevant:** Partly

### 2.4 Add cumulative progress counter
- **Issue:** Streak resets erase all progress memory. No non-resettable metric.
- **Evidence:** **Tyler**, behavioral review — "total check-ins" survives streak breaks; Marcus (wants trajectory narrative)
- **File:** `src/app/(tabs)/home.tsx` (display) + `src/stores/checkinStore.ts` (data)
- **Fix:** Add "Total check-ins: X" (or similar) in home header alongside completion rate. Calculate from all-time check-in count.
- **Effort:** Medium (1-2 hours)
- **Demo relevant:** YES — shows long-term value

### 2.5 Fix streak calculation for non-scheduled days
- **Issue:** Streaks break on days the habit isn't scheduled (e.g., weekday-only habits break over weekends)
- **Evidence:** F-005; punishes **Marcus**-style tracking and anyone with non-daily habits
- **File:** `src/stores/checkinStore.ts:254-291`
- **Fix:** In `calculateStreak()`, cross-reference `habit.days_of_week` and skip non-scheduled days instead of breaking:
  ```tsx
  // Skip non-scheduled days in the loop instead of breaking
  ```
- **Effort:** Medium (1 hour)
- **Demo relevant:** Partly

### 2.6 Insights tab — progressive disclosure for new users
- **Issue:** New users see a dead-end Insights tab ("need 5 check-ins") with no sense of progress toward unlock
- **Evidence:** **Marcus** (closes app on empty Insights); synthesis adoption #6; F-008
- **File:** `src/app/(tabs)/insights.tsx:116-199`
- **Fix:** Show remaining check-ins to unlock ("3 more check-ins until your first insight") and/or soften empty state; optional: hide tab until partial threshold — product call
- **Effort:** Low (30-45 min)
- **Demo relevant:** Partly — demo account mitigates, but first-run story stays weak without this

---

## Tier 3: Good Post-Presentation Improvements

These address real product gaps but require significant effort or architectural changes.

### 3.1 Individual habit editing
- **Issue:** Users can only regenerate the entire habit stack, not edit individual habits
- **Evidence:** **Marcus** (dealbreaker), **Jordan** (regeneration destroys liked habits), synthesis
- **Fix:** Add edit screen per habit (name, tiny version, anchor, celebration, reminder time, scheduled days)
- **Effort:** High (4-6 hours — new screen + service methods)

### 3.2 Historical trend visualization
- **Issue:** No way to see completion data over time — only today + weekly insight
- **Evidence:** **Marcus** ("where's the trend chart?"); behavioral review
- **Fix:** Add a simple completion-over-time chart (7-day and 30-day views) to Insights or Home
- **Effort:** High (4-6 hours — charting library + data aggregation)

### 3.3 Welcome-back flow after absence
- **Issue:** Users who miss 3+ days return to red X's and warnings with no encouragement
- **Evidence:** **Tyler**, **Diane** — churn; synthesis re-engagement
- **Fix:** Detect absence > 2 days, show "Welcome back!" modal with encouragement and option to reset today fresh
- **Effort:** Medium (2-3 hours)

### 3.4 Graduated difficulty (tiny → small → medium)
- **Issue:** Tiny version never escalates — no growth path
- **Evidence:** **Raj**, **Marcus**; behavioral review
- **Fix:** After 2+ weeks of consistent completion, AI weekly iteration could suggest escalating the habit
- **Effort:** High (Edge Function changes + UI)

### 3.5 Add non-wellness habit options to form path
- **Issue:** HABIT_OPTIONS list is heavily wellness-biased (Exercise, Meditation, Yoga, etc.); **Jordan**'s form path breaks on career goals; Gloria noted walking/water-style goals buried
- **File:** `src/constants/onboardingIntake.ts`
- **Fix:** Add explicit options such as: "Walking / movement," "Hydration," "Career development," "Creative practice," "Financial habits," "Social/networking," "Learning/studying"
- **Effort:** Low (15-30 min)

### 3.6 Implement proper undo (delete check-in)
- **Issue:** Undo logs `completed: false` instead of deleting the record
- **Evidence:** F-004 — skews insights and stats (affects **Raj**-style accuracy expectations)
- **File:** `src/stores/checkinStore.ts:183-185`
- **Fix:** Add `deleteCheckIn` method to HabitService that deletes the day's log
- **Effort:** Medium (1-2 hours)

### 3.7 Habit generation: respect shift work and non-standard schedules
- **Issue:** Even when "Shift work" is selected, AI may return morning-centric reminder times
- **Evidence:** **Diane** walkthrough (7 AM habits for night-shift nurse); F-009
- **Fix:** Tighten Edge Function prompts and structured outputs so schedule type and wake/sleep windows constrain suggested times
- **Effort:** Medium (Edge Function + prompt iteration)

### 3.8 Celebration copy: professional / context-appropriate variants
- **Issue:** Celebrations assume private/physical behaviors ("fist pump") — **Jordan** cringes in office context
- **Evidence:** Jordan walkthrough
- **Fix:** Add celebration style buckets (e.g. professional / low-key / physical) or map celebrations to habit category
- **Effort:** Medium (copy + data model for celebration tone)

### 3.9 Data export (optional)
- **Issue:** No export — **Marcus** expectation for spreadsheets / backup
- **Evidence:** Marcus walkthrough
- **Fix:** CSV or JSON export of habits + check-ins — post-MVP unless demo explicitly promises it
- **Effort:** Medium–High

---

## Tier 4: Product Strategy Questions

These require product decisions, not just code changes.

| Question | Context | When to Decide |
|----------|---------|----------------|
| Should the app explicitly support reduction habits? | Jordan/Tyler — "stop scrolling" can't be tracked with binary check-in | Post-launch, based on user goal data |
| Should onboarding offer a "simple mode" (skip AI, define your own habits)? | Marcus wants control; Gloria/Diane overwhelmed by AI chat | After beta feedback analysis |
| Should there be social/accountability features? | Raj identified SDT relatedness gap; PRD noted as P2 | Post-launch P2 |
| How should the app handle neurodivergent users? | Tyler walkthrough showed ADHD-hostile patterns | Research phase needed |
| Should the weekly cadence be adjustable? | Marcus wants more frequent; evidence says weekly is right | A/B test in production |
| Is the failure-first approach the right default or should it be opt-in? | Strong split between analytical users (love it) and vulnerable users (harmed by it) | Beta feedback + retention data |
| How hard to lean on "Root Causes" / diagnostic copy? | [`ux-critique.md`](ux-critique.md): clinical tone without clinical trust — Diane/Gloria | Pair with Habit Profile rename and user testing |

---

## Implementation Order (Recommended)

If you have **2 hours before presentation:**
1. 1.1 — Hide unconfigured Settings items (30 min)
2. 1.2 — Fix "Skip for now" (15 min)
3. 1.3 — Remove console.logs (5 min)
4. 1.4 — Rename "Failure Profile" strings (30 min)
5. 2.2 — Add login value proposition (30 min)

Steps 1–5 total about **110 minutes**. Tier **1.5** (pre-seeded demo account) is roughly **1 hour on its own** — complete it ahead of demo day or in a separate prep block; it does not fit in the same 2-hour window as 1–5 unless already done.

If you have **4 hours before presentation:**
All of above, plus:
6. **1.5** — Pre-seeded demo account (~1 hr), if not already prepared
7. **1.6** — Fix auto-missed timing (1 hr) — **highest-impact logic fix for Diane/Tyler/Gloria home experience**
8. 2.1 — Home affordances: tap + long-press hints (30 min minimal path; longer if coach marks)
9. 2.3 — Soften "Don't miss twice" copy (15 min)
10. 2.6 — Insights progressive disclosure (30-45 min)

If you have **8 hours before presentation:**
All of above, plus:
11. 2.4 — Cumulative progress counter (1-2 hours)
12. 2.5 — Fix streak calculation (1 hour)
13. 3.5 — Non-wellness + walking/hydration-style options (15-30 min)
14. 3.3 — Welcome-back flow (2 hours)

---
