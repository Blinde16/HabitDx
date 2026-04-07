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
      className={`px-4 py-3 rounded-full mr-2 mb-2 ${
        selected ? 'bg-primary_container' : 'bg-surface_brand_muted'
      }`}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text className={`text-sm font-public-sb ${selected ? 'text-white' : 'text-on_surface'}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};
