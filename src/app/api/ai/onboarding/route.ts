import { NextResponse } from 'next/server'
import { generateText } from 'ai'
import { getModel } from '@/lib/ai/client'
import { ONBOARDING_SYSTEM_PROMPT } from '@/lib/ai/prompts'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
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
  try {
    const parsed = JSON.parse(text)
    if (parsed.complete && parsed.data) {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        await supabase.from('conversations').insert({
          user_id: user.id,
          type: 'onboarding',
          messages,
          summary: null,
        })

        await supabase.from('profiles').upsert({
          user_id: user.id,
          interview_data: parsed.data,
        })

        // Kick off async plan generation
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? `https://${request.headers.get('host')}`
        fetch(`${appUrl}/api/ai/generate-plan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
          body: JSON.stringify({ interview_data: parsed.data }),
        }).catch(() => {})
      }

      return NextResponse.json({ complete: true })
    }
  } catch {
    // Normal conversation response
  }

  return NextResponse.json({ message: text, complete: false })
}
