import { create } from 'zustand';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface NotificationState {
  expoPushToken: string | null;
  notificationsEnabled: boolean;
  permissionStatus: 'granted' | 'denied' | 'undetermined';
  isLoading: boolean;
  error: string | null;
  
  // Actions
  requestPermissions: () => Promise<boolean>;
  registerForPushNotifications: () => Promise<void>;
  scheduleHabitReminder: (
    habitId: string,
    habitName: string,
    reminderTime: Date
  ) => Promise<string | null>;
  cancelHabitReminder: (notificationId: string) => Promise<void>;
  cancelAllReminders: () => Promise<void>;
  updateNotificationSettings: (enabled: boolean) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  expoPushToken: null,
  notificationsEnabled: false,
  permissionStatus: 'undetermined',
  isLoading: false,
  error: null,

  requestPermissions: async () => {
    try {
      set({ isLoading: true, error: null });

      // Check if physical device
      if (!Device.isDevice) {
        logger.warn('Push notifications do not work on simulator/emulator');
        set({ 
          permissionStatus: 'denied', 
          isLoading: false,
          error: 'Notifications require a physical device'
        });
        return false;
      }

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        logger.warn('Notification permissions denied');
        set({ 
          permissionStatus: 'denied', 
          isLoading: false,
          error: 'Notification permissions denied'
        });
        return false;
      }

      // Set up Android notification channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('habit-reminders', {
          name: 'Habit Reminders',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#4A90E2',
          sound: 'default',
        });
      }

      set({ 
        permissionStatus: 'granted', 
        notificationsEnabled: true,
        isLoading: false 
      });

      logger.info('Notification permissions granted');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error requesting notification permissions', { error: errorMessage });
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      return false;
    }
  },

  registerForPushNotifications: async () => {
    try {
      set({ isLoading: true, error: null });

      const hasPermission = await get().requestPermissions();
      if (!hasPermission) {
        return;
      }

      // Get push token
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-project-id', // TODO: Replace with actual Expo project ID
      });

      logger.info('Expo push token obtained', { token: token.data });

      // Save token to database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('user_profiles')
          .update({ 
            expo_push_token: token.data,
            notifications_enabled: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (error) {
          logger.error('Error saving push token', { error });
          throw error;
        }
      }

      set({ 
        expoPushToken: token.data,
        notificationsEnabled: true,
        isLoading: false 
      });

      logger.info('Push notifications registered successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error registering for push notifications', { error: errorMessage });
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
    }
  },

  scheduleHabitReminder: async (
    habitId: string,
    habitName: string,
    reminderTime: Date
  ) => {
    try {
      const { permissionStatus } = get();
      
      if (permissionStatus !== 'granted') {
        logger.warn('Cannot schedule reminder: permissions not granted');
        return null;
      }

      // Cancel existing notification for this habit
      const existingNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const habitNotifications = existingNotifications.filter(
        (notif) => notif.content.data?.habitId === habitId
      );
      
      for (const notif of habitNotifications) {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
      }

      // Schedule new notification
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `Time for ${habitName} ✨`,
          body: 'Tap to check in and keep your streak going!',
          data: { 
            habitId,
            type: 'habit_reminder',
            screen: 'home'
          },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          channelId: 'habit-reminders',
          hour: reminderTime.getHours(),
          minute: reminderTime.getMinutes(),
          repeats: true,
        },
      });

      logger.info('Habit reminder scheduled', { 
        habitId, 
        habitName,
        notificationId,
        time: reminderTime.toISOString()
      });

      return notificationId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error scheduling habit reminder', { 
        error: errorMessage,
        habitId,
        habitName 
      });
      return null;
    }
  },

  cancelHabitReminder: async (notificationId: string) => {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      logger.info('Habit reminder cancelled', { notificationId });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error cancelling habit reminder', { 
        error: errorMessage,
        notificationId 
      });
    }
  },

  cancelAllReminders: async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      logger.info('All habit reminders cancelled');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error cancelling all reminders', { error: errorMessage });
    }
  },

  updateNotificationSettings: async (enabled: boolean) => {
    try {
      set({ isLoading: true, error: null });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Update database
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          notifications_enabled: enabled,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      if (!enabled) {
        // Cancel all scheduled notifications
        await get().cancelAllReminders();
      }

      set({ 
        notificationsEnabled: enabled,
        isLoading: false 
      });

      logger.info('Notification settings updated', { enabled });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error updating notification settings', { error: errorMessage });
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
    }
  },
}));
