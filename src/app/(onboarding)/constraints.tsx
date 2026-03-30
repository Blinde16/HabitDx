import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { OnboardingContainer, MultiSelectChip } from '../../components/onboarding';
import { AuthButton } from '../../components/auth';
import { ENERGY_OPTIONS, OBSTACLE_OPTIONS, SCHEDULE_OPTIONS } from '../../constants/onboardingIntake';

export default function ConstraintsScreen() {
  const router = useRouter();
  const { data, updateData, nextScreen, prevScreen, canProceed } = useOnboardingStore();

  const handleToggleSchedule = (schedule: string) => {
    const current = data.constraints.schedule_type;
    if (current.includes(schedule)) {
      updateData('constraints', {
        ...data.constraints,
        schedule_type: current.filter((s) => s !== schedule),
      });
    } else {
      updateData('constraints', {
        ...data.constraints,
        schedule_type: [...current, schedule],
      });
    }
  };

  const handleToggleObstacle = (obstacle: string) => {
    const current = data.constraints.obstacles;
    if (current.includes(obstacle)) {
      updateData('constraints', {
        ...data.constraints,
        obstacles: current.filter((o) => o !== obstacle),
      });
    } else {
      updateData('constraints', {
        ...data.constraints,
        obstacles: [...current, obstacle],
      });
    }
  };

  const handleNext = () => {
    if (canProceed(3)) {
      nextScreen();
      router.push('/(onboarding)/goals');
    }
  };

  const handleBack = () => {
    prevScreen();
    router.back();
  };

  return (
    <OnboardingContainer
      currentScreen={3}
      totalScreens={5}
      title="Now let’s make this fit your life."
      subtitle="I’m looking for constraints, energy patterns, and the things that usually knock you off track."
      tip="This step matters because a good plan should survive your real week, not your perfect one."
    >
      <View className="bg-white border border-gray-200 rounded-[28px] p-5 mb-6">
        <Text className="text-base font-semibold text-gray-700 mb-3">
          When do you have the most energy?
        </Text>
        <Text className="text-sm text-gray-500 leading-6 mb-4">
          We’ll lean on your easiest window instead of demanding willpower at the wrong time.
        </Text>
        <View className="flex-row gap-3">
          {ENERGY_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              className={`flex-1 py-4 items-center rounded-2xl border ${
                data.constraints.peak_energy === option.value
                  ? 'bg-blue-600 border-blue-600'
                  : 'bg-gray-50 border-gray-200'
              }`}
              onPress={() =>
                updateData('constraints', {
                  ...data.constraints,
                  peak_energy: option.value,
                })
              }
            >
              <Text className="text-3xl mb-2">{option.icon}</Text>
              <Text
                className={`text-sm font-semibold ${
                  data.constraints.peak_energy === option.value ? 'text-white' : 'text-gray-600'
                }`}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View className="bg-white border border-gray-200 rounded-[28px] p-5 mb-6">
        <Text className="text-base font-semibold text-gray-700 mb-3">
          What&apos;s your daily schedule like?
        </Text>
        <Text className="text-sm text-gray-500 leading-6 mb-4">
          Choose the patterns that shape when habits do or don’t happen.
        </Text>
        <View className="flex-row flex-wrap">
          {SCHEDULE_OPTIONS.map((schedule) => (
            <MultiSelectChip
              key={schedule}
              label={schedule}
              selected={data.constraints.schedule_type.includes(schedule)}
              onPress={() => handleToggleSchedule(schedule)}
            />
          ))}
        </View>
      </View>

      <View className="bg-white border border-gray-200 rounded-[28px] p-5 mb-8">
        <Text className="text-base font-semibold text-gray-700 mb-3">
          What makes habits hard for you?
        </Text>
        <Text className="text-sm text-gray-500 leading-6 mb-4">
          Pick the friction points that show up most often.
        </Text>
        <View className="flex-row flex-wrap">
          {OBSTACLE_OPTIONS.map((obstacle) => (
            <MultiSelectChip
              key={obstacle}
              label={obstacle}
              selected={data.constraints.obstacles.includes(obstacle)}
              onPress={() => handleToggleObstacle(obstacle)}
            />
          ))}
        </View>
      </View>

      <View className="mt-8 gap-3">
        {!canProceed(3) && (
          <Text className="text-xs text-center text-gray-500">
            Choose your energy window, one schedule pattern, and one common obstacle.
          </Text>
        )}
        <TouchableOpacity className="py-3 items-center" onPress={handleBack}>
          <Text className="text-base text-blue-600 font-semibold">← Back</Text>
        </TouchableOpacity>
        <AuthButton
          title={canProceed(3) ? 'Keep going' : 'Answer to continue'}
          onPress={handleNext}
          variant="primary"
          disabled={!canProceed(3)}
        />
      </View>
    </OnboardingContainer>
  );
}
