import React from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { ProgressIndicator } from './ProgressIndicator';

interface OnboardingContainerProps {
  currentScreen: number;
  totalScreens: number;
  title: string;
  subtitle?: string;
  promptLabel?: string;
  responseLabel?: string;
  tip?: string;
  children: React.ReactNode;
}

export const OnboardingContainer: React.FC<OnboardingContainerProps> = ({
  currentScreen,
  totalScreens,
  title,
  subtitle,
  promptLabel = 'HabitDx guide',
  responseLabel = 'Your reply',
  tip,
  children,
}) => {
  const content = (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 28,
        paddingBottom: 72,
      }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <ProgressIndicator current={currentScreen} total={totalScreens} />

      <View className="mb-6">
        <View className="self-start bg-blue-600 rounded-full px-4 py-2 mb-3">
          <Text className="text-xs font-semibold uppercase tracking-[1px] text-white">
            {promptLabel}
          </Text>
        </View>

        <View className="bg-slate-900 rounded-[28px] rounded-tl-md px-5 py-5 shadow-sm">
          <Text className="text-[28px] font-bold text-white leading-9 mb-2">{title}</Text>
          {subtitle && <Text className="text-base text-slate-200 leading-6">{subtitle}</Text>}
        </View>
      </View>

      <View className="bg-blue-50 border border-blue-100 rounded-3xl px-5 py-4 mb-6">
        <Text className="text-xs font-semibold uppercase tracking-[1px] text-blue-700 mb-2">
          {responseLabel}
        </Text>
        <Text className="text-sm text-slate-600 leading-6">
          Tap to choose, edit as you go, and keep your answers honest. We use this to shape
          habits around your real life, not an ideal one.
        </Text>
      </View>

      {tip && (
        <View className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-6">
          <Text className="text-sm text-amber-900 leading-6">{tip}</Text>
        </View>
      )}

      {children}
    </ScrollView>
  );

  // KeyboardAvoidingView clips content on web — just use a plain View
  if (Platform.OS === 'web') {
    return <View style={{ flex: 1, backgroundColor: '#fff' }}>{content}</View>;
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {content}
    </KeyboardAvoidingView>
  );
};
