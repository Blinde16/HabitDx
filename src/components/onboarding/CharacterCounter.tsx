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
    if (error) return 'border-on_error_container';
    if (isValid) return 'border-accent';
    return 'border-ghost_border';
  };

  return (
    <View className="mb-4">
      <Text className="text-sm font-public-sb text-on_surface mb-2">{label}</Text>
      <TextInput
        className={`min-h-[116px] border rounded-2xl px-4 py-4 text-base text-on_surface bg-surface_brand_muted ${getBorderColor()}`}
        style={{ textAlignVertical: 'top', borderWidth: 1 }}
        value={value}
        multiline
        maxLength={maxLength}
        placeholderTextColor="#8a9199"
        {...props}
      />
      <View className="flex-row justify-between items-center mt-1">
        <View className="flex-1">
          {isTooShort && (
            <Text className="text-xs font-public text-on_surface_variant">
              At least {minLength - length} more characters needed
            </Text>
          )}
          {error && <Text className="text-xs font-public text-on_error_container">{error}</Text>}
        </View>
        <Text className="text-xs font-public text-on_surface_variant">
          {length}/{maxLength}
        </Text>
      </View>
    </View>
  );
};
