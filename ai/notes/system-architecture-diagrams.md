# HabitDx System Architecture Diagrams

This document contains 5 different Mermaid UML diagrams showcasing the architecture, workflows, and interactions within the HabitDx application.

---

## 1. System Architecture Overview

This diagram illustrates the high-level system architecture showing how all components interact - from the React Native mobile app through Supabase backend to the Mastra AI server and external services.

```mermaid
graph TB
    subgraph "Mobile App Layer"
        A[React Native App<br/>Expo SDK]
        A1[Zustand State Management]
        A2[Expo Router Navigation]
        A --> A1
        A --> A2
    end

    subgraph "Backend Services"
        B[Supabase Platform]
        B1[PostgreSQL Database<br/>+ RLS Policies]
        B2[Authentication<br/>Email + Google OAuth]
        B3[Edge Functions<br/>Deno Runtime]
        B4[Realtime Subscriptions]
        B5[Cron Jobs]
        B --> B1
        B --> B2
        B --> B3
        B --> B4
        B --> B5
    end

    subgraph "AI Orchestration Layer"
        C[Mastra AI Server<br/>Node.js/Vercel]
        C1[Agents<br/>Habit Analyst<br/>Iteration Coach<br/>Habit Designer]
        C2[Workflows<br/>Failure Analysis<br/>Weekly Iteration]
        C3[Tools<br/>Database Queries<br/>External APIs]
        C4[Memory<br/>Working Memory<br/>Semantic Recall]
        C --> C1
        C --> C2
        C --> C3
        C --> C4
    end

    subgraph "External Services"
        D[OpenAI API<br/>GPT-4o-mini]
        E[Push Notification<br/>Service]
        F[Analytics<br/>Tracking]
    end

    A -->|Supabase Client| B
    A -->|@mastra/client-js| C
    B3 -->|Invoke Workflows| C
    B5 -->|Weekly Cron| B3
    C -->|AI Requests| D
    C3 -->|Query User Data| B1
    A -->|Schedule Reminders| E
    A -->|Track Events| F

    style A fill:#4f46e5,stroke:#3730a3,color:#fff
    style B fill:#22c55e,stroke:#16a34a,color:#fff
    style C fill:#f59e0b,stroke:#d97706,color:#fff
    style D fill:#ec4899,stroke:#db2777,color:#fff
```

**Key Insights:**

- **Mobile-First Architecture**: React Native with Expo provides cross-platform mobile experience
- **Unified Backend**: Supabase handles authentication, database, edge functions, and real-time updates
- **AI Orchestration**: Mastra server separates AI logic from the main backend, enabling complex multi-step workflows
- **External Dependencies**: Minimal external services keep costs low and architecture simple

---

## 2. User Onboarding & Failure Analysis Flow

This sequence diagram shows the complete user journey from signup through the AI-powered failure profile generation that sets HabitDx apart from generic habit trackers.

```mermaid
sequenceDiagram
    actor User
    participant App as React Native App
    participant Auth as Supabase Auth
    participant DB as PostgreSQL
    participant Mastra as Mastra AI Server
    participant Agent as Habit Analyst Agent
    participant OpenAI as GPT-4o-mini

    User->>App: Open HabitDx
    App->>Auth: Check session
    Auth-->>App: No active session

    User->>App: Sign up with Google
    App->>Auth: initiate OAuth flow
    Auth->>User: Google consent screen
    User->>Auth: Approve
    Auth-->>App: JWT token + user_id

    User->>App: Start onboarding

    Note over User,App: 5-minute smart intake
    User->>App: Share past habit failures<br/>(tried meditation, quit after 3 days)
    User->>App: Describe constraints<br/>(kids, long commute, evening fatigue)
    User->>App: Energy pattern & schedule<br/>(morning person, 7am-11pm)
    User->>App: Identity goal<br/>("someone who prioritizes health")

    App->>DB: Insert user_profile
    DB-->>App: Profile created

    App->>Mastra: POST /workflows/analyze-failure<br/>{userId}

    Note over Mastra: Multi-step workflow begins

    Mastra->>DB: Fetch user profile data
    DB-->>Mastra: {past_habits, constraints, energy_pattern}

    Mastra->>Agent: Execute failure analysis
    Agent->>Agent: Process patterns:<br/>- Evening energy crash<br/>- Overambitious habits<br/>- No morning anchor

    Agent->>OpenAI: Generate failure profile prompt
    OpenAI-->>Agent: Structured JSON response

    Agent->>Agent: Validate with Zod schema

    Agent->>DB: Store habit_failure_profile<br/>{failure_patterns, root_causes,<br/>personality_insights, recommendations}
    DB-->>Agent: Profile ID

    Agent-->>Mastra: Workflow completed
    Mastra-->>App: {profileId, analysis}

    App->>User: Display Failure Profile<br/>"Your pattern: Evening Energy Collapse"<br/>"Root cause: Habits scheduled after work"<br/>"Design fix: Anchor to morning coffee"

    User->>App: Proceed to habit generation
    App->>Mastra: POST /agents/habit-designer<br/>{userId, profileId}

    Mastra->>OpenAI: Generate 1-3 personalized habits
    OpenAI-->>Mastra: [Habit stack with rationales]

    Mastra->>DB: Insert habit_stack + habits
    DB-->>Mastra: Success

    Mastra-->>App: {habits with tiny_versions,<br/>anchors, celebrations}

    App->>User: Show habit stack:<br/>"After I pour coffee → 5 pushups"<br/>"Why this works: Morning energy + tiny start"

    User->>App: Accept habit stack
    App->>DB: Mark onboarding_completed_at
```

