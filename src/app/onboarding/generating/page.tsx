'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function GeneratingPage() {
  const router = useRouter()

  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch('/api/ai/plan-status')
      const data = await res.json()
      if (data.ready) {
        clearInterval(interval)
        router.push('/dashboard')
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [router])

  return (
    <main className="min-h-screen bg-ink flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-4">
          <p className="font-mono text-xs text-muted tracking-widest uppercase">Building your plan</p>
          <h1 className="font-display text-3xl text-white">
            Generating your<br />
            <span className="text-gold">18-month picture.</span>
          </h1>
          <p className="text-muted text-sm leading-relaxed">
            Writing your shadow vision, building your calendar,
            selecting your reading list, mapping your milestones.
            Takes about 30 seconds.
          </p>
        </div>

        {/* Progress indicators */}
        <div className="space-y-3 text-left">
          {[
            'Shadow vision statement',
            'Daily template',
            '18-month calendar',
            'Gym program',
            'Reading list (18 books)',
            'Milestone timeline',
          ].map((item, i) => (
            <div key={item} className="flex items-center gap-3">
              <div
                className="w-2 h-2 rounded-full bg-gold animate-pulse"
                style={{ animationDelay: `${i * 200}ms` }}
              />
              <span className="text-muted text-xs font-mono">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
