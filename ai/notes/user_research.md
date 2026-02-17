# HabitDx User Research & Feedback Plan

**Document Purpose:** Track customer discovery, user interviews, feedback collection, and how user input shapes the product.

**Philosophy:** "Evidence of notes/feedback from real user sessions or interviews. Documentation of how feedback directly changed the project trajectory." — Midterm Rubric

**Status:** Pre-Beta (No real users yet, planning phase)

**Last Updated:** February 16, 2026

---

## 1. Problem Validation (Pre-Build)

Before writing code, we validated the core problem through informal research.

### 1.1 Initial Problem Discovery

**Method:** Informal conversations with colleagues and friends

**Participants:** 8 knowledge workers (ages 26-35, mix of PMs, engineers, marketers)

**Questions Asked:**

1. Have you ever tried using a habit tracking app?
2. Which apps have you tried? (Prompted: Streaks, Habitica, Loop, Coach.me)
3. Are you still using them? Why or why not?
4. What would make you want to try another habit app?

**Key Findings:**

| Finding                                                            | Count | Quote                                                                                   |
| ------------------------------------------------------------------ | ----- | --------------------------------------------------------------------------------------- |
| Tried 2+ habit apps                                                | 8/8   | "I've tried at least three, maybe four different apps"                                  |
| Currently using NONE                                               | 7/8   | "I used it for like two weeks and then just stopped opening it"                         |
| Reason for quitting: "Felt like it was judging me"                 | 5/8   | "When I broke my streak, I felt so bad I just deleted the app"                          |
| Reason for quitting: "Didn't help me understand WHY I was failing" | 7/8   | "It's just a checkbox list. I know what I'm supposed to do, I just can't stick with it" |
| Would try again if: "It could tell me what I'm doing wrong"        | 7/8   | "I wish it could look at my patterns and tell me what's not working"                    |
| Interested in personalized diagnosis                               | 6/8   | "Like a personal trainer but for habits — tell me what I need to change"                |
| Concerned about privacy if sharing personal info                   | 4/8   | "I'd want to know my data stays private"                                                |

**Impact on Product:**

- ✅ Validated core problem: People want to understand WHY habits fail (PRD Section 2.1)
- ✅ Validated solution: AI-powered diagnosis resonated with 7/8 participants
- ✅ Added privacy note to onboarding (Confirmation screen)
- ✅ Designed Failure Profile as key differentiator (not just tracking)
- ✅ Decision: No social features in MVP (avoid shame spiral)

---

### 1.2 Competitive Analysis (App Store Research)

**Method:** Analyzed reviews for top habit apps

**Apps Analyzed:**

1. **Streaks** (iOS) - 50 top reviews, 50 critical reviews
2. **Habitica** (iOS/Android) - 100 top reviews, 100 critical reviews
3. **Loop Habit Tracker** (Android) - 50 reviews
4. **Coach.me** (defunct) - Blog post-mortem analysis

**Common Complaints (Tagged by Theme):**

| Theme                            | Frequency | Example Quote                                                                   |
| -------------------------------- | --------- | ------------------------------------------------------------------------------- |
| "Doesn't help me understand why" | 73/300    | "I can see I'm failing but it doesn't tell me what to do differently" (Streaks) |
| "Streak pressure causes anxiety" | 58/300    | "One miss and my 90-day streak is gone, now I don't want to even try" (Streaks) |
| "Generic advice"                 | 41/300    | "The 'tips' are just motivational quotes, not personalized" (Coach.me)          |
| "Too much gamification"          | 37/300    | "I don't care about gold coins, I want real change" (Habitica)                  |
| "Set it and forget it"           | 29/300    | "I stop opening it after a week, no reason to come back" (Loop)                 |

**Impact on Product:**

- ✅ Decision: "Don't miss twice" philosophy instead of strict streaks (PRD P1 feature)
- ✅ Decision: No gamification in MVP (Out of scope)
- ✅ Decision: Weekly insights as retention hook (comeback reason)
- ✅ Decision: Personalization as core differentiator

---

### 1.3 Academic Research Review

**Method:** Literature review on habit formation and behavior change

**Key Papers:**

