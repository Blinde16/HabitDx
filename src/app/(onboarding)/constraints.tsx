import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { OnboardingContainer, MultiSelectChip } from '../../components/onboarding';
import { AuthButton } from '../../components/auth';

const ENERGY_OPTIONS = [
  { value: 'morning', label: 'Morning', icon: '🌅' },
  { value: 'afternoon', label: 'Afternoon', icon: '☀️' },
  { value: 'evening', label: 'Evening', icon: '🌙' },
  { value: 'varies', label: 'Varies', icon: '🔄' },
] as const;

const SCHEDULE_OPTIONS = [
  '9-5 job',
  'Shift work',
  'Freelance/irregular',
  'Stay-at-home parent',
  'Student',
  'Retired',
];

const OBSTACLE_OPTIONS = [
  'Lack of time',
  'Inconsistent schedule',
  'Low energy',
  'Forgetfulness',
  'No accountability',
  'Perfectionism',
  'Overwhelm',
  'Lack of motivation',
];

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
      title="Help us understand your life"
      subtitle="This helps us design habits that actually fit your schedule"
    >
      <View className="mb-8">
        <Text className="text-base font-semibold text-gray-700 mb-3">
          When do you have the most energy?
        </Text>
        <View className="flex-row gap-3">
          {ENERGY_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              className={`flex-1 py-4 items-center rounded-xl border-2 ${
                data.constraints.peak_energy === option.value
                  ? 'bg-blue-100 border-blue-500'
                  : 'bg-gray-100 border-gray-200'
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
                  data.constraints.peak_energy === option.value ? 'text-blue-800' : 'text-gray-500'
                }`}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View className="mb-8">
        <Text className="text-base font-semibold text-gray-700 mb-3">
          What&apos;s your daily schedule like?
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

      <View className="mb-8">
        <Text className="text-base font-semibold text-gray-700 mb-3">
          What makes habits hard for you?
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
        <TouchableOpacity className="py-3 items-center" onPress={handleBack}>
          <Text className="text-base text-blue-500 font-semibold">← Back</Text>
        </TouchableOpacity>
        <AuthButton title="Next" onPress={handleNext} variant="primary" disabled={!canProceed(3)} />
      </View>
    </OnboardingContainer>
  );
}
