import { createGatewayProvider } from '@ai-sdk/gateway'
import { anthropic } from '@ai-sdk/anthropic'

// On Vercel (VERCEL=1), the gateway uses OIDC auth automatically — no API key needed.
// Locally, set VERCEL_AI_GATEWAY_API_KEY or ANTHROPIC_API_KEY in .env.local.
function getGateway() {
  const isVercel = process.env.VERCEL === '1'
  const gatewayKey = process.env.VERCEL_AI_GATEWAY_API_KEY?.trim() || process.env.AI_GATEWAY_API_KEY?.trim()

  if (isVercel || gatewayKey) {
    return createGatewayProvider({ apiKey: gatewayKey })
  }
  return null
}

let _gateway: ReturnType<typeof createGatewayProvider> | null = null

export function getAIGateway() {
  if (!_gateway) _gateway = getGateway()
  return _gateway
}

// Model IDs for direct Anthropic SDK (local fallback)
export const DIRECT_MODELS = {
  plan: 'claude-sonnet-4-6',
  checkin: 'claude-haiku-4-5-20251001',
} as const

// Gateway model IDs (prefixed for routing)
export const GATEWAY_MODELS = {
  plan: 'anthropic/claude-sonnet-4-6',
  checkin: 'anthropic/claude-haiku-4-5-20251001',
} as const

/**
 * Returns the right model reference depending on environment.
 * Gateway (Vercel OIDC or gateway key) takes priority; falls back to direct Anthropic.
 */
export function getModel(tier: 'plan' | 'checkin') {
  const gateway = getAIGateway()
  if (gateway) {
    return gateway(GATEWAY_MODELS[tier])
  }
  // Direct Anthropic fallback (requires ANTHROPIC_API_KEY)
  return anthropic(DIRECT_MODELS[tier])
}
