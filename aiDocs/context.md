# HabitDx - Project Context

## Bookshelf — doc map (start here)

Quick orientation for a new teammate or AI session: what to open first and why.

| Item | Path | Why it matters |
| --- | --- | --- |
| **PRD** | `aiDocs/prd.md` | Product vision, personas, priorities, falsifiability notes, long-term metrics. |
| **MVP scope** | `aiDocs/mvp.md` | **Current delivery anchor** — in/out of scope, core flow, MVP success criteria (narrower than PRD). |
| **Project context (this file)** | `aiDocs/context.md` | Stack, folder layout, conventions, env vars. |
| **AI roadmaps & plans** | `ai/roadmaps/`, `ai/guides/` | Phase plans, implementation summaries, integration guides (Supabase, OAuth, notifications, etc.). |
| **Changelog** | `CHANGELOG.md` | Living release notes; user-visible changes and notable fixes (cite in reviews). |
| **Agent / git rules** | `AGENTS.md`, `.cursor/rules/`, `.cursorrules` | How assistants should work: PRs, commits, what not to do. |
| **Contributing** | `CONTRIBUTING.md` | TypeScript, formatting, commit style, PR expectations. |
| **Testing (CLI)** | `scripts/test-*.ts`, `npm run test:*` | Supabase auth, DB, habits, edge functions; uses structured logger. |
| **Testing (QA notes)** | `aiDocs/testing/`, `TESTING_GUIDE.md` | Persona reviews, walkthrough findings, manual QA guidance. |
| **Web deploy** | `vercel.json` | Expo web export command, `dist` output, SPA rewrites. |
| **App entry & layouts** | `src/app/_layout.tsx`, `src/app/(auth)/`, `src/app/(onboarding)/`, `src/app/(tabs)/` | Expo Router structure, auth vs main app shells. |
| **Auth & session** | `src/stores/authStore.ts`, `src/lib/supabase.ts`, `src/components/auth/` | Sign-in/up, OAuth callback handling, client config. |
| **Backend & AI** | `supabase/migrations/`, `supabase/functions/` | Schema, Edge Functions (profile, habits, weekly iteration). |
| **Design reference** | `aiDocs/master-design.md` | UI direction for auth, tabs, onboarding. |

## Overview

**HabitDx** is an AI-powered habit diagnosis app for knowledge workers who've tried and failed at building habits. Unlike generic tracking apps that simply log whether you completed a task, HabitDx analyzes _why_ your habits fail and delivers personalized weekly adjustments based on your specific patterns.

The app solves the core frustration voiced by our target users: "I know what to do, why can't I just do it?" Instead of blaming willpower, HabitDx treats habit failure as a design problem. Through a 5-minute smart intake, the AI generates your personal "Habit Failure Profile"—identifying patterns like "evening energy crashes" or "weekend routine disruption"—then designs habits that work around your constraints. Each week, the app analyzes your check-in data and delivers one specific adjustment, turning self-blame into system fixes.

## Tech Stack

| Component        | Technology                 | Rationale                      |
| ---------------- | -------------------------- | ------------------------------ |
| Frontend         | Expo + React Native        | Cross-platform, fast iteration |
| Backend          | Supabase                   | Auth + DB + Functions in one   |
| AI               | GPT-4o-mini via OpenAI API | Cheapest viable option         |
| State Management | Zustand                    | Simple, lightweight            |
| Navigation       | Expo Router                | File-based, less boilerplate   |

## Project Structure

### Frontend Architecture

```
src/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Login, signup, forgot password
│   ├── (onboarding)/      # Intake flow screens
│   ├── (tabs)/            # Main app tabs
│   │   ├── home.tsx       # Today's habits
│   │   ├── insights.tsx   # Weekly insights
│   │   └── settings.tsx   # Profile & preferences
│   └── _layout.tsx        # Root layout
├── components/            # Reusable UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities, API clients
├── stores/                # State management
└── types/                 # TypeScript definitions
```

### Backend Architecture

```
supabase/
├── migrations/            # Database schema changes
├── functions/             # Edge Functions
│   ├── analyze-failure/   # Onboarding AI analysis
│   ├── generate-habits/   # Habit stack generation
│   └── weekly-iteration/  # Weekly analysis job
└── seed.sql              # Test data
```

## Core Features (MVP)

1. **Smart Onboarding** - 5-min intake capturing past failures, constraints, goals
2. **Habit Failure Profile** - AI-generated diagnosis of user's failure patterns
3. **Personalized Habit Stack** - 1-3 AI-designed habits with rationale
4. **Daily Check-in** - 10-second tap (done/not done + optional obstacle)
5. **Weekly Iteration** - AI analyzes patterns, delivers ONE adjustment
6. **Push Notifications** - Configurable reminders per habit

## Database Tables

- `user_profiles` - User onboarding data and constraints
- `habit_failure_profiles` - AI-generated failure analysis
- `habit_stacks` - Collection of habits for a user
- `habits` - Individual habit definitions
- `habit_logs` - Daily check-in records
- `weekly_iterations` - AI-generated weekly insights

## AI Edge Functions

1. **analyze-failure** - Generates Habit Failure Profile from onboarding data
2. **generate-habits** - Creates personalized habit stack based on profile
3. **weekly-iteration** - Analyzes week's data and suggests one adjustment

## File Naming Conventions

```
components/HabitCard.tsx       # PascalCase for components
hooks/useHabits.ts             # camelCase with "use" prefix
lib/supabase.ts                # lowercase for utilities
stores/habitStore.ts           # camelCase for stores
types/habit.ts                 # lowercase for types
```

## Git Workflow

```
main        ← Production releases only
  └── develop     ← Integration branch
        └── feature/onboarding
        └── feature/daily-checkin
        └── fix/notification-timing
```

## Environment Variables

```
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=xxx
OPENAI_API_KEY=xxx (Edge Functions only)
```

## Technical Dependencies

- Node.js 18+
- Expo SDK 50+
- Supabase account
- OpenAI API key
- Apple Developer account ($99/year)
- Google Play Developer account ($25 one-time)
