# Per-Persona Walkthrough Findings

**Date:** April 2026  
**Method:** Simulated walkthroughs based on codebase review of actual screens, copy, flows, and logic

---

## Marcus Chen — Power User

### Walkthrough Narrative

Signs in with Google OAuth. Fast. AI chat onboarding: writes detailed responses about failed morning routines across 3 messages. Appreciates the conversational approach — "This is different." Hits "Build my profile." Failure Profile appears with patterns, root causes, archetype. **Impressed:** "It identified that I over-stack habits and burn out. That's accurate."

Proceeds to Habit Stack. Gets 3 habits with tiny versions. **Frustration begins:** "I can't edit the reminder time? I can't change the anchor? I can only Regenerate ALL of them?" Taps Regenerate — gets completely different habits. "I liked habit #2 from before but not #1 and #3. Now I've lost it."

Day 3: Opens Insights tab. "You need at least 5 check-ins to generate insights." Closes app. Day 7: Generates weekly insight. "73% completion. Patterns detected. ONE adjustment — this is promising but where's the trend chart? Where's my trajectory?"

### Findings

| Issue | Severity | Type |
|-------|----------|------|
| Can't edit individual habits (only regenerate all) | Critical | UX/feature gap |
| Regeneration is destructive (loses liked habits) | High | UX |
| No historical trend visualization | High | Feature gap |
| No data export | Medium | Feature gap |
| Insights require 5 check-ins — new users see empty screen | High | Onboarding/UX |
| No way to add habits manually | High | Feature gap |
| Failure profile sharing is a great viral hook | — | **Strength** |
| Weekly insight ONE-adjustment model is differentiated | — | **Strength** |

**What he'd tell a friend:** "Clever onboarding and the failure analysis is genuinely insightful, but it's too locked down. If they add customization, I'd switch from my spreadsheet."

---

## Diane Okafor — Exhausted Restarter

### Walkthrough Narrative

"Welcome Back — Sign in to continue to HabitDx." *She hasn't signed up yet.* Minor confusion but finds Sign Up. AI chat opens: "I want to hear your story..." She types cautiously about wanting to eat better and sleep more. After 3 messages, builds profile.

Title: **"Your Habit Failure Profile."** Stomach drops. Reads "Patterns We Noticed" — accurate but uncomfortable. "Root Causes" — "Low energy after shift work... yeah." "Your Superpower" reframe helps slightly, but the dominant framing is already set as diagnostic/negative.

Gets habits. One suggests 7 AM morning routine. **Diane works night shifts.** "I told it I have shift work!" The AI habit generation didn't meaningfully adapt to non-standard schedules.

Day 2: Night shift. Opens app at 3 PM. **All habits show "missed"** because they're past reminder time. "I didn't even get a chance!" Day 4: "Don't Miss Twice" warning: "You missed yesterday. One skip is fine—but two in a row starts a pattern." Closes app. Doesn't return.

### Findings

| Issue | Severity | Type |
|-------|----------|------|
| "Failure Profile" naming triggers shame | Critical | Messaging/trust |
| Auto-missed status based on reminder time punishes shift workers | Critical | Logic/UX |
| "Don't Miss Twice" warning can trigger guilt spiral | High | Messaging/retention |
| AI habits don't meaningfully adapt to shift work | High | Logic/personalization |
| "Skip for now" signs user out — she wanted to skip onboarding, not leave | High | Bug/UX |
| No pause/sick day mechanism | High | Feature gap |
| Tiny versions feel achievable | — | **Strength** |
| Celebrations are warm and positive | — | **Strength** |

**What she'd tell a friend:** Nothing. She'd just stop using it with a resigned shrug.

---

## Professor Raj — Skeptical Academic

### Walkthrough Narrative

Notes the Tiny Habits framework immediately. Goes through AI chat, deliberately gives vague answers to test probing. AI probes well — "decent prompt engineering." Gives detailed answers. Builds profile.

Reads Failure Profile critically. "The archetype system — is this validated? 'Your Superpower' is unscientific framing." Suspects profiles are more similar than different across users. Habit Stack: "Anchor implementation is textbook Fogg. Good. But where's the implementation intention? Where's mental rehearsal?"

Daily use: "Binary tracking ignores dose-response. What about 5 minutes vs. 30 minutes? The tiny version is fixed — no escalation path." Insights: "ONE adjustment per week is consistent with decision fatigue research. But accept/decline is too binary."

### Findings

| Issue | Severity | Type |
|-------|----------|------|
| No graduated difficulty (tiny → small → full habit) | High | Logic/behavioral science |
| Binary tracking ignores dose-response relationship | High | Logic |
| "Your Superpower" archetype lacks scientific validation framing | Medium | Trust/messaging |
| No implementation intention / mental rehearsal prompts | Medium | Feature gap |
| Can't modify AI adjustment suggestions — only accept/decline | Medium | UX |
| No social/relatedness features (SDT violation) | Medium | Retention |
| Anchor implementation is sound Fogg model | — | **Strength** |
| ONE weekly adjustment is evidence-based | — | **Strength** |

