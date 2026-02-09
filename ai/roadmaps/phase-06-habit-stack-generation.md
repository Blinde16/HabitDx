# Phase 6: Habit Stack Generation

**Date Created:** February 9, 2026  
**Phase Duration:** 5-7 days  
**Dependencies:** Phase 5 (AI Failure Profile)  
**Status:** Not Started

## Overview

Build the AI system that generates 1-3 personalized habits based on the user's Failure Profile and onboarding data. Each habit includes a "why this works for you" rationale that makes users feel understood.

## Goals

- Generate 1-3 habits tailored to user constraints
- Include personalized rationale for each habit
- Design habits that account for failure patterns
- Save habits to database as structured data
- Display habits with clear scheduling details
- Enable users to accept/modify generated stack

## Success Criteria

- [ ] Edge Function generates 1-3 habits successfully
- [ ] Each habit has clear title, description, rationale
- [ ] Habits respect user's constraints (time, energy, schedule)
- [ ] Generation completes in <5 seconds
- [ ] Habits feel personalized (not generic)
- [ ] Users can view and accept habit stack
- [ ] 50%+ iteration acceptance rate (target metric)

## Habit Stack Structure

### Data Model
```typescript
interface HabitStack {
  id: string;
  user_id: string;
  failure_profile_id: string;
  created_at: string;
  is_active: boolean;
  habits: Habit[];
}

interface Habit {
  id: string;
  stack_id: string;
  title: string; // e.g., "5-minute morning meditation"
  description: string; // What to do
  rationale: string; // "Why this works for you" - personalized
  
  // Scheduling
  frequency_type: 'daily' | 'weekly' | 'custom';
  frequency_days: number[]; // [0,1,2,3,4] = Mon-Fri
  reminder_time: string; // "08:00:00"
  
  // Status
  is_active: boolean;
  display_order: number; // 0, 1, 2
}
```

### Example Generated Stack
```json
{
  "habits": [
    {
      "title": "5-Minute Morning Pages",
      "description": "Before checking your phone, write 5 minutes of stream-of-consciousness thoughts in a notebook.",
      "rationale": "Your failure profile shows you're a 'High-Achiever Optimizer' who overthinks. Morning pages clear mental clutter BEFORE your analytical brain takes over. Starting at 7am captures your peak energy window.",
      "frequency_type": "daily",
      "frequency_days": [1, 2, 3, 4, 5], // Weekdays only
      "reminder_time": "07:00:00"
    },
    {
      "title": "Minimum Viable Movement",
      "description": "Do 1 push-up, 1 squat, or a 60-second walk. Seriously, just one.",
      "rationale": "Your past exercise attempts failed because of perfectionism ('If I can't do 30 minutes, why bother?'). This habit is SO small that your brain can't rationalize skipping it. Build consistency first.",
      "frequency_type": "daily",
      "frequency_days": [0, 1, 2, 3, 4, 5, 6],
      "reminder_time": "12:00:00"
    },
    {
      "title": "Weekend Anchor Ritual",
      "description": "Every Saturday at 9am, make your favorite coffee/tea and sit outside for 5 minutes (phone in other room).",
      "rationale": "Your 'Weekend Routine Disruption' pattern shows habits break when structure disappears. This simple ritual anchors your weekend, giving you a consistent touchpoint even when your schedule changes.",
      "frequency_type": "weekly",
      "frequency_days": [6], // Saturday
      "reminder_time": "09:00:00"
    }
  ]
}
```

## Technical Tasks

### 1. Create Habit Generation Edge Function
```typescript
// supabase/functions/generate-habits/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  // 1. Verify authentication
  // 2. Get user's failure profile
  // 3. Get user's onboarding data
  // 4. Construct AI prompt with context
  // 5. Call OpenAI API
  // 6. Parse and validate habits
  // 7. Save habit_stack and habits to database
  // 8. Return habit stack
});
```

Tasks:
- [ ] Create `supabase/functions/generate-habits/` directory
- [ ] Initialize Deno function
- [ ] Fetch failure profile and onboarding data
- [ ] Build prompt construction logic
- [ ] Integrate OpenAI API call
- [ ] Parse and validate response
- [ ] Save to habit_stacks and habits tables
- [ ] Implement error handling
- [ ] Deploy and test function

