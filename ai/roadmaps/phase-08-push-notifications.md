# Phase 8: Push Notifications

**Date Created:** February 9, 2026  
**Last Updated:** February 16, 2026  
**Phase Duration:** 3-4 days  
**Dependencies:** Phase 7 (Daily Check-in System) ✅  
**Status:** ✅ Complete - February 16, 2026

## Overview

Implement push notifications to remind users to complete their habits at scheduled times. This is critical for retention and habit formation—notifications are the accountability trigger that brings users back to the app.

## Goals

- Send habit reminders at scheduled times
- Allow per-habit notification configuration
- Enable/disable notifications globally
- Handle notification permissions properly
- Support iOS and Android notification systems
- Track notification engagement metrics

## Success Criteria

- [ ] Notifications deliver at scheduled times
- [ ] Users can enable/disable per habit
- [ ] Notifications open app to check-in screen
- [ ] Deep linking works from notifications
- [ ] Notification permissions requested appropriately
- [ ] Works on both iOS and Android
- [ ] 40%+ notification engagement rate (target)

## Notification Types

### 1. Habit Reminders

**When:** At habit's scheduled reminder_time  
**Content:**

- Title: "Time for [Habit Name]"
- Body: "[Description]" or motivational message
- Action: Opens app to check-in screen

Example:

```
Title: Time for 5-Minute Morning Pages ✍️
Body: Clear your mind before the day starts
[Tap to check in]
```

### 2. Evening Nudge (Optional, P1)

**When:** 8 PM if no check-ins today  
**Content:**

- Title: "Don't forget your habits!"
- Body: "You have 2 habits left today"
- Action: Opens app to home screen

### 3. Streak Celebration (Optional, P1)

**When:** After check-in completes milestone  
**Content:**

- Title: "🔥 7-day streak!"
- Body: "You're building real consistency"
- Action: Opens app to achievements

### 4. Weekly Insight Available (Phase 9)

**When:** Every Monday (or user's weekly_iteration_day)  
**Content:**

- Title: "Your weekly insight is ready"
- Body: "See what we learned about your habits"
- Action: Opens app to insights screen

## Technical Tasks

### 1. Set Up Expo Notifications

```bash
npx expo install expo-notifications expo-device expo-constants
```

Configure:

- [ ] Install Expo Notifications SDK
- [ ] Configure app.json for notifications
- [ ] Set up iOS notification permissions
- [ ] Set up Android notification channel
- [ ] Configure notification icon (Android)
- [ ] Configure notification sounds

### 2. Configure app.json

```json
{
  "expo": {
    "name": "HabitDx",
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#4A90E2",
          "sounds": ["./assets/notification-sound.wav"]
        }
      ]
    ],
    "ios": {
      "infoPlist": {
        "UIBackgroundModes": ["remote-notification"]
      }
    },
    "android": {
      "googleServicesFile": "./google-services.json",
      "permissions": ["RECEIVE_BOOT_COMPLETED", "VIBRATE"]
    }
  }
}
```

Tasks:

- [ ] Add notification plugin to app.json
- [ ] Configure iOS background modes
- [ ] Configure Android permissions
- [ ] Add notification icon (Android)
- [ ] Add notification sound file
- [ ] Test configuration builds

### 3. Request Notification Permissions

```typescript
// hooks/useNotificationPermissions.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

export const useNotificationPermissions = () => {
  const requestPermissions = async () => {
    if (!Device.isDevice) {
      alert('Notifications only work on physical devices');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    return true;
  };

  return { requestPermissions };
};
```

Tasks:

- [ ] Create useNotificationPermissions hook
- [ ] Check existing permission status
- [ ] Request permissions if not granted
- [ ] Handle permission denied gracefully
- [ ] Save permission status to user_profiles
- [ ] Show explanation before requesting (iOS requirement)

### 4. Schedule Habit Notifications

```typescript
// lib/notifications.ts
import * as Notifications from 'expo-notifications';

export const scheduleHabitNotification = async (habit: Habit) => {
  // Parse reminder time
  const [hours, minutes] = habit.reminder_time.split(':').map(Number);

  // Schedule for each day in frequency_days
  const notificationIds: string[] = [];

  for (const day of habit.frequency_days) {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Time for ${habit.title}`,
        body: habit.description || 'Tap to check in',
        data: { habitId: habit.id, type: 'habit_reminder' },
        sound: true,
      },
      trigger: {
        weekday: day === 0 ? 1 : day + 1, // Expo uses 1=Sunday
        hour: hours,
        minute: minutes,
        repeats: true,
      },
    });

    notificationIds.push(id);
  }

  return notificationIds;
};

