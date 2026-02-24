# HabitDx - Product Requirements Document (PRD)

## Problem Statement

**92% of habit attempts fail**, and existing apps make the problem worse by:

- Tracking without guidance (passive scorecards)
- Using streak-based motivation that creates shame spirals when broken
- Offering generic advice that ignores individual constraints
- Providing no diagnosis of _why_ habits fail

Our target users—knowledge workers 28-38 who've tried 3+ habit apps—feel quiet despair about their inability to build consistent habits. They've read Atomic Habits, downloaded Habitica and Streaks, and still can't make habits stick. The bottleneck isn't motivation—it's personalized design and intelligent iteration.

### Falsifiability Check

To ensure we're solving a real problem, we actively tried to disprove our core assumptions:

**Core Assumption 1:** "People want to understand WHY their habits fail, not just track them."

**How we could be wrong:**
- Maybe users actually prefer simple tracking without analysis
- Maybe the "why" doesn't matter to them, only the outcome
- Maybe personalized insights feel invasive or overwhelming

**Due diligence performed:**
- Analyzed r/productivity and r/habits posts: 73% of "habit failure" posts ask "why can't I stick with this?" suggesting demand for diagnosis
- Reviewed app store reviews for Streaks, Habitica, Loop: Common complaint is "doesn't help me understand my patterns"
- Competitive analysis: Apps like Coach.me tried generic coaching, failed because not personalized
- Informal interviews with 8 colleagues who've used habit apps: 7/8 said "I wish it could tell me what I'm doing wrong"

**Conclusion:** Evidence supports the assumption, but we'll validate with MVP data (target: >60% of users engage with Failure Profile)

---

**Core Assumption 2:** "AI can generate insights that feel personalized, not generic."

**How we could be wrong:**
- Maybe GPT-4o-mini produces generic advice despite prompt engineering
- Maybe 5 minutes of intake data isn't enough for true personalization
- Maybe users won't trust AI-generated insights

**Due diligence performed:**
- Tested 20 sample user profiles through GPT-4o-mini with our prompt: 18/20 produced specific, non-generic insights
- Compared to human coach outputs: AI insights comparable in specificity when given same data
- Reviewed research: Studies show AI coaching effectiveness when personalized (Fitzpatrick et al., 2017)
- Risk mitigation: Failure Profile includes "why this is specific to you" rationale to build trust

**Conclusion:** Early tests promising, but need real user feedback. Pivot trigger: If >40% of users report insights feel "generic" in beta.

---

**Core Assumption 3:** "People will iterate weekly on habits, not abandon the app after one failure."

**How we could be wrong:**
- Maybe the weekly cycle is too slow; users want instant fixes
- Maybe one failure triggers app abandonment regardless of our "don't miss twice" philosophy
- Maybe users don't have patience for iterative improvement

**Due diligence performed:**
- Reviewed behavior change literature: Weekly reflection is standard in CBT and coaching
- Analyzed retention curves from similar apps: Day 1-3 and Day 7 are critical drop-off points
- Studied "don't break the chain" vs "one miss is okay" philosophies: Research supports latter for long-term adherence
- Designed for both: Failure Profile shown immediately (Day 1 value), weekly insights as retention hook

**Conclusion:** Weekly cycle is evidence-based, but we'll A/B test notification timing. Pivot trigger: If Week 1 retention <30%, add mid-week check-ins.

---

**Alternative Problems We Considered (Divergent Thinking):**

Before settling on "habit failure diagnosis," we explored:

1. **"Habit discovery" (help people find the right habits):** Rejected because assumes users don't know what to do. Our research shows they DO know (exercise, meditation, etc.) — they fail at execution.

2. **"Social accountability" (community-driven tracking):** Rejected as primary because our target users (knowledge workers 28-38) report social pressure as demotivating after repeated failures. Could be P2 feature.

3. **"AI habit coach chatbot" (conversational interface):** Rejected because too time-intensive. Our users have "no time" as #1 obstacle. Need 10-second check-ins, not conversations.

4. **"Gamification with rewards" (Habitica model):** Rejected because our target users have tried and failed with gamification. They want understanding, not gold coins.

**Why we chose diagnosis over these alternatives:**
- It's the unmet need in the market (no app does it well)
- It addresses the emotional need ("I'm not broken, my system is")
- It enables personalization (our differentiator)

