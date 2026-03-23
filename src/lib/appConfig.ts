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

export const appConfig = {
  privacyPolicyUrl: getOptionalString(extra.EXPO_PUBLIC_PRIVACY_POLICY_URL),
  termsUrl: getOptionalString(extra.EXPO_PUBLIC_TERMS_URL),
  betaFeedbackUrl: getOptionalString(extra.EXPO_PUBLIC_BETA_FEEDBACK_URL),
  betaCommunityUrl: getOptionalString(extra.EXPO_PUBLIC_BETA_COMMUNITY_URL),
  betaExitSurveyUrl: getOptionalString(extra.EXPO_PUBLIC_BETA_EXIT_SURVEY_URL),
  supportEmail: getOptionalString(extra.EXPO_PUBLIC_SUPPORT_EMAIL),
  analyticsProvider: getOptionalString(extra.EXPO_PUBLIC_ANALYTICS_PROVIDER) ?? 'logger',
  analyticsEnabled: getOptionalBoolean(extra.EXPO_PUBLIC_ANALYTICS_ENABLED) ?? true,
};

export default appConfig;
