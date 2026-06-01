'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    router.push('/onboarding')
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
        <div className="text-center space-y-3">
          <p className="font-mono text-xs text-muted tracking-widest uppercase">HabitDx</p>
          <h1 className="font-display text-3xl text-white">Start your interview.</h1>
          <p className="text-muted text-sm">8–12 minutes. No forms. Just a real conversation.</p>
        </div>

        <button
          onClick={handleGoogle}
          className="w-full border border-ink-soft text-muted py-3 rounded-lg hover:border-muted transition-colors text-sm"
        >
          Continue with Google
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-ink-soft" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-ink px-3 text-muted">or</span>
          </div>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="text"
            placeholder="First name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="w-full bg-ink-mid border border-ink-soft rounded-lg px-4 py-3 text-white placeholder-muted text-sm focus:outline-none focus:border-gold transition-colors"
          />
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
            placeholder="Password (min 8 characters)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full bg-ink-mid border border-ink-soft rounded-lg px-4 py-3 text-white placeholder-muted text-sm focus:outline-none focus:border-gold transition-colors"
          />
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold text-ink font-semibold py-3 rounded-lg hover:bg-gold-light transition-colors text-sm disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-muted text-xs">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-gold hover:text-gold-light">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
