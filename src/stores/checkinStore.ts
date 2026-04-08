/**
 * Habit Check-in Store
 * 
 * Manages daily habit check-ins, completion status, and streaks
 */

import { create } from 'zustand';
import HabitService from '../lib/habitService';
import type { Habit } from '../types/habit';
import { logError, logInfo } from '../lib/logger';
import { track } from '../lib/analytics';
import { getAppDate } from '../lib/devDate';

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
  totalCompletedCheckIns: number;
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
  updateHabitWording: (habitId: string, updates: Partial<Pick<Habit, 'name' | 'tiny_version' | 'anchor' | 'celebration'>>) => Promise<void>;
  
  // Computed
  getCompletionRate: () => number;
  getHabitById: (habitId: string) => HabitWithStatus | undefined;
}

export const useCheckinStore = create<CheckinStore>((set, get) => ({
  todaysHabits: [],
  totalCompletedCheckIns: 0,
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
      const today = getAppDate();
      const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay(); // Convert Sunday from 0 to 7
      const todayDate = toLocalDateString(today);

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
            const streak = await calculateStreak(habit);

            return {
              ...habit,
              status: todayLog.completed ? 'completed' as HabitStatus : 'missed' as HabitStatus,
              checked_in_at: todayLog.checked_in_at as string,
              streak,
              last_obstacle:
                typeof todayLog.obstacle === 'string' ? todayLog.obstacle : undefined,
            };
          }

          // Same day, not logged yet — never auto-mark missed based on reminder time
          const streak = await calculateStreak(habit);

          return {
            ...habit,
            status: 'not_done' as HabitStatus,
            streak,
          };
        })
      );

      const totalCompletedCheckIns = await HabitService.getTotalCompletedCheckIns(userId);

      // Sort: scheduled first, then by order_index
      const sortedHabits = habitsWithStatus.sort((a, b) => {
        if (a.status === 'not_scheduled' && b.status !== 'not_scheduled') return 1;
        if (a.status !== 'not_scheduled' && b.status === 'not_scheduled') return -1;
        return a.order_index - b.order_index;
      });

      set({ todaysHabits: sortedHabits, totalCompletedCheckIns, loading: false });
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
                checked_in_at: getAppDate().toISOString(),
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

      // Optimistic update (mirrors checkInHabit streak +1)
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

      const today = toLocalDateString(getAppDate());
      await HabitService.deleteCheckInForDate(habitId, userId, today);
      await track('habit_checkin_undone', { habitId });
      await get().fetchTodaysHabits(userId);
      logInfo('Habit check-in undone', { habitId, userId, event: 'checkin.undo' });
    } catch (error) {
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

  updateHabitWording: async (habitId, updates) => {
    const prev = get().todaysHabits.find((h) => h.id === habitId);
    if (!prev) return;

    // Optimistic update
    set((state) => ({
      todaysHabits: state.todaysHabits.map((h) =>
        h.id === habitId ? { ...h, ...updates } : h
      ),
    }));

    try {
      await HabitService.updateHabit(habitId, {
        ...updates,
        updated_at: new Date().toISOString(),
      });
      logInfo('Habit wording updated', { habitId, event: 'habit.wording.updated' });
    } catch (error) {
      // Revert on failure
      set((state) => ({
        todaysHabits: state.todaysHabits.map((h) =>
          h.id === habitId ? { ...h, name: prev.name, tiny_version: prev.tiny_version, anchor: prev.anchor, celebration: prev.celebration } : h
        ),
      }));
      logError(error as Error, { context: 'habit.updateWording', habitId });
      throw error;
    }
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

function toLocalDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** 1 = Monday … 7 = Sunday (matches `habit.days_of_week`) */
function getDayOfWeekMonSun(d: Date): number {
  const day = d.getDay();
  return day === 0 ? 7 : day;
}

/**
 * Consecutive scheduled days completed, counting backward from today.
 * Skips non-scheduled weekdays; same-day pending (no log yet) does not break streak.
 */
async function calculateStreak(habit: Habit): Promise<number> {
  try {
    const history = await HabitService.getCheckInHistory(habit.id, 120);
    const todayStr = toLocalDateString(getAppDate());
    let streak = 0;

    for (let i = 0; i < 120; i++) {
      const d = getAppDate();
      d.setDate(d.getDate() - i);
      const dateStr = toLocalDateString(d);
      const dow = getDayOfWeekMonSun(d);

      if (!habit.days_of_week.includes(dow)) {
        continue;
      }

      const log = history.find((h) => String(h.log_date) === dateStr) as
        | { completed?: boolean }
        | undefined;

      if (log?.completed === true) {
        streak++;
        continue;
      }

      if (log && log.completed === false) {
        break;
      }

      if (dateStr === todayStr) {
        continue;
      }

      break;
    }

    return streak;
  } catch (error) {
    logError(error as Error, { context: 'calculateStreak', habitId: habit.id });
    return 0;
  }
}

export default useCheckinStore;
