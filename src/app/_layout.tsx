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
