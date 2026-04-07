import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { OpenAI } from 'https://esm.sh/openai@4.20.1';
import { verifyJwtAndGetUserId } from '../_shared/auth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HabitLog {
  id: string;
  habit_id: string;
  completed: boolean;
  obstacle: string | null;
  log_date: string;
  checked_in_at: string;
}

interface Habit {
  id: string;
  name: string;
  tiny_version: string;
  anchor: string;
  days_of_week: number[];
  reminder_time: string | null;
  addresses_pattern: string;
}

interface WeeklyIterationResult {
  iteration_id: string;
  completion_stats: {
    total_scheduled: number;
    total_completed: number;
    completion_rate: number;
    habits: Array<{
      habit_id: string;
      habit_name: string;
      scheduled: number;
      completed: number;
      rate: number;
    }>;
  };
  patterns_detected: Array<{
    type: string;
    description: string;
    habits_affected: string[];
  }>;
  adjustment_recommendation: {
    type: string;
    habit_id: string;
    habit_name: string;
    current_value: string;
    suggested_value: string;
    rationale: string;
  } | null;
  insights: string;
  tokens_used: number;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    const auth = await verifyJwtAndGetUserId(authHeader);
    if (!auth.ok) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', detail: auth.error }),
        { status: auth.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const userId = auth.userId;

    // Client with user's auth for RLS-scoped queries
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get user's habits
    const { data: habits, error: habitsError } = await supabaseClient
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('order_index');

    if (habitsError) throw habitsError;
    if (!habits || habits.length === 0) {
      throw new Error('No active habits found');
    }

    // Get habit logs from the past 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: logs, error: logsError } = await supabaseClient
      .from('habit_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('log_date', sevenDaysAgo.toISOString().split('T')[0])
      .order('log_date', { ascending: false });

    if (logsError) throw logsError;

    // Calculate completion stats
    const stats = calculateCompletionStats(habits as Habit[], logs as HabitLog[]);

    // Optional habit profile + user profile (persona context). New users may not have a profile yet.
    const { data: failureProfile } = await supabaseClient
      .from('habit_failure_profiles')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: userProfile } = await supabaseClient
      .from('user_profiles')
      .select('goals, past_failures, constraints')
      .eq('id', userId)
      .maybeSingle();

    const constraints = (userProfile?.constraints as Record<string, unknown> | null) || {};
    const constraintSummary = formatConstraintSummary(constraints);

    const failurePatternsText = formatFailurePatterns(failureProfile?.failure_patterns);
    const rootCausesText = formatStringList(failureProfile?.root_causes);

    if (!Deno.env.get('OPENAI_API_KEY')) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    // Call OpenAI for weekly analysis
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });

    const systemPrompt = `You are an expert habit coach analyzing a user's weekly habit performance to provide ONE specific, actionable adjustment.

Your analysis should:
1. Identify patterns in completion rates, obstacles, and timing
2. Recommend ONE specific change (not multiple suggestions)
3. Be data-driven and personalized
4. Reference the user's original failure patterns
5. Be supportive and encouraging, not judgmental

Adjustment types you can suggest (with required suggested_value format):
- TIME_CHANGE: Adjust reminder time. suggested_value must be HH:MM (24-hour), e.g. "07:30". current_value same format.
- TINY_VERSION_SIMPLIFY: Make the habit even smaller. suggested_value is the new tiny version text.
- ANCHOR_CHANGE: Change the trigger/anchor. suggested_value is the new anchor text.
- FREQUENCY_REDUCE: Reduce days per week. suggested_value must be comma-separated day numbers (0=Sun,1=Mon,...6=Sat), e.g. "1,3,5" for Mon/Wed/Fri. current_value same format. Use current_value/suggested_value for the machine-readable days; put the human-readable description in rationale.
- OBSTACLE_MITIGATION: Address a specific obstacle with coaching advice. suggested_value is a short description of the mitigation strategy. This type does NOT modify the habit directly — it provides guidance only.

Return your analysis as JSON with:
{
  "patterns_detected": [
    {
      "type": "string (time_pattern | obstacle_pattern | consistency_pattern)",
      "description": "string",
      "habits_affected": ["habit_id"]
    }
  ],
  "adjustment_recommendation": {
    "type": "string (one of the types above)",
    "habit_id": "string",
    "habit_name": "string",
    "current_value": "string (machine-readable, see format above)",
    "suggested_value": "string (machine-readable, see format above)",
    "rationale": "string (2-3 sentences explaining why, include human-readable context)"
  } or null if no adjustment needed,
  "insights": "string (2-3 sentences of encouragement and context about their week)"
}`;

    const userPrompt = `Analyze this week's habit performance:

HABITS:
${habits.map((h: Habit, i: number) => `${i + 1}. ${h.name} (Tiny: ${h.tiny_version})
   - Anchor: ${h.anchor}
   - Days: ${h.days_of_week.join(',')}
   - Reminder: ${h.reminder_time || 'None'}
   - Addresses Pattern: ${h.addresses_pattern}
