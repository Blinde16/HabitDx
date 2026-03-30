import { Stack } from 'expo-router';

export default function OnboardingLayout() {
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
