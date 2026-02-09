# Push Notifications Integration Guide

## Overview

HabitDx uses Expo Notifications to send daily habit reminders. This guide covers setup, scheduling, and best practices for push notifications in HabitDx.

## Key Features

- Per-habit reminder scheduling
- Smart default timing based on user schedule
- "Don't interrupt" modes (respect device settings)
- Deep linking to habit check-in
- Local notifications (no server required for MVP)

## Setup

### Install Dependencies

```bash
npx expo install expo-notifications expo-device expo-constants
```

### iOS Configuration

```json
// app.json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "UIBackgroundModes": ["remote-notification"]
      }
    },
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff",
          "sounds": ["./assets/notification.wav"]
        }
      ]
    ]
  }
}
```

### Android Configuration

```json
// app.json
{
  "expo": {
    "android": {
      "permissions": [
        "RECEIVE_BOOT_COMPLETED",
        "VIBRATE",
        "SCHEDULE_EXACT_ALARM"
      ]
    }
  }
}
```

## Permission Request

### Request Permission Flow

```typescript
// src/lib/notifications.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    console.log('Notifications only work on physical devices');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get push notification permissions');
    return false;
  }

  // Android-specific channel setup
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('habit-reminders', {
      name: 'Habit Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6366f1',
    });
  }

  return true;
}
```

### Permission Request UI

```typescript
// src/screens/onboarding/NotificationPermission.tsx
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '@/components/Button';
import { requestNotificationPermissions } from '@/lib/notifications';
import { router } from 'expo-router';

export default function NotificationPermissionScreen() {
  const [loading, setLoading] = useState(false);

  const handleEnableNotifications = async () => {
    setLoading(true);
    const granted = await requestNotificationPermissions();
    setLoading(false);

    if (granted) {
      // Store permission status
      await supabase
        .from('user_profiles')
        .update({ notifications_enabled: true })
        .eq('user_id', userId);
    }

    // Continue to next screen regardless
    router.push('/(tabs)/home');
  };

  const handleSkip = () => {
    router.push('/(tabs)/home');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stay on Track</Text>
      <Text style={styles.description}>
        Get a gentle reminder when it's time for your habits.
        You can customize or turn these off anytime.
      </Text>

      <Button
        title="Enable Reminders"
        onPress={handleEnableNotifications}
        loading={loading}
      />
      
      <Button
        title="Skip for Now"
        onPress={handleSkip}
        variant="ghost"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
});
```

## Notification Handler

### Configure Handler

```typescript
// src/lib/notifications.ts (continued)
import { router } from 'expo-router';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Handle notification tap (deep linking)
export function useNotificationObserver() {
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const habitId = response.notification.request.content.data.habitId;
        
        if (habitId) {
          // Navigate to home screen with habit highlighted
          router.push({
            pathname: '/(tabs)/home',
            params: { highlightHabit: habitId },
          });
        }
      }
    );

    return () => subscription.remove();
  }, []);
}
```

## Scheduling Notifications

### Schedule Habit Reminders

```typescript
// src/lib/notifications.ts (continued)
interface ScheduleReminderParams {
  habitId: string;
  habitName: string;
  reminderTime: string; // "HH:MM" format
  tinyVersion: string;
}

export async function scheduleHabitReminder({
  habitId,
  habitName,
  reminderTime,
  tinyVersion,
}: ScheduleReminderParams): Promise<string> {
  // Parse time
  const [hours, minutes] = reminderTime.split(':').map(Number);

  // Schedule daily notification
  const trigger = {
    hour: hours,
    minute: minutes,
    repeats: true,
  };

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: `Time for ${habitName}`,
      body: tinyVersion,
      data: { habitId },
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
      categoryIdentifier: 'habit-reminder',
    },
    trigger,
  });

  return notificationId;
}

// Cancel notification
export async function cancelHabitReminder(notificationId: string) {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

// Cancel all notifications for a habit
export async function cancelAllHabitReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
```

### Store Notification IDs

```typescript
// Update habits table to store notification ID
// Migration: Add column
alter table public.habits add column notification_id text;

// When scheduling notification
const notificationId = await scheduleHabitReminder({
  habitId: habit.id,
  habitName: habit.name,
  reminderTime: habit.reminder_time,
  tinyVersion: habit.tiny_version,
});

// Store in database
await supabase
  .from('habits')
  .update({ notification_id: notificationId })
  .eq('id', habit.id);
```

