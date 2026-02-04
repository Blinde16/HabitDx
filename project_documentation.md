# AI Habit Stack Designer — Project Documentation

---

# 1. PROJECT DESCRIPTION

**HabitDx** is an AI-powered habit diagnosis app for knowledge workers who've tried and failed at building habits. Unlike generic tracking apps that simply log whether you completed a task, HabitDx analyzes *why* your habits fail and delivers personalized weekly adjustments based on your specific patterns.

The app solves the core frustration voiced by our target users: "I know what to do, why can't I just do it?" Instead of blaming willpower, HabitDx treats habit failure as a design problem. Through a 5-minute smart intake, the AI generates your personal "Habit Failure Profile"—identifying patterns like "evening energy crashes" or "weekend routine disruption"—then designs habits that work around your constraints. Each week, the app analyzes your check-in data and delivers one specific adjustment, turning self-blame into system fixes. The result: habits that fit your actual life instead of fighting it.

---

# 2. PRODUCT REQUIREMENTS DOCUMENT (PRD)

## 2.1 Problem Statement

**92% of habit attempts fail**, and existing apps make the problem worse by:
- Tracking without guidance (passive scorecards)
- Using streak-based motivation that creates shame spirals when broken
- Offering generic advice that ignores individual constraints
- Providing no diagnosis of *why* habits fail

Our target users—knowledge workers 28-38 who've tried 3+ habit apps—feel quiet despair about their inability to build consistent habits. They've read Atomic Habits, downloaded Habitica and Streaks, and still can't make habits stick. The bottleneck isn't motivation—it's personalized design and intelligent iteration.

## 2.2 Target Users

### Primary Persona: "Frustrated High-Achiever"
- **Demographics**: Age 28-38, knowledge worker (PM, engineer, marketer), $70K-150K income
- **Behaviors**: Downloaded 3+ habit apps, read productivity books, longest streak ~2-3 weeks
- **Pain points**: Shame from repeated failure, no diagnosis of root causes, rigid systems that break
- **Where to find**: r/productivity, r/habits, James Clear followers, Notion/Obsidian users

### Secondary Persona: "Overwhelmed New Parent"
- Massive life transition, desperate for efficiency, severe time constraints
- *Note: Future expansion target, not MVP focus*

### NOT For
- Habit beginners who've never tried tracking
- Casual users wanting a simple checkbox (use Streaks)
- Gamification seekers (use Habitica)
- Quick-fix hunters ("21 days to change your life")

## 2.3 Goals and Success Metrics

### Primary Goals
1. Help users understand *why* their habits fail
2. Design habits that fit users' actual constraints
3. Iterate weekly based on real data, not generic advice

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Onboarding completion | >70% | Users who complete intake / signups |
| Week 1 return rate | >40% | Users who check in day 7 / signups |
| Week 4 retention | >20% | Users active at day 28 / signups |
| Iteration acceptance | >50% | Users who implement weekly suggestion |
| Free → Paid conversion | >5% | Paid users / total users |
| Habit Failure Profile shares | >10% | Shares / profiles generated |

## 2.4 Features by Priority

### P0 — Must Have (MVP)

| Feature | Description | Rationale |
|---------|-------------|-----------|
| Smart onboarding | 5-min intake capturing past failures, constraints, goals | Core data for personalization |
| Habit Failure Profile | AI-generated diagnosis of user's failure patterns | Key differentiator, shareable artifact |
| Personalized habit stack | 1-3 AI-designed habits with "why this works for you" | Immediate actionable value |
| Daily check-in | 10-second tap (done/not done + optional obstacle) | Minimal friction data collection |
| Weekly iteration | AI analyzes patterns, delivers ONE adjustment | Core value loop |
| Push notifications | Configurable reminders per habit | Accountability trigger |

### P1 — Should Have (v1.1)

| Feature | Description | Rationale |
|---------|-------------|-----------|
| Insight history | View past weekly adjustments and their impact | Show compounding value |
| Constraint updates | Easy way to update when life changes | Maintain relevance |
| Streak visualization | "Don't miss twice" philosophy (one miss ≠ reset) | Reduce shame spiral |
| Export/share profile | Share Habit Failure Profile to social | Virality mechanism |

