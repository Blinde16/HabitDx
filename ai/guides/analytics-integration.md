# Analytics Integration Guide

## Overview

Analytics are critical for validating HabitDx's core value proposition and understanding user behavior. This guide covers setup and implementation for tracking key metrics that prove (or disprove) the Insight Flywheel hypothesis.

## Analytics Provider Options

### Comparison

| Provider | Pros | Cons | Cost (100 users) |
|----------|------|------|------------------|
| **Mixpanel** | Event-based, user profiles, funnels | Complex pricing | $0 (free tier) |
| **Amplitude** | Behavioral analytics, retention curves | Learning curve | $0 (free tier) |
| **PostHog** | Open-source, self-hostable, session replay | Newer, less mature | $0 (free tier) |
| **Segment** | Multi-destination, clean API | Overkill for MVP | $0 (free tier) |

### Recommendation: PostHog

For HabitDx MVP, **PostHog** is recommended because:
- Free tier is generous (1M events/month)
- Session replay helps understand UX issues
- Feature flags for A/B testing
- Self-hostable if needed later
- Clean React Native SDK

## PostHog Setup

### Install PostHog

```bash
npm install posthog-react-native expo-file-system expo-application expo-localization
```

### Configure PostHog

```typescript
// src/lib/analytics.ts
import PostHog from 'posthog-react-native';

let posthog: PostHog | null = null;

export async function initializeAnalytics() {
  posthog = await PostHog.initAsync(
    process.env.EXPO_PUBLIC_POSTHOG_API_KEY!,
    {
      host: 'https://app.posthog.com', // or self-hosted URL
      captureApplicationLifecycleEvents: true,
      captureDeepLinks: true,
      enableSessionReplay: true, // Optional: record user sessions
    }
  );
  
  return posthog;
}

export function getPostHog(): PostHog {
  if (!posthog) {
    throw new Error('PostHog not initialized');
  }
  return posthog;
}
```

### Initialize in App

```typescript
// src/app/_layout.tsx
import { initializeAnalytics } from '@/lib/analytics';

export default function RootLayout() {
  useEffect(() => {
    initializeAnalytics();
  }, []);
  
  // ... rest of layout
}
```

## Core Tracking Events

### Event Taxonomy

```typescript
// src/types/analytics.ts
export type AnalyticsEvent =
  // Onboarding
  | 'onboarding_started'
  | 'onboarding_step_completed'
  | 'onboarding_completed'
  | 'failure_profile_viewed'
  | 'habit_stack_viewed'
  
  // Daily Usage
  | 'app_opened'
  | 'habit_checked_in'
  | 'habit_marked_incomplete'
  | 'obstacle_logged'
  
  // Weekly Iteration
  | 'weekly_insight_viewed'
  | 'adjustment_accepted'
  | 'adjustment_declined'
  
  // Settings
  | 'notification_enabled'
  | 'notification_disabled'
  | 'constraints_updated'
  | 'habits_regenerated';

export interface EventProperties {
  // User properties
  user_id?: string;
  energy_pattern?: 'morning' | 'afternoon' | 'evening';
  life_constraints?: string[];
  
  // Habit properties
  habit_id?: string;
  habit_name?: string;
  habit_age_days?: number;
  
  // Session properties
  session_duration?: number;
  screen_name?: string;
  
  // Outcome properties
  completion_rate_7d?: number;
  active_habits_count?: number;
}
```

### Track Function

```typescript
// src/lib/analytics.ts (continued)
export function trackEvent(
  event: AnalyticsEvent,
  properties?: EventProperties
) {
  try {
    const posthog = getPostHog();
    posthog.capture(event, properties);
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
}

// Identify user (call after authentication)
export function identifyUser(userId: string, traits?: Record<string, any>) {
  try {
    const posthog = getPostHog();
    posthog.identify(userId, traits);
  } catch (error) {
    console.error('Analytics identify error:', error);
  }
}

// Track screen view
export function trackScreen(screenName: string, properties?: EventProperties) {
  try {
    const posthog = getPostHog();
    posthog.screen(screenName, properties);
  } catch (error) {
    console.error('Analytics screen tracking error:', error);
  }
}
```

## Key Metrics to Track

