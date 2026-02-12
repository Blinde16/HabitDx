# Phase 3: Database Schema & Backend Infrastructure

**Date Created:** February 9, 2026  
**Phase Duration:** 3-4 days  
**Dependencies:** Phase 2 (Authentication)  
**Status:** Not Started

## Overview

Design and implement the complete database schema for HabitDx using Supabase PostgreSQL. This phase establishes all tables, relationships, indexes, and Row Level Security (RLS) policies needed for the MVP.

## Goals

- Create all core database tables
- Establish proper foreign key relationships
- Implement Row Level Security for data isolation
- Set up database indexes for performance
- Create database utility functions
- Document schema for team reference

## Success Criteria

- [ ] All 6 core tables created and migrated
- [ ] RLS policies protect user data
- [ ] Foreign keys maintain referential integrity
- [ ] Indexes optimize common queries
- [ ] Seed data available for testing
- [ ] Schema documented with ERD

## Database Tables

### 1. user_profiles

Extended user data beyond Supabase auth.users

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Onboarding data
  past_failures TEXT[], -- Array of past habit attempts
  constraints JSONB, -- Schedule, energy patterns, life constraints
  goals TEXT[], -- User's habit goals
  onboarding_completed BOOLEAN DEFAULT FALSE,

  -- Settings
  timezone TEXT DEFAULT 'America/New_York',
  notification_enabled BOOLEAN DEFAULT TRUE,
  weekly_iteration_day INTEGER DEFAULT 1 -- 0=Sun, 1=Mon, etc.
);
```

Tasks:

- [ ] Create migration for user_profiles table
- [ ] Add trigger to auto-create profile on user signup
- [ ] Add updated_at trigger for auto-timestamp
- [ ] Create indexes on created_at
- [ ] Set up RLS policies (users can only see own profile)

### 2. habit_failure_profiles

AI-generated diagnosis of user's failure patterns

```sql
CREATE TABLE habit_failure_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- AI Analysis
  failure_patterns TEXT[], -- e.g., ["evening energy crashes", "weekend disruption"]
  root_causes TEXT[], -- e.g., ["Poor sleep schedule", "No morning routine"]
  personality_insights JSONB, -- Structured AI analysis
  recommendations TEXT[], -- High-level suggestions

  -- Shareability
  share_token TEXT UNIQUE, -- For public sharing
  view_count INTEGER DEFAULT 0,

  -- Versioning
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE
);
```

Tasks:

- [ ] Create migration for habit_failure_profiles
- [ ] Add unique index on (user_id, is_active) where is_active=true
- [ ] Add index on share_token
- [ ] Create function to generate unique share tokens
- [ ] Set up RLS policies

### 3. habit_stacks

Collection of habits for a user

```sql
CREATE TABLE habit_stacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  failure_profile_id UUID REFERENCES habit_failure_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Stack metadata
  name TEXT DEFAULT 'My Habit Stack',
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,

  -- AI generation context
  generation_context JSONB -- Original prompt/constraints used
);
```

Tasks:

- [ ] Create migration for habit_stacks
- [ ] Add unique index on (user_id, is_active) where is_active=true
- [ ] Add foreign key indexes
- [ ] Set up RLS policies

### 4. habits

Individual habit definitions

```sql
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stack_id UUID REFERENCES habit_stacks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Habit details
  title TEXT NOT NULL, -- e.g., "Morning meditation"
  description TEXT,
  rationale TEXT, -- "Why this works for you" AI explanation

  -- Scheduling
  frequency_type TEXT CHECK (frequency_type IN ('daily', 'weekly', 'custom')),
  frequency_days INTEGER[], -- 0=Sun, 1=Mon, etc. for weekly
  reminder_time TIME, -- Time of day for push notification

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  archived_at TIMESTAMPTZ,

  -- Order in stack
  display_order INTEGER DEFAULT 0
);
```

Tasks:

- [ ] Create migration for habits table
- [ ] Add index on (stack_id, is_active)
- [ ] Add check constraints on frequency_type
- [ ] Set up RLS policies
- [ ] Create trigger to validate frequency_days

### 5. habit_logs

Daily check-in records

```sql
CREATE TABLE habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Check-in data
  log_date DATE NOT NULL,
  completed BOOLEAN NOT NULL,
  obstacle TEXT, -- Optional: what blocked completion

  -- Metadata
  checked_in_at TIMESTAMPTZ DEFAULT NOW(),
  checked_in_via TEXT DEFAULT 'app', -- 'app', 'notification', 'widget'

  UNIQUE(habit_id, log_date) -- One log per habit per day
);
```

Tasks:

- [ ] Create migration for habit_logs
- [ ] Add unique index on (habit_id, log_date)
- [ ] Add index on (user_id, log_date) for queries
- [ ] Set up RLS policies
- [ ] Create function to validate log_date isn't future

### 6. weekly_iterations

AI-generated weekly insights and adjustments

```sql
CREATE TABLE weekly_iterations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  stack_id UUID REFERENCES habit_stacks(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Week metadata
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,

  -- AI Analysis
  patterns_detected TEXT[], -- What the AI noticed
  success_rate JSONB, -- Per-habit completion rates
  adjustment_suggestion TEXT NOT NULL, -- The ONE adjustment
  adjustment_rationale TEXT, -- Why this adjustment

  -- User interaction
  user_response TEXT CHECK (user_response IN ('accepted', 'declined', 'pending')),
  responded_at TIMESTAMPTZ,

  -- Implementation
  implemented BOOLEAN DEFAULT FALSE,
  implementation_notes TEXT
);
```

Tasks:

- [ ] Create migration for weekly_iterations
- [ ] Add index on (user_id, week_start_date)
- [ ] Add check constraint on dates (end > start)
- [ ] Set up RLS policies
- [ ] Create function to calculate week_start/end_date

## Technical Tasks

### 1. Create Database Migrations

- [ ] Migration 001: user_profiles
- [ ] Migration 002: habit_failure_profiles
- [ ] Migration 003: habit_stacks
- [ ] Migration 004: habits
- [ ] Migration 005: habit_logs
- [ ] Migration 006: weekly_iterations
- [ ] Migration 007: indexes and constraints
- [ ] Migration 008: RLS policies
- [ ] Migration 009: database functions

### 2. Implement Row Level Security (RLS)

#### user_profiles

```sql
-- Users can only view/update their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);
```

Tasks:

- [ ] Enable RLS on all tables
- [ ] Create SELECT policies for each table
- [ ] Create INSERT policies where needed
- [ ] Create UPDATE policies where needed
- [ ] Create DELETE policies where needed
- [ ] Test policies with different users

### 3. Create Database Functions

#### auto_update_timestamp

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

Functions to create:

- [ ] `update_updated_at_column()` - Auto-update timestamps
- [ ] `create_user_profile()` - Auto-create profile on signup
- [ ] `generate_share_token()` - Unique shareable URLs
- [ ] `calculate_week_range()` - Get week start/end dates
- [ ] `get_habit_completion_rate()` - Calculate success metrics

### 4. Create Database Triggers

- [ ] Trigger: auto-update updated_at on user_profiles
- [ ] Trigger: create profile after auth.users insert
- [ ] Trigger: validate habit log dates
- [ ] Trigger: increment share_token view count

### 5. Create Seed Data for Testing

```sql
-- supabase/seed.sql
INSERT INTO user_profiles (id, full_name, ...)
VALUES (...);
```

- [ ] Create test user profiles (3-5 users)
- [ ] Create sample habit failure profiles
- [ ] Create sample habit stacks
- [ ] Create sample habits
- [ ] Create sample habit logs (2 weeks of data)
- [ ] Create sample weekly iterations
- [ ] Document seed data in README

### 6. Build TypeScript Types

```typescript
// types/database.ts
export interface UserProfile {
  id: string;
  full_name: string | null;
  created_at: string;
  // ... all fields
}

