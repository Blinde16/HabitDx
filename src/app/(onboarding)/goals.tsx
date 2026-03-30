import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { OnboardingContainer, CharacterCounter } from '../../components/onboarding';
import { AuthButton } from '../../components/auth';
import { GOAL_OPTIONS } from '../../constants/onboardingIntake';

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
    if (canProceed(4)) {
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
      title="What do you want these habits to unlock?"
      subtitle="Choose up to three outcomes that would make this feel genuinely worth it."
      tip="Good habits stick better when the payoff feels personal and immediate."
    >
      <View className="bg-white border border-gray-200 rounded-[28px] p-5 mb-6">
        <Text className="text-base font-semibold text-gray-800 mb-2">What matters most right now?</Text>
        <Text className="text-sm text-gray-500 leading-6 mb-4">
          You can pick up to three goals. Focus beats ambition here.
        </Text>

        <View className="flex-row flex-wrap gap-3">
          {GOAL_OPTIONS.map((goal) => {
            const isSelected = data.goals.includes(goal.value);
            const isDisabled = !isSelected && data.goals.length >= 3;

            return (
              <TouchableOpacity
                key={goal.value}
                className={`w-[48%] aspect-[1.2] p-4 rounded-[24px] border items-center justify-center relative ${
                  isSelected
                    ? 'bg-blue-600 border-blue-600'
                    : 'bg-gray-50 border-gray-200'
                } ${isDisabled ? 'opacity-50' : ''}`}
                onPress={() => handleToggleGoal(goal.value)}
                disabled={isDisabled}
              >
                <Text className="text-4xl mb-2">{goal.icon}</Text>
                <Text
                  className={`text-sm font-semibold text-center ${
                    isSelected ? 'text-white' : 'text-gray-600'
                  }`}
                >
                  {goal.value}
                </Text>
                {isSelected && (
                  <View className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white items-center justify-center">
                    <Text className="text-blue-600 text-sm font-bold">✓</Text>
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

      <View className="bg-white border border-gray-200 rounded-[28px] p-5 mb-8">
        <CharacterCounter
          value={data.motivation}
          onChangeText={(text) => updateData('motivation', text)}
          minLength={20}
          maxLength={300}
          label="Why does this matter right now?"
          placeholder="Example: If I had more energy and a steadier routine, I’d feel less behind every day."
        />
      </View>

      <View className="mt-8 gap-3">
        {!canProceed(4) && (
          <Text className="text-xs text-center text-gray-500">
            Choose at least one goal and add a little context about why it matters.
          </Text>
        )}
        <TouchableOpacity className="py-3 items-center" onPress={handleBack}>
          <Text className="text-base text-blue-600 font-semibold">← Back</Text>
        </TouchableOpacity>
        <AuthButton
          title={canProceed(4) ? 'Review my plan' : 'Answer to continue'}
          onPress={handleNext}
          variant="primary"
          disabled={!canProceed(4)}
        />
      </View>
    </OnboardingContainer>
  );
}
