import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
} from 'react-native';
import { fontFamily } from '../../lib/fonts';

interface SocialButtonProps extends TouchableOpacityProps {
  provider: 'google' | 'apple';
  loading?: boolean;
}

export const SocialButton: React.FC<SocialButtonProps> = ({
  provider,
  loading = false,
  disabled,
  ...props
}) => {
  const isDisabled = disabled || loading;
  const providerConfig = {
    google: {
      title: 'Continue with Google',
      backgroundColor: '#f2f4f6',
      textColor: '#191c1e',
    },
    apple: {
      title: 'Continue with Apple',
      backgroundColor: '#131b2e',
      textColor: '#ffffff',
    },
  };

  const config = providerConfig[provider];

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: config.backgroundColor },
        isDisabled && styles.disabledButton,
      ]}
      disabled={isDisabled}
      activeOpacity={0.88}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={config.textColor} />
      ) : (
        <Text style={[styles.buttonText, { color: config.textColor }]}>{config.title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
    paddingHorizontal: 24,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: fontFamily.publicSansSemibold,
  },
});
