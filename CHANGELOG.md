# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/) as described in [CONTRIBUTING.md](CONTRIBUTING.md).

## [Unreleased]

### Added

- **Brand:** `HabitDxLogo` component and `assets/habitdx-logo.png` (wordmark) embedded on auth, tabs, profile, share, onboarding notifications, and loading gates; web favicon uses a cropped symbol from the same asset (`assets/favicon.png`).
- **Design system:** Master editorial UI standard — Tailwind semantic tokens (surfaces, primary/navy gradient CTAs, soft emerald accents), **Manrope** + **Public Sans** via `expo-font` / `@expo-google-fonts`, shared `src/lib/fonts.ts` and `src/styles/authScreenStyles.ts`. Reference: [`aiDocs/master-design.md`](aiDocs/master-design.md).
- **Home:** Total completed check-ins (all habits) shown in the header next to daily completion.
- **Insights:** Progress copy toward unlocking weekly insights (X of 5 check-ins); generate button disabled until the minimum is met.
- **Auth (login & signup):** Value proposition — tagline and three bullets above the form.
- **Onboarding intake:** Broader habit options (movement, water, career, creative, financial, networking, learning).

### Changed

- **Brand:** `HabitDxLogo` uses dedicated assets for each context — transparent full lockup (default), wide **header** strip on Home and Insights, **wordmark**-only on Settings, **mark**-only on loading gates and spinners, optional **fullOpaque** — with rasters in `assets/` (`habitdx-logo-transparent.png`, `habitdx-header-logo-transparent.png`, `habitdx-wordmark-only.png`, `habitdx-mark-only.png`, `habitdx-logo.png`). Android adaptive icon foreground uses `habitdx-app-icon-transparent.png`.
- **Design system:** Refined onboarding and auth styling to better match `aiDocs/master-design.md` and the HabitDx logo palette. Shared tokens now use slate + mint brand colors, centralized typography points to the loaded Manrope/Public Sans fonts, and onboarding/auth surfaces favor tonal layering over hard gray borders and harsh red alerts.
- **Web app / notifications:** Improved browser layout behavior with a web-first tab bar treatment and centered content widths on key app surfaces. Notification controls now use higher-contrast brand accents instead of dark-on-dark states.
- **UI (site-wide):** Redesign aligned with the Intellectual Sanctuary direction — tonal layering instead of default borders, editorial spacing, gradient primary buttons, Feather tab icons, calmer check-in success and obstacle flows. **Home** removes streak-centric UI and harsh red/green habit states; **Insights**, **Settings**, **auth**, **onboarding** (chat, habits, failure profile, notifications, goals, constraints, confirmation, past failures), **profile**, and **shared profile** routes updated. Notification titles/bodies no longer emphasize streaks; splash and Android adaptive backgrounds use paper-toned `#f7f9fb`.
- **Naming:** User-facing "Failure Profile" / "Habit Failure Profile" copy updated to **Habit Profile** (settings, onboarding, share page, habits screen, confirmation).
- **Home:** Softer "welcome back" messaging after a miss; clearer tap / long-press help text (`text-sm` / `text-gray-600`); daily tip wording less punitive.
- **Onboarding AI chat:** "Skip for now" navigates to home instead of signing out.
- **Settings:** Privacy Policy, Terms, and Email Support rows render only when the corresponding env URLs / support email are set; support subtitle is generic ("Contact us") when configured.
- **Check-ins:** Same-day habits stay **pending** until you log an outcome — no auto-"missed" from passing reminder time; streaks skip non-scheduled days; local calendar date used for logs and streak math.
- **Edge function `generate-habits`:** Prompt stresses shift work / non-9–5 schedules — avoid default morning reminders when constraints imply nights or irregular hours.
- **Auth routing:** Signed-out users are sent to `/(auth)/login` via layout/index/profile redirects; signed-in users on auth form screens are redirected to `/` from `(auth)/_layout`. No competing `router.replace` to login from `index` for the same session.
- **Web — Supabase auth client:** `flowType` set to **`implicit`** for the browser build so OAuth completes with tokens in the URL hash and `detectSessionInUrl` can persist the session without relying on PKCE `localStorage` state across the Google redirect ([`522604c`](https://github.com/Blinde16/HabitDx/commit/522604c)).

### Fixed

- **Weekly insights (DB + client):** Production DBs that created `weekly_iterations` from the older migration never received the new columns (`week_start`, `completion_stats`, `insights`, …) because a later migration used `CREATE TABLE IF NOT EXISTS` and skipped. Added migration `20260404140000_align_weekly_iterations_schema.sql` to add/backfill those columns and relax legacy `NOT NULL` constraints so the Edge Function insert succeeds. **406** on empty “latest iteration” is avoided by using a **limit(1) array** query (no `.single()` / `.maybeSingle()`).
- **Weekly insights (web + Edge):** `weekly-iteration` no longer requires a `habit_failure_profiles` row (`.single()` threw when none existed, causing **400**). Profiles and `user_profiles` are optional context; prompts include onboarding goals/constraints when present. Check-in success haptics are skipped on **web** so `Haptics.notificationAsync` does not throw.
- **Edge Functions (JWT / signing keys):** Per-function `verify_jwt = false` in `supabase/config.toml` plus in-function validation with `auth.getClaims()` (shared `verifyJwtAndGetUserId`). The Edge gateway’s default JWT check does not accept asymmetric (JWT Signing Keys / ES256) tokens, which caused **401 Invalid JWT** before function code ran; the client-side token fix alone could not resolve that until functions were redeployed with this config.
- **Edge Functions (JWT):** Invocations now send an explicit user access token after `refreshSession()`. The Supabase client otherwise can fall back to the anon key as `Authorization` when the internal session is missing, which produced **401 Invalid JWT** on `generate-habits` and similar functions after account switches or timing edge cases.
- **REST “406” on empty rows:** Active habit stack, habit profile, and latest `weekly_iterations` lookups use `maybeSingle()` so “no row yet” does not surface as HTTP 406 in the network panel.

- **Undo check-in:** Deletes today’s `habit_logs` row instead of upserting `completed: false`.
- **Onboarding confirmation:** Removed `console.log` of onboarding payload; structured `logInfo` / `logError` only.
- **Web — React maximum update depth (error #185):** Resolved production and dev crashes where React Navigation hit nested update limits during auth redirects. Root cause was `router.replace` + `useSegments` / unstable dependencies in the root `ProtectedRoute` wrapper, which re-ran whenever navigation or child screens (e.g. home check-in) updated. Mitigations included stable `navReady` handling, deferred replaces, and OAuth/notification hooks that do not re-subscribe on every root navigation key change ([`95aae9f`](https://github.com/Blinde16/HabitDx/commit/95aae9f)).
- **Web — Auth redirect loops:** Removed imperative navigation from root `ProtectedRoute`; auth gating now uses Expo Router `<Redirect href="…" />` in group layouts — `(auth)`, `(tabs)`, `(onboarding)` — plus `index` and `profile` for unauthenticated access. `ProtectedRoute` only initializes Supabase session and shows the global loading overlay ([`3234552`](https://github.com/Blinde16/HabitDx/commit/3234552)).
- **Web — Google OAuth / `/callback`:** End-to-end sign-in on Vercel verified (Apr 2026). The OAuth callback screen now awaits `supabase.auth.initialize()`, recovers implicit (`#access_token` / `refresh_token`) and PKCE (`?code=`) returns, retries when the fragment is slow to appear, strips sensitive URL fragments on failure, and surfaces actionable errors (including the real `https://<project>.supabase.co/auth/v1/callback` hint from env). **Implicit grant** is used on web so PKCE code-verifier loss across redirects (www/apex, partitioned storage) does not block sessions ([`93ebd50`](https://github.com/Blinde16/HabitDx/commit/93ebd50) … [`30dc04e`](https://github.com/Blinde16/HabitDx/commit/30dc04e); key behavior in [`522604c`](https://github.com/Blinde16/HabitDx/commit/522604c)).

### Documentation

- **Agent workflow:** [`AGENTS.md`](AGENTS.md) and [`.cursor/rules/git-pr-workflow.mdc`](.cursor/rules/git-pr-workflow.mdc) require the PR-based workflow from [CONTRIBUTING.md](CONTRIBUTING.md) (branch → push branch → PR to `main`, not direct pushes for normal changes). `.gitignore` updated so `.cursor/rules/` is tracked while other `.cursor/` paths stay ignored.
- **Internal testing notes:** Added and maintained [`aiDocs/testing/`](aiDocs/testing/) — multi-persona pre-presentation review (personas, walkthrough findings, functional issues, UX critique, behavioral science review, cross-persona synthesis, demo strategy, fix roadmap). Simulated/code-review methodology; complements but does not replace production QA or beta research.

### Chore

- **Git:** Ignore local Vercel link metadata (`.vercel` in `.gitignore`) ([`95aae9f`](https://github.com/Blinde16/HabitDx/commit/95aae9f)).

---

When you cut a **versioned release** (e.g. `v1.1.0`), add a dated section above `[Unreleased]` and move completed bullets out of Unreleased.
