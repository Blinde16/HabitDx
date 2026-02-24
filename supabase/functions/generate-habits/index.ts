import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { OpenAI } from 'https://esm.sh/openai@4.20.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FailureProfile {
  failure_patterns: string[];
  root_causes: string[];
  personality_insights:
    | string
    | {
        strength: string;
        weakness: string;
        archetype: string;
      };
  recommendations: string[];
}

interface UserProfile {
  energy_pattern: string;
  life_constraints: string[];
  identity_goal: string;
  past_habits?: Array<{
    habit: string;
    duration: string;
    why_failed: string;
  }>;
}

interface HabitResponse {
  name: string;
  tiny_version: string;
  anchor: string;
  celebration: string;
  addresses_pattern: string;
  rationale: string;
  reminder_time: string;
  days_of_week: number[];
}

interface GenerateHabitsResponse {
  habits: HabitResponse[];
  stack_rationale: string;
}

function parsePersonalityInsights(insights: string | any): any {
  if (typeof insights === 'string') {
    try {
      return JSON.parse(insights);
    } catch {
      return { strength: '', weakness: '', archetype: 'Unknown' };
    }
  }
  return insights;
}

function constructPrompt(failureProfile: FailureProfile, userProfile: UserProfile): string {
  const personality = parsePersonalityInsights(failureProfile.personality_insights);

  const patternsText = failureProfile.failure_patterns.join('\n- ');
  const causesText = failureProfile.root_causes.join('\n- ');
  const constraintsText = userProfile.life_constraints.join(', ');

  return `You are an expert habit designer using principles from BJ Fogg's Tiny Habits and James Clear's Atomic Habits. Design 1-3 personalized habits that will actually work for THIS specific person.

USER'S FAILURE PROFILE:
Identified patterns:
- ${patternsText}

Root causes:
- ${causesText}

Personality type: ${personality.archetype}
Strength: ${personality.strength}
Challenge: ${personality.weakness}

USER'S CONSTRAINTS:
Peak energy time: ${userProfile.energy_pattern}
Life constraints: ${constraintsText}
Identity goal: "${userProfile.identity_goal}"

DESIGN PRINCIPLES (CRITICAL):
1. **TINY:** Each habit must be ≤2 minutes. Make it so small they can't say no.
2. **ANCHORED:** Attach to existing routines (e.g., "After I pour coffee...")
3. **CELEBRATE:** Include a tiny celebration immediately after (dopamine hit)
4. **ADDRESS PATTERNS:** Explicitly tie each habit to their failure patterns
5. **FIT CONSTRAINTS:** Respect their energy patterns and life constraints

EXAMPLES OF GOOD vs BAD:

❌ BAD HABIT:
{
  "name": "Morning Exercise",
  "tiny_version": "Do 30 minutes of exercise",
  "rationale": "Exercise is good for you"
}
WHY BAD: Not tiny, generic advice, ignores failure patterns

✅ GOOD HABIT:
{
  "name": "One Push-Up",
  "tiny_version": "Do exactly 1 push-up (seriously, just one)",
  "anchor": "After I close my laptop for lunch",
  "celebration": "Say 'I'm building strength' and smile",
  "addresses_pattern": "Perfectionist Paralysis",
  "rationale": "Your failure pattern shows you abandon habits when they're not 'perfect.' One push-up is so absurdly small your brain can't rationalize skipping it. You can ALWAYS do more, but the win is doing just one.",
  "reminder_time": "12:00:00",
  "days_of_week": [1,2,3,4,5]
}

Return ONLY valid JSON matching this schema:
{
  "habits": [
    {
      "name": "Short, clear name",
      "tiny_version": "Exact tiny action (≤2 minutes)",
      "anchor": "After I [existing habit]",
      "celebration": "Tiny reward (5 seconds)",
      "addresses_pattern": "Which failure pattern this solves",
      "rationale": "Why THIS habit works for THIS person (reference their specific patterns/constraints)",
      "reminder_time": "HH:MM:SS",
      "days_of_week": [1,2,3,4,5,6,7]
    }
  ],
  "stack_rationale": "Why this combination of habits works together for this person"
}

REQUIREMENTS:
- Generate 1-3 habits (prefer 1-2 for beginners)
- EVERY habit must be ≤2 minutes
- EVERY rationale must reference their actual failure patterns
- Use their peak energy time for scheduling
- Make celebrations feel natural (not cheesy)
- Anchor to realistic existing routines

Focus on IDENTITY-BASED habits that align with: "${userProfile.identity_goal}"`;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user already has an active habit stack
    const { data: existingStack } = await supabaseClient
      .from('habit_stacks')
      .select('*, habits(*)')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (existingStack && existingStack.habits && existingStack.habits.length > 0) {
      return new Response(
        JSON.stringify({
          stack: existingStack,
          habits: existingStack.habits,
          cached: true,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get user's failure profile
    const { data: failureProfile, error: profileError } = await supabaseClient
      .from('habit_failure_profiles')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (profileError || !failureProfile) {
      return new Response(
        JSON.stringify({ error: 'Failure profile not found. Please complete onboarding first.' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get user's profile data
    const { data: userProfile, error: userProfileError } = await supabaseClient
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userProfileError || !userProfile) {
      return new Response(JSON.stringify({ error: 'User profile not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Map from actual user_profiles schema
    // constraints = JSONB { peak_energy, schedule_type, obstacles, failure_description }
    const constraints = (userProfile.constraints as Record<string, any>) || {};

    // Construct AI prompt
    const prompt = constructPrompt(
      {
        failure_patterns: failureProfile.failure_patterns || [],
        root_causes: failureProfile.root_causes || [],
        personality_insights: failureProfile.personality_insights,
        recommendations: failureProfile.recommendations || [],
      },
      {
        energy_pattern: constraints.peak_energy || 'morning',
        life_constraints: [...(constraints.obstacles || []), ...(constraints.schedule_type || [])],
        identity_goal: (userProfile.goals || [])[0] || '',
        past_habits: (userProfile.past_failures || []).map((habit: string) => ({
          habit,
          duration: 'unknown',
          why_failed: constraints.failure_description || 'Not specified',
        })),
      }
    );

    // Call OpenAI API
    if (!Deno.env.get('OPENAI_API_KEY')) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') });
    const startTime = Date.now();

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert habit designer specializing in personalized, tiny habits that stick. You design habits based on behavioral science and individual failure patterns.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8,
      max_tokens: 1500,
    });

    const duration = Date.now() - startTime;

    // Parse AI response
    const aiContent = completion.choices[0].message.content || '{}';
    const habitsData: GenerateHabitsResponse = JSON.parse(aiContent);

    // Validate response
    if (!habitsData.habits || !Array.isArray(habitsData.habits) || habitsData.habits.length === 0) {
      throw new Error('Invalid AI response: no habits generated');
    }

    // Create habit stack
    const { data: newStack, error: stackError } = await supabaseClient
      .from('habit_stacks')
      .insert({
        user_id: user.id,
        version: 1,
        is_active: true,
        generation_rationale: habitsData.stack_rationale || 'Personalized habit stack',
        based_on_profile_id: failureProfile.id,
      })
      .select()
      .single();

    if (stackError) {
      throw new Error(`Failed to create habit stack: ${stackError.message}`);
    }

    // Create habits
    const habitsToInsert = habitsData.habits.map((habit, index) => ({
      stack_id: newStack.id,
      user_id: user.id,
      name: habit.name,
      tiny_version: habit.tiny_version,
      anchor: habit.anchor,
      celebration: habit.celebration,
      addresses_pattern: habit.addresses_pattern,
      rationale: habit.rationale,
      reminder_time: habit.reminder_time || '09:00:00',
      reminder_enabled: true,
      days_of_week: habit.days_of_week || [1, 2, 3, 4, 5, 6, 7],
      is_active: true,
      order_index: index,
    }));

    const { data: createdHabits, error: habitsError } = await supabaseClient
      .from('habits')
      .insert(habitsToInsert)
      .select();

    if (habitsError) {
      throw new Error(`Failed to create habits: ${habitsError.message}`);
    }

    console.log(`Generated ${createdHabits.length} habits for user ${user.id} in ${duration}ms`);

    return new Response(
      JSON.stringify({
        stack: newStack,
        habits: createdHabits,
        cached: false,
        generation_time_ms: duration,
        tokens_used: completion.usage?.total_tokens || 0,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-habits function:', error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
