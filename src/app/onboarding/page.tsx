'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function OnboardingPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [started, setStarted] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(content: string) {
    const updated = [...messages, { role: 'user' as const, content }]
    setMessages(updated)
    setInput('')
    setLoading(true)

    const res = await fetch('/api/ai/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: updated }),
    })

    const data = await res.json()

    if (data.complete) {
      // Plan generation starts — redirect to loading state
      router.push('/onboarding/generating')
      return
    }

    setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
    setLoading(false)
  }

  async function startInterview() {
    setStarted(true)
    setLoading(true)
    const res = await fetch('/api/ai/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [], start: true }),
    })
    const data = await res.json()
    setMessages([{ role: 'assistant', content: data.message }])
    setLoading(false)
  }

  if (!started) {
    return (
      <main className="min-h-screen bg-ink flex items-center justify-center px-6">
        <div className="max-w-lg w-full text-center space-y-8">
          <div className="space-y-3">
            <p className="font-mono text-xs text-muted tracking-widest uppercase">HabitDx · Onboarding</p>
            <h1 className="font-display text-4xl text-white">
              Let&apos;s build your<br />
              <span className="text-gold">18-month picture.</span>
            </h1>
          </div>
          <p className="text-muted leading-relaxed">
            I&apos;m going to ask you some questions — one at a time.
            There are no right answers. The more honest you are, the more useful your plan will be.
            Takes about 8–12 minutes.
          </p>
          <div className="grid grid-cols-2 gap-3 text-left">
            {[
              ['Daily life', 'What does a winning day look like?'],
              ['Physical', 'Where are you starting, where do you want to be?'],
              ['Relationships', 'Partner, family, social life'],
              ['Work + money', '18-month picture'],
            ].map(([title, sub]) => (
              <div key={title} className="bg-ink-mid rounded-lg p-4 space-y-1">
                <p className="font-mono text-xs text-gold tracking-wide">{title}</p>
                <p className="text-muted text-xs">{sub}</p>
              </div>
            ))}
          </div>
          <button
            onClick={startInterview}
            className="bg-gold text-ink font-semibold px-8 py-4 rounded-lg hover:bg-gold-light transition-colors text-sm w-full"
          >
            Begin interview
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-ink flex flex-col">
      {/* Header */}
      <div className="border-b border-ink-soft px-6 py-4 flex items-center justify-between">
        <p className="font-mono text-xs text-muted tracking-widest uppercase">HabitDx · Onboarding</p>
        <div className="flex gap-1">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-ink-soft" />
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6 max-w-2xl mx-auto w-full">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-lg rounded-2xl px-5 py-4 text-sm leading-relaxed ${
              m.role === 'user'
                ? 'bg-gold text-ink'
                : 'bg-ink-mid text-white border border-ink-soft'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-ink-mid border border-ink-soft rounded-2xl px-5 py-4">
              <div className="flex gap-1.5 items-center">
                <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-ink-soft px-6 py-4">
        <div className="max-w-2xl mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && input.trim() && sendMessage(input.trim())}
            placeholder="Your answer..."
            disabled={loading}
            className="flex-1 bg-ink-mid border border-ink-soft rounded-lg px-4 py-3 text-white placeholder-muted text-sm focus:outline-none focus:border-gold transition-colors disabled:opacity-50"
          />
          <button
            onClick={() => input.trim() && sendMessage(input.trim())}
            disabled={loading || !input.trim()}
            className="bg-gold text-ink px-5 py-3 rounded-lg font-semibold text-sm hover:bg-gold-light transition-colors disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </main>
  )
}
