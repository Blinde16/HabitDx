import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
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
  }, []);

  const loadHabits = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Check for existing habit stack
      const existingStack = await HabitService.getActiveStack(user.id);

      if (existingStack) {
        setStack(existingStack);
        const existingHabits = await HabitService.getActiveHabits(user.id);
        setHabits(existingHabits);
      } else {
        // No stack exists, generate one
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
      'This will create a new set of habits based on your Failure Profile. Your current habits will be archived.',
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
              Alert.alert('Success', 'Your habit stack has been regenerated!');
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
    // Navigate to home screen (daily check-in)
    router.replace('/(tabs)/home');
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
    if (days.length === 5 && days.every(d => d >= 1 && d <= 5)) return 'Weekdays';
    if (days.length === 2 && days.includes(6) && days.includes(7)) return 'Weekends';

    return days.map(d => dayMap[d]).join(', ');
  };

  const formatTime = (time: string): string => {
    // Convert 24h to 12h format
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text className="mt-4 text-gray-600">Loading your habits...</Text>
      </View>
    );
  }

  if (generating) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center px-6">
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text className="mt-4 text-xl font-semibold text-gray-900">
          Designing Your Habits...
        </Text>
        <Text className="mt-2 text-gray-600 text-center">
          Our AI is creating habits that fit YOUR life, based on your Failure Profile and
          constraints. This takes 3-5 seconds.
        </Text>
        <View className="mt-6 space-y-2">
          <Text className="text-sm text-gray-500 text-center">✓ Analyzing your energy patterns</Text>
          <Text className="text-sm text-gray-500 text-center">✓ Avoiding past failure triggers</Text>
          <Text className="text-sm text-gray-500 text-center">✓ Designing tiny versions</Text>
          <Text className="text-sm text-gray-500 text-center">✓ Finding anchor routines</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center px-6">
        <Text className="text-6xl mb-4">⚠️</Text>
        <Text className="text-xl font-semibold text-gray-900 mb-2">Oops!</Text>
        <Text className="text-gray-600 text-center mb-6">{error}</Text>
        <TouchableOpacity
          className="bg-purple-600 px-6 py-3 rounded-lg"
          onPress={loadHabits}
        >
          <Text className="text-white font-semibold">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!stack || habits.length === 0) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center px-6">
        <Text className="text-xl font-semibold text-gray-900 mb-4">
          No Habits Found
        </Text>
        <TouchableOpacity
          className="bg-purple-600 px-6 py-3 rounded-lg"
          onPress={generateHabits}
        >
          <Text className="text-white font-semibold">Generate Habits</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="px-6 py-8">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-gray-900 mb-2">
            💡 Your Personalized Habits
          </Text>
          <Text className="text-gray-600">
            Designed specifically for you based on your Failure Profile
          </Text>
        </View>

        {/* Stack Rationale */}
        {stack.generation_rationale && (
          <View className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
            <Text className="text-sm font-semibold text-blue-900 mb-2">
              Why This Combination
            </Text>
            <Text className="text-gray-800">{stack.generation_rationale}</Text>
          </View>
        )}

        {/* Habit Cards */}
        {habits.map((habit, index) => (
          <View
            key={habit.id}
            className="bg-white rounded-lg p-6 mb-4 shadow-sm border-l-4 border-purple-500"
          >
            {/* Habit Number */}
            <View className="flex-row items-center mb-3">
              <View className="w-8 h-8 bg-purple-600 rounded-full items-center justify-center mr-3">
                <Text className="text-white font-bold">{index + 1}</Text>
              </View>
              <Text className="text-xl font-bold text-gray-900 flex-1">
                {habit.name}
              </Text>
            </View>

            {/* Tiny Version */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-1">
                Tiny Version (2 minutes or less)
              </Text>
              <Text className="text-gray-800">{habit.tiny_version}</Text>
            </View>

            {/* Anchor */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-1">
                🔗 Anchor
              </Text>
              <Text className="text-gray-800">{habit.anchor}</Text>
            </View>

            {/* Celebration */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-1">
                🎉 Celebration
              </Text>
              <Text className="text-gray-800">{habit.celebration}</Text>
            </View>

            {/* Rationale - Why This Works */}
            <View className="bg-purple-50 rounded-lg p-4 mb-4">
              <Text className="text-sm font-semibold text-purple-900 mb-2">
                💜 Why This Works for You
              </Text>
              <Text className="text-gray-800">{habit.rationale}</Text>
            </View>

            {/* Schedule Info */}
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-xs text-gray-500">Schedule</Text>
                <Text className="text-sm font-medium text-gray-700">
                  {getDayNames(habit.days_of_week)}
                </Text>
              </View>
              {habit.reminder_enabled && (
                <View>
                  <Text className="text-xs text-gray-500">Reminder</Text>
                  <Text className="text-sm font-medium text-gray-700">
                    {formatTime(habit.reminder_time)}
                  </Text>
                </View>
              )}
              <View>
                <Text className="text-xs text-gray-500">Addresses</Text>
                <Text className="text-sm font-medium text-purple-700">
                  {habit.addresses_pattern}
                </Text>
              </View>
            </View>
          </View>
        ))}

        {/* Key Principles */}
        <View className="bg-green-50 rounded-lg p-4 mb-6 border border-green-200">
          <Text className="text-sm font-semibold text-green-900 mb-3">
            🌟 Remember These Principles
          </Text>
          <View className="space-y-2">
            <Text className="text-gray-800">
              • <Text className="font-semibold">Start TINY:</Text> You can always do more, but the
              win is doing the minimum
            </Text>
            <Text className="text-gray-800">
              • <Text className="font-semibold">Anchor matters:</Text> The "After I..." part makes
              it automatic
            </Text>
            <Text className="text-gray-800">
              • <Text className="font-semibold">Celebrate immediately:</Text> Dopamine reinforces
              the habit
            </Text>
            <Text className="text-gray-800">
              • <Text className="font-semibold">Don't miss twice:</Text> One skip is fine; two
              starts a pattern
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View className="space-y-3">
          <TouchableOpacity
            className="bg-purple-600 py-4 rounded-lg items-center"
            onPress={handleStartTracking}
          >
            <Text className="text-white font-bold text-lg">Start Tracking</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="border border-gray-300 py-3 rounded-lg items-center"
            onPress={handleRegenerate}
          >
            <Text className="text-gray-700 font-semibold">Regenerate Habits</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="mt-6 p-4 bg-gray-100 rounded-lg">
          <Text className="text-xs text-gray-600 text-center">
            Stack created: {new Date(stack.created_at).toLocaleDateString()}
          </Text>
          <Text className="text-xs text-gray-500 text-center mt-1">
            These habits will adjust weekly based on your data
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
