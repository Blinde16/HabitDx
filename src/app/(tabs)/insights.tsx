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
import { useAuthStore } from '../../stores/authStore';
import { useIterationStore } from '../../stores/iterationStore';
import HabitService from '../../lib/habitService';
import { logError } from '../../lib/logger';
import { HabitDxLogo } from '../../components/brand';

const MIN_CHECK_INS_FOR_INSIGHTS = 5;

export default function InsightsScreen() {
  const { user } = useAuthStore();
  const {
    currentIteration,
    loading,
    adjustmentSaving,
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
      Alert.alert('Error', 'Could not generate weekly insight');
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
                'Adjustment Applied',
                'Your habit has been updated. Review it on the home screen.'
              );
            } catch (err) {
              Alert.alert('Error', 'Could not apply adjustment');
              logError(err as Error, { context: 'insights.acceptAdjustment' });
            }
          },
        },
      ]
    );
  };

  const handleDecline = async () => {
    if (!currentIteration) return;

    Alert.alert('Keep Current Habit?', "We'll keep your habit as it is.", [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Keep As Is',
        onPress: async () => {
          try {
            await declineAdjustment(currentIteration.id);
          } catch (err) {
            Alert.alert('Error', 'Could not save preference');
            logError(err as Error, { context: 'insights.declineAdjustment' });
          }
        },
      },
    ]);
  };

  const handleViewHistory = async () => {
    if (!user) return;
    await loadIterationHistory(user.id);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface px-7">
        <HabitDxLogo variant="mark" width={160} style={{ alignSelf: 'center', marginBottom: 20 }} />
        <ActivityIndicator size="large" color="#191c1e" />
        <Text className="mt-4 font-public text-on_surface_variant">Loading insights…</Text>
      </View>
    );
  }

  if (!currentIteration && !generating) {
    return (
      <View className="flex-1 bg-surface px-7 py-12">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ width: '100%', maxWidth: 960, alignSelf: 'center' }}
        >
          <HabitDxLogo variant="header" width={176} style={{ marginBottom: 20 }} />
          <View className="mb-10 self-start w-full">
            <Text className="font-manrope text-display-lg text-on_surface mb-3">
              Weekly Insights
            </Text>
            <Text className="font-public text-body-md text-on_surface_variant leading-6">
              One calm read each week: what shifted, what stayed steady, and a single optional
              adjustment.
            </Text>
          </View>

          <View className="bg-surface_container_low rounded-xl p-6 mb-8">
            <Text className="font-public text-on_surface leading-6">
              Each week, the system reviews your check-ins and obstacles and suggests one specific
              change—so you are not juggling a list of fixes.
            </Text>
          </View>

          <View className="mb-10">
            <Text className="font-manrope-md text-lg text-on_surface mb-6">How It Works</Text>

            <View className="mb-6">
              <Text className="font-public-sb text-base text-on_surface mb-1">
                Pattern Recognition
              </Text>
              <Text className="font-public text-sm text-on_surface_variant leading-5">
                Trends in completion, obstacles, and timing surface as observations, not scores.
              </Text>
            </View>

            <View className="mb-6">
              <Text className="font-public-sb text-base text-on_surface mb-1">One Adjustment</Text>
              <Text className="font-public text-sm text-on_surface_variant leading-5">
                A single high-impact recommendation—enough to matter, not enough to overwhelm.
              </Text>
            </View>

            <View className="mb-2">
              <Text className="font-public-sb text-base text-on_surface mb-1">You Decide</Text>
              <Text className="font-public text-sm text-on_surface_variant leading-5">
                Accept or decline; the app follows your judgment.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.92}
            disabled={!canGenerateInsights}
            onPress={handleGenerate}
            className="rounded-full overflow-hidden mb-4"
          >
            <LinearGradient
              colors={canGenerateInsights ? ['#000000', '#131b2e'] : ['#e0e3e5', '#d1d5d9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientButtonInner}
            >
              <Text
                className={`font-public-sb text-lg ${canGenerateInsights ? 'text-white' : 'text-on_surface_variant'}`}
              >
                Generate This Week&apos;s Insight
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text className="text-sm font-public text-on_surface_variant text-center leading-6">
            {completedCheckInCount === null
              ? 'Loading your check-in count…'
              : completedCheckInCount >= MIN_CHECK_INS_FOR_INSIGHTS
                ? 'You have enough check-ins to generate your first weekly insight.'
                : `${completedCheckInCount} of ${MIN_CHECK_INS_FOR_INSIGHTS} completed check-ins. A few more unlock weekly insights.`}
          </Text>
        </ScrollView>
      </View>
    );
  }

  if (generating) {
    return (
      <View className="flex-1 items-center justify-center bg-surface px-7">
        <HabitDxLogo variant="mark" width={140} style={{ alignSelf: 'center', marginBottom: 20 }} />
        <ActivityIndicator size="large" color="#191c1e" />
        <Text className="mt-4 text-lg font-manrope-md text-on_surface text-center">
          Reviewing Your Week
        </Text>
        <Text className="mt-2 text-sm font-public text-on_surface_variant text-center leading-6">
          Synthesizing patterns and drafting your adjustment.
        </Text>
      </View>
    );
  }

  if (!currentIteration) return null;

  return (
    <ScrollView className="flex-1 bg-surface">
      <View className="px-7 py-10 max-w-3xl self-center w-full">
        <HabitDxLogo variant="header" width={176} style={{ marginBottom: 20 }} />
        <View className="mb-8">
          <Text className="text-sm font-public text-on_surface_variant mb-1">
            {new Date(currentIteration.week_start).toLocaleDateString()} –{' '}
            {new Date(currentIteration.week_end).toLocaleDateString()}
          </Text>
          <Text className="font-manrope text-headline-lg text-on_surface">Weekly Readout</Text>
        </View>

        <View className="bg-surface_container_lowest rounded-xl p-6 mb-6">
          <Text className="font-manrope-md text-lg text-on_surface mb-4">
            Consistency This Week
          </Text>

          <View className="flex-row items-end justify-between mb-4">
            <Text className="text-4xl font-manrope text-tertiary_fixed_dim">
              {Math.round(currentIteration.completion_stats.completion_rate * 100)}%
            </Text>
            <Text className="text-sm font-public text-on_surface_variant pb-1">
              {currentIteration.completion_stats.total_completed} /{' '}
              {currentIteration.completion_stats.total_scheduled} scheduled
            </Text>
          </View>

          <View>
            {currentIteration.completion_stats.habits.map((habit) => (
              <View key={habit.habit_id} className="flex-row justify-between py-2">
                <Text className="text-sm font-public text-on_surface flex-1 pr-3">
                  {habit.habit_name}
                </Text>
                <Text className="text-sm font-public text-on_surface_variant">
                  {habit.completed}/{habit.scheduled} ({Math.round(habit.rate * 100)}%)
                </Text>
              </View>
            ))}
          </View>
        </View>

        {currentIteration.patterns_detected && currentIteration.patterns_detected.length > 0 && (
          <View className="bg-surface_container_low rounded-xl p-6 mb-6">
            <Text className="font-manrope-md text-lg text-on_surface mb-3">Patterns Noticed</Text>
            {currentIteration.patterns_detected.map((pattern, index) => (
              <View key={index} className="mb-4">
                <Text className="text-xs font-public-sb text-on_surface_variant uppercase tracking-wide mb-1">
                  {pattern.type.replace('_', ' ')}
                </Text>
                <Text className="text-sm font-public text-on_surface leading-5">
                  {pattern.description}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View className="bg-surface_container_low rounded-xl p-6 mb-6">
          <Text className="font-public text-on_surface leading-6">{currentIteration.insights}</Text>
        </View>

        {currentIteration.adjustment_recommendation && currentIteration.status === 'pending' && (
          <View className="bg-growth_muted rounded-xl p-6 mb-6">
            <Text className="font-manrope-md text-lg text-on_surface mb-2">
              Suggested Adjustment
            </Text>

            <Text className="text-base font-public-sb text-on_surface mb-3">
              {currentIteration.adjustment_recommendation.habit_name}
            </Text>

            <View className="bg-surface_container_lowest rounded-lg p-4 mb-3">
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm font-public text-on_surface_variant">Current</Text>
                <Text className="text-sm font-public text-on_surface text-right flex-1 ml-4">
                  {currentIteration.adjustment_recommendation.current_value}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm font-public text-on_surface_variant">Suggested</Text>
                <Text className="text-sm font-public text-tertiary_fixed_dim text-right flex-1 ml-4">
                  {currentIteration.adjustment_recommendation.suggested_value}
                </Text>
              </View>
            </View>

            <Text className="text-sm font-public text-on_surface_variant mb-6 leading-6">
              {currentIteration.adjustment_recommendation.rationale}
            </Text>

            <View>
              <TouchableOpacity
                activeOpacity={0.92}
                onPress={handleAccept}
                disabled={adjustmentSaving}
                className="rounded-full overflow-hidden mb-3"
              >
                <LinearGradient
                  colors={['#000000', '#131b2e']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientButtonInnerSm}
                >
                  <Text className="text-white font-public-sb text-base">Apply Adjustment</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                className="py-3 items-center"
                onPress={handleDecline}
                disabled={adjustmentSaving}
              >
                <Text className="text-on_surface font-public-sb text-base">Keep Current Habit</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {currentIteration.status !== 'pending' && (
          <View
            className={`rounded-xl p-4 mb-6 ${
              currentIteration.status === 'accepted'
                ? 'bg-growth_muted'
                : 'bg-surface_container_low'
            }`}
          >
            <Text
              className={`text-center font-public-sb ${
                currentIteration.status === 'accepted'
                  ? 'text-on_surface'
                  : 'text-on_surface_variant'
              }`}
            >
              {currentIteration.status === 'accepted'
                ? 'Adjustment applied'
                : 'Keeping your previous habit'}
            </Text>
          </View>
        )}

        <TouchableOpacity className="py-3 items-center" onPress={handleViewHistory}>
          <Text className="text-primary_container font-public-sb">Past Insights</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  gradientButtonInner: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  gradientButtonInnerSm: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
});