export const cancelHabitNotifications = async (notificationIds: string[]) => {
  await Promise.all(
    notificationIds.map((id) => Notifications.cancelScheduledNotificationAsync(id))
  );
};
```

Tasks:

- [ ] Create scheduleHabitNotification function
- [ ] Parse habit reminder_time to hours/minutes
- [ ] Schedule repeating notification for each day
- [ ] Store notification IDs (add to habits table)
- [ ] Create cancelHabitNotifications function
- [ ] Handle timezone considerations
- [ ] Test notification scheduling

### 5. Add Notification IDs to Database

Migration:

```sql
ALTER TABLE habits
ADD COLUMN notification_ids TEXT[] DEFAULT '{}';
```

Tasks:

- [ ] Create migration to add notification_ids column
- [ ] Update Habit TypeScript type
- [ ] Save notification IDs when scheduling
- [ ] Load notification IDs when canceling

### 6. Implement Notification Management Store

```typescript
// stores/notificationStore.ts
interface NotificationStore {
  permissionGranted: boolean;

  checkPermissions: () => Promise<boolean>;
  requestPermissions: () => Promise<boolean>;
  scheduleAllHabitNotifications: () => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
  toggleHabitNotifications: (habitId: string, enabled: boolean) => Promise<void>;
}
```

Tasks:

- [ ] Create notification Zustand store
- [ ] Implement checkPermissions
- [ ] Implement requestPermissions
- [ ] Implement scheduleAllHabitNotifications
- [ ] Implement cancelAllNotifications
- [ ] Implement toggleHabitNotifications
- [ ] Add error handling
- [ ] Sync with database

### 7. Build Notification Settings UI

```
app/(tabs)/settings.tsx or app/settings/notifications.tsx
```

UI Components:

- [ ] Section: "Notification Settings"
- [ ] Master toggle: "Enable Notifications"
  - When OFF: cancels all notifications
  - When ON: schedules all enabled habits
- [ ] Per-habit toggles:
  - List of all habits
  - Toggle switch per habit
  - Show scheduled time
- [ ] "Test Notification" button
- [ ] Permission status indicator

Tasks:

- [ ] Create notification settings screen
- [ ] Implement master toggle
- [ ] Implement per-habit toggles
- [ ] Add "Test Notification" functionality
- [ ] Show permission status
- [ ] Handle permission denied state (link to settings)

### 8. Handle Notification Interactions

```typescript
// App setup (in _layout.tsx or App.tsx)
import * as Notifications from 'expo-notifications';

