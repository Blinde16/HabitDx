# Mastra AI Integration Guide

## Overview

Mastra is an open-source TypeScript agent framework that can orchestrate HabitDx's AI features with structured workflows, persistent memory, and tool-equipped agents. Instead of raw OpenAI API calls in Edge Functions, Mastra provides:

- **Agents** - LLM-powered entities that reason, select tools, and iterate autonomously
- **Workflows** - Type-safe, graph-based orchestration with branching, parallelism, and looping
- **Memory** - Persistent user context across sessions (working memory, semantic recall, message history)
- **Tools** - Zod-validated functions agents can call (database queries, external APIs)
- **Observability** - Built-in tracing and structured logs for debugging AI behavior

## Where Mastra Benefits HabitDx

### Why Adopt Mastra

| Current Approach (Edge Functions)               | With Mastra                                                    |
| ----------------------------------------------- | -------------------------------------------------------------- |
| Single-shot OpenAI calls with static prompts    | Multi-step workflows with branching logic                      |
| No memory between sessions                      | Working memory remembers user preferences and coaching history |
| Manual Zod validation of AI responses           | Built-in schema validation at every workflow step              |
| Separate error handling per function            | Unified fallback and retry patterns                            |
| No observability into AI reasoning              | Tracing dashboard shows every step and decision                |
| Adding new AI features means new Edge Functions | Register new agents/workflows on a central Mastra instance     |

### High-Value Integration Points

1. **Failure Profile Analysis** - Multi-step workflow: fetch user data -> analyze patterns -> cross-reference with similar profiles -> generate diagnosis -> validate output
2. **Weekly Iteration Engine** - Branching workflow: if streak > 7, suggest scaling up; if streak broken, suggest simplification; if new obstacle detected, redesign anchor
3. **Conversational Habit Coach** (future) - Agent with working memory that remembers user context, coaching style preferences, and past interactions across sessions
4. **Habit Stack Generation** - Agent with database tools that dynamically queries existing habits, energy patterns, and constraints before generating recommendations

### When to Adopt

- **Phase 5 (AI Failure Profile)**: Introduce Mastra workflows to replace the `analyze-failure` Edge Function
- **Phase 9 (Weekly Iteration AI)**: Leverage branching workflows for smarter iteration logic
- **Post-MVP**: Add a conversational coaching agent with persistent memory

## Setup

### Prerequisites

- Node.js 18+ (Mastra requires modern ES modules)
- OpenAI API key
- Supabase project with database configured
- A deployment target for the Mastra server (Vercel, Cloudflare Workers, or standalone Node.js)

### Installation

```bash
# Core framework
npm install @mastra/core@latest zod@^4

# CLI and dev tools
npm install -D mastra@latest typescript @types/node

# PostgreSQL adapter (connects to Supabase's PostgreSQL)
npm install @mastra/pg

# Client SDK (for calling Mastra from React Native)
npm install @mastra/client-js
```

### Project Structure

```
habitdx/
├── src/                          # React Native app (existing)
├── mastra/                       # Mastra server (new)
│   ├── index.ts                  # Mastra instance registration
│   ├── agents/
│   │   ├── habit-analyst.ts      # Failure profile agent
│   │   ├── habit-designer.ts     # Habit stack generation agent
│   │   ├── iteration-coach.ts    # Weekly iteration agent
│   │   └── habit-coach.ts        # Conversational coach (post-MVP)
│   ├── workflows/
│   │   ├── analyze-failure.ts    # Failure analysis workflow
│   │   ├── generate-habits.ts    # Habit generation workflow
│   │   └── weekly-iteration.ts   # Weekly iteration workflow
│   ├── tools/
│   │   ├── supabase-tools.ts     # Database query tools
│   │   └── habit-tools.ts        # Habit-specific tools
│   └── memory/
│       └── config.ts             # Memory configuration
├── package.json
└── tsconfig.json
```

### TypeScript Configuration

```json
// tsconfig.json (add or merge with existing)
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true,
    "outDir": "dist"
  }
}
```

