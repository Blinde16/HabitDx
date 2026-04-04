# Cross-Persona Synthesis

**Date:** April 2026  
**Method:** Comparison of independent findings across 6 personas

---

## Patterns Repeated Across Multiple Personas

| Pattern | Personas Affected | Severity |
|---------|-------------------|----------|
| Settings exposes raw env var error messages | Gloria, all (demo risk) | **Critical** |
| Auto-missed detection punishes users who haven't opened app | Diane, Tyler, Marcus | **Critical** |
| "Failure Profile" naming creates negative emotional response | Diane, Gloria, Tyler | **Critical** |
| Can't edit individual habits (only regenerate all) | Marcus, Jordan, all | **High** |
| "Don't miss twice" warning triggers guilt in vulnerable users | Diane, Tyler | **High** |
| Long-press for obstacles is undiscoverable | Gloria, Diane, Raj | **High** |
| No value proposition on login screen | Gloria, Jordan, Raj | **High** |
| Binary tracking misses nuance | Raj, Tyler, Marcus | **High** |
| Insights empty for first-week users | Marcus, all new users | **Medium** |
| No return/re-engagement flow after absence | Tyler, Diane | **High** |
| Wellness-only bias in form onboarding path | Jordan | **Medium** |

---

## Issues Unique to Specific User Types

| User Type | Unique Issue |
|-----------|-------------|
| **Shift workers (Diane)** | Auto-missed timing is fundamentally broken for non-standard schedules; AI doesn't adapt habits to shift patterns |
| **Low-tech users (Gloria)** | No tutorial, no visual affordance for tap-to-complete, "anchor" concept unexplained on home screen |
| **ADHD users (Tyler)** | Binary tracking + streak resets + guilt warnings create an exclusionary experience; needs partial credit |
| **Career goals (Jordan)** | Form path is wellness-only; AI chat handles it but framing doesn't match |
| **Power users (Marcus)** | Wants data export, custom habits, trend charts, granular control — features that don't exist |
| **Evaluators (Raj)** | Tests whether AI personalization is real vs. templated; looks for scientific rigor in claims |

---

## Persona Disagreements

These are cases where the app serves one persona well but fails another:

### AI Chat Onboarding
| Persona | Reaction |
|---------|----------|
| Marcus | Engaging, modern, differentiated |
| Tyler | ADHD-friendly, conversational, loved it |
| Jordan | Handles non-standard goals well |
| Diane | Feels vulnerable sharing failures with a chatbot |
| Gloria | Intimidating, "telling a computer my story" |
| Raj | Effective but wants to test if it's truly adaptive |

**Takeaway:** AI chat is the app's strongest feature for engaged users but needs a gentler on-ramp for hesitant users.

### "Don't Miss Twice" Messaging
| Persona | Reaction |
|---------|----------|
| Marcus | Motivating — aligns with Atomic Habits philosophy |
| Raj | Evidence-based, appropriate |
| Diane | Guilt trigger — she missed because her kid was sick |
| Tyler | Accusatory — he missed because of executive dysfunction |

**Takeaway:** The message is scientifically correct but emotionally tone-deaf for a significant portion of the target audience. Needs context-aware delivery.

### Failure-First Approach
| Persona | Reaction |
|---------|----------|
| Marcus | Insightful, enjoys the self-analysis |
| Raj | Good research methodology, questions validation |
| Diane | Feels like the app is diagnosing what's wrong with her |
| Gloria | "Failure Profile" sounds medical/scary |
| Tyler | Accurate but reinforces his identity as someone who fails |

**Takeaway:** The diagnostic approach is HabitDx's core differentiator and genuinely valued by analytical users. But the NAMING must be softened to avoid alienating emotionally vulnerable users who are the majority of the target market.

### Tiny Habits Model
| Persona | Reaction |
|---------|----------|
| Tyler | "Finally someone gets that 'just start' is the whole battle" |
| Gloria | Feels achievable |
| Raj | Sound Fogg implementation |
| Marcus | Too limiting — wants to do more, wants escalation |
| Raj (skeptic angle) | Where's the escalation path? Tiny → ??? |

**Takeaway:** Tiny versions are universally liked initially but need a growth path to retain power users.

### Celebrations
| Persona | Reaction |
|---------|----------|
| Diane | Warm, positive, genuinely helpful |
| Tyler | Good dopamine hit |
| Jordan | "Fist pump? In my office?" — context mismatch |
| Raj | Scientifically appropriate but passive (should prime before, not remind after) |
| Gloria | Enjoyed them |

---

## Hidden Product Assumptions Exposed

1. **Users have standard schedules.** Auto-missed detection and habit timing assume 9-5 routines.
2. **Users want wellness habits.** HABIT_OPTIONS, GOAL_OPTIONS, and form flow are 100% wellness.
3. **Users are comfortable discussing failure upfront.** Onboarding asks about failures before building any rapport or delivering any value.
4. **Missing = choosing not to do it.** No distinction between "didn't want to" and "couldn't."
5. **Users will discover tap/long-press.** No tutorial, tiny help text.
6. **Env vars are configured.** They're not.
7. **Streaks motivate everyone.** For guilt-prone/ADHD users, streaks punish.
8. **Users have a history of habit-app failure.** First-time habit builders have no "past failures" to analyze.
9. **All habits are additive.** Reduction goals (stop scrolling, drink less) can't be tracked.
10. **Failure analysis is universally helpful.** For some users, it reinforces a failure identity.

---

## Likely Adoption Bottlenecks (Priority Order)

1. **First missed day with no graceful recovery** — this is where most users will churn
2. **Onboarding length and emotional weight** — 3+ chat messages about failures
3. **No value visible before signup** — login wall with no pitch
4. **Settings page credibility** — one tap on Privacy Policy or Support destroys trust
5. **Can't customize habits** — power users leave immediately
6. **Empty Insights tab** — first-week users see a dead-end tab

---

## Likely Demo Bottlenecks (Priority Order)

1. **Settings page env var exposure** — one wrong tap during demo = credibility gone
2. **AI features under latency/failure** — profile generation could hang or error
3. **Empty insights on fresh account** — can't show the weekly iteration feature
4. **"Failure Profile" naming** — evaluators will question why it's called that
5. **Console.log in browser dev tools** — if anyone opens inspector
6. **"Skip for now" signing user out** — if demonstrated accidentally
