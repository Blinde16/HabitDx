import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { useCheckinStore } from '../../stores/checkinStore';
import { getAppDate, useDevDateStore } from '../../lib/devDate';
import type { HabitWithStatus } from '../../stores/checkinStore';
import { HabitDxLogo } from '../../components/brand';
import { ObstacleBottomSheet, SuccessAnimation } from '../../components/checkin';
import NotificationService from '../../lib/notificationService';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    todaysHabits,
    totalCompletedCheckIns,
    loading,
    initialize,
    fetchTodaysHabits,
    checkInHabit,
    undoCheckIn,
    setSelectedHabitForObstacle,
    getCompletionRate,
  } = useCheckinStore();

  const devDateOverride = useDevDateStore((s) => s.dateOverride);
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
      if (Platform.OS !== 'web') {
        NotificationService.scheduleAllHabitReminders(user.id);
      }
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (user && devDateOverride !== undefined) {
      fetchTodaysHabits(user.id);
    }
  }, [devDateOverride]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRefresh = async () => {
    if (!user) return;
    setRefreshing(true);
    await fetchTodaysHabits(user.id);
    setRefreshing(false);
  };

  const handleHabitTap = async (habit: HabitWithStatus) => {
    if (!user) return;

    if (habit.status === 'completed') {
      Alert.alert('Undo Check-in?', `Mark "${habit.name}" as not done?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Undo',
          onPress: async () => {
            try {
              await undoCheckIn(habit.id, user.id);
            } catch {
              Alert.alert('Error', 'Could not update check-in');
            }
          },
        },
      ]);
    } else {
      try {
        await checkInHabit(habit.id, user.id);

        setSuccessAnimation({
          visible: true,
          habitName: habit.name,
          celebration: habit.celebration,
        });

        setTimeout(() => {
          setSuccessAnimation({
            visible: false,
            habitName: '',
            celebration: '',
          });
        }, 3000);
      } catch {
        Alert.alert('Error', 'Could not record check-in');
      }
    }
  };

  const handleLongPress = (habit: HabitWithStatus) => {
    if (habit.status === 'not_scheduled') return;
    setSelectedHabitForObstacle(habit.id);
    setShowObstacleSheet(true);
  };

  const statusLabel = (status: HabitWithStatus['status']): string => {
    switch (status) {
      case 'completed':
        return 'Recorded';
      case 'missed':
        return 'Missed day';
      case 'not_scheduled':
        return 'Not scheduled';
      default:
        return 'Open';
    }
  };

  const habitCardTone = (status: HabitWithStatus['status']): string => {
    switch (status) {
      case 'completed':
        return 'bg-growth_muted';
      case 'missed':
        return 'bg-surface_container_highest';
      case 'not_scheduled':
        return 'bg-surface_container_low';
      default:
        return 'bg-surface_container_lowest';
    }
  };

  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
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
    return getAppDate().toLocaleDateString('en-US', options);
  };

  if (loading && todaysHabits.length === 0) {
    return (
      <View className="flex-1 bg-surface items-center justify-center px-7">
        <HabitDxLogo variant="mark" width={160} style={{ alignSelf: 'center', marginBottom: 20 }} />
        <ActivityIndicator size="large" color="#191c1e" />
        <Text className="mt-4 font-public text-on_surface_variant">Loading your habits…</Text>
      </View>
    );
  }

  const scheduledHabits = todaysHabits.filter((h) => h.status !== 'not_scheduled');
  const completedCount = scheduledHabits.filter((h) => h.status === 'completed').length;
  const totalCount = scheduledHabits.length;
  const completionRate = getCompletionRate();

  return (
    <>
      <SuccessAnimation
        visible={successAnimation.visible}
        habitName={successAnimation.habitName}
        celebration={successAnimation.celebration}
      />

      <ScrollView
        className="flex-1 bg-surface"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#191c1e" />
        }
      >
        <View className="px-7 py-10 max-w-3xl self-center w-full">
          <HabitDxLogo variant="header" width={176} style={{ marginBottom: 20 }} />
          <View className="mb-8 self-start w-full">
            <Text className="text-sm font-public text-on_surface_variant mb-2 tracking-wide">
              {getTodayDateString()}
            </Text>
            <Text className="font-manrope text-display-lg text-on_surface mb-3">Today</Text>
            {totalCount > 0 && (
              <Text className="text-body-md font-public text-on_surface leading-6">
                {completedCount} of {totalCount} scheduled complete
                {completionRate > 0 && (
                  <Text className="text-tertiary_fixed_dim font-public-sb">
                    {' '}
                    · {completionRate}% consistency
                  </Text>
                )}
                {totalCompletedCheckIns > 0 && (
                  <Text className="text-on_surface_variant font-public">
                    {' '}
                    · {totalCompletedCheckIns} total check-ins
                  </Text>
                )}
              </Text>
            )}
          </View>

          {completedCount === 0 && totalCount > 0 && (
            <View className="bg-surface_container_low rounded-xl p-5 mb-8">
              <Text className="font-manrope-md text-on_surface text-headline-lg mb-1">
                Begin gently
              </Text>
              <Text className="font-public text-on_surface_variant leading-6">
                Tap a habit when you complete it. Small actions, observed without judgment.
              </Text>
            </View>
          )}

          {completedCount === totalCount && totalCount > 0 && (
            <View className="bg-surface_container_low rounded-xl p-5 mb-8">
              <Text className="font-manrope-md text-on_surface text-headline-lg mb-1">
                Stable for today
              </Text>
              <Text className="font-public text-on_surface_variant leading-6">
                Everything scheduled is recorded. Rest counts too.
              </Text>
            </View>
          )}

          {todaysHabits.length === 0 ? (
            <View className="bg-surface_container_lowest rounded-xl p-8 items-start w-full">
              <Text className="font-manrope text-headline-lg text-on_surface mb-2">
                No Habits Yet
              </Text>
              <Text className="font-public text-on_surface_variant text-center mb-6 leading-6 self-stretch">
                Finish onboarding to receive your personalized habit stack.
              </Text>
              <TouchableOpacity
                activeOpacity={0.92}
                className="rounded-full self-stretch overflow-hidden"
                onPress={() => router.push('/(onboarding)/chat' as never)}
              >
                <LinearGradient
                  colors={['#000000', '#131b2e']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ paddingVertical: 16, alignItems: 'center' }}
                >
                  <Text className="text-white font-public-sb text-base">Start Onboarding</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            todaysHabits.map((habit) => (
              <TouchableOpacity
                key={habit.id}
                className={`rounded-xl p-5 mb-5 ${habitCardTone(habit.status)}`}
                onPress={() => handleHabitTap(habit)}
                onLongPress={() => handleLongPress(habit)}
                activeOpacity={0.75}
              >
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1 pr-3">
                    <Text
                      className={`font-manrope-md text-lg ${
                        habit.status === 'completed'
                          ? 'text-on_surface_variant line-through'
                          : 'text-on_surface'
                      }`}
                    >
                      {habit.name}
                    </Text>
                    <Text className="text-xs font-public text-on_surface_variant mt-1">
                      {statusLabel(habit.status)}
                    </Text>
                    {habit.status === 'completed' && habit.checked_in_at && (
                      <Text className="text-xs font-public text-on_surface_variant mt-2">
                        Recorded{' '}
                        {new Date(habit.checked_in_at).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </Text>
                    )}
                  </View>
                </View>

                {habit.status !== 'completed' && (
                  <Text className="text-sm font-public text-on_surface leading-6 mb-2">
                    {habit.tiny_version}
                  </Text>
                )}

                {habit.status !== 'completed' && (
                  <Text className="text-xs font-public text-on_surface_variant mb-2 leading-5">
                    Anchor: {habit.anchor}
                  </Text>
                )}

                {habit.status === 'completed' && (
                  <View className="bg-surface_container_low rounded-lg p-3 mt-2">
                    <Text className="text-sm font-public text-on_surface leading-5">
                      <Text className="font-public-sb">Reminder: </Text>
                      {habit.celebration}
                    </Text>
                  </View>
                )}

                {habit.last_obstacle && (
                  <View className="mt-2">
                    <Text className="text-xs font-public text-on_primary_container leading-5">
                      Yesterday&apos;s obstacle: {habit.last_obstacle.replace('_', ' ')}
                    </Text>
                  </View>
                )}

                {habit.status !== 'completed' && habit.last_obstacle && (
                  <View className="mt-3 bg-surface_container_low rounded-lg p-4">
                    <Text className="text-sm font-manrope-md text-on_surface mb-1">Re-entry</Text>
                    <Text className="text-xs font-public text-on_surface_variant leading-5">
                      Yesterday was a miss — that is data, not a verdict. The tiny version still
                      counts today.
                    </Text>
                  </View>
                )}

                {habit.status === 'not_done' && habit.reminder_enabled && (
                  <Text className="text-xs font-public text-on_surface_variant mt-2">
                    Reminder: {formatTime(habit.reminder_time)}
                  </Text>
                )}

                {habit.status === 'not_done' && (
                  <Text className="text-sm font-public text-on_surface_variant mt-4 leading-5">
                    Tap to record · Long-press to log an obstacle (helps weekly adjustments)
                  </Text>
                )}
              </TouchableOpacity>
            ))
          )}

          {totalCount > 0 && (
            <View className="bg-surface_container_low rounded-xl p-5 mt-2">
              <Text className="text-sm font-manrope-md text-on_surface mb-2">Observation</Text>
              <Text className="text-sm font-public text-on_surface_variant leading-6">
                One quiet day does not define your pattern. Consistency trends matter more than any
                single miss.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

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
