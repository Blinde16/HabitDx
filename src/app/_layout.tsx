import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { useAuthStore } from '../stores/authStore';
import { useNotificationResponse } from '../hooks/useNotificationResponse';
import '../../global.css';

export default function RootLayout() {
  const { initialize } = useAuthStore();

  // Handle notification responses (deep linking)
  useNotificationResponse();

  useEffect(() => {
    // Initialize auth on app start
    initialize();
  }, [initialize]);

  return (
    <ProtectedRoute>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="share/[token]" />
        <Stack.Screen name="profile" />
      </Stack>
    </ProtectedRoute>
  );
}
