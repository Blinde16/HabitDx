/**
 * Minimal fixed-window rate limiter.
 *
 * IMPORTANT: this is PER SERVER INSTANCE and in-memory only. On Vercel (or any
 * multi-instance / serverless deployment) each lambda has its own map, and the
 * counters reset on cold start, so the effective global limit is
 * `limit * number_of_live_instances`. It is a cheap brake on a single client
 * hammering an expensive model call — not a security boundary.
 *
 * Move this to a shared store (Upstash Redis or Vercel KV) when real enforcement
 * is needed; the `checkRateLimit` signature is designed to stay the same.
 */

interface RateWindow {
  count: number
  resetAt: number
}

const windows = new Map<string, RateWindow>()

// Cheap opportunistic sweep so the map cannot grow without bound.
function sweep(now: number) {
  if (windows.size < 5000) return
  windows.forEach((win, key) => {
    if (win.resetAt <= now) windows.delete(key)
  })
}

export interface RateLimitResult {
  allowed: boolean
  /** Seconds until the current window resets — suitable for a Retry-After header. */
  retryAfter: number
}

/**
 * @param key    Identity to bucket on. Always use a server-derived value (e.g. the
 *               authenticated user id) — never a client-supplied header.
 * @param limit  Max requests allowed per window.
 * @param windowMs Window length in milliseconds.
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  sweep(now)

  const existing = windows.get(key)

  if (!existing || existing.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, retryAfter: 0 }
  }

  if (existing.count >= limit) {
    return { allowed: false, retryAfter: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)) }
  }

  existing.count += 1
  return { allowed: true, retryAfter: 0 }
}
