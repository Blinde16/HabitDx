/**
 * Habit Check-in Store
 * 
 * Manages daily habit check-ins, completion status, and streaks
 */

import { create } from 'zustand';
import HabitService from '../lib/habitService';
import type { Habit } from '../types/habit';
import { logHabit, logError, logInfo } from '../lib/logger';
import { track } from '../lib/analytics';

export type HabitStatus = 'not_done' | 'completed' | 'missed' | 'not_scheduled';

export interface HabitWithStatus extends Habit {
  status: HabitStatus;
  checked_in_at?: string;
  streak: number;
  last_obstacle?: string;
}

interface CheckinStore {
  // State
  todaysHabits: HabitWithStatus[];
  loading: boolean;
  error: string | null;
  selectedHabitForObstacle: string | null;

  // Actions
  initialize: (userId: string) => Promise<void>;
  fetchTodaysHabits: (userId: string) => Promise<void>;
  checkInHabit: (habitId: string, userId: string) => Promise<void>;
  undoCheckIn: (habitId: string, userId: string) => Promise<void>;
  logObstacle: (habitId: string, userId: string, obstacle: string, note?: string) => Promise<void>;
  setSelectedHabitForObstacle: (habitId: string | null) => void;
  
  // Computed
  getCompletionRate: () => number;
  getHabitById: (habitId: string) => HabitWithStatus | undefined;
}

