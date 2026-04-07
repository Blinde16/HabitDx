/**
 * Database Service Layer
 * Type-safe database operations using Supabase client
 */

import { supabase } from './supabase';
import { getAppDate } from './devDate';
import type {
  UserProfile,
  UserProfileUpdate,
  HabitStack,
  HabitStackInsert,
  Habit,
  HabitInsert,
  HabitLog,
  HabitLogInsert,
  HabitFailureProfile,
  WeeklyIteration,
} from '../types/database';

// ============================================================================
// USER PROFILES
// ============================================================================

/**
 * Get user profile by ID
 */
export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  return { data: data as UserProfile | null, error };
};

/**
 * Update user profile
 */
export const updateProfile = async (userId: string, updates: UserProfileUpdate) => {
  // Use upsert to handle cases where the profile row doesn't exist yet
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({ id: userId, ...updates }, { onConflict: 'id' })
    .select()
    .single();

  return { data: data as UserProfile | null, error };
};

/**
 * Check if user has completed onboarding
 */
export const hasCompletedOnboarding = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('onboarding_completed')
    .eq('id', userId)
    .single();

  return { completed: data?.onboarding_completed ?? false, error };
};

// ============================================================================
// HABIT FAILURE PROFILES
// ============================================================================

/**
 * Get active failure profile for user
 */
export const getActiveFailureProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('habit_failure_profiles')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();

  return { data: data as HabitFailureProfile | null, error };
};

/**
 * Get failure profile by share token (public access)
 */
export const getFailureProfileByToken = async (shareToken: string) => {
  const { data, error } = await supabase
    .from('habit_failure_profiles')
    .select('*')
    .eq('share_token', shareToken)
    .single();

  // Increment view count
  if (data) {
    await supabase
      .from('habit_failure_profiles')
      .update({ view_count: data.view_count + 1 })
      .eq('id', data.id);
  }

  return { data: data as HabitFailureProfile | null, error };
};

// ============================================================================
// HABIT STACKS
// ============================================================================

/**
 * Get active habit stack for user
 */
export const getActiveStack = async (userId: string) => {
  const { data, error } = await supabase
    .from('habit_stacks')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();

  return { data: data as HabitStack | null, error };
};

/**
 * Create a new habit stack
 */
export const createStack = async (stack: HabitStackInsert) => {
  const { data, error } = await supabase.from('habit_stacks').insert(stack).select().single();

  return { data: data as HabitStack | null, error };
};

/**
 * Get all habit stacks for user
 */