**Important**: Mastra requires `"moduleResolution": "bundler"` or `"nodenext"`. Using `"node"` will cause import resolution errors.

### Environment Variables

```bash
# .env (Mastra server)
OPENAI_API_KEY=sk-proj-...

# Supabase connection (for Mastra tools and memory storage)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
SUPABASE_DB_CONNECTION_STRING=postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres

# Mastra server
MASTRA_PORT=4111
```

### Package Scripts

```json
{
  "scripts": {
    "mastra:dev": "mastra dev",
    "mastra:build": "mastra build"
  }
}
```

## Architecture

### How Mastra Fits with Supabase

Supabase Edge Functions run on Deno, while Mastra is built for Node.js/Bun. Deploy Mastra as a standalone server alongside Supabase rather than inside Edge Functions.

```
React Native (Expo) + Zustand
    |
    |-- Supabase Client (auth, database, realtime)
    |
    |-- @mastra/client-js
    |       |
    |       --> Mastra Server (Vercel / Node.js)
    |               |-- Agents (habit analyst, coach, designer)
    |               |-- Workflows (failure analysis, weekly iteration)
    |               |-- Memory (working memory via PostgreSQL)
    |               |-- Tools (Supabase queries, OpenAI calls)
```

### Request Flow

```
1. User completes onboarding in React Native
2. App calls Mastra server via @mastra/client-js
3. Mastra workflow executes:
   a. Tool: query user profile from Supabase
   b. Tool: query past habits and check-in data
   c. Agent: analyze failure patterns with GPT-4o-mini
   d. Validation: Zod schema validates output
   e. Tool: store results back in Supabase
4. Response streamed back to React Native app
```

## Core Implementation

### Mastra Instance

```typescript
// mastra/index.ts
import { Mastra } from '@mastra/core';
import { habitAnalyst } from './agents/habit-analyst';
import { habitDesigner } from './agents/habit-designer';
import { iterationCoach } from './agents/iteration-coach';
import { analyzeFailureWorkflow } from './workflows/analyze-failure';
import { weeklyIterationWorkflow } from './workflows/weekly-iteration';

export const mastra = new Mastra({
  agents: {
    habitAnalyst,
    habitDesigner,
    iterationCoach,
  },
  workflows: {
    analyzeFailureWorkflow,
    weeklyIterationWorkflow,
  },
});
```

### Supabase Tools

