import 'dotenv/config';

export default {
  expo: {
    name: 'HabitDx',
    slug: 'habitdx',
    version: '1.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'light',
    splash: {
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.habitdx.app',
    },
    android: {
      package: 'com.habitdx.app',
    },
    scheme: 'habitdx',
    plugins: ['expo-router'],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {
        appRoot: './src/app',
      },
      EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      EXPO_PUBLIC_PRIVACY_POLICY_URL: process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL,
      EXPO_PUBLIC_TERMS_URL: process.env.EXPO_PUBLIC_TERMS_URL,
      EXPO_PUBLIC_BETA_FEEDBACK_URL: process.env.EXPO_PUBLIC_BETA_FEEDBACK_URL,
      EXPO_PUBLIC_BETA_COMMUNITY_URL: process.env.EXPO_PUBLIC_BETA_COMMUNITY_URL,
      EXPO_PUBLIC_BETA_EXIT_SURVEY_URL: process.env.EXPO_PUBLIC_BETA_EXIT_SURVEY_URL,
      EXPO_PUBLIC_SUPPORT_EMAIL: process.env.EXPO_PUBLIC_SUPPORT_EMAIL,
      EXPO_PUBLIC_ANALYTICS_PROVIDER: process.env.EXPO_PUBLIC_ANALYTICS_PROVIDER,
      EXPO_PUBLIC_ANALYTICS_ENABLED: process.env.EXPO_PUBLIC_ANALYTICS_ENABLED,
    },
  },
};
