# HabitDx Falsification Test

**Date:** February 24, 2026
**Author role:** Skeptical product researcher
**Purpose:** Attempt to disprove the core hypothesis before committing further resources.

---

## 1. Core Hypothesis

> Users who repeatedly fail at habit-building do so primarily because they lack personalized diagnosis of *why* they fail — not because of motivation or knowledge gaps — and will retain an AI-powered diagnostic app (HabitDx) beyond 4 weeks at a rate of >20%, meaningfully above the ~5–10% industry baseline for habit apps.

This is falsifiable: it makes a specific causal claim (diagnosis is the bottleneck) and a specific behavioral prediction (>20% 4-week retention).

---

## 2. Core Assumptions

The hypothesis only holds if all of the following are true:

1. **The failure cause is diagnosable.** The reason users fail is a fixable pattern (wrong timing, over-stacking, poor environment) — not a structural life problem (unsustainable workload, burnout, situational chaos) that no app can resolve.
2. **AI output feels personalized, not generic.** Five minutes of onboarding intake produces enough signal for the AI to generate insights users experience as specific to them — not boilerplate advice repackaged.
3. **Users will return to act on adjustments.** Receiving one good diagnosis is not enough; users must repeatedly engage with the weekly iteration loop, which requires them to trust the process and have enough slack in their life to act on it.
4. **The target user is reachable at scale.** "Knowledge workers 28–38 who've tried 3+ habit apps" is a real, findable segment with sufficient density to build a product on — not a narrow fringe.

---

## 3. "We're Wrong If…" Criteria

We should treat the hypothesis as falsified or in serious doubt if any of the following are observed after 4 weeks with ≥50 active users:

| Condition | Falsification Threshold |
|---|---|
| 4-week retention | < 20% of users active at day 28 |
| Onboarding completion | < 50% of signups complete the intake flow |
| Failure Profile perceived as generic | > 40% of users rate profile as "not specific to me" in feedback |
| Weekly insight open rate | < 30% of users open weekly insight notification |
| Iteration acceptance | < 25% of users accept or act on any weekly adjustment |
| Qualitative signal | Majority of churned users say "it just wasn't useful" rather than "life got in the way" |

Any single threshold breach is a serious signal. Two or more simultaneous breaches constitute falsification.

---

## 4. Disconfirming Signals

These are the top 5 things we would observe or hear if we're wrong:

1. **"I get it, but I'm not opening it."** Users complete onboarding, read their Failure Profile, and don't return — indicating the diagnosis is intellectually interesting but not motivating enough to drive repeated behavior. One-time insight ≠ retention loop.

2. **"It told me what I already knew."** Users describe the AI's output in their own words and it matches generic productivity advice ("try doing it in the morning," "start smaller"). If users cannot articulate something specific to their situation that surprised them, the personalization is failing.

3. **"The real problem is my schedule."** Users acknowledge the insight is accurate but attribute their failure to structural constraints the app cannot change — two jobs, a chaotic business, a newborn. If the root cause is objectively unsustainable life circumstances, diagnosis without structural change is inert.

4. **Users keep running another app alongside HabitDx.** If users use HabitDx for the diagnosis but continue using Noom, Streaks, or a plain notes app for daily tracking, it means we've built a feature, not a product. HabitDx is not replacing anything — it's just a novelty add-on.

5. **WTP evaporates after trial.** Users who expressed interest in paying (~$10/week in the Shawna interview) decline to convert or cancel immediately once a payment wall appears. This means perceived value doesn't survive contact with the commitment decision, which falsifies the "it genuinely works" part of the hypothesis.

---

## 5. Test Method

### Evidence Used

| Source | Type | Relevance |
|---|---|---|
| Shawna customer interview (Feb 24, 2026) | 1 structured written interview | Only formal primary data; real user with prior app experience and articulated needs |
| 8 informal colleague interviews (undated) | Unstructured conversations | Pre-build problem validation; no recording, no independent verification |
| App store review analysis (300 reviews across Streaks, Habitica, Loop, Coach.me) | Secondary research | Indicates failure modes of existing apps; not evidence HabitDx's approach works |
| Academic papers (Fogg 2009, Lally 2010, Clear 2018) | Literature | Supports habit formation theory; does not validate this specific product |
| PRD internal falsifiability section | Self-authored | Founder-written; useful for identifying stated assumptions, not for independently testing them |

### Why These Sources Are Relevant

Shawna is the only independent voice in this dataset. She has direct experience with the exact failure mode HabitDx targets (stress-driven habit collapse, over-stacking, knowledge-application gap) and has used comparable apps. Her responses provide the most honest signal available.

The remaining evidence is either self-generated (PRD analysis, informal interviews the founder conducted) or secondary (reviews, literature). These can inform hypothesis formation but cannot validate it.

---

## 6. Evidence Summary

### Supporting Evidence

- **Shawna explicitly names the diagnostic gap:** "A lot of them just track. They don't help me understand why I keep falling off." This is a direct statement of the problem HabitDx claims to solve.
- **Shawna describes the ideal product in terms that match our feature set:** Pattern recognition over time, one adjustment at a time, adaptive to schedule changes, non-judgmental framing. She described HabitDx without being shown it.
- **She independently validates habit stacking:** Without prompting, she identified that stacking onto an existing anchor is what works for her — validating our habit stack generation approach.
- **Willingness to pay stated:** ~$10/week if she "could genuinely feel it working." This is a meaningful signal, though conditional.
- **App store data surfaces the same complaint:** 73/300 reviews explicitly cite "doesn't help me understand why" as the primary failure — this is a real, recurring user complaint, not a constructed problem.

