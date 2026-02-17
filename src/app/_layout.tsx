import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { useAuthStore } from '../stores/authStore';
import '../../global.css';

export default function RootLayout() {
  const { initialize } = useAuthStore();

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
      </Stack>
    </ProtectedRoute>
  );
}