### 2. Design Habit Generation Prompt
```typescript
const constructHabitPrompt = (profile: HabitFailureProfile, userData: OnboardingData) => {
  return `You are an expert habit designer creating personalized habits for this user.

USER'S FAILURE PROFILE:
Patterns: ${profile.failure_patterns.join('; ')}
Root causes: ${profile.root_causes.join('; ')}
Archetype: ${profile.personality_insights.archetype}
Strength: ${profile.personality_insights.strength}
Weakness: ${profile.personality_insights.weakness}

USER'S CONSTRAINTS:
Peak energy: ${userData.constraints.peak_energy}
Schedule: ${userData.constraints.schedule_type.join(', ')}
Obstacles: ${userData.constraints.obstacles.join(', ')}
Goals: ${userData.goals.join(', ')}

DESIGN RULES:
1. Generate 1-3 habits (start with just 1 if failure patterns show overwhelm)
2. Each habit must be:
   - Tiny (≤5 minutes to start)
   - Scheduled during peak energy time
   - Designed to avoid known failure patterns
   - Connected to user's goals
3. Frequency:
   - Default to weekdays only if schedule is inconsistent
   - Include weekend habits ONLY if they solve "weekend disruption" pattern
4. Each habit needs:
   - title: Clear, specific (include duration)
   - description: Exactly what to do, step-by-step
   - rationale: "Why this works for YOU" - reference their specific data
   - frequency_type: daily or weekly
   - frequency_days: array of days [0=Sun, 1=Mon, ..., 6=Sat]
   - reminder_time: HH:MM:SS format

BE RADICALLY SPECIFIC to this person's data. Generic habits like "exercise more" will fail again.

Return ONLY valid JSON:
{
  "habits": [
    {
      "title": string,
      "description": string,
      "rationale": string,
      "frequency_type": "daily" | "weekly",
      "frequency_days": number[],
      "reminder_time": string
    }
  ]
}`;
};
```

Tasks:
- [ ] Write initial prompt template
- [ ] Define habit design principles
- [ ] Add constraints and validation rules
- [ ] Test prompt with sample profiles
- [ ] Iterate to reduce generic habits
- [ ] Add few-shot examples
- [ ] Optimize token usage
- [ ] Document prompt rationale

### 3. Implement Habit Validation
```typescript
// Validate generated habits before saving
function validateHabit(habit: any): boolean {
  const checks = [
    habit.title && habit.title.length > 0,
    habit.description && habit.description.length > 0,
    habit.rationale && habit.rationale.length > 20,
    ['daily', 'weekly'].includes(habit.frequency_type),
    Array.isArray(habit.frequency_days) && habit.frequency_days.length > 0,
    /^\d{2}:\d{2}:\d{2}$/.test(habit.reminder_time),
  ];
  
  return checks.every(check => check === true);
}
```

Validation rules:
- [ ] All required fields present
- [ ] Title is 3-50 characters
- [ ] Description is 10-200 characters
- [ ] Rationale is 20-500 characters (must be personalized)
- [ ] frequency_type is valid enum
- [ ] frequency_days is non-empty array of 0-6
- [ ] reminder_time is valid HH:MM:SS format
- [ ] Reject generic rationales ("This is good for you")

### 4. Build Habit Stack Display Screen
```
app/(tabs)/habits.tsx or app/(onboarding)/habit-stack.tsx
```

UI Components:
- [ ] Screen title: "Your Personalized Habit Stack"
- [ ] Subheading: "These habits are designed for YOU"
- [ ] Habit cards (1-3) showing:
  - Habit title (large, bold)
  - Description (readable paragraph)
  - "Why this works for you" callout box (highlighted)
  - Schedule summary ("Every weekday at 7:00 AM")
  - Icon/emoji for visual interest
- [ ] "Start These Habits" button (primary CTA)
- [ ] "Regenerate Stack" button (secondary, careful)
- [ ] "Customize" option (P1 feature)

