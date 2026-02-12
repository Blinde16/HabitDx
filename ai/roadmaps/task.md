# HabitDx — Master Task List

> **Core Value Proposition:** Help users understand WHY their habits fail and give them ONE weekly adjustment. Everything else is secondary.
>
> **Guiding Principle:** If the AI doesn't feel like it "gets" the user, nothing else matters.

---

## Pre-Build Checklist

Before writing any code, confirm these are ready:

- [ ] Supabase project created (or local dev instance configured)
- [ ] OpenAI API key obtained
- [ ] Apple Developer account active
- [ ] Google Play Developer account active
- [ ] Design system decision (UI library — e.g. Tamagui, NativeWind, custom?)

> **🔵 DECISION NEEDED:** What UI component library do you want to use? Options:
>
> - **NativeWind** (Tailwind for React Native — fast, familiar if you know Tailwind)
> - **Tamagui** (performant, themeable, cross-platform)
> - **Gluestack UI** (accessible, themeable, Expo-friendly)
> - **Custom** (full control, slower to build)
>
> This affects every screen we build, so we should lock this in first.

---

## Phase 1: Foundation

**Goal:** Technical infrastructure, auth, and empty app shell that navigates correctly.

### 1.1 Project Initialization

- [ ] Initialize Expo project with TypeScript template (`npx create-expo-app`)
- [ ] Configure folder structure per context doc (`src/app`, `src/components`, `src/hooks`, `src/lib`, `src/stores`, `src/types`)
- [ ] Install and configure ESLint + Prettier
- [ ] Set up path aliases (`@/components`, `@/lib`, etc.)
- [ ] Initialize Git repo with `main` and `develop` branches
- [ ] Create `.env.development` with Supabase + OpenAI keys
- [ ] Add `.env` to `.gitignore`

### 1.2 Navigation Shell

- [ ] Install and configure Expo Router (file-based routing)
- [ ] Create root layout (`src/app/_layout.tsx`) with auth gate logic
- [ ] Create `(auth)` route group — login, signup, forgot-password placeholders
- [ ] Create `(onboarding)` route group — 5 screen placeholders
- [ ] Create `(tabs)` route group — home, insights, settings tabs
- [ ] Implement tab bar with icons

### 1.3 Supabase Backend Setup

- [ ] Install `@supabase/supabase-js` and configure client (`src/lib/supabase.ts`)
- [ ] Configure Supabase Auth (email + Google OAuth)
- [ ] Write and run database migration for full schema:
  - `user_profiles`
  - `habit_failure_profiles`
  - `habit_stacks`
  - `habits`
  - `habit_logs`
  - `weekly_iterations`
- [ ] Apply Row Level Security policies (users only access own data)
- [ ] Create indexes per architecture doc
- [ ] Scaffold Edge Function directories (`analyze-failure`, `generate-habits`, `weekly-iteration`)
- [ ] Create `seed.sql` with sample test data

> **🔵 DECISION NEEDED:** Do you already have a Supabase project created, or should I set one up locally with `supabase init`? Also — do you have Google OAuth credentials configured yet, or should we defer Google auth and start with email-only?

### 1.4 Auth Flow

- [ ] Create Zustand auth store (`src/stores/authStore.ts`)
- [ ] Build Login screen (email + password, Google sign-in button)
- [ ] Build Sign Up screen (email + password, Google sign-in button)
- [ ] Build Forgot Password screen (email input → reset link)
- [ ] Implement auth state listener (auto-redirect on login/logout)
- [ ] Handle session persistence (secure token storage)
- [ ] Add loading/error states to all auth screens

### 1.5 Shared UI Components

- [ ] Design token setup (colors, typography, spacing)
- [ ] Build `Button` component (primary, secondary, ghost variants)
- [ ] Build `TextInput` component (with label, error state)
- [ ] Build `Card` component (for habits, insights)
- [ ] Build `ProgressBar` component (for onboarding steps)
- [ ] Build `BottomSheet` component (for obstacle selection)
- [ ] Build screen `Container` / `SafeArea` wrapper

