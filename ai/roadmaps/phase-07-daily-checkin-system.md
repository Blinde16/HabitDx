# Phase 7: Daily Check-in System

**Date Created:** February 9, 2026  
**Phase Duration:** 4-5 days  
**Dependencies:** Phase 6 (Habit Stack Generation)  
**Status:** Not Started

## Overview

Build the core daily habit check-in interface that allows users to log habit completion with one tap. This is the primary interaction point and data collection mechanism for weekly AI iteration.

## Goals

- Create frictionless 1-tap check-in experience
- Allow optional obstacle logging
- Display today's habits clearly
- Track completion streaks (with "don't miss twice" philosophy)
- Provide immediate visual feedback
- Save check-in data for AI analysis

## Success Criteria

- [ ] Users can check in with single tap (<2 seconds)
- [ ] Check-in data saves to habit_logs table
- [ ] Optional obstacle input is easy to access
- [ ] Today's view shows only relevant habits (by schedule)
- [ ] Visual feedback confirms check-in
- [ ] Streak counter visible but not punishing
- [ ] Works offline (syncs when online)

## Daily Check-in UI Flow

### Home Screen Layout

```
┌─────────────────────────────┐
│  Monday, Feb 9              │
│  2 of 3 habits complete     │
├─────────────────────────────┤
│                             │
│  ✅ 5-Minute Morning Pages  │
│     Completed at 7:15 AM    │
│     🔥 3-day streak         │
│                             │
│  ⭕ Minimum Viable Movement │
│     [TAP TO COMPLETE]       │
│     Reminder: 12:00 PM      │
│                             │
│  ⬜ Evening Wind-Down       │
│     Not scheduled today     │
│                             │
├─────────────────────────────┤
│  [View Insights]            │
└─────────────────────────────┘
```

### Check-in States

1. **Not Done Yet** (⬜) - Scheduled today, not checked in
2. **Completed** (✅) - Checked in today
3. **Missed** (❌) - Past reminder time, not done
4. **Not Scheduled** (⬜ grayed) - Not scheduled for today

## Technical Tasks

### 1. Create Habit Check-in Store (Zustand)

```typescript
// stores/checkinStore.ts
interface CheckinStore {
  todaysHabits: HabitWithStatus[];
  loading: boolean;

  fetchTodaysHabits: () => Promise<void>;
  checkInHabit: (habitId: string) => Promise<void>;
  undoCheckIn: (habitId: string) => Promise<void>;
  logObstacle: (habitId: string, obstacle: string) => Promise<void>;

  // Computed
  completionRate: number; // % of scheduled habits done today
  currentStreak: (habitId: string) => number;
}

interface HabitWithStatus extends Habit {
  status: 'not_done' | 'completed' | 'missed' | 'not_scheduled';
  checked_in_at?: string;
  streak: number;
  last_obstacle?: string;
}
```

Tasks:

- [ ] Create Zustand store
- [ ] Implement fetchTodaysHabits (filters by schedule)
- [ ] Implement checkInHabit (saves to habit_logs)
- [ ] Implement undoCheckIn (for mistakes)
- [ ] Implement logObstacle
- [ ] Calculate completion rate
- [ ] Calculate streak for each habit
- [ ] Add offline support with queue

### 2. Build Home Screen (Main Check-in Interface)

```
app/(tabs)/home.tsx
```

UI Components:

- [ ] Date header (Today, Yesterday, etc.)
- [ ] Overall completion status ("2 of 3 complete")
- [ ] List of today's habits
- [ ] Empty state (no habits scheduled today)
- [ ] Pull-to-refresh
- [ ] Loading state
- [ ] Error state

Design:

- [ ] Large, tappable habit cards
- [ ] Clear visual states (icons, colors)
- [ ] Streak counter visible but subtle
- [ ] Smooth animations on check-in
- [ ] Celebrate completion (confetti on 100%?)

### 3. Create Habit Check-in Card Component

```typescript
// components/HabitCheckinCard.tsx
interface HabitCheckinCardProps {
  habit: HabitWithStatus;
  onCheckIn: (habitId: string) => void;
  onUndo: (habitId: string) => void;
  onLogObstacle: (habitId: string) => void;
}

export const HabitCheckinCard = ({
  habit,
  onCheckIn,
  onUndo,
  onLogObstacle,
}: HabitCheckinCardProps) => {
  // Render habit card with check-in button
  // Show completion state, streak, reminder time
  // Allow swipe actions for undo/obstacle
};
```

Card Features:

- [ ] Habit title (large, readable)
- [ ] Check-in button (entire card is tappable)
- [ ] Completion state icon (✅ ⬜ ❌)
- [ ] Streak display (🔥 3-day streak)
- [ ] Reminder time
- [ ] "Why this works for you" (expandable)
- [ ] Swipe left to log obstacle
- [ ] Swipe right to undo (if completed)

