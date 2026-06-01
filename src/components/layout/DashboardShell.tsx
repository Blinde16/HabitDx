'use client'

import { useState } from 'react'
import Link from 'next/link'

type View = 'vision' | 'daily' | 'calendar' | 'milestones'

const NAV: { id: View; label: string }[] = [
  { id: 'vision', label: 'Vision' },
  { id: 'daily', label: 'Daily' },
  { id: 'calendar', label: '18 Months' },
  { id: 'milestones', label: 'Milestones' },
]

export default function DashboardShell({
  user,
  children,
}: {
  user: { name: string | null; subscription_tier: string }
  children: React.ReactNode
}) {
  const [activeView, setActiveView] = useState<View>('vision')

  return (
    <div className="min-h-screen bg-ink flex flex-col">
      {/* Top nav */}
      <header className="border-b border-ink-soft px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-display text-white text-lg">HabitDx</span>
          <nav className="hidden md:flex gap-1">
            {NAV.map(n => (
              <button
                key={n.id}
                onClick={() => setActiveView(n.id)}
                className={`font-mono text-xs tracking-wide px-4 py-2 rounded-lg transition-colors ${
                  activeView === n.id
                    ? 'bg-ink-soft text-white'
                    : 'text-muted hover:text-white'
                }`}
              >
                {n.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-muted">{user.name ?? 'You'}</span>
          <Link
            href="/dashboard/checkin"
            className="bg-gold text-ink font-semibold px-4 py-2 rounded-lg text-xs hover:bg-gold-light transition-colors"
          >
            Weekly check-in
          </Link>
        </div>
      </header>

      {/* Mobile nav */}
      <div className="md:hidden border-b border-ink-soft px-4 py-2 flex gap-1 overflow-x-auto">
        {NAV.map(n => (
          <button
            key={n.id}
            onClick={() => setActiveView(n.id)}
            className={`font-mono text-xs tracking-wide px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeView === n.id ? 'bg-ink-soft text-white' : 'text-muted'
            }`}
          >
            {n.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
