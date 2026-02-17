# Phase 11: Testing & Quality Assurance

**Date Created:** February 9, 2026  
**Last Updated:** February 16, 2026  
**Phase Duration:** 5-7 days  
**Dependencies:** Phase 10 (UI/UX Polish)  
**Status:** Not Started

## Overview

Comprehensive testing and quality assurance phase to ensure HabitDx MVP is stable, bug-free, and ready for launch. This includes unit tests, integration tests, end-to-end testing, performance testing, and user acceptance testing.

## Goals

- Achieve >80% code coverage for critical paths
- Zero critical bugs at launch
- All user flows tested end-to-end
- Performance benchmarks met
- Security vulnerabilities addressed
- Beta user feedback incorporated

## Success Criteria

- [ ] All P0 bugs fixed
- [ ] Critical user flows work 100% of time
- [ ] Test coverage >80% for core features
- [ ] Performance tests pass on target devices
- [ ] 5+ beta users complete full onboarding
- [ ] Beta user satisfaction >4/5
- [ ] Security audit completed

## Testing Strategy

### Testing Pyramid

```
        /\
       /  \     E2E Tests (10%)
      /    \    - Full user flows
     /------\
    /        \  Integration Tests (30%)
   /          \ - API + DB interactions
  /------------\
 /              \ Unit Tests (60%)
/________________\ - Functions, utilities, components
```

## Unit Testing

### 1. Set Up Testing Infrastructure

```bash
npx expo install jest-expo jest
npm install --save-dev @testing-library/react-native @testing-library/jest-native
```

Tasks:

- [ ] Install Jest and React Native Testing Library
- [ ] Configure jest.config.js
- [ ] Set up test file structure (co-located with source)
- [ ] Add test scripts to package.json
- [ ] Configure coverage thresholds

### 2. Utility Function Tests

```typescript
// utils/__tests__/streaks.test.ts
describe('calculateStreak', () => {
  it('calculates current streak correctly', () => {
    const logs = [
      /* test data */
    ];
    expect(calculateStreak(logs)).toBe(5);
  });

  it('handles "don\'t miss twice" logic', () => {
    // One miss shouldn't break streak
    const logs = [
      /* test data with one gap */
    ];
    expect(calculateStreak(logs)).toBe(7);
  });

  it('breaks streak after two consecutive misses', () => {
    const logs = [
      /* test data with two gaps */
    ];
    expect(calculateStreak(logs)).toBe(0);
  });
});
```

Test files to create:

- [ ] `utils/__tests__/streaks.test.ts`
- [ ] `utils/__tests__/schedule.test.ts`
- [ ] `utils/__tests__/validation.test.ts`
- [ ] `utils/__tests__/dateHelpers.test.ts`

### 3. Component Unit Tests

```typescript
// components/__tests__/HabitCheckInCard.test.tsx
describe('HabitCheckInCard', () => {
  it('renders habit title and description', () => {
    render(<HabitCheckInCard habit={mockHabit} />);
    expect(screen.getByText('Morning Pages')).toBeOnTheScreen();
  });

  it('calls onCheckIn when tapped', () => {
    const onCheckIn = jest.fn();
    render(<HabitCheckInCard habit={mockHabit} onCheckIn={onCheckIn} />);

    fireEvent.press(screen.getByRole('button'));
    expect(onCheckIn).toHaveBeenCalledWith(mockHabit.id, true);
  });

  it('shows completed state when todayLog exists', () => {
    render(<HabitCheckInCard habit={mockHabit} todayLog={mockLog} />);
    expect(screen.getByText('Completed')).toBeOnTheScreen();
  });
});
```

Components to test:

- [ ] HabitCheckInCard
- [ ] OnboardingButton
- [ ] ProgressIndicator
- [ ] InsightCard
- [ ] ObstacleInputModal
- [ ] Button, Input, Card (design system components)

### 4. Store Tests

```typescript
// stores/__tests__/authStore.test.ts
describe('authStore', () => {
  beforeEach(() => {
    // Reset store state
  });

  it('signs in user and sets session', async () => {
    await authStore.signIn('test@example.com', 'password');
    expect(authStore.user).toBeDefined();
    expect(authStore.session).toBeDefined();
  });

  it('handles sign in errors', async () => {
    await expect(authStore.signIn('invalid@example.com', 'wrong')).rejects.toThrow();
  });
});
```

Stores to test:

