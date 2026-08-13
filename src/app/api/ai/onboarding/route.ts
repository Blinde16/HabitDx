import { NextResponse } from 'next/server'
import { generateText } from 'ai'
import { getModel } from '@/lib/ai/client'
import { ONBOARDING_SYSTEM_PROMPT } from '@/lib/ai/prompts'
import { createClient } from '@/lib/supabase/server'
import { generateAndStorePlan } from '@/lib/ai/generate-plan'
import { checkRateLimit } from '@/lib/rate-limit'

// Plan generation now runs inline on the request that completes the interview.
export const maxDuration = 60

export async function POST(request: Request) {
  // Auth FIRST. `src/middleware.ts` only guards page routes, so an unauthenticated
  // caller could previously reach the model call below and burn billed tokens.
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rate = checkRateLimit(`ai:onboarding:${user.id}`, 30, 60_000)
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfter) } }
    )
  }

  const { messages, start } = await request.json()
  const model = getModel('plan')

  const aiMessages = start || messages.length === 0
    ? [{ role: 'user' as const, content: 'Start the interview.' }]
    : messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }))

  const { text } = await generateText({
    model,
    system: ONBOARDING_SYSTEM_PROMPT,
    messages: aiMessages,
    maxOutputTokens: 600,
  })

  // Check if interview is complete (AI outputs JSON with complete: true)
  let parsed
  try {
    parsed = JSON.parse(text)
  } catch {
    // Normal conversation response
    return NextResponse.json({ message: text, complete: false })
  }

  if (!parsed?.complete || !parsed.data) {
    return NextResponse.json({ message: text, complete: false })
  }

  const conversationRes = await supabase.from('conversations').insert({
    user_id: user.id,
    type: 'onboarding',
    messages,
    summary: null,
  })
  if (conversationRes.error) {
    console.error('Onboarding: conversation insert failed:', conversationRes.error)
  }

  const profileRes = await supabase.from('profiles').upsert({
    user_id: user.id,
    interview_data: parsed.data,
  })
  if (profileRes.error) {
    console.error('Onboarding: profile upsert failed:', profileRes.error)
    return NextResponse.json({ error: 'Failed to save interview data' }, { status: 500 })
  }

  // Generate the plan in-process using THIS request's authenticated Supabase client.
  // The previous fire-and-forget fetch to /api/ai/generate-plan carried no cookies,
  // so every write it attempted was silently rejected by RLS and onboarding_complete
  // was never set — leaving /onboarding/generating polling forever.
  const planResult = await generateAndStorePlan({
    supabase,
    userId: user.id,
    interviewData: parsed.data,
  })

  if (!planResult.ok) {
    console.error('Onboarding: plan generation failed:', planResult.error)
    return NextResponse.json(
      { complete: true, plan_ready: false, error: planResult.error },
      { status: planResult.status }
    )
  }

  return NextResponse.json({ complete: true, plan_ready: true })
}