### P2 — Nice to Have (v1.2+)

| Feature | Description | Rationale |
|---------|-------------|-----------|
| Ad-hoc AI questions | "Why did I fail this week?" chat | Deeper engagement |
| Progress analytics | Trends over 4/8/12 weeks | Long-term retention |
| Apple Health integration | Auto-detect sleep, activity | Reduce manual input |
| Social accountability | Paired check-ins with friend | Retention boost |

### Out of Scope (Not Building)

- Gamification (points, badges, leaderboards)
- Community/social feed
- Web version (mobile-only for MVP)
- Calendar sync
- Payment processing (free for MVP validation)
- Multiple languages

## 2.5 User Stories

### Onboarding
1. As a new user, I want to describe my past habit failures so the app understands my patterns
2. As a new user, I want to input my schedule and energy patterns so habits fit my life
3. As a new user, I want to see my Habit Failure Profile so I understand why I've been failing
4. As a new user, I want to receive personalized habits with explanations so I trust the recommendations

### Daily Use
5. As a user, I want to check in with one tap so tracking doesn't become a burden
6. As a user, I want to optionally note what blocked me so the AI can learn my obstacles
7. As a user, I want reminders at the right time so I don't forget my habits

### Weekly Iteration
8. As a user, I want to receive one specific adjustment each week so I can improve incrementally
9. As a user, I want to understand *why* the adjustment was suggested so I learn about myself
10. As a user, I want to accept or decline adjustments so I stay in control

### Settings
11. As a user, I want to update my constraints when life changes so habits stay relevant
12. As a user, I want to regenerate my habit stack if I want to start fresh

## 2.6 Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| AI insights feel generic | Medium | High | Heavy prompt engineering, user feedback loop, personalization from intake |
| Users don't complete onboarding | Medium | High | Progressive disclosure, show value early (teaser of profile) |
| Users don't return after week 1 | High | High | Push notifications, compelling weekly insights, email sequences |
| Atoms (James Clear) copies feature | Low | Medium | Move fast, build community, iterate faster |
| Technical delays | Medium | Medium | Ruthless scope control, weekly team check-ins |

## 2.7 Timeline and Milestones

| Milestone | Target Date | Deliverable |
|-----------|-------------|-------------|
| M1: Foundation | Week 2 | Auth, navigation, database schema |
| M2: Onboarding | Week 4 | Smart intake + Habit Failure Profile |
| M3: Core Loop | Week 6 | Habit stack + daily check-in |
| M4: Iteration | Week 8 | Weekly analysis + insight delivery |
| M5: Polish | Week 10 | Bug fixes, beta feedback integration |
| M6: Soft Launch | Week 11 | TestFlight/internal release |

---

# 3. PLAN DOCUMENT

## 3.1 Work Breakdown

### Phase 1: Foundation (Weeks 1-2)

**Objective**: Establish technical infrastructure and basic app shell

#### 1.1 Project Setup
- Initialize Expo project with TypeScript
- Configure ESLint, Prettier, and project structure
- Set up Git repository with branch protection
- Create development, staging, production environments

#### 1.2 Backend Configuration
- Create Supabase project
- Configure authentication (email + Google OAuth)
- Design and implement database schema
- Set up Row Level Security policies
- Create Edge Functions scaffold

#### 1.3 App Shell
- Implement navigation structure (React Navigation)
- Create common UI components (buttons, inputs, cards)
- Set up global state management (Zustand or Context)
- Implement auth flow screens (login, signup, forgot password)

### Phase 2: Smart Onboarding (Weeks 3-4)

**Objective**: Build the intake flow that collects user data for AI analysis

