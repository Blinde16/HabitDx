import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useAuthStore } from '../../stores/authStore';

/**
 * Legacy route: primary intake is `chat`. This screen redirects there after restoring
 * progress from storage (for deep links to `/(onboarding)/welcome`).
 */
export default function WelcomeScreen() {
  const router = useRouter();
  const { loadProgress } = useOnboardingStore();
  const { signOut } = useAuthStore();

  useEffect(() => {
    void loadProgress().then(() => {
      router.replace('/(onboarding)/chat' as never);
    });
  }, [loadProgress, router]);

  const handleSkip = async () => {
    try {
      await signOut();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Skip onboarding error:', error);
    }
  };

  return (
    <View className="flex-1 bg-[#F5F8FF] items-center justify-center px-8">
      <ActivityIndicator size="large" color="#2563EB" />
      <Text className="text-slate-600 mt-4 text-center">Opening onboarding…</Text>
      <TouchableOpacity onPress={handleSkip} className="mt-8 p-3">
        <Text className="text-base text-gray-500">Skip for now</Text>
      </TouchableOpacity>
    </View>
  );
}