### 4. Implement Check-in Logic

```typescript
// lib/checkin.ts
export const checkInHabit = async (habitId: string) => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const { data, error } = await supabase.from('habit_logs').insert({
    habit_id: habitId,
    user_id: userId,
    log_date: today,
    completed: true,
    checked_in_at: new Date().toISOString(),
    checked_in_via: 'app',
  });

  if (error && error.code === '23505') {
    // Duplicate log, handle gracefully
  }

  return { data, error };
};
```

Tasks:

- [ ] Implement checkInHabit function
- [ ] Implement undoCheckIn (delete log)
- [ ] Implement logObstacle (insert with completed=false)
- [ ] Handle duplicate check-in attempts
- [ ] Add optimistic UI updates
- [ ] Sync with server
- [ ] Handle offline state

### 5. Build Obstacle Logging Modal

```typescript
// components/ObstacleModal.tsx
// Appears when user swipes left on habit card
```

UI:

- [ ] Modal or bottom sheet
- [ ] Habit name at top
- [ ] "What got in the way?" prompt
- [ ] Text input (150 character limit)
- [ ] Quick-select chips:
  - No time
  - Too tired
  - Forgot
  - Sick
  - Other
- [ ] "Save" button
- [ ] "Skip" button
- [ ] Close on background tap

Logic:

- [ ] Save obstacle to habit_logs
- [ ] Mark habit as completed=false
- [ ] Close modal after save
- [ ] Show confirmation toast

### 6. Calculate and Display Streaks

```typescript
// utils/streaks.ts
export const calculateStreak = (habitId: string, logs: HabitLog[]) => {
  // Calculate consecutive days of completion
  // Use "don't miss twice" logic:
  // - One miss doesn't break streak
  // - Two consecutive misses resets to 0

  let streak = 0;
  let missedYesterday = false;

  // Sort logs by date descending
  // Count backward from today
  // Stop when two consecutive misses found

  return streak;
};
```

Streak Rules:

- [ ] One missed day doesn't break streak
- [ ] Two consecutive misses resets streak
- [ ] Only count scheduled days
- [ ] Display streak with fire emoji 🔥
- [ ] Celebrate milestones (7, 14, 30 days)

Tasks:

- [ ] Implement calculateStreak function
- [ ] Fetch habit logs for streak calculation
- [ ] Display streak on habit card
- [ ] Add streak badge for milestones
- [ ] Don't emphasize streak breaking (positive framing)

### 7. Implement Today's Habits Filter

```typescript
// utils/scheduling.ts
export const isTodayScheduled = (habit: Habit): boolean => {
  const today = new Date().getDay(); // 0=Sun, 6=Sat

  if (habit.frequency_type === 'daily') {
    return habit.frequency_days.includes(today);
  } else if (habit.frequency_type === 'weekly') {
    return habit.frequency_days.includes(today);
  }

  return false;
};

export const getTodaysHabits = (habits: Habit[]): Habit[] => {
  return habits
    .filter((h) => h.is_active)
    .filter(isTodayScheduled)
    .sort((a, b) => a.display_order - b.display_order);
};
```

Tasks:

- [ ] Implement isTodayScheduled
- [ ] Implement getTodaysHabits
- [ ] Filter by active status
- [ ] Sort by display_order
- [ ] Handle edge cases (no habits today)

### 8. Add Completion Status Indicator

```
┌─────────────────────────────┐
│  Monday, Feb 9              │
│  ●●○ 2 of 3 habits          │
└─────────────────────────────┘
```

UI:

- [ ] Progress dots or bar
- [ ] Percentage text
- [ ] Color changes based on completion:
  - 0-33%: Red/gray
  - 34-66%: Yellow/orange
  - 67-99%: Light green
  - 100%: Bright green
- [ ] Animate on check-in
- [ ] Celebrate 100% (animation, haptic)

### 9. Implement Offline Support

```typescript
// lib/offline.ts
interface QueuedCheckIn {
  id: string;
  habitId: string;
  completed: boolean;
  obstacle?: string;
  timestamp: string;
}

// Queue check-ins when offline
export const queueCheckIn = async (checkIn: QueuedCheckIn) => {
  const queue = await AsyncStorage.getItem('checkin_queue');
  const parsed = queue ? JSON.parse(queue) : [];
  parsed.push(checkIn);
  await AsyncStorage.setItem('checkin_queue', JSON.stringify(parsed));
};

// Sync queue when online
export const syncCheckIns = async () => {
  const queue = await AsyncStorage.getItem('checkin_queue');
  if (!queue) return;

  const checkIns = JSON.parse(queue);

  for (const checkIn of checkIns) {
    await supabase.from('habit_logs').insert(checkIn);
  }

  await AsyncStorage.removeItem('checkin_queue');
};
```

Tasks:

