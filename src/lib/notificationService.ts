/**
 * Notification Service
 * 
 * Handles notification scheduling and management for habits
 */

import * as Notifications from 'expo-notifications';
import { supabase } from './supabase';
import { logger } from './logger';
import type { Habit } from '../types/habit';

export class NotificationService {
  /**
   * Schedule notifications for all active habits
   */
  static async scheduleAllHabitReminders(userId: string): Promise<void> {
    try {
      logger.info('Scheduling all habit reminders', { userId });

      // Get user's notification preference
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('notifications_enabled')
        .eq('id', userId)
        .single();

      if (!profile?.notifications_enabled) {
        logger.info('Notifications disabled for user', { userId });
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
        logger.info('No habits with reminders enabled', { userId });
        return;
      }

      // Schedule notification for each habit
      for (const habit of habits) {
        await this.scheduleHabitReminder(habit as Habit);
      }

      logger.info('All habit reminders scheduled', { 
        userId, 
        count: habits.length 
      });
    } catch (error) {
      logger.error('Error scheduling all habit reminders', { 
        error,
        userId 
      });
      throw error;
    }
  }

  /**
   * Schedule notification for a single habit
   */
  static async scheduleHabitReminder(habit: Habit): Promise<string | null> {
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

      logger.info('Habit reminder scheduled', {
        habitId: habit.id,
        habitName: habit.name,
        notificationId,
        time: habit.reminder_time,
      });

      return notificationId;
    } catch (error) {
      logger.error('Error scheduling habit reminder', {
        error,
        habitId: habit.id,
        habitName: habit.name,
      });
      return null;
    }
  }

  /**
   * Cancel notification for a single habit
   */
  static async cancelHabitReminder(habitId: string): Promise<void> {
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

        logger.info('Habit reminder cancelled', { 
          habitId,
          notificationId: habit.notification_id 
        });
      }
    } catch (error) {
      logger.error('Error cancelling habit reminder', {
        error,
        habitId,
      });
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  static async cancelAllReminders(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      logger.info('All reminders cancelled');
    } catch (error) {
      logger.error('Error cancelling all reminders', { error });
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
      logger.error('Error updating habit reminder', {
        error,
        habitId: habit.id,
      });
    }
  }

  /**
   * Send a test notification
   */
  static async sendTestNotification(): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Test Notification 🔔',
          body: 'Notifications are working!',
          data: { type: 'test' },
        },
        trigger: null, // Send immediately
      });

      logger.info('Test notification sent');
    } catch (error) {
      logger.error('Error sending test notification', { error });
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
      logger.error('Error getting scheduled notification count', { error });
      return 0;
    }
  }
}

export default NotificationService;
