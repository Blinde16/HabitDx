import { create } from 'zustand';
import { getAccessTokenForEdgeFunctions, supabase } from '@/lib/supabase';
import { logInfo, logError } from '@/lib/logger';
import { track } from '@/lib/analytics';

/**
 * Parse a frequency value that may be comma-separated day numbers ("1,3,5")
 * or a human-readable string like "3 days per week". Returns valid day
 * numbers (0-6) or an empty array on unparseable input.
 */
function parseFrequencyValue(value: string): number[] {
  const commaParts = value.split(',').map((s) => s.trim());
  const asNumbers = commaParts.map(Number);
  if (commaParts.length > 1 && asNumbers.every((n) => !isNaN(n))) {
    return asNumbers;
  }

  const countMatch = value.match(/(\d+)\s*days?\s*per\s*week/i);
  if (countMatch) {
    const count = Math.min(Math.max(parseInt(countMatch[1], 10), 1), 7);
    const spread: number[] = [];
    const step = 7 / count;
    for (let i = 0; i < count; i++) {
      spread.push(Math.round(i * step) % 7);
    }
    return spread.sort((a, b) => a - b);
  }

  return [];
}

interface CompletionStats {
  total_scheduled: number;
  total_completed: number;
  completion_rate: number;
  habits: {
    habit_id: string;
    habit_name: string;
    scheduled: number;
    completed: number;
    rate: number;
  }[];
}

interface Pattern {
  type: string;
  description: string;
  habits_affected: string[];
}

interface Adjustment {
  type: string;
  habit_id: string;
  habit_name: string;
  current_value: string;
  suggested_value: string;
  rationale: string;
}

export interface WeeklyIteration {
  id: string;
  user_id: string;
  week_start: string;
  week_end: string;
  completion_stats: CompletionStats;
  patterns_detected: Pattern[];
  adjustment_recommendation: Adjustment | null;
  insights: string;
  status: 'pending' | 'accepted' | 'declined';
  tokens_used: number;
  generation_time_ms: number;
  created_at: string;
}

interface IterationState {
  currentIteration: WeeklyIteration | null;
  iterationHistory: WeeklyIteration[];
  /** Initial load / history / generate — not used for accept/decline (avoids full-screen spinner on adjustment actions). */
  loading: boolean;
  /** Accept or decline adjustment in flight. */
  adjustmentSaving: boolean;
  error: string | null;

  // Actions
  generateWeeklyIteration: (userId: string) => Promise<WeeklyIteration | null>;
  loadLatestIteration: (userId: string) => Promise<void>;
  loadIterationHistory: (userId: string) => Promise<void>;
  acceptAdjustment: (iterationId: string, userId: string) => Promise<void>;
  declineAdjustment: (iterationId: string) => Promise<void>;
}

