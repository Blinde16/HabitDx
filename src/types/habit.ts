/**
 * Type definitions for Habits and Habit Stacks
 */

export type FrequencyType = 'daily' | 'weekly' | 'custom';

export interface Habit {
  id: string;
  stack_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;

  // Habit definition
  name: string; // Short title
  tiny_version: string; // The absolute minimum viable version
  anchor: string; // "After I [existing routine]"
  celebration: string; // What to do after completing

  // Why this habit
  addresses_pattern: string; // Links to failure pattern
  rationale: string; // "Why this works for you" explanation

  // Scheduling
  reminder_time: string; // "08:00:00"
  reminder_enabled: boolean;
  days_of_week: number[]; // [1,2,3,4,5,6,7] where 1=Monday, 7=Sunday

  // Status
  is_active: boolean;
  order_index: number; // Display order (0, 1, 2)
}

export interface HabitStack {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;

  // Stack metadata
  version: number; // For regeneration tracking
  is_active: boolean; // Only one active stack per user

  // Generation context
  generation_rationale: string; // Why this combination
  based_on_profile_id: string; // FK to habit_failure_profiles
}

export interface GenerateHabitsInput {
  user_id: string;
  failure_profile_id: string;
}

export interface HabitResponse {
  name: string;
  tiny_version: string;
  anchor: string;
  celebration: string;
  addresses_pattern: string;
  rationale: string;
  reminder_time: string;
  days_of_week: number[];
}

export interface GenerateHabitsResponse {
  habits: HabitResponse[];
  stack_rationale: string;
}

export interface GenerateHabitsResult {
  stack: HabitStack;
  habits: Habit[];
  generation_time_ms: number;
}