```typescript
// mastra/tools/supabase-tools.ts
import { createTool } from '@mastra/core/tools';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export const getUserProfile = createTool({
  id: 'get-user-profile',
  description: 'Fetches a user profile including onboarding data, constraints, and energy patterns',
  inputSchema: z.object({
    userId: z.string().uuid(),
  }),
  outputSchema: z.object({
    pastHabits: z.array(z.string()),
    constraints: z.array(z.string()),
    energyPattern: z.string(),
    identityGoal: z.string(),
    wakeUpTime: z.string(),
    bedTime: z.string(),
  }),
  execute: async ({ inputData }) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('past_habits, constraints, energy_pattern, identity_goal, wake_up_time, bed_time')
      .eq('user_id', inputData.userId)
      .single();

    if (error) throw new Error(`Failed to fetch profile: ${error.message}`);

    return {
      pastHabits: data.past_habits,
      constraints: data.constraints,
      energyPattern: data.energy_pattern,
      identityGoal: data.identity_goal,
      wakeUpTime: data.wake_up_time,
      bedTime: data.bed_time,
    };
  },
});

export const getHabitLogs = createTool({
  id: 'get-habit-logs',
  description: 'Fetches recent habit check-in data for weekly iteration analysis',
  inputSchema: z.object({
    userId: z.string().uuid(),
    days: z.number().default(7),
  }),
  outputSchema: z.object({
    logs: z.array(
      z.object({
        habitName: z.string(),
        completedAt: z.string().nullable(),
        obstacle: z.string().nullable(),
        date: z.string(),
      })
    ),
  }),
  execute: async ({ inputData }) => {
    const since = new Date();
    since.setDate(since.getDate() - inputData.days);

    const { data, error } = await supabase
      .from('habit_logs')
      .select(
        `
        completed_at,
        obstacle,
        date,
        habits(name)
      `
      )
      .eq('user_id', inputData.userId)
      .gte('date', since.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) throw new Error(`Failed to fetch logs: ${error.message}`);

    return {
      logs: (data || []).map((log: any) => ({
        habitName: log.habits?.name ?? 'Unknown',
        completedAt: log.completed_at,
        obstacle: log.obstacle,
        date: log.date,
      })),
    };
  },
});

export const storeFailureProfile = createTool({
  id: 'store-failure-profile',
  description: 'Stores the AI-generated failure profile in Supabase',
  inputSchema: z.object({
    userId: z.string().uuid(),
    failurePatterns: z.array(
      z.object({
        name: z.string(),
        description: z.string(),
      })
    ),
    rootCauses: z.array(z.string()),
    personalityInsights: z.array(z.string()),
    recommendations: z.array(z.string()),
  }),
  outputSchema: z.object({ id: z.string() }),
  execute: async ({ inputData }) => {
    const { data, error } = await supabase
      .from('habit_failure_profiles')
      .upsert(
        {
          user_id: inputData.userId,
          failure_patterns: inputData.failurePatterns,
          root_causes: inputData.rootCauses,
          personality_insights: inputData.personalityInsights,
          recommendations: inputData.recommendations,
          generated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select('id')
      .single();

    if (error) throw new Error(`Failed to store profile: ${error.message}`);

    return { id: data.id };
  },
});
```

## Agent: Habit Failure Analyst

### Purpose

Replaces the `analyze-failure` Edge Function with a tool-equipped agent that can dynamically query user data and reason through failure patterns.

### Implementation

```typescript
// mastra/agents/habit-analyst.ts
import { Agent } from '@mastra/core/agent';
import { getUserProfile, storeFailureProfile } from '../tools/supabase-tools';

export const habitAnalyst = new Agent({
  id: 'habit-analyst',
  name: 'Habit Failure Analyst',
  instructions: [
    'You are an expert habit coach specializing in diagnosing why habits fail.',
    "Use the get-user-profile tool to fetch the user's onboarding data.",
    'Analyze their past habits, constraints, energy patterns, and identity goals.',
    'Identify 2-3 specific failure patterns based on systems-level issues (timing, energy, environment).',
    'Focus on design problems, not willpower or motivation.',
    'After analysis, use the store-failure-profile tool to save results.',
    '',
    'Your output should include:',
    '- failure_patterns: Array of {name, description} identifying specific patterns',
    '- root_causes: Array of strings explaining underlying system issues',
    "- personality_insights: Array of strings about the user's relationship with habits",
    '- recommendations: Array of strings with actionable design-based suggestions',
  ],
  model: 'openai/gpt-4o-mini',
  tools: { getUserProfile, storeFailureProfile },
});
```

### Usage

```typescript
// Call from Mastra server
const response = await habitAnalyst.generate([
  {
    role: 'user',
    content: `Analyze failure patterns for user ${userId}. Fetch their profile, identify why their past habits failed, and store the results.`,
  },
]);
```

## Agent: Weekly Iteration Coach

### Purpose

Analyzes the past 7 days of check-in data and suggests one specific adjustment. Uses branching logic to tailor advice based on performance.

### Implementation

