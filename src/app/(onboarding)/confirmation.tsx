import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useAuthStore } from '../../stores/authStore';
import { OnboardingContainer } from '../../components/onboarding';
import { AuthButton } from '../../components/auth';

export default function ConfirmationScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data, updateData, submitOnboarding, prevScreen, loading, error } = useOnboardingStore();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) return;

    try {
      setSubmitting(true);
      await submitOnboarding(user.id);
      // Navigate to home after successful submission
      router.replace('/');
    } catch (err) {
      console.error('Onboarding submission error:', err);
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    prevScreen();
    router.back();
  };

  return (
    <OnboardingContainer
      currentScreen={5}
      totalScreens={5}
      title="Perfect! Here's what happens next:"
    >
      <View style={styles.timeline}>
        <View style={styles.timelineItem}>
          <View style={styles.timelineIcon}>
            <Text style={styles.timelineIconText}>✅</Text>
          </View>
          <View style={styles.timelineContent}>
            <Text style={styles.timelineTitle}>Step 1: We&apos;ll analyze your responses</Text>
            <Text style={styles.timelineSubtitle}>Takes about 30 seconds</Text>
          </View>
        </View>

        <View style={styles.timelineItem}>
          <View style={styles.timelineIcon}>
            <Text style={styles.timelineIconText}>🎯</Text>
          </View>
          <View style={styles.timelineContent}>
            <Text style={styles.timelineTitle}>
              Step 2: You&apos;ll get your Habit Failure Profile
            </Text>
            <Text style={styles.timelineSubtitle}>Understand your patterns</Text>
          </View>
        </View>

        <View style={styles.timelineItem}>
          <View style={styles.timelineIcon}>
            <Text style={styles.timelineIconText}>📋</Text>
          </View>
          <View style={styles.timelineContent}>
            <Text style={styles.timelineTitle}>
              Step 3: We&apos;ll design 1-3 habits just for you
            </Text>
            <Text style={styles.timelineSubtitle}>Personalized to your life</Text>
          </View>
        </View>

        <View style={styles.timelineItem}>
          <View style={styles.timelineIcon}>
            <Text style={styles.timelineIconText}>📱</Text>
          </View>
          <View style={styles.timelineContent}>
            <Text style={styles.timelineTitle}>Step 4: Check in daily</Text>
            <Text style={styles.timelineSubtitle}>Takes just 10 seconds</Text>
          </View>
        </View>

        <View style={styles.timelineItem}>
          <View style={styles.timelineIcon}>
            <Text style={styles.timelineIconText}>💡</Text>
          </View>
          <View style={styles.timelineContent}>
            <Text style={styles.timelineTitle}>Step 5: Get weekly insights to improve</Text>
            <Text style={styles.timelineSubtitle}>Continuous optimization</Text>
          </View>
        </View>
      </View>

      <View style={styles.notificationSection}>
        <Text style={styles.notificationLabel}>Can we send helpful reminders?</Text>
        <TouchableOpacity
          style={styles.toggle}
          onPress={() => updateData('notificationsEnabled', !data.notificationsEnabled)}
        >
          <View style={[styles.toggleTrack, data.notificationsEnabled && styles.toggleTrackActive]}>
            <View
              style={[styles.toggleThumb, data.notificationsEnabled && styles.toggleThumbActive]}
            />
          </View>
          <Text style={styles.toggleLabel}>
            {data.notificationsEnabled ? 'Enabled' : 'Disabled'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.notificationSubtext}>You can change this anytime in settings</Text>
      </View>

      <View style={styles.privacyNote}>
        <Text style={styles.privacyText}>🔒 Your data is private and never shared</Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack} disabled={submitting}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <AuthButton
          title={submitting ? 'Analyzing...' : 'Analyze My Data'}
          onPress={handleSubmit}
          variant="primary"
          loading={submitting || loading}
          disabled={submitting || loading}
        />
      </View>
    </OnboardingContainer>
  );
}

const styles = StyleSheet.create({
  timeline: {
    marginBottom: 32,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  timelineIconText: {
    fontSize: 24,
  },
  timelineContent: {
    flex: 1,
    justifyContent: 'center',
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 4,
  },
  timelineSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  notificationSection: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  notificationLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 12,
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  toggleTrack: {
    width: 51,
    height: 31,
    borderRadius: 16,
    backgroundColor: '#d1d5db',
    padding: 2,
  },
  toggleTrackActive: {
    backgroundColor: '#3b82f6',
  },
  toggleThumb: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: '#fff',
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
  toggleLabel: {
    marginLeft: 12,
    fontSize: 16,
    color: '#111',
  },
  notificationSubtext: {
    fontSize: 12,
    color: '#9ca3af',
  },
  privacyNote: {
    padding: 12,
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    marginBottom: 24,
  },
  privacyText: {
    fontSize: 14,
    color: '#166534',
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  errorText: {
    color: '#991b1b',
    fontSize: 14,
  },
  actions: {
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