**Key Insights:**

- **Personalization from Day 1**: Unlike generic trackers, HabitDx diagnoses failure patterns before suggesting habits
- **Multi-step AI Pipeline**: Workflow orchestration ensures data fetching → analysis → validation → storage happens reliably
- **Transparent AI Reasoning**: Users see _why_ habits are designed for them, building trust
- **Systems Thinking**: Focuses on design problems (timing, energy, anchors) not willpower

---

## 3. Daily Check-In & Data Collection System

This diagram shows the minimal-friction daily check-in system that collects the data necessary for weekly AI iterations.

```mermaid
flowchart TD
    Start([User Opens App]) --> CheckTime{Time of Day?}

    CheckTime -->|Before Habit Time| A[Show Today's Habits<br/>Status: Pending]
    CheckTime -->|After Habit Time| B[Show Habits with<br/>Check-In Prompt]

    A --> WaitNotif[Wait for Push<br/>Notification]
    WaitNotif --> NotifReceived[User Taps Notification]
    NotifReceived --> B

    B --> UserAction{User Action}

    UserAction -->|Swipe Right| Done[Mark as Done]
    UserAction -->|Swipe Left| NotDone[Mark as Not Done]
    UserAction -->|Ignore| Skip[Skip - No Log]

    Done --> Celebrate[Show Celebration<br/>Animation + Message]
    Celebrate --> LogSuccess[Insert habit_log<br/>completed: true<br/>obstacle: null]

    NotDone --> ObstaclePrompt{Show Obstacle<br/>Selection}
    ObstaclePrompt -->|Select Option| LogOption
    ObstaclePrompt -->|Add Custom Note| LogCustom

    LogOption[Insert habit_log<br/>completed: false<br/>obstacle: 'No time'] --> UpdateUI
    LogCustom[Insert habit_log<br/>completed: false<br/>obstacle: 'custom text'] --> UpdateUI

    LogSuccess --> UpdateUI[Update UI with<br/>Check Mark]

    UpdateUI --> RealtimeSync[Supabase Realtime<br/>Broadcasts Update]
    RealtimeSync --> CheckWeek{Is it<br/>Sunday?}

    CheckWeek -->|Yes| TriggerWeekly[Cron Job Triggers<br/>Weekly Iteration]
    CheckWeek -->|No| End([Session Complete])

    Skip --> End

    TriggerWeekly --> AnalysisFlow[See Diagram 4]

    style Start fill:#22c55e,stroke:#16a34a,color:#fff
    style Done fill:#3b82f6,stroke:#2563eb,color:#fff
    style NotDone fill:#f59e0b,stroke:#d97706,color:#fff
    style Celebrate fill:#ec4899,stroke:#db2777,color:#fff
    style TriggerWeekly fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style End fill:#22c55e,stroke:#16a34a,color:#fff
```

**Key Insights:**