```typescript
// mastra/agents/iteration-coach.ts
import { Agent } from '@mastra/core/agent';
import { getUserProfile, getHabitLogs } from '../tools/supabase-tools';

export const iterationCoach = new Agent({
  id: 'iteration-coach',
  name: 'Weekly Iteration Coach',
  instructions: [
    'You are a habit iteration specialist who reviews weekly data and suggests ONE adjustment.',
    'Use get-habit-logs to fetch the past 7 days of check-in data.',
    'Use get-user-profile to understand user constraints and energy patterns.',
    '',
    'Analysis rules:',
    '- If a habit was completed 6-7 days: suggest scaling up slightly (longer duration or harder version)',
    '- If completed 3-5 days: identify the common obstacle and suggest a timing or anchor change',
    '- If completed 0-2 days: suggest making the habit smaller or changing the anchor entirely',
    '- If a new obstacle appeared multiple times: address it directly',
    '',
    'Always suggest exactly ONE change. Multiple changes overwhelm users.',
    'Frame changes as experiments, not failures.',
    '',
    'Output format:',
    '- habit_name: Which habit to adjust',
    '- adjustment_type: "scale_up" | "timing" | "anchor" | "size" | "celebration" | "reminder"',
    '- current: What the habit looks like now',
    '- suggested: What it should change to',
    '- rationale: Why this specific change (reference their data)',
  ],
  model: 'openai/gpt-4o-mini',
  tools: { getUserProfile, getHabitLogs },
});
```

## Workflow: Failure Analysis Pipeline

### Purpose

A multi-step workflow that orchestrates the full failure analysis process with validation and fallbacks. More robust than a single agent call.

### Implementation

```typescript
// mastra/workflows/analyze-failure.ts
import { createWorkflow, createStep } from '@mastra/core/workflows';
import { z } from 'zod';

const fetchUserDataStep = createStep({
  id: 'fetch-user-data',
  inputSchema: z.object({
    userId: z.string().uuid(),
  }),
  outputSchema: z.object({
    userId: z.string(),
    pastHabits: z.array(z.string()),
    constraints: z.array(z.string()),
    energyPattern: z.string(),
    identityGoal: z.string(),
  }),
  execute: async ({ inputData, mapistra }) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from('user_profiles')
      .select('past_habits, constraints, energy_pattern, identity_goal')
      .eq('user_id', inputData.userId)
      .single();

    if (error) throw new Error(`Profile not found: ${error.message}`);

    return {
      userId: inputData.userId,
      pastHabits: data.past_habits,
      constraints: data.constraints,
      energyPattern: data.energy_pattern,
      identityGoal: data.identity_goal,
    };
  },
});

const analyzeWithAIStep = createStep({
  id: 'analyze-with-ai',
  inputSchema: z.object({
    userId: z.string(),
    pastHabits: z.array(z.string()),
    constraints: z.array(z.string()),
    energyPattern: z.string(),
    identityGoal: z.string(),
  }),
  outputSchema: z.object({
    failurePatterns: z.array(
      z.object({
        name: z.string(),
        description: z.string(),
      })
    ),
    rootCauses: z.array(z.string()),
    personalityInsights: z.array(z.string()),
    recommendations: z.array(z.string()),
  }),
  execute: async ({ inputData, mastra }) => {
    const agent = mastra?.getAgent('habit-analyst');
    if (!agent) throw new Error('Habit analyst agent not found');

    const response = await agent.generate([
      {
        role: 'user',
        content: `Analyze this user's habit failure patterns:
          - Past habits tried: ${inputData.pastHabits.join(', ')}
          - Current constraints: ${inputData.constraints.join(', ')}
          - Energy pattern: ${inputData.energyPattern}
          - Identity goal: ${inputData.identityGoal}

          Return a JSON object with: failure_patterns, root_causes, personality_insights, recommendations.`,
      },
    ]);

    const parsed = JSON.parse(response.text);
    return {
      failurePatterns: parsed.failure_patterns,
      rootCauses: parsed.root_causes,
      personalityInsights: parsed.personality_insights,
      recommendations: parsed.recommendations,
    };
  },
});

const storeResultsStep = createStep({
  id: 'store-results',
  inputSchema: z.object({
    failurePatterns: z.array(
      z.object({
        name: z.string(),
        description: z.string(),
      })
    ),
    rootCauses: z.array(z.string()),
    personalityInsights: z.array(z.string()),
    recommendations: z.array(z.string()),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    profileId: z.string(),
  }),
  execute: async ({ inputData }) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from('habit_failure_profiles')
      .upsert(
        {
          failure_patterns: inputData.failurePatterns,
          root_causes: inputData.rootCauses,
          personality_insights: inputData.personalityInsights,
          recommendations: inputData.recommendations,
          generated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select('id')
      .single();

    if (error) throw new Error(`Failed to store: ${error.message}`);

    return { success: true, profileId: data.id };
  },
});

export const analyzeFailureWorkflow = createWorkflow({
  id: 'analyze-failure',
  inputSchema: z.object({ userId: z.string().uuid() }),
  outputSchema: z.object({ success: z.boolean(), profileId: z.string() }),
})
  .then(fetchUserDataStep)
  .then(analyzeWithAIStep)
  .then(storeResultsStep)
  .commit();
```

