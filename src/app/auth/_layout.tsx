import { Stack } from 'expo-router';

/** Layout for /auth/* — used so OAuth can redirect to /auth/callback (Supabase default shape). */
export default function AuthSegmentLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#fff' },
      }}
    >
      {/** Explicit screen so `/auth/callback` is registered in web linking (avoids Unmatched Route). */}
      <Stack.Screen name="callback" />
    </Stack>
  );
}