---

**What Would Make Us Pivot:**

| Scenario                                          | Threshold                | Pivot Action                                             |
| ------------------------------------------------- | ------------------------ | -------------------------------------------------------- |
| Onboarding completion too low                     | <50% complete intake     | Simplify to 3 questions or "progressive onboarding"      |
| Failure Profile doesn't resonate                  | >40% say "too generic"   | Add more intake questions or switch AI model             |
| Weekly insights ignored                           | <30% open notification   | Add mid-week nudges or shift to daily micro-adjustments  |
| Users want community despite our research         | >50% request social      | Add opt-in accountability partner feature                |
| Retention good but no one cares about "why"       | High usage, low insight  | Pivot to "smart habit designer" (remove diagnosis focus) |
| Can't achieve target metrics despite 3 iterations | After 12 weeks of trying | Consider full pivot to simpler tracking app or shut down |

## Target Users

### Primary Persona: "Frustrated High-Achiever"

- **Demographics**: Age 28-38, knowledge worker (PM, engineer, marketer), $70K-150K income
- **Behaviors**: Downloaded 3+ habit apps, read productivity books, longest streak ~2-3 weeks
- **Pain points**: Shame from repeated failure, no diagnosis of root causes, rigid systems that break
- **Where to find**: r/productivity, r/habits, James Clear followers, Notion/Obsidian users

### Secondary Persona: "Overwhelmed New Parent"

- Massive life transition, desperate for efficiency, severe time constraints
- _Note: Future expansion target, not MVP focus_

### NOT For

- Habit beginners who've never tried tracking
- Casual users wanting a simple checkbox (use Streaks)
- Gamification seekers (use Habitica)
- Quick-fix hunters ("21 days to change your life")

## Goals and Success Metrics

### Primary Goals

1. Help users understand _why_ their habits fail
2. Design habits that fit users' actual constraints
3. Iterate weekly based on real data, not generic advice

### Success Metrics

| Metric                       | Target | Measurement                           |
| ---------------------------- | ------ | ------------------------------------- |
| Onboarding completion        | >70%   | Users who complete intake / signups   |
| Week 1 return rate           | >40%   | Users who check in day 7 / signups    |
| Week 4 retention             | >20%   | Users active at day 28 / signups      |
| Iteration acceptance         | >50%   | Users who implement weekly suggestion |
| Free → Paid conversion       | >5%    | Paid users / total users              |
| Habit Failure Profile shares | >10%   | Shares / profiles generated           |

## Features by Priority

### P0 — Must Have (MVP)

| Feature                  | Description                                              | Rationale                              |
| ------------------------ | -------------------------------------------------------- | -------------------------------------- |
| Smart onboarding         | 5-min intake capturing past failures, constraints, goals | Core data for personalization          |
| Habit Failure Profile    | AI-generated diagnosis of user's failure patterns        | Key differentiator, shareable artifact |
| Personalized habit stack | 1-3 AI-designed habits with "why this works for you"     | Immediate actionable value             |
| Daily check-in           | 10-second tap (done/not done + optional obstacle)        | Minimal friction data collection       |
| Weekly iteration         | AI analyzes patterns, delivers ONE adjustment            | Core value loop                        |
| Push notifications       | Configurable reminders per habit                         | Accountability trigger                 |

### P1 — Should Have (v1.1)

| Feature              | Description                                      | Rationale              |
| -------------------- | ------------------------------------------------ | ---------------------- |
| Insight history      | View past weekly adjustments and their impact    | Show compounding value |
| Constraint updates   | Easy way to update when life changes             | Maintain relevance     |
| Streak visualization | "Don't miss twice" philosophy (one miss ≠ reset) | Reduce shame spiral    |
| Export/share profile | Share Habit Failure Profile to social            | Virality mechanism     |

### P2 — Nice to Have (v1.2+)

| Feature                  | Description                      | Rationale           |
| ------------------------ | -------------------------------- | ------------------- |
| Ad-hoc AI questions      | "Why did I fail this week?" chat | Deeper engagement   |
| Progress analytics       | Trends over 4/8/12 weeks         | Long-term retention |
| Apple Health integration | Auto-detect sleep, activity      | Reduce manual input |
| Social accountability    | Paired check-ins with friend     | Retention boost     |

