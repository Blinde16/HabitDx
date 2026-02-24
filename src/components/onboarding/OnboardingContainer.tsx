import React from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { ProgressIndicator } from './ProgressIndicator';

interface OnboardingContainerProps {
  currentScreen: number;
  totalScreens: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const OnboardingContainer: React.FC<OnboardingContainerProps> = ({
  currentScreen,
  totalScreens,
  title,
  subtitle,
  children,
}) => {
  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 40, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ProgressIndicator current={currentScreen} total={totalScreens} />

        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-900 mb-2">{title}</Text>
          {subtitle && <Text className="text-base text-gray-500 leading-6">{subtitle}</Text>}
        </View>

        <View className="flex-1">{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
