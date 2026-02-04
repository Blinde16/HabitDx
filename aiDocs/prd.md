# HabitDx - Product Requirements Document (PRD)

## Problem Statement

**92% of habit attempts fail**, and existing apps make the problem worse by:
- Tracking without guidance (passive scorecards)
- Using streak-based motivation that creates shame spirals when broken
- Offering generic advice that ignores individual constraints
- Providing no diagnosis of *why* habits fail

Our target users—knowledge workers 28-38 who've tried 3+ habit apps—feel quiet despair about their inability to build consistent habits. They've read Atomic Habits, downloaded Habitica and Streaks, and still can't make habits stick. The bottleneck isn't motivation—it's personalized design and intelligent iteration.

## Target Users

### Primary Persona: "Frustrated High-Achiever"
- **Demographics**: Age 28-38, knowledge worker (PM, engineer, marketer), $70K-150K income
- **Behaviors**: Downloaded 3+ habit apps, read productivity books, longest streak ~2-3 weeks
- **Pain points**: Shame from repeated failure, no diagnosis of root causes, rigid systems that break
- **Where to find**: r/productivity, r/habits, James Clear followers, Notion/Obsidian users

### Secondary Persona: "Overwhelmed New Parent"
- Massive life transition, desperate for efficiency, severe time constraints
- *Note: Future expansion target, not MVP focus*

### NOT For
- Habit beginners who've never tried tracking
- Casual users wanting a simple checkbox (use Streaks)
- Gamification seekers (use Habitica)
- Quick-fix hunters ("21 days to change your life")

## Goals and Success Metrics

### Primary Goals
1. Help users understand *why* their habits fail
2. Design habits that fit users' actual constraints
3. Iterate weekly based on real data, not generic advice

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Onboarding completion | >70% | Users who complete intake / signups |
| Week 1 return rate | >40% | Users who check in day 7 / signups |
| Week 4 retention | >20% | Users active at day 28 / signups |
| Iteration acceptance | >50% | Users who implement weekly suggestion |
| Free → Paid conversion | >5% | Paid users / total users |
| Habit Failure Profile shares | >10% | Shares / profiles generated |

## Features by Priority

### P0 — Must Have (MVP)

| Feature | Description | Rationale |
|---------|-------------|-----------|
| Smart onboarding | 5-min intake capturing past failures, constraints, goals | Core data for personalization |
| Habit Failure Profile | AI-generated diagnosis of user's failure patterns | Key differentiator, shareable artifact |
| Personalized habit stack | 1-3 AI-designed habits with "why this works for you" | Immediate actionable value |
| Daily check-in | 10-second tap (done/not done + optional obstacle) | Minimal friction data collection |
| Weekly iteration | AI analyzes patterns, delivers ONE adjustment | Core value loop |
| Push notifications | Configurable reminders per habit | Accountability trigger |

### P1 — Should Have (v1.1)

| Feature | Description | Rationale |
|---------|-------------|-----------|
| Insight history | View past weekly adjustments and their impact | Show compounding value |
| Constraint updates | Easy way to update when life changes | Maintain relevance |
| Streak visualization | "Don't miss twice" philosophy (one miss ≠ reset) | Reduce shame spiral |
| Export/share profile | Share Habit Failure Profile to social | Virality mechanism |

### P2 — Nice to Have (v1.2+)

| Feature | Description | Rationale |
|---------|-------------|-----------|
| Ad-hoc AI questions | "Why did I fail this week?" chat | Deeper engagement |
| Progress analytics | Trends over 4/8/12 weeks | Long-term retention |
| Apple Health integration | Auto-detect sleep, activity | Reduce manual input |
| Social accountability | Paired check-ins with friend | Retention boost |

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
9. As a user, I want to understand *why* the adjustment was suggested so I learn about myself
10. As a user, I want to accept or decline adjustments so I stay in control

### Settings
11. As a user, I want to update my constraints when life changes so habits stay relevant
12. As a user, I want to regenerate my habit stack if I want to start fresh

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| AI insights feel generic | Medium | High | Heavy prompt engineering, user feedback loop, personalization from intake |
| Users don't complete onboarding | Medium | High | Progressive disclosure, show value early (teaser of profile) |
| Users don't return after week 1 | High | High | Push notifications, compelling weekly insights, email sequences |
| Atoms (James Clear) copies feature | Low | Medium | Move fast, build community, iterate faster |
| Technical delays | Medium | Medium | Ruthless scope control, weekly team check-ins |

## MVP Definition

### The ONE Core Problem

**Help users understand WHY their habits fail and give them ONE weekly adjustment.**

Everything else is secondary. If users don't feel the AI "gets" them and provides useful insights, nothing else matters.

### Minimum Feature Set

| Feature | Included | Rationale |
|---------|----------|-----------|
| Email/Google auth | ✅ | Required for persistence |
| Smart onboarding (5 screens) | ✅ | Core data collection |
| AI Failure Profile | ✅ | Key differentiator |
| AI habit stack (1-3 habits) | ✅ | Immediate value |
| Daily check-in (tap + obstacle) | ✅ | Data for iteration |
| Weekly AI insight | ✅ | Core value loop |
| Push notifications | ✅ | Accountability trigger |
| Basic settings | ✅ | Minimum usability |

### What We're Cutting

| Feature | Status | Why Cut |
|---------|--------|---------|
| Gamification | ❌ | Distracts from core value |
| Social features | ❌ | Complexity, not core |
| Web version | ❌ | Mobile-first, resource constraint |
| Calendar sync | ❌ | Nice-to-have, not essential |
| Wearable integration | ❌ | Complexity, future feature |
| Payment/subscription | ❌ | Validate free first |
| Analytics dashboard | ❌ | P1 feature |
| Multiple languages | ❌ | US-first launch |

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

| Metric | Target | If Not Met |
|--------|--------|------------|
| Onboarding completion | >70% | Simplify intake flow |
| Week 1 return | >40% | Improve habit suggestions |
| Iteration engagement | >50% | Refine AI prompts |
| Qualitative feedback | "Insightful" | Pivot or iterate |
