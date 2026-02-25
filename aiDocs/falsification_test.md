# HabitDx Falsification Test

**Date:** February 24, 2026
**Stage:** Pre-beta / early discovery
**Purpose:** Try to disprove the core hypothesis before building further.

---

## 1. Core Hypothesis

> "Users aren't failing because of weak willpower. They're failing because their system is poorly designed for their life."

---

## 2. Core Assumptions

The hypothesis only holds if all of the following are true:

1. **The target user exists as described.** Knowledge workers 28–38 who've tried 3+ habit apps and are still actively looking for a better solution are a real, findable segment — not a fringe group who've already given up on habit apps entirely (aiDocs/prd.md).
2. **System redesign is the bottleneck, not something else.** The primary reason habits don't stick is fixable through better personalization and weekly iteration — not structural life constraints (overwork, burnout, caregiving) that no app can redesign around.
3. **Users will accept the reframe.** The target user will engage with "your system is broken" as an actionable, non-obvious insight — rather than treating it as obvious, dismissing it as jargon, or preferring the simpler explanation ("I just need to try harder").
4. **Diagnosis drives behavior change.** Understanding *why* they failed will cause users to act differently. There is a meaningful gap between receiving a diagnosis and actually changing behavior that we are claiming to close.

---

## 3. We're Wrong If…

Conditions observable through discovery interviews and prototype tests this week:

| Condition | Falsification Threshold |
|---|---|
| Target persona can't be reached | Fewer than 5 qualifying strangers (28–38, knowledge worker, quit 2+ habit apps) respond to cold outreach within one week |
| Problem framing rejected | Fewer than 3 of 5 interviewees spontaneously describe their failure as a design/fit problem rather than a motivation/willpower problem |
| Reframe dismissed as obvious | 3 or more say "yeah I already knew that" when presented with a system-design diagnosis — no surprise, no new insight |
| Diagnosis doesn't produce action intent | 3 or more interviewees look at the Failure Profile mockup and cannot describe what they would do differently |
| Existing solutions rated "good enough" | 3 or more say a current tool (any app, a notes system, a coach) already meets their need well enough that they're not actively seeking a replacement |

---

## 4. Disconfirming Signals

Top 5 things we would observe or hear if we're wrong:

1. **"I just need more discipline."** The target user consistently frames their failure as a personal deficiency — not a systems problem. If they're not looking for a diagnosis and don't believe one would help, the product's core premise doesn't land.

2. **"I've already figured out why I fail — I just can't fix it."** Users accurately diagnose themselves but don't act on it. If self-awareness of failure patterns is already high but doesn't translate to change, adding an AI diagnosis doesn't move the needle. Diagnosis ≠ behavior change.

3. **"My life is just too chaotic right now."** Users attribute failure to a period of structural overload — a demanding job, a young child, a business crisis — with no openness to system redesign as a solution. If the root cause is genuinely unfixable by better habit design, we're targeting the wrong moment in their life, not the wrong product (aiDocs/prd.md lists "Overwhelmed New Parent" as a secondary persona for this reason).

4. **"Streaks / Notion / a spreadsheet works fine for me."** The competition turns out to be good enough. The target user has already self-solved with a simpler tool and doesn't feel the gap we're designing for. The PRD acknowledges this risk by explicitly excluding "casual users wanting a simple checkbox" — but we haven't verified that this segment is small (aiDocs/prd.md).

5. **"A 5-minute onboarding sounds like a lot."** The target user's stated #1 obstacle is no time (aiDocs/prd.md). If the minimum viable intake required for personalization exceeds their tolerance — even at the promise of better output — they churn before the product can help them. The PRD identifies onboarding completion <50% as a pivot trigger but we have no baseline for what to expect (aiDocs/prd.md).

---

## 5. Test Method

**Who qualifies:** Knowledge workers, age 28–38, who have downloaded and stopped using at least 2 habit apps. Salaried employees preferred over business owners to match the PRD primary persona (aiDocs/prd.md). Recruited cold from r/productivity, r/habits, or Notion/Obsidian communities — not from the founder's network.

**What we do:**
1. Open-ended: *"Tell me about the last time you tried to build a habit and stopped. What happened?"* No framing, no product mention.
2. Probe: *"Did you ever figure out why it fell apart? What did you tell yourself?"* Listen for whether they name a design/fit cause vs. willpower/structural cause.
3. Reframe test: Say *"Some people describe that as a system design problem rather than a motivation problem. Does that framing resonate?"* Watch for genuine recognition vs. polite agreement.
4. Mockup: At the end only, show the Failure Profile screen. Ask: *"What would you do next if you saw this?"*

