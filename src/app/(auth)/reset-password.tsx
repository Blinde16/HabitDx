import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { AuthInput, AuthButton, ErrorMessage } from '../../components/auth';
import { authScreenStyles as s } from '../../styles/authScreenStyles';
import { fontFamily } from '../../lib/fonts';

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

      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 2000);
    } catch (err) {
      console.error('Update password error:', err);
    }
  };

  if (resetSuccess) {
    return (
      <View style={s.container}>
        <View style={styles.successContainer}>
          <Text style={styles.successTitle}>Password Updated</Text>
          <Text style={styles.successMessage}>
            Your password has been updated. Redirecting to sign in…
          </Text>
        </View>
      </View>
    );
  }

  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={s.header}>
          <Text style={s.title}>Reset Password</Text>
          <Text style={s.subtitle}>Enter your new password below</Text>
        </View>

        <View style={s.form}>
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
  passwordStrength: {
    marginTop: -8,
    marginBottom: 8,
  },
  strengthText: {
    fontSize: 12,
    fontFamily: fontFamily.publicSansMedium,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
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
    color: '#5c6370',
    lineHeight: 24,
  },
});