#### 2.1 Intake Flow Design
- Design conversational UI for intake (not forms)
- Create 5-screen progressive disclosure flow:
  1. Past habits tried and failed (free text + suggestions)
  2. Why you think they failed (multiple choice + other)
  3. Your schedule constraints (visual time picker)
  4. Energy patterns (morning/afternoon/evening slider)
  5. Identity goal ("I want to be someone who...")

#### 2.2 Data Storage
- Store intake responses in user_profiles table
- Implement local caching for offline completion
- Add progress persistence (resume if app closes)

#### 2.3 AI Integration — Failure Analysis
- Write system prompt for failure pattern analysis
- Implement Edge Function to call GPT-4o-mini
- Parse and store AI response in habit_failure_profiles table
- Handle API errors gracefully (retry, fallback)

#### 2.4 Habit Failure Profile UI
- Design shareable profile card component
- Display failure patterns with explanations
- Add "Share" functionality (image export)
- Implement "Continue to habits" CTA

### Phase 3: Core Loop (Weeks 5-6)

**Objective**: Build the daily habit tracking experience

#### 3.1 AI Habit Generation
- Write system prompt for habit stack generation
- Input: failure profile + constraints + identity goal
- Output: 1-3 habits with anchor, tiny version, celebration, rationale
- Store in habit_stacks table

#### 3.2 Home Screen
- Display today's habits with status
- Show current streak (with "don't miss twice" logic)
- Quick-tap to mark complete
- Visual feedback on completion (animation)

#### 3.3 Check-in Flow
- Tap habit → mark complete (success animation)
- Long-press or swipe → mark incomplete + obstacle prompt
- Obstacle options: "No time", "Forgot", "Too tired", "Life happened", "Other"
- Store in habit_logs table with timestamp

#### 3.4 Push Notifications
- Implement Expo Push Notifications
- Per-habit reminder scheduling
- Smart timing based on user's schedule constraints
- Notification permission flow

### Phase 4: Iteration Engine (Weeks 7-8)

**Objective**: Build the weekly AI analysis and insight delivery

#### 4.1 Weekly Analysis Job
- Create scheduled Edge Function (runs Sunday evening)
- Query user's check-in data for past 7 days
- Identify patterns: which habits failed, when, what obstacles

#### 4.2 AI Insight Generation
- Write system prompt for iteration analysis
- Input: week's data + original profile + constraints
- Output: one specific adjustment with rationale
- Store in weekly_iterations table

#### 4.3 Insight Delivery
- Push notification: "Your weekly habit review is ready"
- Insight screen with:
  - Summary of week (X of Y habits completed)
  - Pattern identified ("You struggled with [habit] on [days]")
  - One adjustment recommendation
  - "Accept" / "Keep current" buttons

#### 4.4 Adjustment Implementation
- If accepted, update habit_stack with new parameters
- Log acceptance/rejection for future AI learning
- Show confirmation with encouragement

### Phase 5: Polish (Weeks 9-10)

**Objective**: Refine UX, fix bugs, prepare for launch

#### 5.1 UX Improvements
- Optimize onboarding based on completion data
- Add loading states and error handling throughout
- Implement empty states and first-use guidance
- Performance optimization (lazy loading, caching)

#### 5.2 Settings & Account
- Profile settings (name, email, photo)
- Notification preferences (per-habit timing)
- Constraint update flow
- "Regenerate my habits" option
- Account deletion (GDPR compliance)

#### 5.3 Testing & QA
- Unit tests for critical functions
- Integration tests for auth and API flows
- Manual QA on iOS and Android
- Beta testing with 10-20 users

#### 5.4 Launch Prep
- App Store assets (screenshots, description)
- TestFlight setup for iOS
- Internal testing track for Android
- Analytics integration (Mixpanel/Amplitude)

## 3.2 Technical Approach

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

### AI Prompt Strategy
- System prompts stored in version control
- Environment variables for model selection
- Structured JSON output with Zod validation
- Fallback responses for API failures

## 3.3 Dependencies and Prerequisites

### Technical Dependencies
- Node.js 18+
- Expo SDK 50+
- Supabase account
- OpenAI API key
- Apple Developer account ($99/year)
- Google Play Developer account ($25 one-time)