export const useCheckinStore = create<CheckinStore>((set, get) => ({
  todaysHabits: [],
  loading: false,
  error: null,
  selectedHabitForObstacle: null,

  initialize: async (userId: string) => {
    await get().fetchTodaysHabits(userId);
  },

  fetchTodaysHabits: async (userId: string) => {
    try {
      set({ loading: true, error: null });
      logInfo('Fetching today\'s habits', { userId, event: 'checkin.fetchHabits' });

      // Get all active habits
      const allHabits = await HabitService.getActiveHabits(userId);

      // Get today's day of week (1=Monday, 7=Sunday)
      const today = new Date();
      const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay(); // Convert Sunday from 0 to 7
      const todayDate = today.toISOString().split('T')[0];

      // Filter habits scheduled for today and add status
      const habitsWithStatus: HabitWithStatus[] = await Promise.all(
        allHabits.map(async (habit) => {
          const isScheduledToday = habit.days_of_week.includes(dayOfWeek);

          if (!isScheduledToday) {
            return {
              ...habit,
              status: 'not_scheduled' as HabitStatus,
              streak: 0,
            };
          }

          // Check if already logged today
          const checkInHistory = await HabitService.getCheckInHistory(habit.id, 1);
          const todayLog = checkInHistory.find(log => log.log_date === todayDate);

          if (todayLog) {
            // Calculate streak
            const streak = await calculateStreak(habit.id, userId);
            
            return {
              ...habit,
              status: todayLog.completed ? 'completed' as HabitStatus : 'missed' as HabitStatus,
              checked_in_at: todayLog.checked_in_at as string,
              streak,
              last_obstacle:
                typeof todayLog.obstacle === 'string' ? todayLog.obstacle : undefined,
            };
          }

          // Not checked in yet - check if past reminder time
          const now = new Date();
          const [hours, minutes] = habit.reminder_time.split(':');
          const reminderTime = new Date(today);
          reminderTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

          const isPastReminder = now > reminderTime;
          const streak = await calculateStreak(habit.id, userId);

          return {
            ...habit,
            status: isPastReminder ? 'missed' as HabitStatus : 'not_done' as HabitStatus,
            streak,
          };
        })
      );

      // Sort: scheduled first, then by order_index
      const sortedHabits = habitsWithStatus.sort((a, b) => {
        if (a.status === 'not_scheduled' && b.status !== 'not_scheduled') return 1;
        if (a.status !== 'not_scheduled' && b.status === 'not_scheduled') return -1;
        return a.order_index - b.order_index;
      });

      set({ todaysHabits: sortedHabits, loading: false });
      logInfo('Today\'s habits fetched', { 
        userId, 
        habitCount: sortedHabits.length,
        event: 'checkin.fetchHabits.success' 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load habits';
      set({ error: errorMessage, loading: false });
      logError(error as Error, { context: 'checkin.fetchHabits', userId });
    }
  },

  checkInHabit: async (habitId: string, userId: string) => {
    try {
      logInfo('Checking in habit', { habitId, userId });

      // Optimistic update
      set((state) => ({
        todaysHabits: state.todaysHabits.map((h) =>
          h.id === habitId
            ? {
                ...h,
                status: 'completed' as HabitStatus,
                checked_in_at: new Date().toISOString(),
                streak: h.streak + 1,
              }
            : h
        ),
      }));

      // Save to database
      await HabitService.logCheckIn(habitId, userId, true);
      await track('habit_checked_in', { habitId });

      logInfo('Habit checked in successfully', { habitId, userId, event: 'checkin.complete' });
    } catch (error) {
      // Revert optimistic update on error
      await get().fetchTodaysHabits(userId);
      logError(error as Error, { context: 'checkin.checkIn', habitId, userId });
      throw error;
    }
  },

  undoCheckIn: async (habitId: string, userId: string) => {
    try {
      logInfo('Undoing habit check-in', { habitId, userId });

      // Optimistic update
      set((state) => ({
        todaysHabits: state.todaysHabits.map((h) =>
          h.id === habitId
            ? {
                ...h,
                status: 'not_done' as HabitStatus,
                checked_in_at: undefined,
                streak: Math.max(0, h.streak - 1),
              }
            : h
        ),
      }));

      // Delete today's log
      const today = new Date().toISOString().split('T')[0];
      // Note: HabitService would need deleteCheckIn method
      // For now, log as not completed
      await HabitService.logCheckIn(habitId, userId, false);
      await track('habit_checkin_undone', { habitId });

      logInfo('Habit check-in undone', { habitId, userId, event: 'checkin.undo' });
    } catch (error) {
      // Revert optimistic update on error
      await get().fetchTodaysHabits(userId);
      logError(error as Error, { context: 'checkin.undo', habitId, userId });
      throw error;
    }
  },

  logObstacle: async (habitId: string, userId: string, obstacle: string, note?: string) => {
    try {
      logInfo('Logging obstacle', { habitId, userId, obstacle });

      // Update status to missed with obstacle
      set((state) => ({
        todaysHabits: state.todaysHabits.map((h) =>
          h.id === habitId
            ? {
                ...h,
                status: 'missed' as HabitStatus,
                last_obstacle: obstacle,
              }
            : h
        ),
        selectedHabitForObstacle: null,
      }));

      // Save to database
      await HabitService.logCheckIn(habitId, userId, false, obstacle, note);
      await track('habit_obstacle_logged', {
        habitId,
        obstacle,
        hasNote: !!note,
      });

      logInfo('Obstacle logged', { habitId, userId, obstacle, event: 'checkin.obstacle' });
    } catch (error) {
      logError(error as Error, { context: 'checkin.logObstacle', habitId, userId });
      throw error;
    }
  },

  setSelectedHabitForObstacle: (habitId: string | null) => {
    set({ selectedHabitForObstacle: habitId });
  },

  getCompletionRate: () => {
    const { todaysHabits } = get();
    const scheduledToday = todaysHabits.filter(h => h.status !== 'not_scheduled');
    
    if (scheduledToday.length === 0) return 0;

    const completed = scheduledToday.filter(h => h.status === 'completed').length;
    return Math.round((completed / scheduledToday.length) * 100);
  },

  getHabitById: (habitId: string) => {
    const { todaysHabits } = get();
    return todaysHabits.find(h => h.id === habitId);
  },
}));

/**
 * Calculate habit streak (consecutive days completed)
 */
async function calculateStreak(habitId: string, userId: string): Promise<number> {
  try {
    const history = await HabitService.getCheckInHistory(habitId, 30);
    
    if (history.length === 0) return 0;

    let streak = 0;
    const today = new Date();

    // Start from today and count backwards
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateString = checkDate.toISOString().split('T')[0];

      const log = history.find(h => h.log_date === dateString);

      if (!log) {
        // No log for this date - check if habit was scheduled
        // If habit is scheduled daily, missing log breaks streak
        // For now, break streak on first missing day
        break;
      }

      if (log.completed) {
        streak++;
      } else {
        // Missed - break streak
        break;
      }
    }

    return streak;
  } catch (error) {
    logError(error as Error, { context: 'calculateStreak', habitId });
    return 0;
  }
}

export default useCheckinStore;
