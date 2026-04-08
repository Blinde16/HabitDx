# HabitDx — MVP definition

This document is the **scope anchor** for what we are building *now*. The [PRD](./prd.md) holds broader vision, metrics, and later phases; **this file wins when there is a conflict about “are we doing that in MVP?”**

## Purpose (one paragraph)

Ship a **diagnose → design → check in → adjust** loop for people who already failed at generic habit apps: capture structured intake and constraints, generate a **Habit Profile** (failure patterns + rationale), propose a small **habit stack** (1–3 habits) via Supabase Edge Functions + OpenAI, collect **daily check-ins** (done / not done + optional obstacle), and deliver **one weekly adjustment** from real check-in data—so the product proves the core thesis (“failure is a fit problem, not a character flaw”) in one tight experience.

## Who the MVP is for

- **Primary:** Knowledge workers **28–38** who have **tried multiple habit trackers** and still churn; motivated by understanding *why* habits break, not by streak gamification.
- **Not MVP:** First-time habit users, “checkbox only” casual trackers, or people whose primary blocker is unmanaged clinical crisis (out of product scope).

## Narrowest usable version

A signed-in user can: **complete onboarding** → see an **AI-generated profile** → receive **generated habits** → **check in** on scheduled days → (after enough data) **generate weekly insights** once per week cycle. **Push reminders** exist where the platform allows (mobile); **web** is supported for beta access with the same auth and data model.

## Core user flow

1. **Auth** — Email/password and/or Google OAuth (Supabase Auth).
2. **Onboarding** — Past failures, constraints, goals (and, where enabled, guided intake paths).
3. **Profile** — Edge function analyzes intake → stored profile + user-facing summary.
4. **Habits** — Edge function proposes stack → user confirms / continues flow.
5. **Home** — Today’s habits; quick complete / miss (+ optional obstacle).
6. **Insights** — After minimum check-in threshold, user triggers or receives **one** weekly iteration output.
7. **Settings** — Account, notifications, legal links when configured, sign out.

## In scope (MVP)

- Supabase **Auth**, **RLS-backed** tables for profiles, stacks, habits, logs, weekly iterations.
- Edge Functions: **analyze-failure** (profile), **generate-habits**, **weekly-iteration** (and related shared auth helpers).
- Expo Router app: **`(auth)`**, **`(onboarding)`**, **`(tabs)`** (home, insights, settings), **profile**, **share** route as implemented.
- **Structured logging** in app and CLI test scripts for debugging.
- **Expo web export** + static hosting (e.g. Vercel) for demo/beta, with SPA-style routing for deep links.
- **Notifications** where supported (per habit / platform constraints).

## Out of scope (MVP)

- Payments, subscriptions, or paywalls.
- Social feeds, teams, or accountability partners as a core loop.
- Gamification (points, badges, public leaderboards).
- Apple Health / Google Fit or calendar deep sync.
- Full localization; multi-language UX.
- “Coach chat” as an open-ended primary interface (optional later; not the MVP core loop).
- Production-scale analytics pipeline beyond lightweight in-app logging / placeholders.

## Success criteria (MVP)

- **Technical:** A new user can run the **full loop** on a clean install: sign up → onboard → profile → habits → at least one **check-in** → weekly path **does not hard-error** when preconditions are met (data + thresholds as implemented).
- **Product (directional):** Onboarding completion and week-1 return are tracked against PRD targets; MVP succeeds if we can **observe** those metrics in beta, not if every PRD stretch metric is already hit.
- **Quality bar:** No committed secrets; auth sessions behave on **web and native**; Edge invocations use valid user JWTs (see `supabase/config.toml` + function auth patterns).

## Known risks / assumptions

- **Persona fit:** Early interviews may not match the PRD primary persona; MVP still tests the *loop*, not universal market fit.
- **AI quality:** Short intake may yield generic-sounding copy; mitigated by prompts, constraints in Edge Functions, and user-visible “why this fits you” rationale.
- **Web vs mobile:** OAuth and storage differ by platform; implicit/PKCE and callback routes must stay aligned with Supabase + Expo Router (regression-prone).
- **Email confirmation:** Supabase project settings affect whether password sign-in returns a session immediately; UX must handle “verify email” without dead-end redirects.