export const useIterationStore = create<IterationState>((set, get) => ({
  currentIteration: null,
  iterationHistory: [],
  loading: false,
  adjustmentSaving: false,
  error: null,

  generateWeeklyIteration: async (userId: string) => {
    try {
      set({ loading: true, error: null });

      logInfo('Generating weekly iteration', { userId });

      const accessToken = await getAccessTokenForEdgeFunctions();
      const startTime = Date.now();

      const { data, error } = await supabase.functions.invoke('weekly-iteration', {
        body: {},
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (error) {
        logError(error as Error, { context: 'iteration.generate' });
        throw error;
      }

      const duration = Date.now() - startTime;

      logInfo('Weekly iteration generated successfully', {
        userId,
        iterationId: data.iteration_id,
        tokensUsed: data.tokens_used,
        duration,
        hasAdjustment: !!data.adjustment_recommendation,
      });

      // Load the full iteration from database
      const { data: iteration, error: loadError } = await supabase
        .from('weekly_iterations')
        .select('*')
        .eq('id', data.iteration_id)
        .maybeSingle();

      if (loadError) throw loadError;
      if (!iteration) throw new Error('Weekly insight was created but could not be loaded. Try refreshing.');

      set({
        currentIteration: iteration as WeeklyIteration,
        loading: false,
      });

      await track('weekly_iteration_generated', {
        iterationId: data.iteration_id,
        hasAdjustment: !!data.adjustment_recommendation,
        completionRate: Math.round((iteration as WeeklyIteration).completion_stats.completion_rate * 100),
        tokensUsed: data.tokens_used,
      });

      return iteration as WeeklyIteration;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logError(error as Error, { context: 'iteration.generate' });
      set({
        error: errorMessage,
        loading: false,
      });
      return null;
    }
  },

  loadLatestIteration: async (userId: string) => {
    try {
      set({ loading: true, error: null });

      // Prefer the newest pending iteration so the Suggested Adjustment card can show even when an
      // older accepted/declined row would otherwise sort first by mistake, or when multiple rows exist.
      const { data: pendingRows, error: pendingError } = await supabase
        .from('weekly_iterations')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1);

      if (pendingError) throw pendingError;

      const pending = pendingRows && pendingRows.length > 0 ? pendingRows[0] : null;

      if (pending) {
        set({
          currentIteration: pending as WeeklyIteration,
          loading: false,
        });
        logInfo('Latest iteration loaded', {
          userId,
          hasIteration: true,
          source: 'pending',
        });
        return;
      }

      // No pending row: show the most recent iteration for the weekly readout (may be accepted/declined).
      const { data: rows, error } = await supabase
        .from('weekly_iterations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      const data = rows && rows.length > 0 ? rows[0] : null;

      set({
        currentIteration: data as WeeklyIteration | null,
        loading: false,
      });

      logInfo('Latest iteration loaded', {
        userId,
        hasIteration: !!data,
        source: 'latest',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logError(error as Error, { context: 'iteration.loadLatest' });
      set({
        error: errorMessage,
        loading: false,
      });
    }
  },

  loadIterationHistory: async (userId: string) => {
    try {
      set({ loading: true, error: null });

      const { data, error } = await supabase
        .from('weekly_iterations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({
        iterationHistory: (data as WeeklyIteration[]) || [],
        loading: false,
      });

      logInfo('Iteration history loaded', {
        userId,
        count: data?.length || 0,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logError(error as Error, { context: 'iteration.loadHistory' });
      set({
        error: errorMessage,
        loading: false,
      });
    }
  },

  acceptAdjustment: async (iterationId: string, _userId: string) => {
    try {
      set({ adjustmentSaving: true, error: null });

      const { currentIteration } = get();
      if (!currentIteration?.adjustment_recommendation) {
        throw new Error('No adjustment to accept');
      }

      logInfo('Accepting adjustment', {
        iterationId,
        adjustmentType: currentIteration.adjustment_recommendation.type,
      });

      // Update iteration status
      const { error: updateError } = await supabase
        .from('weekly_iterations')
        .update({
          status: 'accepted',
          updated_at: new Date().toISOString(),
        })
        .eq('id', iterationId);

      if (updateError) throw updateError;

      // Apply the adjustment to the habit
      const adjustment = currentIteration.adjustment_recommendation;
      let habitUpdateError: { message: string } | null = null;

      if (adjustment.type === 'TIME_CHANGE') {
        const { error } = await supabase
          .from('habits')
          .update({
            reminder_time: adjustment.suggested_value,
            updated_at: new Date().toISOString(),
          })
          .eq('id', adjustment.habit_id);
        habitUpdateError = error;
      } else if (adjustment.type === 'TINY_VERSION_SIMPLIFY') {
        const { error } = await supabase
          .from('habits')
          .update({
            tiny_version: adjustment.suggested_value,
            updated_at: new Date().toISOString(),
          })
          .eq('id', adjustment.habit_id);
        habitUpdateError = error;
      } else if (adjustment.type === 'ANCHOR_CHANGE') {
        const { error } = await supabase
          .from('habits')
          .update({
            anchor: adjustment.suggested_value,
            updated_at: new Date().toISOString(),
          })
          .eq('id', adjustment.habit_id);
        habitUpdateError = error;
      } else if (adjustment.type === 'FREQUENCY_REDUCE') {
        const newDays = parseFrequencyValue(adjustment.suggested_value);
        if (newDays.length === 0 || newDays.some((d) => d < 0 || d > 6)) {
          throw new Error(
            `Invalid frequency value: "${adjustment.suggested_value}". Expected comma-separated day numbers (0-6).`
          );
        }
        const { error } = await supabase
          .from('habits')
          .update({
            days_of_week: newDays,
            updated_at: new Date().toISOString(),
          })
          .eq('id', adjustment.habit_id);
        habitUpdateError = error;
      } else if (adjustment.type === 'OBSTACLE_MITIGATION') {
        logInfo('Obstacle mitigation accepted (coaching-only, no habit change)', {
          iterationId,
        });
      } else {
        logInfo('Unknown adjustment type accepted, no habit change applied', {
          iterationId,
          type: adjustment.type,
        });
      }

      if (habitUpdateError) {
        throw new Error(`Failed to update habit: ${habitUpdateError.message}`);
      }

      // Update current iteration
      set({
        currentIteration: {
          ...currentIteration,
          status: 'accepted',
        },
        adjustmentSaving: false,
      });

      await track('weekly_iteration_adjustment_accepted', {
        iterationId,
        adjustmentType: adjustment.type,
        habitId: adjustment.habit_id,
      });

      logInfo('Adjustment accepted and applied', { iterationId });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logError(error as Error, { context: 'iteration.acceptAdjustment' });
      set({
        error: errorMessage,
        adjustmentSaving: false,
      });
      throw error;
    }
  },

  declineAdjustment: async (iterationId: string) => {
    try {
      set({ adjustmentSaving: true, error: null });

      logInfo('Declining adjustment', { iterationId });

      const { error } = await supabase
        .from('weekly_iterations')
        .update({
          status: 'declined',
          updated_at: new Date().toISOString(),
        })
        .eq('id', iterationId);

      if (error) throw error;

      const { currentIteration } = get();
      set({
        currentIteration: currentIteration
          ? {
              ...currentIteration,
              status: 'declined',
            }
          : null,
        adjustmentSaving: false,
      });

      await track('weekly_iteration_adjustment_declined', {
        iterationId,
      });

      logInfo('Adjustment declined', { iterationId });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logError(error as Error, { context: 'iteration.declineAdjustment' });
      set({
        error: errorMessage,
        adjustmentSaving: false,
      });
      throw error;
    }
  },
}));