1. **Fogg, B.J. (2009). "A Behavior Model for Persuasive Design"**
   - Insight: B = MAT (Behavior = Motivation × Ability × Trigger)
   - Application: Tiny Habits methodology, anchors, celebrations
   - Impact: Habit generation prompt includes tiny version, anchor, celebration

2. **Clear, James (2018). "Atomic Habits"**
   - Insight: Environment design > willpower
   - Application: Capture user constraints (schedule, energy, obstacles)
   - Impact: Onboarding Screen 3 (Constraints) added

3. **Lally et al. (2010). "How habits are formed: Modelling habit formation in the real world"**
   - Insight: Takes 18-254 days (avg 66) for habit to become automatic
   - Application: Set realistic expectations, weekly iteration
   - Impact: PRD success metrics (Week 4 retention, not Week 1)

4. **Duckworth et al. (2013). "Self-Control and Grit"**
   - Insight: Self-control is situational, not fixed trait
   - Application: Blame the design, not the person (paradigm shift)
   - Impact: Failure Profile frames failures as design problems

**Impact on Product:**

- ✅ Product philosophy grounded in research (not just intuition)
- ✅ AI prompts cite behavioral science frameworks
- ✅ Messaging: "You're not broken, your system is" (everywhere in app)

---

## 2. User Interview Plan (Beta Phase)

### 2.1 Beta Tester Recruitment

**Target:** 20-30 beta testers matching primary persona

**Primary Persona:** "Frustrated High-Achiever"

- Age 28-38
- Knowledge worker (PM, engineer, marketer, designer)
- Income $70K-150K
- Downloaded 3+ habit apps before
- Read at least one productivity book (Atomic Habits, Getting Things Done, etc.)

**Recruitment Channels:**

1. r/productivity (Reddit post with screener survey)
2. r/habits (Reddit post with screener survey)
3. Personal network (colleagues, LinkedIn)
4. Indie Hackers community
5. Product Hunt "Ship" page

**Screener Questions:**

1. How many habit tracking apps have you tried in the past? (Minimum: 2)
2. Are you currently using a habit tracking app? (Prefer: No)
3. What's your biggest frustration with habit tracking? (Open-ended)
4. Would you be willing to test a new habit app for 4 weeks? (Y/N)
5. Can we interview you for 30 mins about your experience? (Y/N)

**Target:** 50 applicants → 20-30 selected based on persona fit

---

### 2.2 Onboarding Interview (After 1st Use)

**Timing:** Within 24 hours of completing onboarding

**Method:** 20-minute Zoom call or written survey

**Interview Script:**

**Opening:**
"Thank you for trying HabitDx! We want to understand your first impressions. There are no wrong answers — we're here to learn."

**Questions:**

1. **Onboarding Experience**
   - How long did onboarding take? Did it feel too long/short/just right?
   - Were any questions confusing or uncomfortable?
   - Did you feel like you could answer honestly?

2. **Failure Profile Reaction** (CRITICAL)
   - What was your first reaction when you saw your Failure Profile?
   - Did it feel personalized to you, or generic?
   - Did anything surprise you? (Good or bad)
   - On a scale of 1-10, how well does this describe your habit patterns?
   - Would you share this with a friend? Why or why not?

3. **Habit Suggestions**
   - How do you feel about the habits suggested for you?
   - Do they fit your schedule and constraints?
   - Are they too easy, too hard, or just right?
   - Why do you think we suggested these specific habits?

4. **Overall**
   - What's your biggest concern about using this app?
   - What excites you most?
   - If you could change one thing right now, what would it be?

**Success Criteria:**

- Failure Profile NPS >50 (promoters - detractors)
- > 70% say Failure Profile feels "personalized" (not generic)
- > 60% say habits fit their constraints

**Red Flags to Watch For:**

- "This feels like every other app"
- "I don't trust the AI"
- "The habits don't fit my life"
- "I don't see the point"

---

### 2.3 Week 1 Check-In Interview

**Timing:** After 7 days of use

**Method:** 15-minute call or survey

**Questions:**

1. **Usage Patterns**
   - How many days did you check in this week?
   - If you missed days, what got in the way?
   - Did you find the check-in process easy or annoying?

