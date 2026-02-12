import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
  View,
} from 'react-native';

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
      icon: '🔍', // In production, use proper icons
      backgroundColor: '#fff',
      textColor: '#333',
      borderColor: '#ddd',
    },
    apple: {
      title: 'Continue with Apple',
      icon: '🍎',
      backgroundColor: '#000',
      textColor: '#fff',
      borderColor: '#000',
    },
  };

  const config = providerConfig[provider];

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: config.backgroundColor,
          borderColor: config.borderColor,
        },
        isDisabled && styles.disabledButton,
      ]}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={config.textColor} />
      ) : (
        <View style={styles.content}>
          <Text style={styles.icon}>{config.icon}</Text>
          <Text style={[styles.buttonText, { color: config.textColor }]}>{config.title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
