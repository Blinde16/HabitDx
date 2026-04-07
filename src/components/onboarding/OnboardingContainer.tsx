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
        paddingHorizontal: 28,
        paddingTop: 32,
        paddingBottom: 80,
      }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <ProgressIndicator current={currentScreen} total={totalScreens} />

      <View className="mb-8 self-start w-full">
        <View className="self-start bg-primary_container rounded-full px-4 py-2 mb-4">
          <Text className="text-xs font-public-sb uppercase tracking-[2px] text-white/90">
            {promptLabel}
          </Text>
        </View>

        <View className="bg-primary_container rounded-3xl rounded-tl-md px-6 py-6">
          <Text className="text-[26px] font-manrope text-white leading-8 mb-2">{title}</Text>
          {subtitle ? (
            <Text className="text-base font-public text-white/85 leading-6">{subtitle}</Text>
          ) : null}
        </View>
      </View>

      <View className="bg-surface_container_low rounded-3xl px-5 py-5 mb-6">
        <Text className="text-xs font-public-sb uppercase tracking-[1px] text-on_surface_variant mb-2">
          {responseLabel}
        </Text>
        <Text className="text-sm font-public text-on_surface leading-6">
          Choose what fits, edit freely, stay honest. We shape habits around your real constraints,
          not an ideal calendar.
        </Text>
      </View>

      {tip ? (
        <View className="bg-surface_container_highest rounded-2xl px-4 py-4 mb-6">
          <Text className="text-sm font-public text-on_surface leading-6">{tip}</Text>
        </View>
      ) : null}

      {children}
    </ScrollView>
  );

  if (Platform.OS === 'web') {
    return <View style={{ flex: 1, backgroundColor: '#f7f9fb' }}>{content}</View>;
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-surface"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {content}
    </KeyboardAvoidingView>
  );
};
