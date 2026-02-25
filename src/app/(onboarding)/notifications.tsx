import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useNotificationStore } from '@/stores/notificationStore';
import { OnboardingContainer } from '@/components/onboarding/OnboardingContainer';
import { logInfo, logError } from '@/lib/logger';

export default function NotificationPermissionScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { requestPermissions, registerForPushNotifications } = useNotificationStore();

  const handleEnableNotifications = async () => {
    try {
      setIsLoading(true);
      
      const granted = await requestPermissions();
      if (granted) {
        await registerForPushNotifications();
        logInfo('Notifications enabled during onboarding');
      }
      
      // Continue to next screen regardless of permission result
      router.push('/(tabs)/home');
    } catch (error) {
      logError(error as Error, { context: 'notifications.enable' });
      // Still continue to home
      router.push('/(tabs)/home');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    logInfo('Notifications skipped during onboarding');
    router.push('/(tabs)/home');
  };

  return (
    <OnboardingContainer
      currentScreen={5}
      totalScreens={5}
      title="Stay on Track"
      subtitle="Get timely reminders and weekly insights"
    >
      <View className="flex-1 justify-center px-6">
        {/* Icon */}
        <View className="items-center mb-8">
          <View className="w-24 h-24 bg-blue-100 rounded-full items-center justify-center">
            <Text className="text-5xl">🔔</Text>
          </View>
        </View>

        {/* Title */}
        <Text className="text-3xl font-bold text-gray-900 text-center mb-4">
          Stay on Track
        </Text>

        {/* Description */}
        <Text className="text-base text-gray-600 text-center mb-8 leading-relaxed">
          Get gentle reminders at the right time to complete your habits.{'\n\n'}
          We&apos;ll only send notifications when you need them—no spam, just support.
        </Text>

        {/* Benefits */}
        <View className="space-y-4 mb-12">
          <View className="flex-row items-start">
            <Text className="text-2xl mr-3">⏰</Text>
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900 mb-1">
                Timely Reminders
              </Text>
              <Text className="text-sm text-gray-600">
                Get notified at your scheduled habit times
              </Text>
            </View>
          </View>

          <View className="flex-row items-start">
            <Text className="text-2xl mr-3">📊</Text>
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900 mb-1">
                Weekly Insights
              </Text>
              <Text className="text-sm text-gray-600">
                Be notified when your AI analysis is ready
              </Text>
            </View>
          </View>

          <View className="flex-row items-start">
            <Text className="text-2xl mr-3">🎯</Text>
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900 mb-1">
                Stay Consistent
              </Text>
              <Text className="text-sm text-gray-600">
                Gentle nudges to help you build lasting habits
              </Text>
            </View>
          </View>
        </View>

        {/* Buttons */}
        <View className="space-y-3">
          <TouchableOpacity
            onPress={handleEnableNotifications}
            disabled={isLoading}
            className={`bg-blue-600 py-4 px-8 rounded-xl ${
              isLoading ? 'opacity-50' : ''
            }`}
          >
            <Text className="text-white text-center font-semibold text-base">
              {isLoading ? 'Enabling...' : 'Enable Notifications'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSkip}
            disabled={isLoading}
            className="py-4 px-8"
          >
            <Text className="text-gray-600 text-center text-base">
              Maybe Later
            </Text>
          </TouchableOpacity>
        </View>

        {/* Privacy Note */}
        <Text className="text-xs text-gray-500 text-center mt-6">
          You can change this anytime in Settings
        </Text>
      </View>
    </OnboardingContainer>
  );
}
