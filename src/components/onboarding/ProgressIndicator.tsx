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
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-xs font-semibold uppercase tracking-[1px] text-blue-700">
          Guided setup
        </Text>
        <Text className="text-xs font-semibold text-gray-500">
          Step {current} of {total}
        </Text>
      </View>

      <View className="h-2 bg-blue-100 rounded-full overflow-hidden mb-3">
        <View className="h-full bg-blue-500 rounded-full" style={{ width: `${progress}%` }} />
      </View>

      <View className="flex-row gap-2">
        {Array.from({ length: total }, (_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === current;
          const isComplete = stepNumber < current;

          return (
            <View
              key={stepNumber}
              className={`flex-1 h-2 rounded-full ${
                isComplete ? 'bg-blue-500' : isActive ? 'bg-blue-300' : 'bg-gray-200'
              }`}
            />
          );
        })}
      </View>
    </View>
  );
};
