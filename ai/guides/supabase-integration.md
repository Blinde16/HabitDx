# Supabase Integration Guide

## Overview

Supabase serves as the complete backend for HabitDx, providing:

- **Authentication** - Email + Google OAuth
- **Database** - PostgreSQL with real-time subscriptions
- **Edge Functions** - Serverless functions for AI processing
- **Storage** - Future use for user assets
- **Row Level Security** - User data isolation

## Setup

### 1. Create Supabase Project

```bash
# Option A: Create project on supabase.com
# 1. Go to https://supabase.com/dashboard
# 2. Click "New Project"
# 3. Name: "habitdx" (or your choice)
# 4. Region: Choose closest to your users
# 5. Save the project URL and anon key

# Option B: Local development with CLI
npm install -g supabase
supabase init
supabase start
```

### 2. Environment Variables

```bash
# .env.development
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Edge Functions only (Supabase dashboard secrets)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
OPENAI_API_KEY=sk-proj-...
```

### 3. Install Client Library

```bash
# React Native app
npm install @supabase/supabase-js @react-native-async-storage/async-storage
```

## Database Schema

### Tables Overview

```sql
-- Core user data
user_profiles
habit_failure_profiles
habit_stacks
habits
habit_logs
weekly_iterations

-- Future features
notifications (for advanced notification scheduling)
user_analytics (for aggregated insights)
```

### Full Migration

```sql
-- supabase/migrations/20260209_initial_schema.sql

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- User Profiles
create table public.user_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,

  -- Onboarding data
  past_habits jsonb, -- [{habit, duration, why_failed}]
  failure_reasons text[],
  wake_time time not null,
  sleep_time time not null,
  work_start time,
  work_end time,
  life_constraints text[],
  energy_pattern text check (energy_pattern in ('morning', 'afternoon', 'evening')),
  identity_goal text not null,

  -- Metadata
  onboarding_completed_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Habit Failure Profiles (AI-generated)
create table public.habit_failure_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,

  failure_patterns jsonb not null, -- [{name, description}]
  root_causes text[] not null,
  personality_insights text[] not null,
  recommendations text[] not null,

  token_usage jsonb, -- {prompt_tokens, completion_tokens, total_tokens}

  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Habit Stacks (collection of habits)
create table public.habit_stacks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,

  is_active boolean default true,
  archived_at timestamp with time zone,

  created_at timestamp with time zone default now()
);

-- Individual Habits
create table public.habits (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  habit_stack_id uuid references public.habit_stacks(id) on delete cascade not null,

  name text not null,
  tiny_version text not null,
  anchor text not null, -- "After I [existing routine]"
  celebration text not null,
  rationale text not null, -- Why this works for you

  reminder_time time,
  is_active boolean default true,

  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Daily Check-in Logs
create table public.habit_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  habit_id uuid references public.habits(id) on delete cascade not null,

  check_in_date date not null,
  completed boolean not null,
  obstacle text, -- "No time", "Forgot", "Too tired", "Life happened", "Other"
  notes text,

  created_at timestamp with time zone default now(),

  unique(habit_id, check_in_date) -- One check-in per habit per day
);

-- Weekly Iterations (AI insights)
create table public.weekly_iterations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,

  week_start date not null,
  summary text not null,
  pattern_identified text not null,

  adjustment_type text check (adjustment_type in ('timing', 'anchor', 'size', 'celebration', 'reminder')),
  adjustment_description text not null,
  adjustment_rationale text not null,
  specific_change text not null,

  status text check (status in ('pending', 'accepted', 'declined')) default 'pending',
  responded_at timestamp with time zone,

  created_at timestamp with time zone default now()
);

-- Indexes for performance
create index habit_logs_user_date_idx on public.habit_logs(user_id, check_in_date desc);
create index habits_user_active_idx on public.habits(user_id, is_active) where is_active = true;
create index habit_stacks_user_active_idx on public.habit_stacks(user_id, is_active) where is_active = true;
create index weekly_iterations_user_week_idx on public.weekly_iterations(user_id, week_start desc);

-- Updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger user_profiles_updated_at before update on public.user_profiles
  for each row execute function public.handle_updated_at();

create trigger habit_failure_profiles_updated_at before update on public.habit_failure_profiles
  for each row execute function public.handle_updated_at();

create trigger habits_updated_at before update on public.habits
  for each row execute function public.handle_updated_at();
```

### Row Level Security (RLS)

