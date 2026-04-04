import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { fontFamily } from '../../lib/fonts';

interface AuthButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
}

export const AuthButton: React.FC<AuthButtonProps> = ({
  title,
  loading = false,
  variant = 'primary',
  disabled,
  ...props
}) => {
  const isDisabled = disabled || loading;

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        activeOpacity={0.92}
        style={[styles.primaryWrap, isDisabled && styles.disabledButton]}
        disabled={isDisabled}
        {...props}
      >
        <LinearGradient
          colors={['#263247', '#2d384a']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.primaryGradient}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.primaryButtonText}>{title}</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === 'secondary' && styles.secondaryButton,
        variant === 'outline' && styles.outlineButton,
        isDisabled && styles.disabledButton,
      ]}
      disabled={isDisabled}
      activeOpacity={0.85}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#191c1e' : '#191c1e'} />
      ) : (
        <Text
          style={[
            styles.buttonTextBase,
            variant === 'secondary' && styles.secondaryButtonText,
            variant === 'outline' && styles.outlineButtonText,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  primaryWrap: {
    borderRadius: 9999,
    overflow: 'hidden',
    marginVertical: 8,
  },
  primaryGradient: {
    minHeight: 52,
    paddingHorizontal: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: fontFamily.publicSansSemibold,
  },
  button: {
    minHeight: 52,
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
    paddingHorizontal: 24,
  },
  secondaryButton: {
    backgroundColor: '#eef7f3',
  },
  outlineButton: {
    backgroundColor: 'transparent',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonTextBase: {
    fontSize: 16,
    fontFamily: fontFamily.publicSansSemibold,
  },
  secondaryButtonText: {
    color: '#191c1e',
  },
  outlineButtonText: {
    color: '#191c1e',
  },
});
