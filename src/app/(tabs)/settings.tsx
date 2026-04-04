import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { useNotificationStore } from '../../stores/notificationStore';
import NotificationService from '../../lib/notificationService';
import { logError } from '../../lib/logger';
import appConfig from '../../lib/appConfig';
import { openExternalUrl, openSupportEmail } from '../../lib/externalLinks';
import { isExpoWeb } from '../../lib/runtime';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, signOut, deleteAccount } = useAuthStore();
  const { notificationsEnabled, updateNotificationSettings } = useNotificationStore();

  const [notifEnabled, setNotifEnabled] = useState(notificationsEnabled);
  const [deletingAccount, setDeletingAccount] = useState(false);

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
      const message =
        error instanceof Error ? error.message : 'Failed to send test notification';
      Alert.alert('Test notification', message);
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
      'This will permanently delete your account and all habit data. You can sign up again with the same email. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingAccount(true);
            try {
              await deleteAccount();
              await NotificationService.cancelAllReminders();
              router.replace('/(auth)/login');
            } catch (error) {
              logError(error as Error, { context: 'settings.deleteAccount' });
              const message =
                error instanceof Error ? error.message : 'Could not delete your account. Try again or contact support.';
              Alert.alert('Could Not Delete Account', message);
            } finally {
              setDeletingAccount(false);
            }
          },
        },
      ]
    );
  };

  const handleOpenLink = async (url: string | undefined, fallbackTitle: string, fallbackBody: string) => {
    if (!url) {
      Alert.alert(fallbackTitle, fallbackBody);
      return;
    }

    const opened = await openExternalUrl(url);
    if (!opened) {
      Alert.alert('Unable to Open Link', 'Please try again on a device with browser access.');
    }
  };

  const handleContactSupport = async () => {
    if (!appConfig.supportEmail) {
      Alert.alert('Support Email Needed', 'Add EXPO_PUBLIC_SUPPORT_EMAIL to enable support links.');
      return;
    }

    const opened = await openSupportEmail(appConfig.supportEmail, 'HabitDx Support');
    if (!opened) {
      Alert.alert('Unable to Open Email', `Please contact ${appConfig.supportEmail} manually.`);
    }
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
                <Text className="text-base font-medium text-gray-900">View Habit Profile</Text>
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

        {/* Notifications — not available in browser (beta is web-first); native apps get full support */}
        <View className="mb-8">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Notifications</Text>

          <View className="bg-white border border-gray-200 rounded-lg">
            {isExpoWeb ? (
              <View className="p-4">
                <Text className="text-base font-medium text-gray-900">Reminders (mobile only)</Text>
                <Text className="text-sm text-gray-600 mt-2 leading-5">
                  Habit reminders and test notifications are not available in the browser. You can
                  fully test the rest of the beta here; install the iOS or Android build when you
                  want to try push reminders.
                </Text>
              </View>
            ) : (
              <>
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
              </>
            )}
          </View>
        </View>

        {/* Beta Feedback */}
        <View className="mb-8">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Beta Feedback</Text>

          <View className="bg-white border border-gray-200 rounded-lg">
            <TouchableOpacity
              className="flex-row items-center justify-between p-4 border-b border-gray-200"
              onPress={() =>
                handleOpenLink(
                  appConfig.betaFeedbackUrl,
                  'Feedback Form Not Configured',
                  'Add EXPO_PUBLIC_BETA_FEEDBACK_URL to send testers to your feedback form.'
                )
              }
            >
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900">Share Beta Feedback</Text>
                <Text className="text-sm text-gray-600 mt-1">
                  Capture onboarding friction, bugs, and ideas
                </Text>
              </View>
              <Text className="text-2xl text-gray-400">→</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center justify-between p-4 border-b border-gray-200"
              onPress={() =>
                handleOpenLink(
                  appConfig.betaCommunityUrl,
                  'Community Link Not Configured',
                  'Add EXPO_PUBLIC_BETA_COMMUNITY_URL to open your Discord or Slack invite.'
                )
              }
            >
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900">Join Tester Community</Text>
                <Text className="text-sm text-gray-600 mt-1">
                  Keep beta testers in one shared support channel
                </Text>
              </View>
              <Text className="text-2xl text-gray-400">→</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center justify-between p-4"
              onPress={() =>
                handleOpenLink(
                  appConfig.betaExitSurveyUrl,
                  'Exit Survey Not Configured',
                  'Add EXPO_PUBLIC_BETA_EXIT_SURVEY_URL to collect churn and drop-off reasons.'
                )
              }
            >
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900">Take Exit Survey</Text>
                <Text className="text-sm text-gray-600 mt-1">
                  Learn why users stop returning before launch
                </Text>
              </View>
              <Text className="text-2xl text-gray-400">→</Text>
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

            {appConfig.privacyPolicyUrl && (
              <TouchableOpacity
                className={`flex-row items-center justify-between p-4 ${appConfig.termsUrl ? 'border-b border-gray-200' : ''}`}
                onPress={() =>
                  handleOpenLink(
                    appConfig.privacyPolicyUrl,
                    'Privacy Policy Not Configured',
                    'Add EXPO_PUBLIC_PRIVACY_POLICY_URL after you publish the policy.'
                  )
                }
              >
                <Text className="text-base text-gray-900">Privacy Policy</Text>
                <Text className="text-2xl text-gray-400">→</Text>
              </TouchableOpacity>
            )}

            {appConfig.termsUrl && (
              <TouchableOpacity
                className="flex-row items-center justify-between p-4"
                onPress={() =>
                  handleOpenLink(
                    appConfig.termsUrl,
                    'Terms Not Configured',
                    'Add EXPO_PUBLIC_TERMS_URL after you publish the terms.'
                  )
                }
              >
                <Text className="text-base text-gray-900">Terms of Service</Text>
                <Text className="text-2xl text-gray-400">→</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Support */}
        {appConfig.supportEmail && (
          <View className="mb-8">
            <Text className="text-lg font-semibold text-gray-900 mb-4">Support</Text>

            <View className="bg-white border border-gray-200 rounded-lg">
              <TouchableOpacity
                className="flex-row items-center justify-between p-4"
                onPress={handleContactSupport}
              >
                <View className="flex-1">
                  <Text className="text-base font-medium text-gray-900">Email Support</Text>
                  <Text className="text-sm text-gray-600 mt-1">Contact us</Text>
                </View>
                <Text className="text-2xl text-gray-400">→</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Danger Zone */}
        <View className="mb-8">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Account</Text>

          <View className="bg-white border border-gray-200 rounded-lg">
            {/* Sign Out */}
            <TouchableOpacity className="p-4 border-b border-gray-200" onPress={handleSignOut}>
              <Text className="text-base font-medium text-blue-600">Sign Out</Text>
            </TouchableOpacity>

            {/* Delete Account */}
            <TouchableOpacity
              className="p-4"
              onPress={handleDeleteAccount}
              disabled={deletingAccount}
            >
              <Text className="text-base font-medium text-red-600">
                {deletingAccount ? 'Deleting…' : 'Delete Account'}
              </Text>
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
