import { useEffect, useRef } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter, useRootNavigationState } from 'expo-router';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';

export default function IndexScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const rootNavigationState = useRootNavigationState();
  // Boolean only: `rootNavigationState?.key` changes after every navigation; putting the key in the
  // dependency array re-ran this effect after each `router.replace`, causing "Maximum update depth"
  // (React minified error #185) in production.
  const navReady = Boolean(rootNavigationState?.key);
  /** Dedupes overlapping effect runs while the habit_stack query is in flight (React #185). */
  const routeInFlightRef = useRef(false);

  useEffect(() => {
    // Wait until the root navigator is mounted before navigating
    if (!navReady) return;

    if (!user?.id) {
      router.replace('/(auth)/login');
      return;
    }

    if (routeInFlightRef.current) {
      return;
    }
    routeInFlightRef.current = true;

    let cancelled = false;

    const routeUser = async () => {
      try {
        // Check if user has completed onboarding (has an active habit stack)
        const { data } = await supabase
          .from('habit_stacks')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .maybeSingle();

        if (cancelled) return;

        if (data) {
          router.replace('/(tabs)/home');
        } else {
          // Route exists at `app/(onboarding)/chat.tsx`; cast until typed routes refresh (`npx expo start`).
          router.replace('/(onboarding)/chat' as never);
        }
      } finally {
        routeInFlightRef.current = false;
      }
    };

    void routeUser();
    return () => {
      cancelled = true;
    };
  }, [navReady, user?.id, router]);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#8B5CF6" />
    </View>
  );
}
