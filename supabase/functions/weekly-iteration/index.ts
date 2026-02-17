import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { OpenAI } from 'https://esm.sh/openai@4.20.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HabitLog {
  id: string;
  habit_id: string;
  completed: boolean;
  obstacle_type: string | null;
  obstacle_notes: string | null;
  completed_at: string;
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
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error('Not authenticated');
    }

    // Get user's habits
    const { data: habits, error: habitsError } = await supabaseClient
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
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
      .eq('user_id', user.id)
      .gte('completed_at', sevenDaysAgo.toISOString())
      .order('completed_at', { ascending: false });

    if (logsError) throw logsError;

    // Calculate completion stats
    const stats = calculateCompletionStats(habits as Habit[], logs as HabitLog[]);

    // Get user's failure profile for context
    const { data: failureProfile } = await supabaseClient
      .from('habit_failure_profiles')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { descending: true })
      .limit(1)
      .single();

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

Adjustment types you can suggest:
- TIME_CHANGE: Adjust reminder time
- TINY_VERSION_SIMPLIFY: Make the habit even smaller
- ANCHOR_CHANGE: Change the trigger/anchor
- FREQUENCY_REDUCE: Reduce days per week
- OBSTACLE_MITIGATION: Address specific obstacle

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
    "current_value": "string",
    "suggested_value": "string",
    "rationale": "string (2-3 sentences explaining why)"
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

ORIGINAL FAILURE PATTERNS:
${failureProfile?.failure_patterns?.map((p: any) => `- ${p.name}: ${p.description}`).join('\n') || 'None available'}

Based on this data, provide ONE specific adjustment recommendation that will have the highest impact on their success.`;

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

    const analysis = JSON.parse(completion.choices[0].message.content || '{}');

    // Store iteration result
    const { data: iteration, error: iterationError } = await supabaseClient
      .from('weekly_iterations')
      .insert({
        user_id: user.id,
        week_start: sevenDaysAgo.toISOString(),
        week_end: new Date().toISOString(),
        completion_stats: stats,
        patterns_detected: analysis.patterns_detected || [],
        adjustment_recommendation: analysis.adjustment_recommendation,
        insights: analysis.insights,
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
      patterns_detected: analysis.patterns_detected || [],
      adjustment_recommendation: analysis.adjustment_recommendation,
      insights: analysis.insights,
      tokens_used: tokensUsed,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in weekly-iteration:', error);
    return new Response(JSON.stringify({ error: error.message }), {
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

function getObstacleSummary(logs: HabitLog[]): string {
  const obstacles = logs
    .filter(log => !log.completed && log.obstacle_type)
    .reduce((acc, log) => {
      acc[log.obstacle_type!] = (acc[log.obstacle_type!] || 0) + 1;
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
