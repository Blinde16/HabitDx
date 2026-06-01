import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardShell from '@/components/layout/DashboardShell'
import VisionView from '@/components/views/VisionView'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: userData }, { data: profile }, { data: plans }] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase.from('profiles').select('*').eq('user_id', user.id).single(),
    supabase.from('monthly_plans').select('*').eq('user_id', user.id).order('month_number'),
  ])

  if (!userData?.onboarding_complete) redirect('/onboarding')

  return (
    <DashboardShell user={userData}>
      <VisionView profile={profile} monthlyPlans={plans ?? []} />
    </DashboardShell>
  )
}
