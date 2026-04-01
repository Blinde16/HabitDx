import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, unknown>;

const getOptionalString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const getOptionalBoolean = (value: unknown): boolean | undefined => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
  }

  return undefined;
};

/** Public repo — used when beta EXPO_PUBLIC_* URLs are unset so testers always get working links. */
const GITHUB_REPO_BASE = 'https://github.com/Blinde16/HabitDx';

const defaultBetaFeedbackUrl = `${GITHUB_REPO_BASE}/issues/new`;
const defaultBetaCommunityUrl = `${GITHUB_REPO_BASE}/discussions`;
const defaultBetaExitSurveyUrl = `${GITHUB_REPO_BASE}/issues/new?title=${encodeURIComponent('[Beta exit] ')}`;

export const appConfig = {
  privacyPolicyUrl: getOptionalString(extra.EXPO_PUBLIC_PRIVACY_POLICY_URL),
  termsUrl: getOptionalString(extra.EXPO_PUBLIC_TERMS_URL),
  betaFeedbackUrl: getOptionalString(extra.EXPO_PUBLIC_BETA_FEEDBACK_URL) ?? defaultBetaFeedbackUrl,
  betaCommunityUrl: getOptionalString(extra.EXPO_PUBLIC_BETA_COMMUNITY_URL) ?? defaultBetaCommunityUrl,
  betaExitSurveyUrl: getOptionalString(extra.EXPO_PUBLIC_BETA_EXIT_SURVEY_URL) ?? defaultBetaExitSurveyUrl,
  supportEmail: getOptionalString(extra.EXPO_PUBLIC_SUPPORT_EMAIL),
  analyticsProvider: getOptionalString(extra.EXPO_PUBLIC_ANALYTICS_PROVIDER) ?? 'logger',
  analyticsEnabled: getOptionalBoolean(extra.EXPO_PUBLIC_ANALYTICS_ENABLED) ?? true,
};

export default appConfig;
