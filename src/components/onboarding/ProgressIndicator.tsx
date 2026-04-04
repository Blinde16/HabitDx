import React from 'react';
import { View, Text } from 'react-native';

interface ProgressIndicatorProps {
  current: number;
  total: number;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ current, total }) => {
  const progress = (current / total) * 100;

  return (
    <View className="mb-8">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-xs font-public-sb uppercase tracking-[2px] text-on_surface_variant">
          Guided setup
        </Text>
        <Text className="text-xs font-public text-on_surface_variant">
          Step {current} of {total}
        </Text>
      </View>

      <View className="h-1.5 bg-surface_container_highest rounded-full overflow-hidden mb-3">
        <View
          className="h-full bg-primary_container rounded-full"
          style={{ width: `${progress}%` }}
        />
      </View>

      <View className="flex-row gap-2">
        {Array.from({ length: total }, (_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === current;
          const isComplete = stepNumber < current;

          return (
            <View
              key={stepNumber}
              className={`flex-1 h-1.5 rounded-full ${
                isComplete
                  ? 'bg-primary_container'
                  : isActive
                    ? 'bg-surface_container_high'
                    : 'bg-surface_container_highest'
              }`}
            />
          );
        })}
      </View>
    </View>
  );
};
