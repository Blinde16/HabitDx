import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
    if (canProceed()) {
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
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>When do you have the most energy?</Text>
        <View style={styles.energyOptions}>
          {ENERGY_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.energyOption,
                data.constraints.peak_energy === option.value && styles.energyOptionSelected,
              ]}
              onPress={() =>
                updateData('constraints', {
                  ...data.constraints,
                  peak_energy: option.value,
                })
              }
            >
              <Text style={styles.energyIcon}>{option.icon}</Text>
              <Text
                style={[
                  styles.energyLabel,
                  data.constraints.peak_energy === option.value && styles.energyLabelSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>What&apos;s your daily schedule like?</Text>
        <View style={styles.chipContainer}>
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

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>What makes habits hard for you?</Text>
        <View style={styles.chipContainer}>
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
  energyOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  energyOption: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  energyOptionSelected: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  energyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  energyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  energyLabelSelected: {
    color: '#1e40af',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
