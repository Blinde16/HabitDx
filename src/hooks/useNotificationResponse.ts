import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { logger } from '@/lib/logger';

export function useNotificationResponse() {
  const router = useRouter();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // Listen for notifications received while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        logger.info('Notification received', {
          title: notification.request.content.title,
          body: notification.request.content.body,
          data: notification.request.content.data,
        });
      }
    );

    // Listen for notification responses (user tapped on notification)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const { data } = response.notification.request.content;
        logger.info('Notification tapped', { data });

        // Handle different notification types
        if (data?.type === 'habit_reminder') {
          // Navigate to home screen for habit check-in
          router.push('/(tabs)/home');
        } else if (data?.type === 'weekly_insight') {
          // Navigate to insights screen
          router.push('/(tabs)/insights');
        } else if (data?.screen) {
          // Navigate to specified screen
          router.push(data.screen as any);
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
  }, [router]);
}