### Team Prerequisites
- React Native / Expo experience
- Basic SQL / Supabase knowledge
- Understanding of AI prompt engineering
- iOS/Android device for testing

---

# 4. ROADMAP DOCUMENT

## Phase 1: Foundation (Weeks 1-2)

### Week 1
- [ ] Initialize Expo project with TypeScript template
- [ ] Set up Git repository with main/develop branches
- [ ] Create Supabase project and configure environment
- [ ] Design database schema (see Architecture Doc)
- [ ] Implement schema migrations
- [ ] Configure Supabase Auth (email + Google)
- [ ] Create basic navigation structure

### Week 2
- [ ] Build auth screens (login, signup, forgot password)
- [ ] Implement auth state management
- [ ] Create common UI component library
- [ ] Set up global theming (colors, typography)
- [ ] Test auth flow end-to-end
- [ ] **Checkpoint: User can sign up and log in**

## Phase 2: Smart Onboarding (Weeks 3-4)

### Week 3
- [ ] Design onboarding flow wireframes
- [ ] Build Screen 1: Past habits (text input + suggestions)
- [ ] Build Screen 2: Why they failed (multi-select)
- [ ] Build Screen 3: Schedule constraints (time picker)
- [ ] Build Screen 4: Energy patterns (slider)
- [ ] Build Screen 5: Identity goal (text input)
- [ ] Implement progress persistence

### Week 4
- [ ] Write AI prompt for failure analysis
- [ ] Create analyze-failure Edge Function
- [ ] Test AI responses with sample data
- [ ] Build Habit Failure Profile UI
- [ ] Implement share functionality
- [ ] Connect onboarding to AI analysis
- [ ] **Checkpoint: User sees personalized Failure Profile**

## Phase 3: Core Loop (Weeks 5-6)

### Week 5
- [ ] Write AI prompt for habit generation
- [ ] Create generate-habits Edge Function
- [ ] Build home screen with habit list
- [ ] Implement tap-to-complete interaction
- [ ] Add completion animations
- [ ] Build obstacle logging flow

### Week 6
- [ ] Implement streak tracking logic
- [ ] Set up push notification infrastructure
- [ ] Build notification permission flow
- [ ] Create per-habit reminder scheduling
- [ ] Test daily check-in flow end-to-end
- [ ] **Checkpoint: User can track habits daily**

## Phase 4: Iteration Engine (Weeks 7-8)

### Week 7
- [ ] Write AI prompt for weekly analysis
- [ ] Create weekly-iteration Edge Function
- [ ] Build scheduled job trigger (Supabase cron)
- [ ] Test analysis with sample check-in data
- [ ] Build weekly insight notification

### Week 8
- [ ] Design insight delivery screen
- [ ] Implement accept/decline flow
- [ ] Build adjustment implementation logic
- [ ] Add insight history view
- [ ] Test full weekly cycle
- [ ] **Checkpoint: User receives weekly insights**

## Phase 5: Polish (Weeks 9-10)

### Week 9
- [ ] Conduct internal QA testing
- [ ] Fix critical bugs
- [ ] Optimize onboarding completion rate
- [ ] Add loading states and error handling
- [ ] Implement settings screen
- [ ] Build constraint update flow

### Week 10
- [ ] Recruit 10-20 beta testers
- [ ] Distribute via TestFlight / internal track
- [ ] Collect and analyze feedback
- [ ] Fix beta-identified issues
- [ ] Prepare App Store assets
- [ ] **Checkpoint: Beta complete, ready for soft launch**

## Post-MVP (Weeks 11+)

### Week 11: Soft Launch
- [ ] Submit to App Store review
- [ ] Submit to Google Play review
- [ ] Prepare launch posts (Reddit, Twitter)
- [ ] Set up basic analytics dashboard

### Week 12+: Iterate
- [ ] Analyze user behavior data
- [ ] Prioritize v1.1 features based on feedback
- [ ] Begin P1 feature development
- [ ] Explore monetization timing

---