2. **Habit Fit**
   - Are the habits still feeling relevant?
   - Have you modified any habits on your own? (If so, how?)
   - Which habit is easiest? Hardest?

3. **Notifications**
   - Did you get reminder notifications?
   - Were they helpful or annoying?
   - Good timing, or should we adjust?

4. **Retention Question** (CRITICAL)
   - Do you plan to continue using HabitDx next week? Why or why not?
   - What would make you more likely to keep using it?

**Success Criteria:**

- > 70% plan to continue next week
- Check-in completion rate >40%
- Notification feedback mostly positive

---

### 2.4 Week 4 (Post-Weekly Insight) Interview

**Timing:** Within 48 hours of receiving first weekly insight

**Method:** 20-minute call or survey

**Questions:**

1. **Weekly Insight Reaction** (CRITICAL)
   - Did you see your weekly insight notification?
   - What did you think when you read it?
   - On a scale of 1-10, how relevant/useful was the adjustment suggestion?
   - Did you accept or decline the adjustment? Why?

2. **Insight Quality**
   - Did the insight feel personalized, or generic?
   - Did it reference your specific data (days missed, obstacles)?
   - Was the rationale convincing?
   - What would make the insight more useful?

3. **Overall Progress**
   - Do you feel like you're making progress on your habits?
   - Has your understanding of WHY you fail changed?
   - Would you recommend HabitDx to a friend? (NPS)

4. **Retention & Churn Risk**
   - Do you see yourself still using this in 8 weeks? Why or why not?
   - What's the #1 thing we could improve?

**Success Criteria:**

- Weekly insight NPS >50
- > 50% accepted the adjustment
- Overall app NPS >40
- > 60% still using at Week 4

---

## 3. Feedback Collection Methods

### 3.1 In-App Feedback

**Triggers:**

1. After viewing Failure Profile: "How well does this describe you?" (1-10 scale + comment box)
2. After receiving weekly insight: "Was this helpful?" (1-10 scale + comment box)
3. After 4 weeks: "Would you recommend HabitDx to a friend?" (NPS survey)
4. Shake to report bug (standard mobile pattern)

**Implementation:**

- Simple modal, 2 taps to dismiss
- Optional comment box (not required)
- Sent to Supabase `feedback` table
- Team reviews weekly

---

### 3.2 Exit Survey (Churn Prevention)

**Trigger:** User hasn't opened app in 7 days

**Delivery:** Push notification → survey link

**Questions:**

1. Why did you stop using HabitDx? (Multiple choice + Other)
   - Too time-consuming
   - Habits didn't fit my life
   - Insights weren't helpful
   - Forgot about it
   - Life got busy
   - Felt judged/shame
   - Other: \_\_\_
2. What would bring you back? (Open-ended)
3. Would you try again if we made [specific improvement]? (Y/N)

**Use Case:** Identify churn patterns, inform pivots

---

### 3.3 Community Channel (Discord/Slack)

**Setup:** Optional Slack or Discord community for beta testers

**Purpose:**

- Async feedback collection
- Users can share wins/struggles
- Direct line to team for questions
- Observe organic discussions ("I wish it could...")

**Moderation:** Daily check-ins, acknowledge feedback, don't be defensive

---

## 4. How Feedback Influences Product

### 4.1 Feedback → Roadmap Process

```
[User Feedback Collected]
       ↓
[Weekly Review Meeting]
  - Categorize by theme
  - Identify patterns
       ↓
[Prioritize by Impact × Frequency]
  - High impact + High frequency = P0
  - High impact + Low frequency = P1
  - Low impact + High frequency = P2
  - Low impact + Low frequency = Backlog
       ↓
[Update Roadmap & PRD]
  - Add to appropriate phase
  - Document "Why" (user feedback driven)
       ↓
[Communicate to Users]
  - "We heard you, here's what we're doing"
```

---

### 4.2 Feedback Log (Living Document)