- [ ] authStore
- [ ] onboardingStore
- [ ] habitStackStore
- [ ] checkInStore
- [ ] iterationStore
- [ ] notificationStore

### 5. Database Query Tests

```typescript
// lib/__tests__/db.test.ts
describe('database queries', () => {
  it('fetches user profile by ID', async () => {
    const { data, error } = await getProfile('user-id');
    expect(error).toBeNull();
    expect(data.id).toBe('user-id');
  });

  it('creates habit log with upsert', async () => {
    const logData = {
      /* ... */
    };
    const { data, error } = await createHabitLog(logData);
    expect(error).toBeNull();
    expect(data.habit_id).toBe(logData.habit_id);
  });
});
```

Queries to test:

- [ ] getProfile
- [ ] createHabitLog
- [ ] getTodayLogs
- [ ] getActiveHabitStack
- [ ] createHabitStack

## Integration Testing

### 1. API Integration Tests

Test Edge Functions with real Supabase instance:

```typescript
// supabase/functions/__tests__/analyze-failure.test.ts
describe('analyze-failure Edge Function', () => {
  it('generates failure profile from onboarding data', async () => {
    const response = await fetch('http://localhost:54321/functions/v1/analyze-failure', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ userId: 'test-user' }),
    });

    const data = await response.json();
    expect(data.failure_patterns).toBeDefined();
    expect(data.failure_patterns.length).toBeGreaterThan(0);
  });
});
```

Edge Functions to test:

- [ ] analyze-failure
- [ ] generate-habits
- [ ] weekly-iteration

### 2. Database Integration Tests

Test with Supabase local instance:

```bash
supabase start
npm run test:integration
```

Tests:

- [ ] User signup creates profile automatically
- [ ] RLS policies prevent unauthorized access
- [ ] Cascade deletes work correctly
- [ ] Triggers fire on expected events
- [ ] Upserts prevent duplicates

### 3. Auth Flow Integration Tests

- [ ] Sign up creates user and profile
- [ ] Email verification flow works
- [ ] Password reset flow works
- [ ] Google OAuth flow works (manual)
- [ ] Session persists across app restarts
- [ ] Sign out clears session

## End-to-End Testing

### 1. Set Up E2E Testing

```bash
npm install --save-dev detox
npx detox init
```

Configure Detox for iOS and Android:

- [ ] Install Detox
- [ ] Configure .detoxrc.json
- [ ] Set up iOS simulator/device
- [ ] Set up Android emulator/device
- [ ] Create E2E test scripts

### 2. Critical User Flows

#### Flow 1: New User Onboarding

```typescript
// e2e/onboarding.e2e.ts
describe('Onboarding Flow', () => {
  it('completes full onboarding to habit stack', async () => {
    // 1. Sign up
    await element(by.id('signup-button')).tap();
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('create-account-button')).tap();

    // 2. Complete onboarding screens
    await element(by.id('get-started-button')).tap();
    await element(by.id('past-failure-exercise')).tap();
    await element(by.id('next-button')).tap();
    // ... continue through all screens

    // 3. See generated habit stack
    await waitFor(element(by.id('habit-stack-screen')))
      .toBeVisible()
      .withTimeout(10000);
    await expect(element(by.text('Your Personalized Habit Stack'))).toBeVisible();

    // 4. Accept habit stack
    await element(by.id('accept-stack-button')).tap();

    // 5. Land on home screen
    await expect(element(by.id('home-screen'))).toBeVisible();
  });
});
```

#### Flow 2: Daily Check-in

```typescript
describe('Daily Check-in Flow', () => {
  it('checks in on habit and logs obstacle', async () => {
    // 1. Tap habit card
    await element(by.id('habit-card-0')).tap();
    await expect(element(by.id('completed-badge'))).toBeVisible();

    // 2. Tap second habit to skip
    await element(by.id('habit-card-1')).longPress();
    await element(by.id('skip-button')).tap();

    // 3. Add obstacle
    await element(by.id('obstacle-input')).typeText('No time');
    await element(by.id('save-obstacle-button')).tap();

    // 4. Verify completion summary updates
    await expect(element(by.text('1 of 2 completed'))).toBeVisible();
  });
});
```

#### Flow 3: Weekly Insight Review