**How we avoid bias:** Do not describe HabitDx or the hypothesis before step 4. Record sessions or take verbatim notes. Do not count polite agreement as confirmation — count only spontaneous or unprompted alignment.

---

## 6. Evidence Summary

### Supporting

- The PRD's target persona description — "shame from repeated failure, no diagnosis of root causes, rigid systems that break" — is a coherent framing of the problem, built on the team's prior research (aiDocs/prd.md). Whether it accurately describes real users at scale is untested.
- One external interview (Shawna, a fitness studio owner) independently named the diagnostic gap: she wanted the app to help her understand why she kept falling off, not just log it (ai/notes/customer_interviews/shawna.md). This is one aligned data point, not a pattern.
- The PRD cites app store complaints and informal colleague interviews as further supporting evidence, but these are not independently documented in this repo and should not be weighted heavily (aiDocs/prd.md).

### Threatening

- **Wrong persona tested.** The only formal interview conducted (Shawna) is a business owner running two studios — not a salaried knowledge worker 28–38. Her failure mode is driven by unpredictable external business events, which may differ structurally from the target persona's failure mode. We have not yet interviewed the persona we're building for (ai/notes/customer_interviews/shawna.md, aiDocs/prd.md).
- **No behavioral evidence exists.** Every data point is attitudinal ("I would want," "I wish it could"). No one has used HabitDx, returned after a failure, or changed a habit because of a weekly AI insight. Attitude-behavior gaps are common.
- **What evidence we still lack:** (1) Interviews with salaried knowledge workers 28–38 who match the PRD primary persona. (2) A test of whether users accept the "system design" reframe or dismiss it. (3) Any evidence that receiving a diagnosis changes what a user does next. These are the three most critical gaps before building further.

---

## 7. Bias / Limitations

- **Founder-defined persona.** The target user description in the PRD was written by the team building the product. It may describe the ideal customer rather than the most findable one.
- **Circular reasoning risk.** The PRD uses its own conclusions ("the bottleneck isn't motivation — it's personalized design") as evidence for the product premise. This is a hypothesis stated as a finding, not a tested claim (aiDocs/prd.md).
- **Confirmation-prone research methods.** Survey-style written interviews with a sympathetic respondent, informal conversations within the founder's network, and self-assessed app store review themes all have strong confirmation bias potential. None involved an adversarial or independent researcher.
- **All evidence is pre-product.** There is no retention data, no click data, no evidence of anyone returning to a diagnostic app after a failure. The entire evidence base is discovery-stage hypothesis material.

---

## 8. Decision

**Inconclusive.**

The hypothesis is plausible and the problem framing is coherent. But we have not tested it against the actual target persona, we have no behavioral evidence, and the one external data point (Shawna) may not generalize. The PRD's self-described due diligence is hypothesis formation, not hypothesis testing.

Do not treat current evidence as validation. Do not pivot. Run the next test before adding features.

---

## 9. Next Cheapest Falsification Test

**5 cold intercept interviews with salaried knowledge workers. This week. No product shown until the end.**

**Exact steps:**
1. Post in r/productivity or r/habits: *"Quick question for anyone who's tried and quit a habit app — happy to chat for 20 min."* DM 10 people who respond and match the persona (28–38, knowledge worker). Do not mention HabitDx.
2. Run the interview protocol in Section 5 above.
3. After all 5 sessions, tally: How many spontaneously described a design/fit failure (vs. willpower)? How many were surprised by the system-design reframe (vs. dismissing it as obvious or unfamiliar)? How many described a next action after seeing the Failure Profile?

**Pass conditions (continue building):**
- 3+ of 5 spontaneously name a design/fit cause without prompting
- 3+ show genuine recognition (not just polite agreement) when the reframe is offered
- 3+ describe a concrete next action after seeing the mockup

**Fail conditions (revisit hypothesis):**
- Fewer than 3 of 5 spontaneously name system design as a cause
- Majority describe structural causes an app cannot address
- Majority look at the Failure Profile and don't know what to do with it

**Cost:** ~5 hours. No code. No product demo. Can be completed this week.
