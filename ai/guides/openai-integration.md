# OpenAI API Integration Guide

## Overview

HabitDx uses GPT-4o-mini via the OpenAI API to power three critical AI functions:
1. **Failure Profile Analysis** - Diagnose why habits fail
2. **Habit Stack Generation** - Create personalized habits
3. **Weekly Iteration Analysis** - Suggest one weekly adjustment

## Setup

### Prerequisites
- OpenAI API key with GPT-4o-mini access
- Supabase Edge Functions environment configured

### Environment Variables

```bash
# Supabase Edge Functions only (not client-side)
OPENAI_API_KEY=sk-proj-...
```

### Installation

```bash
# In your Supabase Edge Functions
npm install openai
```

### Client Configuration

```typescript
// supabase/functions/_shared/openai.ts
import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY')!,
});

// Cost tracking helper
export function calculateCost(usage: { prompt_tokens: number; completion_tokens: number }) {
  // GPT-4o-mini pricing (as of 2024)
  const COST_PER_1K_INPUT = 0.00015;  // $0.15 per 1M tokens
  const COST_PER_1K_OUTPUT = 0.0006;  // $0.60 per 1M tokens
  
  return (
    (usage.prompt_tokens / 1000) * COST_PER_1K_INPUT +
    (usage.completion_tokens / 1000) * COST_PER_1K_OUTPUT
  );
}
```

## Function 1: Failure Profile Analysis

### Purpose
Analyze user's onboarding data to identify habit failure patterns, root causes, and personality insights.

### Edge Function: `analyze-failure`

```typescript
// supabase/functions/analyze-failure/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from '@supabase/supabase-js';
import { openai } from '../_shared/openai.ts';
import { z } from 'zod';

const FailureProfileSchema = z.object({
  failure_patterns: z.array(z.object({
    name: z.string(),
    description: z.string(),
  })),
  root_causes: z.array(z.string()),
  personality_insights: z.array(z.string()),
  recommendations: z.array(z.string()),
});

serve(async (req) => {
  try {
    const { userId } = await req.json();
    
    // Fetch user profile from database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    
    // Build prompt
    const systemPrompt = `You are an expert habit coach analyzing why someone's past habits failed.
Your goal is to identify 2-3 specific failure patterns that explain their struggles, not generic advice.
Focus on systems-level issues (timing, energy, environment), not willpower or motivation.

Respond in JSON format matching this schema:
{
  "failure_patterns": [{"name": "Pattern Name", "description": "2-sentence explanation"}],
  "root_causes": ["cause1", "cause2"],
  "personality_insights": ["insight1", "insight2"],
  "recommendations": ["rec1", "rec2"]
}`;

    const userPrompt = `User's Past Habits: ${JSON.stringify(profile.past_habits)}
Failure Reasons: ${JSON.stringify(profile.failure_reasons)}
Schedule: Wake ${profile.wake_time}, Sleep ${profile.sleep_time}, Work ${profile.work_start}-${profile.work_end}
Life Constraints: ${JSON.stringify(profile.life_constraints)}
Energy Pattern: ${profile.energy_pattern}
Identity Goal: ${profile.identity_goal}

