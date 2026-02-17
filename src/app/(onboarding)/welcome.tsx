import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useAuthStore } from '../../stores/authStore';
import { AuthButton } from '../../components/auth';

export default function WelcomeScreen() {
  const router = useRouter();
  const { loadProgress, nextScreen } = useOnboardingStore();
  const { signOut } = useAuthStore();

  useEffect(() => {
    loadProgress();
  }, []);

  const handleGetStarted = () => {
    nextScreen();
    router.push('/(onboarding)/past-failures');
  };

  const handleSkip = async () => {
    try {
      await signOut();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Skip onboarding error:', error);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <View className="flex-1 px-6 pt-20 pb-10 justify-between">
        <Text className="text-6xl text-center mb-6">🎯</Text>
        <Text className="text-3xl font-bold text-gray-900 text-center mb-12 leading-10">
          Finally understand why your habits fail
        </Text>

        <View className="mb-12">
          <View className="flex-row items-center mb-6 px-4">
            <Text className="text-3xl mr-4">🎯</Text>
            <Text className="flex-1 text-lg text-gray-700 leading-7">
              Get your personal Habit Failure Profile
            </Text>
          </View>

          <View className="flex-row items-center mb-6 px-4">
            <Text className="text-3xl mr-4">🧠</Text>
            <Text className="flex-1 text-lg text-gray-700 leading-7">
              Habits designed around your constraints
            </Text>
          </View>

          <View className="flex-row items-center mb-6 px-4">
            <Text className="text-3xl mr-4">📈</Text>
            <Text className="flex-1 text-lg text-gray-700 leading-7">
              Weekly insights that actually work
            </Text>
          </View>
        </View>

        <View className="mb-4">
          <AuthButton title="Get Started" onPress={handleGetStarted} variant="primary" />
          <Text className="text-sm text-gray-500 text-center mt-3">This takes ~5 minutes</Text>
        </View>

        <TouchableOpacity onPress={handleSkip} className="p-3 items-center">
          <Text className="text-base text-gray-400">Skip for now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
