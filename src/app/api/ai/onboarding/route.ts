import { NextResponse } from 'next/server'
import { getAnthropicClient, MODELS } from '@/lib/ai/client'
import { ONBOARDING_SYSTEM_PROMPT } from '@/lib/ai/prompts'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const { messages, start } = await request.json()
  const anthropic = getAnthropicClient()

  // First message — kick off the interview
  if (start || messages.length === 0) {
    const response = await anthropic.messages.create({
      model: MODELS.plan,
      max_tokens: 500,
      system: ONBOARDING_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: 'Start the interview.' }],
    })
    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    return NextResponse.json({ message: text, complete: false })
  }

  // Continue the interview
  const response = await anthropic.messages.create({
    model: MODELS.plan,
    max_tokens: 600,
    system: ONBOARDING_SYSTEM_PROMPT,
    messages: messages.map((m: { role: string; content: string }) => ({
      role: m.role,
      content: m.content,
    })),
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  // Check if interview is complete (AI outputs JSON with complete: true)
  try {
    const parsed = JSON.parse(text)
    if (parsed.complete && parsed.data) {
      // Store interview data and kick off plan generation
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Save interview data and start async plan generation
        await supabase.from('conversations').insert({
          user_id: user.id,
          type: 'onboarding',
          messages: messages,
          summary: null,
        })

        // Upsert profile with interview data
        await supabase.from('profiles').upsert({
          user_id: user.id,
          interview_data: parsed.data,
        })

        // Trigger plan generation in background
        fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/ai/generate-plan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
          body: JSON.stringify({ interview_data: parsed.data }),
        }).catch(() => {})
      }

      return NextResponse.json({ complete: true })
    }
  } catch {
    // Not JSON — normal conversation response
  }

  return NextResponse.json({ message: text, complete: false })
}
