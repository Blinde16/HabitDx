import React, { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { AuthInput, AuthButton, ErrorMessage } from '../../components/auth';
import { authScreenStyles as s } from '../../styles/authScreenStyles';
import { fontFamily } from '../../lib/fonts';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { resetPassword, loading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [validationError, setValidationError] = useState<string | undefined>();

  const validateEmail = (): boolean => {
    if (!email.trim()) {
      setValidationError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setValidationError('Email is invalid');
      return false;
    }
    return true;
  };

  const handleResetPassword = async () => {
    clearError();
    setValidationError(undefined);

    if (!validateEmail()) {
      return;
    }

    try {
      await resetPassword(email);
      setEmailSent(true);
    } catch (err) {
      console.error('Reset password error:', err);
    }
  };

  if (emailSent) {
    return (
      <View style={s.container}>
        <View style={styles.successContainer}>
          <Text style={styles.successTitle}>Check Your Email</Text>
          <Text style={styles.successMessage}>
            We&apos;ve sent a password reset link to {email}
          </Text>
          <Text style={styles.successSubtext}>
            Click the link in the email to reset your password. If you don&apos;t see it, check your
            spam folder.
          </Text>

          <AuthButton
            title="Back to Login"
            onPress={() => router.replace('/(auth)/login')}
            variant="primary"
          />

          <TouchableOpacity
            onPress={() => {
              setEmailSent(false);
              setEmail('');
            }}
            style={styles.resendButton}
          >
            <Text style={styles.resendText}>Send another email</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={s.header}>
          <Text style={s.title}>Forgot Password?</Text>
          <Text style={s.subtitle}>
            Enter your email address and we&apos;ll send you a link to reset your password
          </Text>
        </View>

        <View style={s.form}>
          <ErrorMessage message={error} />

          <AuthInput
            label="Email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setValidationError(undefined);
            }}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoComplete="email"
            error={validationError}
          />

          <AuthButton
            title="Send Reset Link"
            onPress={handleResetPassword}
            loading={loading}
            variant="primary"
          />

          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignSelf: 'stretch',
    paddingHorizontal: 28,
  },
  successTitle: {
    fontSize: 28,
    fontFamily: fontFamily.manrope,
    color: '#191c1e',
    marginBottom: 16,
    textAlign: 'left',
  },
  successMessage: {
    fontSize: 16,
    fontFamily: fontFamily.publicSans,
    color: '#191c1e',
    marginBottom: 8,
    lineHeight: 24,
  },
  successSubtext: {
    fontSize: 14,
    fontFamily: fontFamily.publicSans,
    color: '#5c6370',
    marginBottom: 32,
    lineHeight: 22,
  },
  resendButton: {
    marginTop: 16,
    alignSelf: 'flex-start',
  },
  resendText: {
    color: '#131b2e',
    fontSize: 14,
    fontFamily: fontFamily.publicSansSemibold,
  },
  backButton: {
    marginTop: 16,
    alignSelf: 'center',
  },
  backText: {
    color: '#5c6370',
    fontSize: 14,
    fontFamily: fontFamily.publicSansMedium,
  },
});
