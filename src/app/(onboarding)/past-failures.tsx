import React, { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '../../stores/onboardingStore';
import {
  OnboardingContainer,
  MultiSelectChip,
  CharacterCounter,
} from '../../components/onboarding';
import { AuthButton } from '../../components/auth';

const HABIT_OPTIONS = [
  'Morning routine',
  'Exercise',
  'Meditation',
  'Reading',
  'Journaling',
  'Healthy eating',
  'Sleep schedule',
  'Drinking water',
  'Yoga',
  'Running',
];

export default function PastFailuresScreen() {
  const router = useRouter();
  const { data, updateData, nextScreen, prevScreen, canProceed } = useOnboardingStore();

  const [customHabit, setCustomHabit] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleToggleHabit = (habit: string) => {
    const current = data.pastFailures;
    if (current.includes(habit)) {
      updateData(
        'pastFailures',
        current.filter((h) => h !== habit)
      );
    } else {
      updateData('pastFailures', [...current, habit]);
    }
  };

  const handleAddCustom = () => {
    if (customHabit.trim()) {
      updateData('pastFailures', [...data.pastFailures, customHabit.trim()]);
      setCustomHabit('');
      setShowCustomInput(false);
    }
  };

  const handleNext = () => {
    if (canProceed()) {
      nextScreen();
      router.push('/(onboarding)/constraints');
    }
  };

  const handleBack = () => {
    prevScreen();
    router.back();
  };

  return (
    <OnboardingContainer
      currentScreen={2}
      totalScreens={5}
      title="Let's start with your history"
      subtitle="What habits have you tried before?"
    >
      <View className="mb-8">
        <Text className="text-base font-semibold text-gray-700 mb-3">Select all that apply:</Text>
        <View className="flex-row flex-wrap">
          {HABIT_OPTIONS.map((habit) => (
            <MultiSelectChip
              key={habit}
              label={habit}
              selected={data.pastFailures.includes(habit)}
              onPress={() => handleToggleHabit(habit)}
            />
          ))}
          {data.pastFailures
            .filter((h) => !HABIT_OPTIONS.includes(h))
            .map((habit) => (
              <MultiSelectChip
                key={habit}
                label={habit}
                selected={true}
                onPress={() => handleToggleHabit(habit)}
              />
            ))}
        </View>

        {!showCustomInput ? (
          <TouchableOpacity className="mt-2 py-2" onPress={() => setShowCustomInput(true)}>
            <Text className="text-sm text-blue-500 font-semibold">+ Add other</Text>
          </TouchableOpacity>
        ) : (
          <View className="mt-4">
            <CharacterCounter
              value={customHabit}
              onChangeText={setCustomHabit}
              minLength={2}
              maxLength={50}
              label="Custom habit"
              placeholder="e.g., Learning Spanish"
            />
            <View className="flex-row gap-3 mt-2">
              <TouchableOpacity
                className="flex-1 py-3 items-center rounded-lg bg-gray-100"
                onPress={() => {
                  setShowCustomInput(false);
                  setCustomHabit('');
                }}
              >
                <Text className="text-base font-semibold text-gray-500">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-3 items-center rounded-lg bg-blue-500 ${!customHabit.trim() ? 'opacity-50' : ''}`}
                onPress={handleAddCustom}
                disabled={!customHabit.trim()}
              >
                <Text className="text-base font-semibold text-white">Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <View className="mb-8">
        <CharacterCounter
          value={data.failureDescription}
          onChangeText={(text) => updateData('failureDescription', text)}
          minLength={20}
          maxLength={500}
          label="Why did these fail?"
          placeholder="Be honest... What got in the way? What patterns do you notice?"
        />
      </View>

      <View className="mt-8 gap-3">
        {!canProceed() && (
          <Text className="text-xs text-center text-gray-400">
            {data.pastFailures.length === 0
              ? 'Select at least one habit above'
              : data.failureDescription.length < 20
              ? `Describe why they failed (${20 - data.failureDescription.length} more characters needed)`
              : null}
          </Text>
        )}
        <TouchableOpacity className="py-3 items-center" onPress={handleBack}>
          <Text className="text-base text-blue-500 font-semibold">← Back</Text>
        </TouchableOpacity>
        <AuthButton title="Next" onPress={handleNext} variant="primary" disabled={!canProceed()} />
      </View>
    </OnboardingContainer>
  );
}
