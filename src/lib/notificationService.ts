/**
 * Notification Service
 * 
 * Handles notification scheduling and management for habits
 */

import * as Notifications from 'expo-notifications';
import { supabase } from './supabase';
import { logInfo, logError } from './logger';
import { isExpoWeb } from './runtime';
import type { Habit } from '../types/habit';

export class NotificationService {
  /**
   * Schedule notifications for all active habits
   */
  static async scheduleAllHabitReminders(userId: string): Promise<void> {
    if (isExpoWeb) {
      logInfo('Skipping habit reminders on web (not supported in browser)', { userId });
      return;
    }
    try {
      logInfo('Scheduling all habit reminders', { userId });

      // Get user's notification preference
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('notification_enabled')
        .eq('id', userId)
        .single();

      if (!profile?.notification_enabled) {
        logInfo('Notifications disabled for user', { userId });
        return;
      }

      // Get all active habits
      const { data: habits, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .eq('reminder_enabled', true);

      if (error) throw error;

      if (!habits || habits.length === 0) {
        logInfo('No habits with reminders enabled', { userId });
        return;
      }

      // Schedule notification for each habit
      for (const habit of habits) {
        await this.scheduleHabitReminder(habit as Habit);
      }

      logInfo('All habit reminders scheduled', { 
        userId, 
        count: habits.length 
      });
    } catch (error) {
      logError(error as Error, { context: 'notifications.scheduleAll', userId });
      throw error;
    }
  }

  /**
   * Schedule notification for a single habit
   */
  static async scheduleHabitReminder(habit: Habit): Promise<string | null> {
    if (isExpoWeb) {
      return null;
    }
    try {
      if (!habit.reminder_enabled || !habit.reminder_time) {
        return null;
      }

      // Cancel existing notifications for this habit
      await this.cancelHabitReminder(habit.id);

      // Parse reminder time (format: "HH:MM")
      const [hours, minutes] = habit.reminder_time.split(':').map(Number);
      
      // Generate motivational messages
      const messages = [
        `Time to ${habit.tiny_version}! Just 2 minutes.`,
        `Remember: ${habit.anchor} → ${habit.tiny_version}`,
        `${habit.celebration} awaits! Complete your habit now.`,
        `Keep your streak alive! ${habit.tiny_version}`,
        `Small win incoming: ${habit.tiny_version}`,
      ];
      
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];

      // Schedule notification
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `Time for ${habit.name} ✨`,
          body: randomMessage,
          data: {
            habitId: habit.id,
            type: 'habit_reminder',
            screen: '/(tabs)/home',
          },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          channelId: 'habit-reminders',
          hour: hours,
          minute: minutes,
          repeats: true,
        },
      });

      // Store notification ID in database
      await supabase
        .from('habits')
        .update({ 
          notification_id: notificationId,
          updated_at: new Date().toISOString()
        })
        .eq('id', habit.id);

      logInfo('Habit reminder scheduled', {
        habitId: habit.id,
        habitName: habit.name,
        notificationId,
        time: habit.reminder_time,
      });

      return notificationId;
    } catch (error) {
      logError(error as Error, { context: 'notifications.schedule', habitId: habit.id });
      return null;
    }
  }

  /**
   * Cancel notification for a single habit
   */
  static async cancelHabitReminder(habitId: string): Promise<void> {
    if (isExpoWeb) {
      return;
    }
    try {
      // Get habit's notification ID
      const { data: habit } = await supabase
        .from('habits')
        .select('notification_id')
        .eq('id', habitId)
        .single();

      if (habit?.notification_id) {
        await Notifications.cancelScheduledNotificationAsync(habit.notification_id);
        
        // Clear notification ID from database
        await supabase
          .from('habits')
          .update({ 
            notification_id: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', habitId);

        logInfo('Habit reminder cancelled', { 
          habitId,
          notificationId: habit.notification_id 
        });
      }
    } catch (error) {
      logError(error as Error, { context: 'notifications.cancel', habitId });
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  static async cancelAllReminders(): Promise<void> {
    if (isExpoWeb) {
      return;
    }
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      logInfo('All reminders cancelled');
    } catch (error) {
      logError(error as Error, { context: 'notifications.cancelAll' });
    }
  }

  /**
   * Reschedule notifications when habit is updated
   */
  static async updateHabitReminder(habit: Habit): Promise<void> {
    try {
      if (habit.reminder_enabled) {
        await this.scheduleHabitReminder(habit);
      } else {
        await this.cancelHabitReminder(habit.id);
      }
    } catch (error) {
      logError(error as Error, { context: 'notifications.update', habitId: habit.id });
    }
  }

  /**
   * Send a test notification
   */
  static async sendTestNotification(): Promise<void> {
    if (isExpoWeb) {
      throw new Error('Test notifications are not available in the browser. Use the mobile app.');
    }
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Test Notification 🔔',
          body: 'Notifications are working!',
          data: { type: 'test' },
        },
        trigger: null, // Send immediately
      });

      logInfo('Test notification sent');
    } catch (error) {
      logError(error as Error, { context: 'notifications.test' });
    }
  }

  /**
   * Get count of scheduled notifications
   */
  static async getScheduledCount(): Promise<number> {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      return notifications.length;
    } catch (error) {
      logError(error as Error, { context: 'notifications.getCount' });
      return 0;
    }
  }
}

export default NotificationService;