- **10-Second Check-In**: Simple swipe gestures minimize friction
- **Optional Obstacle Capture**: Users can provide context without being forced
- **Immediate Feedback**: Celebration animations reinforce positive behavior
- **Realtime Sync**: Data updates across devices instantly
- **Automated Weekly Trigger**: Sunday cron job processes all users for iteration

---

## 4. Weekly AI Iteration Engine

This flowchart demonstrates the core value loop - how HabitDx analyzes 7 days of check-in data and delivers ONE specific adjustment using branching AI logic.

```mermaid
flowchart TD
    Start([Cron Job: Sunday 8 PM]) --> FetchUsers[Query users with<br/>check-ins in last 7 days]
    FetchUsers --> Loop{For Each User}

    Loop --> FetchData[Mastra Workflow:<br/>weekly-iteration]

    subgraph "Step 1: Data Collection"
        FetchData --> GetLogs[Tool: getHabitLogs<br/>Fetch 7 days of habit_logs]
        GetLogs --> GetProfile[Tool: getUserProfile<br/>Fetch constraints + energy pattern]
    end

    subgraph "Step 2: AI Analysis"
        GetProfile --> CalculateMetrics[Calculate per habit:<br/>- Completion rate<br/>- Common obstacles<br/>- Pattern breaks]

        CalculateMetrics --> BranchLogic{Completion<br/>Rate?}

        BranchLogic -->|6-7 days| HighSuccess[Pattern: Mastered<br/>Agent analyzes: Can we scale up?]
        BranchLogic -->|3-5 days| Moderate[Pattern: Inconsistent<br/>Agent analyzes: What's blocking them?]
        BranchLogic -->|0-2 days| LowSuccess[Pattern: Struggling<br/>Agent analyzes: Habit too hard?]

        HighSuccess --> AgentScaleUp[Iteration Coach Agent<br/>Suggest: Increase duration<br/>or difficulty]

        Moderate --> CheckObstacles{Common<br/>Obstacle?}
        CheckObstacles -->|Yes| AgentAddress[Agent: Address specific obstacle<br/>e.g., 'No time' → earlier anchor]
        CheckObstacles -->|No| AgentTiming[Agent: Suggest timing change]

        LowSuccess --> AgentSimplify[Agent: Make habit smaller<br/>or change anchor entirely]

        AgentScaleUp --> GenerateAdjustment
        AgentAddress --> GenerateAdjustment
        AgentTiming --> GenerateAdjustment
        AgentSimplify --> GenerateAdjustment
    end

    subgraph "Step 3: Recommendation Generation"
        GenerateAdjustment[OpenAI: Generate ONE adjustment<br/>with specific rationale]
        GenerateAdjustment --> ValidateOutput[Zod Schema Validation]
        ValidateOutput --> FormatRecommendation[Format:<br/>- habit_name<br/>- adjustment_type<br/>- current vs suggested<br/>- rationale with user's data]
    end

    subgraph "Step 4: Storage & Delivery"
        FormatRecommendation --> StoreIteration[Insert weekly_iterations<br/>status: 'pending']
        StoreIteration --> SendPushNotif[Push Notification:<br/>'Your weekly insight is ready']
    end

    SendPushNotif --> UserOpens[User Opens App]
    UserOpens --> DisplayInsight[Show Insight Card with:<br/>- Week summary<br/>- ONE specific change<br/>- Why it's suggested]

    DisplayInsight --> UserDecision{User Action}

    UserDecision -->|Accept| ApplyChange[Update habit record<br/>+ mark iteration 'accepted']
    UserDecision -->|Decline| Decline[Mark iteration 'declined'<br/>+ optional feedback]
    UserDecision -->|Ignore| Remind[Reminder after 24h]

    ApplyChange --> NextWeek[Continue tracking<br/>with new parameters]
    Decline --> NextWeek
    Remind --> DisplayInsight

    NextWeek --> End([Next Sunday: Repeat])

    style Start fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style AgentScaleUp fill:#22c55e,stroke:#16a34a,color:#fff
    style AgentSimplify fill:#f59e0b,stroke:#d97706,color:#fff
    style ApplyChange fill:#3b82f6,stroke:#2563eb,color:#fff
    style End fill:#8b5cf6,stroke:#7c3aed,color:#fff
```

**Key Insights:**

