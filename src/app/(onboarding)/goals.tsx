import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
      <View style={styles.section}>
        <View style={styles.goalGrid}>
          {GOAL_OPTIONS.map((goal) => {
            const isSelected = data.goals.includes(goal.value);
            const isDisabled = !isSelected && data.goals.length >= 3;

            return (
              <TouchableOpacity
                key={goal.value}
                style={[
                  styles.goalCard,
                  isSelected && styles.goalCardSelected,
                  isDisabled && styles.goalCardDisabled,
                ]}
                onPress={() => handleToggleGoal(goal.value)}
                disabled={isDisabled}
              >
                <Text style={styles.goalIcon}>{goal.icon}</Text>
                <Text style={[styles.goalLabel, isSelected && styles.goalLabelSelected]}>
                  {goal.value}
                </Text>
                {isSelected && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {data.goals.length > 0 && (
          <Text style={styles.selectedCount}>{data.goals.length} of 3 selected</Text>
        )}
      </View>

      <View style={styles.section}>
        <CharacterCounter
          value={data.motivation}
          onChangeText={(text) => updateData('motivation', text)}
          minLength={20}
          maxLength={300}
          label="Why does this matter to you?"
          placeholder="What would achieving these goals mean for your life?"
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
  goalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  goalCard: {
    width: '48%',
    aspectRatio: 1.2,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  goalCardSelected: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  goalCardDisabled: {
    opacity: 0.5,
  },
  goalIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  goalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    textAlign: 'center',
  },
  goalLabelSelected: {
    color: '#1e40af',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  selectedCount: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 12,
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