> **🔵 DECISION NEEDED:** Do you have any existing brand guidelines (colors, fonts, logo)? Or should I propose a design direction? The visual tone should align with the "blame the design, not the person" philosophy — warm, supportive, clinical-but-not-cold.

### Phase 1 Checkpoint

> ✅ **User can sign up, log in, and see empty tab screens with navigation working.**

---

## Phase 2: Smart Onboarding

**Goal:** 5-screen intake flow that captures the data needed for AI diagnosis. This phase is CRITICAL — it feeds the Failure Profile, which is our key differentiator.

### 2.1 Onboarding State Management

- [ ] Create Zustand onboarding store (`src/stores/onboardingStore.ts`)
- [ ] Track current step (1-5) and all responses
- [ ] Implement progress persistence (resume if app closes mid-flow)
- [ ] Add validation rules per screen

### 2.2 Screen 1: Past Habits

- [ ] Build UI: "What habits have you tried before?"
- [ ] Free text input with suggested chips (e.g. "Exercise", "Meditation", "Reading", "Diet")
- [ ] Allow multiple entries with duration ("How long did it last?")
- [ ] Store as structured data: `[{habit, duration, why_failed}]`

### 2.3 Screen 2: Why They Failed

- [ ] Build UI: "Why do you think they didn't stick?"
- [ ] Multi-select options: "No time", "Forgot", "Too ambitious", "Lost motivation", "Life got in the way", "Felt pointless", "Other"
- [ ] Optional free-text for "Other"
- [ ] Store as `failure_reasons` array

### 2.4 Screen 3: Schedule Constraints

- [ ] Build UI: "Tell us about your day"
- [ ] Time pickers for: wake time, sleep time, work start, work end
- [ ] Multi-select for life constraints: "Kids", "Long commute", "Health issues", "Shift work", "Caretaking", "Other"
- [ ] Store in `user_profiles` constraint fields

### 2.5 Screen 4: Energy Patterns

- [ ] Build UI: "When do you feel most energized?"
- [ ] Visual slider or selector: Morning / Afternoon / Evening
- [ ] Optional: brief explanation of why this matters ("We'll design habits for YOUR peak energy")
- [ ] Store as `energy_pattern`

### 2.6 Screen 5: Identity Goal

- [ ] Build UI: "I want to be someone who..."
- [ ] Single text input with inspiring placeholder text
- [ ] Examples shown as chips: "...takes care of their health", "...reads every day", "...stays calm under pressure"
- [ ] Store as `identity_goal`

### 2.7 Onboarding Completion

- [ ] Save all responses to `user_profiles` table via Supabase
- [ ] Set `onboarding_completed_at` timestamp
- [ ] Show loading state: "Analyzing your patterns..." (transition to Failure Profile)

> **🔵 DECISION NEEDED:** The onboarding flow is described as "conversational UI (not forms)." How conversational do you want this?
>
> - **Option A:** Chat-style interface (messages appear one at a time, user responds)
> - **Option B:** Card-based flow (one question per screen, swipe/tap to advance)
> - **Option C:** Standard form screens with friendly copy and illustrations
>
> Option B is the fastest to build and still feels personal. Option A is the most immersive but significantly more complex. What's your preference?

### Phase 2 Checkpoint

> ✅ **User can complete 5-screen onboarding and see data stored in Supabase.**

---

## Phase 3: AI Failure Profile

**Goal:** Generate the Habit Failure Profile — the #1 differentiator and the "aha moment" that builds trust.

### 3.1 Failure Analysis Edge Function

- [ ] Write system prompt for failure pattern analysis (per architecture doc)
- [ ] Implement `analyze-failure` Edge Function:
  - Accept user onboarding data as input
  - Call GPT-4o-mini with structured prompt
  - Parse JSON response with validation (Zod schema)
  - Store result in `habit_failure_profiles` table
  - Handle API errors (retry once, then fallback)
- [ ] Create fallback response for API failures (generic but useful)
- [ ] Log token usage for cost tracking

### 3.2 Failure Profile UI

