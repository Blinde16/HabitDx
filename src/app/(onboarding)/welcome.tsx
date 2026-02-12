import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useAuthStore } from '../../stores/authStore';
import { AuthButton } from '../../components/auth';

export default function WelcomeScreen() {
  const router = useRouter();
  const { loadProgress, nextScreen } = useOnboardingStore();
  const { signOut } = useAuthStore();

  useEffect(() => {
    loadProgress();
  }, []);

  const handleGetStarted = () => {
    nextScreen();
    router.push('/(onboarding)/past-failures');
  };

  const handleSkip = async () => {
    try {
      await signOut();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Skip onboarding error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>🎯</Text>
        <Text style={styles.title}>Finally understand why your habits fail</Text>

        <View style={styles.benefits}>
          <View style={styles.benefit}>
            <Text style={styles.benefitIcon}>🎯</Text>
            <Text style={styles.benefitText}>Get your personal Habit Failure Profile</Text>
          </View>

          <View style={styles.benefit}>
            <Text style={styles.benefitIcon}>🧠</Text>
            <Text style={styles.benefitText}>Habits designed around your constraints</Text>
          </View>

          <View style={styles.benefit}>
            <Text style={styles.benefitIcon}>📈</Text>
            <Text style={styles.benefitText}>Weekly insights that actually work</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <AuthButton title="Get Started" onPress={handleGetStarted} variant="primary" />
          <Text style={styles.timeEstimate}>This takes ~5 minutes</Text>
        </View>

        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  logo: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 40,
  },
  benefits: {
    marginBottom: 48,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  benefitIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  benefitText: {
    flex: 1,
    fontSize: 18,
    color: '#374151',
    lineHeight: 26,
  },
  actions: {
    marginBottom: 16,
  },
  timeEstimate: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 12,
  },
  skipButton: {
    padding: 12,
    alignItems: 'center',
  },
  skipText: {
    fontSize: 16,
    color: '#9ca3af',
  },
});
