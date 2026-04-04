import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import HabitService from '../../lib/habitService';
import type { Habit, HabitStack } from '../../types/habit';
import { logInfo, logError } from '../../lib/logger';

export default function HabitStackScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [stack, setStack] = useState<HabitStack | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHabits();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only load
  }, []);

  const loadHabits = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const existingStack = await HabitService.getActiveStack(user.id);

      if (existingStack) {
        setStack(existingStack);
        const existingHabits = await HabitService.getActiveHabits(user.id);
        setHabits(existingHabits);
      } else {
        await generateHabits();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load habits';
      setError(errorMessage);
      logError(err as Error, { context: 'habitStack.load', userId: user.id });
    } finally {
      setLoading(false);
    }
  };

  const generateHabits = async () => {
    if (!user) return;

    try {
      setGenerating(true);
      setError(null);

      logInfo('User initiated habit generation', { userId: user.id });

      const result = await HabitService.generateHabits(user.id);

      setStack(result.stack);
      setHabits(result.habits);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate habits';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerate = () => {
    Alert.alert(
      'Regenerate Habits?',
      'This will create a new set of habits based on your habit profile. Current habits will be archived.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Regenerate',
          style: 'destructive',
          onPress: async () => {
            if (!user) return;
            try {
              setGenerating(true);
              const result = await HabitService.regenerateHabits(user.id);
              setStack(result.stack);
              setHabits(result.habits);
              Alert.alert('Updated', 'Your habit stack has been regenerated.');
            } catch (err) {
              const errorMessage = err instanceof Error ? err.message : 'Failed to regenerate';
              Alert.alert('Error', errorMessage);
            } finally {
              setGenerating(false);
            }
          },
        },
      ]
    );
  };

  const handleStartTracking = () => {
    router.replace('/(onboarding)/notifications');
  };

  const getDayNames = (days: number[]): string => {
    const dayMap: { [key: number]: string } = {
      1: 'Mon',
      2: 'Tue',
      3: 'Wed',
      4: 'Thu',
      5: 'Fri',
      6: 'Sat',
      7: 'Sun',
    };

    if (days.length === 7) return 'Every day';
    if (days.length === 5 && days.every((d) => d >= 1 && d <= 5)) return 'Weekdays';
    if (days.length === 2 && days.includes(6) && days.includes(7)) return 'Weekends';

    return days.map((d) => dayMap[d]).join(', ');
  };

  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <View className="flex-1 bg-surface items-center justify-center">
        <ActivityIndicator size="large" color="#191c1e" />
        <Text className="mt-4 font-public text-on_surface_variant">Loading habits…</Text>
      </View>
    );
  }

  if (generating) {
    return (
      <View className="flex-1 bg-surface items-center justify-center px-7">
        <ActivityIndicator size="large" color="#191c1e" />
        <Text className="mt-4 text-xl font-manrope text-on_surface text-center">
          Designing Your Stack
        </Text>
        <Text className="mt-2 font-public text-on_surface_variant text-center leading-6">
          Translating your profile and constraints into small, schedulable actions.
        </Text>
        <View className="mt-8 space-y-3">
          <Text className="text-sm font-public text-on_surface_variant text-center">
            · Energy and timing
          </Text>
          <Text className="text-sm font-public text-on_surface_variant text-center">
            · Past friction points
          </Text>
          <Text className="text-sm font-public text-on_surface_variant text-center">
            · Tiny versions
          </Text>
          <Text className="text-sm font-public text-on_surface_variant text-center">· Anchors</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-surface items-center justify-center px-7">
        <Text className="text-xl font-manrope text-on_surface mb-2 text-center">
          Something Went Wrong
        </Text>
        <Text className="font-public text-on_surface_variant text-center mb-8 leading-6">
          {error}
        </Text>
        <TouchableOpacity
          activeOpacity={0.92}
          onPress={loadHabits}
          className="rounded-full overflow-hidden"
        >
          <LinearGradient
            colors={['#000000', '#131b2e']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradBtn}
          >
            <Text className="text-white font-public-sb">Try Again</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  if (!stack || habits.length === 0) {
    return (
      <View className="flex-1 bg-surface items-center justify-center px-7">
        <Text className="text-xl font-manrope text-on_surface mb-6 text-center">No Habits Yet</Text>
        <TouchableOpacity
          activeOpacity={0.92}
          onPress={generateHabits}
          className="rounded-full overflow-hidden"
        >
          <LinearGradient
            colors={['#000000', '#131b2e']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradBtn}
          >
            <Text className="text-white font-public-sb">Generate Habits</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-surface">
      <View className="px-7 py-10">
        <View className="mb-8 self-start">
          <Text className="font-manrope text-display-lg text-on_surface mb-2">
            Your Habit Stack
          </Text>
          <Text className="font-public text-on_surface_variant leading-6">
            Shaped by your profile and constraints
          </Text>
        </View>

        {stack.generation_rationale && (
          <View className="bg-surface_container_low rounded-xl p-5 mb-8">
            <Text className="text-sm font-manrope-md text-on_surface mb-2">
              Why This Combination
            </Text>
            <Text className="font-public text-on_surface leading-6">
              {stack.generation_rationale}
            </Text>
          </View>
        )}

        {habits.map((habit, index) => (
          <View key={habit.id} className="bg-surface_container_lowest rounded-xl p-6 mb-5">
            <View className="flex-row items-center mb-4">
              <View className="w-9 h-9 bg-primary_container rounded-full items-center justify-center mr-3">
                <Text className="text-white font-public-sb">{index + 1}</Text>
              </View>
              <Text className="text-xl font-manrope text-on_surface flex-1">{habit.name}</Text>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-public-sb text-on_surface_variant mb-1">
                Tiny version
              </Text>
              <Text className="font-public text-on_surface leading-6">{habit.tiny_version}</Text>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-public-sb text-on_surface_variant mb-1">Anchor</Text>
              <Text className="font-public text-on_surface leading-6">{habit.anchor}</Text>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-public-sb text-on_surface_variant mb-1">
                Celebration
              </Text>
              <Text className="font-public text-on_surface leading-6">{habit.celebration}</Text>
            </View>

            <View className="bg-growth_muted rounded-xl p-4 mb-4">
              <Text className="text-sm font-manrope-md text-on_surface mb-2">Why This Fits</Text>
              <Text className="font-public text-on_surface leading-6">{habit.rationale}</Text>
            </View>

            <View className="flex-row flex-wrap justify-between gap-y-3">
              <View className="min-w-[45%]">
                <Text className="text-xs font-public text-on_surface_variant">Schedule</Text>
                <Text className="text-sm font-public-sb text-on_surface">
                  {getDayNames(habit.days_of_week)}
                </Text>
              </View>
              {habit.reminder_enabled && (
                <View className="min-w-[45%]">
                  <Text className="text-xs font-public text-on_surface_variant">Reminder</Text>
                  <Text className="text-sm font-public-sb text-on_surface">
                    {formatTime(habit.reminder_time)}
                  </Text>
                </View>
              )}
              <View className="min-w-[45%]">
                <Text className="text-xs font-public text-on_surface_variant">Pattern</Text>
                <Text className="text-sm font-public-sb text-tertiary_fixed_dim">
                  {habit.addresses_pattern}
                </Text>
              </View>
            </View>
          </View>
        ))}

        <View className="bg-surface_container_low rounded-xl p-5 mb-8">
          <Text className="text-sm font-manrope-md text-on_surface mb-3">Principles</Text>
          <Text className="font-public text-on_surface leading-6 mb-2">
            · Start small: the minimum counts as the win.
          </Text>
          <Text className="font-public text-on_surface leading-6 mb-2">
            · Anchors turn intention into sequence.
          </Text>
          <Text className="font-public text-on_surface leading-6 mb-2">
            · Acknowledge completion calmly—it reinforces the loop.
          </Text>
          <Text className="font-public text-on_surface leading-6">
            · Don&apos;t miss twice: one quiet day is data; back-to-back misses deserve a smaller
            step.
          </Text>
        </View>

        <View className="space-y-3">
          <TouchableOpacity
            activeOpacity={0.92}
            onPress={handleStartTracking}
            className="rounded-full overflow-hidden"
          >
            <LinearGradient
              colors={['#000000', '#131b2e']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradBtnWide}
            >
              <Text className="text-white font-public-sb text-lg">Start Tracking</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity className="py-4 items-center" onPress={handleRegenerate}>
            <Text className="text-on_surface_variant font-public-sb">Regenerate Stack</Text>
          </TouchableOpacity>
        </View>

        <View className="mt-8 bg-surface_container_low rounded-xl p-4">
          <Text className="text-xs font-public text-on_surface_variant text-center">
            Stack created {new Date(stack.created_at).toLocaleDateString()}
          </Text>
          <Text className="text-xs font-public text-on_surface_variant text-center mt-2">
            Adjustments can follow weekly from your data
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  gradBtn: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  gradBtnWide: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});
