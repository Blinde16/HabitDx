import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';

export default function OnboardingLayout() {
  const { user, initialized, loading } = useAuthStore();

  if (!initialized || loading) {
    return null;
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#fff' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="chat" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="past-failures" />
      <Stack.Screen name="constraints" />
      <Stack.Screen name="goals" />
      <Stack.Screen name="confirmation" />
      <Stack.Screen name="failure-profile" />
      <Stack.Screen name="habits" />
      <Stack.Screen name="notifications" />
    </Stack>
  );
}
