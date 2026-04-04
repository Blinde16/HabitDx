import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { useIterationStore } from '../../stores/iterationStore';
import HabitService from '../../lib/habitService';
import { logError } from '../../lib/logger';

const MIN_CHECK_INS_FOR_INSIGHTS = 5;

export default function InsightsScreen() {
  const { user } = useAuthStore();
  const {
    currentIteration,
    loading,
    generateWeeklyIteration,
    loadLatestIteration,
    loadIterationHistory,
    acceptAdjustment,
    declineAdjustment,
  } = useIterationStore();

  const [generating, setGenerating] = useState(false);
  const [completedCheckInCount, setCompletedCheckInCount] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      loadLatestIteration(user.id);
      void HabitService.getTotalCompletedCheckIns(user.id).then(setCompletedCheckInCount);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- loadLatestIteration is a stable store action
  }, [user]);

  const canGenerateInsights =
    completedCheckInCount !== null && completedCheckInCount >= MIN_CHECK_INS_FOR_INSIGHTS;

  const handleGenerate = async () => {
    if (!user || !canGenerateInsights) return;

    try {
      setGenerating(true);
      await generateWeeklyIteration(user.id);
      const n = await HabitService.getTotalCompletedCheckIns(user.id);
      setCompletedCheckInCount(n);
    } catch (err) {
      Alert.alert('Error', 'Failed to generate weekly insight');
      logError(err as Error, { context: 'insights.generate' });
    } finally {
      setGenerating(false);
    }
  };

  const handleAccept = async () => {
    if (!currentIteration || !user) return;

    Alert.alert(
      'Apply This Adjustment?',
      `This will update your habit: ${currentIteration.adjustment_recommendation?.habit_name}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Apply',
          onPress: async () => {
            try {
              await acceptAdjustment(currentIteration.id, user.id);
              Alert.alert(
                'Adjustment Applied! 🎉',
                'Your habit has been updated. Check it out on the home screen.'
              );
            } catch (err) {
              Alert.alert('Error', 'Failed to apply adjustment');
              logError(err as Error, { context: 'insights.acceptAdjustment' });
            }
          },
        },
      ]
    );
  };

  const handleDecline = async () => {
    if (!currentIteration) return;

    Alert.alert(
      'Keep Current Habit?',
      "No problem! We'll keep your habit as is.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Keep As Is',
          onPress: async () => {
            try {
              await declineAdjustment(currentIteration.id);
            } catch (err) {
              Alert.alert('Error', 'Failed to decline adjustment');
              logError(err as Error, { context: 'insights.declineAdjustment' });
            }
          },
        },
      ]
    );
  };

  const handleViewHistory = async () => {
    if (!user) return;
    await loadIterationHistory(user.id);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#9333EA" />
        <Text className="mt-4 text-gray-600">Loading insights...</Text>
      </View>
    );
  }

  if (!currentIteration && !generating) {
    return (
      <View className="flex-1 bg-white px-6 py-12">
        <ScrollView>
          {/* Header */}
          <View className="items-center mb-8">
            <View className="w-24 h-24 bg-purple-100 rounded-full items-center justify-center mb-4">
              <Text className="text-5xl">📊</Text>
            </View>
            <Text className="text-2xl font-bold text-gray-900 text-center">
              Weekly Insights
            </Text>
          </View>

          {/* Explainer */}
          <View className="bg-gray-50 rounded-lg p-6 mb-6">
            <Text className="text-base text-gray-800 leading-relaxed">
              Every week, AI analyzes your habit data and suggests ONE specific
              adjustment to improve your success rate.
            </Text>
          </View>

          {/* How It Works */}
          <View className="mb-8">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              How It Works
            </Text>
            
            <View className="space-y-4">
              <View className="flex-row">
                <Text className="text-2xl mr-3">📈</Text>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900 mb-1">
                    Pattern Detection
                  </Text>
                  <Text className="text-sm text-gray-600">
                    AI spots trends in your completion rates, obstacles, and timing
                  </Text>
                </View>
              </View>

              <View className="flex-row">
                <Text className="text-2xl mr-3">🎯</Text>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900 mb-1">
                    ONE Adjustment
                  </Text>
                  <Text className="text-sm text-gray-600">
                    Get a single, high-impact recommendation (not overwhelming advice)
                  </Text>
                </View>
              </View>

              <View className="flex-row">
                <Text className="text-2xl mr-3">✅</Text>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900 mb-1">
                    You Decide
                  </Text>
                  <Text className="text-sm text-gray-600">
                    Accept or decline the adjustment—you&apos;re in control
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Generate Button */}
          <TouchableOpacity
            className={`py-4 rounded-lg items-center ${canGenerateInsights ? 'bg-purple-600' : 'bg-gray-300'}`}
            onPress={handleGenerate}
            disabled={!canGenerateInsights}
          >
            <Text className="text-white font-bold text-lg">
              Generate This Week&apos;s Insight
            </Text>
          </TouchableOpacity>

          {/* Progress toward unlock */}
          <Text className="text-sm text-gray-600 text-center mt-4 leading-5">
            {completedCheckInCount === null
              ? 'Loading your check-in count…'
              : completedCheckInCount >= MIN_CHECK_INS_FOR_INSIGHTS
                ? "You're ready — generate your first weekly insight below."
                : `You have ${completedCheckInCount} of ${MIN_CHECK_INS_FOR_INSIGHTS} completed check-ins. ${MIN_CHECK_INS_FOR_INSIGHTS - completedCheckInCount} more unlock weekly insights.`}
          </Text>
        </ScrollView>
      </View>
    );
  }

  if (generating) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <ActivityIndicator size="large" color="#9333EA" />
        <Text className="mt-4 text-lg font-semibold text-gray-900">
          Analyzing Your Week...
        </Text>
        <Text className="mt-2 text-sm text-gray-600 text-center">
          Reviewing your habits, detecting patterns, and crafting your
          personalized adjustment
        </Text>
      </View>
    );
  }

  if (!currentIteration) return null;

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-6 py-8">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-sm text-gray-500 mb-1">
            {new Date(currentIteration.week_start).toLocaleDateString()} -{' '}
            {new Date(currentIteration.week_end).toLocaleDateString()}
          </Text>
          <Text className="text-2xl font-bold text-gray-900">
            Your Weekly Insight
          </Text>
        </View>

        {/* Completion Stats */}
        <View className="bg-purple-50 rounded-lg p-6 mb-6 border border-purple-200">
          <Text className="text-lg font-semibold text-purple-900 mb-4">
            📊 This Week&apos;s Performance
          </Text>
          
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-4xl font-bold text-purple-700">
              {Math.round(currentIteration.completion_stats.completion_rate * 100)}%
            </Text>
            <Text className="text-sm text-gray-700">
              {currentIteration.completion_stats.total_completed} /{' '}
              {currentIteration.completion_stats.total_scheduled} completed
            </Text>
          </View>

          {/* Per-Habit Breakdown */}
          <View className="space-y-2">
            {currentIteration.completion_stats.habits.map((habit) => (
              <View key={habit.habit_id} className="flex-row justify-between">
                <Text className="text-sm text-gray-800 flex-1">{habit.habit_name}</Text>
                <Text className="text-sm font-medium text-gray-700">
                  {habit.completed}/{habit.scheduled} ({Math.round(habit.rate * 100)}%)
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Patterns Detected */}
        {currentIteration.patterns_detected && currentIteration.patterns_detected.length > 0 && (
          <View className="bg-blue-50 rounded-lg p-6 mb-6">
            <Text className="text-lg font-semibold text-blue-900 mb-3">
              🔍 Patterns We Noticed
            </Text>
            {currentIteration.patterns_detected.map((pattern, index) => (
              <View key={index} className="mb-3">
                <Text className="text-sm font-medium text-blue-800 mb-1">
                  {pattern.type.replace('_', ' ').toUpperCase()}
                </Text>
                <Text className="text-sm text-gray-700">{pattern.description}</Text>
              </View>
            ))}
          </View>
        )}

        {/* AI Insights */}
        <View className="bg-gray-50 rounded-lg p-6 mb-6">
          <Text className="text-base text-gray-800 leading-relaxed">
            {currentIteration.insights}
          </Text>
        </View>

        {/* Adjustment Recommendation */}
        {currentIteration.adjustment_recommendation && currentIteration.status === 'pending' && (
          <View className="bg-green-50 rounded-lg p-6 mb-6 border-2 border-green-300">
            <Text className="text-lg font-bold text-green-900 mb-2">
              💡 Recommended Adjustment
            </Text>
            
            <Text className="text-base font-semibold text-gray-900 mb-2">
              {currentIteration.adjustment_recommendation.habit_name}
            </Text>

            <View className="bg-white rounded-lg p-4 mb-3">
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm text-gray-600">Current:</Text>
                <Text className="text-sm font-medium text-gray-900">
                  {currentIteration.adjustment_recommendation.current_value}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-600">Suggested:</Text>
                <Text className="text-sm font-medium text-green-700">
                  {currentIteration.adjustment_recommendation.suggested_value}
                </Text>
              </View>
            </View>

            <Text className="text-sm text-gray-700 mb-4 leading-relaxed">
              {currentIteration.adjustment_recommendation.rationale}
            </Text>

            {/* Action Buttons */}
            <View className="space-y-3">
              <TouchableOpacity
                className="bg-green-600 py-3 rounded-lg items-center"
                onPress={handleAccept}
              >
                <Text className="text-white font-bold text-base">
                  Apply This Adjustment
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="border border-gray-300 py-3 rounded-lg items-center"
                onPress={handleDecline}
              >
                <Text className="text-gray-700 font-semibold text-base">
                  Keep Current Habit
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Status Message */}
        {currentIteration.status !== 'pending' && (
          <View className={`rounded-lg p-4 mb-6 ${
            currentIteration.status === 'accepted' ? 'bg-green-100' : 'bg-gray-100'
          }`}>
            <Text className={`text-center font-semibold ${
              currentIteration.status === 'accepted' ? 'text-green-900' : 'text-gray-700'
            }`}>
              {currentIteration.status === 'accepted'
                ? '✅ Adjustment Applied'
                : '↩️ Kept Current Habit'}
            </Text>
          </View>
        )}

        {/* View History */}
        <TouchableOpacity
          className="py-3 items-center"
          onPress={handleViewHistory}
        >
          <Text className="text-purple-600 font-semibold">
            View Past Insights
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
