# Phase 4: Smart Onboarding Flow

**Date Created:** February 9, 2026  
**Phase Duration:** 5-7 days  
**Dependencies:** Phase 3 (Database Schema)  
**Status:** ✅ Completed - February 12, 2026

## Overview

Build the 5-screen smart onboarding experience that captures user's past failures, constraints, and goals. This is the critical first impression and data collection point that enables all AI personalization.

## Goals

- Guide users through 5-minute intake flow
- Collect high-quality data for AI analysis
- Create delightful, engaging UX
- Save onboarding data to database
- Prepare data for AI Failure Profile generation
- Minimize drop-off between screens

## Success Criteria

- [ ] 70%+ onboarding completion rate (target metric)
- [ ] All 5 screens functional and connected
- [ ] Data saves to user_profiles table
- [ ] Smooth transitions between screens
- [ ] Works on iOS and Android
- [ ] Progress is saved (can resume if interrupted)
- [ ] Validation prevents bad data

## Onboarding Screen Flow

### Screen 1: Welcome & Value Prop

**Purpose:** Hook the user, explain what makes HabitDx different

UI Elements:

- [ ] App logo/branding
- [ ] Headline: "Finally understand why your habits fail"
- [ ] 3 benefit bullets:
  - 🎯 "Get your personal Habit Failure Profile"
  - 🧠 "Habits designed around your constraints"
  - 📈 "Weekly insights that actually work"
- [ ] "Get Started" button
- [ ] "This takes ~5 minutes" subtext
- [ ] Skip link (logs out, returns to login)

Design notes:

- Warm, encouraging tone
- High-quality illustrations/graphics
- Build trust and excitement

### Screen 2: Past Failures

**Purpose:** Capture what habits users have tried and why they failed

UI Elements:

- [ ] Progress indicator (2/5)
- [ ] Headline: "Let's start with your history"
- [ ] Subtext: "What habits have you tried before?"
- [ ] Multi-select chips or list:
  - Morning routine
  - Exercise
  - Meditation
  - Reading
  - Journaling
  - Healthy eating
  - Sleep schedule
  - Other (custom input)
- [ ] "Why did these fail?" text area
- [ ] Character counter (encourage 2-3 sentences)
- [ ] "Next" button (disabled until ≥1 selected)
- [ ] Back button

Data captured:

```typescript
{
  past_failures: string[], // e.g., ["exercise", "meditation"]
  failure_description: string // Free-form explanation
}
```

Validation:

- [ ] At least 1 habit selected
- [ ] Failure description 20-500 characters
- [ ] Show helpful prompt if too short

### Screen 3: Constraints & Context

**Purpose:** Understand user's schedule, energy, and life constraints

UI Elements:

- [ ] Progress indicator (3/5)
- [ ] Headline: "Help us understand your life"
- [ ] Section 1: "When do you have the most energy?"
  - Radio buttons: Morning / Afternoon / Evening / Varies
- [ ] Section 2: "What's your daily schedule like?"
  - Checkboxes:
    - 9-5 job
    - Shift work
    - Freelance/irregular
    - Stay-at-home parent
    - Student
- [ ] Section 3: "What makes habits hard for you?"
  - Multi-select:
    - Lack of time
    - Inconsistent schedule
    - Low energy
    - Forgetfulness
    - No accountability
    - Perfectionism
    - Other (custom)
- [ ] "Next" button
- [ ] Back button

Data captured:

```typescript
{
  constraints: {
    peak_energy: 'morning' | 'afternoon' | 'evening' | 'varies',
    schedule_type: string[],
    obstacles: string[]
  }
}
```

Design notes:

- Keep it concise—each section = 1 question
- Use visual icons for energy times
- Progressive disclosure (don't overwhelm)

### Screen 4: Goals & Motivation

**Purpose:** Capture what success looks like for the user

UI Elements:

- [ ] Progress indicator (4/5)
- [ ] Headline: "What are you working toward?"
- [ ] Subtext: "Select up to 3 goals"
- [ ] Goal cards (select max 3):
  - Better health
  - More energy
  - Career growth
  - Mental clarity
  - Better sleep
  - Personal growth
  - Reduce stress
  - Build confidence
  - Custom goal (text input)
- [ ] "Why does this matter to you?" text area
- [ ] Character counter
- [ ] "Next" button (disabled until ≥1 selected)
- [ ] Back button

Data captured:

```typescript
{
  goals: string[], // Max 3
  motivation: string // Why it matters
}
```

Validation:

- [ ] 1-3 goals selected
- [ ] Motivation 20-300 characters

### Screen 5: Confirmation & Expectations

**Purpose:** Set expectations for next steps, get final consent

UI Elements:

- [ ] Progress indicator (5/5)
- [ ] Headline: "Perfect! Here's what happens next:"
- [ ] Timeline preview:
  - ✅ Step 1: We'll analyze your responses (30 seconds)
  - 🎯 Step 2: You'll get your Habit Failure Profile
  - 📋 Step 3: We'll design 1-3 habits just for you
  - 📱 Step 4: Check in daily (takes 10 seconds)
  - 💡 Step 5: Get weekly insights to improve
- [ ] Notification permission request
  - "Can we send helpful reminders?"
  - Toggle switch: ON by default
  - Subtext: "You can change this anytime"
- [ ] Privacy note: "Your data is private and never shared"
- [ ] "Analyze My Data" button (primary CTA)
- [ ] Back button

Actions on submit:

- [ ] Save all data to user_profiles
- [ ] Set onboarding_completed = true
- [ ] Request notification permissions (if enabled)
- [ ] Navigate to loading/generation screen

## Technical Tasks

### 1. Create Onboarding Store (Zustand)

```typescript
// stores/onboardingStore.ts
interface OnboardingStore {
  currentScreen: number;
  data: {
    pastFailures: string[];
    failureDescription: string;
    constraints: ConstraintsData;
    goals: string[];
    motivation: string;
    notificationsEnabled: boolean;
  };

  setScreen: (screen: number) => void;
  updateData: (key: string, value: any) => void;
  nextScreen: () => void;
  prevScreen: () => void;
  submitOnboarding: () => Promise<void>;
  loadProgress: () => void;
  saveProgress: () => void;
}
```

Tasks:

- [ ] Create Zustand store
- [ ] Implement all methods
- [ ] Add validation logic
- [ ] Persist progress to AsyncStorage
- [ ] Add error handling

### 2. Build Onboarding Screens

- [ ] `app/(onboarding)/_layout.tsx` - Onboarding container
- [ ] `app/(onboarding)/welcome.tsx` - Screen 1
- [ ] `app/(onboarding)/past-failures.tsx` - Screen 2
- [ ] `app/(onboarding)/constraints.tsx` - Screen 3
- [ ] `app/(onboarding)/goals.tsx` - Screen 4
- [ ] `app/(onboarding)/confirmation.tsx` - Screen 5

### 3. Create Reusable Onboarding Components

- [ ] `OnboardingContainer` - Consistent layout wrapper
- [ ] `ProgressIndicator` - Visual progress bar (1/5, 2/5, etc.)
- [ ] `OnboardingButton` - Primary CTA button
- [ ] `BackButton` - Navigation back
- [ ] `MultiSelectChip` - Selectable option chips
- [ ] `GoalCard` - Selectable goal cards
- [ ] `CharacterCounter` - Text input counter with limit
- [ ] `SectionHeader` - Consistent section titles

### 4. Implement Navigation Logic

- [ ] Create onboarding route group
- [ ] Implement screen transitions (slide animation)
- [ ] Handle back button (Android hardware button)
- [ ] Prevent navigation away during onboarding
- [ ] Save progress on app background
- [ ] Resume from last screen on return

### 5. Add Form Validation

- [ ] Validate at least 1 past failure selected
- [ ] Validate failure description length (20-500 chars)
- [ ] Validate at least 1 constraint selected
- [ ] Validate 1-3 goals selected
- [ ] Validate motivation length (20-300 chars)
- [ ] Show inline error messages
- [ ] Disable "Next" until valid

### 6. Implement Data Persistence

- [ ] Save onboarding data to user_profiles table
- [ ] Use Supabase client for DB operations
- [ ] Handle network errors gracefully
- [ ] Retry failed saves
- [ ] Log errors for debugging

### 7. Add Analytics Tracking

- [ ] Track onboarding_started
- [ ] Track screen_viewed (each screen)
- [ ] Track screen_completed (each screen)
- [ ] Track onboarding_completed
- [ ] Track onboarding_abandoned (at which screen)
- [ ] Track time_spent (per screen)

### 8. Request Notification Permissions

- [ ] Check current permission status
- [ ] Request permissions on confirmation screen
- [ ] Handle permission granted
- [ ] Handle permission denied
- [ ] Save preference to user_profiles
- [ ] Explain why permissions are helpful

### 9. Create Loading/Transition Screen

After confirmation, before AI analysis:

- [ ] Animated loading indicator
- [ ] Encouraging message: "Analyzing your responses..."
- [ ] Progress messages (fake, for UX):
  - "Identifying patterns..." (0-33%)
  - "Generating insights..." (34-66%)
  - "Preparing your profile..." (67-100%)
- [ ] Auto-navigate to next screen when ready

## UI/UX Requirements

### Design Principles

- Warm, encouraging tone (not corporate)
- High contrast for readability
- Generous white space
- Large touch targets (44pt minimum)
- Smooth animations between screens
- Celebrate progress (confetti on completion?)

### Accessibility

- [ ] VoiceOver/TalkBack support
- [ ] Dynamic type support
- [ ] Color contrast WCAG AA
- [ ] Keyboard navigation (if applicable)
- [ ] Clear focus indicators

### Performance

- [ ] Screens load instantly (<100ms)
- [ ] Animations at 60fps
- [ ] No janky scrolling
- [ ] Optimized images/assets

## Deliverables

1. **Complete Onboarding Flow**
   - All 5 screens functional
   - Smooth navigation between screens
   - Data saves to database

2. **Data Collection**
   - Past failures captured
   - Constraints captured
   - Goals captured
   - All data validated

3. **Progress Persistence**
   - Users can pause and resume
   - No data lost on app restart
   - Graceful error handling

4. **Analytics Integration**
   - Track completion funnel
   - Identify drop-off points
   - Measure time per screen

## Testing Checklist

### Functional Tests

- [ ] Complete full onboarding flow (happy path)
- [ ] Navigate backwards through all screens
- [ ] Test with minimum valid inputs
- [ ] Test with maximum inputs (character limits)
- [ ] Pause and resume onboarding
- [ ] Submit onboarding, verify data in DB
- [ ] Test on iOS
- [ ] Test on Android

### Validation Tests

- [ ] Cannot proceed without selecting past failure
- [ ] Cannot proceed without failure description
- [ ] Character counters work correctly
- [ ] Max 3 goals enforced
- [ ] Custom inputs save properly

### Edge Cases

- [ ] Network offline during submit
- [ ] App backgrounded mid-onboarding
- [ ] User logs out during onboarding
- [ ] Duplicate submission attempts
- [ ] Very long text inputs
- [ ] Special characters in text inputs

### UX Tests

- [ ] Progress indicator updates correctly
- [ ] Animations smooth on slow devices
- [ ] Buttons disabled appropriately
- [ ] Error messages clear and helpful
- [ ] Loading states show during save
- [ ] Success feedback after completion

## Risks & Mitigations

| Risk                         | Likelihood | Impact   | Mitigation                                          |
| ---------------------------- | ---------- | -------- | --------------------------------------------------- |
| High drop-off rate           | High       | Critical | A/B test copy, minimize screens, show progress      |
| Users give low-quality data  | Medium     | High     | Validation, character minimums, helpful prompts     |
| Network errors during submit | Medium     | Medium   | Retry logic, save locally, clear error messages     |
| Too time-consuming           | Low        | Medium   | Optimize copy, remove friction, show time remaining |

## Dependencies for Next Phase

Phase 5 (AI Failure Profile) requires:

- ✅ Onboarding data in user_profiles table
- ✅ User can complete onboarding successfully
- ✅ Data structure matches AI prompt requirements

## Notes

- This is users' first impression—make it great
- Quality > quantity of data collection
- Test drop-off rates aggressively
- Consider progressive disclosure (don't ask everything at once)
- "Why did these fail?" is the most valuable data point
- Keep tone light and encouraging, not judgmental
- Celebrate the user for being here ("Most people give up before trying an app like this")

## Resources

- [Multi-step Form Best Practices](https://www.smashingmagazine.com/2017/05/better-form-design-one-thing-per-page/)
- [Mobile Onboarding Patterns](https://www.mobile-patterns.com/onboarding)
- [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Form Validation in React Native](https://www.react-hook-form.com/)
