/**
 * Type definitions for Habit Failure Profile
 */

export interface PersonalityInsights {
  strength: string;
  weakness: string;
  archetype: string;
}

export interface HabitFailureProfile {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;

  // AI-generated insights
  failure_patterns: string[]; // 2-4 key patterns
  root_causes: string[]; // 2-3 root causes
  personality_insights: string | PersonalityInsights; // JSON stored as string in DB
  recommendations: string[]; // 3-5 high-level suggestions

  // Sharing
  share_token: string; // Unique URL token for sharing
  view_count: number; // Number of times shared profile viewed

  // Metadata
  version: number; // Profile version for regeneration tracking
  is_active: boolean; // Current active profile (false for old versions)
  model_used: string; // AI model used (e.g., 'gpt-4o-mini')
  tokens_used: number; // OpenAI tokens consumed
  raw_response: string; // Raw JSON response from AI for debugging
}

export interface FailureProfileResponse {
  failure_patterns: string[];
  root_causes: string[];
  personality_insights: PersonalityInsights;
  recommendations: string[];
}

export interface GenerateProfileResult {
  profile: HabitFailureProfile;
  cached: boolean;
  generation_time_ms?: number;
}