- [ ] Build Failure Profile screen/card
- [ ] Display 2-3 failure patterns with names and descriptions
- [ ] Show root causes
- [ ] Show personality insights
- [ ] Show recommendations preview
- [ ] Design for emotional impact — this should feel like "finally, someone gets it"
- [ ] Add "Continue to your habits" CTA button

### 3.3 Habit Generation Edge Function

- [ ] Write system prompt for habit stack generation (per architecture doc)
- [ ] Implement `generate-habits` Edge Function:
  - Accept failure profile + constraints + identity goal
  - Call GPT-4o-mini with structured prompt
  - Output: 1-3 habits with name, tiny version, anchor, celebration, rationale
  - Store in `habit_stacks` and `habits` tables
- [ ] Create fallback habits for API failures

### 3.4 Habit Stack Presentation

- [ ] Build "Your Personalized Habits" screen (shown after Failure Profile)
- [ ] Display each habit with:
  - Habit name
  - Tiny version ("2 minutes or less")
  - Anchor ("After I [existing routine]")
  - Celebration text
  - "Why this works for you" rationale (linked to failure pattern)
- [ ] "Start tracking" CTA → navigate to main app tabs

### Phase 3 Checkpoint

> ✅ **User sees personalized Failure Profile and AI-generated habit stack with rationale.**

---

## Phase 4: Daily Check-in (Core Loop)

**Goal:** The 10-second daily interaction that collects data for the Insight Flywheel.

### 4.1 Habit Store

- [ ] Create Zustand habit store (`src/stores/habitStore.ts`)
- [ ] Fetch active habits from Supabase on app open
- [ ] Track today's check-in status per habit (local + synced)
- [ ] Implement optimistic updates (mark complete instantly, sync in background)

### 4.2 Home Screen

- [ ] Build home screen with today's date header
- [ ] Display habit cards for each active habit
- [ ] Show completion status per habit (unchecked / completed / missed)
- [ ] Show "don't miss twice" indicator (not streak counter)
- [ ] Add motivational copy tied to identity goal ("You're becoming someone who...")

### 4.3 Check-in Interaction

- [ ] Tap habit card → mark complete
- [ ] Play success animation (confetti, checkmark, haptic feedback)
- [ ] Show celebration text after completion ("Don't forget to: [celebration]")
- [ ] Long-press or swipe → mark incomplete + open obstacle bottom sheet
- [ ] Obstacle options: "No time", "Forgot", "Too tired", "Life happened", "Other"
- [ ] Store check-in in `habit_logs` table (completed, obstacle, timestamp)

### 4.4 Push Notifications

- [ ] Install and configure `expo-notifications`
- [ ] Build notification permission request flow (explain value first)
- [ ] Schedule per-habit reminders based on `reminder_time`
- [ ] Smart default timing from user's schedule constraints
- [ ] Handle notification tap → deep link to home screen

> **🔵 DECISION NEEDED:** For the "don't miss twice" visualization, what should replace the traditional streak counter?
>
> - **Option A:** Simple dot timeline (green = done, gray = skipped, red only if 2+ misses in a row)
> - **Option B:** Consistency percentage over last 7 days (e.g. "5/7 this week")
> - **Option C:** "Current run" counter that only resets after 2 consecutive misses
>
> This ties directly to reducing the Shame Stock in the system. What feels right?

### Phase 4 Checkpoint

> ✅ **User can check in daily, log obstacles, and receive push notification reminders.**

---

## Phase 5: Weekly Iteration Engine

**Goal:** The core value loop — AI analyzes the week and delivers ONE specific adjustment.

### 5.1 Weekly Analysis Edge Function

- [ ] Implement `weekly-iteration` Edge Function:
  - Query `habit_logs` for past 7 days per user
  - Calculate completion rate per habit
  - Identify patterns (which days/times failed, obstacle trends)
  - Compare to original failure profile
- [ ] Write system prompt for iteration analysis (per architecture doc)
- [ ] Call GPT-4o-mini → output ONE adjustment with rationale
- [ ] Store in `weekly_iterations` table
- [ ] Handle edge cases: no check-ins, all perfect, first week

