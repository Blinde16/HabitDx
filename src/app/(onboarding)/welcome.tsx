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
    <View className="flex-1 bg-[#F5F8FF]">
      <View className="flex-1 px-6 pt-16 pb-10 justify-between">
        <View>
          <View className="self-start bg-blue-600 rounded-full px-4 py-2 mb-4">
            <Text className="text-xs font-semibold uppercase tracking-[1px] text-white">
              HabitDx guide
            </Text>
          </View>

          <View className="bg-slate-900 rounded-[30px] rounded-tl-md px-6 py-6 mb-6">
            <Text className="text-4xl font-bold text-white leading-[44px] mb-3">
              Let&apos;s build your first plan like a conversation, not a quiz.
            </Text>
            <Text className="text-base text-slate-200 leading-7">
              I&apos;ll ask a few short questions about what you&apos;ve tried, what gets in the
              way, and what matters most.
            </Text>
          </View>

          <View className="bg-white rounded-[28px] px-5 py-5 border border-blue-100 mb-8">
            <Text className="text-sm font-semibold text-blue-700 uppercase tracking-[1px] mb-4">
              What you&apos;ll get
            </Text>

            <View className="flex-row items-start mb-5">
              <Text className="text-2xl mr-4">🎯</Text>
              <View className="flex-1">
                <Text className="text-base font-semibold text-slate-900 mb-1">
                  A personalized failure profile
                </Text>
                <Text className="text-sm text-slate-600 leading-6">
                  We&apos;ll look for patterns, not blame.
                </Text>
              </View>
            </View>

            <View className="flex-row items-start mb-5">
              <Text className="text-2xl mr-4">🧠</Text>
              <View className="flex-1">
                <Text className="text-base font-semibold text-slate-900 mb-1">
                  Habits matched to your real constraints
                </Text>
                <Text className="text-sm text-slate-600 leading-6">
                  Smaller, more realistic actions are easier to keep.
                </Text>
              </View>
            </View>

            <View className="flex-row items-start">
              <Text className="text-2xl mr-4">📈</Text>
              <View className="flex-1">
                <Text className="text-base font-semibold text-slate-900 mb-1">
                  Weekly course-corrections
                </Text>
                <Text className="text-sm text-slate-600 leading-6">
                  One useful adjustment at a time, based on your behavior.
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View>
          <View className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-4 mb-5">
            <Text className="text-sm text-slate-700 leading-6">
              Most people finish in about 5 minutes. You can revise answers as we go.
            </Text>
          </View>

          <AuthButton title="Get Started" onPress={handleGetStarted} variant="primary" />
          <TouchableOpacity onPress={handleSkip} className="p-3 items-center">
            <Text className="text-base text-gray-500">Skip for now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
