# HabitDx Pivot Plan

**Document Purpose:** Define failure scenarios, decision triggers, and pivot strategies for HabitDx.

**Philosophy:** "Pivots and setbacks are evidence of good process. If you failed but documented the 'Why' and 'Next Step,' you're meeting requirements." — Midterm Rubric

**Last Updated:** February 16, 2026

---

## Overview

This document outlines:

1. **Success/Failure Indicators** - Metrics that signal when to pivot
2. **Pivot Scenarios** - Specific failure modes and responses
3. **Decision Framework** - How and when to execute pivots
4. **Learning Process** - How we capture insights from failures

---

## 1. Success/Failure Indicators

### Green Zone: On Track (No Action Needed)

| Metric                | Target | Green Zone | Status           |
| --------------------- | ------ | ---------- | ---------------- |
| Onboarding completion | >70%   | >65%       | ✅ Keep building |
| Week 1 return rate    | >40%   | >35%       | ✅ Keep building |
| Week 4 retention      | >20%   | >18%       | ✅ Keep building |
| Iteration acceptance  | >50%   | >45%       | ✅ Keep building |
| Failure Profile NPS   | >50    | >40        | ✅ Keep building |
| Weekly insight NPS    | >50    | >40        | ✅ Keep building |

### Yellow Zone: Warning Signs (Investigate)

| Metric                | Yellow Zone | Action                                      |
| --------------------- | ----------- | ------------------------------------------- |
| Onboarding completion | 50-64%      | Run user tests, identify drop-off point     |
| Week 1 return rate    | 25-34%      | Improve initial habit suggestions           |
| Week 4 retention      | 12-17%      | Analyze churn reasons, improve insights     |
| Iteration acceptance  | 30-44%      | Review AI prompt quality, add more examples |
| Failure Profile NPS   | 20-39       | Gather qualitative feedback, iterate prompt |
| Weekly insight NPS    | 20-39       | Improve insight relevance and specificity   |

### Red Zone: Pivot Required (Act Within 2 Weeks)

| Metric                | Red Zone | Pivot Action         |
| --------------------- | -------- | -------------------- |
| Onboarding completion | <50%     | See Pivot Scenario 1 |
| Week 1 return rate    | <25%     | See Pivot Scenario 2 |
| Week 4 retention      | <12%     | See Pivot Scenario 3 |
| Iteration acceptance  | <30%     | See Pivot Scenario 4 |
| Failure Profile NPS   | <20      | See Pivot Scenario 5 |
| Weekly insight NPS    | <20      | See Pivot Scenario 6 |

---

## 2. Pivot Scenarios

### Pivot Scenario 1: Low Onboarding Completion (<50%)

**Symptom:** Users start onboarding but don't complete all 5 screens.

**Root Causes (Hypotheses):**

1. Onboarding too long (5 screens = 5+ minutes)
2. Questions feel invasive or uncomfortable
3. Value proposition unclear (why answer these questions?)
4. Technical issues (crashes, slow loading)

**Diagnostic Steps:**

1. Analyze drop-off by screen (which screen loses most users?)
2. Review session recordings (if analytics permits)
3. A/B test: Show Failure Profile preview on Screen 1 (tease value)
4. Interview 5-10 users who abandoned onboarding

**Pivot Options:**

| Option                    | Description                                                              | Effort | Risk   |
| ------------------------- | ------------------------------------------------------------------------ | ------ | ------ |
| **A: Progressive Intake** | Collect 2 questions upfront, rest later (after showing Failure Profile)  | Medium | Low    |
| **B: Simplify to 3Q**     | Cut to 3 essential questions (past failures, constraints, goal)          | Low    | Medium |
| **C: Conversational UI**  | One question at a time, chat-style (feels less like a form)              | High   | Medium |
| **D: Skip Onboarding**    | Generic habit suggestions first, onboarding optional for personalization | Low    | High   |

**Decision Criteria:**

