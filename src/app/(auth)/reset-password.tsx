import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { AuthInput, AuthButton, ErrorMessage } from '../../components/auth';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { updatePassword, loading, error, clearError } = useAuthStore();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<{
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    // Check if we have the necessary tokens from the deep link
    // The tokens will be in the URL params
    console.log('Reset password params:', params);
  }, [params]);

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
      newPassword?: string;
      confirmPassword?: string;
    } = {};

    if (!newPassword) {
      errors.newPassword = 'Password is required';
    } else if (newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdatePassword = async () => {
    clearError();

    if (!validateForm()) {
      return;
    }

    try {
      await updatePassword(newPassword);
      setResetSuccess(true);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 2000);
    } catch (err) {
      console.error('Update password error:', err);
    }
  };

  if (resetSuccess) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={styles.successTitle}>Password Updated!</Text>
          <Text style={styles.successMessage}>
            Your password has been successfully updated. Redirecting to login...
          </Text>
        </View>
      </View>
    );
  }

  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>Enter your new password below</Text>
        </View>

        <View style={styles.form}>
          <ErrorMessage message={error} />

          <AuthInput
            label="New Password"
            value={newPassword}
            onChangeText={(text) => {
              setNewPassword(text);
              setValidationErrors({ ...validationErrors, newPassword: undefined });
            }}
            placeholder="Create a new password"
            isPassword
            autoComplete="password-new"
            error={validationErrors.newPassword}
          />

          {newPassword.length > 0 && (
            <View style={styles.passwordStrength}>
              <Text
                style={[styles.strengthText, { color: getPasswordStrengthColor(passwordStrength) }]}
              >
                Password strength: {passwordStrength}
              </Text>
            </View>
          )}

          <AuthInput
            label="Confirm New Password"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              setValidationErrors({ ...validationErrors, confirmPassword: undefined });
            }}
            placeholder="Confirm your new password"
            isPassword
            autoComplete="password-new"
            error={validationErrors.confirmPassword}
          />

          <AuthButton
            title="Update Password"
            onPress={handleUpdatePassword}
            loading={loading}
            variant="primary"
          />
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
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  successIcon: {
    fontSize: 64,
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 16,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
  },
});