Analyze their failure patterns and provide insights.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 1000,
    });

    const result = JSON.parse(completion.choices[0].message.content!);
    const validated = FailureProfileSchema.parse(result);
    
    // Store in database
    const { data: failureProfile, error: insertError } = await supabase
      .from('habit_failure_profiles')
      .insert({
        user_id: userId,
        failure_patterns: validated.failure_patterns,
        root_causes: validated.root_causes,
        personality_insights: validated.personality_insights,
        recommendations: validated.recommendations,
        token_usage: completion.usage,
      })
      .select()
      .single();
    
    if (insertError) throw insertError;
    
    return new Response(JSON.stringify(failureProfile), {
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Failure analysis error:', error);
    
    // Fallback response for API failures
    const fallback = {
      failure_patterns: [
        {
          name: "Mismatched Timing",
          description: "Your habits weren't aligned with your natural energy and schedule patterns."
        }
      ],
      root_causes: ["Timing conflicts", "Overambitious starts"],
      personality_insights: ["You care about growth but struggle with consistency"],
      recommendations: ["Start tiny", "Anchor to existing routines"]
    };
    
    return new Response(JSON.stringify({ error: error.message, fallback }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
```

### Key Design Decisions

1. **JSON Mode**: Use `response_format: { type: 'json_object' }` for structured output
2. **Validation**: Use Zod to validate AI responses before storing
3. **Fallback**: Always have a generic but useful fallback for API failures
4. **Token Tracking**: Log usage for cost monitoring

## Function 2: Habit Stack Generation

### Purpose
Generate 1-3 personalized habits based on failure profile, constraints, and identity goal.

### Edge Function: `generate-habits`

```typescript
// supabase/functions/generate-habits/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from '@supabase/supabase-js';
import { openai } from '../_shared/openai.ts';
import { z } from 'zod';

const HabitStackSchema = z.object({
  habits: z.array(z.object({
    name: z.string(),
    tiny_version: z.string(),
    anchor: z.string(),
    celebration: z.string(),
    rationale: z.string(),
    reminder_time: z.string().optional(),
  })),
});

serve(async (req) => {
  try {
    const { userId } = await req.json();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    // Fetch profile and failure analysis
    const [profileRes, failureRes] = await Promise.all([
      supabase.from('user_profiles').select('*').eq('user_id', userId).single(),
      supabase.from('habit_failure_profiles').select('*').eq('user_id', userId).single(),
    ]);
    
    if (profileRes.error || failureRes.error) throw new Error('User data not found');
    
    const profile = profileRes.data;
    const failureProfile = failureRes.data;
    
    const systemPrompt = `You are an expert habit designer creating a personalized habit stack.
Design 1-3 habits that:
1. Start TINY (2 minutes or less)
2. Anchor to existing routines
3. Include a celebration step
4. Address their specific failure patterns
5. Align with their identity goal

Use the Tiny Habits method: make it so small they can't say no.

Respond in JSON format:
{
  "habits": [
    {
      "name": "Habit Name",
      "tiny_version": "2-minute or less action",
      "anchor": "After I [existing routine]",
      "celebration": "Immediately after, I will [celebration]",
      "rationale": "Why this works for YOUR failure patterns",
      "reminder_time": "HH:MM format (optional)"
    }
  ]
}`;

    const userPrompt = `Identity Goal: ${profile.identity_goal}
Failure Patterns: ${JSON.stringify(failureProfile.failure_patterns)}
Schedule Constraints: Wake ${profile.wake_time}, Sleep ${profile.sleep_time}
Energy Pattern: ${profile.energy_pattern}
Life Constraints: ${JSON.stringify(profile.life_constraints)}

Design 1-3 tiny habits that work around these constraints and failure patterns.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8,
      max_tokens: 1200,
    });

    const result = JSON.parse(completion.choices[0].message.content!);
    const validated = HabitStackSchema.parse(result);
    
    // Create habit stack
    const { data: habitStack, error: stackError } = await supabase
      .from('habit_stacks')
      .insert({
        user_id: userId,
        is_active: true,
      })
      .select()
      .single();
    
    if (stackError) throw stackError;
    
    // Insert individual habits
    const habitsToInsert = validated.habits.map(habit => ({
      user_id: userId,
      habit_stack_id: habitStack.id,
      name: habit.name,
      tiny_version: habit.tiny_version,
      anchor: habit.anchor,
      celebration: habit.celebration,
      rationale: habit.rationale,
      reminder_time: habit.reminder_time || profile.wake_time,
      is_active: true,
    }));
    
    const { data: habits, error: habitsError } = await supabase
      .from('habits')
      .insert(habitsToInsert)
      .select();
    
    if (habitsError) throw habitsError;
    
    return new Response(JSON.stringify({ habitStack, habits }), {
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Habit generation error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
```

## Function 3: Weekly Iteration Analysis

### Purpose
Analyze the past week's check-in data and suggest ONE specific adjustment.

### Edge Function: `weekly-iteration`

```typescript
// supabase/functions/weekly-iteration/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from '@supabase/supabase-js';
import { openai } from '../_shared/openai.ts';
import { z } from 'zod';

const IterationSchema = z.object({
  summary: z.string(),
  pattern_identified: z.string(),
  adjustment: z.object({
    type: z.enum(['timing', 'anchor', 'size', 'celebration', 'reminder']),
    description: z.string(),
    rationale: z.string(),
    specific_change: z.string(),
  }),
});

serve(async (req) => {
  try {
    const { userId } = await req.json();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    // Fetch last 7 days of habit logs
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data: logs, error: logsError } = await supabase
      .from('habit_logs')
      .select(`
        *,
        habits (
          id,
          name,
          tiny_version,
          anchor,
          reminder_time
        )
      `)
      .eq('user_id', userId)
      .gte('check_in_date', sevenDaysAgo.toISOString())
      .order('check_in_date', { ascending: true });
    
    if (logsError) throw logsError;
    
    // Fetch failure profile for context
    const { data: failureProfile } = await supabase
      .from('habit_failure_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    // Calculate stats per habit
    const habitStats = logs.reduce((acc, log) => {
      const habitId = log.habit_id;
      if (!acc[habitId]) {
        acc[habitId] = {
          habit: log.habits,
          total: 0,
          completed: 0,
          obstacles: [],
          failedDays: [],
        };
      }
      acc[habitId].total++;
      if (log.completed) {
        acc[habitId].completed++;
      } else {
        acc[habitId].obstacles.push(log.obstacle);
        acc[habitId].failedDays.push(new Date(log.check_in_date).getDay());
      }
      return acc;
    }, {});
    
    const systemPrompt = `You are analyzing a week of habit check-in data to suggest ONE specific adjustment.
Your goal: identify the most impactful change to improve next week's success rate.

Rules:
1. Suggest ONLY ONE adjustment (the most important)
2. Be specific (not "try harder" but "move this from evening to morning")
3. Link to their original failure patterns when relevant
4. Focus on systems, not willpower
5. Make the adjustment actionable

Respond in JSON format:
{
  "summary": "Brief weekly overview",
  "pattern_identified": "What pattern did you notice?",
  "adjustment": {
    "type": "timing|anchor|size|celebration|reminder",
    "description": "User-facing description",
    "rationale": "Why this will help",
    "specific_change": "Exact implementation"
  }
}`;

    const userPrompt = `Weekly Data:
${JSON.stringify(habitStats, null, 2)}

Original Failure Patterns:
${JSON.stringify(failureProfile?.failure_patterns || [])}

Analyze this data and suggest ONE specific adjustment for next week.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 800,
    });

    const result = JSON.parse(completion.choices[0].message.content!);
    const validated = IterationSchema.parse(result);
    
    // Store iteration
    const { data: iteration, error: iterError } = await supabase
      .from('weekly_iterations')
      .insert({
        user_id: userId,
        week_start: sevenDaysAgo.toISOString(),
        summary: validated.summary,
        pattern_identified: validated.pattern_identified,
        adjustment_type: validated.adjustment.type,
        adjustment_description: validated.adjustment.description,
        adjustment_rationale: validated.adjustment.rationale,
        specific_change: validated.adjustment.specific_change,
        status: 'pending',
      })
      .select()
      .single();
    
    if (iterError) throw iterError;
    
    return new Response(JSON.stringify(iteration), {
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Weekly iteration error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
```

## Cost Optimization

### Expected Costs (GPT-4o-mini)

| Function | Input Tokens | Output Tokens | Cost per Call | Monthly (100 users) |
|----------|--------------|---------------|---------------|---------------------|
| Failure Analysis | ~800 | ~600 | ~$0.0005 | $0.05 |
| Habit Generation | ~1000 | ~800 | ~$0.0007 | $0.07 |
| Weekly Iteration | ~1200 | ~500 | ~$0.0005 | $5.00 (weekly x 100) |
| **Total** | | | | **~$5.12/month** |

### Cost Reduction Strategies

1. **Caching**: Store and reuse common prompt components
2. **Token Limits**: Set `max_tokens` appropriately
3. **Batching**: Process multiple users in one cron job
4. **Retry Logic**: Only retry once to avoid runaway costs

```typescript
// Retry helper with backoff
async function callOpenAIWithRetry(fn: () => Promise<any>, maxRetries = 1) {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
}
```

## Error Handling

### Common Errors

1. **Rate Limits**: Implement exponential backoff
2. **Invalid JSON**: Retry with more explicit prompt
3. **Token Limit Exceeded**: Truncate input data
4. **API Timeout**: Use fallback responses

### Error Response Pattern

```typescript
try {
  // OpenAI call
} catch (error) {
  if (error.code === 'rate_limit_exceeded') {
    // Wait and retry
  } else if (error.code === 'context_length_exceeded') {
    // Truncate and retry
  } else {
    // Return fallback
    return fallbackResponse;
  }
}
```

## Testing

### Local Testing

```typescript
// Test in Supabase Functions locally
supabase functions serve analyze-failure --env-file .env.local

// Invoke with test data
curl -X POST http://localhost:54321/functions/v1/analyze-failure \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user-id"}'
```

### Mock Responses for Development

```typescript
// supabase/functions/_shared/mock-openai.ts
export const mockFailureAnalysis = {
  failure_patterns: [
    { name: "Evening Energy Crash", description: "You tend to schedule habits for evening when your energy is lowest." }
  ],
  root_causes: ["Timing mismatch with energy patterns"],
  personality_insights: ["You're ambitious but need better scheduling"],
  recommendations: ["Move habits to morning", "Start with 2-minute versions"]
};

// Use in development
if (Deno.env.get('ENVIRONMENT') === 'development') {
  return mockFailureAnalysis;
}
```

## Monitoring

### Metrics to Track

1. **Success Rate**: % of successful AI calls vs fallbacks
2. **Average Cost**: Cost per user per month
3. **Token Usage**: Input/output tokens per function
4. **Response Time**: p50, p95, p99 latencies
5. **Error Rate**: Failed calls by error type

### Logging

```typescript
// Add to each Edge Function
console.log({
  function: 'analyze-failure',
  userId,
  tokens: completion.usage,
  cost: calculateCost(completion.usage),
  duration: Date.now() - startTime,
});
```

## Security Considerations

1. **API Key Protection**: Never expose in client code
2. **Rate Limiting**: Implement per-user rate limits
3. **Input Validation**: Sanitize user input before sending to OpenAI
4. **Output Validation**: Validate AI responses with Zod
5. **Cost Protection**: Set monthly budget alerts in OpenAI dashboard

## Next Steps

1. Set up OpenAI API key in Supabase secrets
2. Deploy Edge Functions to Supabase
3. Test with real user data
4. Monitor costs and adjust prompts as needed
5. Implement A/B testing for prompt variations

## References

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [GPT-4o-mini Pricing](https://openai.com/pricing)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Zod Schema Validation](https://zod.dev/)
