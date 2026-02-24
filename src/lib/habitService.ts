/**
 * Habit Service
 *
 * Handles API calls for habit generation, management, and logging
 */

import { supabase } from './supabase';
import { logAI, logError, logInfo, logHabit } from './logger';
import type { Habit, HabitStack, GenerateHabitsResult } from '../types/habit';

export class HabitService {
  /**
   * Generate personalized habit stack by calling the Edge Function
   */
  static async generateHabits(userId: string): Promise<GenerateHabitsResult> {
    try {
      logInfo('Generating habit stack', { userId, event: 'habits.generate.start' });

      const startTime = Date.now();

      const { data, error } = await supabase.functions.invoke('generate-habits', {
        body: {},
      });

      if (error) {
        let detail = error.message;
        if (error.context && typeof error.context.json === 'function') {
          try {
            const body = await error.context.json();
            detail = body?.error || body?.message || detail;
          } catch { /* ignore parse errors */ }
        }
        console.error('generate-habits error detail:', detail);
        logError(error, { context: 'habits.generate', userId });
        throw new Error(`Failed to generate habits: ${detail}`);
      }

      const duration = Date.now() - startTime;

      logAI.requestSuccess(userId, 'generate-habits', data.tokens_used, duration);

      logInfo('Habit stack generated successfully', {
        userId,
        habitCount: data.habits?.length || 0,
        cached: data.cached,
        duration,
        event: 'habits.generate.success',
      });

      return {
        stack: data.stack,
        habits: data.habits,
        generation_time_ms: duration,
      };
    } catch (error) {
      logAI.requestError(userId, 'generate-habits', error as Error);
      throw error;
    }
  }

  /**
   * Get active habit stack for a user
   */
  static async getActiveStack(userId: string): Promise<HabitStack | null> {
    try {
      const { data, error } = await supabase
        .from('habit_stacks')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data as HabitStack;
    } catch (error) {
      logError(error as Error, { context: 'habits.getActiveStack', userId });
      throw error;
    }
  }

  /**
   * Get all active habits for a user
   */
  static async getActiveHabits(userId: string): Promise<Habit[]> {
    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) {
        throw error;
      }

      return data as Habit[];
    } catch (error) {
      logError(error as Error, { context: 'habits.getActive', userId });
      throw error;
    }
  }

  /**
   * Get a specific habit by ID
   */
  static async getHabitById(habitId: string): Promise<Habit | null> {
    try {
      const { data, error } = await supabase.from('habits').select('*').eq('id', habitId).single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data as Habit;
    } catch (error) {
      logError(error as Error, { context: 'habits.getById', habitId });
      throw error;
    }
  }

  /**
   * Update a habit
   */
  static async updateHabit(habitId: string, updates: Partial<Habit>): Promise<Habit> {
    try {
      logHabit.updated('system', habitId, updates);

      const { data, error } = await supabase
        .from('habits')
        .update(updates)
        .eq('id', habitId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as Habit;
    } catch (error) {
      logError(error as Error, { context: 'habits.update', habitId });
      throw error;
    }
  }

  /**
   * Delete a habit (soft delete by setting is_active to false)
   */
  static async deleteHabit(habitId: string, userId: string): Promise<void> {
    try {
      logHabit.deleted(userId, habitId);

      const { error } = await supabase
        .from('habits')
        .update({ is_active: false })
        .eq('id', habitId);

      if (error) {
        throw error;
      }
    } catch (error) {
      logError(error as Error, { context: 'habits.delete', habitId });
      throw error;
    }
  }

  /**
   * Regenerate habit stack (creates new version, marks old as inactive)
   */
  static async regenerateHabits(userId: string): Promise<GenerateHabitsResult> {
    try {
      logInfo('Regenerating habit stack', { userId, event: 'habits.regenerate' });

      // Mark current active stack and its habits as inactive
      await supabase
        .from('habit_stacks')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('is_active', true);

      await supabase
        .from('habits')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('is_active', true);

      // Generate new stack
      return await this.generateHabits(userId);
    } catch (error) {
      logError(error as Error, { context: 'habits.regenerate', userId });
      throw error;
    }
  }

  /**
   * Log a habit check-in
   */
  static async logCheckIn(
    habitId: string,
    userId: string,
    completed: boolean,
    obstacle?: string,
    obstacleNote?: string
  ): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { error } = await supabase.from('habit_logs').upsert({
        habit_id: habitId,
        user_id: userId,
        logged_date: today,
        completed,
        partial: false,
        obstacle: obstacle || null,
        obstacle_note: obstacleNote || null,
      });

      if (error) {
        throw error;
      }

      logHabit.checkInSuccess(userId, habitId, completed, obstacle);
    } catch (error) {
      logHabit.checkInError(userId, habitId, error as Error);
      throw error;
    }
  }

  /**
   * Get check-in history for a habit
   */
  static async getCheckInHistory(
    habitId: string,
    days: number = 7
  ): Promise<Record<string, unknown>[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('habit_id', habitId)
        .gte('logged_date', startDate.toISOString().split('T')[0])
        .order('logged_date', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      logError(error as Error, { context: 'habits.getCheckInHistory', habitId });
      throw error;
    }
  }

  /**
   * Get completion rate for a habit
   */
  static async getCompletionRate(habitId: string, days: number = 7): Promise<number> {
    try {
      const history = await this.getCheckInHistory(habitId, days);

      if (history.length === 0) {
        return 0;
      }

      const completed = history.filter((log) => log.completed).length;
      return (completed / days) * 100;
    } catch (error) {
      logError(error as Error, { context: 'habits.getCompletionRate', habitId });
      return 0;
    }
  }
}

export default HabitService;
