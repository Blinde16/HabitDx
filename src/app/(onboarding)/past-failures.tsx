import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
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
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Select all that apply:</Text>
        <View style={styles.chipContainer}>
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
          <TouchableOpacity style={styles.addButton} onPress={() => setShowCustomInput(true)}>
            <Text style={styles.addButtonText}>+ Add other</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.customInput}>
            <CharacterCounter
              value={customHabit}
              onChangeText={setCustomHabit}
              minLength={2}
              maxLength={50}
              label="Custom habit"
              placeholder="e.g., Learning Spanish"
            />
            <View style={styles.customActions}>
              <TouchableOpacity
                style={styles.customCancel}
                onPress={() => {
                  setShowCustomInput(false);
                  setCustomHabit('');
                }}
              >
                <Text style={styles.customCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.customAdd, !customHabit.trim() && styles.customAddDisabled]}
                onPress={handleAddCustom}
                disabled={!customHabit.trim()}
              >
                <Text style={styles.customAddText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <CharacterCounter
          value={data.failureDescription}
          onChangeText={(text) => updateData('failureDescription', text)}
          minLength={20}
          maxLength={500}
          label="Why did these fail?"
          placeholder="Be honest... What got in the way? What patterns do you notice?"
        />
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <AuthButton title="Next" onPress={handleNext} variant="primary" disabled={!canProceed()} />
      </View>
    </OnboardingContainer>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  addButton: {
    marginTop: 8,
    paddingVertical: 8,
  },
  addButtonText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  customInput: {
    marginTop: 16,
  },
  customActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  customCancel: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  customCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  customAdd: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#3b82f6',
  },
  customAddDisabled: {
    opacity: 0.5,
  },
  customAddText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  actions: {
    marginTop: 32,
    gap: 12,
  },
  backButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
});
