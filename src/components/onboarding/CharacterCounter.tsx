import React from 'react';
import { View, TextInput, Text, TextInputProps } from 'react-native';

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

  const getBorderColor = () => {
    if (error) return 'border-red-500';
    if (isValid) return 'border-green-500';
    return 'border-gray-300';
  };

  return (
    <View className="mb-4">
      <Text className="text-sm font-semibold text-gray-800 mb-2">{label}</Text>
      <TextInput
        className={`min-h-[100px] border rounded-lg px-3 py-3 text-base text-gray-900 ${getBorderColor()}`}
        style={{ textAlignVertical: 'top' }}
        value={value}
        multiline
        maxLength={maxLength}
        {...props}
      />
      <View className="flex-row justify-between items-center mt-1">
        <View className="flex-1">
          {isTooShort && (
            <Text className="text-xs text-gray-500">
              At least {minLength - length} more characters needed
            </Text>
          )}
          {error && <Text className="text-xs text-red-500">{error}</Text>}
        </View>
        <Text className={`text-xs ${length > maxLength * 0.9 ? 'text-amber-500' : 'text-gray-400'}`}>
          {length}/{maxLength}
        </Text>
      </View>
    </View>
  );
};
