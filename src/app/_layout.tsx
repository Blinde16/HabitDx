import { Stack } from 'expo-router';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { useNotificationResponse } from '../hooks/useNotificationResponse';
import '../../global.css';

export default function RootLayout() {
  // Handle notification responses (deep linking)
  useNotificationResponse();

  // Auth initialization is handled by ProtectedRoute — calling initialize()
  // here too would register a second onAuthStateChange listener.

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
