import React from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';

interface CharacterCounterProps extends TextInputProps {
  value: string;
  minLength: number;
  maxLength: number;
  label: string;
  error?: string;
}

export const CharacterCounter: React.FC<CharacterCounterProps> = ({
  value,
  minLength,
  maxLength,
  label,
  error,
  ...props
}) => {
  const length = value.length;
  const isValid = length >= minLength && length <= maxLength;
  const isTooShort = length > 0 && length < minLength;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error ? styles.inputError : null, isValid ? styles.inputValid : null]}
        value={value}
        multiline
        maxLength={maxLength}
        {...props}
      />
      <View style={styles.footer}>
        {isTooShort && (
          <Text style={styles.hint}>At least {minLength - length} more characters needed</Text>
        )}
        {error && <Text style={styles.error}>{error}</Text>}
        <Text style={[styles.counter, length > maxLength * 0.9 && styles.counterWarning]}>
          {length}/{maxLength}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111',
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  inputValid: {
    borderColor: '#10b981',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  hint: {
    fontSize: 12,
    color: '#6b7280',
    flex: 1,
  },
  error: {
    fontSize: 12,
    color: '#ef4444',
    flex: 1,
  },
  counter: {
    fontSize: 12,
    color: '#9ca3af',
  },
  counterWarning: {
    color: '#f59e0b',
  },
});
