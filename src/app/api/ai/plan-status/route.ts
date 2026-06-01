import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ ready: false })

  const { data } = await supabase
    .from('users')
    .select('onboarding_complete')
    .eq('id', user.id)
    .single()

  return NextResponse.json({ ready: data?.onboarding_complete ?? false })
}
