/**
 * Database Types
 * Generated from Supabase schema
 * DO NOT EDIT MANUALLY - regenerate when schema changes
 */

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: UserProfile;
        Insert: UserProfileInsert;
        Update: UserProfileUpdate;
      };
      habit_failure_profiles: {
        Row: HabitFailureProfile;
        Insert: HabitFailureProfileInsert;
        Update: HabitFailureProfileUpdate;
      };
      habit_stacks: {
        Row: HabitStack;
        Insert: HabitStackInsert;
        Update: HabitStackUpdate;
      };
      habits: {
        Row: Habit;
        Insert: HabitInsert;
        Update: HabitUpdate;
      };
      habit_logs: {
        Row: HabitLog;
        Insert: HabitLogInsert;
        Update: HabitLogUpdate;
      };
      weekly_iterations: {
        Row: WeeklyIteration;
        Insert: WeeklyIterationInsert;
        Update: WeeklyIterationUpdate;
      };
    };
  };
}

// ============================================================================
// USER PROFILES
// ============================================================================

/**
 * Extended user profile data beyond auth.users
 */
export interface UserProfile {
  id: string;
  full_name: string | null;
  created_at: string;
  updated_at: string;

  // Onboarding data
  past_failures: string[] | null;
  constraints: Record<string, unknown> | null;
  goals: string[] | null;
  onboarding_completed: boolean;

  // Settings
  timezone: string;
  notification_enabled: boolean;
  weekly_iteration_day: number; // 0=Sun, 1=Mon, etc.
}

export interface UserProfileInsert {
  id: string;
  full_name?: string | null;
  past_failures?: string[] | null;
  constraints?: Record<string, unknown> | null;
  goals?: string[] | null;
  onboarding_completed?: boolean;
  timezone?: string;
  notification_enabled?: boolean;
  weekly_iteration_day?: number;
}

export interface UserProfileUpdate {
  full_name?: string | null;
  past_failures?: string[] | null;
  constraints?: Record<string, unknown> | null;
  goals?: string[] | null;
  onboarding_completed?: boolean;
  timezone?: string;
  notification_enabled?: boolean;
  weekly_iteration_day?: number;
}

// ============================================================================
// HABIT FAILURE PROFILES
// ============================================================================

/**
 * AI-generated diagnosis of user's failure patterns
 */
export interface HabitFailureProfile {
  id: string;
  user_id: string;
  created_at: string;

  // AI Analysis
  failure_patterns: string[] | null;
  root_causes: string[] | null;
  personality_insights: Record<string, unknown> | null;
  recommendations: string[] | null;

  // Shareability
  share_token: string | null;
  view_count: number;

  // Versioning
  version: number;
  is_active: boolean;
}

export interface HabitFailureProfileInsert {
  id?: string;
  user_id: string;
  failure_patterns?: string[] | null;
  root_causes?: string[] | null;
  personality_insights?: Record<string, unknown> | null;
  recommendations?: string[] | null;
  share_token?: string | null;
  version?: number;
  is_active?: boolean;
}

export interface HabitFailureProfileUpdate {
  failure_patterns?: string[] | null;
  root_causes?: string[] | null;
  personality_insights?: Record<string, unknown> | null;
  recommendations?: string[] | null;
  share_token?: string | null;
  view_count?: number;
  version?: number;
  is_active?: boolean;
}

// ============================================================================
// HABIT STACKS
// ============================================================================

/**
 * Collection of habits grouped together for a user
 */
export interface HabitStack {
  id: string;
  user_id: string;
  failure_profile_id: string | null;
  created_at: string;

  // Stack metadata
  name: string;
  description: string | null;
  is_active: boolean;

  // AI generation context
  generation_context: Record<string, unknown> | null;
}

export interface HabitStackInsert {
  id?: string;
  user_id: string;
  failure_profile_id?: string | null;
  name?: string;
  description?: string | null;
  is_active?: boolean;
  generation_context?: Record<string, unknown> | null;
}

export interface HabitStackUpdate {
  failure_profile_id?: string | null;
  name?: string;
  description?: string | null;
  is_active?: boolean;
  generation_context?: Record<string, unknown> | null;
}

// ============================================================================
// HABITS
// ============================================================================