export const getUserStacks = async (userId: string) => {
  const { data, error } = await supabase
    .from('habit_stacks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return { data: data as HabitStack[] | null, error };
};

// ============================================================================
// HABITS
// ============================================================================

/**
 * Get all habits for a stack
 */
export const getStackHabits = async (stackId: string) => {
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('stack_id', stackId)
    .eq('is_active', true)
    .order('order_index', { ascending: true });

  return { data: data as Habit[] | null, error };
};

/**
 * Create a new habit
 */
export const createHabit = async (habit: HabitInsert) => {
  const { data, error } = await supabase.from('habits').insert(habit).select().single();

  return { data: data as Habit | null, error };
};

/**
 * Update a habit
 */
export const updateHabit = async (habitId: string, updates: Partial<Habit>) => {
  const { data, error } = await supabase
    .from('habits')
    .update(updates)
    .eq('id', habitId)
    .select()
    .single();

  return { data: data as Habit | null, error };
};

/**
 * Archive a habit (soft delete)
 */
export const archiveHabit = async (habitId: string) => {
  const { data, error } = await supabase
    .from('habits')
    .update({ is_active: false, archived_at: new Date().toISOString() })
    .eq('id', habitId)
    .select()
    .single();

  return { data: data as Habit | null, error };
};

// ============================================================================
// HABIT LOGS
// ============================================================================

/**
 * Get habit logs for a date range
 */
export const getHabitLogs = async (userId: string, startDate: string, endDate: string) => {
  const { data, error } = await supabase
    .from('habit_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('log_date', startDate)
    .lte('log_date', endDate)
    .order('log_date', { ascending: false });

  return { data: data as HabitLog[] | null, error };
};

/**
 * Get logs for a specific habit
 */
export const getHabitLogsByHabit = async (habitId: string, startDate: string, endDate: string) => {
  const { data, error } = await supabase
    .from('habit_logs')
    .select('*')
    .eq('habit_id', habitId)
    .gte('log_date', startDate)
    .lte('log_date', endDate)
    .order('log_date', { ascending: false });

  return { data: data as HabitLog[] | null, error };
};

/**
 * Create or update a habit log
 */
export const upsertHabitLog = async (log: HabitLogInsert) => {
  const { data, error } = await supabase
    .from('habit_logs')
    .upsert(log, { onConflict: 'habit_id,log_date' })
    .select()
    .single();

  return { data: data as HabitLog | null, error };
};

/**
 * Get today's logs for user
 */
export const getTodayLogs = async (userId: string) => {
  const today = getAppDate().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('habit_logs')
    .select('*, habits(*)')
    .eq('user_id', userId)
    .eq('log_date', today);

  return { data, error };
};

// ============================================================================
// WEEKLY ITERATIONS
// ============================================================================

/**
 * Get weekly iterations for user
 */
export const getWeeklyIterations = async (userId: string, limit = 10) => {
  const { data, error } = await supabase
    .from('weekly_iterations')
    .select('*')
    .eq('user_id', userId)
    .order('week_start_date', { ascending: false })
    .limit(limit);

  return { data: data as WeeklyIteration[] | null, error };
};

/**
 * Get latest pending iteration
 */
export const getPendingIteration = async (userId: string) => {
  const { data, error } = await supabase
    .from('weekly_iterations')
    .select('*')
    .eq('user_id', userId)
    .eq('user_response', 'pending')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return { data: data as WeeklyIteration | null, error };
};

// ============================================================================
// STATISTICS & ANALYTICS
// ============================================================================

/**
 * Calculate habit completion rate for a date range
 */
export const getHabitCompletionRate = async (
  habitId: string,
  startDate: string,
  endDate: string
) => {
  const { data, error } = await supabase.rpc('get_habit_completion_rate', {
    p_habit_id: habitId,
    p_start_date: startDate,
    p_end_date: endDate,
  });

  return { rate: data as number | null, error };
};

/**
 * Get habit statistics for a user
 */
export const getUserHabitStats = async (userId: string, days = 30) => {
  const endDate = getAppDate().toISOString().split('T')[0];
  const now = getAppDate();
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const { data: logs, error } = await supabase
    .from('habit_logs')
    .select('habit_id, completed')
    .eq('user_id', userId)
    .gte('log_date', startDate)
    .lte('log_date', endDate);

  if (error || !logs) {
    return { stats: null, error };
  }

  // Calculate stats per habit
  const habitStats = logs.reduce(
    (acc, log) => {
      if (!acc[log.habit_id]) {
        acc[log.habit_id] = { total: 0, completed: 0 };
      }
      acc[log.habit_id].total++;
      if (log.completed) {
        acc[log.habit_id].completed++;
      }
      return acc;
    },
    {} as Record<string, { total: number; completed: number }>
  );

  return { stats: habitStats, error: null };
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if a habit log exists for a specific date
 */
export const hasLogForDate = async (habitId: string, date: string) => {
  const { data, error } = await supabase
    .from('habit_logs')
    .select('id')
    .eq('habit_id', habitId)
    .eq('log_date', date)
    .single();

  return { exists: !!data, error };
};

/**
 * Get week range for a date
 */
export const getWeekRange = async (date: string, startDay = 1) => {
  const { data, error } = await supabase.rpc('calculate_week_range', {
    input_date: date,
    start_day: startDay,
  });

  return { data, error };
};