```sql
-- Enable RLS on all tables
alter table public.user_profiles enable row level security;
alter table public.habit_failure_profiles enable row level security;
alter table public.habit_stacks enable row level security;
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;
alter table public.weekly_iterations enable row level security;

-- User Profiles: Users can only access their own data
create policy "Users can view own profile"
  on public.user_profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert own profile"
  on public.user_profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update own profile"
  on public.user_profiles for update
  using (auth.uid() = user_id);

-- Habit Failure Profiles: Users can only access their own
create policy "Users can view own failure profile"
  on public.habit_failure_profiles for select
  using (auth.uid() = user_id);

create policy "Service role can insert failure profiles"
  on public.habit_failure_profiles for insert
  with check (true); -- Edge functions use service role

-- Habit Stacks: Users can only access their own
create policy "Users can view own habit stacks"
  on public.habit_stacks for select
  using (auth.uid() = user_id);

create policy "Service role can manage habit stacks"
  on public.habit_stacks for all
  using (true);

-- Habits: Users can read/update, service role can insert
create policy "Users can view own habits"
  on public.habits for select
  using (auth.uid() = user_id);

create policy "Users can update own habits"
  on public.habits for update
  using (auth.uid() = user_id);

create policy "Service role can insert habits"
  on public.habits for insert
  with check (true);

-- Habit Logs: Users have full control
create policy "Users can manage own habit logs"
  on public.habit_logs for all
  using (auth.uid() = user_id);

-- Weekly Iterations: Users can read/update, service role can insert
create policy "Users can view own iterations"
  on public.weekly_iterations for select
  using (auth.uid() = user_id);

create policy "Users can update own iterations"
  on public.weekly_iterations for update
  using (auth.uid() = user_id);

create policy "Service role can insert iterations"
  on public.weekly_iterations for insert
  with check (true);
```

## Client Setup

### Configure Supabase Client

```typescript
// src/lib/supabase.ts
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Type helper for database
export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          past_habits: any;
          failure_reasons: string[];
          wake_time: string;
          sleep_time: string;
          work_start: string | null;
          work_end: string | null;
          life_constraints: string[];
          energy_pattern: 'morning' | 'afternoon' | 'evening';
          identity_goal: string;
          onboarding_completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Tables['user_profiles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Tables['user_profiles']['Insert']>;
      };
      // Add other tables...
    };
  };
};
```

## Authentication

### Email Auth

```typescript
// src/lib/auth.ts
import { supabase } from './supabase';

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'habitdx://reset-password',
  });

  if (error) throw error;
}
```

### Google OAuth

> **Shipped implementation (web, Apr 2026):** The app uses `supabase.auth.signInWithOAuth` in `src/stores/authStore.ts`, web **`flowType: 'implicit'`** in `src/lib/supabase.ts`, and `src/components/auth/OAuthCallbackScreen.tsx` for `/callback`. In **Google Cloud**, set **Authorized redirect URIs** to `https://<project-ref>.supabase.co/auth/v1/callback` (not your Vercel domain). See [`CHANGELOG.md`](../../CHANGELOG.md) and [`aiDocs/web_beta_launch_plan.md`](../../aiDocs/web_beta_launch_plan.md).

The snippet below illustrates an **alternative** pattern (`expo-auth-session` + `signInWithIdToken`); it is not the primary web beta path.

```typescript
// src/lib/auth.ts (continued)
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: 'YOUR_EXPO_CLIENT_ID',
    iosClientId: 'YOUR_IOS_CLIENT_ID',
    androidClientId: 'YOUR_ANDROID_CLIENT_ID',
    webClientId: 'YOUR_WEB_CLIENT_ID',
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;

      supabase.auth.signInWithIdToken({
        provider: 'google',
        token: id_token,
      });
    }
  }, [response]);

  return { request, promptAsync };
}
```

### Auth State Listener

```typescript
// src/stores/authStore.ts
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  setSession: (session: Session | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  loading: true,
  setSession: (session) => set({ session, user: session?.user ?? null }),
}));

// Initialize auth listener
supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.getState().setSession(session);
});

// Get initial session
supabase.auth.getSession().then(({ data: { session } }) => {
  useAuthStore.getState().setSession(session);
  useAuthStore.setState({ loading: false });
});
```

## Edge Functions

### Deploy Edge Functions

```bash
# Deploy all functions
supabase functions deploy analyze-failure
supabase functions deploy generate-habits
supabase functions deploy weekly-iteration

# Set secrets
supabase secrets set OPENAI_API_KEY=sk-proj-...
```

### Invoke from Client

```typescript
// src/lib/api.ts
import { supabase } from './supabase';

export async function analyzeFailureProfile(userId: string) {
  const { data, error } = await supabase.functions.invoke('analyze-failure', {
    body: { userId },
  });

  if (error) throw error;
  return data;
}

export async function generateHabits(userId: string) {
  const { data, error } = await supabase.functions.invoke('generate-habits', {
    body: { userId },
  });

  if (error) throw error;
  return data;
}
```

## Real-time Subscriptions

### Subscribe to Habit Updates

