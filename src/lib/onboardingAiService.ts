import { getAccessTokenForEdgeFunctions, supabase } from './supabase';
import type { OnboardingData } from '../stores/onboardingStore';

export type ChatTurn = { role: 'user' | 'assistant'; content: string };

export async function sendOnboardingCoachMessage(messages: ChatTurn[]): Promise<string> {
  const accessToken = await getAccessTokenForEdgeFunctions();
  const { data, error } = await supabase.functions.invoke('onboarding-chat', {
    body: { action: 'message', messages },
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (error) {
    let detail = error.message;
    if (error.context && typeof (error.context as { json?: () => Promise<unknown> }).json === 'function') {
      try {
        const body = await (error.context as { json: () => Promise<{ error?: string }> }).json();
        detail = body?.error ?? detail;
      } catch {
        /* ignore */
      }
    }
    throw new Error(detail);
  }

  const reply = (data as { reply?: string })?.reply;
  if (!reply) {
    throw new Error('No reply from coach');
  }
  return reply;
}

export async function finalizeOnboardingFromTranscript(messages: ChatTurn[]): Promise<Record<string, unknown>> {
  const accessToken = await getAccessTokenForEdgeFunctions();
  const { data, error } = await supabase.functions.invoke('onboarding-chat', {
    body: { action: 'finalize', messages },
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (error) {
    let detail = error.message;
    if (error.context && typeof (error.context as { json?: () => Promise<unknown> }).json === 'function') {
      try {
        const body = await (error.context as { json: () => Promise<{ error?: string }> }).json();
        detail = body?.error ?? detail;
      } catch {
        /* ignore */
      }
    }
    throw new Error(detail);
  }

  const extracted = (data as { extracted?: Record<string, unknown> })?.extracted;
  if (!extracted || typeof extracted !== 'object') {
    throw new Error('Invalid extraction response');
  }
  return extracted;
}

const PEAK = new Set(['morning', 'afternoon', 'evening', 'varies']);

/** Map edge JSON to onboarding store shape; coerces invalid values. */
export function mapExtractedToOnboardingData(raw: Record<string, unknown>): OnboardingData {
  const past = raw.past_failures;
  const pastFailures = Array.isArray(past)
    ? past.filter((x): x is string => typeof x === 'string' && x.trim().length > 0).slice(0, 12)
    : [];

  const failureDescription =
    typeof raw.failure_description === 'string' ? raw.failure_description.trim() : '';

  let peak_energy = typeof raw.peak_energy === 'string' ? raw.peak_energy : 'varies';
  if (!PEAK.has(peak_energy)) {
    peak_energy = 'varies';
  }

  const sched = raw.schedule_type;
  const schedule_type = Array.isArray(sched)
    ? sched.filter((x): x is string => typeof x === 'string' && x.length > 0).slice(0, 6)
    : [];

  const obs = raw.obstacles;
  const obstacles = Array.isArray(obs)
    ? obs.filter((x): x is string => typeof x === 'string' && x.length > 0).slice(0, 8)
    : [];

  const g = raw.goals;
  const goals = Array.isArray(g)
    ? g.filter((x): x is string => typeof x === 'string' && x.length > 0).slice(0, 3)
    : [];

  const motivation = typeof raw.motivation === 'string' ? raw.motivation.trim() : '';

  const notificationsEnabled =
    typeof raw.notifications_enabled === 'boolean' ? raw.notifications_enabled : true;

  return {
    pastFailures: pastFailures.length ? pastFailures : ['Habit building'],
    failureDescription:
      failureDescription.length >= 20
        ? failureDescription
        : `${failureDescription} I want to build habits that fit my real life, not an ideal one.`.slice(0, 500),
    constraints: {
      peak_energy: peak_energy as OnboardingData['constraints']['peak_energy'],
      schedule_type: schedule_type.length ? schedule_type : ['Freelance/irregular'],
      obstacles: obstacles.length ? obstacles : ['Lack of time'],
    },
    goals: goals.length ? goals : ['Personal growth'],
    motivation:
      motivation.length >= 20
        ? motivation
        : 'I want sustainable change that respects how my weeks actually go.'.slice(0, 300),
    notificationsEnabled,
  };
}
