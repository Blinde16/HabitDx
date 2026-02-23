import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OnboardingData {
  past_habits: Array<{
    habit: string;
    duration: string;
    why_failed: string;
  }>;
  failure_reasons: string[];
  energy_pattern: string;
  life_constraints: string[];
  identity_goal: string;
  goals?: string[];
  motivation?: string;
}

interface FailureProfileResponse {
  failure_patterns: string[];
  root_causes: string[];
  personality_insights: {
    strength: string;
    weakness: string;
    archetype: string;
  };
  recommendations: string[];
}

function constructPrompt(userData: OnboardingData): string {
  const pastHabitsText = userData.past_habits
    .map(h => `- ${h.habit} (tried for ${h.duration}, failed because: ${h.why_failed})`)
    .join('\n');
  
  const failureReasonsText = userData.failure_reasons.join(', ');
  const constraintsText = userData.life_constraints.join(', ');
  const goalsText = userData.goals?.join(', ') || 'Not specified';

  return `You are an expert behavioral psychologist analyzing why someone's habits fail. Use principles from BJ Fogg's Tiny Habits, James Clear's Atomic Habits, and behavioral psychology research.

USER BACKGROUND:
Past failed habits:
${pastHabitsText}

Self-reported failure reasons: ${failureReasonsText}

CONSTRAINTS:
Peak energy time: ${userData.energy_pattern}
Life constraints: ${constraintsText}

GOALS:
${goalsText}

Identity goal: "${userData.identity_goal}"

TASK:
Generate a personalized Habit Failure Profile with deep insights that feel like "finally, someone gets me." This is a key differentiator—avoid generic advice.

Return ONLY valid JSON matching this schema:
{
  "failure_patterns": [
    "Pattern Name 1 - Specific description that references THIS user's actual data",
    "Pattern Name 2 - ...",
    "Pattern Name 3 - ..." (optional)
  ],
  "root_causes": [
    "Deep underlying cause 1 (not surface-level)",
    "Deep underlying cause 2"
  ],
  "personality_insights": {
    "strength": "This user's superpower or advantage",
    "weakness": "Primary obstacle (explain without judgment)",
    "archetype": "Brief label like 'High-Achiever Optimizer' or 'Perfectionist Planner'"
  },
  "recommendations": [
    "Specific actionable suggestion 1",
    "Specific actionable suggestion 2",
    "Specific actionable suggestion 3"
  ]
}

CRITICAL REQUIREMENTS:
1. BE SPECIFIC to THIS user - reference their actual habits, timing, constraints
2. AVOID generic phrases like "be more consistent" or "try harder"
3. Failure patterns should SURPRISE the user with insights they haven't considered
4. Root causes should go DEEPER than surface observations
5. Personality insights should feel empowering, not judgmental
6. Recommendations should be actionable and tied to their specific patterns

Example of GOOD vs BAD:
❌ BAD: "You struggle with consistency" (generic)
✅ GOOD: "Evening Energy Crash - You lose motivation after 6pm, which conflicts with your habit attempts after work"

❌ BAD: "Try to be more motivated" (not actionable)
✅ GOOD: "Anchor new habits to your morning coffee routine when energy is highest"`;
}

serve(async (req) => {
  // Handle CORS preflight requests
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
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get user's onboarding data
    const { data: profile, error: profileError } = await supabaseClient
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'Profile not found', details: profileError }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if user already has an active profile
    const { data: existingProfile } = await supabaseClient
      .from('habit_failure_profiles')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (existingProfile) {
      // Return existing profile (caching to save API costs)
      return new Response(
        JSON.stringify({ 
          profile: existingProfile,
          cached: true 
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Map from actual user_profiles schema to prompt format
    // past_failures = string[], constraints = JSONB { peak_energy, schedule_type, obstacles, failure_description }
    const constraints = (profile.constraints as Record<string, any>) || {};
    const pastFailureNames: string[] = profile.past_failures || [];

    const prompt = constructPrompt({
      past_habits: pastFailureNames.map(habit => ({
        habit,
        duration: 'unknown',
        why_failed: constraints.failure_description || 'Not specified',
      })),
      failure_reasons: constraints.failure_description
        ? [constraints.failure_description]
        : [],
      energy_pattern: constraints.peak_energy || 'varies',
      life_constraints: [
        ...(constraints.obstacles || []),
        ...(constraints.schedule_type || []),
      ],
      identity_goal: (profile.goals || [])[0] || '',
      goals: profile.goals || [],
      motivation: constraints.failure_description || '',
    });

    // Call Gemini API
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const startTime = Date.now();

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: 'You are an expert behavioral psychologist specializing in habit formation analysis. You provide deep, personalized insights that help people understand why their habits fail.' }],
          },
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.text();
      throw new Error(`Gemini API error: ${geminiResponse.status} ${errorData}`);
    }

    const geminiData = await geminiResponse.json();
    const duration = Date.now() - startTime;

    // Parse AI response
    const aiContent = geminiData.candidates[0].content.parts[0].text;
    const profileData: FailureProfileResponse = JSON.parse(aiContent);

    // Validate response structure
    if (
      !profileData.failure_patterns ||
      !profileData.root_causes ||
      !profileData.personality_insights ||
      !profileData.recommendations
    ) {
      throw new Error('Invalid AI response structure');
    }

    // Generate share token
    const shareToken = crypto.randomUUID().split('-')[0]; // 8 character token

    // Save to database
    const { data: savedProfile, error: saveError } = await supabaseClient
      .from('habit_failure_profiles')
      .insert({
        user_id: user.id,
        failure_patterns: profileData.failure_patterns,
        root_causes: profileData.root_causes,
        personality_insights: JSON.stringify(profileData.personality_insights),
        recommendations: profileData.recommendations,
        share_token: shareToken,
        view_count: 0,
        version: 1,
        is_active: true,
        model_used: 'gemini-1.5-flash',
        tokens_used: geminiData.usageMetadata?.totalTokenCount || 0,
        raw_response: aiContent,
      })
      .select()
      .single();

    if (saveError) {
      throw new Error(`Failed to save profile: ${saveError.message}`);
    }

    // Log success
    console.log(`Profile generated for user ${user.id} in ${duration}ms, tokens: ${openaiData.usage?.total_tokens}`);

    return new Response(
      JSON.stringify({
        profile: savedProfile,
        cached: false,
        generation_time_ms: duration,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in analyze-failure function:', error);

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
