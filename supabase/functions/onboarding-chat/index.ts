import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { OpenAI } from 'https://esm.sh/openai@4.20.1';
import { verifyJwtAndGetUserId } from '../_shared/auth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type ChatRole = 'system' | 'user' | 'assistant';

interface ChatMessage {
  role: ChatRole;
  content: string;
}

const COACH_SYSTEM = `You are HabitDx's onboarding coach — warm, curious, and brief. You speak in natural language like a supportive friend who gets behavior change science.

Goals in this conversation:
- Learn which habits they've tried and what happened when things fell apart (no judgment).
- Understand real-life constraints: energy patterns, schedule shape, friction (time, forgetfulness, perfectionism, etc.).
- Clarify what outcomes matter to them and why now.

Rules:
- Ask ONE focused follow-up at a time when you need more detail.
- Keep each reply under ~120 words unless the user writes a lot — then you may mirror briefly.
- Do not output JSON, lists of field names, or mention "onboarding schema" — stay human.
- If they give short answers, gently invite one more sentence.
- After you have a rich picture (usually 4–8 user messages), say you're ready to summarize for their personalized plan and ask them to tap "Build my profile" when they feel heard — do NOT fabricate that they already tapped it.`;

const EXTRACT_SYSTEM = `You extract structured onboarding data from a coaching transcript. Return ONLY valid JSON, no markdown.

Schema:
{
  "past_failures": string[],  // habit names or short labels they mentioned (1-12 items)
  "failure_description": string,  // 20-500 chars: narrative of how habits slip (their voice synthesized)
  "peak_energy": "morning" | "afternoon" | "evening" | "varies",
  "schedule_type": string[],  // e.g. "9-5 job", "Shift work", "Freelance/irregular", "Stay-at-home parent", "Student", "Retired" — pick closest matches, 1-3 items
  "obstacles": string[],  // from: Lack of time, Inconsistent schedule, Low energy, Forgetfulness, No accountability, Perfectionism, Overwhelm, Lack of motivation — pick 1-5 that fit
  "goals": string[],  // 1-3 short outcome labels (e.g. Better health, More energy)
  "motivation": string,  // 20-300 chars: why this matters to them now
  "notifications_enabled": boolean  // default true unless they clearly opt out
}

If something was not discussed, infer cautiously from context or use sensible defaults:
- peak_energy "varies" if unclear
- schedule_type ["Freelance/irregular"] if unclear
- obstacles: at least one plausible obstacle from the list
- goals: at least one goal aligned with the conversation`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    const auth = await verifyJwtAndGetUserId(authHeader);
    if (!auth.ok) {
      return new Response(JSON.stringify({ error: 'Unauthorized', detail: auth.error }), {
        status: auth.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!Deno.env.get('OPENAI_API_KEY')) {
      return new Response(JSON.stringify({ error: 'Server misconfiguration' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const action = body.action as 'message' | 'finalize';
    const messages = (body.messages || []) as ChatMessage[];

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'messages required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') });

    if (action === 'message') {
      const trimmed = messages.slice(-24);
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: COACH_SYSTEM }, ...trimmed],
        temperature: 0.75,
        max_tokens: 500,
      });
      const reply = completion.choices[0]?.message?.content?.trim() ?? '';
      return new Response(JSON.stringify({ reply }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'finalize') {
      const transcript = messages
        .filter((m) => m.role !== 'system')
        .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
        .join('\n\n');

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: EXTRACT_SYSTEM },
          {
            role: 'user',
            content: `Transcript:\n\n${transcript}\n\nReturn the JSON object only.`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 1200,
      });

      const raw = completion.choices[0]?.message?.content?.trim() ?? '{}';
      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(raw);
      } catch {
        return new Response(JSON.stringify({ error: 'Failed to parse extraction' }), {
          status: 422,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ extracted: parsed }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
