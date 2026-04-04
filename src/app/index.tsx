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
        const { data: stackRow } = await supabase
          .from('habit_stacks')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .maybeSingle();

        if (cancelled) return;

        let destination:
          | '/(tabs)/home'
          | '/(onboarding)/chat'
          | '/(onboarding)/failure-profile'
          | '/(onboarding)/habits';

        if (stackRow) {
          destination = '/(tabs)/home';
        } else {
          const { data: profileRow } = await supabase
            .from('user_profiles')
            .select('onboarding_completed')
            .eq('id', user.id)
            .maybeSingle();

          if (cancelled) return;

          if (!profileRow?.onboarding_completed) {
            destination = '/(onboarding)/chat';
          } else {
            const { data: fpRow } = await supabase
              .from('habit_failure_profiles')
              .select('id')
              .eq('user_id', user.id)
              .eq('is_active', true)
              .maybeSingle();

            if (cancelled) return;

            destination = fpRow ? '/(onboarding)/habits' : '/(onboarding)/failure-profile';
          }
        }

        setTimeout(() => {
          if (cancelled) {
            routeInFlightRef.current = false;
            return;
          }
          try {
            router.replace(destination as never);
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
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator size="large" color="#191c1e" />
      </View>
    );
  }

  if (!user?.id) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <View className="flex-1 items-center justify-center bg-surface">
      <ActivityIndicator size="large" color="#191c1e" />
    </View>
  );
}
