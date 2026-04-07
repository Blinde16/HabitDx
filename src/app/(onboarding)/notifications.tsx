import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useNotificationStore } from '@/stores/notificationStore';
import { OnboardingContainer } from '@/components/onboarding/OnboardingContainer';
import { HabitDxLogo } from '@/components/brand';
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

      router.push('/(tabs)/home');
    } catch (error) {
      logError(error as Error, { context: 'notifications.enable' });
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
      title="Reminders"
      subtitle="Optional nudges at the times you choose"
    >
      <View className="flex-1 justify-center px-2 max-w-2xl self-center w-full">
        <View className="items-center mb-10">
          <HabitDxLogo width={200} style={{ alignSelf: 'center' }} />
        </View>

        <Text className="text-3xl font-manrope text-on_surface text-center mb-4">
          Stay In Rhythm
        </Text>

        <Text className="text-base font-public text-on_surface_variant text-center mb-10 leading-6">
          Gentle reminders at scheduled habit times. No promotional noise—only what you opt into.
        </Text>

        <View className="space-y-6 mb-12">
          <View>
            <Text className="text-base font-public-sb text-on_surface mb-1">Timely prompts</Text>
            <Text className="text-sm font-public text-on_surface_variant leading-5">
              Aligned to the windows you set for each habit
            </Text>
          </View>
          <View>
            <Text className="text-base font-public-sb text-on_surface mb-1">Weekly readout</Text>
            <Text className="text-sm font-public text-on_surface_variant leading-5">
              A heads-up when your weekly insight is ready
            </Text>
          </View>
          <View>
            <Text className="text-base font-public-sb text-on_surface mb-1">
              You stay in control
            </Text>
            <Text className="text-sm font-public text-on_surface_variant leading-5">
              Change or silence reminders anytime in Settings
            </Text>
          </View>
        </View>

        <View className="space-y-3">
          <TouchableOpacity
            onPress={handleEnableNotifications}
            disabled={isLoading}
            activeOpacity={0.92}
            className={`rounded-full overflow-hidden ${isLoading ? 'opacity-50' : ''}`}
          >
            <LinearGradient
              colors={['#263247', '#2d384a']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ paddingVertical: 16, alignItems: 'center' }}
            >
              <Text className="text-white font-public-sb text-base">
                {isLoading ? 'Enabling…' : 'Enable Notifications'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSkip} disabled={isLoading} className="py-4 px-8">
            <Text className="text-on_surface_variant text-center font-public-sb text-base">
              Maybe Later
            </Text>
          </TouchableOpacity>
        </View>

        <Text className="text-xs font-public text-on_surface_variant text-center mt-8 leading-5">
          You can enable or disable notifications later in Settings. We never sell your data.
        </Text>
      </View>
    </OnboardingContainer>
  );
}