export type FrequencyType = 'daily' | 'weekly' | 'custom';

/**
 * Individual habit definition within a stack
 */
export interface Habit {
  id: string;
  stack_id: string;
  created_at: string;

  // Habit details
  title: string;
  description: string | null;
  rationale: string | null;

  // Scheduling
  frequency_type: FrequencyType;
  frequency_days: number[] | null; // 0=Sun, 1=Mon, etc.
  reminder_time: string | null; // TIME format

  // Status
  is_active: boolean;
  archived_at: string | null;

  // Order in stack
  display_order: number;
}

export interface HabitInsert {
  id?: string;
  stack_id: string;
  title: string;
  description?: string | null;
  rationale?: string | null;
  frequency_type: FrequencyType;
  frequency_days?: number[] | null;
  reminder_time?: string | null;
  is_active?: boolean;
  display_order?: number;
}

export interface HabitUpdate {
  title?: string;
  description?: string | null;
  rationale?: string | null;
  frequency_type?: FrequencyType;
  frequency_days?: number[] | null;
  reminder_time?: string | null;
  is_active?: boolean;
  archived_at?: string | null;
  display_order?: number;
}

// ============================================================================
// HABIT LOGS
// ============================================================================

export type CheckInSource = 'app' | 'notification' | 'widget';

/**
 * Daily check-in record for habit completion
 */
export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;

  // Check-in data
  log_date: string; // DATE format
  completed: boolean;
  obstacle: string | null;

  // Metadata
  checked_in_at: string;
  checked_in_via: CheckInSource;
}

export interface HabitLogInsert {
  id?: string;
  habit_id: string;
  user_id: string;
  log_date: string;
  completed: boolean;
  obstacle?: string | null;
  checked_in_via?: CheckInSource;
}

export interface HabitLogUpdate {
  completed?: boolean;
  obstacle?: string | null;
}

// ============================================================================
// WEEKLY ITERATIONS
// ============================================================================

export type UserResponse = 'accepted' | 'declined' | 'pending';

/**
 * AI-generated weekly insights and habit adjustments
 */
export interface WeeklyIteration {
  id: string;
  user_id: string;
  stack_id: string | null;
  created_at: string;

  // Week metadata
  week_start_date: string; // DATE format
  week_end_date: string; // DATE format

  // AI Analysis
  patterns_detected: string[] | null;
  success_rate: Record<string, unknown> | null;
  adjustment_suggestion: string;
  adjustment_rationale: string | null;

  // User interaction
  user_response: UserResponse | null;
  responded_at: string | null;

  // Implementation
  implemented: boolean;
  implementation_notes: string | null;
}

export interface WeeklyIterationInsert {
  id?: string;
  user_id: string;
  stack_id?: string | null;
  week_start_date: string;
  week_end_date: string;
  patterns_detected?: string[] | null;
  success_rate?: Record<string, unknown> | null;
  adjustment_suggestion: string;
  adjustment_rationale?: string | null;
  user_response?: UserResponse | null;
  implemented?: boolean;
  implementation_notes?: string | null;
}

export interface WeeklyIterationUpdate {
  patterns_detected?: string[] | null;
  success_rate?: Record<string, unknown> | null;
  adjustment_suggestion?: string;
  adjustment_rationale?: string | null;
  user_response?: UserResponse | null;
  responded_at?: string | null;
  implemented?: boolean;
  implementation_notes?: string | null;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Helper type for database queries with relations
 */
export interface HabitWithStack extends Habit {
  stack: HabitStack;
}

export interface HabitLogWithHabit extends HabitLog {
  habit: Habit;
}

export interface HabitStackWithHabits extends HabitStack {
  habits: Habit[];
}

export interface UserProfileWithStack extends UserProfile {
  active_stack: HabitStack | null;
}

/**
 * Helper type for habit completion statistics
 */
export interface HabitStats {
  habit_id: string;
  total_days: number;
  completed_days: number;
  completion_rate: number;
  current_streak: number;
  longest_streak: number;
}

/**
 * Helper type for weekly summary
 */
export interface WeeklySummary {
  week_start: string;
  week_end: string;
  total_habits: number;
  total_completions: number;
  overall_completion_rate: number;
  habit_stats: HabitStats[];
}
