/**
 * Failure Profile Service
 *
 * Handles API calls to generate and retrieve Habit Failure Profiles
 */

import { supabase } from './supabase';
import { logAI, logError, logInfo } from './logger';
import type {
  HabitFailureProfile,
  GenerateProfileResult,
  PersonalityInsights,
} from '../types/failure-profile';

export class FailureProfileService {
  /**
   * Generate a new Failure Profile by calling the Edge Function
   *
   * This calls the analyze-failure Edge Function which:
   * 1. Fetches user's onboarding data
   * 2. Constructs AI prompt
   * 3. Calls OpenAI GPT-4o-mini
   * 4. Saves profile to database
   * 5. Returns profile (or cached version if exists)
   */
  static async generateProfile(userId: string): Promise<GenerateProfileResult> {
    try {
      logInfo('Generating failure profile', { userId, event: 'failureProfile.generate.start' });

      const startTime = Date.now();

      // Call the Edge Function — supabase.functions.invoke attaches the
      // session token automatically from the client's auth state
      const { data, error } = await supabase.functions.invoke('analyze-failure', {
        method: 'POST',
      });

      if (error) {
        logError(error, { context: 'failureProfile.generate', userId });
        throw new Error(`Failed to generate profile: ${error.message}`);
      }

      const duration = Date.now() - startTime;

      logAI.requestSuccess(userId, 'generate-failure-profile', data.profile?.tokens_used, duration);

      logInfo('Failure profile generated successfully', {
        userId,
        cached: data.cached,
        duration,
        event: 'failureProfile.generate.success',
      });

      return data as GenerateProfileResult;
    } catch (error) {
      logAI.requestError(userId, 'generate-failure-profile', error as Error);
      throw error;
    }
  }

  /**
   * Get the active Failure Profile for a user
   */
  static async getActiveProfile(userId: string): Promise<HabitFailureProfile | null> {
    try {
      logInfo('Fetching active failure profile', { userId, event: 'failureProfile.fetch' });

      const { data, error } = await supabase
        .from('habit_failure_profiles')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned - user doesn't have a profile yet
          return null;
        }
        throw error;
      }

      return data as HabitFailureProfile;
    } catch (error) {
      logError(error as Error, { context: 'failureProfile.getActive', userId });
      throw error;
    }
  }

  /**
   * Get a profile by share token (for public sharing)
   */
  static async getProfileByShareToken(shareToken: string): Promise<HabitFailureProfile | null> {
    try {
      const { data, error } = await supabase
        .from('habit_failure_profiles')
        .select('*')
        .eq('share_token', shareToken)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      // Increment view count
      await supabase
        .from('habit_failure_profiles')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', data.id);

      return data as HabitFailureProfile;
    } catch (error) {
      logError(error as Error, { context: 'failureProfile.getByToken', shareToken });
      throw error;
    }
  }

  /**
   * Regenerate profile (creates new version and marks old as inactive)
   */
  static async regenerateProfile(userId: string): Promise<GenerateProfileResult> {
    try {
      logInfo('Regenerating failure profile', { userId, event: 'failureProfile.regenerate' });

      // Mark current active profile as inactive
      await supabase
        .from('habit_failure_profiles')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('is_active', true);

      // Generate new profile
      return await this.generateProfile(userId);
    } catch (error) {
      logError(error as Error, { context: 'failureProfile.regenerate', userId });
      throw error;
    }
  }

  /**
   * Parse personality insights (stored as JSON string in DB)
   */
  static parsePersonalityInsights(insights: string | PersonalityInsights): PersonalityInsights {
    if (typeof insights === 'string') {
      try {
        return JSON.parse(insights);
      } catch {
        // Fallback if parsing fails
        return {
          strength: 'Determined and goal-oriented',
          weakness: 'Perfectionism can lead to abandonment',
          archetype: 'High-Achiever',
        };
      }
    }
    return insights;
  }

  /**
   * Get share URL for a profile
   */
  static getShareUrl(shareToken: string): string {
    // In development, use localhost. In production, use actual domain
    const baseUrl = __DEV__ ? 'http://localhost:8081' : 'https://habitdx.app'; // Replace with actual domain

    return `${baseUrl}/share/${shareToken}`;
  }
}

export default FailureProfileService;