### Executing the Workflow

```typescript
const run = analyzeFailureWorkflow.createRun();
const result = await run.start({
  inputData: { userId: 'user-uuid-here' },
});

if (result.status === 'success') {
  console.log('Profile stored:', result.result.profileId);
}
```

## Memory: Persistent User Context

### Purpose

Working memory allows agents to remember user preferences, coaching style, and past interactions across sessions without re-querying everything.

### Configuration

```typescript
// mastra/memory/config.ts
import { Memory } from '@mastra/memory';
import { PgVector } from '@mastra/pg';

// Use Supabase's PostgreSQL for memory storage
const vectorStore = new PgVector({
  id: 'supabase-memory',
  connectionString: process.env.SUPABASE_DB_CONNECTION_STRING!,
});

export const coachMemory = new Memory({
  options: {
    // Recent messages for conversational context
    lastMessages: 20,

    // Working memory: persistent user profile the agent maintains
    workingMemory: {
      enabled: true,
      scope: 'resource', // Persists across all threads for the same user
      template: `
# User Coaching Profile
- Name:
- Primary Goal:
- Energy Pattern:
- Biggest Obstacle:
- Preferred Coaching Style:
- Current Habit Stack:
- Recent Wins:
- Areas of Struggle:
- Session Count:
      `,
    },

    // Semantic recall: find relevant past conversations
    semanticRecall: {
      enabled: true,
      topK: 3,
    },
  },
  storage: vectorStore,
});
```

### Agent with Memory (Post-MVP Coaching Feature)

```typescript
// mastra/agents/habit-coach.ts
import { Agent } from '@mastra/core/agent';
import { coachMemory } from '../memory/config';
import { getUserProfile, getHabitLogs } from '../tools/supabase-tools';

export const habitCoach = new Agent({
  id: 'habit-coach',
  name: 'HabitDx Coach',
  instructions: [
    'You are a supportive, knowledgeable habit coach for the HabitDx app.',
    'You remember the user across sessions via your working memory.',
    'Update the working memory profile as you learn more about the user.',
    '',
    'Coaching style:',
    '- Treat habit failure as a design problem, not a willpower problem',
    '- Be encouraging but data-driven',
    '- Reference specific check-in data when giving advice',
    '- Suggest small experiments rather than big overhauls',
    '- Always frame changes positively',
  ],
  model: 'openai/gpt-4o-mini',
  tools: { getUserProfile, getHabitLogs },
  memory: coachMemory,
});
```

### Using the Coaching Agent from React Native

```typescript
// In React Native app, using @mastra/client-js
import { MastraClient } from '@mastra/client-js';

const mastra = new MastraClient({
  baseUrl: process.env.EXPO_PUBLIC_MASTRA_URL!,
});

export async function chatWithCoach(userId: string, message: string) {
  const agent = mastra.getAgent('habit-coach');

  const response = await agent.generate({
    messages: [{ role: 'user', content: message }],
    threadId: `coaching_${userId}`, // Groups conversations
    resourceId: userId, // Links working memory to user
  });

  return response.text;
}

// Streaming version for real-time UI
export async function streamCoachResponse(
  userId: string,
  message: string,
  onChunk: (text: string) => void
) {
  const agent = mastra.getAgent('habit-coach');

  const stream = await agent.stream({
    messages: [{ role: 'user', content: message }],
    threadId: `coaching_${userId}`,
    resourceId: userId,
  });

  for await (const chunk of stream.textStream) {
    onChunk(chunk);
  }
}
```

