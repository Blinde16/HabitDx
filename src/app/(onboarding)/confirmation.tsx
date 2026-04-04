import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useAuthStore } from '../../stores/authStore';
import { OnboardingContainer } from '../../components/onboarding';
import { AuthButton } from '../../components/auth';
import { logInfo, logError } from '../../lib/logger';

export default function ConfirmationScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data, updateData, submitOnboarding, prevScreen, loading, error } = useOnboardingStore();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Not logged in', 'No user session found. Please sign out and sign back in.');
      return;
    }

    logInfo('Confirmation: submitting onboarding', {
      userId: user.id,
      event: 'onboarding.confirm.submit',
    });

    try {
      setSubmitting(true);
      await submitOnboarding(user.id);
      logInfo('Confirmation: onboarding submitted', {
        userId: user.id,
        event: 'onboarding.confirm.success',
      });
      router.push('/(onboarding)/failure-profile');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logError(err instanceof Error ? err : new Error(msg), {
        context: 'onboarding.confirm',
        userId: user.id,
      });
      Alert.alert('Submission Error', msg);
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
      title="Here’s the plan I’ll build from your answers."
      subtitle="You’re about to turn your responses into a diagnosis, a starter habit stack, and a weekly feedback loop."
      tip="If something feels off, go back now. Small accuracy improvements here make the output feel much more personal."
    >
      {error && (
        <View className="bg-error_container rounded-2xl p-4 mb-4">
          <Text className="text-on_error_container text-sm font-public-sb">Error: {error}</Text>
        </View>
      )}

      <View className="bg-surface_container_lowest rounded-[28px] p-5 mb-6">
        <Text className="text-base font-public-sb text-on_surface mb-4">What happens next</Text>
        <View className="flex-row mb-5">
          <View className="w-12 h-12 rounded-full bg-surface_container_low items-center justify-center mr-4">
            <Text className="text-2xl">✅</Text>
          </View>
          <View className="flex-1 justify-center">
              <Text className="text-base font-public-sb text-on_surface mb-1">
              Step 1: We&apos;ll analyze your responses
            </Text>
              <Text className="text-sm font-public text-on_surface_variant">Takes about 30 seconds</Text>
          </View>
        </View>

        <View className="flex-row mb-5">
          <View className="w-12 h-12 rounded-full bg-surface_container_low items-center justify-center mr-4">
            <Text className="text-2xl">🎯</Text>
          </View>
          <View className="flex-1 justify-center">
              <Text className="text-base font-public-sb text-on_surface mb-1">
              Step 2: You&apos;ll get your Habit Profile
            </Text>
              <Text className="text-sm font-public text-on_surface_variant">Understand your patterns</Text>
          </View>
        </View>

        <View className="flex-row mb-5">
          <View className="w-12 h-12 rounded-full bg-surface_container_low items-center justify-center mr-4">
            <Text className="text-2xl">📋</Text>
          </View>
          <View className="flex-1 justify-center">
              <Text className="text-base font-public-sb text-on_surface mb-1">
              Step 3: We&apos;ll design 1-3 habits just for you
            </Text>
              <Text className="text-sm font-public text-on_surface_variant">Personalized to your life</Text>
          </View>
        </View>

        <View className="flex-row mb-5">
          <View className="w-12 h-12 rounded-full bg-surface_container_low items-center justify-center mr-4">
            <Text className="text-2xl">📱</Text>
          </View>
          <View className="flex-1 justify-center">
              <Text className="text-base font-public-sb text-on_surface mb-1">
              Step 4: Check in daily
            </Text>
              <Text className="text-sm font-public text-on_surface_variant">Takes just 10 seconds</Text>
          </View>
        </View>

        <View className="flex-row mb-5">
          <View className="w-12 h-12 rounded-full bg-surface_container_low items-center justify-center mr-4">
            <Text className="text-2xl">💡</Text>
          </View>
          <View className="flex-1 justify-center">
              <Text className="text-base font-public-sb text-on_surface mb-1">
              Step 5: Get weekly insights to improve
            </Text>
              <Text className="text-sm font-public text-on_surface_variant">Continuous optimization</Text>
          </View>
        </View>
      </View>

      <View className="bg-surface_container_lowest rounded-[28px] p-5 mb-6">
        <Text className="text-base font-public-sb text-on_surface mb-3">
          Can we send helpful reminders?
        </Text>
        <TouchableOpacity
          className="flex-row items-center mb-2"
          onPress={() => updateData('notificationsEnabled', !data.notificationsEnabled)}
        >
          <View
            className={`w-[51px] h-[31px] rounded-2xl p-0.5 ${
              data.notificationsEnabled ? 'bg-primary_container' : 'bg-surface_container_highest'
            }`}
          >
            <View
              className="w-[27px] h-[27px] rounded-full bg-white"
              style={{
                transform: [{ translateX: data.notificationsEnabled ? 20 : 0 }],
              }}
            />
          </View>
          <Text className="ml-3 text-base font-public text-on_surface">
            {data.notificationsEnabled ? 'Enabled' : 'Disabled'}
          </Text>
        </TouchableOpacity>
        <Text className="text-xs font-public text-on_surface_variant">
          You can change this anytime in settings
        </Text>
      </View>

      <View className="p-4 bg-surface_container_low rounded-2xl mb-6">
        <Text className="text-sm font-public text-on_surface text-center leading-5">
          Your responses stay private and are used only to shape your plan.
        </Text>
      </View>

      <View>
        <TouchableOpacity
          className="py-3 items-center mb-2"
          onPress={handleBack}
          disabled={submitting}
        >
          <Text className="text-base text-primary_container font-public-sb">← Back</Text>
        </TouchableOpacity>
        <AuthButton
          title={submitting ? 'Analyzing...' : 'Build My Habit Plan'}
          onPress={handleSubmit}
          variant="primary"
          loading={submitting || loading}
          disabled={submitting || loading}
        />
      </View>
    </OnboardingContainer>
  );
}