## Smart Scheduling

### Default Reminder Times

```typescript
// src/lib/notifications.ts (continued)
export function getDefaultReminderTime(
  energyPattern: 'morning' | 'afternoon' | 'evening',
  wakeTime: string
): string {
  // Parse wake time
  const [wakeHour, wakeMinute] = wakeTime.split(':').map(Number);

  switch (energyPattern) {
    case 'morning':
      // 30 minutes after wake time
      const morningTime = new Date();
      morningTime.setHours(wakeHour, wakeMinute + 30);
      return `${morningTime.getHours().toString().padStart(2, '0')}:${morningTime.getMinutes().toString().padStart(2, '0')}`;

    case 'afternoon':
      // 1 PM
      return '13:00';

    case 'evening':
      // 7 PM
      return '19:00';

    default:
      return '09:00';
  }
}
```

### Batch Schedule All Habits

```typescript
// src/hooks/useNotifications.ts
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useHabitStore } from '@/stores/habitStore';
import { scheduleHabitReminder, cancelAllHabitReminders } from '@/lib/notifications';

export function useScheduleHabitNotifications() {
  const { user } = useAuthStore();
  const { habits } = useHabitStore();

  useEffect(() => {
    if (!user || habits.length === 0) return;

    scheduleAllNotifications();
  }, [habits]);

  async function scheduleAllNotifications() {
    // Cancel existing notifications first
    await cancelAllHabitReminders();

    // Schedule new ones
    for (const habit of habits) {
      if (!habit.is_active) continue;

      const notificationId = await scheduleHabitReminder({
        habitId: habit.id,
        habitName: habit.name,
        reminderTime: habit.reminder_time,
        tinyVersion: habit.tiny_version,
      });

      // Update database with notification ID
      await supabase
        .from('habits')
        .update({ notification_id: notificationId })
        .eq('id', habit.id);
    }
  }
}
```

## User Controls

### Notification Settings

```typescript
// src/app/(tabs)/settings.tsx
import { Switch, View, Text, StyleSheet } from 'react-native';
import { useAuthStore } from '@/stores/authStore';
import { useHabitStore } from '@/stores/habitStore';

export default function NotificationSettings() {
  const { habits } = useHabitStore();
  const [globalEnabled, setGlobalEnabled] = useState(true);

  const handleGlobalToggle = async (value: boolean) => {
    setGlobalEnabled(value);

    if (value) {
      // Re-schedule all notifications
      await scheduleAllNotifications();
    } else {
      // Cancel all notifications
      await cancelAllHabitReminders();
    }
  };

  const handleHabitToggle = async (habitId: string, value: boolean) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    if (value) {
      // Schedule this habit's notification
      const notificationId = await scheduleHabitReminder({
        habitId: habit.id,
        habitName: habit.name,
        reminderTime: habit.reminder_time,
        tinyVersion: habit.tiny_version,
      });

      await supabase
        .from('habits')
        .update({ notification_id: notificationId })
        .eq('id', habitId);
    } else {
      // Cancel this habit's notification
      if (habit.notification_id) {
        await cancelHabitReminder(habit.notification_id);
      }

      await supabase
        .from('habits')
        .update({ notification_id: null })
        .eq('id', habitId);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.setting}>
        <Text style={styles.label}>All Reminders</Text>
        <Switch value={globalEnabled} onValueChange={handleGlobalToggle} />
      </View>

      {habits.map((habit) => (
        <View key={habit.id} style={styles.setting}>
          <View style={styles.habitInfo}>
            <Text style={styles.habitName}>{habit.name}</Text>
            <Text style={styles.reminderTime}>{habit.reminder_time}</Text>
          </View>
          <Switch
            value={!!habit.notification_id}
            onValueChange={(value) => handleHabitToggle(habit.id, value)}
            disabled={!globalEnabled}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 16,
  },
  reminderTime: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
});
```

### Time Picker for Custom Times