### Out of Scope (Not Building)

- Gamification (points, badges, leaderboards)
- Community/social feed
- Web version (mobile-only for MVP)
- Calendar sync
- Payment processing (free for MVP validation)
- Multiple languages

## User Stories

### Onboarding

1. As a new user, I want to describe my past habit failures so the app understands my patterns
2. As a new user, I want to input my schedule and energy patterns so habits fit my life
3. As a new user, I want to see my Habit Failure Profile so I understand why I've been failing
4. As a new user, I want to receive personalized habits with explanations so I trust the recommendations

### Daily Use

5. As a user, I want to check in with one tap so tracking doesn't become a burden
6. As a user, I want to optionally note what blocked me so the AI can learn my obstacles
7. As a user, I want reminders at the right time so I don't forget my habits

### Weekly Iteration

8. As a user, I want to receive one specific adjustment each week so I can improve incrementally
9. As a user, I want to understand _why_ the adjustment was suggested so I learn about myself
10. As a user, I want to accept or decline adjustments so I stay in control

### Settings

11. As a user, I want to update my constraints when life changes so habits stay relevant
12. As a user, I want to regenerate my habit stack if I want to start fresh

## Risks and Mitigations

| Risk                               | Likelihood | Impact | Mitigation                                                                |
| ---------------------------------- | ---------- | ------ | ------------------------------------------------------------------------- |
| AI insights feel generic           | Medium     | High   | Heavy prompt engineering, user feedback loop, personalization from intake |
| Users don't complete onboarding    | Medium     | High   | Progressive disclosure, show value early (teaser of profile)              |
| Users don't return after week 1    | High       | High   | Push notifications, compelling weekly insights, email sequences           |
| Atoms (James Clear) copies feature | Low        | Medium | Move fast, build community, iterate faster                                |
| Technical delays                   | Medium     | Medium | Ruthless scope control, weekly team check-ins                             |

## MVP Definition

### The ONE Core Problem

**Help users understand WHY their habits fail and give them ONE weekly adjustment.**

Everything else is secondary. If users don't feel the AI "gets" them and provides useful insights, nothing else matters.

### Minimum Feature Set

| Feature                         | Included | Rationale                |
| ------------------------------- | -------- | ------------------------ |
| Email/Google auth               | ✅       | Required for persistence |
| Smart onboarding (5 screens)    | ✅       | Core data collection     |
| AI Failure Profile              | ✅       | Key differentiator       |
| AI habit stack (1-3 habits)     | ✅       | Immediate value          |
| Daily check-in (tap + obstacle) | ✅       | Data for iteration       |
| Weekly AI insight               | ✅       | Core value loop          |
| Push notifications              | ✅       | Accountability trigger   |
| Basic settings                  | ✅       | Minimum usability        |

### What We're Cutting

| Feature              | Status | Why Cut                           |
| -------------------- | ------ | --------------------------------- |
| Gamification         | ❌     | Distracts from core value         |
| Social features      | ❌     | Complexity, not core              |
| Web version          | ❌     | Mobile-first, resource constraint |
| Calendar sync        | ❌     | Nice-to-have, not essential       |
| Wearable integration | ❌     | Complexity, future feature        |
| Payment/subscription | ❌     | Validate free first               |
| Analytics dashboard  | ❌     | P1 feature                        |
| Multiple languages   | ❌     | US-first launch                   |

### What "Done" Looks Like

A user can:

1. Sign up with email or Google
2. Complete 5-minute onboarding
3. See their personalized Habit Failure Profile
4. Receive 1-3 AI-designed habits
5. Check in daily with one tap
6. Get a push notification reminder
7. Receive a weekly insight with one adjustment
8. Accept or decline the adjustment

**If a user can do all 8 steps, MVP is complete.**

### MVP Validation Criteria

**After 4 weeks with 50+ users, we need:**

| Metric                | Target       | If Not Met                |
| --------------------- | ------------ | ------------------------- |
| Onboarding completion | >70%         | Simplify intake flow      |
| Week 1 return         | >40%         | Improve habit suggestions |
| Iteration engagement  | >50%         | Refine AI prompts         |
| Qualitative feedback  | "Insightful" | Pivot or iterate          |
