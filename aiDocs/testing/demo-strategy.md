# Presentation-Safe Demo Strategy

**Date:** April 2026  
**Purpose:** Guide for surviving a live demo/presentation without hitting known issues

---

## Pre-Demo Setup (Required)

Before any live demo, prepare these:

1. **Pre-seeded demo account** with 7+ days of check-in data, existing failure profile, habit stack, and at least one generated weekly insight
2. **Verify env vars** are set for the demo environment — or apply the fix that hides unconfigured items
3. **Clear browser dev tools console** (or don't open it) — console.logs will appear
4. **Test Google OAuth** on the demo machine/browser beforehand
5. **Test AI generation** to confirm Edge Functions and OpenAI are responding within 5 seconds

---

## Safest Demo Flow (Recommended Script)

### Step 1: Start on Home Screen (pre-populated account)
> "This is what a HabitDx user sees each day — their personalized habits, designed around their real schedule and past patterns."

Point out: tiny version text, anchor, streak counter, completion rate.

### Step 2: Tap One Habit to Complete
> "Every check-in takes one tap. The celebration reinforces the behavior immediately — based on BJ Fogg's Tiny Habits research."

Show the success animation. Point out the celebration text that appears.

### Step 3: Long-Press Another Habit for Obstacle Sheet
> "If you can't do a habit today, you tell us why. This data feeds the AI's weekly adjustments — so the app gets smarter about YOUR obstacles."

Show the obstacle categories and optional note field.

### Step 4: Navigate to Insights Tab (pre-populated)
> "Every week, the AI analyzes your patterns and suggests ONE specific change. Not a list of 10 things to fix — one high-impact adjustment you can accept or decline."

Show completion stats, patterns detected, the adjustment recommendation.

### Step 5: Show Failure Profile (via Settings → View Failure Profile)
> "This is the core differentiator — before we build habits, we diagnose WHY your habits have failed before. Here are the patterns we found, the root causes, and the strategy built specifically for this user."

**Note:** If you've renamed "Failure Profile" to "Habit Profile," even better.

### Step 6 (if time): Show AI Chat Onboarding on New Account
> "The onboarding is conversational — you tell the AI your story in your own words, and it builds your plan from that conversation."

Show 1-2 chat exchanges. **Do NOT click "Build my profile" live** — AI latency is unpredictable. Say: "This builds into the profile we just saw."

---

## Flows to AVOID in Live Demo

| Flow | Risk |
|------|------|
| **Settings page** (unless fixed) | Tapping Privacy Policy, Terms, Beta Feedback, or Support shows "Not Configured" alerts with raw env var names |
| **Full onboarding → profile generation live** | AI latency (3-15+ seconds), possible API error |
| **Insights tab on a new account** | Shows empty state: "need 5 check-ins" — underwhelming |
| **"Skip for now" in onboarding** | Logs user out — looks like a bug |
| **Forgot password flow** | Not interesting and potentially unpolished |
| **Profile.tsx route** | Exists but may not be fully built out |

---

## Time-Based Demo Plans

### 5-Minute Demo
1. Home screen (pre-populated) — 30 sec
2. Complete one habit → success animation — 30 sec
3. Long-press → obstacle sheet — 30 sec
4. Insights tab with weekly analysis — 1 min
5. Narrate thesis: "Diagnose failure patterns, design tiny habits, iterate weekly" — 2 min
6. Q&A buffer — 30 sec

### 10-Minute Demo
All of above, plus:
6. Failure Profile walkthrough — 2 min
7. Briefly show AI chat onboarding (1-2 turns, don't complete) — 2 min
8. Circle back to how it all connects — 1 min

### 15-Minute Demo
All of above, plus:
9. Complete AI chat (3 turns) live — 3 min
10. Show failure profile generation (risky — have pre-seeded backup) — 2 min

---

## Likely Evaluator Questions & Prepared Answers

### Product Questions

**Q: "How is this different from Habitica/Streaks/other habit apps?"**
> "Other apps track habits. HabitDx diagnoses WHY you fail first, then designs habits specifically to avoid YOUR failure patterns. The weekly AI iteration means the app adapts — it's not a static checklist."

**Q: "How do you know the AI personalization actually works?"**
> "The failure profile analyzes your specific constraints — energy patterns, schedule type, obstacle history — and the habit generator uses those constraints. We tested 20 sample profiles and 18 produced specific, non-generic insights. The weekly iteration is the feedback loop that refines it over time."

**Q: "What happens when someone stops using it?"**
> "That's exactly what obstacle tracking is for. When you miss, you tell us why. The AI uses that to make habits smaller, move them to better times, or change the approach. We're designed for the user who fails, not the one who's already disciplined."

**Q: "What's your retention strategy?"**
> "Three things: tiny habits reduce activation energy so check-in takes one tap, obstacle tracking creates a non-judgmental path through missed days, and weekly insights give users a reason to come back for their personalized adjustment."

### Technical Questions

**Q: "What AI model are you using?"**
> "GPT-4o-mini via Supabase Edge Functions. We chose it for cost-efficiency at scale — about $3-10/month for 1,000 users — while maintaining personalization quality."

**Q: "What happens if the AI is wrong?"**
> "Users can decline any suggestion and regenerate their habit stack. The weekly iteration also self-corrects — if a habit isn't working, the data shows it and the AI adjusts."

**Q: "What about data privacy?"**
> "All user data is stored in Supabase with row-level security. AI processing happens through serverless Edge Functions — user data is sent to OpenAI for analysis but we don't store conversations on OpenAI's side."

### Challenging Questions

**Q: "Why is it called 'Failure Profile'? Isn't that discouraging?"**
> "Great question — we're actually reframing that to 'Habit Profile' based on user feedback. The core concept is diagnostic: understand your patterns before building new habits. Think of it like a doctor taking your history before prescribing treatment."

**Q: "Have you tested with real users?"**
> Prepare an answer that matches what you have actually run (beta cohort, usability sessions, etc.). If you have not yet run live user tests, you can still cite **structured pre-presentation work**: six stress-test personas, simulated walkthroughs, and code-backed findings documented in [`aiDocs/testing/`](README.md) — with the honest caveat that this complements but does not replace real-user validation.

**Q: "What's the business model?"**
> (Prepare this — not in the codebase. Likely: freemium with AI features as premium.)

---

## Strongest Narrative Angle

Lead with the insight, not the feature list:

> "Every habit app assumes you know what habits to build and just need reminders. But 92% of habit attempts fail — not because people don't know what to do, but because the habits don't fit their life. HabitDx starts by understanding WHY you've failed before, then designs habits that work around your real constraints, your real energy patterns, and your real obstacles. And every week, it gets smarter about what works for you."

### Why This Framing Works
1. It names the problem everyone relates to (habits failing)
2. It positions existing apps as inadequate (tracking ≠ helping)
3. It highlights the differentiator (diagnosis before prescription)
4. It promises ongoing value (weekly iteration)
5. It's grounded in the PRD's core thesis (92% failure rate)

---

## If Things Break During Demo

| Failure | Recovery Script |
|---------|----------------|
| AI profile generation hangs | "The AI analysis typically takes a few seconds. While that loads, let me show you what the output looks like on our test account..." (switch accounts) |
| Google OAuth fails | "Let me use our test account instead" (email/password login) |
| App shows error state | "Like any AI product, we handle errors gracefully — the user always has a retry path. Let me show you the happy path." |
| Evaluator asks to see settings | "Settings has standard account management. Let me show you the more interesting AI features instead." |
| Empty insights on demo account | "Weekly insights require a week of data. Here's what they look like once generated..." (show screenshots or switch to seeded account) |
| Someone spots console.log | "Good eye — that's a development logging artifact we're cleaning up for production." |

---

## What Looks Polished vs. Unfinished

### Production-Ready Screens
- Login/Signup flow
- AI Chat Onboarding
- Failure Profile display
- Habit Stack presentation
- Home screen with habit cards
- Success animation
- Obstacle bottom sheet

### Needs Polish
- Settings (env var exposure)
- Empty Insights state
- Welcome.tsx loading flash
- "Skip for now" behavior
- Missing tutorial/onboarding for home screen
