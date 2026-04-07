import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { AuthInput, AuthButton, SocialButton, ErrorMessage } from '../../components/auth';
import { logError } from '../../lib/logger';
import { authScreenStyles as s } from '../../styles/authScreenStyles';
import { HabitDxLogo } from '../../components/brand';
import { fontFamily } from '../../lib/fonts';

export default function SignupScreen() {
  const router = useRouter();
  const { signUp, signInWithGoogle, loading, error, clearError } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const getPasswordStrength = (pwd: string): string => {
    if (pwd.length === 0) return '';
    if (pwd.length < 6) return 'Weak';
    if (pwd.length < 10) return 'Medium';
    if (pwd.length >= 10 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) return 'Strong';
    return 'Medium';
  };

  const getPasswordStrengthColor = (strength: string): string => {
    switch (strength) {
      case 'Weak':
        return '#8b5a5a';
      case 'Medium':
        return '#7d6b55';
      case 'Strong':
        return '#2d6a58';
      default:
        return '#5c6370';
    }
  };

  const validateForm = (): boolean => {
    const errors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!name.trim()) {
      errors.name = 'Name is required';
    }

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignUp = async () => {
    clearError();

    if (!validateForm()) {
      return;
    }

    try {
      await signUp(email, password, { name });
      // Navigation is handled by auth state + route guards.
      // If email confirmation is required, the store sets a message and we stay here.
    } catch {
      // Error is handled in the store and displayed via <ErrorMessage>.
    }
  };

  const handleGoogleSignUp = async () => {
    clearError();
    try {
      await signInWithGoogle();
    } catch (err) {
      logError(err instanceof Error ? err : new Error(String(err)), {
        context: 'auth.googleSignUp',
      });
    }
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={s.header}>
          <HabitDxLogo width={220} style={{ marginBottom: 20 }} />
          <Text style={s.title}>Create Account</Text>
          <Text style={s.subtitle}>Sign up to get started with HabitDx</Text>
          <Text style={s.valueTagline}>
            Understand why your habits fail. Build ones that stick.
          </Text>
          <View style={s.valueBullets}>
            <Text style={s.valueBullet}>• Diagnostic habit analysis</Text>
            <Text style={s.valueBullet}>• Personalized tiny habits</Text>
            <Text style={s.valueBullet}>• Weekly pattern adjustments</Text>
          </View>
        </View>

        <View style={s.form}>
          <ErrorMessage message={error} />

          <AuthInput
            label="Name"
            value={name}
            onChangeText={(text) => {
              setName(text);
              setValidationErrors({ ...validationErrors, name: undefined });
            }}
            placeholder="Your name"
            autoComplete="name"
            error={validationErrors.name}
          />

          <AuthInput
            label="Email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setValidationErrors({ ...validationErrors, email: undefined });
            }}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoComplete="email"
            error={validationErrors.email}
          />

          <AuthInput
            label="Password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setValidationErrors({ ...validationErrors, password: undefined });
            }}
            placeholder="Create a password"
            isPassword
            autoComplete="password-new"
            error={validationErrors.password}
          />

          {password.length > 0 && (
            <View style={styles.passwordStrength}>
              <Text
                style={[styles.strengthText, { color: getPasswordStrengthColor(passwordStrength) }]}
              >
                Password strength: {passwordStrength}
              </Text>
            </View>
          )}

          <AuthInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              setValidationErrors({ ...validationErrors, confirmPassword: undefined });
            }}
            placeholder="Confirm your password"
            isPassword
            autoComplete="password-new"
            error={validationErrors.confirmPassword}
          />

          <AuthButton
            title="Create Account"
            onPress={handleSignUp}
            loading={loading}
            variant="primary"
          />

          <Text style={s.orLabel}>OR</Text>

          <SocialButton provider="google" onPress={handleGoogleSignUp} loading={loading} />

          <View style={s.linkRow}>
            <Text style={s.linkMuted}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={s.linkAccent}>Sign In</Text>
            </TouchableOpacity>
          </View>

          <Text style={s.termsText}>
            By signing up, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  passwordStrength: {
    marginTop: -8,
    marginBottom: 8,
  },
  strengthText: {
    fontSize: 12,
    fontFamily: fontFamily.publicSansMedium,
  },
});
