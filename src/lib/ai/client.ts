import Anthropic from '@anthropic-ai/sdk'

// Singleton for server-side use only
let _client: Anthropic | null = null

export function getAnthropicClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return _client
}

export const MODELS = {
  plan: 'claude-sonnet-4-6-20251001',   // Plan generation + on-demand chat
  checkin: 'claude-haiku-4-5-20251001', // Weekly check-ins (cheaper)
} as const