```typescript
describe('Weekly Insight Flow', () => {
  it('views insight and accepts adjustment', async () => {
    // 1. Navigate to insights tab
    await element(by.id('insights-tab')).tap();

    // 2. Open latest insight
    await element(by.id('latest-insight-card')).tap();

    // 3. Review adjustment
    await expect(element(by.id('adjustment-suggestion'))).toBeVisible();

    // 4. Accept adjustment
    await element(by.id('accept-adjustment-button')).tap();

    // 5. Verify success message
    await expect(element(by.text('Adjustment applied!'))).toBeVisible();
  });
});
```

E2E tests to create:

- [ ] Full onboarding flow
- [ ] Daily check-in flow
- [ ] Weekly insight acceptance flow
- [ ] Notification tap opens app
- [ ] Settings changes persist

## Performance Testing

### 1. Load Time Benchmarks

```typescript
// performance/__tests__/load-times.test.ts
describe('Screen Load Performance', () => {
  it('home screen loads in <500ms', async () => {
    const start = performance.now();
    render(<HomeScreen />);
    const end = performance.now();

    expect(end - start).toBeLessThan(500);
  });
});
```

Benchmarks:

- [ ] App launch: <3 seconds (cold start)
- [ ] Home screen: <500ms
- [ ] Check-in tap: <100ms (optimistic update)
- [ ] Insights screen: <1 second
- [ ] Settings screen: <500ms

### 2. Animation Performance

- [ ] All animations run at 60fps
- [ ] No dropped frames during scroll
- [ ] Check-in animation smooth on iPhone SE (2016)
- [ ] Confetti animation doesn't lag

Use React DevTools Profiler:

- [ ] Identify slow components
- [ ] Optimize re-renders
- [ ] Memoize expensive calculations

### 3. Memory Usage

- [ ] App uses <100MB RAM (iOS)
- [ ] App uses <150MB RAM (Android)
- [ ] No memory leaks (use Instruments/Android Profiler)
- [ ] Images properly cached and released

### 4. Network Performance

- [ ] API calls timeout after 10 seconds
- [ ] Retry logic works on network errors
- [ ] Offline mode queues check-ins
- [ ] Images load progressively

## Security Testing

### 1. Authentication Security

- [ ] Passwords never logged or exposed
- [ ] Session tokens stored securely (SecureStore)
- [ ] Tokens expire after inactivity
- [ ] OAuth tokens handled correctly
- [ ] HTTPS enforced for all API calls

### 2. Data Security

- [ ] RLS policies tested thoroughly
- [ ] User A cannot access User B's data
- [ ] SQL injection prevented (parameterized queries)
- [ ] XSS prevented (sanitized inputs)
- [ ] CSRF tokens used where applicable

### 3. Dependency Vulnerabilities

```bash
npm audit
npm audit fix
```

- [ ] Run npm audit and fix vulnerabilities
- [ ] Update dependencies to latest secure versions
- [ ] Review high-severity issues
- [ ] Document accepted risks (if any)

### 4. Privacy Compliance

- [ ] Privacy policy in place
- [ ] Terms of service in place
- [ ] User data can be exported
- [ ] User data can be deleted
- [ ] No tracking without consent

## Beta Testing

### 1. Recruit Beta Users

Target: 10-15 beta testers

Criteria:

- [ ] Matches target persona (28-38, tried 3+ habit apps)
- [ ] Mix of iOS and Android users
- [ ] Willing to provide detailed feedback
- [ ] Available for 2-week testing period

### 2. Set Up Beta Distribution

iOS:

- [ ] Set up TestFlight
- [ ] Create beta build
- [ ] Invite beta testers
- [ ] Provide testing instructions

Android:

- [ ] Set up Google Play Internal Testing track
- [ ] Create beta build
- [ ] Invite beta testers
- [ ] Provide testing instructions

### 3. Beta Testing Script

Provide testers with guided tasks:

**Week 1:**

1. Complete onboarding (time yourself)
2. Review Habit Failure Profile (rate 1-5)
3. Review generated habits (rate 1-5)
4. Check in daily for 7 days
5. Report any bugs or confusion

**Week 2:** 6. Review weekly insight (rate 1-5) 7. Accept or decline adjustment 8. Continue checking in 9. Test notification behavior 10. Complete exit survey

### 4. Collect Feedback

Create feedback form:

- [ ] Overall satisfaction (1-5)
- [ ] Onboarding experience (1-5)
- [ ] Habit suggestions quality (1-5)
- [ ] Weekly insight quality (1-5)
- [ ] Likelihood to recommend (NPS)
- [ ] Open-ended: What did you love?
- [ ] Open-ended: What was confusing?
- [ ] Open-ended: What's missing?

