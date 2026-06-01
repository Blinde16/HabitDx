import type { PillarSummaries } from '@/types/database'

const PILLAR_COLORS = {
  family: { bg: 'bg-green/10', border: 'border-green/30', text: 'text-green', label: 'Family' },
  body: { bg: 'bg-blue/10', border: 'border-blue/30', text: 'text-blue', label: 'Body' },
  mind: { bg: 'bg-purple/10', border: 'border-purple/30', text: 'text-purple', label: 'Mind' },
  work: { bg: 'bg-gold/10', border: 'border-gold/30', text: 'text-gold', label: 'Work' },
} as const

export default function VisionView({
  profile,
  monthlyPlans,
}: {
  profile: { shadow_vision: string | null; pillars: PillarSummaries | null } | null
  monthlyPlans: unknown[]
}) {
  if (!profile?.shadow_vision) {
    return (
      <div className="flex items-center justify-center h-64 text-muted text-sm">
        Your plan is still generating...
      </div>
    )
  }

  const paragraphs = profile.shadow_vision
    .split('\n\n')
    .filter(Boolean)

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">

      {/* Shadow Vision Statement */}
      <section className="space-y-6">
        <p className="font-mono text-xs text-muted tracking-widest uppercase">Shadow Vision · Month 18</p>
        <div className="space-y-5">
          {paragraphs.map((p, i) => (
            <p
              key={i}
              className={`leading-relaxed ${i === 0 ? 'font-display text-2xl md:text-3xl text-white' : 'text-muted text-base md:text-lg'}`}
            >
              {p}
            </p>
          ))}
        </div>
      </section>

      {/* Pillar Cards */}
      {profile.pillars && (
        <section className="space-y-4">
          <p className="font-mono text-xs text-muted tracking-widest uppercase">Four Pillars</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(Object.keys(PILLAR_COLORS) as Array<keyof typeof PILLAR_COLORS>).map(key => {
              const pillar = profile.pillars![key]
              const style = PILLAR_COLORS[key]
              if (!pillar) return null
              return (
                <div key={key} className={`${style.bg} border ${style.border} rounded-xl p-6 space-y-3`}>
                  <div className="flex items-center justify-between">
                    <p className={`font-mono text-xs tracking-widest uppercase ${style.text}`}>{style.label}</p>
                    <p className={`font-display text-2xl ${style.text}`}>
                      {pillar.headline_metric}
                      <span className="text-sm ml-1 opacity-70">{pillar.unit}</span>
                    </p>
                  </div>
                  <p className="text-muted text-sm leading-relaxed">{pillar.description}</p>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Plan preview */}
      <section className="space-y-3">
        <p className="font-mono text-xs text-muted tracking-widest uppercase">
          {monthlyPlans.length} months planned
        </p>
        <p className="text-muted text-sm">
          Switch to the <span className="text-white">18 Months</span> view to see your full calendar.
        </p>
      </section>
    </div>
  )
}
