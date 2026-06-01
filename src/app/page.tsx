import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-ink flex flex-col items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center space-y-8">

        <p className="font-mono text-xs tracking-widest text-muted uppercase">
          Linde Systems · HabitDx
        </p>

        <h1 className="font-display text-5xl md:text-7xl text-white leading-tight">
          Build the life<br />
          <span className="text-gold">you&apos;re becoming.</span>
        </h1>

        <p className="text-muted text-lg md:text-xl leading-relaxed max-w-lg mx-auto">
          Not a habit tracker. Not a vision board.
          A specific, operational picture of who you are at month 18 —
          built from a real conversation with AI.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          {[
            { label: 'Family', color: 'text-green' },
            { label: 'Body', color: 'text-blue' },
            { label: 'Mind', color: 'text-purple' },
            { label: 'Work', color: 'text-gold' },
          ].map(p => (
            <div key={p.label} className="bg-ink-mid rounded-lg px-4 py-3 font-mono text-xs tracking-wide">
              <span className={p.color}>{p.label}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link
            href="/auth/signup"
            className="bg-gold text-ink font-semibold px-8 py-4 rounded-lg hover:bg-gold-light transition-colors text-sm tracking-wide"
          >
            Start your interview
          </Link>
          <Link
            href="/auth/login"
            className="border border-ink-soft text-muted px-8 py-4 rounded-lg hover:border-muted transition-colors text-sm tracking-wide"
          >
            Sign in
          </Link>
        </div>

        <p className="font-mono text-xs text-muted">
          8–12 minute onboarding. No forms. Just a conversation.
        </p>
      </div>
    </main>
  )
}