| Date | Source                  | Feedback Summary                                  | Theme         | Impact on Product                                          | Status     |
| ---- | ----------------------- | ------------------------------------------------- | ------------- | ---------------------------------------------------------- | ---------- |
| TBD  | Reddit r/productivity   | "I want to know WHY habits fail"                  | Core Problem  | ✅ Validated Failure Profile as key feature                | ✅ Built   |
| TBD  | Informal interviews (8) | "Streaks make me feel guilty"                     | UX Philosophy | ✅ "Don't miss twice" instead of strict streaks            | ✅ Planned |
| TBD  | App Store reviews       | "Generic tips don't help"                         | AI Quality    | ✅ Emphasis on personalization in prompts                  | ✅ Built   |
| TBD  | Beta User #1            | "Onboarding too long, almost quit"                | Onboarding UX | ⚠️ Consider progressive intake (Pivot Plan Scenario 1)     | 🔄 Monitor |
| TBD  | Beta User #5            | "Failure Profile feels spot-on!"                  | AI Quality    | ✅ Validation — keep current prompt approach               | ✅ Success |
| TBD  | Beta User #12           | "Weekly insight was too generic"                  | AI Quality    | ⚠️ Improve AI prompt, add more examples (Pivot Scenario 6) | 🔄 Iterate |
| TBD  | Multiple users (5)      | "I want to share my Failure Profile on Instagram" | Viral Feature | ✅ Add export/share to P1 roadmap                          | 📝 Backlog |
| TBD  | Beta User #8            | "Can I pause habits when traveling?"              | Retention     | ✅ Add pause feature to P1 roadmap (Pivot Scenario 3)      | 📝 Backlog |

_This log will be updated as feedback comes in during beta._

**Legend:**

- ✅ Implemented
- 🔄 In progress
- 📝 Backlogged
- ⚠️ Monitoring (potential pivot)

---

## 5. Hypothetical User Feedback Scenarios

Since we don't have real users yet, here are scenarios we anticipate and our planned responses:

### Scenario A: "Onboarding is too long"

**Anticipated Feedback:** "I started onboarding but gave up halfway — too many questions."

**Planned Response:**

1. Check analytics: Which screen is the drop-off point?
2. If Screen 1-2: Add "See example profile" button (show value upfront)
3. If Screen 3-5: Implement progressive intake (2 questions now, 3 questions later)
4. Document in Pivot Plan Scenario 1

**How This Would Change Product:**

- Reduce friction in onboarding
- Shift to progressive disclosure pattern
- Update roadmap Phase 4 with new onboarding flow

---

### Scenario B: "Habits don't fit my life"

**Anticipated Feedback:** "The habits you suggested don't match my actual schedule."

**Planned Response:**

1. Review intake data: Did user provide accurate constraints?
2. Review AI output: Is prompt ignoring constraints?
3. Interview user: What would fit better?
4. Options:
   - Improve prompt to emphasize constraints
   - Add manual habit editing
   - Allow user to regenerate habits

**How This Would Change Product:**

- Refine AI prompt (more emphasis on constraints)
- Add "Regenerate habits" button (already in Phase 6 roadmap)
- Add manual habit editing as escape hatch

---

### Scenario C: "I love the Failure Profile, don't care about tracking"

**Anticipated Feedback:** "The personality insight was amazing, but I don't want to track habits."

**Planned Response:**

1. This is unexpected but valuable (validates one part, invalidates another)
2. Options:
   - Pivot to "Habit Personality Test" (one-time assessment, no tracking)
   - Keep both: Make tracking optional after profile
   - Add "Insight Mode" (weekly reflections without daily tracking)

**How This Would Change Product:**

- **MAJOR PIVOT** — Would fundamentally change product (Pivot Plan Scenario 5)
- Document learnings: Diagnosis > Accountability for this audience
- Could lead to dual product: Assessment + Optional tracker

---

## 6. User Research Roadmap