### 5.2 Scheduled Job

- [ ] Set up Supabase cron job (pg_cron) to trigger weekly analysis
- [ ] Schedule: Sunday evening (user's local timezone)
- [ ] Process all active users with check-in data
- [ ] Send push notification: "Your weekly habit review is ready"

### 5.3 Insights Screen

- [ ] Build Insights tab screen
- [ ] Show weekly summary card:
  - Completion stats (X of Y habits completed)
  - Pattern identified ("You struggled with [habit] on [days]")
  - AI-generated insight text
- [ ] Show the ONE adjustment recommendation prominently
- [ ] Display rationale ("Why we're suggesting this")
- [ ] "Accept Adjustment" and "Keep Current" buttons

### 5.4 Adjustment Implementation

- [ ] On accept: update relevant `habits` record with new parameters
- [ ] Log acceptance/rejection in `weekly_iterations.status`
- [ ] Show confirmation with encouraging message
- [ ] Update home screen to reflect adjusted habit

### 5.5 Empty/Waiting States

- [ ] "Your first insight arrives Sunday" screen (shown before first week completes)
- [ ] "Not enough data" handling (if user barely checked in)
- [ ] Previous insights list (scrollable history — basic version)

### Phase 5 Checkpoint

> ✅ **User receives weekly AI insight with one adjustment and can accept/decline it.**
> ✅ **This completes the core Insight Flywheel loop from the systems analysis.**

---

## Phase 6: Settings & Account Management

**Goal:** Minimum usability settings that keep the system relevant as life changes.

### 6.1 Settings Screen

- [ ] Build settings tab screen
- [ ] Display user profile info (name, email)
- [ ] Notification preferences (per-habit on/off, timing)
- [ ] Link to update constraints
- [ ] Link to view Failure Profile
- [ ] "Regenerate my habits" option (re-runs AI with current data)
- [ ] Sign out button
- [ ] Account deletion (GDPR compliance)

### 6.2 Constraint Update Flow

- [ ] Build "Life changed?" screen (accessible from settings + prompted after patterns shift)
- [ ] Allow editing: schedule, energy pattern, life constraints
- [ ] On save: flag profile as updated
- [ ] Optionally trigger habit stack regeneration

### 6.3 Regenerate Habits

- [ ] Confirmation dialog: "This will replace your current habits. Continue?"
- [ ] Re-call `generate-habits` Edge Function with latest profile + constraints
- [ ] Archive old habit stack (set `is_active = false`)
- [ ] Show new habits with updated rationale

### Phase 6 Checkpoint

> ✅ **User can manage their account, update constraints, and regenerate habits.**

---

## Phase 7: Polish & QA

**Goal:** Make the app feel finished — loading states, error handling, edge cases, performance.

### 7.1 UX Polish

- [ ] Add loading skeletons/spinners to all data-fetching screens
- [ ] Add error states with retry buttons for all API calls
- [ ] Add empty states (no habits yet, no insights yet, first day)
- [ ] Implement pull-to-refresh on home and insights screens
- [ ] Add haptic feedback to check-in interactions
- [ ] Onboarding completion animation (transition to Failure Profile)
- [ ] Review all copy for tone: supportive, not clinical; insightful, not preachy

### 7.2 Performance

- [ ] Implement local caching for habits (don't re-fetch on every app open)
- [ ] Optimize Supabase queries (use select filters, avoid over-fetching)
- [ ] Lazy-load insights history
- [ ] Test on low-end devices

### 7.3 Edge Cases

- [ ] Offline handling: queue check-ins and sync when back online
- [ ] Timezone handling for notifications and weekly analysis
- [ ] What happens when user has 0 active habits?
- [ ] What happens mid-onboarding if AI call fails?
- [ ] What happens if weekly cron job fails for a user?

### 7.4 Testing

- [ ] Unit tests for Zustand stores (auth, habits, onboarding)
- [ ] Unit tests for Edge Function logic (prompt building, response parsing)
- [ ] Integration tests for auth flow
- [ ] Integration tests for onboarding → profile → habits pipeline
- [ ] Manual QA on iOS simulator
- [ ] Manual QA on Android emulator
- [ ] Manual QA on physical device (at least one)

### Phase 7 Checkpoint

> ✅ **App handles errors gracefully, feels polished, and passes QA on both platforms.**

---

## Phase 8: Beta & Launch Prep

**Goal:** Get the app in real users' hands and prepare store submissions.

### 8.1 Beta Distribution

- [ ] Configure EAS Build for iOS and Android
- [ ] Set up TestFlight for iOS beta
- [ ] Set up internal testing track for Google Play
- [ ] Recruit 10-20 beta testers (target persona: knowledge workers 28-38)
- [ ] Create feedback collection method (form, Slack channel, or in-app)
- [ ] Run beta for 2-4 weeks

### 8.2 Analytics

- [ ] Integrate analytics (Mixpanel, Amplitude, or PostHog)
- [ ] Track key events:
  - Onboarding started / completed (per step)
  - Failure Profile generated / viewed
  - Daily check-in completed
  - Obstacle logged
  - Weekly insight viewed / accepted / declined
  - App opens per day
- [ ] Set up dashboard for MVP validation metrics

### 8.3 App Store Prep

- [ ] Write App Store / Play Store description
- [ ] Create screenshots (6.5" iPhone, 6.7" iPhone, Android)
- [ ] Design app icon
- [ ] Write privacy policy (data collection, AI usage disclosure)
- [ ] Write terms of service
- [ ] Set age rating
- [ ] Submit to App Store review
- [ ] Submit to Google Play review

### Phase 8 Checkpoint

> ✅ **App is live on TestFlight and Google Play internal track with beta users.**

---

## MVP Complete Definition

The MVP is **DONE** when a user can:

1. ✅ Sign up with email or Google
2. ✅ Complete 5-minute onboarding
3. ✅ See their personalized Habit Failure Profile
4. ✅ Receive 1-3 AI-designed habits with rationale
5. ✅ Check in daily with one tap
6. ✅ Get a push notification reminder
7. ✅ Receive a weekly insight with one adjustment
8. ✅ Accept or decline the adjustment

**If all 8 steps work, MVP is complete.**

---

## Post-MVP Phases (For Reference — Not Building Yet)

### v1.1 — Retention & Trust (P1 Features + Systems Analysis Gaps)

- [ ] Insight history with impact tracking (before/after completion rates)
- [ ] Proactive constraint update prompts (AI detects pattern disruption)
- [ ] "Don't miss twice" streak visualization
- [ ] Export/share Failure Profile to social
- [ ] Habit confidence score per habit (real-time health indicator)

### v1.2 — Deeper Intelligence (P2 Features + Systems Analysis)

- [ ] Pre-failure pattern detection (mid-week intervention)
- [ ] Energy/context daily micro check-in
- [ ] Habit pause/resume flow (graceful degradation)
- [ ] Ad-hoc AI questions ("Why did I fail this week?" chat)
- [ ] Progress analytics (trends over 4/8/12 weeks)

### v2.0 — Network Effects

- [ ] Social accountability opt-in (one partner, low-pressure)
- [ ] Anonymized failure pattern library (collective intelligence)
- [ ] Apple Health integration (auto-detect sleep, activity)
- [ ] Celebration reminders with animations
- [ ] Payment/subscription model

---

## Open Questions for You

1. **UI Library** — NativeWind, Tamagui, Gluestack, or custom? (Affects Phase 1.5)
2. **Supabase Setup** — Already have a project, or starting fresh?
3. **Google OAuth** — Credentials ready, or start with email-only auth?
4. **Onboarding Style** — Chat-style, card-based, or standard forms?
5. **Brand/Design** — Any existing colors, fonts, or logo? Or need to define?
6. **Streak Replacement** — Dot timeline, percentage, or forgiving counter?
7. **Target Platform Priority** — iOS-first, Android-first, or true simultaneous?

---

_Last updated: 2026-02-09_
_Source: aiDocs/prd.md, aiDocs/context.md, project_documentation.md, ai/notes/systems-thinking-diagram.md_
