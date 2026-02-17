# HabitDx System Diagrams - Presentation Version

**Purpose:** Visual diagrams for midterm presentation  
**Date:** February 16, 2026

---

## 1. High-Level System Architecture

```mermaid
graph TB
    subgraph "User Interface Layer"
        A[Mobile App<br/>React Native + Expo]
        A1[Onboarding Flow<br/>5 screens]
        A2[Home<br/>Daily Check-ins]
        A3[Insights<br/>Weekly Analysis]
        A4[Settings<br/>Profile Management]
    end

    subgraph "Backend Layer - Supabase"
        B[PostgreSQL Database]
        C[Authentication<br/>JWT + RLS]
        D[Edge Functions]
        D1[analyze-failure]
        D2[generate-habits]
        D3[weekly-iteration]
    end

    subgraph "AI Layer"
        E[OpenAI GPT-4o-mini]
        E1[Failure Pattern<br/>Analysis]
        E2[Habit Stack<br/>Generation]
        E3[Weekly<br/>Insights]
    end

    subgraph "State Management"
        F[Zustand Stores]
        F1[authStore]
        F2[onboardingStore]
        F3[habitStore]
    end

    A --> A1
    A --> A2
    A --> A3
    A --> A4
    A --> F
    F --> B
    B --> C
    B --> D
    D --> D1
    D --> D2
    D --> D3
    D1 --> E1
    D2 --> E2
    D3 --> E3
    E1 --> E
    E2 --> E
    E3 --> E

    style A fill:#4A90E2,color:#fff
    style B fill:#50C878,color:#fff
    style E fill:#FFB74D,color:#fff
    style F fill:#9C27B0,color:#fff
```

---

## 2. User Journey Flow (Core Value Proposition)

```mermaid
graph LR
    A[😞 Frustrated User<br/>Failed 3+ habit apps] --> B[📝 Smart Onboarding<br/>5-min intake]
    B --> C[🎯 Failure Profile<br/>AI diagnosis]
    C --> D[💡 Personalized Habits<br/>1-3 designed for YOU]
    D --> E[✅ Daily Check-ins<br/>10 seconds]
    E --> F[📊 Weekly Insights<br/>ONE adjustment]
    F --> G{Accept?}
    G -->|Yes| D
    G -->|No| E
    D --> H[😊 Success!<br/>Habits that stick]

    style A fill:#ffebee,stroke:#f44336
    style C fill:#e8f5e9,stroke:#4caf50
    style D fill:#fff4e6,stroke:#ff9800
    style F fill:#e1f5ff,stroke:#0066cc
    style H fill:#e8f5e9,stroke:#4caf50
```

---

## 3. System Stocks & Flows (Systems Thinking)

```mermaid
graph TB
    subgraph "STOCKS - What Accumulates"
        S1[🔋 User Motivation]
        S2[✅ Habit Consistency]
        S3[🧠 Self-Knowledge]
        S4[🤝 Trust in System]
        S5[😞 Shame/Frustration]
    end

    subgraph "INFLOWS - Increase Stocks"
        I1[Smart Intake]
        I2[Failure Profile]
        I3[Weekly Insights]
        I4[Successful Check-ins]
        I5[Habit Adjustments]
    end

    subgraph "OUTFLOWS - Decrease Stocks"
        O1[Generic Advice]
        O2[Broken Streaks]
        O3[Life Changes]
        O4[Ignored Context]
    end

    I1 --> S3
    I2 --> S4
    I2 --> S3
    I3 --> S3
    I4 --> S1
    I5 --> S2

    O1 --> S4
    O2 --> S1
    O3 --> S2
    O4 --> S4

    S3 --> S4
    S4 --> S1
    S1 --> S2
    S2 --> S3

    S2 -.Low.-> S5
    S5 -.-> S1

    style S1 fill:#e1f5ff,stroke:#0066cc
    style S2 fill:#e1f5ff,stroke:#0066cc
    style S3 fill:#e1f5ff,stroke:#0066cc
    style S4 fill:#e1f5ff,stroke:#0066cc
    style S5 fill:#ffebee,stroke:#f44336
    style I2 fill:#e8f5e9,stroke:#4caf50
    style I3 fill:#e8f5e9,stroke:#4caf50
```

---

## 4. Core Feedback Loops