- **Data-Driven Decisions**: AI analyzes actual check-in patterns, not generic rules
- **Branching Logic**: Different completion rates trigger different AI reasoning paths
- **One Change Rule**: Never overwhelms users with multiple simultaneous adjustments
- **Iterative Learning**: Each week's data informs the next week's suggestion
- **User Control**: Users can accept or decline, staying in the driver's seat

---

## 5. Database Schema & Relationships

This entity relationship diagram shows the complete database structure with all tables, relationships, and key constraints that power HabitDx.

```mermaid
erDiagram
    auth_users ||--|| user_profiles : "has"
    auth_users ||--o| habit_failure_profiles : "has"
    auth_users ||--o{ habit_stacks : "creates"
    habit_stacks ||--o{ habits : "contains"
    auth_users ||--o{ habits : "owns"
    auth_users ||--o{ habit_logs : "records"
    habits ||--o{ habit_logs : "tracked_in"
    auth_users ||--o{ weekly_iterations : "receives"

    auth_users {
        uuid id PK
        string email
        timestamp created_at
    }

    user_profiles {
        uuid id PK
        uuid user_id FK
        jsonb past_habits
        text[] failure_reasons
        time wake_time
        time sleep_time
        time work_start
        time work_end
        text[] life_constraints
        enum energy_pattern
        text identity_goal
        timestamp onboarding_completed_at
        timestamp created_at
        timestamp updated_at
    }

    habit_failure_profiles {
        uuid id PK
        uuid user_id FK "UNIQUE"
        jsonb failure_patterns
        text[] root_causes
        text[] personality_insights
        text[] recommendations
        jsonb token_usage
        timestamp created_at
        timestamp updated_at
    }

    habit_stacks {
        uuid id PK
        uuid user_id FK
        boolean is_active
        timestamp archived_at
        timestamp created_at
    }

    habits {
        uuid id PK
        uuid user_id FK
        uuid habit_stack_id FK
        text name
        text tiny_version
        text anchor
        text celebration
        text rationale
        time reminder_time
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    habit_logs {
        uuid id PK
        uuid user_id FK
        uuid habit_id FK
        date check_in_date
        boolean completed
        text obstacle
        text notes
        timestamp created_at
    }

    weekly_iterations {
        uuid id PK
        uuid user_id FK
        date week_start
        text summary
        text pattern_identified
        enum adjustment_type
        text adjustment_description
        text adjustment_rationale
        text specific_change
        enum status
        timestamp responded_at
        timestamp created_at
    }
```

**Key Schema Insights:**

### Core Tables:

- **user_profiles**: Onboarding intake data that feeds all AI analysis
- **habit_failure_profiles**: AI-generated diagnosis (the app's differentiator)
- **habit_stacks**: Groupings of habits, allowing users to regenerate or archive
- **habits**: Individual habit definitions with tiny versions and anchors
- **habit_logs**: Daily check-in records with obstacle capture
- **weekly_iterations**: AI-generated insights with acceptance tracking

### Important Relationships:

1. **One-to-One**: User → Failure Profile (each user gets one diagnosis)
2. **One-to-Many**: User → Habit Stacks (allows regeneration without losing history)
3. **One-to-Many**: Habit Stack → Habits (typically 1-3 habits per stack)
4. **One-to-Many**: Habit → Logs (one entry per day per habit)
5. **One-to-Many**: User → Weekly Iterations (one insight per week)

### Data Constraints:

- **UNIQUE(habit_id, check_in_date)**: Prevents duplicate check-ins
- **RLS Policies**: All tables have `auth.uid() = user_id` policies for security
- **Enums**: `energy_pattern`, `adjustment_type`, `status` ensure data integrity
- **NOT NULL on critical fields**: Forces complete onboarding data

### Performance Optimizations:

- **Indexes on user_id + date columns**: Fast queries for dashboard and weekly analysis
- **Filtered indexes on is_active**: Only active habits/stacks indexed
- **JSONB fields**: Flexible schema for evolving AI outputs without migrations

---

## System Design Principles

### 1. Mobile-First Architecture

- React Native with Expo enables rapid iteration and cross-platform deployment
- Zustand provides lightweight state management without Redux complexity
- Expo Router simplifies navigation with file-based routing

### 2. AI as a Service Layer

- Mastra AI server separates complex AI orchestration from the main backend
- Workflows provide deterministic multi-step pipelines with validation
- Agents with working memory enable future conversational coaching features
- Tools give AI controlled access to database queries and external APIs

### 3. Data-Driven Personalization

- Rich onboarding data (5 minutes) enables meaningful AI analysis
- Daily check-in obstacle capture provides continuous learning signal
- Weekly iteration creates compounding value through incremental improvements

### 4. Progressive Disclosure

- Users see immediate value (Failure Profile) before committing to daily tracking
- AI reasoning is transparent ("why this works for you")
- One change at a time prevents overwhelming users

### 5. Cost-Effective Scaling

- GPT-4o-mini ($0.15/1M tokens) keeps AI costs under $0.10/user/month
- Supabase free tier supports 50,000 monthly active users
- Edge Functions run only when needed (not always-on servers)
- Vercel free tier hosts Mastra server for MVP validation

---

## Technology Decisions Rationale

| Technology          | Why Chosen                                                | Alternatives Considered                                                     |
| ------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------- |
| React Native + Expo | Cross-platform, fast iteration, large ecosystem           | Flutter (smaller talent pool), Native (2x dev time)                         |
| Supabase            | All-in-one: auth + DB + functions + realtime              | Firebase (vendor lock-in), Pocketbase (too early), AWS Amplify (complexity) |
| PostgreSQL          | Rich querying, JSONB for flexible schema, RLS             | MongoDB (no RLS), MySQL (weaker JSON support)                               |
| Mastra AI           | Type-safe workflows, memory, tool orchestration           | LangChain (less type-safe), OpenAI Assistants (expensive)                   |
| GPT-4o-mini         | 10x cheaper than GPT-4, sufficient for structured outputs | Claude (no OpenAI credit), Llama (hosting complexity)                       |
| Zustand             | Lightweight, TypeScript-first, no boilerplate             | Redux (verbose), Jotai (less mature), Context (performance)                 |
| Expo Router         | File-based, less boilerplate than React Navigation        | React Navigation (more manual setup)                                        |

---

## Deployment Architecture

```mermaid
graph LR
    subgraph "User Devices"
        A1[iOS App]
        A2[Android App]
    end

    subgraph "Vercel Edge Network"
        B[Mastra AI Server]
    end

    subgraph "Supabase Cloud"
        C1[PostgreSQL]
        C2[Auth Service]
        C3[Edge Functions]
        C4[Realtime Service]
    end

    subgraph "External APIs"
        D1[OpenAI API]
        D2[Push Notification Service]
    end

    A1 --> B
    A2 --> B
    A1 --> C2
    A2 --> C2
    A1 --> C1
    A2 --> C1
    B --> C1
    B --> D1
    C3 --> B
    C4 --> A1
    C4 --> A2
    D2 --> A1
    D2 --> A2

    style A1 fill:#3b82f6,stroke:#2563eb,color:#fff
    style A2 fill:#3b82f6,stroke:#2563eb,color:#fff
    style B fill:#f59e0b,stroke:#d97706,color:#fff
    style C1 fill:#22c55e,stroke:#16a34a,color:#fff
    style C2 fill:#22c55e,stroke:#16a34a,color:#fff
    style C3 fill:#22c55e,stroke:#16a34a,color:#fff
    style C4 fill:#22c55e,stroke:#16a34a,color:#fff
```

**Deployment Strategy:**

- **Mobile Apps**: Distributed via App Store and Google Play
- **Mastra Server**: Deployed on Vercel with automatic CI/CD
- **Supabase**: Managed PostgreSQL with automatic backups
- **Edge Functions**: Serverless with automatic scaling
- **OpenAI**: Pay-per-use API with rate limiting

---

## Summary

HabitDx differentiates itself through:

1. **AI-Powered Diagnosis**: Unlike passive trackers, it analyzes _why_ habits fail
2. **Personalized Design**: Habits fit users' actual constraints (energy, schedule, environment)
3. **Weekly Iteration**: One specific adjustment based on real data, not generic advice
4. **Systems Thinking**: Treats failure as a design problem, not a willpower problem
5. **Scalable Architecture**: Built to handle thousands of users with minimal operational overhead

These diagrams showcase how the technical architecture supports the product vision of helping knowledge workers finally build consistent habits through intelligent, personalized iteration.