- If drop-off is Screen 1-2: Choose **D** (skip onboarding) or **A** (progressive)
- If drop-off is Screen 3-5: Choose **B** (simplify) or **A** (progressive)
- If qualitative feedback = "too many questions": Choose **B**
- If qualitative feedback = "why do I need to answer this?": Choose **A** (show value first)

**Commitment:** If <50% after 100 signups, execute Pivot A within 1 week.

---

### Pivot Scenario 2: Low Week 1 Return Rate (<25%)

**Symptom:** Users complete onboarding, see Failure Profile, but don't return next day.

**Root Causes (Hypotheses):**

1. Habit suggestions feel wrong or irrelevant
2. No reminder notification sent/enabled
3. App forgot to show home screen (navigation bug)
4. Failure Profile resonated, but habits didn't
5. Users expected instant results, not 7-day cycle

**Diagnostic Steps:**

1. Check notification delivery rate
2. Analyze which users returned vs didn't: profile patterns?
3. Interview 5 churned users: "Why didn't you come back?"
4. Review habit suggestions: are they generic?

**Pivot Options:**

| Option                         | Description                                                             | Effort | Risk   |
| ------------------------------ | ----------------------------------------------------------------------- | ------ | ------ |
| **A: Improve Habit Relevance** | Refine AI prompt, add more intake questions for better personalization  | Medium | Low    |
| **B: Add Onboarding Habit**    | First 3 days = "Check in daily" as a habit to build app usage pattern   | Low    | Low    |
| **C: Mid-Week Mini-Insight**   | Don't wait 7 days; send a 3-day micro-insight to re-engage              | High   | Medium |
| **D: Push Notification Fix**   | Simplify notification permission request, make it Day 1 mandatory       | Low    | Low    |
| **E: Instant Gratification**   | Add Day 1 achievement ("You've taken the first step!") with celebration | Low    | Medium |

**Decision Criteria:**

- If notification delivery <70%: Choose **D** (fix notifications)
- If habit suggestions score low in qualitative feedback: Choose **A** (improve relevance)
- If users say "nothing happened": Choose **C** (mid-week insight) or **E** (instant gratification)

**Commitment:** If <25% after 50 users, execute Pivot D + E within 1 week.

---

### Pivot Scenario 3: Low Week 4 Retention (<12%)

**Symptom:** Users check in Week 1, maybe Week 2, but disappear by Week 4.

**Root Causes (Hypotheses):**

1. Weekly insights feel generic or unhelpful
2. Life got busy, forgot about app (habit not sticky enough)
3. Habits too hard, users gave up
4. Shame spiral started after missed check-ins
5. No sense of progress or improvement

**Diagnostic Steps:**

1. Survey churned users: "Why did you stop using HabitDx?"
2. Analyze correlation: Do users who miss 2+ days in a row churn?
3. Review weekly insight quality: Are they specific or generic?
4. Check insight acceptance rate: Are users even reading them?

**Pivot Options:**

| Option                            | Description                                                    | Effort | Risk   |
| --------------------------------- | -------------------------------------------------------------- | ------ | ------ |
| **A: Improve Insight Quality**    | Better AI prompts, more context, human review of outputs       | Medium | Low    |
| **B: Add Progress Visualization** | Show weekly completion trends, "You're improving!" messages    | Medium | Low    |
| **C: Habit Pause Feature**        | Let users pause habits during busy weeks (prevent abandonment) | Low    | Low    |
| **D: Add Social Accountability**  | Opt-in accountability partner (one friend sees your check-ins) | High   | Medium |
| **E: Reduce to 1 Habit**          | Suggest users focus on just 1 habit to increase consistency    | Low    | High   |
| **F: Daily Micro-Adjustments**    | Replace weekly insights with daily tips (faster feedback loop) | High   | High   |

**Decision Criteria:**

- If insight NPS <30: Choose **A** (improve insights)
- If users cite "too busy" or "life happened": Choose **C** (pause feature)
- If users say "no one to keep me accountable": Choose **D** (social)
- If users have 3+ habits and low completion: Choose **E** (reduce to 1)
- If users say "weekly is too slow": Choose **F** (daily micro-adjustments)