# 5. MVP DEFINITION

## 5.1 The ONE Core Problem

**Help users understand WHY their habits fail and give them ONE weekly adjustment.**

Everything else is secondary. If users don't feel the AI "gets" them and provides useful insights, nothing else matters.

## 5.2 Minimum Feature Set

| Feature | Included | Rationale |
|---------|----------|-----------|
| Email/Google auth | ✅ | Required for persistence |
| Smart onboarding (5 screens) | ✅ | Core data collection |
| AI Failure Profile | ✅ | Key differentiator |
| AI habit stack (1-3 habits) | ✅ | Immediate value |
| Daily check-in (tap + obstacle) | ✅ | Data for iteration |
| Weekly AI insight | ✅ | Core value loop |
| Push notifications | ✅ | Accountability trigger |
| Basic settings | ✅ | Minimum usability |

## 5.3 What We're Cutting

| Feature | Status | Why Cut |
|---------|--------|---------|
| Gamification | ❌ | Distracts from core value |
| Social features | ❌ | Complexity, not core |
| Web version | ❌ | Mobile-first, resource constraint |
| Calendar sync | ❌ | Nice-to-have, not essential |
| Wearable integration | ❌ | Complexity, future feature |
| Payment/subscription | ❌ | Validate free first |
| Analytics dashboard | ❌ | P1 feature |
| Multiple languages | ❌ | US-first launch |

## 5.4 Simplest Technical Approach

| Component | Choice | Why |
|-----------|--------|-----|
| Frontend | Expo + React Native | Cross-platform, fast iteration |
| Backend | Supabase | Auth + DB + Functions in one |
| AI | GPT-4o-mini via API | Cheapest viable option |
| State | Zustand | Simple, lightweight |
| Navigation | Expo Router | File-based, less boilerplate |

## 5.5 MVP Validation Criteria

**After 4 weeks with 50+ users, we need:**

| Metric | Target | If Not Met |
|--------|--------|------------|
| Onboarding completion | >70% | Simplify intake flow |
| Week 1 return | >40% | Improve habit suggestions |
| Iteration engagement | >50% | Refine AI prompts |
| Qualitative feedback | "Insightful" | Pivot or iterate |

## 5.6 What "Done" Looks Like

A user can:
1. Sign up with email or Google
2. Complete 5-minute onboarding
3. See their personalized Habit Failure Profile
4. Receive 1-3 AI-designed habits
5. Check in daily with one tap
6. Get a push notification reminder
7. Receive a weekly insight with one adjustment
8. Accept or decline the adjustment

**If a user can do all 8 steps, MVP is complete.**

---

# 6. ARCHITECTURE DOCUMENT

## 6.1 System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Expo / React Native                   │   │
│  │                                                         │   │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐           │   │
│  │  │ Onboarding│  │   Home    │  │  Insights │           │   │
│  │  │   Flow    │  │  (Habits) │  │  (Weekly) │           │   │
│  │  └───────────┘  └───────────┘  └───────────┘           │   │
│  │                                                         │   │
│  │  ┌───────────────────────────────────────────┐         │   │
│  │  │           Supabase Client SDK             │         │   │
│  │  └───────────────────────────────────────────┘         │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND LAYER                            │
│                          (Supabase)                             │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │    Auth     │  │  Database   │  │     Edge Functions      │ │
│  │             │  │  (Postgres) │  │                         │ │
│  │ • Email     │  │             │  │ • analyze-failure       │ │
│  │ • Google    │  │ • users     │  │ • generate-habits       │ │
│  │ • Sessions  │  │ • profiles  │  │ • weekly-iteration      │ │
│  │             │  │ • habits    │  │                         │ │
│  └─────────────┘  │ • logs      │  └───────────┬─────────────┘ │
│                   │ • insights  │              │               │
│                   └─────────────┘              │               │
└───────────────────────────────────────────────┼───────────────┘
                                                │
                              ┌─────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         AI LAYER                                │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    OpenAI API                            │   │
