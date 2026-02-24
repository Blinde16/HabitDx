import React from 'react';
import { View, Text } from 'react-native';

interface ProgressIndicatorProps {
  current: number;
  total: number;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ current, total }) => {
  const progress = (current / total) * 100;

  return (
    <View className="mb-6">
      <View className="h-1 bg-gray-200 rounded-sm overflow-hidden mb-2">
        <View className="h-full bg-blue-500 rounded-sm" style={{ width: `${progress}%` }} />
      </View>
      <Text className="text-xs text-gray-500 text-right">
        {current} of {total}
      </Text>
    </View>
  );
};
