# HabitDx — Web Beta Launch Plan

**Last updated:** March 30, 2026  
**Scope:** Public beta as a **responsive web app** (desktop + mobile browsers). **No** Apple App Store or Google Play submission in this phase.

**Assumptions (confirmed):** Production Supabase is live, hosting and environment are configured, and the app ships as **Expo Web** (see `vercel.json`: `expo export --platform web` → `dist`).

---

## 1. Goals

- Ship a **single URL** beta testers can use on phone and desktop.
- Keep **one codebase** (Expo + React Native Web); optimize layouts and interactions for **small viewports** and **pointer/touch**.
- Validate product metrics from `aiDocs/beta_launch_execution_plan.md` (onboarding completion, week-1 return, retention, iteration acceptance, qualitative NPS themes).

---

## 2. What “web launch” includes

| Area | Direction |
| --- | --- |
| **Hosting** | Static export on Vercel (or equivalent); SPA rewrites already route `/:path*` → `/` for client-side navigation. |
| **Build** | `npx expo export --platform web`; env vars for production set in the host (not committed). |
| **Distribution** | Share the production URL; optional password / allowlist on the host or via Supabase if you need a closed beta. |
| **Stores** | Out of scope for this phase: no Apple Developer / Google Play accounts, no EAS native builds for beta. |

---

## 3. Pre-beta technical checklist (web)

Use this before inviting testers at scale.

### 3.1 Production configuration

- [ ] **Supabase (prod):** URL + anon key in hosting env; redirect URLs include your **production web origin** (Auth → URL configuration).
- [ ] **OAuth / magic link:** Callback routes work on web (`src/app/auth/callback.tsx` and related); confirm email links land on prod.
- [ ] **Edge functions:** Deployed against prod; secrets (e.g. OpenAI) set for production.
- [ ] **CORS / allowed origins:** Any Supabase or third-party settings allow your prod domain.

### 3.2 Web UX and quality bar

- [ ] **Responsive layouts:** Critical flows (auth, onboarding, home, check-in, settings) usable from ~360px width up to desktop.
- [ ] **Input modes:** Tap targets and spacing work on touch; keyboard navigation acceptable on desktop where applicable.
- [ ] **Scroll / keyboard:** Long forms and onboarding avoid clipping behind mobile keyboards (`KeyboardAvoidingView` patterns already differ on web in places — verify onboarding and auth screens).
- [ ] **Performance:** First load and route transitions acceptable on mid-tier mobile networks (spot-check Lighthouse or manual throttling).

### 3.3 Web limitations to communicate (internally or in FAQ)

- **Push notifications:** Browser support is limited compared to native; plan messaging or optional email/reminders if notifications are a pillar of retention.
- **Install:** “Add to Home Screen” / PWA is optional follow-up (manifest, icons, service worker); not required for a first web beta if the mobile browser experience is solid.

### 3.4 Legal and trust

- [ ] **Privacy policy and terms** hosted at stable HTTPS URLs; linked from the app (e.g. signup/settings).
- [ ] **Support / feedback** channel (email or form) listed for beta testers.

### 3.5 Observability (recommended)

- [ ] **Error tracking** (e.g. Sentry for web) for prod-only visibility.
- [ ] **Analytics or structured logs** aligned with events in `beta_launch_execution_plan.md` (`onboarding_completed`, habit events, etc.).

---

## 4. Chat-style onboarding (product track)

**Objective:** Move from linear full-screen steps toward a **thread-style** experience (guide messages, user replies, quick actions) while preserving the **same structured data** the AI pipeline expects (`onboardingStore` → profiles → `analyze-failure` / `generate-habits`).

**Implementation (in repo):**

- **Primary route:** `src/app/(onboarding)/chat.tsx` → `OnboardingChat` (`src/components/onboarding/OnboardingChat.tsx`).
- **Scripted steps 1–5** map to the former welcome → past failures → constraints → goals → confirmation flow; completed turns show as guide + user summary bubbles; `nextScreen()` still drives `onboarding_screen_completed` analytics.
- **Legacy screens** (`past-failures`, `constraints`, etc.) remain for bookmarks/tests; **`welcome`** redirects to `chat` after `loadProgress()`.
- **Shared options** live in `src/constants/onboardingIntake.ts` so chat and legacy screens stay aligned.

**Optional follow-ups:** feature flag vs. legacy flow only if you need an A/B comparison; no LLM added during intake (cost-safe).

---

## 5. Beta operations (adapted for web)

Aligned with `aiDocs/beta_launch_execution_plan.md`, with web-specific notes:

| Activity | Web note |
| --- | --- |
| **Recruitment** | Share link + instructions for Safari/Chrome on iOS and Android; note “bookmark or add to home screen” if helpful. |
| **Interviews** | Same cadence (e.g. within 24h of onboarding completion); ask about **mobile browser** friction explicitly. |
| **Daily** | Monitor onboarding funnel, errors, and feedback; hotfix only blocking issues. |
| **Metrics** | Same thresholds and pivot tripwires; ensure events fire correctly in the web build. |

---

## 6. Timeline sketch (order of work)

1. **Harden prod web** — auth redirects, env, smoke test all critical paths on mobile + desktop browsers.
2. **Polish responsive UX** — fix any layout or input issues found in step 1.
3. **Chat onboarding** (if prioritized for beta) — implement behind a flag or as default once stable.
4. **Soft launch** — small cohort, watch errors and completion rate.
5. **Widen beta** — expand recruitment per execution plan.

---

## 7. Explicitly out of scope for this document

- Native app store listings, screenshots, and review processes.
- EAS iOS/Android production builds (can revisit if you add native later).
- Paid store fees (Apple/Google) — not required for this web beta.

---

## 8. Related docs

- `NEXT_STEPS.md` — historical full launch checklist; **ignore native store sections** when following this web plan.
- `aiDocs/beta_launch_execution_plan.md` — beta metrics, cadence, and research.
- `vercel.json` — web export and SPA routing for production.

---

**Owner:** Blake · **Repo:** [HabitDx](https://github.com/Blinde16/HabitDx)