Design:
- [ ] Use cards for each habit
- [ ] Visually separate rationale (most important part)
- [ ] Show schedule clearly with icons
- [ ] Make it feel exciting, not overwhelming

### 5. Create Habit Card Component
```typescript
// components/HabitCard.tsx
interface HabitCardProps {
  habit: Habit;
  showRationale?: boolean;
  onPress?: () => void;
}

export const HabitCard = ({ habit, showRationale = true, onPress }: HabitCardProps) => {
  // Render habit with description, rationale, schedule
};
```

Tasks:
- [ ] Create HabitCard component
- [ ] Display habit title and description
- [ ] Highlight rationale in callout box
- [ ] Format schedule (convert days/time to readable text)
- [ ] Add habit icon/emoji
- [ ] Make card tappable for details
- [ ] Add loading state

### 6. Implement Habit Stack Acceptance Flow
After user sees generated habits:

1. **Accept Stack:**
   - [ ] Save habit_stack as active
   - [ ] Save all habits as active
   - [ ] Navigate to main app (daily check-in screen)
   - [ ] Show success message

2. **Regenerate Stack:**
   - [ ] Confirm user wants to regenerate
   - [ ] Set current stack to is_active=false
   - [ ] Call generate-habits function again
   - [ ] Show new stack

3. **Later: Customize (P1)**
   - Edit habit details
   - Change schedule
   - Remove habits

### 7. Create Habit Stack Store (Zustand)
```typescript
// stores/habitStackStore.ts
interface HabitStackStore {
  currentStack: HabitStack | null;
  loading: boolean;
  error: string | null;
  
  generateStack: () => Promise<void>;
  acceptStack: () => Promise<void>;
  regenerateStack: () => Promise<void>;
  fetchActiveStack: () => Promise<void>;
}
```

Tasks:
- [ ] Create Zustand store
- [ ] Implement generateStack (calls Edge Function)
- [ ] Implement acceptStack (sets as active)
- [ ] Implement regenerateStack (archives old, creates new)
- [ ] Implement fetchActiveStack (for loading)
- [ ] Add error handling
- [ ] Add loading states

### 8. Build Integration with Onboarding Flow
After Habit Failure Profile generated:
- [ ] Automatically call habit generation function
- [ ] Show loading screen ("Designing your habits...")
- [ ] Display generated habit stack
- [ ] Allow user to accept or regenerate
- [ ] On accept, complete onboarding and enter main app

### 9. Add Database Query Helpers
```typescript
// lib/db.ts (extend)
export const getActiveHabitStack = async (userId: string) => {
  const { data, error } = await supabase
    .from('habit_stacks')
    .select(`
      *,
      habits (
        id,
        title,
        description,
        rationale,
        frequency_type,
        frequency_days,
        reminder_time,
        is_active,
        display_order
      )
    `)
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();
  
  return { data, error };
};

export const createHabitStack = async (stackData: any, habits: any[]) => {
  // Insert stack
  // Insert habits
  // Return complete stack
};
```

Tasks:
- [ ] Create getActiveHabitStack query
- [ ] Create createHabitStack mutation
- [ ] Create archiveHabitStack mutation
- [ ] Add proper type safety
- [ ] Handle errors gracefully

### 10. Implement Schedule Display Logic
```typescript
// utils/schedule.ts
export const formatSchedule = (habit: Habit) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const selectedDays = habit.frequency_days.map(d => days[d]);
  
  const time = formatTime(habit.reminder_time); // "7:00 AM"
  
  if (habit.frequency_type === 'daily') {
    if (habit.frequency_days.length === 7) {
      return `Every day at ${time}`;
    } else {
      return `${selectedDays.join(', ')} at ${time}`;
    }
  } else {
    return `${selectedDays.join(', ')} at ${time}`;
  }
};
```

Tasks:
- [ ] Create formatSchedule utility
- [ ] Convert 24hr to 12hr time format
- [ ] Convert day numbers to day names
- [ ] Handle edge cases (single day, all days, etc.)
- [ ] Add emoji indicators for time of day

## AI Prompt Optimization