```typescript
// src/components/TimePicker.tsx
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform, Pressable, Text } from 'react-native';

interface TimePickerProps {
  value: string; // "HH:MM"
  onChange: (time: string) => void;
}

export function TimePicker({ value, onChange }: TimePickerProps) {
  const [show, setShow] = useState(false);
  
  const [hours, minutes] = value.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes);

  const handleChange = (event: any, selectedDate?: Date) => {
    setShow(Platform.OS === 'ios');
    
    if (selectedDate) {
      const time = `${selectedDate.getHours().toString().padStart(2, '0')}:${selectedDate.getMinutes().toString().padStart(2, '0')}`;
      onChange(time);
    }
  };

  return (
    <>
      <Pressable onPress={() => setShow(true)}>
        <Text>{value}</Text>
      </Pressable>

      {show && (
        <DateTimePicker
          value={date}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={handleChange}
        />
      )}
    </>
  );
}
```

## Testing

### Test Notifications Locally

```typescript
// Send test notification immediately
await Notifications.scheduleNotificationAsync({
  content: {
    title: "Test Notification",
    body: "This is a test",
  },
  trigger: { seconds: 2 },
});
```

### View Scheduled Notifications

```typescript
// Debug: List all scheduled notifications
const scheduled = await Notifications.getAllScheduledNotificationsAsync();
console.log('Scheduled notifications:', scheduled);
```

## Advanced Features (Post-MVP)

### Notification Actions

```typescript
// Add quick action buttons to notifications
await Notifications.setNotificationCategoryAsync('habit-reminder', [
  {
    identifier: 'done',
    buttonTitle: 'Done ✓',
    options: {
      opensAppToForeground: false,
    },
  },
  {
    identifier: 'snooze',
    buttonTitle: 'Remind me in 1 hour',
    options: {
      opensAppToForeground: false,
    },
  },
]);

// Handle action responses
Notifications.addNotificationResponseReceivedListener((response) => {
  if (response.actionIdentifier === 'done') {
    // Mark habit as complete
    checkInHabit(response.notification.request.content.data.habitId, true);
  } else if (response.actionIdentifier === 'snooze') {
    // Reschedule for 1 hour later
    scheduleSnooze(response.notification.request.content.data.habitId);
  }
});
```

### Adaptive Timing

```typescript
// Analyze when user typically checks in and adjust reminder time
function getOptimalReminderTime(habitLogs: HabitLog[]): string {
  const completionTimes = habitLogs
    .filter(log => log.completed)
    .map(log => new Date(log.created_at).getHours());

  // Calculate average completion hour
  const avgHour = Math.round(
    completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
  );

  // Send reminder 30 minutes before typical completion time
  return `${(avgHour - 1).toString().padStart(2, '0')}:30`;
}
```

### Silent Notifications

```typescript
// For analytics/background sync (future)
await Notifications.scheduleNotificationAsync({
  content: {
    title: '',
    body: '',
    data: { type: 'background-sync' },
  },
  trigger: {
    hour: 3,
    minute: 0,
    repeats: true,
  },
});
```

## Best Practices

1. **Always request permission with context** - Explain WHY notifications are helpful
2. **Respect user settings** - Make it easy to disable/customize
3. **Don't spam** - One reminder per habit per day maximum
4. **Test on real devices** - Simulators don't support push notifications properly
5. **Handle edge cases** - Time zone changes, app updates, etc.

## Troubleshooting

### Notifications Not Showing

1. Check permissions: `Notifications.getPermissionsAsync()`
2. Verify device is physical (not simulator)
3. Check Do Not Disturb mode
4. Verify notification channel (Android)

### Notifications Not Scheduling

1. Check trigger configuration
2. Verify notification handler is set
3. Test with immediate trigger first

### Deep Linking Not Working

1. Verify `scheme` in app.json
2. Test notification tap handler
3. Check router navigation path

## Performance Considerations

- Batch schedule notifications (don't schedule one at a time)
- Cancel old notifications before scheduling new ones
- Store notification IDs for easy cancellation
- Limit notification content size

## Next Steps

1. Request notification permissions in onboarding
2. Schedule notifications when habits are created
3. Allow users to customize reminder times
4. Implement notification settings screen
5. Add deep linking to habit check-in
6. Test on both iOS and Android

## References

- [Expo Notifications Documentation](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [iOS Notification Guidelines](https://developer.apple.com/design/human-interface-guidelines/notifications)
- [Android Notification Guidelines](https://developer.android.com/design/ui/mobile/guides/patterns/notifications)
- [React Native Community DateTimePicker](https://github.com/react-native-datetimepicker/datetimepicker)
