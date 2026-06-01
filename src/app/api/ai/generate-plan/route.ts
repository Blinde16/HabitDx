import { NextResponse } from 'next/server'
import { getAnthropicClient, MODELS } from '@/lib/ai/client'
import { PLAN_GENERATION_SYSTEM_PROMPT } from '@/lib/ai/prompts'
import { createClient } from '@/lib/supabase/server'

export const maxDuration = 60

export async function POST(request: Request) {
  const userId = request.headers.get('x-user-id')
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { interview_data } = await request.json()
  const anthropic = getAnthropicClient()
  const supabase = await createClient()

  const response = await anthropic.messages.create({
    model: MODELS.plan,
    max_tokens: 8000,
    system: PLAN_GENERATION_SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content: `Generate a complete 18-month plan based on this interview data:\n\n${JSON.stringify(interview_data, null, 2)}`,
    }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  let plan
  try {
    // Strip any markdown code fences if present
    const cleaned = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
    plan = JSON.parse(cleaned)
  } catch {
    console.error('Plan generation JSON parse failed:', text.slice(0, 500))
    return NextResponse.json({ error: 'Plan generation failed' }, { status: 500 })
  }

  // Write plan to database
  await supabase.from('profiles').update({
    shadow_vision: plan.shadow_vision,
    daily_template: plan.daily_template,
    pillars: plan.pillars,
    gym_program: plan.gym_program,
    reading_list: plan.reading_list,
    travel_plan: plan.travel_plan,
  }).eq('user_id', userId)

  // Write monthly plans
  if (plan.monthly_plans?.length) {
    await supabase.from('monthly_plans').delete().eq('user_id', userId)
    await supabase.from('monthly_plans').insert(
      plan.monthly_plans.map((m: Record<string, unknown>) => ({
        user_id: userId,
        month_number: m.month_number,
        month_label: m.month_label,
        phase: m.phase,
        phase_color: m.phase_color || '#C8A84B',
        pills: m.pills || [],
        family_items: m.family || [],
        gym_items: m.gym || [],
        reading_items: m.reading || [],
        event_items: m.events || [],
      }))
    )
  }

  // Write milestones
  const allMilestones = [
    ...(plan.milestones?.business || []).map((m: Record<string, unknown>) => ({ ...m, pillar: 'business', user_id: userId })),
    ...(plan.milestones?.personal || []).map((m: Record<string, unknown>) => ({ ...m, pillar: 'personal', user_id: userId })),
  ]
  if (allMilestones.length) {
    await supabase.from('milestones').delete().eq('user_id', userId)
    await supabase.from('milestones').insert(allMilestones.map(m => ({
      user_id: m.user_id as string,
      month_target: m.month as number,
      title: m.title as string,
      description: m.description as string,
      pillar: m.pillar as string,
      tags: m.tags || [],
    })))
  }

  // Mark onboarding complete
  await supabase.from('users').update({ onboarding_complete: true }).eq('id', userId)

  return NextResponse.json({ success: true })
}