`).join('\n')}

COMPLETION STATS (Past 7 Days):
${stats.habits.map(h => `- ${h.habit_name}: ${h.completed}/${h.scheduled} (${Math.round(h.rate * 100)}%)`).join('\n')}
- Overall: ${stats.total_completed}/${stats.total_scheduled} (${Math.round(stats.completion_rate * 100)}%)

OBSTACLES ENCOUNTERED:
${getObstacleSummary(logs as HabitLog[])}

USER GOALS (from onboarding):
${formatStringList(userProfile?.goals)}

PAST STRUGGLES (from onboarding):
${formatStringList(userProfile?.past_failures)}

SCHEDULE / CONSTRAINTS:
${constraintSummary || 'Not specified'}

HABIT PROFILE — PATTERNS (if diagnosed):
${failurePatternsText}

HABIT PROFILE — ROOT CAUSES (if diagnosed):
${rootCausesText}

Based on this data, provide ONE specific adjustment recommendation that will have the highest impact on their success. Align tone with their goals and constraints; be supportive, not judgmental.`;

    console.log('Calling OpenAI for weekly analysis...');
    const startTime = Date.now();

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 1000,
    });

    const duration = Date.now() - startTime;
    const tokensUsed = completion.usage?.total_tokens || 0;

    console.log(`OpenAI response received in ${duration}ms, ${tokensUsed} tokens`);

    const rawContent = completion.choices[0].message.content || '{}';
    let analysis: {
      patterns_detected?: unknown;
      adjustment_recommendation?: unknown;
      insights?: unknown;
    };
    try {
      analysis = JSON.parse(rawContent);
    } catch {
      throw new Error('Invalid AI response: could not parse JSON');
    }

    const patternsDetected = Array.isArray(analysis.patterns_detected)
      ? analysis.patterns_detected
      : [];

    const insightsText =
      typeof analysis.insights === 'string' && analysis.insights.trim().length > 0
        ? analysis.insights.trim()
        : 'Here is a snapshot of your week based on your check-ins. Keep logging — the more data we have, the more tailored your next insight will be.';

    // Store iteration result
    const { data: iteration, error: iterationError } = await supabaseClient
      .from('weekly_iterations')
      .insert({
        user_id: userId,
        week_start: sevenDaysAgo.toISOString(),
        week_end: new Date().toISOString(),
        completion_stats: stats,
        patterns_detected: patternsDetected,
        adjustment_recommendation: analysis.adjustment_recommendation ?? null,
        insights: insightsText,
        status: 'pending',
        tokens_used: tokensUsed,
        generation_time_ms: duration,
      })
      .select()
      .single();

    if (iterationError) throw iterationError;

    const result: WeeklyIterationResult = {
      iteration_id: iteration.id,
      completion_stats: stats,
      patterns_detected: patternsDetected as WeeklyIterationResult['patterns_detected'],
      adjustment_recommendation: (analysis.adjustment_recommendation ?? null) as WeeklyIterationResult['adjustment_recommendation'],
      insights: insightsText,
      tokens_used: tokensUsed,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in weekly-iteration:', error);
    const err = error as { message?: string; details?: string; hint?: string; code?: string };
    const errorMessage =
      typeof err?.message === 'string' && err.message.length > 0 ? err.message : 'Unknown error';
    const detail =
      typeof err?.details === 'string' && err.details.length > 0 ? err.details : undefined;
    return new Response(JSON.stringify({ error: errorMessage, detail, code: err?.code }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function calculateCompletionStats(habits: Habit[], logs: HabitLog[]) {
  const today = new Date();
  const todayDay = today.getDay(); // 0 = Sunday, 6 = Saturday

  const habitStats = habits.map(habit => {
    // Count how many times habit was scheduled in past 7 days
    let scheduled = 0;
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date();
      checkDate.setDate(checkDate.getDate() - i);
      const dayOfWeek = checkDate.getDay();
      
      if (habit.days_of_week.includes(dayOfWeek)) {
        scheduled++;
      }
    }

    // Count completions
    const habitLogs = logs.filter(log => log.habit_id === habit.id && log.completed);
    const completed = habitLogs.length;

    return {
      habit_id: habit.id,
      habit_name: habit.name,
      scheduled,
      completed,
      rate: scheduled > 0 ? completed / scheduled : 0,
    };
  });

  const totalScheduled = habitStats.reduce((sum, h) => sum + h.scheduled, 0);
  const totalCompleted = habitStats.reduce((sum, h) => sum + h.completed, 0);

  return {
    total_scheduled: totalScheduled,
    total_completed: totalCompleted,
    completion_rate: totalScheduled > 0 ? totalCompleted / totalScheduled : 0,
    habits: habitStats,
  };
}

function asStringList(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((x): x is string => typeof x === 'string' && x.length > 0);
  if (typeof value === 'string' && value.length > 0) return [value];
  return [];
}

/** JSONB constraints: obstacles (array), schedule_type (array or string), peak_energy, etc. */
function formatConstraintSummary(c: Record<string, unknown>): string {
  const parts = [
    ...asStringList(c.obstacles),
    ...asStringList(c.schedule_type),
    typeof c.peak_energy === 'string' ? `Energy: ${c.peak_energy}` : '',
    typeof c.failure_description === 'string' ? c.failure_description : '',
  ].filter(Boolean);
  return parts.join('; ') || '';
}

function formatStringList(value: string[] | null | undefined): string {
  if (!value || value.length === 0) return 'None provided';
  return value.map((s) => `- ${s}`).join('\n');
}

/** failure_patterns is stored as string[] in the DB */
function formatFailurePatterns(patterns: string[] | null | undefined): string {
  if (!patterns || patterns.length === 0) return 'Not yet diagnosed — use logs and stats only.';
  return patterns.map((p) => `- ${p}`).join('\n');
}

function getObstacleSummary(logs: HabitLog[]): string {
  const obstacles = logs
    .filter(log => !log.completed && log.obstacle)
    .reduce((acc, log) => {
      acc[log.obstacle!] = (acc[log.obstacle!] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  if (Object.keys(obstacles).length === 0) {
    return 'None reported';
  }

  return Object.entries(obstacles)
    .sort(([, a], [, b]) => b - a)
    .map(([type, count]) => `- ${type}: ${count}x`)
    .join('\n');
}
