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

      // Get session so we can attach auth header explicitly (required for web)
