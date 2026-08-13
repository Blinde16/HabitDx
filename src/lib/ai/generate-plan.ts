import { generateText } from 'ai'
import { getModel } from '@/lib/ai/client'
import { PLAN_GENERATION_SYSTEM_PROMPT } from '@/lib/ai/prompts'
import type { createClient } from '@/lib/supabase/server'

/**
 * The request-scoped Supabase client (anon key + the caller's session cookies).
 * Passing this through — rather than opening a fresh, session-less client — is what
 * makes the RLS policies (`auth.uid() = user_id`) pass on the writes below.
 */
type AuthedSupabaseClient = Awaited<ReturnType<typeof createClient>>

export type GeneratePlanResult =
  | { ok: true }
  | { ok: false; error: string; status: number }

interface GeneratePlanArgs {
  supabase: AuthedSupabaseClient
  userId: string
  interviewData: unknown
}

/**
 * Generates the 18-month plan from the onboarding interview data and persists it.
 *
 * Callers MUST have already authenticated the user and must pass the Supabase client
 * built from that request's cookies. This function never derives identity on its own.
 */
export async function generateAndStorePlan({
  supabase,
  userId,
  interviewData,
}: GeneratePlanArgs): Promise<GeneratePlanResult> {
  const model = getModel('plan')

  const { text } = await generateText({
    model,
    system: PLAN_GENERATION_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Generate a complete 18-month plan based on this interview data:\n\n${JSON.stringify(interviewData, null, 2)}`,
      },
    ],
    maxOutputTokens: 8000,
  })

  let plan
  try {
    const cleaned = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
    plan = JSON.parse(cleaned)
  } catch {
    console.error('Plan generation JSON parse failed:', text.slice(0, 500))
    return { ok: false, error: 'Plan generation failed', status: 500 }
  }

  const profileRes = await supabase
    .from('profiles')
    .update({
      shadow_vision: plan.shadow_vision,
      daily_template: plan.daily_template,
      pillars: plan.pillars,
      gym_program: plan.gym_program,
      reading_list: plan.reading_list,
      travel_plan: plan.travel_plan,
    })
    .eq('user_id', userId)

  if (profileRes.error) {
    console.error('Plan generation: profiles update failed:', profileRes.error)
    return { ok: false, error: 'Failed to save plan profile', status: 500 }
  }

  if (plan.monthly_plans?.length) {
    const deleteRes = await supabase.from('monthly_plans').delete().eq('user_id', userId)
    if (deleteRes.error) {
      console.error('Plan generation: monthly_plans delete failed:', deleteRes.error)
      return { ok: false, error: 'Failed to reset monthly plans', status: 500 }
    }

    const insertRes = await supabase.from('monthly_plans').insert(
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
    if (insertRes.error) {
      console.error('Plan generation: monthly_plans insert failed:', insertRes.error)
      return { ok: false, error: 'Failed to save monthly plans', status: 500 }
    }
  }

  const allMilestones = [
    ...(plan.milestones?.business || []).map((m: Record<string, unknown>) => ({ ...m, pillar: 'business' })),
    ...(plan.milestones?.personal || []).map((m: Record<string, unknown>) => ({ ...m, pillar: 'personal' })),
  ]
  if (allMilestones.length) {
    const deleteRes = await supabase.from('milestones').delete().eq('user_id', userId)
    if (deleteRes.error) {
      console.error('Plan generation: milestones delete failed:', deleteRes.error)
      return { ok: false, error: 'Failed to reset milestones', status: 500 }
    }

    const insertRes = await supabase.from('milestones').insert(
      allMilestones.map(m => ({
        user_id: userId,
        month_target: m.month as number,
        title: m.title as string,
        description: m.description as string,
        pillar: m.pillar as string,
        tags: m.tags || [],
      }))
    )
    if (insertRes.error) {
      console.error('Plan generation: milestones insert failed:', insertRes.error)
      return { ok: false, error: 'Failed to save milestones', status: 500 }
    }
  }

  // Only flip onboarding_complete once every write above has succeeded — the
  // /onboarding/generating page polls this flag and redirects when it flips.
  const completeRes = await supabase
    .from('users')
    .update({ onboarding_complete: true })
    .eq('id', userId)

  if (completeRes.error) {
    console.error('Plan generation: onboarding_complete update failed:', completeRes.error)
    return { ok: false, error: 'Failed to mark onboarding complete', status: 500 }
  }

  return { ok: true }
}
