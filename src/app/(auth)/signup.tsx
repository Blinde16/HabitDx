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
        return '#ef4444';
      case 'Medium':
        return '#f59e0b';
      case 'Strong':
        return '#10b981';
      default:
        return '#6b7280';
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
      // Navigation will be handled by the auth state change
      // Or show email verification message
      router.replace('/');
    } catch (err) {
      // Error is handled in the store
      console.error('Signup error:', err);
    }
  };

  const handleGoogleSignUp = async () => {
    clearError();
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Google sign up error:', err);
    }
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started with HabitDx</Text>
        </View>

        <View style={styles.form}>
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

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <SocialButton provider="google" onPress={handleGoogleSignUp} loading={loading} />

          <View style={styles.loginPrompt}>
            <Text style={styles.loginPromptText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.termsText}>
            By signing up, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  form: {
    width: '100%',
  },
  passwordStrength: {
    marginTop: -8,
    marginBottom: 8,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#6b7280',
    fontSize: 14,
  },
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginPromptText: {
    color: '#6b7280',
    fontSize: 14,
  },
  loginLink: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
  },
  termsText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 16,
  },
});
