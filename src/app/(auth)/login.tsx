import React, { useState } from 'react';
import {
  View,
  Text,
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

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, signInWithGoogle, loading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const validateForm = (): boolean => {
    const errors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignIn = async () => {
    clearError();

    if (!validateForm()) {
      return;
    }

    try {
      await signIn(email, password);
      // Navigation is handled by auth state + route guards.
    } catch {
      // Error is handled in the store and displayed via <ErrorMessage>.
    }
  };

  const handleGoogleSignIn = async () => {
    clearError();
    try {
      await signInWithGoogle();
    } catch (err) {
      logError(err instanceof Error ? err : new Error(String(err)), {
        context: 'auth.googleSignIn',
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={s.header}>
          <HabitDxLogo width={220} style={{ marginBottom: 20 }} />
          <Text style={s.title}>Welcome Back</Text>
          <Text style={s.subtitle}>Sign in to continue to HabitDx</Text>
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
            placeholder="Enter your password"
            isPassword
            autoComplete="password"
            error={validationErrors.password}
          />

          <TouchableOpacity
            onPress={() => router.push('/(auth)/forgot-password')}
            style={s.forgotPassword}
          >
            <Text style={s.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <AuthButton title="Sign In" onPress={handleSignIn} loading={loading} variant="primary" />

          <Text style={s.orLabel}>OR</Text>

          <SocialButton provider="google" onPress={handleGoogleSignIn} loading={loading} />

          <View style={s.linkRow}>
            <Text style={s.linkMuted}>Don&apos;t have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text style={s.linkAccent}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
