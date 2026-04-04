import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { useNotificationResponse } from '../hooks/useNotificationResponse';
import { habitDxFonts } from '../lib/fonts';
import '../../global.css';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const [fontsLoaded] = useFonts(habitDxFonts);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [fontsLoaded]);

  // Handle notification responses (deep linking)
  useNotificationResponse();

  // Auth initialization is handled by ProtectedRoute — calling initialize()
  // here too would register a second onAuthStateChange listener.

  if (!fontsLoaded) {
    return (
      <View className="flex-1 bg-surface items-center justify-center">
        <ActivityIndicator size="large" color="#191c1e" />
      </View>
    );
  }

  return (
    <ProtectedRoute>
      {/*
        Do not enumerate Stack.Screen here. On web, a manual list can omit nested
        routes (e.g. auth/callback) from the linking config and cause "Unmatched Route".
        File-based routes register automatically on the root Stack.
      */}
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </ProtectedRoute>
  );
}