### MVP Success Metrics

These metrics validate the core hypothesis of the Insight Flywheel:

1. **Onboarding Completion Rate**
   - % of users who complete full onboarding
   - Drop-off at each step

2. **Failure Profile Engagement**
   - Time spent viewing failure profile
   - "Finally, someone gets it" sentiment

3. **Daily Active Rate**
   - % of users checking in daily
   - Day 1, Day 7, Day 14 retention

4. **Completion Rate**
   - % of habits completed per day
   - Trend over time (should increase if Flywheel works)

5. **Weekly Insight Acceptance**
   - % of adjustments accepted vs declined
   - Impact on next week's completion rate

6. **Time to First Success**
   - Days until user hits 80%+ weekly completion

### Implementation

```typescript
// src/lib/analytics.ts (continued)

// Track onboarding
export function trackOnboardingStep(step: number, totalSteps: number) {
  trackEvent('onboarding_step_completed', {
    step,
    total_steps: totalSteps,
    progress_percent: (step / totalSteps) * 100,
  });
}

// Track habit check-in
export function trackHabitCheckIn(
  habitId: string,
  habitName: string,
  completed: boolean,
  obstacle?: string
) {
  trackEvent(completed ? 'habit_checked_in' : 'habit_marked_incomplete', {
    habit_id: habitId,
    habit_name: habitName,
    obstacle,
  });
}

// Track weekly insight
export function trackWeeklyInsight(
  iterationId: string,
  completionRate: number,
  adjustmentType: string,
  action: 'viewed' | 'accepted' | 'declined'
) {
  trackEvent(
    action === 'viewed' 
      ? 'weekly_insight_viewed' 
      : action === 'accepted' 
        ? 'adjustment_accepted' 
        : 'adjustment_declined',
    {
      iteration_id: iterationId,
      completion_rate_7d: completionRate,
      adjustment_type: adjustmentType,
    }
  );
}

// Calculate and track user metrics
export async function trackUserMetrics(userId: string) {
  const supabase = getSupabase();
  
  // Fetch last 7 days of logs
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const { data: logs } = await supabase
    .from('habit_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('check_in_date', sevenDaysAgo.toISOString());
  
  const completionRate = logs
    ? (logs.filter(l => l.completed).length / logs.length) * 100
    : 0;
  
  const { data: habits } = await supabase
    .from('habits')
    .select('id')
    .eq('user_id', userId)
    .eq('is_active', true);
  
  // Set user properties
  const posthog = getPostHog();
  posthog.setPersonProperties({
    completion_rate_7d: completionRate,
    active_habits_count: habits?.length || 0,
  });
}
```

## Screen Tracking

### Automatic Screen Tracking with Expo Router

```typescript
// src/hooks/useAnalytics.ts
import { useEffect } from 'react';
import { usePathname } from 'expo-router';
import { trackScreen } from '@/lib/analytics';

export function useScreenTracking() {
  const pathname = usePathname();
  
  useEffect(() => {
    // Convert pathname to readable screen name
    const screenName = pathname
      .split('/')
      .filter(Boolean)
      .join('_') || 'home';
    
    trackScreen(screenName);
  }, [pathname]);
}
```

```typescript
// Use in _layout.tsx
export default function RootLayout() {
  useScreenTracking();
  
  return (
    // ... layout
  );
}
```

## Event Hooks

### Custom Hook for Event Tracking

```typescript
// src/hooks/useAnalytics.ts (continued)
export function useAnalytics() {
  const trackOnboarding = (step: number) => {
    trackEvent('onboarding_step_completed', { step });
  };
  
  const trackHabitAction = (
    habitId: string,
    action: 'checked_in' | 'marked_incomplete',
    obstacle?: string
  ) => {
    trackEvent(
      action === 'checked_in' ? 'habit_checked_in' : 'habit_marked_incomplete',
      { habit_id: habitId, obstacle }
    );
  };
  
  return {
    trackOnboarding,
    trackHabitAction,
    trackEvent,
    trackScreen,
  };
}
```

### Usage in Components

