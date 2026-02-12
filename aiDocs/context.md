# HabitDx - Project Context

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