│  │                   (GPT-4o-mini)                          │   │
│  │                                                         │   │
│  │  • Failure pattern analysis                             │   │
│  │  • Habit stack generation                               │   │
│  │  • Weekly iteration insights                            │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## 6.2 Database Schema

```sql
-- ============================================
-- USERS (managed by Supabase Auth)
-- ============================================
-- auth.users table is automatic

-- ============================================
-- USER PROFILES
-- ============================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic info
  display_name TEXT,
  
  -- Onboarding responses (JSONB for flexibility)
  past_habits JSONB,          -- [{habit, duration, why_failed}]
  failure_reasons TEXT[],     -- ['no_time', 'forgot', 'too_ambitious']
  
  -- Constraints
  wake_time TIME,
  sleep_time TIME,
  work_start TIME,
  work_end TIME,
  energy_pattern TEXT,        -- 'morning', 'afternoon', 'evening'
  life_constraints TEXT[],    -- ['kids', 'commute', 'health_issues']
  
  -- Goals
  identity_goal TEXT,         -- "I want to be someone who..."
  
  -- Metadata
  onboarding_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- HABIT FAILURE PROFILES (AI-generated)
-- ============================================
CREATE TABLE habit_failure_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- AI analysis output
  failure_patterns JSONB,     -- [{pattern, description, frequency}]
  root_causes TEXT[],
  personality_insights TEXT,
  recommendations TEXT[],
  
  -- Raw AI response for debugging
  raw_response JSONB,
  model_used TEXT,
  tokens_used INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- HABIT STACKS (AI-generated)
-- ============================================
CREATE TABLE habit_stacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Stack metadata
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- AI generation context
  generation_rationale TEXT,
  based_on_profile_id UUID REFERENCES habit_failure_profiles(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDIVIDUAL HABITS
-- ============================================
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stack_id UUID REFERENCES habit_stacks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Habit definition
  name TEXT NOT NULL,                    -- "Morning stretch"
  tiny_version TEXT,                     -- "One stretch for 30 seconds"
  anchor TEXT,                           -- "After I pour my coffee"
  celebration TEXT,                      -- "Say 'I'm getting stronger'"
  
  -- Why this habit
  addresses_pattern TEXT,                -- Links to failure pattern
  rationale TEXT,                        -- AI explanation
  
  -- Scheduling
  reminder_time TIME,
  reminder_enabled BOOLEAN DEFAULT TRUE,
  days_of_week INTEGER[] DEFAULT '{1,2,3,4,5,6,7}', -- 1=Mon, 7=Sun
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  order_index INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- HABIT LOGS (daily check-ins)
-- ============================================
CREATE TABLE habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Check-in data
  logged_date DATE NOT NULL,
  completed BOOLEAN NOT NULL,
  partial BOOLEAN DEFAULT FALSE,         -- Did smaller version
  
  -- Obstacle tracking
  obstacle TEXT,                         -- 'no_time', 'forgot', etc.
  obstacle_note TEXT,                    -- Free text if "other"
  
  -- Metadata
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(habit_id, logged_date)
);

-- ============================================
-- WEEKLY ITERATIONS (AI insights)
-- ============================================
CREATE TABLE weekly_iterations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stack_id UUID REFERENCES habit_stacks(id),
  
  -- Week reference
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  
  -- AI analysis
  summary JSONB,                         -- {completed, missed, patterns}
  insight TEXT,                          -- The one adjustment
  insight_rationale TEXT,                -- Why this adjustment
  affected_habit_id UUID REFERENCES habits(id),
  suggested_change JSONB,                -- {field, old_value, new_value}
  
  -- User response
  status TEXT DEFAULT 'pending',         -- 'pending', 'accepted', 'declined'
  responded_at TIMESTAMPTZ,
  
  -- Raw AI response
  raw_response JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_habit_logs_user_date ON habit_logs(user_id, logged_date);
CREATE INDEX idx_habit_logs_habit_date ON habit_logs(habit_id, logged_date);
CREATE INDEX idx_habits_user_active ON habits(user_id, is_active);
CREATE INDEX idx_iterations_user_week ON weekly_iterations(user_id, week_start);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_failure_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_stacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_iterations ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can view own failure profiles" ON habit_failure_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own habit stacks" ON habit_stacks
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own habits" ON habits
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own logs" ON habit_logs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own iterations" ON weekly_iterations
  FOR ALL USING (auth.uid() = user_id);
```

