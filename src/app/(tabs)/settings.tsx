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
import { HabitDxLogo } from '../../components/brand';
import { getAppDate, useDevDateStore } from '../../lib/devDate';

function SettingsRow({
  title,
  subtitle,
  onPress,
  showChevron,
}: {
  title: string;
  subtitle?: string;
  onPress: () => void;
  showChevron?: boolean;
}) {
  return (
    <TouchableOpacity
      className="py-5 active:opacity-80"
      onPress={onPress}
      accessibilityRole="button"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-4">
          <Text className="text-base font-public-sb text-on_surface">{title}</Text>
          {subtitle ? (
            <Text className="text-sm font-public text-on_surface_variant mt-1 leading-5">
              {subtitle}
            </Text>
          ) : null}
        </View>
        {showChevron !== false && (
          <Text className="text-lg font-public text-on_surface_variant">›</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

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
        await NotificationService.scheduleAllHabitReminders(user.id);
      }
    } catch (error) {
      logError(error as Error, { context: 'settings.toggleNotifications' });
      Alert.alert('Error', 'Could not update notification settings');
      setNotifEnabled(!value);
    }
  };

  const handleTestNotification = async () => {
    try {
      await NotificationService.sendTestNotification();
      Alert.alert('Test Sent', 'Check your notifications.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send test notification';
      Alert.alert('Test notification', message);
    }
  };

  const handleSignOut = () => {
    const confirmAndSignOut = async () => {
      await signOut();
      router.replace('/(auth)/login');
    };

    // Alert.alert is unreliable on React Native Web (embedded / automation); use window.confirm.
    if (isExpoWeb && typeof window !== 'undefined') {
      if (window.confirm('Sign out?\n\nAre you sure you want to sign out?')) {
        void confirmAndSignOut();
      }
      return;
    }

    Alert.alert('Sign Out?', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => void confirmAndSignOut(),
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
                error instanceof Error
                  ? error.message
                  : 'Could not delete your account. Try again or contact support.';
              Alert.alert('Could Not Delete Account', message);
            } finally {
              setDeletingAccount(false);
            }
          },
        },
      ]
    );
  };

  const handleOpenLink = async (
    url: string | undefined,
    fallbackTitle: string,
    fallbackBody: string
  ) => {
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
    <ScrollView className="flex-1 bg-surface">
      <View className="px-7 py-10 max-w-3xl self-center w-full">
        <HabitDxLogo variant="wordmark" width={200} style={{ marginBottom: 24 }} />
        <Text className="font-manrope text-display-lg text-on_surface mb-8 self-start">
          Settings
        </Text>

        <View className="bg-surface_container_low rounded-xl p-5 mb-8">
          <Text className="text-xs font-public-sb text-on_surface_variant uppercase tracking-wide mb-1">
            Signed in as
          </Text>
          <Text className="text-base font-public text-on_surface">{user?.email || 'Unknown'}</Text>
        </View>

        <Text className="font-manrope-md text-lg text-on_surface mb-3">Habits</Text>
        <View className="bg-surface_container_lowest rounded-xl px-5 mb-10">
          <SettingsRow
            title="Habit Profile"
            subtitle="Your diagnostic habit analysis"
            onPress={() => router.push('/(onboarding)/failure-profile')}
          />
          <SettingsRow
            title="Manage Habits"
            subtitle="View or regenerate your habit stack"
            onPress={() => router.push('/(onboarding)/habits')}
          />
        </View>

        <Text className="font-manrope-md text-lg text-on_surface mb-3">Notifications</Text>
        <View className="bg-surface_container_lowest rounded-xl px-5 mb-10">
          {isExpoWeb ? (
            <View className="py-5">
              <Text className="text-base font-public-sb text-on_surface">
                Reminders (mobile only)
              </Text>
              <Text className="text-sm font-public text-on_surface_variant mt-2 leading-5">
                Habit reminders are not available in the browser. Install the iOS or Android build
                to try push reminders.
              </Text>
            </View>
          ) : (
            <>
              <View className="flex-row items-center justify-between py-5">
                <View className="flex-1 pr-4">
                  <Text className="text-base font-public-sb text-on_surface">
                    Enable Notifications
                  </Text>
                  <Text className="text-sm font-public text-on_surface_variant mt-1">
                    Reminders for your habits
                  </Text>
                </View>
                <Switch
                  value={notifEnabled}
                  onValueChange={handleNotificationToggle}
                  trackColor={{ false: '#d9e0e3', true: '#62c49d' }}
                  thumbColor="#FFFFFF"
                />
              </View>
              <SettingsRow
                title="Test Notification"
                subtitle="Send a test notification now"
                onPress={handleTestNotification}
              />
            </>
          )}
        </View>

        <Text className="font-manrope-md text-lg text-on_surface mb-3">Beta Feedback</Text>
        <View className="bg-surface_container_lowest rounded-xl px-5 mb-10">
          <SettingsRow
            title="Share Beta Feedback"
            subtitle="Onboarding friction, bugs, and ideas"
            onPress={() =>
              handleOpenLink(
                appConfig.betaFeedbackUrl,
                'Feedback Form Not Configured',
                'Add EXPO_PUBLIC_BETA_FEEDBACK_URL to send testers to your feedback form.'
              )
            }
          />
          <SettingsRow
            title="Tester Community"
            subtitle="Shared support channel"
            onPress={() =>
              handleOpenLink(
                appConfig.betaCommunityUrl,
                'Community Link Not Configured',
                'Add EXPO_PUBLIC_BETA_COMMUNITY_URL to open your Discord or Slack invite.'
              )
            }
          />
          <SettingsRow
            title="Exit Survey"
            subtitle="Why users stop returning before launch"
            onPress={() =>
              handleOpenLink(
                appConfig.betaExitSurveyUrl,
                'Exit Survey Not Configured',
                'Add EXPO_PUBLIC_BETA_EXIT_SURVEY_URL to collect churn and drop-off reasons.'
              )
            }
          />
        </View>

        <Text className="font-manrope-md text-lg text-on_surface mb-3">About</Text>
        <View className="bg-surface_container_lowest rounded-xl px-5 mb-10">
          <View className="py-5">
            <Text className="text-xs font-public-sb text-on_surface_variant uppercase tracking-wide mb-1">
              Version
            </Text>
            <Text className="text-base font-public text-on_surface">1.0.0</Text>
          </View>

          {appConfig.privacyPolicyUrl && (
            <>
              <SettingsRow
                title="Privacy Policy"
                onPress={() =>
                  handleOpenLink(
                    appConfig.privacyPolicyUrl,
                    'Privacy Policy Not Configured',
                    'Add EXPO_PUBLIC_PRIVACY_POLICY_URL after you publish the policy.'
                  )
                }
              />
            </>
          )}

          {appConfig.termsUrl && (
            <>
              <SettingsRow
                title="Terms of Service"
                onPress={() =>
                  handleOpenLink(
                    appConfig.termsUrl,
                    'Terms Not Configured',
                    'Add EXPO_PUBLIC_TERMS_URL after you publish the terms.'
                  )
                }
              />
            </>
          )}
        </View>

        {appConfig.supportEmail && (
          <>
            <Text className="font-manrope-md text-lg text-on_surface mb-3">Support</Text>
            <View className="bg-surface_container_lowest rounded-xl px-5 mb-10">
              <SettingsRow
                title="Email Support"
                subtitle="Contact us"
                onPress={handleContactSupport}
              />
            </View>
          </>
        )}

        <Text className="font-manrope-md text-lg text-on_surface mb-3">Account</Text>
        <View className="bg-surface_container_lowest rounded-xl px-5 mb-8">
          <TouchableOpacity className="py-5" onPress={handleSignOut}>
            <Text className="text-base font-public-sb text-primary_container">Sign Out</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="py-5"
            onPress={handleDeleteAccount}
            disabled={deletingAccount}
          >
            <Text className="text-base font-public-sb text-on_error_container">
              {deletingAccount ? 'Deleting…' : 'Delete Account'}
            </Text>
          </TouchableOpacity>
        </View>

        {__DEV__ && <DevDateOverride />}

        <View className="items-center py-6">
          <Text className="text-xs font-public text-on_surface_variant">HabitDx</Text>
          <Text className="text-xs font-public text-on_surface_variant mt-2">© 2026</Text>
        </View>
      </View>
    </ScrollView>
  );
}