export interface HabitFailureProfile {
  // ...
}

// ... all table types
```

- [ ] Generate types from Supabase schema
- [ ] Create `types/database.ts` with all interfaces
- [ ] Add JSDoc comments for documentation
- [ ] Export types for use across app

### 7. Create Database Client Utilities

```typescript
// lib/db.ts
export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
};
```

- [ ] Create `lib/db.ts` with type-safe queries
- [ ] Add helper functions for common queries
- [ ] Implement error handling patterns
- [ ] Add query logging for debugging

## Deliverables

1. **Complete Database Schema**
   - All 6 tables created and migrated
   - Relationships properly defined
   - Constraints enforced

2. **Security Implementation**
   - RLS policies on all tables
   - User data properly isolated
   - Policies tested and verified

3. **Performance Optimization**
   - Indexes on frequently queried columns
   - Foreign key indexes
   - Composite indexes where needed

4. **Developer Experience**
   - TypeScript types generated
   - Helper functions for common queries
   - Seed data for local testing
   - Schema documentation

5. **Documentation**
   - Entity Relationship Diagram (ERD)
   - Table descriptions and field purposes
   - RLS policy explanations
   - Migration guide

## Testing Checklist

### Schema Validation

- [ ] All tables created successfully
- [ ] Foreign keys enforce relationships
- [ ] Check constraints work (e.g., frequency_type)
- [ ] Unique constraints prevent duplicates
- [ ] Default values applied correctly

### RLS Testing

- [ ] User A cannot access User B's profile
- [ ] User A cannot access User B's habits
- [ ] User A cannot access User B's logs
- [ ] Share tokens allow public access to profiles
- [ ] Unauthenticated users blocked from all tables

### Performance Testing

- [ ] Query user profile by ID < 10ms
- [ ] Query habits for stack < 20ms
- [ ] Query habit logs for week < 30ms
- [ ] Insert habit log < 50ms
- [ ] Complex joins perform acceptably

### Data Integrity

- [ ] Deleting user cascades to all related data
- [ ] Cannot create habit without stack
- [ ] Cannot create log for non-existent habit
- [ ] Cannot create duplicate logs for same date
- [ ] Timestamps auto-update on record changes

## Risks & Mitigations

| Risk                                 | Likelihood | Impact   | Mitigation                                |
| ------------------------------------ | ---------- | -------- | ----------------------------------------- |
| RLS policy bugs leak data            | Medium     | Critical | Thorough testing with multiple test users |
| Poor query performance               | Low        | Medium   | Add indexes early, monitor queries        |
| Schema changes break app             | Medium     | High     | Use migrations, never alter directly      |
| Foreign key cascades delete too much | Low        | High     | Test cascade behavior thoroughly          |

## Dependencies for Next Phase

Phase 4 (Smart Onboarding) requires:

- ✅ user_profiles table ready
- ✅ habit_failure_profiles table ready
- ✅ RLS policies working
- ✅ TypeScript types generated

## Notes

- Use Supabase Dashboard to visualize tables during development
- Run migrations locally first, then push to production
- Keep migrations small and focused
- Never edit migration files after they're run
- Back up database before running new migrations
- Document any breaking changes clearly

## Resources

- [Supabase Database Guide](https://supabase.com/docs/guides/database)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Design Best Practices](https://www.postgresql.org/docs/current/ddl-best-practices.html)
