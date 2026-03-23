import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

interface MultiSelectChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export const MultiSelectChip: React.FC<MultiSelectChipProps> = ({ label, selected, onPress }) => {
  return (
    <TouchableOpacity
      className={`px-4 py-3 rounded-2xl border mr-2 mb-2 ${
        selected ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-200'
      }`}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text className={`text-sm font-semibold ${selected ? 'text-white' : 'text-gray-700'}`}>
        {selected ? `✓ ${label}` : label}
      </Text>
    </TouchableOpacity>
  );
};