function DevDateOverride() {
  const { dateOverride, setDateOverride, advanceDay } = useDevDateStore();
  const displayDate = getAppDate();

  const formatted = displayDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      <Text className="font-manrope-md text-lg text-on_surface mb-3">Developer</Text>
      <View className="bg-surface_container_lowest rounded-xl px-5 py-5 mb-8">
        <Text className="text-xs font-public-sb text-on_surface_variant uppercase tracking-wide mb-1">
          App Date {dateOverride ? '(overridden)' : '(real time)'}
        </Text>
        <Text className="text-base font-public text-on_surface mb-4">{formatted}</Text>

        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity
            className="bg-surface_container_high rounded-lg px-4 py-3 flex-1 mr-2 items-center"
            onPress={() => advanceDay(-1)}
          >
            <Text className="text-sm font-public-sb text-on_surface">← Previous Day</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-surface_container_high rounded-lg px-4 py-3 flex-1 ml-2 items-center"
            onPress={() => advanceDay(1)}
          >
            <Text className="text-sm font-public-sb text-on_surface">Next Day →</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity
            className="bg-surface_container_high rounded-lg px-4 py-3 flex-1 mr-2 items-center"
            onPress={() => advanceDay(-7)}
          >
            <Text className="text-sm font-public text-on_surface">− 1 Week</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-surface_container_high rounded-lg px-4 py-3 flex-1 ml-2 items-center"
            onPress={() => advanceDay(7)}
          >
            <Text className="text-sm font-public text-on_surface">+ 1 Week</Text>
          </TouchableOpacity>
        </View>

        {dateOverride && (
          <TouchableOpacity
            className="bg-primary_container rounded-lg px-4 py-3 items-center"
            onPress={() => setDateOverride(null)}
          >
            <Text className="text-sm font-public-sb text-on_primary_container">
              Reset to Real Time
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  );
}
