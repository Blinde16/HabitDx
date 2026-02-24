import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { useCheckinStore } from '../../stores/checkinStore';
import type { HabitWithStatus } from '../../stores/checkinStore';
import { ObstacleBottomSheet, SuccessAnimation } from '../../components/checkin';
import NotificationService from '../../lib/notificationService';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    todaysHabits,
    loading,
    initialize,
    fetchTodaysHabits,
    checkInHabit,
    undoCheckIn,
    setSelectedHabitForObstacle,
    getCompletionRate,
  } = useCheckinStore();

  const [refreshing, setRefreshing] = useState(false);
  const [showObstacleSheet, setShowObstacleSheet] = useState(false);
  const [successAnimation, setSuccessAnimation] = useState<{
    visible: boolean;
    habitName: string;
    celebration: string;
  }>({
    visible: false,
    habitName: '',
    celebration: '',
  });

  useEffect(() => {
    if (user) {
      initialize(user.id);
      // Schedule notifications for all habits
      NotificationService.scheduleAllHabitReminders(user.id);
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRefresh = async () => {
    if (!user) return;
    setRefreshing(true);
    await fetchTodaysHabits(user.id);
    setRefreshing(false);
  };

  const handleHabitTap = async (habit: HabitWithStatus) => {
    if (!user) return;

    if (habit.status === 'completed') {
      // Undo check-in
      Alert.alert('Undo Check-in?', `Mark "${habit.name}" as not done?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Undo',
          onPress: async () => {
            try {
              await undoCheckIn(habit.id, user.id);
            } catch (err) {
              Alert.alert('Error', 'Failed to undo check-in');
            }
          },
        },
      ]);
    } else {
      // Complete habit
      try {
        await checkInHabit(habit.id, user.id);

        // Show success animation
        setSuccessAnimation({
          visible: true,
          habitName: habit.name,
          celebration: habit.celebration,
        });

        // Hide animation after 3 seconds
        setTimeout(() => {
          setSuccessAnimation({
            visible: false,
            habitName: '',
            celebration: '',
          });
        }, 3000);
      } catch (err) {
        Alert.alert('Error', 'Failed to check in habit');
      }
    }
  };

  const handleLongPress = (habit: HabitWithStatus) => {
    if (habit.status === 'not_scheduled') return;

    // Open obstacle bottom sheet
    setSelectedHabitForObstacle(habit.id);
    setShowObstacleSheet(true);
  };

  const getStatusIcon = (status: HabitWithStatus['status']): string => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'missed':
        return '❌';
      case 'not_scheduled':
        return '⬜';
      default:
        return '⭕';
    }
  };

  const getStatusColor = (status: HabitWithStatus['status']): string => {
    switch (status) {
      case 'completed':
        return 'border-green-500 bg-green-50';
      case 'missed':
        return 'border-red-500 bg-red-50';
      case 'not_scheduled':
        return 'border-gray-300 bg-gray-50';
      default:
        return 'border-purple-500 bg-white';
    }
  };

  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getTodayDateString = (): string => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    };
    return new Date().toLocaleDateString('en-US', options);
  };

  if (loading && todaysHabits.length === 0) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text className="mt-4 text-gray-600">Loading your habits...</Text>
      </View>
    );
  }

  const scheduledHabits = todaysHabits.filter((h) => h.status !== 'not_scheduled');
  const completedCount = scheduledHabits.filter((h) => h.status === 'completed').length;
  const totalCount = scheduledHabits.length;
  const completionRate = getCompletionRate();

  return (
    <>
      {/* Success Animation Overlay */}
      <SuccessAnimation
        visible={successAnimation.visible}
        habitName={successAnimation.habitName}
        celebration={successAnimation.celebration}
      />

      <ScrollView
        className="flex-1 bg-gray-50"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#8B5CF6" />
        }
      >
        <View className="px-6 py-8">
          {/* Header */}
          <View className="mb-6">
            <Text className="text-sm text-gray-500 mb-1">{getTodayDateString()}</Text>
            <Text className="text-3xl font-bold text-gray-900 mb-2">Today&apos;s Habits</Text>
            {totalCount > 0 && (
              <Text className="text-lg text-gray-600">
                {completedCount} of {totalCount} complete
                {completionRate > 0 && (
                  <Text className="text-purple-600 font-semibold"> ({completionRate}%)</Text>
                )}
              </Text>
            )}
          </View>

          {/* Motivational Message */}
          {completedCount === 0 && totalCount > 0 && (
            <View className="bg-purple-50 rounded-lg p-4 mb-6 border border-purple-200">
              <Text className="text-purple-900 font-semibold">Start your day right! ☀️</Text>
              <Text className="text-purple-800 mt-1">
                Just tap a habit to check it off. Remember: tiny actions lead to big changes.
              </Text>
            </View>
          )}

          {completedCount === totalCount && totalCount > 0 && (
            <View className="bg-green-50 rounded-lg p-4 mb-6 border border-green-200">
              <Text className="text-green-900 font-bold text-lg">🎉 All Done for Today!</Text>
              <Text className="text-green-800 mt-1">
                You crushed it! Don&apos;t forget your celebrations. See you tomorrow!
              </Text>
            </View>
          )}

          {/* Habit Cards */}
          {todaysHabits.length === 0 ? (
            <View className="bg-white rounded-lg p-6 items-center">
              <Text className="text-6xl mb-4">🌟</Text>
              <Text className="text-xl font-semibold text-gray-900 mb-2">No Habits Yet</Text>
              <Text className="text-gray-600 text-center mb-4">
                Complete onboarding to get your personalized habit stack
              </Text>
              <TouchableOpacity
                className="bg-purple-600 px-6 py-3 rounded-lg"
                onPress={() => router.push('/(onboarding)/welcome')}
              >
                <Text className="text-white font-semibold">Start Onboarding</Text>
              </TouchableOpacity>
            </View>
          ) : (
            todaysHabits.map((habit) => (
              <TouchableOpacity
                key={habit.id}
                className={`rounded-lg p-5 mb-4 border-l-4 ${getStatusColor(habit.status)}`}
                onPress={() => handleHabitTap(habit)}
                onLongPress={() => handleLongPress(habit)}
                activeOpacity={0.7}
              >
                {/* Habit Header */}
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center flex-1">
                    <Text className="text-3xl mr-3">{getStatusIcon(habit.status)}</Text>
                    <View className="flex-1">
                      <Text
                        className={`text-lg font-bold ${
                          habit.status === 'completed'
                            ? 'text-gray-500 line-through'
                            : 'text-gray-900'
                        }`}
                      >
                        {habit.name}
                      </Text>
                      {habit.status === 'completed' && habit.checked_in_at && (
                        <Text className="text-xs text-gray-500 mt-1">
                          Completed at{' '}
                          {new Date(habit.checked_in_at).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </Text>
                      )}
                    </View>
                  </View>
                  {habit.streak > 0 && (
                    <View className="ml-2">
                      <Text className="text-xs text-gray-500">Streak</Text>
                      <Text className="text-lg font-bold text-orange-600">🔥 {habit.streak}</Text>
                    </View>
                  )}
                </View>

                {/* Tiny Version */}
                {habit.status !== 'completed' && (
                  <Text className="text-sm text-gray-700 mb-2">{habit.tiny_version}</Text>
                )}

                {/* Anchor */}
                {habit.status !== 'completed' && (
                  <Text className="text-xs text-gray-600 mb-2">⚓ {habit.anchor}</Text>
                )}

                {/* Celebration */}
                {habit.status === 'completed' && (
                  <View className="bg-yellow-50 rounded p-3 mt-2">
                    <Text className="text-sm text-gray-800">
                      <Text className="font-semibold">🎉 Don&apos;t forget:</Text>{' '}
                      {habit.celebration}
                    </Text>
                  </View>
                )}

                {/* Obstacle indicator */}
                {habit.last_obstacle && (
                  <View className="mt-2">
                    <Text className="text-xs text-red-600">
                      Yesterday&apos;s obstacle: {habit.last_obstacle.replace('_', ' ')}
                    </Text>
                  </View>
                )}

                {/* Don't Miss Twice Warning */}
                {habit.status !== 'completed' && habit.streak === 0 && habit.last_obstacle && (
                  <View className="mt-2 bg-orange-50 border-l-4 border-orange-500 rounded p-3">
                    <Text className="text-sm font-bold text-orange-900 mb-1">
                      ⚠️ Don&apos;t Miss Twice!
                    </Text>
                    <Text className="text-xs text-orange-800">
                      You missed yesterday. One skip is fine—but two in a row starts a pattern.
                      Let&apos;s get back on track today!
                    </Text>
                  </View>
                )}

                {/* Reminder time */}
                {habit.status === 'not_done' && habit.reminder_enabled && (
                  <Text className="text-xs text-gray-500 mt-2">
                    ⏰ Reminder: {formatTime(habit.reminder_time)}
                  </Text>
                )}

                {/* Help text */}
                {habit.status === 'not_done' && (
                  <Text className="text-xs text-gray-400 mt-3">
                    Tap to complete • Long press if you can&apos;t do it today
                  </Text>
                )}
              </TouchableOpacity>
            ))
          )}

          {/* Footer Tips */}
          {totalCount > 0 && (
            <View className="bg-blue-50 rounded-lg p-4 mt-4">
              <Text className="text-sm font-semibold text-blue-900 mb-2">💡 Daily Tip</Text>
              <Text className="text-sm text-gray-800">
                Don&apos;t miss twice! One skip is fine—life happens. It&apos;s two in a row that
                starts a pattern. Focus on consistency over perfection.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Obstacle Bottom Sheet */}
      <ObstacleBottomSheet
        visible={showObstacleSheet}
        onClose={() => {
          setShowObstacleSheet(false);
          setSelectedHabitForObstacle(null);
        }}
      />
    </>
  );
}