```mermaid
graph TB
    subgraph "Insight Flywheel - Virtuous Cycle"
        A1[More Check-ins] --> A2[Better Data]
        A2 --> A3[Better AI Insights]
        A3 --> A4[Higher Trust]
        A4 --> A5[More Engagement]
        A5 --> A1
    end

    subgraph "Identity Shift - Virtuous Cycle"
        B1[Small Wins] --> B2[Growing Self-Knowledge]
        B2 --> B3[Identity Formation<br/>'I am someone who...']
        B3 --> B4[More Motivation]
        B4 --> B1
    end

    subgraph "Shame Spiral - What We're Fighting"
        C1[Low Consistency] --> C2[Shame & Frustration]
        C2 --> C3[App Avoidance]
        C3 --> C4[App Abandonment]
        C4 --> C5[Zero Consistency]
    end

    subgraph "Our Mitigations"
        M1[Weekly Adjustments]
        M2[No Streak Resets]
        M3[Blame Design Not Person]
    end

    M1 -.Prevents.-> C1
    M2 -.Prevents.-> C2
    M3 -.Prevents.-> C2

    style A3 fill:#e8f5e9,stroke:#4caf50
    style B2 fill:#e8f5e9,stroke:#4caf50
    style C2 fill:#ffebee,stroke:#f44336
    style C4 fill:#ffebee,stroke:#f44336
    style M1 fill:#e1f5ff,stroke:#0066cc
    style M2 fill:#e1f5ff,stroke:#0066cc
    style M3 fill:#e1f5ff,stroke:#0066cc
```

---

## 5. Database Schema (Simplified)

```mermaid
erDiagram
    USER_PROFILES ||--o{ HABIT_FAILURE_PROFILES : has
    USER_PROFILES ||--o{ HABIT_STACKS : has
    HABIT_STACKS ||--o{ HABITS : contains
    HABITS ||--o{ HABIT_LOGS : tracks
    USER_PROFILES ||--o{ WEEKLY_ITERATIONS : receives

    USER_PROFILES {
        uuid id PK
        text display_name
        jsonb past_habits
        text[] failure_reasons
        text energy_pattern
        text[] life_constraints
        text identity_goal
        timestamp onboarding_completed_at
    }

    HABIT_FAILURE_PROFILES {
        uuid id PK
        uuid user_id FK
        jsonb failure_patterns
        text[] root_causes
        text personality_insights
        text[] recommendations
    }

    HABIT_STACKS {
        uuid id PK
        uuid user_id FK
        int version
        bool is_active
    }

    HABITS {
        uuid id PK
        uuid stack_id FK
        text name
        text tiny_version
        text anchor
        text celebration
        text rationale
        bool is_active
    }

    HABIT_LOGS {
        uuid id PK
        uuid habit_id FK
        date logged_date
        bool completed
        text obstacle
    }

    WEEKLY_ITERATIONS {
        uuid id PK
        uuid user_id FK
        date week_start
        text insight
        text rationale
        jsonb suggested_change
        text status
    }
```

---

## 6. HabitDx vs Traditional Apps

```mermaid
graph LR
    subgraph "Traditional Apps ❌"
        T1[User] --> T2[Check Boxes]
        T2 --> T3[See Streak Counter]
        T3 --> T4[Break Streak]
        T4 --> T5[😞 Shame & Quit]
    end

    subgraph "HabitDx ✅"
        H1[User] --> H2[Smart Intake]
        H2 --> H3[🎯 Failure Diagnosis]
        H3 --> H4[💡 Designed Habits]
        H4 --> H5[✅ Check-ins<br/>with Context]
        H5 --> H6[📊 Pattern Analysis]
        H6 --> H7[🔄 Adjustment]
        H7 --> H4
        H4 --> H8[😊 Success]
    end

    style T5 fill:#ffebee,stroke:#f44336
    style H3 fill:#e8f5e9,stroke:#4caf50
    style H7 fill:#e8f5e9,stroke:#4caf50
    style H8 fill:#e8f5e9,stroke:#4caf50
```

---

## 7. AI Integration Flow

```mermaid
sequenceDiagram
    participant U as User
    participant A as Mobile App
    participant S as Supabase
    participant E as Edge Function
    participant AI as OpenAI GPT-4o-mini

    U->>A: Complete Onboarding
    A->>S: Save user_profiles data
    S-->>A: Success

    A->>E: Trigger analyze-failure
    E->>S: Fetch user data
    S-->>E: Return profile data

    E->>AI: Send structured prompt
    Note over AI: Analyze patterns<br/>Generate insights
    AI-->>E: Return JSON profile

    E->>S: Save failure_profile
    S-->>E: Success
    E-->>A: Return profile

    A->>U: Display Failure Profile
    U->>U: "Aha moment!"

    Note over U,AI: User feels understood<br/>Trust in system increases
```

---

## 8. Development Process Flow

```mermaid
graph LR
    A[📄 PRD<br/>Problem & Solution] --> B[📋 Project Docs<br/>Architecture]
    B --> C[🗺️ Task List<br/>Master Checklist]
    C --> D[📍 Phase Roadmaps<br/>Detailed Plans]
    D --> E[👨‍💻 Implementation<br/>Code + Tests]
    E --> F[📝 Documentation<br/>Update Docs]
    F --> G[🔄 Iteration<br/>Refine]
    G --> D

    E --> H[Git Commits<br/>Feature Branches]
    H --> I[Pull Requests<br/>Code Review]
    I --> J[Merge to Main<br/>Deploy]

    style A fill:#e8f5e9,stroke:#4caf50
    style E fill:#e1f5ff,stroke:#0066cc
    style F fill:#fff4e6,stroke:#ff9800
```