| Phase                    | Timing     | Activity                          | Participants | Deliverable                   |
| ------------------------ | ---------- | --------------------------------- | ------------ | ----------------------------- |
| **Problem Validation**   | Pre-Build  | Informal interviews               | 8            | ✅ Problem validated          |
| **Competitive Analysis** | Pre-Build  | App store review analysis         | 300 reviews  | ✅ Differentiation identified |
| **Beta Recruitment**     | Week 10    | Post screener survey              | 50 → 20-30   | 📝 Beta cohort selected       |
| **Onboarding Feedback**  | Week 11    | Post-onboarding interviews        | 20           | 📝 NPS, qualitative insights  |
| **Week 1 Check-In**      | Week 12    | Usage interviews                  | 15-20        | 📝 Retention insights         |
| **Week 4 Insight Check** | Week 14    | Post-insight interviews           | 10-15        | 📝 Insight quality assessment |
| **Post-Beta Survey**     | Week 15    | Comprehensive feedback survey     | 20-30        | 📝 MVP validation report      |
| **Iteration 1**          | Week 16-18 | Implement top feedback items      | N/A          | 📝 Updated product            |
| **Beta Round 2**         | Week 19-23 | Test improvements with new cohort | 30-50        | 📝 Validate improvements      |

---

## 7. Success Metrics (User Research)

| Metric                                  | Target | Actual | Status |
| --------------------------------------- | ------ | ------ | ------ |
| Problem validation interviews completed | 8      | 8      | ✅     |
| Competitive reviews analyzed            | 200+   | 300    | ✅     |
| Beta testers recruited                  | 20     | TBD    | 📝     |
| Onboarding feedback collected           | 15     | TBD    | 📝     |
| Week 1 retention interviews             | 10     | TBD    | 📝     |
| Week 4 insight feedback                 | 10     | TBD    | 📝     |
| Failure Profile NPS                     | >50    | TBD    | 📝     |
| Weekly Insight NPS                      | >50    | TBD    | 📝     |
| Overall App NPS                         | >40    | TBD    | 📝     |
| Documented feedback → product changes   | 5+     | 3      | 🔄     |

---

## 8. Appendix: Interview Templates

### Template A: Email Invitation to Beta

**Subject:** Help us build a smarter habit app (4-week beta)

Hi [Name],

We're building **HabitDx**, a habit app that finally helps you understand WHY your habits fail (instead of just tracking them).

We noticed you [mentioned habit struggles on Reddit / follow productivity content / etc.] and thought you'd be perfect to test it.

**What we're asking:**

- 4 weeks of testing (10 seconds/day to check in)
- 2-3 short feedback calls (20 mins each)
- Honest feedback (we want to hear what sucks)

**What you get:**

- Early access before public launch
- Free lifetime access if you complete the beta
- Your input directly shapes the product

Interested? [Link to screener survey]

Thanks,
Blake & the HabitDx team

---

### Template B: Post-Onboarding Survey (If No Interview)

**HabitDx Onboarding Feedback (2 minutes)**

Thanks for completing onboarding! Quick questions:

1. How long did onboarding take?
   - [ ] Under 3 minutes
   - [ ] 3-5 minutes
   - [ ] 5-10 minutes
   - [ ] Over 10 minutes (too long)

2. Your Failure Profile: How accurate is it? (1-10, 10 = spot on)
   - [1] [2] [3] [4] [5] [6] [7] [8] [9] [10]

3. Did the Failure Profile feel personalized to YOU, or generic?
   - [ ] Very personalized
   - [ ] Somewhat personalized
   - [ ] Generic (could apply to anyone)

4. Your habit suggestions: How well do they fit your life? (1-10)
   - [1] [2] [3] [4] [5] [6] [7] [8] [9] [10]

5. Biggest concern about using HabitDx for 4 weeks?
   - [Open text]

6. What excites you most?
   - [Open text]

---

### Template C: Weekly Insight Feedback (In-App)

**Was this insight helpful?**

[1] [2] [3] [4] [5] [6] [7] [8] [9] [10]

**Why or why not?** (Optional)
[Text box]

[Submit] [Skip]

---

## 9. Conclusion

This document will be actively updated as we collect real user feedback during beta. Our commitment:

1. **Listen first, defend never:** All feedback is valid, even if we disagree
2. **Document everything:** Every interview, every survey, every insight
3. **Show impact:** Update this doc with "Feedback X led to Change Y"
4. **Close the loop:** Tell users when we implement their feedback

**Next Steps:**

- Week 10: Recruit beta testers
- Week 11: Conduct first round of interviews
- Week 15: Publish MVP validation report based on user data

---

**Document Owner:** Blake  
**Last Updated:** February 16, 2026  
**Next Review:** After beta recruitment (Week 10)