- [ ] Detect network status
- [ ] Queue check-ins when offline
- [ ] Sync queue when network returns
- [ ] Show offline indicator
- [ ] Handle conflicts (same habit logged twice)
- [ ] Update UI optimistically

### 10. Add Quick Actions

Swipe gestures on habit cards:

- [ ] **Swipe right:** Undo check-in (if completed today)
- [ ] **Swipe left:** Log obstacle (why you didn't do it)
- [ ] **Long press:** View habit details (description, rationale)

Implement with:

- [ ] React Native Gesture Handler
- [ ] Animated feedback
- [ ] Haptic feedback on action
- [ ] Clear visual affordances

### 11. Create Empty States

```typescript
// If no habits scheduled today
<EmptyState
  icon="🎉"
  title="Rest day!"
  message="No habits scheduled for today. Enjoy your break!"
/>

// If all habits completed
<CompletionState
  icon="✅"
  title="All done!"
  message="You completed all your habits today. Great work!"
/>
```

Tasks:

- [ ] Empty state for no habits today
- [ ] Completion state for 100% done
- [ ] Loading state
- [ ] Error state (network issues)

### 12. Add Celebration Animations

When user completes all habits:

- [ ] Confetti animation
- [ ] Success sound (optional)
- [ ] Haptic feedback (3 taps)
- [ ] Encouraging message
- [ ] Share prompt (optional)

Implementation:

- [ ] Use lottie-react-native for confetti
- [ ] Trigger on last habit completion
- [ ] Only show once per day
- [ ] Don't be annoying (subtle celebration)

## Deliverables

1. **Home Screen**
   - Displays today's habits
   - Shows completion status
   - Clean, uncluttered interface

2. **Check-in Functionality**
   - One-tap check-in
   - Saves to habit_logs table
   - Optimistic UI updates

3. **Obstacle Logging**
   - Quick obstacle capture
   - Optional text input
   - Saves with check-in data

4. **Streak Display**
   - Shows consecutive days
   - "Don't miss twice" logic
   - Encourages consistency

5. **Offline Support**
   - Works without internet
   - Syncs when online
   - No data loss

## Testing Checklist

### Functional Tests

- [ ] Check in on habit
- [ ] Verify log saved to database
- [ ] Undo check-in
- [ ] Log obstacle without checking in
- [ ] View only today's scheduled habits
- [ ] Streaks calculate correctly
- [ ] Completion percentage updates
- [ ] Offline check-in queued
- [ ] Queue syncs when online

### UI Tests

- [ ] Habit cards display correctly
- [ ] Check-in animation smooth
- [ ] Streak badge visible
- [ ] Completion indicator updates
- [ ] Swipe gestures work
- [ ] Empty states show
- [ ] Celebration animation on 100%

### Edge Cases

- [ ] Check in on habit multiple times (prevent duplicate)
- [ ] Check in on wrong day (past/future)
- [ ] Undo check-in from previous day
- [ ] Network loss during check-in
- [ ] No habits scheduled today
- [ ] All habits completed
- [ ] Habit deleted while viewing
- [ ] Check in on archived habit

### Streak Tests

- [ ] 7-day completion = 7-day streak
- [ ] 1 miss doesn't break streak
- [ ] 2 consecutive misses = streak reset
- [ ] Streak counts only scheduled days
- [ ] Unscheduled days don't affect streak

### Performance Tests

- [ ] Home screen loads <500ms
- [ ] Check-in response <100ms (optimistic)
- [ ] Smooth scrolling with 10+ habits
- [ ] No lag on animations

## Risks & Mitigations

| Risk                           | Likelihood | Impact | Mitigation                                      |
| ------------------------------ | ---------- | ------ | ----------------------------------------------- |
| Users forget to check in       | High       | High   | Push notifications (Phase 8)                    |
| Check-in feels like a chore    | Medium     | High   | Make it < 2 seconds, add celebration            |
| Offline sync conflicts         | Low        | Medium | Use timestamps, prefer user data                |
| Streak pressure causes anxiety | Medium     | Medium | "Don't miss twice" philosophy, positive framing |

## Dependencies for Next Phase

Phase 8 (Push Notifications) requires:

- ✅ Habits with reminder_time defined
- ✅ Check-in functionality working
- ✅ User can log habits daily

## Notes

- Speed is critical—optimize for <2 second check-in
- Don't make users feel bad for missing (positive framing)
- Streaks should encourage, not punish
- Obstacle logging should be optional and easy
- Consider adding "check in later" snooze option
- Test with real users ASAP to refine UX
- Monitor which habits get most check-ins vs obstacles

## Resources

- [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/)
- [Lottie Animations](https://airbnb.design/lottie/)
- [Haptic Feedback](https://docs.expo.dev/versions/latest/sdk/haptics/)
- [Don't Break the Chain](https://jamesclear.com/stop-procrastinating-seinfeld-strategy)
