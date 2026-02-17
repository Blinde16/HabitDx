import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { OnboardingContainer, CharacterCounter } from '../../components/onboarding';
import { AuthButton } from '../../components/auth';

const GOAL_OPTIONS = [
  { value: 'Better health', icon: '💪' },
  { value: 'More energy', icon: '⚡' },
  { value: 'Career growth', icon: '📈' },
  { value: 'Mental clarity', icon: '🧠' },
  { value: 'Better sleep', icon: '😴' },
  { value: 'Personal growth', icon: '🌱' },
  { value: 'Reduce stress', icon: '🧘' },
  { value: 'Build confidence', icon: '💎' },
];

export default function GoalsScreen() {
  const router = useRouter();
  const { data, updateData, nextScreen, prevScreen, canProceed } = useOnboardingStore();

  const handleToggleGoal = (goal: string) => {
    const current = data.goals;
    if (current.includes(goal)) {
      updateData(
        'goals',
        current.filter((g) => g !== goal)
      );
    } else if (current.length < 3) {
      updateData('goals', [...current, goal]);
    }
  };

  const handleNext = () => {
    if (canProceed()) {
      nextScreen();
      router.push('/(onboarding)/confirmation');
    }
  };

  const handleBack = () => {
    prevScreen();
    router.back();
  };

  return (
    <OnboardingContainer
      currentScreen={4}
      totalScreens={5}
      title="What are you working toward?"
      subtitle="Select up to 3 goals"
    >
      <View className="mb-8">
        <View className="flex-row flex-wrap gap-3">
          {GOAL_OPTIONS.map((goal) => {
            const isSelected = data.goals.includes(goal.value);
            const isDisabled = !isSelected && data.goals.length >= 3;

            return (
              <TouchableOpacity
                key={goal.value}
                className={`w-[48%] aspect-[1.2] p-4 rounded-xl border-2 items-center justify-center relative ${
                  isSelected
                    ? 'bg-blue-100 border-blue-500'
                    : 'bg-gray-100 border-gray-200'
                } ${isDisabled ? 'opacity-50' : ''}`}
                onPress={() => handleToggleGoal(goal.value)}
                disabled={isDisabled}
              >
                <Text className="text-4xl mb-2">{goal.icon}</Text>
                <Text
                  className={`text-sm font-semibold text-center ${
                    isSelected ? 'text-blue-800' : 'text-gray-500'
                  }`}
                >
                  {goal.value}
                </Text>
                {isSelected && (
                  <View className="absolute top-2 right-2 w-6 h-6 rounded-full bg-blue-500 items-center justify-center">
                    <Text className="text-white text-sm font-bold">✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {data.goals.length > 0 && (
          <Text className="text-sm text-gray-500 text-center mt-3">
            {data.goals.length} of 3 selected
          </Text>
        )}
      </View>

      <View className="mb-8">
        <CharacterCounter
          value={data.motivation}
          onChangeText={(text) => updateData('motivation', text)}
          minLength={20}
          maxLength={300}
          label="Why does this matter to you?"
          placeholder="What would achieving these goals mean for your life?"
        />
      </View>

      <View className="mt-8 gap-3">
        <TouchableOpacity className="py-3 items-center" onPress={handleBack}>
          <Text className="text-base text-blue-500 font-semibold">← Back</Text>
        </TouchableOpacity>
        <AuthButton title="Next" onPress={handleNext} variant="primary" disabled={!canProceed()} />
      </View>
    </OnboardingContainer>
  );
}
