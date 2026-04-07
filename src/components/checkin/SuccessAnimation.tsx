import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

interface SuccessAnimationProps {
  visible: boolean;
  habitName: string;
  celebration: string;
}

export default function SuccessAnimation({
  visible,
  habitName,
  celebration,
}: SuccessAnimationProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    if (visible) {
      if (Platform.OS !== 'web') {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
        }),
      ]).start();

      setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 240,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -8,
            duration: 240,
            useNativeDriver: true,
          }),
        ]).start();
      }, 2400);
    }
  }, [visible, fadeAnim, translateY]);

  if (!visible) return null;

  return (
    <Animated.View
      className="absolute top-16 left-0 right-0 mx-7 z-50"
      style={{
        opacity: fadeAnim,
        transform: [{ translateY }],
      }}
    >
      <View
        className="rounded-2xl px-5 py-4"
        style={{
          backgroundColor: 'rgba(19, 27, 46, 0.94)',
          shadowColor: '#191c1e',
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.12,
          shadowRadius: 40,
          elevation: 8,
        }}
      >
        <Text className="text-white font-manrope-md text-lg mb-1">Recorded</Text>
        <Text className="text-white/90 font-public text-base leading-6">{habitName}</Text>
        {celebration ? (
          <Text className="text-white/75 font-public text-sm mt-2 leading-5">{celebration}</Text>
        ) : null}
      </View>
    </Animated.View>
  );
}