### 5. Iterate Based on Feedback

- [ ] Categorize feedback (bugs, UX issues, feature requests)
- [ ] Prioritize P0 issues (blockers)
- [ ] Fix critical bugs
- [ ] Improve confusing UX
- [ ] Document feature requests for post-MVP

## Bug Tracking

### 1. Set Up Issue Tracker

Use GitHub Issues or similar:

Labels:

- `bug` - Something broken
- `p0-critical` - Must fix before launch
- `p1-high` - Fix soon after launch
- `p2-medium` - Fix eventually
- `ux-issue` - Not broken, but confusing
- `feature-request` - Not a bug, enhancement

### 2. Bug Triage Process

For each bug:

1. Reproduce the issue
2. Assign severity (P0/P1/P2)
3. Assign to team member
4. Fix and verify
5. Close issue

### 3. Pre-Launch Bug Criteria

**Cannot launch with:**

- [ ] P0 bugs (app crashes, data loss, auth broken)
- [ ] Security vulnerabilities
- [ ] Critical user flows broken

**Can launch with:**

- P1/P2 bugs (minor UI issues, edge cases)
- Known limitations (documented)

## Test Coverage Goals

### Critical Paths (100% coverage required):

- [ ] Authentication flow
- [ ] Onboarding data save
- [ ] Habit check-in logic
- [ ] Weekly iteration generation
- [ ] Notification scheduling

### High Priority (80% coverage target):

- [ ] All Zustand stores
- [ ] Database queries
- [ ] Utility functions
- [ ] Core components

### Medium Priority (50% coverage target):

- [ ] UI components
- [ ] Layout components
- [ ] Helper functions

## Deliverables

1. **Test Suite**
   - Unit tests for critical functions
   - Integration tests for API/DB
   - E2E tests for key flows
   - All tests passing

2. **Performance Baseline**
   - Benchmarks documented
   - Performance tests passing
   - No regressions identified

3. **Beta Feedback Report**
   - 10+ beta testers completed testing
   - Feedback collected and analyzed
   - Critical issues addressed

4. **Bug-Free MVP**
   - Zero P0 bugs remaining
   - P1 bugs documented for post-launch
   - App stable and ready to ship

## Testing Checklist

### Pre-Launch Checklist

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All E2E tests pass
- [ ] Test coverage >80% for critical paths
- [ ] No P0 bugs open
- [ ] Beta testing completed
- [ ] Beta feedback incorporated
- [ ] Performance benchmarks met
- [ ] Security audit completed
- [ ] Privacy policy in place
- [ ] Terms of service in place
- [ ] App icons and splash screen finalized
- [ ] App Store assets prepared

### Device Testing Matrix

Test on:

- [ ] iPhone 15 Pro (iOS 17)
- [ ] iPhone SE 2020 (iOS 17) - low-end iOS
- [ ] iPhone 12 (iOS 16) - older iOS version
- [ ] Samsung Galaxy S23 (Android 14)
- [ ] Google Pixel 6 (Android 13)
- [ ] OnePlus Nord (Android 12) - low-end Android

## Risks & Mitigations

| Risk                              | Likelihood | Impact | Mitigation                              |
| --------------------------------- | ---------- | ------ | --------------------------------------- |
| Beta users find critical bugs     | Medium     | High   | Fix immediately, delay launch if needed |
| Performance issues on old devices | Medium     | Medium | Optimize, test on target devices        |
| Test coverage too low             | Low        | Medium | Prioritize critical paths, add tests    |
| Beta users give negative feedback | Low        | High   | Iterate quickly, address concerns       |

## Dependencies for Next Phase

Phase 12 (MVP Launch) requires:

- ✅ All tests passing
- ✅ Zero P0 bugs
- ✅ Beta feedback positive (>4/5)
- ✅ Performance benchmarks met

## Notes

- Testing is ongoing, not a one-time phase
- Write tests while building features (don't save for end)
- Fix bugs immediately—don't accumulate technical debt
- Beta feedback is invaluable—listen carefully
- Don't over-test—focus on critical paths for MVP
- Document known issues clearly

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Detox E2E Testing](https://wix.github.io/Detox/)
- [Supabase Testing Guide](https://supabase.com/docs/guides/getting-started/local-development#testing)
- [React DevTools Profiler](https://react.dev/learn/react-developer-tools)
