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
    },
  },
};
