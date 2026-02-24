import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter, useRootNavigationState } from 'expo-router';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';

export default function IndexScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    // Wait until the root navigator is mounted before navigating
    if (!rootNavigationState?.key) return;

    if (!user) {
      router.replace('/(auth)/login');
      return;
    }

    const routeUser = async () => {
      // Check if user has completed onboarding (has an active habit stack)
      const { data } = await supabase
        .from('habit_stacks')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (data) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/(onboarding)/welcome');
      }
    };

    routeUser();
  }, [user, router, rootNavigationState?.key]);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#8B5CF6" />
    </View>
  );
}