```typescript
// src/hooks/useHabits.ts
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useHabits(userId: string) {
  const [habits, setHabits] = useState([]);

  useEffect(() => {
    // Initial fetch
    fetchHabits();

    // Subscribe to changes
    const subscription = supabase
      .channel('habits')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'habits',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setHabits((prev) => [...prev, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            setHabits((prev) => prev.map((h) => (h.id === payload.new.id ? payload.new : h)));
          } else if (payload.eventType === 'DELETE') {
            setHabits((prev) => prev.filter((h) => h.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  async function fetchHabits() {
    const { data } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    setHabits(data || []);
  }

  return habits;
}
```

## Cron Jobs

### Weekly Analysis Job

```sql
-- Enable pg_cron extension
create extension if not exists pg_cron;

-- Schedule weekly analysis (every Sunday at 8 PM)
select cron.schedule(
  'weekly-habit-analysis',
  '0 20 * * 0', -- Sunday 8 PM
  $$
  select net.http_post(
    url := 'https://xxxxx.supabase.co/functions/v1/weekly-iteration',
    headers := '{"Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '", "Content-Type": "application/json"}',
    body := json_build_object('runForAllUsers', true)::text
  );
  $$
);
```

### Batch Processing in Edge Function

```typescript
// supabase/functions/weekly-iteration/index.ts
serve(async (req) => {
  const { runForAllUsers, userId } = await req.json();

  if (runForAllUsers) {
    // Fetch all active users with check-ins in last 7 days
    const { data: users } = await supabase
      .from('habit_logs')
      .select('user_id')
      .gte('check_in_date', sevenDaysAgo)
      .limit(1000); // Process in batches

    const uniqueUsers = [...new Set(users.map((u) => u.user_id))];

    // Process each user
    const results = await Promise.allSettled(
      uniqueUsers.map((userId) => processUserIteration(userId))
    );

    return new Response(JSON.stringify({ processed: results.length }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } else {
    // Single user processing
    return processUserIteration(userId);
  }
});
```

## Data Queries

### Common Queries

```typescript
// Fetch user's active habits
const { data: habits } = await supabase
  .from('habits')
  .select('*')
  .eq('user_id', userId)
  .eq('is_active', true)
  .order('created_at', { ascending: true });

// Fetch today's habit logs
const today = new Date().toISOString().split('T')[0];
const { data: logs } = await supabase
  .from('habit_logs')
  .select('*, habits(*)')
  .eq('user_id', userId)
  .eq('check_in_date', today);

// Fetch weekly iterations
const { data: iterations } = await supabase
  .from('weekly_iterations')
  .select('*')
  .eq('user_id', userId)
  .order('week_start', { ascending: false })
  .limit(10);

// Insert habit check-in (with upsert for idempotency)
const { error } = await supabase.from('habit_logs').upsert(
  {
    user_id: userId,
    habit_id: habitId,
    check_in_date: today,
    completed: true,
  },
  {
    onConflict: 'habit_id,check_in_date',
  }
);
```

## Testing

### Seed Data

```sql
-- supabase/seed.sql
insert into auth.users (id, email)
values ('11111111-1111-1111-1111-111111111111', 'test@habitdx.com');

insert into public.user_profiles (user_id, identity_goal, wake_time, sleep_time, energy_pattern, life_constraints, failure_reasons)
values (
  '11111111-1111-1111-1111-111111111111',
  'someone who prioritizes health',
  '07:00',
  '23:00',
  'morning',
  array['Kids', 'Long commute'],
  array['No time', 'Too ambitious']
);
```

### Local Testing

```bash
# Start local Supabase
supabase start

# Run migrations
supabase db reset

# Load seed data
supabase db seed
```

## Monitoring

### Dashboard Metrics

- Active users
- Daily check-in rate
- Weekly iteration acceptance rate
- Edge function invocation count
- Database size

### Query Performance

```sql
-- Find slow queries
select * from pg_stat_statements
order by total_exec_time desc
limit 10;

-- Index usage
select schemaname, tablename, indexname, idx_scan
from pg_stat_user_indexes
order by idx_scan asc;
```

## Security Best Practices

1. **Never expose service role key** - Only use in Edge Functions
2. **Always use RLS** - Never disable on production tables
3. **Validate input** - Use database constraints and app-level validation
4. **Rate limiting** - Implement in Edge Functions
5. **Audit logs** - Enable for production database

## Troubleshooting

### Common Issues

1. **RLS blocking queries**: Check policies match auth.uid()
2. **Session not persisting**: Verify AsyncStorage is configured
3. **Edge function timeout**: Optimize AI prompts, add retries
4. **Realtime not working**: Check if subscriptions are enabled

## Next Steps

1. Run migration to create database schema
2. Configure authentication providers
3. Deploy Edge Functions
4. Set up cron jobs
5. Implement client queries
6. Test with seed data

## References

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [Realtime Guide](https://supabase.com/docs/guides/realtime)