**What he'd tell a colleague:** "Better than most habit apps because it actually implements Fogg's model. But the failure-first framing is risky for low self-efficacy populations."

---

## Gloria Reeves — Low-Tech User

### Walkthrough Narrative

Opens app. "What's a HabitDx? Dx like diagnosis?" No value proposition on login screen. Signs up with email. AI chat: "I don't want to tell a computer my story." Types: "My doctor said I need to walk more." Builds profile after 3 short messages.

"Your Habit Failure Profile." **Alarmed.** "Failure? Is this medical?" Reads "Root Causes" — feels exposed. Proceeds to habits. Doesn't understand "anchor" as a concept.

**Home screen: Does not know she can tap to complete.** Help text "Tap to complete • Long press if you can't do it today" is `text-xs text-gray-400` at the bottom of cards. Invisible to her. Looks for a checkbox. Doesn't find one. **Closes app, confused.**

Eventually taps by accident. "Oh!" Now understands. Will never discover long-press obstacle logging.

Settings: Taps "Privacy Policy" — gets alert: **"Privacy Policy Not Configured — Add EXPO_PUBLIC_PRIVACY_POLICY_URL after you publish the policy."** Now worried about data safety.

### Findings

| Issue | Severity | Type |
|-------|----------|------|
| "Tap to complete" instruction is text-xs text-gray-400 — effectively invisible | Critical | Accessibility/UX |
| Long-press is undiscoverable for non-technical users | High | UX |
| No value proposition on login screen | High | Onboarding/trust |
| Missing privacy policy alert destroys trust | Critical | Demo-risk/trust |
| "Failure Profile" + "Dx" = unintended clinical impression | High | Messaging/trust |
| No onboarding tooltip or tutorial for home screen | High | Onboarding |
| Habit options don't include "walking" or "drinking water" as primary | Medium | Feature gap |

**What she'd tell her daughter:** "I couldn't figure out how to use it. And it said something about my failure profile?"

---

## Jordan Park — Career Non-Fitter

### Walkthrough Narrative

Google OAuth. Done in 3 seconds. AI chat: describes wanting to practice public speaking and LinkedIn outreach. AI responds well — adapts beyond wellness defaults. Failure Profile captures procrastination and avoidance patterns. Pleasantly surprised.

Habits generated: "5-minute presentation practice" and "Send one LinkedIn message." **Good AI adaptation.** BUT: if Jordan had used the form path, HABIT_OPTIONS (Exercise, Meditation, Yoga...) would have been irrelevant. Form path is wellness-only.

Day 5: Celebration for LinkedIn message is "Do a little fist pump!" **Cringes.** Not appropriate for a professional office context. The celebration model assumes physical/private behaviors.

### Findings

| Issue | Severity | Type |
|-------|----------|------|
| Form onboarding is entirely wellness-focused | High | Feature gap/bias |
| AI chat path handles career goals well — form path doesn't | Medium | Inconsistency |
| Celebrations assume physical/private context | Medium | Personalization |
| GOAL_OPTIONS lacks career-specific options | Low | Feature gap |
| AI chat is the product's strongest differentiator for non-standard goals | — | **Strength** |

**What they'd tweet:** "HabitDx's AI onboarding is surprisingly good for non-standard goals. But the rest screams 'wellness only.'"

---

## Tyler Watts — ADHD User

### Walkthrough Narrative

Hyperfocuses on onboarding. Loves the AI chat — conversational format is ADHD-friendly. Spends 15 minutes writing detailed responses. Failure Profile: "You tend to start with high ambition and abandon when excitement fades." **Feels seen.** Highest-trust moment.

Tiny versions are perfect: "Open client file and type one sentence." "Finally someone who gets that 'just start' is the whole battle."

Day 3: Forgets app exists. Day 4: Opens app. Both habits show "missed" for two days. Streak: 0. "Don't Miss Twice" warning: "Two in a row starts a pattern." Internal response: "Great, I already failed. This is exactly what happens every time." **The warning is accurate per the philosophy but devastating for executive dysfunction.** No "you did great on Day 1-2" message. App only shows current state.

Day 5-14: Doesn't open the app again.

### Findings

| Issue | Severity | Type |
|-------|----------|------|
| Binary tracking hostile to executive dysfunction — no partial credit | Critical | Accessibility/logic |
| Streak reset erases all progress memory — no cumulative view | High | UX/retention |
| "Don't miss twice" warning assumes missed days are a choice | High | Messaging/accessibility |
| No "welcome back" flow for returning after absence | High | Retention |
| No grace period before marking habits as "missed" | High | Logic |
| AI chat onboarding is ADHD-friendly | — | **Strength** |
| Tiny versions are excellent for executive dysfunction | — | **Strength** |

**What he'd tell his therapist:** "The setup was amazing. It really understood my patterns. But then I missed two days and it told me I was starting a failure pattern."
