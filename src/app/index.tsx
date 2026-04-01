import { useEffect, useRef } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect, useRouter, useRootNavigationState } from 'expo-router';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';

export default function IndexScreen() {
  const router = useRouter();
  const { user, initialized, loading } = useAuthStore();
  const rootNavigationState = useRootNavigationState();
  const navReady = Boolean(rootNavigationState?.key);
  const routeInFlightRef = useRef(false);

  useEffect(() => {
    if (!navReady || !initialized || loading || !user?.id) {
      return;
    }

    if (routeInFlightRef.current) {
      return;
    }
    routeInFlightRef.current = true;

    let cancelled = false;

    const routeUser = async () => {
      try {
        const { data } = await supabase
          .from('habit_stacks')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .maybeSingle();

        if (cancelled) return;

        setTimeout(() => {
          if (cancelled) {
            routeInFlightRef.current = false;
            return;
          }
          try {
            if (data) {
              router.replace('/(tabs)/home');
            } else {
              router.replace('/(onboarding)/chat' as never);
            }
          } finally {
            routeInFlightRef.current = false;
          }
        }, 0);
      } catch {
        routeInFlightRef.current = false;
      }
    };

    void routeUser();
    return () => {
      cancelled = true;
      routeInFlightRef.current = false;
    };
  }, [navReady, initialized, loading, user?.id, router]);

  if (!initialized || loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  if (!user?.id) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#8B5CF6" />
    </View>
  );
}