```typescript
// src/components/HabitCard.tsx
import { useAnalytics } from '@/hooks/useAnalytics';

export function HabitCard({ habit, onCheckIn }) {
  const analytics = useAnalytics();
  
  const handleCheckIn = () => {
    onCheckIn();
    analytics.trackHabitAction(habit.id, 'checked_in');
  };
  
  return (
    <Pressable onPress={handleCheckIn}>
      {/* ... */}
    </Pressable>
  );
}
```

## Funnel Analysis

### Onboarding Funnel

Track drop-off at each onboarding step:

```typescript
// PostHog Dashboard - Create Funnel
// 1. onboarding_started
// 2. onboarding_step_completed (step=1)
// 3. onboarding_step_completed (step=2)
// 4. onboarding_step_completed (step=3)
// 5. onboarding_step_completed (step=4)
// 6. onboarding_step_completed (step=5)
// 7. failure_profile_viewed
// 8. habit_stack_viewed
```

### Insight Flywheel Funnel

Track the core loop:

```typescript
// PostHog Dashboard - Create Funnel
// 1. habit_stack_viewed
// 2. habit_checked_in (within 24 hours)
// 3. habit_checked_in (within 7 days, 3+ times)
// 4. weekly_insight_viewed
// 5. adjustment_accepted
// 6. habit_checked_in (next 7 days, 4+ times)
```

## Cohort Analysis

### Define Cohorts

```typescript
// Example cohorts in PostHog
const cohorts = {
  'High Completers': 'completion_rate_7d > 70',
  'Struggling Users': 'completion_rate_7d < 30',
  'Active Users': 'app_opened in last 7 days',
  'Morning People': 'energy_pattern = morning',
  'Adjustment Accepters': 'adjustment_accepted count > 0',
};
```

## A/B Testing with Feature Flags

### Setup Feature Flags

```typescript
// src/lib/analytics.ts (continued)
export async function getFeatureFlag(flagKey: string): Promise<boolean> {
  try {
    const posthog = getPostHog();
    return await posthog.isFeatureEnabled(flagKey);
  } catch (error) {
    console.error('Feature flag error:', error);
    return false;
  }
}

export async function getFeatureFlagPayload(flagKey: string): Promise<any> {
  try {
    const posthog = getPostHog();
    return await posthog.getFeatureFlagPayload(flagKey);
  } catch (error) {
    console.error('Feature flag payload error:', error);
    return null;
  }
}
```

### Example: Test Different Onboarding Styles

```typescript
// src/screens/onboarding/OnboardingIntro.tsx
import { getFeatureFlag } from '@/lib/analytics';

export default function OnboardingIntro() {
  const [variant, setVariant] = useState<'control' | 'conversational'>('control');
  
  useEffect(() => {
    async function loadVariant() {
      const useConversational = await getFeatureFlag('conversational-onboarding');
      setVariant(useConversational ? 'conversational' : 'control');
    }
    loadVariant();
  }, []);
  
  return variant === 'conversational' 
    ? <ConversationalOnboarding />
    : <StandardOnboarding />;
}
```

## Dashboard Setup

### PostHog Dashboard

Create a dashboard with these insights:

1. **Overview**
   - DAU/MAU ratio
   - New signups (last 7 days)
   - Onboarding completion rate

2. **Engagement**
   - Daily check-ins per user
   - Average completion rate
   - Time in app per session

3. **Retention**
   - Day 1, 7, 14, 30 retention curves
   - Cohort retention table

4. **Insight Flywheel**
   - Weekly insights delivered
   - Adjustment acceptance rate
   - Before/after completion rates

5. **Technical**
   - Error rates
   - Screen load times
   - API response times

## Privacy & Compliance

### GDPR Considerations

```typescript
// src/lib/analytics.ts (continued)
export function optOutAnalytics() {
  const posthog = getPostHog();
  posthog.optOut();
}

export function optInAnalytics() {
  const posthog = getPostHog();
  posthog.optIn();
}

export async function deleteUserData(userId: string) {
  // PostHog GDPR delete request
  const posthog = getPostHog();
  await posthog.reset();
  
  // Also delete from your database
  await supabase.rpc('delete_user_data', { user_id: userId });
}
```

### Consent Banner

