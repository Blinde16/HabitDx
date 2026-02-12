# Phase 9: Weekly Iteration AI

**Date Created:** February 9, 2026  
**Phase Duration:** 5-7 days  
**Dependencies:** Phase 8 (Push Notifications), Phase 7 (Check-in System)  
**Status:** Not Started

## Overview

Build the AI-powered weekly analysis system that reviews a user's habit check-in data and delivers ONE specific adjustment to improve their habits. This is the core value loop of HabitDx—intelligent iteration based on real behavior patterns.

## Goals

- Analyze week's worth of habit check-in data
- Identify patterns in successes and failures
- Generate one actionable adjustment suggestion
- Explain why the adjustment is recommended
- Allow users to accept or decline adjustments
- Track adjustment effectiveness over time

## Success Criteria

- [ ] Weekly analysis runs automatically every Monday (or user's chosen day)
- [ ] Analysis completes in <5 seconds
- [ ] Insights reference specific user data (not generic)
- [ ] 50%+ users accept adjustments (target metric)
- [ ] Adjustments feel helpful and personalized
- [ ] Users can view past insights
- [ ] Week 4 retention >20% (target metric)

## Weekly Iteration Flow

### 1. Data Collection (Automatic)

- Track 7 days of check-in data
- Calculate completion rates per habit
- Collect obstacles logged
- Note check-in times vs scheduled times

### 2. AI Analysis (Automatic)

- Analyze patterns (what's working, what's not)
- Identify root causes of failures
- Generate ONE specific adjustment
- Provide rationale for suggestion

### 3. User Review (Manual)

- Display weekly insight
- Show data summary (completion rates, patterns)
- Present adjustment suggestion
- Allow accept or decline
- Optionally add feedback

### 4. Implementation (Mixed)

- If accepted: Update habit details automatically
- Track implementation
- Monitor improvement in next week

## Weekly Insight Structure

```typescript
interface WeeklyIteration {
  id: string;
  user_id: string;
  stack_id: string;
  week_start_date: string; // Monday
  week_end_date: string; // Sunday
  created_at: string;

  // AI Analysis
  patterns_detected: string[]; // 2-3 observations
  success_rate: {
    [habitId: string]: {
      completed: number;
      total: number;
      percentage: number;
    };
  };
  adjustment_suggestion: string; // The ONE thing to change
  adjustment_rationale: string; // Why this adjustment

  // User interaction
  user_response: 'accepted' | 'declined' | 'pending';
  responded_at: string | null;

  // Implementation
  implemented: boolean;
  implementation_notes: string | null;
}
```

### Example Weekly Insight

```
📊 Your Week in Review
Week of Feb 2-8, 2026

WHAT WE NOTICED:
• Morning Pages: 6/7 days (86%) ✅
• Minimum Movement: 3/7 days (43%) ⚠️
• Weekend Anchor: 0/1 days (0%) ❌

PATTERNS:
• You're crushing weekday morning habits
• Exercise drops off after work (3 obstacles: "no time", "too tired")
• Weekend habits still not sticking

THIS WEEK'S ADJUSTMENT:
Move "Minimum Movement" to 8:00 AM (right after Morning Pages)

WHY THIS WORKS:
Your data shows you're most consistent in the morning (86% success rate).
By stacking Movement with your winning habit (Morning Pages), you'll catch
it when your willpower is highest. Evening exercise has failed 4 days in a
row—it's not a motivation issue, it's a timing issue.

[Accept Adjustment] [Decline]
```

## Technical Tasks

### 1. Create Weekly Iteration Edge Function

```typescript
// supabase/functions/weekly-iteration/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  // 1. Verify authentication (or run as cron job)
  // 2. Get user's active habits
  // 3. Fetch last 7 days of habit_logs
  // 4. Calculate success rates and patterns
  // 5. Fetch user's failure profile for context
  // 6. Construct AI prompt with data
  // 7. Call OpenAI API
  // 8. Parse and validate insight
  // 9. Save to weekly_iterations table
  // 10. Send notification to user
  // 11. Return insight
});
```

Tasks:

- [ ] Create `supabase/functions/weekly-iteration/` directory
- [ ] Initialize Deno function
- [ ] Fetch user's active habit stack
- [ ] Query habit_logs for past 7 days
- [ ] Calculate completion statistics
- [ ] Extract obstacles from logs
- [ ] Fetch failure profile for context
- [ ] Build AI prompt with data
- [ ] Call OpenAI API
- [ ] Parse and validate response
- [ ] Save to weekly_iterations table
- [ ] Trigger notification
- [ ] Deploy and test

### 2. Implement Data Analysis Functions

```typescript
// lib/analytics.ts
export const calculateWeeklyStats = (logs: HabitLog[], habits: Habit[]) => {
  const stats: Record<string, any> = {};

  habits.forEach((habit) => {
    const habitLogs = logs.filter((log) => log.habit_id === habit.id);
    const completed = habitLogs.filter((log) => log.completed).length;
    const total = habitLogs.length;

    stats[habit.id] = {
      habitTitle: habit.title,
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      obstacles: habitLogs
        .filter((log) => !log.completed && log.obstacle)
        .map((log) => log.obstacle),
    };
  });

  return stats;
};

export const detectPatterns = (stats: any) => {
  const patterns: string[] = [];

  // Pattern: High success on some habits
  // Pattern: Low success on others
  // Pattern: Obstacles repeating
  // Pattern: Weekend vs weekday differences
  // Pattern: Time-of-day patterns

  return patterns;
};
```

Tasks:

- [ ] Create calculateWeeklyStats function
- [ ] Calculate per-habit completion rates
- [ ] Extract obstacles from logs
- [ ] Create detectPatterns function
- [ ] Identify high-performing habits
- [ ] Identify struggling habits
- [ ] Detect repeating obstacles
- [ ] Compare weekday vs weekend success
- [ ] Detect time-of-day patterns

### 3. Design Weekly Iteration Prompt

```typescript
const constructIterationPrompt = (
  stats: WeeklyStats,
  habits: Habit[],
  profile: HabitFailureProfile,
  obstacles: string[]
) => {
  return `You are a habit coach analyzing a user's weekly performance.

USER'S FAILURE PROFILE:
${JSON.stringify(profile, null, 2)}

THIS WEEK'S DATA:
${habits
  .map((h) => {
    const stat = stats[h.id];
    return `
  ${h.title}:
  - Scheduled: ${h.frequency_type} at ${h.reminder_time}
  - Completion: ${stat.completed}/${stat.total} days (${stat.percentage}%)
  - Obstacles: ${stat.obstacles.join('; ') || 'none logged'}
  `;
  })
  .join('\n')}

TASK:
1. Identify 2-3 patterns from the data
2. Determine THE MOST IMPACTFUL adjustment (ONE thing to change)
3. Explain why this adjustment will work for THIS user

RULES:
- Be radically specific to this user's data
- Reference actual numbers (success rates, days completed, etc.)
- Adjustments can be:
  - Change habit timing
  - Change habit frequency
  - Reduce habit scope (make it smaller)
  - Add habit stacking (do habit X after Y)
  - Remove a habit temporarily
- Focus on quick wins (70%→85% is better than 30%→50%)
- Acknowledge what's working before suggesting fixes

Return ONLY valid JSON:
{
  "patterns_detected": string[], // 2-3 observations
  "adjustment_suggestion": string, // ONE specific change
  "adjustment_rationale": string, // Why this works for them
  "adjustment_type": "timing" | "frequency" | "scope" | "stacking" | "remove",
  "target_habit_id": string // Which habit to adjust
}`;
};
```

Tasks:

- [ ] Write initial prompt template
- [ ] Include failure profile context
- [ ] Include weekly stats and obstacles
- [ ] Define adjustment types
- [ ] Add specificity requirements
- [ ] Test prompt with sample data
- [ ] Iterate to reduce generic suggestions
- [ ] Optimize for token usage

### 4. Create Weekly Insights Screen

```
app/(tabs)/insights.tsx
```

UI Components:

- [ ] Header: "Your Weekly Insights"
- [ ] Current week section:
  - Week date range
  - "New Insight Available" badge
  - Tap to view
- [ ] Latest insight display:
  - Week summary (completion rates)
  - Patterns detected (bulleted list)
  - Adjustment suggestion (highlighted box)
  - Rationale explanation
  - Accept/Decline buttons
- [ ] Past insights list:
  - Previous weeks
  - Show what was adjusted
  - Show impact (did it help?)
- [ ] Empty state (first week)

Tasks:

- [ ] Create insights screen layout
- [ ] Fetch latest weekly_iteration
- [ ] Display success rates per habit
- [ ] Show patterns detected
- [ ] Display adjustment suggestion prominently
- [ ] Show rationale
- [ ] Add accept/decline buttons
- [ ] Fetch and display past insights
- [ ] Show empty state for new users

### 5. Build Insight Card Component

```typescript
// components/InsightCard.tsx
interface InsightCardProps {
  insight: WeeklyIteration;
  habits: Habit[];
  onAccept: () => void;
  onDecline: () => void;
}

export const InsightCard = ({ insight, habits, onAccept, onDecline }: Props) => {
  // Render insight with data visualization
};
```

Tasks:

- [ ] Create InsightCard component
- [ ] Display week date range
- [ ] Show completion rates (progress bars)
- [ ] List patterns detected
- [ ] Highlight adjustment suggestion
- [ ] Show rationale
- [ ] Add accept/decline buttons
- [ ] Handle pending/accepted/declined states
- [ ] Add visual indicators (icons, colors)

### 6. Implement Adjustment Application Logic

```typescript
// lib/adjustments.ts
export const applyAdjustment = async (insight: WeeklyIteration, habits: Habit[]) => {
  const targetHabit = habits.find((h) => h.id === insight.target_habit_id);

  if (!targetHabit) return;

  // Parse adjustment from AI suggestion
  // Update habit in database
  // Reschedule notifications
  // Mark insight as implemented
};
```

Adjustment types:

- **Timing:** Change reminder_time
- **Frequency:** Change frequency_days
- **Scope:** Update description to smaller version
- **Stacking:** Adjust timing to be right after another habit
- **Remove:** Set is_active = false temporarily

Tasks:

- [ ] Create applyAdjustment function
- [ ] Parse adjustment type and details
- [ ] Update habit record in database
- [ ] Reschedule notifications if timing changed
- [ ] Mark insight as implemented
- [ ] Log adjustment for tracking
- [ ] Handle errors gracefully

### 7. Create Weekly Iteration Store

```typescript
// stores/iterationStore.ts
interface IterationStore {
  currentInsight: WeeklyIteration | null;
  pastInsights: WeeklyIteration[];
  loading: boolean;

  fetchCurrentInsight: () => Promise<void>;
  fetchPastInsights: () => Promise<void>;
  acceptAdjustment: (insightId: string) => Promise<void>;
  declineAdjustment: (insightId: string, reason?: string) => Promise<void>;
}
```

Tasks:

- [ ] Create iteration Zustand store
- [ ] Implement fetchCurrentInsight
- [ ] Implement fetchPastInsights
- [ ] Implement acceptAdjustment
  - Apply adjustment to habit
  - Update insight.user_response = 'accepted'
  - Update insight.implemented = true
- [ ] Implement declineAdjustment
  - Update insight.user_response = 'declined'
  - Optionally log decline reason
- [ ] Add error handling
- [ ] Add loading states

### 8. Set Up Automated Weekly Cron Job

Using Supabase Edge Functions + pg_cron:

```sql
-- Schedule weekly iteration for all users
-- Runs every Monday at 6 AM
SELECT cron.schedule(
  'weekly-iteration-job',
  '0 6 * * 1', -- Every Monday at 6 AM
  $$
  SELECT
    net.http_post(
      url:='https://your-project.supabase.co/functions/v1/weekly-iteration',
      headers:='{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
      body:='{"user_id": "' || id || '"}'::jsonb
    )
  FROM auth.users
  WHERE created_at < NOW() - INTERVAL '7 days'; -- Only users with 7+ days
  $$
);
```

Alternative: Use Supabase Edge Function scheduled via cron:

- [ ] Set up pg_cron in Supabase
- [ ] Create cron job to trigger Edge Function
- [ ] Run for all eligible users (completed onboarding + 7 days ago)
- [ ] Handle rate limiting (batch users if needed)
- [ ] Log execution results

### 9. Send Notification on Insight Ready

After insight generation:

- [ ] Send push notification
- [ ] Title: "Your weekly insight is ready 📊"
- [ ] Body: "See what we learned from your habits"
- [ ] Deep link to insights screen
- [ ] Badge on insights tab until viewed

### 10. Track Adjustment Effectiveness

```typescript
// Compare week before vs week after adjustment
export const measureAdjustmentImpact = async (insight: WeeklyIteration) => {
  const weekBefore = insight.success_rate[insight.target_habit_id];
  const weekAfter = await getNextWeekSuccessRate(insight.target_habit_id);

  const improvement = weekAfter.percentage - weekBefore.percentage;

  return {
    improved: improvement > 0,
    delta: improvement,
  };
};
```

Tasks:

- [ ] Create measureAdjustmentImpact function
- [ ] Compare success rate before adjustment
- [ ] Compare success rate week after
- [ ] Calculate delta
- [ ] Display in next week's insight
- [ ] Track in analytics

## Deliverables

1. **Weekly Analysis System**
   - Automated weekly iteration Edge Function
   - Data analysis and pattern detection
   - AI-generated adjustments

2. **Insights Screen**
   - Display current week insight
   - Show past insights
   - Accept/decline functionality

3. **Adjustment Application**
   - Apply accepted adjustments to habits
   - Update schedules and notifications
   - Track implementation

4. **Automation**
   - Cron job triggers weekly for all users
   - Notifications sent when ready
   - Runs reliably every week

## Testing Checklist

### Data Analysis Tests

- [ ] Calculate weekly stats correctly
- [ ] Handle missing days (user didn't check in)
- [ ] Extract obstacles correctly
- [ ] Detect patterns accurately
- [ ] Compare weekday vs weekend stats

### AI Quality Tests

- [ ] Generate insight for test user data
- [ ] Verify patterns reference actual data
- [ ] Check adjustment is specific (not generic)
- [ ] Validate rationale explains "why"
- [ ] Test with various success rate profiles
  - High performing user (80%+)
  - Medium performing user (50-70%)
  - Struggling user (<50%)

### Edge Function Tests

- [ ] Function runs successfully
- [ ] Fetches correct week of data
- [ ] Calls OpenAI API
- [ ] Saves insight to database
- [ ] Sends notification
- [ ] Handles errors gracefully

### UI Tests

- [ ] Insights screen displays insight
- [ ] Success rates show correctly
- [ ] Patterns render as list
- [ ] Adjustment suggestion highlighted
- [ ] Accept button applies adjustment
- [ ] Decline button updates status
- [ ] Past insights load and display

### Adjustment Application Tests

- [ ] Timing adjustment updates reminder_time
- [ ] Frequency adjustment updates frequency_days
- [ ] Scope adjustment updates description
- [ ] Notifications reschedule correctly
- [ ] Habit displays with new details

### Automation Tests

- [ ] Cron job triggers on schedule
- [ ] Runs for all eligible users
- [ ] Doesn't run for users <7 days old
- [ ] Handles failures gracefully
- [ ] Logs execution results

### Edge Cases

- [ ] User has 0% completion (all habits failed)
- [ ] User has 100% completion (all habits perfect)
- [ ] User completed 0 check-ins this week
- [ ] User has only 1 habit
- [ ] User archived all habits mid-week
- [ ] OpenAI returns invalid JSON
- [ ] Network error during generation

## Risks & Mitigations

| Risk                           | Likelihood | Impact   | Mitigation                                |
| ------------------------------ | ---------- | -------- | ----------------------------------------- |
| AI suggestions feel generic    | High       | Critical | Extensive prompt engineering, validation  |
| Users don't accept adjustments | Medium     | High     | A/B test copy, track decline reasons      |
| Adjustment makes habit worse   | Low        | High     | Track effectiveness, learn from data      |
| Cron job fails silently        | Low        | Medium   | Monitoring, error alerts, retry logic     |
| OpenAI API costs spike         | Low        | Medium   | Rate limit, batch requests, monitor usage |

## Cost Optimization

### Token Usage

- Average weekly stats: ~400 tokens
- Context (profile): ~300 tokens
- Prompt: ~500 tokens
- Expected output: ~300 tokens
- Total per insight: ~1500 tokens
- Cost (gpt-4o-mini): ~$0.0003/insight

### Projected Costs (MVP)

- 50 users x 4 weeks = 200 insights
- 200 x $0.0003 = $0.06
- Monthly: <$5

## Dependencies for Next Phase

Phase 10 (Core UI/UX) requires:

- ✅ All core features functional
- ✅ Data flowing through system
- ✅ Ready for UI polish

## Notes

- This is the core value loop—invest in quality
- "One adjustment" is key (don't overwhelm)
- Reference real data, not generic advice
- Celebrate successes before suggesting changes
- Track which adjustment types work best
- Consider allowing users to request early insight (P1)
- Show longitudinal improvement over months (P1)

## Resources

- [Behavior Change Principles](https://tinyhabits.com/)
- [OpenAI Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Supabase Cron Jobs](https://supabase.com/docs/guides/database/extensions/pg_cron)
- [Data-Driven Habit Formation](https://jamesclear.com/habit-tracking)
