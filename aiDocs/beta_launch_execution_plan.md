# HabitDx Beta Launch Execution Plan

**Purpose:** Convert the existing strategy into a week-by-week operating plan for beta, launch readiness, and the first 30 days after release.

**Last Updated:** March 23, 2026

---

## 1. Beta Goal

Validate that HabitDx creates enough immediate value and repeat engagement to support launch.

**Primary success thresholds**
- Onboarding completion: `>70%`
- Week 1 return rate: `>40%`
- Week 4 retention: `>20%`
- Iteration acceptance: `>50%`
- Failure Profile NPS: `>50`
- Weekly Insight NPS: `>50`

**Pivot tripwires**
- Onboarding completion: `<50%`
- Week 1 return rate: `<25%`
- Week 4 retention: `<12%`
- Iteration acceptance: `<30%`
- Failure Profile NPS: `<20`
- Weekly Insight NPS: `<20`

---

## 2. Beta Timeline

### Week 0: Setup
- Create production Supabase project: `habitdx-production`
- Add production environment variables from [.env.example](/Users/blake/Documents/HabitDx/HabitDx/.env.example)
- Publish privacy policy and terms URLs
- Configure support email, beta feedback form, exit survey, and community invite
- Confirm app build and device install flow for iOS and Android

### Week 1: Recruitment + Onboarding Interviews
- Recruit `20-30` testers from personal network, LinkedIn, Reddit, and Indie Hackers
- Enroll only testers who match the target persona and agree to 4 weeks of use
- Trigger first interview within `24 hours` of onboarding completion
- Review onboarding completion funnel daily

### Week 2: Early Retention Review
- Audit daily check-in consistency for each tester
- Run Week 1 interviews and categorize friction into:
  - onboarding
  - habit fit
  - notifications
  - trust in AI
  - bugs
- Ship only fixes that improve activation or unblock usage

### Weeks 3-4: Iteration Quality Review
- Ensure testers receive at least one weekly insight
- Run Week 4 interviews within `48 hours` of insight delivery
- Review iteration acceptance and insight usefulness
- Decide whether launch proceeds, slips for iteration, or triggers a pivot path

---

## 3. Operating Cadence

### Daily
- Check onboarding completion
- Check number of users who logged at least one habit yesterday
- Review beta form submissions, support email, and community posts
- Tag every issue as `bug`, `ux`, `trust`, `habit-fit`, or `feature-request`

### Twice Weekly
- Review top friction themes
- Decide whether to hotfix, backlog, or ignore
- Update the feedback-to-roadmap log in [ai/notes/user_research.md](/Users/blake/Documents/HabitDx/HabitDx/ai/notes/user_research.md)

### Weekly
- Review the 6 pivot metrics
- Compare against thresholds in [aiDocs/pivot_plan.md](/Users/blake/Documents/HabitDx/HabitDx/aiDocs/pivot_plan.md)
- Publish one short internal summary:
  - what changed
  - what users said
  - which metric moved
  - what we will test next

---

## 4. Event-to-Metric Mapping

Use the lightweight instrumentation now in the app to capture these events in logs and later wire them into a real analytics provider.

| Metric | Event Source | Formula |
| --- | --- | --- |
| Onboarding completion | `onboarding_completed` | completed onboarding / signed up |
| Week 1 return rate | `habit_checked_in` after day 1-7 | users active in days 2-7 / signups |
| Week 4 retention | `habit_checked_in` or `weekly_iteration_generated` in days 22-28 | active day-28 users / signups |
| Iteration acceptance | `weekly_iteration_adjustment_accepted` vs generated | accepted / generated |
| Failure Profile NPS | interview + survey responses | promoters - detractors |
| Weekly Insight NPS | interview + survey responses | promoters - detractors |

---

## 5. Launch Blockers

Launch should not proceed until these are complete:

- Production Supabase project exists and migrations are run
- Edge Functions are deployed in production
- Privacy policy and terms are live
- App icon and screenshots are finalized
- Support email is live
- Beta feedback form, community link, and exit survey are configured
- At least `20` beta testers are active or have completed feedback

---

## 6. Post-Launch 30-Day Focus

### Days 1-7
- Watch crash reports and launch funnel twice daily
- Fix only blocking bugs and obvious onboarding friction
- Respond to every user message or review

### Days 8-30
- Prioritize requests that improve retention, trust, and habit fit
- Do not expand scope into broad feature work unless metrics are stable
- Re-run pivot check weekly and document decisions

---

## 7. Recommended Owner View

- Product: recruitment, interviews, prioritization
- Engineering: production infra, builds, bug fixes, analytics wiring
- Support: feedback triage, community moderation, app store review response

For a solo founder, this means protecting a strict order of operations:
1. instrumentation and support links
2. beta recruitment
3. feedback review
4. retention fixes
5. store submission assets