## 6.3 API Endpoints (Edge Functions)

### POST /functions/v1/analyze-failure

**Purpose**: Generate Habit Failure Profile from onboarding data

**Input**:
```json
{
  "past_habits": [
    {"habit": "Morning workout", "duration": "2 weeks", "why_failed": "Too tired"}
  ],
  "failure_reasons": ["no_time", "too_ambitious"],
  "energy_pattern": "evening",
  "constraints": ["kids", "long_commute"],
  "identity_goal": "I want to be someone who takes care of their health"
}
```

**Output**:
```json
{
  "failure_patterns": [
    {
      "pattern": "Morning Energy Mismatch",
      "description": "You're an evening person trying morning habits",
      "frequency": "high"
    }
  ],
  "root_causes": ["Scheduling against natural energy", "Habit scope too large"],
  "recommendations": ["Shift habits to evening", "Start with 2-minute versions"]
}
```

### POST /functions/v1/generate-habits

**Purpose**: Generate personalized habit stack

**Input**:
```json
{
  "failure_profile_id": "uuid",
  "constraints": {...},
  "identity_goal": "..."
}
```

**Output**:
```json
{
  "habits": [
    {
      "name": "Evening stretch",
      "tiny_version": "One stretch, 30 seconds",
      "anchor": "After I close my laptop",
      "celebration": "Take a deep breath and smile",
      "addresses_pattern": "Morning Energy Mismatch",
      "rationale": "This works for you because..."
    }
  ]
}
```

### POST /functions/v1/weekly-iteration

**Purpose**: Analyze week and generate insight (called by cron)

**Input**:
```json
{
  "user_id": "uuid",
  "week_start": "2026-02-03",
  "week_end": "2026-02-09"
}
```

**Output**:
```json
{
  "summary": {
    "total_check_ins": 21,
    "completed": 15,
    "completion_rate": 0.71,
    "struggling_habit": "Evening stretch",
    "struggling_days": ["Wednesday", "Thursday"]
  },
  "insight": "Move your evening stretch to right after dinner instead of before bed",
  "rationale": "You consistently missed on Wednesday and Thursday evenings when you stayed up late working. Post-dinner is a more reliable anchor.",
  "suggested_change": {
    "habit_id": "uuid",
    "field": "anchor",
    "old_value": "After I close my laptop",
    "new_value": "After I finish dinner"
  }
}
```

## 6.4 AI Prompts

### Failure Analysis Prompt
```
You are a habit architect trained in behavioral science (BJ Fogg's Tiny Habits, James Clear's Atomic Habits, and behavioral psychology).

A user has shared their past habit failures and life constraints. Analyze their patterns and provide a "Habit Failure Profile."

USER DATA:
- Past habits tried: {past_habits}
- Self-reported failure reasons: {failure_reasons}
- Energy pattern: {energy_pattern}
- Life constraints: {constraints}
- Identity goal: {identity_goal}

INSTRUCTIONS:
1. Identify 2-3 recurring failure PATTERNS (not just symptoms)
2. Determine root causes behind the patterns
3. Note personality insights relevant to habit design
4. Provide 2-3 specific recommendations

OUTPUT FORMAT (JSON):
{
  "failure_patterns": [
    {"pattern": "name", "description": "explanation", "frequency": "high|medium|low"}
  ],
  "root_causes": ["cause1", "cause2"],
  "personality_insights": "brief insight about user",
  "recommendations": ["rec1", "rec2"]
}

Be specific, insightful, and empathetic. Avoid generic advice.
```

