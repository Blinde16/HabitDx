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
import { HABIT_OPTIONS } from '../../constants/onboardingIntake';

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
    if (canProceed(2)) {
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
      title="Tell me about the habits that keep slipping."
      subtitle="Start with the ones you’ve genuinely tried, even if they only lasted a few days."
      tip="Pick the habits that feel emotionally familiar, then describe the pattern in your own words."
    >
      <View className="bg-surface_container_lowest rounded-[28px] p-5 mb-6">
        <Text className="text-base font-public-sb text-on_surface mb-2">What have you tried?</Text>
        <Text className="text-sm font-public text-on_surface_variant leading-6 mb-4">
          Choose every habit you’ve started and struggled to keep going.
        </Text>

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
            .filter((h) => !(HABIT_OPTIONS as readonly string[]).includes(h))
            .map((habit) => (
              <MultiSelectChip
                key={habit}
                label={habit}
                selected={true}
                onPress={() => handleToggleHabit(habit)}
              />
            ))}
        </View>

        {data.pastFailures.length > 0 && (
          <Text className="text-sm text-primary_container mt-3 font-public-md">
            {data.pastFailures.length} habit{data.pastFailures.length === 1 ? '' : 's'} selected
          </Text>
        )}

        {!showCustomInput ? (
          <TouchableOpacity className="mt-2 py-2" onPress={() => setShowCustomInput(true)}>
            <Text className="text-sm text-primary_container font-public-sb">+ Add other</Text>
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
                className="flex-1 py-3 items-center rounded-lg bg-surface_brand_muted"
                onPress={() => {
                  setShowCustomInput(false);
                  setCustomHabit('');
                }}
              >
                <Text className="text-base font-public-sb text-on_surface_variant">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-3 items-center rounded-lg bg-primary_container ${!customHabit.trim() ? 'opacity-50' : ''}`}
                onPress={handleAddCustom}
                disabled={!customHabit.trim()}
              >
                <Text className="text-base font-public-sb text-white">Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <View className="bg-surface_container_lowest rounded-[28px] p-5 mb-8">
        <CharacterCounter
          value={data.failureDescription}
          onChangeText={(text) => updateData('failureDescription', text)}
          minLength={20}
          maxLength={500}
          label="What usually happens when these habits fall apart?"
          placeholder="Example: I start strong, then miss one day, feel behind, and stop opening the app."
        />
      </View>

      <View className="mt-8 gap-3">
        {!canProceed(2) && (
          <Text className="text-xs font-public text-center text-on_surface_variant">
            {data.pastFailures.length === 0
              ? 'Select at least one habit above'
              : data.failureDescription.length < 20
                ? `Describe why they failed (${20 - data.failureDescription.length} more characters needed)`
                : null}
          </Text>
        )}
        <TouchableOpacity className="py-3 items-center" onPress={handleBack}>
          <Text className="text-base text-primary_container font-public-sb">← Back</Text>
        </TouchableOpacity>
        <AuthButton
          title={canProceed(2) ? 'That sounds right' : 'Answer to continue'}
          onPress={handleNext}
          variant="primary"
          disabled={!canProceed(2)}
        />
      </View>
    </OnboardingContainer>
  );
}
