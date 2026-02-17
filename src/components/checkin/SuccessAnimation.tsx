import React, { useEffect, useRef } from 'react';
import { Animated, View, Text } from 'react-native';
import * as Haptics from 'expo-haptics';

interface SuccessAnimationProps {
  visible: boolean;
  habitName: string;
  celebration: string;
}

export default function SuccessAnimation({ visible, habitName, celebration }: SuccessAnimationProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (visible) {
      // Trigger haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Animate out after 2.5 seconds
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: -50,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }, 2500);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      className="absolute top-20 left-0 right-0 mx-6 z-50"
      style={{
        opacity: fadeAnim,
        transform: [
          { scale: scaleAnim },
          { translateY: slideAnim },
        ],
      }}
    >
      <View className="bg-green-500 rounded-2xl p-4 shadow-lg">
        <View className="flex-row items-center">
          <Text className="text-4xl mr-3">✅</Text>
          <View className="flex-1">
            <Text className="text-white font-bold text-lg">
              {habitName} Complete!
            </Text>
            <Text className="text-green-100 text-sm mt-1">
              🎉 {celebration}
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}
