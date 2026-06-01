'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    router.push('/dashboard')
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <main className="min-h-screen bg-ink flex items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <p className="font-mono text-xs text-muted tracking-widest uppercase">HabitDx</p>
          <h1 className="font-display text-3xl text-white">Welcome back.</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full bg-ink-mid border border-ink-soft rounded-lg px-4 py-3 text-white placeholder-muted text-sm focus:outline-none focus:border-gold transition-colors"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full bg-ink-mid border border-ink-soft rounded-lg px-4 py-3 text-white placeholder-muted text-sm focus:outline-none focus:border-gold transition-colors"
          />
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold text-ink font-semibold py-3 rounded-lg hover:bg-gold-light transition-colors text-sm disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-ink-soft" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-ink px-3 text-muted">or</span>
          </div>
        </div>

        <button
          onClick={handleGoogle}
          className="w-full border border-ink-soft text-muted py-3 rounded-lg hover:border-muted transition-colors text-sm"
        >
          Continue with Google
        </button>

        <p className="text-center text-muted text-xs">
          No account yet?{' '}
          <Link href="/auth/signup" className="text-gold hover:text-gold-light">
            Start your interview
          </Link>
        </p>
      </div>
    </main>
  )
}