// Set notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Listen for notification taps
useEffect(() => {
  const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
    const { habitId, type } = response.notification.request.content.data;

    if (type === 'habit_reminder') {
      // Navigate to check-in screen for this habit
      router.push(`/habit/${habitId}`);
    }
  });

  return () => subscription.remove();
}, []);
```

Tasks:

- [ ] Set up notification handler
- [ ] Listen for notification tap events
- [ ] Implement deep linking to habit check-in
- [ ] Handle app in foreground vs background
- [ ] Handle notification when app is closed
- [ ] Test on iOS and Android

### 9. Implement Deep Linking

```typescript
// app/habit/[habitId].tsx
// Detail screen for single habit check-in
export default function HabitDetailScreen() {
  const { habitId } = useLocalSearchParams();

  // Load habit data
  // Show check-in UI
  // Navigate back after check-in
}
```

Tasks:

- [ ] Create habit detail screen
- [ ] Accept habitId parameter
- [ ] Load habit data from ID
- [ ] Display check-in UI
- [ ] Handle check-in completion
- [ ] Navigate back to home

### 10. Add Notification Analytics

Track:

- [ ] Notification scheduled count
- [ ] Notification delivered count
- [ ] Notification tapped count
- [ ] Time between notification and check-in
- [ ] Notifications dismissed without action

Events:

```typescript
analytics.track('notification_scheduled', { habitId, time });
analytics.track('notification_delivered', { habitId });
analytics.track('notification_tapped', { habitId });
analytics.track('notification_dismissed', { habitId });
```

### 11. Handle Edge Cases

- [ ] User changes habit schedule (reschedule notifications)
- [ ] User disables habit (cancel notifications)
- [ ] User archives habit (cancel notifications)
- [ ] User changes timezone (reschedule all)
- [ ] User reinstalls app (reschedule all)
- [ ] Notifications while app is open (show in-app alert)
- [ ] Multiple habits at same time (group notifications)

### 12. Test Notifications on Physical Devices

iOS:

- [ ] Notifications appear on lock screen
- [ ] Notifications appear in notification center
- [ ] Tapping notification opens app
- [ ] Deep link navigates to correct screen
- [ ] Sound plays (if enabled)
- [ ] Permissions request shows correctly

Android:

- [ ] Notifications appear in notification shade
- [ ] Notification icon displays correctly
- [ ] Notification channel created
- [ ] Tapping notification opens app
- [ ] Deep link navigates correctly
- [ ] Sound plays (if enabled)

## UI/UX Considerations

### Notification Copy

- Keep title short (<40 characters)
- Body should be motivating, not nagging
- Use habit name + emoji for personality
- Vary message if possible (not always same text)

Example variations:

- "Time for Morning Pages ✍️"
- "Ready for Morning Pages? ✍️"
- "Let's do Morning Pages ✍️"

### Notification Timing

- Don't send too early (respect user's schedule)
- Don't send too late (people ignore late notifications)
- Consider "snooze" functionality (P1)
- Respect Do Not Disturb settings

### Permission Requesting

- Explain value before requesting ("We'll remind you at the perfect time")
- Don't request on first app launch (wait until onboarding complete)
- Handle "Don't Ask Again" gracefully
- Provide link to OS settings if permissions denied

## Deliverables

1. **Notification System**
   - Permissions requested appropriately
   - Notifications scheduled for all habits
   - Notifications deliver at correct times

2. **Settings UI**
   - Master notification toggle
   - Per-habit notification toggles
   - Permission status display

3. **Deep Linking**
   - Tapping notification opens app
   - Navigates to correct screen
   - Works from any app state

4. **Analytics**
   - Track notification engagement
   - Measure effectiveness

## Testing Checklist

### Functional Tests

- [ ] Request notification permissions
- [ ] Schedule notification for habit
- [ ] Receive notification at scheduled time
- [ ] Tap notification, app opens
- [ ] Deep link navigates to habit
- [ ] Disable notifications for habit
- [ ] Enable notifications again
- [ ] Master toggle disables all notifications
- [ ] Change habit schedule, notifications update

### Platform Tests

- [ ] iOS: Permissions request shows
- [ ] iOS: Notifications appear on lock screen
- [ ] iOS: Deep linking works
- [ ] iOS: Sound plays
- [ ] Android: Notification channel created
- [ ] Android: Notifications appear in shade
- [ ] Android: Icon displays correctly
- [ ] Android: Deep linking works
- [ ] Android: Sound plays

### Edge Cases

- [ ] App is closed when notification arrives
- [ ] App is in background when notification arrives
- [ ] App is in foreground when notification arrives
- [ ] Multiple notifications at same time
- [ ] User changes timezone
- [ ] User reinstalls app
- [ ] Notification permission denied
- [ ] Rapidly toggling notifications on/off

### Time-based Tests

- [ ] Schedule notification for 1 minute from now
- [ ] Verify notification arrives on time
- [ ] Schedule for each day of week
- [ ] Verify all days work correctly
- [ ] Test AM vs PM times
- [ ] Test midnight/noon edge cases

## Risks & Mitigations

| Risk                                 | Likelihood | Impact   | Mitigation                                    |
| ------------------------------------ | ---------- | -------- | --------------------------------------------- |
| Notifications don't deliver reliably | Medium     | Critical | Test extensively, monitor delivery rates      |
| Users deny permissions               | High       | High     | Explain value clearly, allow later re-request |
| Notifications annoy users            | Medium     | High     | Allow easy disable, don't over-notify         |
| Deep linking breaks                  | Low        | Medium   | Test all navigation paths thoroughly          |
| Timezone issues                      | Low        | Medium   | Use UTC, convert to local time correctly      |

## Performance Optimization

- [ ] Batch notification scheduling (don't schedule one-by-one)
- [ ] Cache permission status (don't check every time)
- [ ] Use background fetch for notification updates (iOS)
- [ ] Minimize notification payload size

## Dependencies for Next Phase

Phase 9 (Weekly Iteration AI) requires:

- ✅ Users checking in on habits
- ✅ Week of data collected
- ✅ Notifications bringing users back

## Notes

- Test on physical devices only—simulators don't support push
- iOS notification behavior differs from Android
- Permission request is one-time—don't waste it
- Monitor notification engagement rates closely
- Consider time zones for global users
- "Snooze for 10 minutes" is popular feature (P1)
- Don't send notifications after 10 PM by default

## Resources

- [Expo Notifications Documentation](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [iOS Push Notification Guide](https://developer.apple.com/documentation/usernotifications)
- [Android Notification Channels](https://developer.android.com/develop/ui/views/notifications)
- [Best Practices for Mobile Notifications](https://www.appcues.com/blog/push-notification-best-practices)
