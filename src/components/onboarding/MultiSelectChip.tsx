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
      className={`px-4 py-2.5 rounded-full border-2 mr-2 mb-2 ${
        selected ? 'bg-blue-100 border-blue-500' : 'bg-gray-100 border-gray-200'
      }`}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text className={`text-sm font-semibold ${selected ? 'text-blue-800' : 'text-gray-500'}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};
