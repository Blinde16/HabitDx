import { useEffect, useRef } from 'react';
import { useRouter, useRootNavigationState } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { logInfo } from '@/lib/logger';
import { isExpoWeb } from '@/lib/runtime';

export function useNotificationResponse() {
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    if (isExpoWeb) {
      return;
    }

    // Listen for notifications received while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        logInfo('Notification received', {
          title: notification.request.content.title,
          body: notification.request.content.body,
          data: notification.request.content.data,
        });
      }
    );

    // Listen for notification responses (user tapped on notification)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        if (!rootNavigationState?.key) {
          return;
        }

        const { data } = response.notification.request.content;
        logInfo('Notification tapped', { data });

        // Handle different notification types
        if (data?.type === 'habit_reminder') {
          // Navigate to home screen for habit check-in
          router.push('/(tabs)/home');
        } else if (data?.type === 'weekly_insight') {
          // Navigate to insights screen
          router.push('/(tabs)/insights');
        } else if (typeof data?.screen === 'string') {
          // Navigate to specified screen
          router.push(data.screen as never);
        }
      }
    );

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [router, rootNavigationState?.key]);
}