### Quality Criteria for Generated Habits
- [ ] Habit duration is ≤5 minutes
- [ ] Description is actionable (clear steps)
- [ ] Rationale references user's specific data
- [ ] Schedule aligns with peak energy time
- [ ] Frequency accounts for consistency patterns
- [ ] Habits avoid known failure triggers

### Testing Generated Habits
- [ ] Generate habits for 10 test profiles
- [ ] Rate each habit for:
  - Specificity (1-5)
  - Feasibility (1-5)
  - Personalization (1-5)
  - Rationale quality (1-5)
- [ ] Check for generic habits
- [ ] Verify schedules make sense
- [ ] Test with edge case profiles (severe constraints)

## Deliverables

1. **Working Edge Function**
   - Generates 1-3 personalized habits
   - Calls OpenAI API successfully
   - Saves to database

2. **Habit Display UI**
   - Beautiful habit cards
   - Clear rationale display
   - Schedule information

3. **Acceptance Flow**
   - User can accept generated stack
   - User can regenerate if needed
   - Smooth transition to main app

4. **Quality AI Output**
   - Habits feel personalized
   - Rationales reference user data
   - Schedules respect constraints

## Testing Checklist

### Edge Function Tests
- [ ] Function generates 1-3 habits
- [ ] All habits have required fields
- [ ] Habits save to database correctly
- [ ] Habit stack marked as active
- [ ] Error handling works
- [ ] Response time <5 seconds

### AI Quality Tests
- [ ] Generate habits for 10 test profiles
- [ ] Verify no generic habits
- [ ] Check rationales are specific
- [ ] Validate schedules match constraints
- [ ] Test with minimal data profile
- [ ] Test with complex constraint profile

### UI Tests
- [ ] Habit stack screen displays correctly
- [ ] All 3 habits visible (if generated)
- [ ] Rationale boxes highlighted
- [ ] Schedule text readable
- [ ] Accept button navigates to main app
- [ ] Regenerate button works
- [ ] Loading states show

### Integration Tests
- [ ] Complete flow: onboarding → profile → habits → accept
- [ ] Habits appear on home screen after accept
- [ ] User can check in on generated habits
- [ ] Regenerate archives old stack

### Edge Cases
- [ ] User with severe time constraints (generates 1 habit)
- [ ] User with inconsistent schedule (weekday-only habits)
- [ ] User with multiple failure patterns
- [ ] OpenAI returns invalid JSON
- [ ] Network error during generation
- [ ] Database save fails

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Generated habits feel generic | High | Critical | Extensive prompt engineering, validation rules |
| Habits too ambitious (fail again) | Medium | High | Enforce "≤5 minutes" rule, test feasibility |
| Users reject generated stack | Medium | High | Allow regeneration, track rejection reasons |
| Generation takes too long | Low | Medium | Optimize prompt, use streaming |
| API costs too high | Low | Low | Cache stacks, use gpt-4o-mini |

## Cost Optimization

### Token Usage
- Average context: ~800 tokens (profile + onboarding)
- Prompt: ~600 tokens
- Expected output: ~500 tokens
- Total per generation: ~1900 tokens
- Cost (gpt-4o-mini): ~$0.0003/stack

### Projected Costs (MVP)
- 50 users x 1 stack = 50 stacks
- Regenerations: ~10 (20% regenerate once)
- Total: 60 generations x $0.0003 = $0.018
- Monthly: <$5

## Dependencies for Next Phase

Phase 7 (Daily Check-in) requires:
- ✅ Active habit stack in database
- ✅ Habits with schedules defined
- ✅ User can view their habits

## Notes

- Focus on "why this works for YOU"—that's the magic
- Tiny habits > ambitious habits (build consistency first)
- Test extensively with diverse user profiles
- Monitor which types of habits get accepted vs rejected
- Consider adding habit templates as fallback
- Track which rationales resonate most with users
- Be conservative with number of habits (1-2 is fine)

## Resources

- [Tiny Habits by BJ Fogg](https://tinyhabits.com/)
- [Atomic Habits by James Clear](https://jamesclear.com/atomic-habits)
- [OpenAI Best Practices](https://platform.openai.com/docs/guides/prompt-engineering)
- [Habit Stacking Research](https://jamesclear.com/habit-stacking)
