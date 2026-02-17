import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useAuthStore } from '../../stores/authStore';
import { OnboardingContainer } from '../../components/onboarding';
import { AuthButton } from '../../components/auth';

export default function ConfirmationScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data, updateData, submitOnboarding, prevScreen, loading, error } = useOnboardingStore();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) return;

    try {
      setSubmitting(true);
      await submitOnboarding(user.id);
      // Navigate to Failure Profile screen after successful submission
      router.push('/(onboarding)/failure-profile');
    } catch (err) {
      console.error('Onboarding submission error:', err);
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    prevScreen();
    router.back();
  };

  return (
    <OnboardingContainer
      currentScreen={5}
      totalScreens={5}
      title="Perfect! Here's what happens next:"
    >
      <View className="mb-8">
        <View className="flex-row mb-5">
          <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center mr-4">
            <Text className="text-2xl">✅</Text>
          </View>
          <View className="flex-1 justify-center">
            <Text className="text-base font-semibold text-gray-900 mb-1">
              Step 1: We&apos;ll analyze your responses
            </Text>
            <Text className="text-sm text-gray-500">Takes about 30 seconds</Text>
          </View>
        </View>

        <View className="flex-row mb-5">
          <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center mr-4">
            <Text className="text-2xl">🎯</Text>
          </View>
          <View className="flex-1 justify-center">
            <Text className="text-base font-semibold text-gray-900 mb-1">
              Step 2: You&apos;ll get your Habit Failure Profile
            </Text>
            <Text className="text-sm text-gray-500">Understand your patterns</Text>
          </View>
        </View>

        <View className="flex-row mb-5">
          <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center mr-4">
            <Text className="text-2xl">📋</Text>
          </View>
          <View className="flex-1 justify-center">
            <Text className="text-base font-semibold text-gray-900 mb-1">
              Step 3: We&apos;ll design 1-3 habits just for you
            </Text>
            <Text className="text-sm text-gray-500">Personalized to your life</Text>
          </View>
        </View>

        <View className="flex-row mb-5">
          <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center mr-4">
            <Text className="text-2xl">📱</Text>
          </View>
          <View className="flex-1 justify-center">
            <Text className="text-base font-semibold text-gray-900 mb-1">
              Step 4: Check in daily
            </Text>
            <Text className="text-sm text-gray-500">Takes just 10 seconds</Text>
          </View>
        </View>

        <View className="flex-row mb-5">
          <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center mr-4">
            <Text className="text-2xl">💡</Text>
          </View>
          <View className="flex-1 justify-center">
            <Text className="text-base font-semibold text-gray-900 mb-1">
              Step 5: Get weekly insights to improve
            </Text>
            <Text className="text-sm text-gray-500">Continuous optimization</Text>
          </View>
        </View>
      </View>

      <View className="mb-6 p-4 bg-gray-50 rounded-xl">
        <Text className="text-base font-semibold text-gray-900 mb-3">
          Can we send helpful reminders?
        </Text>
        <TouchableOpacity
          className="flex-row items-center mb-2"
          onPress={() => updateData('notificationsEnabled', !data.notificationsEnabled)}
        >
          <View
            className={`w-[51px] h-[31px] rounded-2xl p-0.5 ${
              data.notificationsEnabled ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          >
            <View
              className="w-[27px] h-[27px] rounded-full bg-white"
              style={{
                transform: [{ translateX: data.notificationsEnabled ? 20 : 0 }],
              }}
            />
          </View>
          <Text className="ml-3 text-base text-gray-900">
            {data.notificationsEnabled ? 'Enabled' : 'Disabled'}
          </Text>
        </TouchableOpacity>
        <Text className="text-xs text-gray-400">You can change this anytime in settings</Text>
      </View>

      <View className="p-3 bg-green-50 rounded-lg mb-6">
        <Text className="text-sm text-green-800 text-center">
          🔒 Your data is private and never shared
        </Text>
      </View>

      {error && (
        <View className="bg-red-100 rounded-lg p-3 mb-4 border-l-4 border-red-500">
          <Text className="text-red-900 text-sm">{error}</Text>
        </View>
      )}

      <View className="gap-3">
        <TouchableOpacity
          className="py-3 items-center"
          onPress={handleBack}
          disabled={submitting}
        >
          <Text className="text-base text-blue-500 font-semibold">← Back</Text>
        </TouchableOpacity>
        <AuthButton
          title={submitting ? 'Analyzing...' : 'Analyze My Data'}
          onPress={handleSubmit}
          variant="primary"
          loading={submitting || loading}
          disabled={submitting || loading}
        />
      </View>
    </OnboardingContainer>
  );
}