### Threatening Evidence

- **Shawna's root cause may be structural, not diagnostic.** She runs two fitness studios, manages staff, and operates in a chronically unpredictable environment. She says: "When things get chaotic with the studios, I fall back." An AI diagnosis of "you fail when stress spikes" does not reduce studio cancellations or management load. If the root cause is workload, diagnosis is accurate but insufficient.
- **She still uses Noom.** Despite its simplicity and lack of diagnosis features, Noom has retained Shawna for food tracking. This suggests that for sufficiently bounded domains, simple trackers *do* work. HabitDx may be solving a problem that only exists in broad-domain habit building, not all habit building.
- **WTP is conditional, not committed.** "If I could genuinely feel it working" is a usage retention condition, not a purchase signal. If the app doesn't produce visible progress quickly, she won't pay. This raises the bar: we need demonstrable results within the free trial window.
- **The 8 informal interviews have no independent integrity.** They were conducted by the founder, undated, unrecorded, and reported as a table in the PRD. There are no quotes, no follow-up, no adversarial probing. The 7/8 figure for "wish it could tell me what's wrong" may reflect social desirability bias in conversations with a founder.

---

## 7. Bias and Limitations

**Founder-conducted interviews.** Both the 8 informal conversations and the Shawna interview were conducted by the same person building the product. Founders asking "would you use something that helps you understand why you fail?" to people who like them will get confirmation. There is no adversarial or independent interviewer in this dataset.

**Survey/written format for Shawna.** The interview was written/survey-style, not exploratory. This format tends to elicit answers that match the question framing. We don't know what Shawna would have said if asked open-ended questions with no product context ("tell me about the last time a habit fell apart" vs. "would you want an app that showed you patterns?").

**Selection bias in app store reviews.** People who leave reviews are not representative of all users. The 73/300 "doesn't help me understand why" finding may overrepresent users who are highly self-reflective — exactly the kind of user who would also be most disappointed if HabitDx's AI outputs are generic.

**No behavioral data exists.** Every data point in this test is attitudinal ("I would want," "I wish it could"). There is zero behavioral evidence — no one has used HabitDx and returned, accepted a weekly adjustment, or paid for anything. Attitude-behavior gaps are well-documented in product research. People say they want diagnosis; they may not engage with it when it requires effort.

**Sample size.** One formal interview plus eight informal conversations with the founder's colleagues is not a sufficient basis for a product hypothesis. It is sufficient for generating hypotheses. We have not yet tested them.

**Shawna may not be the target persona.** The PRD targets knowledge workers 28–38. Shawna is a business owner running two fitness studios. Her failure mode (unpredictable external disruption from her business) may be structurally different from a salaried knowledge worker whose schedule is more predictable. If we are pattern-matching on surface similarity ("tried apps, read Atomic Habits, wants something better"), we may be missing a crucial difference in root cause.

---

## 8. Decision + Implication

**Verdict: Inconclusive**

The hypothesis has not been falsified, but it has also not been meaningfully tested. We have one aligned interview with a potentially non-representative user, informal conversations with the founder's social network, and secondary data that establishes the problem exists but not that our solution works.

**What this means:**

- We should not treat the Shawna interview as validation. It is a well-aligned data point that sharpens the hypothesis. It is not confirmation.
- The three threatening signals from Shawna (structural root cause, conditional WTP, residual Noom usage) are more informative than her confirmatory statements. Confirmatory statements from a sympathetic user are expected. Threatening signals from the same user deserve more weight.
- The hypothesis remains plausible. We should not pivot. But we should run the cheapest possible falsification test before building further features.

---

## 9. Next Cheapest Falsification Test

**Test:** Intercept-style prototype test with 5 strangers, no product demo, no founder present.

**Exact method:**
1. Find 5 people who match the target persona (28–38, knowledge worker, tried and quit ≥2 habit apps) from a source *other than* the founder's network. Use r/productivity, r/habits, or a cold DM outreach to the James Clear newsletter community. Do not recruit friends.
2. Do NOT show them the app or describe HabitDx. Ask only: "Tell me about the last time you tried to build a habit and stopped. What did you do when you noticed you were slipping? Did you ever figure out why it fell apart?"
3. After their unprompted response, ask: "If you had known that specific reason at the time, do you think it would have changed anything?" Listen for whether diagnosis is perceived as actionable or irrelevant.
4. At the end only, show them the Failure Profile screen (static mockup, no full app). Ask: "What would you do next with this?" Watch for whether they describe action or express confusion/skepticism.

**Data to collect:**
- Verbatim transcript or recording for each session
- Whether they spontaneously name "not knowing why" as a factor in their failure (unprompted)
- Whether they describe a structural cause (life circumstance) vs. a systemic cause (wrong approach)
- Whether they describe a next action after seeing the Failure Profile, or don't

**What would falsify us:**
- Fewer than 3 of 5 participants spontaneously mention "not understanding why" as a reason they quit — suggests the diagnosis gap is not primary
- 3 or more participants describe structural/life causes that no app could address — suggests we're solving the wrong layer of the problem
- 3 or more participants look at the Failure Profile and cannot describe a next action — suggests the AI output does not translate into behavior change intent

**Cost:** ~5 hours total. No code required. No product demo required. Can be done this week.

**What happens if we pass:** The diagnosis gap is real and unprompted. We continue building. We recruit these 5 users for beta access.

**What happens if we fail:** We update the hypothesis. We consider whether HabitDx is a coach-replacement product (structural support) rather than a diagnostic product, and whether that changes the feature set materially.