## Deployment

### Option A: Vercel (Recommended)

```bash
npm install @mastra/deployer-vercel
```

```typescript
// mastra/index.ts (add deployer)
import { VercelDeployer } from '@mastra/deployer-vercel';

export const mastra = new Mastra({
  agents: { habitAnalyst, iterationCoach, habitCoach },
  workflows: { analyzeFailureWorkflow, weeklyIterationWorkflow },
  deployer: new VercelDeployer(),
});
```

```bash
# Deploy
mastra build
vercel deploy
```

### Option B: Standalone Node.js

```bash
# Development
mastra dev

# Production
mastra build
node dist/index.js
```

### Environment Variables (Deployment)

Set these in your deployment platform (Vercel dashboard, etc.):

```bash
OPENAI_API_KEY=sk-proj-...
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
SUPABASE_DB_CONNECTION_STRING=postgresql://...
```

## Migrating from Edge Functions

### Incremental Adoption Strategy

You don't need to migrate everything at once. Adopt Mastra incrementally:

**Step 1: Deploy Mastra server alongside Supabase**

- Keep existing Edge Functions running
- Add Mastra server for new AI features

**Step 2: Migrate `analyze-failure` to a Mastra workflow**

- Replace the Edge Function with `analyzeFailureWorkflow`
- Update the React Native app to call Mastra instead

**Step 3: Migrate remaining AI functions**

- Move `generate-habits` and `weekly-iteration` to Mastra
- Retire the Edge Functions

**Step 4: Add memory and coaching (post-MVP)**

- Enable working memory for user context persistence
- Add the conversational habit coach agent

### Before (Edge Function)

```typescript
// supabase/functions/analyze-failure/index.ts
serve(async (req) => {
  const { userId } = await req.json();
  const profile = await supabase.from('user_profiles').select('*').eq('user_id', userId).single();
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: JSON.stringify(profile.data) },
    ],
  });
  const result = JSON.parse(completion.choices[0].message.content);
  await supabase.from('habit_failure_profiles').upsert(result);
  return new Response(JSON.stringify(result));
});
```

### After (Mastra Workflow)

```typescript
// React Native app
const mastra = new MastraClient({ baseUrl: MASTRA_URL });
const workflow = mastra.getWorkflow('analyze-failure');
const run = workflow.createRun();
const result = await run.start({ inputData: { userId } });
```

The workflow handles data fetching, AI analysis, validation, storage, and error handling through composable, testable steps.

## Cost Impact

| Component               | Without Mastra | With Mastra                                     |
| ----------------------- | -------------- | ----------------------------------------------- |
| OpenAI API              | ~$5/month      | ~$5/month (same model, same calls)              |
| Supabase                | $0 (free tier) | $0 (free tier)                                  |
| Mastra hosting          | N/A            | $0 (Vercel free tier) or $20/month (Vercel Pro) |
| Mastra Cloud (optional) | N/A            | Free beta, ~$29/month post-beta                 |
| **Total added cost**    |                | **$0-$20/month**                                |

Mastra itself is open source and free. The only added cost is hosting the Mastra server, which fits within Vercel's free tier at MVP scale.

## Testing

### Local Development

```bash
# Start Mastra dev server with hot reload
mastra dev

# Server runs at http://localhost:4111
# Playground UI available at http://localhost:4111/playground
```

The Mastra playground provides an interactive UI to test agents, send messages, inspect tool calls, and view memory state.

### Testing Agents