**Commitment:** If <12% after 100 users with 4 weeks of data, execute Pivot A + C within 2 weeks.

---

### Pivot Scenario 4: Low Iteration Acceptance (<30%)

**Symptom:** Users receive weekly insights but don't accept the suggested adjustments.

**Root Causes (Hypotheses):**

1. Adjustments feel wrong or irrelevant
2. Users don't trust the AI's reasoning
3. Change is scary (status quo bias)
4. Adjustments too complex or too vague
5. Users are satisfied with current habits (low completion but don't want help)

**Diagnostic Steps:**

1. Analyze declined adjustments: common patterns?
2. Interview users who declined: "Why didn't you accept this?"
3. A/B test: Show adjustment impact prediction ("This could improve completion by 20%")
4. Review AI output quality: Are rationales compelling?

**Pivot Options:**

| Option                      | Description                                                     | Effort | Risk   |
| --------------------------- | --------------------------------------------------------------- | ------ | ------ |
| **A: Better Rationales**    | Improve prompt to include before/after data, success stories    | Low    | Low    |
| **B: A/B Test Adjustments** | Let users test adjustment for 3 days, revert if worse           | Medium | Medium |
| **C: Human-in-the-Loop**    | Have human coach review AI suggestions before sending           | High   | Low    |
| **D: Multiple Options**     | Give 2-3 adjustment options, let user choose                    | Medium | Medium |
| **E: Smaller Changes**      | Suggest micro-adjustments (change time by 15 mins, not 2 hours) | Low    | Low    |

**Decision Criteria:**

- If qualitative feedback = "feels generic": Choose **A** (better rationales) or **C** (human review)
- If qualitative feedback = "scared to change": Choose **B** (A/B test adjustments) or **E** (smaller changes)
- If qualitative feedback = "none of these fit": Choose **D** (multiple options)

**Commitment:** If <30% after 30 weekly insights sent, execute Pivot A + E within 1 week.

---

### Pivot Scenario 5: Failure Profile Doesn't Resonate (NPS <20)

**Symptom:** Users see Failure Profile but rate it poorly ("too generic," "didn't help").

**Root Causes (Hypotheses):**

1. AI prompt produces generic outputs despite personalization intent
2. Not enough intake data to generate meaningful insights
3. Users don't understand the profile (jargon, unclear)
4. Profile format is boring (just text, no visuals)
5. Users expected actionable steps, not diagnosis

**Diagnostic Steps:**

1. Collect qualitative feedback: "What didn't work about this?"
2. Human review 20 sample profiles: Are they truly personalized?
3. Compare profiles of similar users: Are they identical? (Bad sign)
4. A/B test: Add visual diagram or pattern illustration

**Pivot Options:**

| Option                        | Description                                                                     | Effort | Risk      |
| ----------------------------- | ------------------------------------------------------------------------------- | ------ | --------- |
| **A: More Intake Questions**  | Add 2-3 more questions to get richer data for AI                                | Low    | Medium    |
| **B: Switch AI Model**        | Test GPT-4 (more expensive but better) vs GPT-4o-mini                           | Low    | Low       |
| **C: Add Visual Diagrams**    | Show pattern as visual timeline or graph (not just text)                        | Medium | Low       |
| **D: Human-Written Profiles** | Pre-write 10-15 profile archetypes, AI selects best match instead of generating | High   | Medium    |
| **E: Skip Failure Profile**   | Pivot away from diagnosis, focus on habit design only                           | Low    | **MAJOR** |

**Decision Criteria:**

- If NPS 10-19 (meh, not terrible): Choose **A** (more data) + **C** (visuals)
- If NPS <10 (actively bad): Choose **B** (better AI) + **D** (human-written archetypes)
- If users say "this is useless": Choose **E** (skip diagnosis entirely) — **MAJOR PIVOT**

**Commitment:** If NPS <20 after 50 profiles generated, execute Pivot A + C within 1 week. If NPS <10, execute Pivot B + D within 2 weeks.

**MAJOR PIVOT:** If after 3 iterations (12 weeks) Failure Profile still <20 NPS, consider full product pivot to "AI Habit Designer" without diagnosis focus.

---

### Pivot Scenario 6: Weekly Insights Irrelevant (NPS <20)

**Symptom:** Users read insights but rate them poorly ("not helpful," "too vague").

**Root Causes (Hypotheses):**

1. Not enough check-in data (users skip days, AI can't find patterns)
2. AI prompt produces generic advice
3. Insights don't account for obstacles (e.g., "just do it more" isn't helpful)
4. Timing is off (Sunday night when users are relaxing, not planning)
5. One adjustment isn't enough (users want comprehensive plan)

**Diagnostic Steps:**

1. Analyze users with low insight NPS: How many check-ins did they have?
2. Human review 20 sample insights: Are they specific or generic?
3. Interview users: "What would make this insight more useful?"
4. A/B test insight delivery timing (Sunday night vs Monday morning)

**Pivot Options:**

| Option                           | Description                                                            | Effort | Risk      |
| -------------------------------- | ---------------------------------------------------------------------- | ------ | --------- |
| **A: Require Minimum Check-Ins** | Only send insight if user has ≥4 check-ins (not enough data otherwise) | Low    | Low       |
| **B: Improve AI Prompt**         | Add more examples, emphasize specificity, include obstacle data        | Low    | Low       |
| **C: Multiple Adjustments**      | Give 2-3 suggestions instead of one (user chooses best)                | Medium | Medium    |
| **D: Change Timing**             | Send Monday morning instead of Sunday night ("fresh week" framing)     | Low    | Low       |
| **E: Add Celebration**           | Start with "You completed X% this week!" before suggesting changes     | Low    | Low       |
| **F: Human Coach Review**        | Human reviews and edits AI insights before sending                     | High   | Low       |
| **G: Pivot to Daily Tips**       | Replace weekly insights with daily micro-tips (faster feedback loop)   | High   | **MAJOR** |

**Decision Criteria:**

- If users with <4 check-ins rate lower: Choose **A** (minimum threshold)
- If qualitative feedback = "too generic": Choose **B** (prompt) + **F** (human review)
- If qualitative feedback = "one adjustment isn't enough": Choose **C** (multiple options)
- If qualitative feedback = "wrong time": Choose **D** (timing)
- If users miss the positive framing: Choose **E** (add celebration)
- If after all above, still <20 NPS: Choose **G** (pivot to daily tips) — **MAJOR PIVOT**

**Commitment:** If NPS <20 after 30 insights sent, execute Pivot A + B + E within 1 week. If still <20 after 60 insights, execute Pivot G (major pivot).

---

## 3. Decision Framework

### When to Pivot

**Three-Strike Rule:** Don't pivot on first sign of trouble. Iterate three times before major pivot.

1. **Strike 1 (Yellow Zone):** Investigate, gather qualitative feedback, identify root cause
2. **Strike 2 (Red Zone for 2 weeks):** Execute minor pivot (Options A-C from scenario)
3. **Strike 3 (Red Zone for 4 weeks):** Execute major pivot or consider shutdown

### Pivot Decision Process

```
[Metric enters Red Zone]
       ↓
[Week 1: Gather data]
  - User interviews (5-10)
  - Analytics deep dive
  - Qualitative feedback
       ↓
[Week 2: Decide pivot]
  - Review Pivot Scenario options
  - Select 1-2 pivots based on root cause
  - Document hypothesis: "We believe X will improve Y"
       ↓
[Week 3-4: Implement pivot]
  - Build and deploy changes
  - Announce to users (if user-facing)
       ↓
[Week 5-6: Measure impact]
  - Did metric improve?
  - New qualitative feedback?
       ↓
[Decision Point]
  - Green Zone: Success, keep building
  - Yellow Zone: Iterate on pivot
  - Red Zone: Strike 2, next pivot
```

### Shutdown Criteria (Nuclear Option)

We will consider shutting down HabitDx if:

1. **All metrics in Red Zone for 12 weeks** despite 3+ pivots
2. **Burn rate unsustainable** (AI costs >$500/mo with <$100 revenue)
3. **Market invalidation** (competitor launches identical product and dominates)
4. **Team consensus** that problem isn't solvable with our approach

**Before shutdown, we will:**

- Document learnings in `ai/notes/project_postmortem.md`
- Archive codebase and documentation
- Reach out to users for feedback (even in failure, respect their time)
- Extract reusable components for future projects

---

## 4. Pivot Log (Living Document)

| Date | Scenario | Metric Value | Root Cause | Pivot Chosen | Outcome |
| ---- | -------- | ------------ | ---------- | ------------ | ------- |
| TBD  | TBD      | TBD          | TBD        | TBD          | TBD     |

_This table will be updated as we execute pivots._

---

## 5. Learning Process

### After Each Pivot

1. **Document Hypothesis:** What did we think would happen?
2. **Document Outcome:** What actually happened?
3. **Document Learnings:** What did we learn about our users/problem?
4. **Update PRD/Roadmap:** Adjust priorities based on learnings
5. **Share with Team:** Discuss in weekly sync

### Quarterly Pivot Review

Every 3 months, review all pivots:

- Which pivots worked? Why?
- Which pivots failed? Why?
- What patterns emerged?
- Update this Pivot Plan based on learnings

---

## 6. Success Scenario (No Pivot Needed)

**If metrics stay in Green Zone for 8 weeks:**

1. Move to **growth phase** (Phase 8: Beta & Launch Prep in roadmap)
2. Start monetization planning (subscription model)
3. Expand feature set (P1 features from PRD)
4. Increase marketing efforts
5. Hire/expand team if revenue supports it

**Growth Pivot (Good Problem):**

- If retention >50% but AI costs explode: Pivot to freemium (free basic, paid for advanced insights)
- If users love it but want more: Pivot to "HabitDx Pro" with deeper analytics
- If organic growth stalls: Pivot to referral program or partnerships

---

## 7. Communication Plan

### Internal (Team)

- **Weekly Check-In:** Review metrics vs. thresholds
- **Pivot Decision:** Team vote (consensus required for major pivots)
- **Pivot Execution:** Update roadmap, re-prioritize tasks

### External (Users)

- **Transparency:** If we pivot, tell users why (builds trust)
- **Example Email:** "We noticed [metric], and based on your feedback, we're making [change]. Here's why..."
- **User Involvement:** For major pivots, survey users before executing

---

## 8. Appendix: Pivot Case Studies

### Case Study 1: Instagram (Burbn → Instagram)

**Original:** Location check-in app with photos (like Foursquare)  
**Pivot:** Photo-only sharing app  
**Trigger:** Users only used photo feature, ignored check-ins  
**Learning:** Find what users love, cut the rest

**Application to HabitDx:** If users love Failure Profile but ignore weekly insights, pivot to "Habit Personality Test" product.

---

### Case Study 2: Slack (Gaming → Team Chat)

**Original:** MMO game called Glitch  
**Pivot:** Internal chat tool they built for the game  
**Trigger:** Game failed, but team loved the chat tool  
**Learning:** Sometimes the side project is the real product

**Application to HabitDx:** If AI insight engine is strong but habit tracking is weak, pivot to "AI Life Coach API" for other apps.

---

### Case Study 3: YouTube (Video Dating → Video Sharing)

**Original:** Video dating site  
**Pivot:** General video sharing platform  
**Trigger:** No one used dating feature, but people uploaded random videos  
**Learning:** Let users define use cases, don't force your vision

**Application to HabitDx:** If users use Failure Profile for self-awareness but don't want habit tracking, pivot to "Personality Insights App."

---

**Document Owner:** Blake  
**Last Updated:** February 16, 2026  
**Next Review:** After first 50 users complete onboarding