---

## 9. Key Leverage Points (Systems Thinking)

```mermaid
graph TB
    subgraph "Highest Leverage - Paradigm"
        P1[❌ OLD: Blame Willpower]
        P2[✅ NEW: Blame Design]
    end

    subgraph "High Leverage - Goals"
        G1[❌ OLD: Maximize Streaks]
        G2[✅ NEW: Maximize Self-Knowledge<br/>+ Habit-Life Fit]
    end

    subgraph "Medium Leverage - Feedback Loops"
        F1[✅ Insight Flywheel]
        F2[✅ Identity Shift]
        F3[🔄 Pre-Failure Detection]
    end

    subgraph "Medium Leverage - Delays"
        D1[⚠️ 7-day delay to insight]
        D2[✅ Show Profile immediately]
    end

    P1 -.Shift to.-> P2
    G1 -.Shift to.-> G2
    D1 -.Reduce via.-> D2

    style P2 fill:#e8f5e9,stroke:#4caf50
    style G2 fill:#e8f5e9,stroke:#4caf50
    style F1 fill:#e1f5ff,stroke:#0066cc
    style F2 fill:#e1f5ff,stroke:#0066cc
```

---

## 10. Presentation Flow Diagram

```mermaid
graph TB
    A[Introduction<br/>The Problem<br/>92% failure rate] --> B[Systems Analysis<br/>Why apps fail]
    B --> C[Our Solution<br/>HabitDx approach]
    C --> D[Technical Demo<br/>Architecture & Code]
    D --> E[Process<br/>Document-driven dev]
    E --> F[Learnings<br/>Pivots & iterations]
    F --> G[Next Steps<br/>Beta testing]

    style A fill:#ffebee,stroke:#f44336
    style C fill:#e8f5e9,stroke:#4caf50
    style E fill:#e1f5ff,stroke:#0066cc
```

---

## Instructions for Presentation

### Diagram 1: System Architecture

**Use for:** Technical overview  
**Key point:** "All-in-one stack: React Native + Supabase + OpenAI"  
**Time:** 2 minutes

### Diagram 2: User Journey

**Use for:** Product walkthrough  
**Key point:** "From frustration to success in 5 steps"  
**Time:** 3 minutes

### Diagram 3: System Stocks & Flows

**Use for:** Systems thinking demonstration  
**Key point:** "We designed for behavior change, not just tracking"  
**Time:** 3 minutes

### Diagram 4: Feedback Loops

**Use for:** Why HabitDx works  
**Key point:** "Two virtuous cycles + breaking the shame spiral"  
**Time:** 2 minutes

### Diagram 5: Database Schema

**Use for:** Technical depth  
**Key point:** "Schema designed for personalization"  
**Time:** 1 minute

### Diagram 6: HabitDx vs Traditional

**Use for:** Differentiation  
**Key point:** "Not just tracking, but diagnosis and iteration"  
**Time:** 2 minutes

### Diagram 7: AI Integration

**Use for:** AI augmentation demo  
**Key point:** "AI reads user data, generates personalized insights"  
**Time:** 2 minutes

### Diagram 8: Development Process

**Use for:** Process demonstration  
**Key point:** "Document-driven, phase-by-phase, iterative"  
**Time:** 2 minutes

---

## How to Use These Diagrams

### Option 1: Render in Presentation Tool

1. Copy Mermaid code
2. Use Mermaid Live Editor (https://mermaid.live)
3. Export as PNG/SVG
4. Import into PowerPoint/Keynote/Google Slides

### Option 2: Use in Documentation

- Keep in Markdown for README, PRD, Architecture docs
- Renders automatically in GitHub, GitLab, Notion

### Option 3: Interactive Demo

- Use Mermaid.js live rendering in browser
- Walk through each diagram interactively

---

## Presentation Talking Points

### For Casey (Technical Process):

- **Diagram 8 (Development Process):** "We followed PRD → Plan → Roadmap → Implementation"
- **Show git log:** "Phase-by-phase commits with meaningful messages"
- **Show logger.ts:** "Structured logging for AI-assisted debugging"
- **Run test scripts:** "3 CLI test suites covering auth and database"

### For Jason (Product & System Design):

- **Diagram 3 (Stocks & Flows):** "Applied Donella Meadows framework"
- **Diagram 4 (Feedback Loops):** "Identified leverage points"
- **Show PRD falsifiability section:** "Tried to prove ourselves wrong"
- **Show pivot_plan.md:** "6 scenarios with triggers and actions"
- **Show user_research.md:** "Validated problem before building"

### For Guest (Presentation Quality):

- **Diagram 2 (User Journey):** Clear, simple story
- **Diagram 6 (vs Traditional):** Strong differentiation
- **Visuals:** Clean, professional, color-coded
- **Structure:** Logical flow from problem → solution → process

---

**Created:** February 16, 2026  
**For:** Midterm Presentation  
**Export formats:** Mermaid → PNG/SVG for slides
