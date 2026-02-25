import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { useNotificationStore } from '../../stores/notificationStore';
import NotificationService from '../../lib/notificationService';
import { logError } from '../../lib/logger';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, signOut } = useAuthStore();
  const { notificationsEnabled, updateNotificationSettings } = useNotificationStore();

  const [notifEnabled, setNotifEnabled] = useState(notificationsEnabled);

  const handleNotificationToggle = async (value: boolean) => {
    try {
      setNotifEnabled(value);
      await updateNotificationSettings(value);

      if (value && user) {
        // Reschedule all notifications
        await NotificationService.scheduleAllHabitReminders(user.id);
      }
    } catch (error) {
      logError(error as Error, { context: 'settings.toggleNotifications' });
      Alert.alert('Error', 'Failed to update notification settings');
      setNotifEnabled(!value); // Revert on error
    }
  };

  const handleTestNotification = async () => {
    try {
      await NotificationService.sendTestNotification();
      Alert.alert('Test Sent', 'Check your notifications!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out?', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account?',
      'This will permanently delete all your data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Feature Coming Soon',
              'Account deletion will be available in a future update. For now, please contact support.'
            );
          },
        },
      ]
    );
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-6 py-8">
        {/* Header */}
        <Text className="text-2xl font-bold text-gray-900 mb-6">Settings</Text>

        {/* Profile Section */}
        <View className="bg-gray-50 rounded-lg p-4 mb-6">
          <Text className="text-sm text-gray-500 mb-1">Signed in as</Text>
          <Text className="text-base font-semibold text-gray-900">{user?.email || 'Unknown'}</Text>
        </View>

        {/* Habits Section */}
        <View className="mb-8">
          <Text className="text-lg font-semibold text-gray-900 mb-4">My Habits</Text>

          <View className="bg-white border border-gray-200 rounded-lg">
            <TouchableOpacity
              className="flex-row items-center justify-between p-4 border-b border-gray-200"
              onPress={() => router.push('/(onboarding)/failure-profile')}
            >
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900">View Failure Profile</Text>
                <Text className="text-sm text-gray-600 mt-1">
                  See your AI-generated habit analysis
                </Text>
              </View>
              <Text className="text-2xl text-gray-400">→</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center justify-between p-4"
              onPress={() => router.push('/(onboarding)/habits')}
            >
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900">Manage Habits</Text>
                <Text className="text-sm text-gray-600 mt-1">
                  View or regenerate your habit stack
                </Text>
              </View>
              <Text className="text-2xl text-gray-400">→</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notifications Section */}
        <View className="mb-8">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Notifications</Text>

          <View className="bg-white border border-gray-200 rounded-lg">
            {/* Enable Notifications */}
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900">Enable Notifications</Text>
                <Text className="text-sm text-gray-600 mt-1">Get reminders for your habits</Text>
              </View>
              <Switch
                value={notifEnabled}
                onValueChange={handleNotificationToggle}
                trackColor={{ false: '#D1D5DB', true: '#4A90E2' }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Test Notification */}
            <TouchableOpacity
              className="flex-row items-center justify-between p-4"
              onPress={handleTestNotification}
            >
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900">Test Notification</Text>
                <Text className="text-sm text-gray-600 mt-1">Send a test notification now</Text>
              </View>
              <Text className="text-2xl">→</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* About Section */}
        <View className="mb-8">
          <Text className="text-lg font-semibold text-gray-900 mb-4">About</Text>

          <View className="bg-white border border-gray-200 rounded-lg">
            {/* Version */}
            <View className="p-4 border-b border-gray-200">
              <Text className="text-sm text-gray-500">Version</Text>
              <Text className="text-base text-gray-900 mt-1">1.0.0</Text>
            </View>

            {/* Privacy Policy */}
            <TouchableOpacity
              className="flex-row items-center justify-between p-4 border-b border-gray-200"
              onPress={() => {
                Alert.alert('Coming Soon', 'Privacy policy will be available soon');
              }}
            >
              <Text className="text-base text-gray-900">Privacy Policy</Text>
              <Text className="text-2xl text-gray-400">→</Text>
            </TouchableOpacity>

            {/* Terms of Service */}
            <TouchableOpacity
              className="flex-row items-center justify-between p-4"
              onPress={() => {
                Alert.alert('Coming Soon', 'Terms of service will be available soon');
              }}
            >
              <Text className="text-base text-gray-900">Terms of Service</Text>
              <Text className="text-2xl text-gray-400">→</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Danger Zone */}
        <View className="mb-8">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Account</Text>

          <View className="bg-white border border-gray-200 rounded-lg">
            {/* Sign Out */}
            <TouchableOpacity className="p-4 border-b border-gray-200" onPress={handleSignOut}>
              <Text className="text-base font-medium text-blue-600">Sign Out</Text>
            </TouchableOpacity>

            {/* Delete Account */}
            <TouchableOpacity className="p-4" onPress={handleDeleteAccount}>
              <Text className="text-base font-medium text-red-600">Delete Account</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View className="items-center py-4">
          <Text className="text-xs text-gray-500">Made with ❤️ for habit builders</Text>
          <Text className="text-xs text-gray-400 mt-2">© 2026 HabitDx</Text>
        </View>
      </View>
    </ScrollView>
  );
}