```typescript
// src/components/AnalyticsConsent.tsx
import { View, Text, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function AnalyticsConsent() {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    checkConsent();
  }, []);
  
  async function checkConsent() {
    const consent = await AsyncStorage.getItem('analytics_consent');
    if (!consent) {
      setVisible(true);
    } else {
      consent === 'granted' ? optInAnalytics() : optOutAnalytics();
    }
  }
  
  async function handleAccept() {
    await AsyncStorage.setItem('analytics_consent', 'granted');
    optInAnalytics();
    setVisible(false);
  }
  
  async function handleDecline() {
    await AsyncStorage.setItem('analytics_consent', 'declined');
    optOutAnalytics();
    setVisible(false);
  }
  
  if (!visible) return null;
  
  return (
    <View>
      <Text>We use analytics to improve your experience.</Text>
      <Button title="Accept" onPress={handleAccept} />
      <Button title="Decline" onPress={handleDecline} />
    </View>
  );
}
```

## Performance Considerations

### Batch Events

```typescript
// Queue events and send in batches
class AnalyticsQueue {
  private queue: Array<{ event: string; properties: any }> = [];
  private batchSize = 10;
  
  add(event: string, properties: any) {
    this.queue.push({ event, properties });
    
    if (this.queue.length >= this.batchSize) {
      this.flush();
    }
  }
  
  flush() {
    const posthog = getPostHog();
    this.queue.forEach(({ event, properties }) => {
      posthog.capture(event, properties);
    });
    this.queue = [];
  }
}
```

### Debounce Frequent Events

```typescript
import { debounce } from 'lodash';

// Don't track every keystroke
const trackSearchDebounced = debounce((query: string) => {
  trackEvent('search_performed', { query });
}, 1000);
```

## Testing

### Test Events in Development

```typescript
// src/lib/analytics.ts (continued)
const IS_DEV = __DEV__;

export function trackEvent(event: AnalyticsEvent, properties?: EventProperties) {
  if (IS_DEV) {
    console.log('[Analytics]', event, properties);
  }
  
  try {
    const posthog = getPostHog();
    posthog.capture(event, properties);
  } catch (error) {
    console.error('Analytics error:', error);
  }
}
```

### Verify Events in PostHog

1. Go to PostHog dashboard
2. Click "Live Events"
3. Trigger event in app
4. Verify event appears with correct properties

## Cost Management

### PostHog Free Tier Limits

- 1M events/month
- Unlimited users
- 3 months data retention

### Stay Within Limits

1. **Don't track everything** - Focus on MVP metrics
2. **Sample high-frequency events** - e.g., only track 10% of screen views
3. **Aggregate where possible** - Daily summaries instead of per-event

```typescript
// Sample 10% of screen views
export function trackScreen(screenName: string) {
  if (Math.random() < 0.1) { // 10% sample
    const posthog = getPostHog();
    posthog.screen(screenName);
  }
}
```

## Alternative: Mixpanel

If you prefer Mixpanel over PostHog:

```bash
npm install mixpanel-react-native
```

```typescript
// src/lib/analytics.ts (Mixpanel version)
import { Mixpanel } from 'mixpanel-react-native';

let mixpanel: Mixpanel | null = null;

export async function initializeAnalytics() {
  mixpanel = await Mixpanel.init(process.env.EXPO_PUBLIC_MIXPANEL_TOKEN!);
  return mixpanel;
}

export function trackEvent(event: string, properties?: any) {
  mixpanel?.track(event, properties);
}

export function identifyUser(userId: string, traits?: any) {
  mixpanel?.identify(userId);
  if (traits) {
    mixpanel?.getPeople().set(traits);
  }
}
```

## Next Steps

1. Create PostHog account and get API key
2. Initialize PostHog in app
3. Implement core event tracking
4. Set up PostHog dashboard
5. Define success metrics
6. Monitor onboarding funnel
7. Track Insight Flywheel effectiveness

## References

- [PostHog Documentation](https://posthog.com/docs)
- [PostHog React Native SDK](https://posthog.com/docs/libraries/react-native)
- [Mixpanel React Native](https://github.com/mixpanel/mixpanel-react-native)
- [Amplitude React Native](https://www.docs.developers.amplitude.com/data/sdks/typescript-react-native/)