### Habit Generation Prompt
```
You are a habit architect. Based on the user's Failure Profile, design a personalized habit stack.

FAILURE PROFILE:
{failure_profile}

CONSTRAINTS:
- Wake: {wake_time}, Sleep: {sleep_time}
- Work: {work_start} - {work_end}
- Energy peak: {energy_pattern}
- Life factors: {constraints}

IDENTITY GOAL: {identity_goal}

DESIGN RULES:
1. Maximum 3 habits (start small)
2. Each habit must be "tiny" (2 minutes or less)
3. Attach to existing routines (anchors)
4. Account for their specific failure patterns
5. Include a celebration for dopamine hit

OUTPUT FORMAT (JSON):
{
  "habits": [
    {
      "name": "short name",
      "tiny_version": "2-minute version",
      "anchor": "After I [existing habit]",
      "celebration": "simple reward",
      "addresses_pattern": "which failure pattern this solves",
      "rationale": "why this works for YOU specifically"
    }
  ],
  "stack_rationale": "overall explanation of this combination"
}
```

### Weekly Iteration Prompt
```
You are a habit coach reviewing a user's week. Provide ONE specific adjustment.

USER CONTEXT:
- Failure profile: {failure_profile}
- Current habits: {habits}
- Constraints: {constraints}

THIS WEEK'S DATA:
{weekly_logs}

ANALYSIS REQUIRED:
1. Calculate completion rate per habit
2. Identify patterns (which days/times failed)
3. Look for obstacle trends
4. Compare to their known failure patterns

OUTPUT RULES:
- Give exactly ONE adjustment (not multiple)
- Be specific (not "try harder")
- Explain why based on their data
- Keep it encouraging but honest

OUTPUT FORMAT (JSON):
{
  "summary": {
    "total_check_ins": N,
    "completed": N,
    "completion_rate": 0.XX,
    "struggling_habit": "name or null",
    "struggling_days": ["day1", "day2"] or []
  },
  "insight": "The ONE specific adjustment",
  "rationale": "Why this adjustment based on their data",
  "suggested_change": {
    "habit_id": "uuid or null",
    "field": "anchor|time|tiny_version|null",
    "old_value": "current",
    "new_value": "suggested"
  } or null
}
```

## 6.5 Security Considerations

### Authentication
- Supabase Auth handles JWT tokens
- Refresh tokens stored securely in device keychain
- Session expiry: 1 week with refresh

### Data Protection
- All API calls over HTTPS
- Row Level Security ensures users only access own data
- API keys stored in environment variables, never in client
- Edge Functions have service role access (bypasses RLS for batch jobs)

### Privacy
- Minimal PII collected (email, optional name)
- Habit data is sensitive but not regulated (not HIPAA)
- Data deletion endpoint for GDPR compliance
- No third-party analytics in MVP (add later with consent)

## 6.6 Deployment

### Development
- Local Expo development server
- Supabase local instance or development project
- Environment: `.env.development`

### Staging
- Expo development build
- Supabase staging project
- Environment: `.env.staging`

### Production
- Expo production build (EAS Build)
- Supabase production project
- Environment: `.env.production`
- App Store / Google Play distribution

### Environment Variables
```
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=xxx
OPENAI_API_KEY=xxx (Edge Functions only)
```

## 6.7 Cost Projections

| Scale | Users | AI Cost/mo | Supabase | Total |
|-------|-------|-----------|----------|-------|
| MVP | 100 | $1 | $0 | $1 |
| Early | 1,000 | $10 | $0 | $10 |
| Growth | 10,000 | $100 | $25 | $125 |
| Scale | 50,000 | $500 | $100 | $600 |

---

# APPENDIX: Quick Reference

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Expo + React Native | Cross-platform, fast iteration |
| Backend | Supabase | All-in-one, generous free tier |
| AI Model | GPT-4o-mini | Best cost/quality for this use case |
| State | Zustand | Simple, lightweight, sufficient |
| Navigation | Expo Router | File-based, less boilerplate |

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

## Contact

- Project Lead: [Your Name]
- Repository: [GitHub URL]
- Supabase Project: [Dashboard URL]
