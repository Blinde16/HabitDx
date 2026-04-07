import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { fontFamily } from '../../lib/fonts';

interface AuthInputProps extends TextInputProps {
  label: string;
  error?: string;
  isPassword?: boolean;
}

export const AuthInput: React.FC<AuthInputProps> = ({
  label,
  error,
  isPassword = false,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputContainer,
          focused && styles.inputContainerFocused,
          error ? styles.inputContainerError : null,
        ]}
      >
        <TextInput
          style={[styles.input, isPassword ? styles.inputWithToggle : styles.inputNoToggle]}
          placeholderTextColor="#9ca3af"
          secureTextEntry={isPassword && !showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)}>
            <Text style={styles.eyeText}>{showPassword ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: fontFamily.publicSansSemibold,
    color: '#191c1e',
    marginBottom: 8,
  },
  inputContainer: {
    position: 'relative',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(38, 50, 71, 0.12)',
    backgroundColor: '#f3fbf8',
  },
  inputContainerFocused: {
    borderColor: 'rgba(38, 50, 71, 0.22)',
    backgroundColor: '#ffffff',
  },
  inputContainerError: {
    backgroundColor: '#f0e6e8',
    borderColor: 'rgba(107, 47, 56, 0.2)',
  },
  input: {
    minHeight: 52,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: fontFamily.publicSans,
    color: '#191c1e',
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
  },
  inputNoToggle: {
    paddingRight: 16,
  },
  inputWithToggle: {
    paddingRight: 72,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  eyeText: {
    fontSize: 14,
    fontFamily: fontFamily.publicSansMedium,
    color: '#5c6370',
  },
  errorText: {
    fontSize: 12,
    fontFamily: fontFamily.publicSans,
    color: '#6b2f38',
    marginTop: 6,
  },
});
