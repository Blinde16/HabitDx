import { create } from 'zustand';
import { getAccessTokenForEdgeFunctions, supabase } from '@/lib/supabase';
import { logInfo, logError } from '@/lib/logger';
import { track } from '@/lib/analytics';

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
  loading: boolean;
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
        .single();

      if (loadError) throw loadError;

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

      const { data, error } = await supabase
        .from('weekly_iterations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      set({
        currentIteration: data as WeeklyIteration | null,
        loading: false,
      });

      logInfo('Latest iteration loaded', {
        userId,
        hasIteration: !!data,
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
      set({ loading: true, error: null });

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

      if (adjustment.type === 'TIME_CHANGE') {
        // Update reminder time
        await supabase
          .from('habits')
          .update({
            reminder_time: adjustment.suggested_value,
            updated_at: new Date().toISOString(),
          })
          .eq('id', adjustment.habit_id);
      } else if (adjustment.type === 'TINY_VERSION_SIMPLIFY') {
        // Update tiny version
        await supabase
          .from('habits')
          .update({
            tiny_version: adjustment.suggested_value,
            updated_at: new Date().toISOString(),
          })
          .eq('id', adjustment.habit_id);
      } else if (adjustment.type === 'ANCHOR_CHANGE') {
        // Update anchor
        await supabase
          .from('habits')
          .update({
            anchor: adjustment.suggested_value,
            updated_at: new Date().toISOString(),
          })
          .eq('id', adjustment.habit_id);
      } else if (adjustment.type === 'FREQUENCY_REDUCE') {
        // Parse and update days_of_week
        const newDays = adjustment.suggested_value.split(',').map(Number);
        await supabase
          .from('habits')
          .update({
            days_of_week: newDays,
            updated_at: new Date().toISOString(),
          })
          .eq('id', adjustment.habit_id);
      }

      // Update current iteration
      set({
        currentIteration: {
          ...currentIteration,
          status: 'accepted',
        },
        loading: false,
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
        loading: false,
      });
      throw error;
    }
  },

  declineAdjustment: async (iterationId: string) => {
    try {
      set({ loading: true, error: null });

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
      if (currentIteration) {
        set({
          currentIteration: {
            ...currentIteration,
            status: 'declined',
          },
          loading: false,
        });
      }

      await track('weekly_iteration_adjustment_declined', {
        iterationId,
      });

      logInfo('Adjustment declined', { iterationId });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logError(error as Error, { context: 'iteration.declineAdjustment' });
      set({
        error: errorMessage,
        loading: false,
      });
      throw error;
    }
  },
}));