```typescript
// test/agents/habit-analyst.test.ts
import { habitAnalyst } from '../../mastra/agents/habit-analyst';

describe('Habit Analyst Agent', () => {
  it('should analyze failure patterns', async () => {
    const response = await habitAnalyst.generate([
      {
        role: 'user',
        content: 'Analyze failure patterns for user test-user-id',
      },
    ]);

    expect(response.text).toBeDefined();
    const parsed = JSON.parse(response.text);
    expect(parsed.failure_patterns).toHaveLength(expect.any(Number));
    expect(parsed.root_causes).toBeDefined();
  });
});
```

### Testing Workflows

```typescript
// test/workflows/analyze-failure.test.ts
import { analyzeFailureWorkflow } from '../../mastra/workflows/analyze-failure';

describe('Failure Analysis Workflow', () => {
  it('should complete all steps', async () => {
    const run = analyzeFailureWorkflow.createRun();
    const result = await run.start({
      inputData: { userId: 'test-uuid' },
    });

    expect(result.status).toBe('success');
    expect(result.result.profileId).toBeDefined();
  });
});
```

## Best Practices

1. **Start with workflows, add agents later** - Workflows give you deterministic control. Use agents when you need autonomous reasoning (like the coaching feature).

2. **Use Zod schemas everywhere** - Every tool, step, and agent response should be schema-validated. This catches malformed AI output before it hits your database.

3. **Keep tools focused** - Each tool should do one thing. Prefer `get-user-profile` and `get-habit-logs` as separate tools over a monolithic `get-all-data` tool.

4. **Scope memory appropriately** - Use `resource` scope for data that should persist across all conversations (user preferences). Use `thread` scope for conversation-specific context.

5. **Monitor token usage** - Use Mastra's observability tracing to track OpenAI costs per agent and workflow. Set up alerts if costs exceed thresholds.

6. **Fallback to static responses** - If the Mastra server is unavailable, the React Native app should fall back to calling Supabase Edge Functions directly or returning cached results.

## Troubleshooting

### Module Resolution Errors

**Symptom**: `Cannot find module '@mastra/core'` or similar import errors.

**Solution**: Ensure `tsconfig.json` uses `"moduleResolution": "bundler"` and `"module": "ES2022"`.

### Memory Not Persisting

**Symptom**: Agent forgets user context between sessions.

**Solutions**:

1. Verify `SUPABASE_DB_CONNECTION_STRING` is set correctly
2. Ensure `resourceId` is passed consistently (use the Supabase user UUID)
3. Check that `scope: 'resource'` is set in working memory config

### Workflow Step Failures

**Symptom**: Workflow stops mid-execution.

**Solutions**:

1. Check Mastra dev server logs for step-level errors
2. Verify Zod schemas match the actual data shapes
3. Test each step individually before composing

### Supabase Connection from Mastra

**Symptom**: Tools fail with database errors.

**Solutions**:

1. Use the service role key (not the anon key) in Mastra tools
2. Verify the connection string uses the correct port (5432 for direct, 6543 for pooled)
3. Check that RLS policies allow service role access

## Next Steps

1. Install Mastra packages alongside existing project
2. Create the `mastra/` directory structure
3. Implement Supabase tools
4. Build the failure analysis workflow
5. Deploy to Vercel and test via playground
6. Update React Native app to call Mastra endpoints
7. Add memory and coaching agent post-MVP

## References

- [Mastra Documentation](https://mastra.ai/docs)
- [Mastra Agents Guide](https://mastra.ai/docs/agents/overview)
- [Mastra Workflows Guide](https://mastra.ai/docs/workflows/overview)
- [Mastra Memory Guide](https://mastra.ai/docs/memory/overview)
- [Mastra Tools Guide](https://mastra.ai/docs/tools/overview)
- [Mastra GitHub Repository](https://github.com/mastra-ai/mastra)
- [Mastra Client SDK](https://www.npmjs.com/package/@mastra/client-js)
- [Mastra Vercel Deployment](https://mastra.ai/guides/deployment/vercel)
- [Mastra Playground](https://mastra.ai/docs/local-dev/mastra-dev)
