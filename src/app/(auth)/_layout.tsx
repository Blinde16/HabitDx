import { Redirect, Stack, useSegments } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';

export default function AuthLayout() {
  const { user, initialized, loading } = useAuthStore();
  const segments = useSegments();

  if (!initialized || loading) {
    return null;
  }

  const leaf = segments[1];
  const onAuthForm =
    leaf === 'login' ||
    leaf === 'signup' ||
    leaf === 'forgot-password' ||
    leaf === 'reset-password';

  if (user && onAuthForm) {
    return <Redirect href="/" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#fff' },
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="callback" />
    </Stack>
  );
}
