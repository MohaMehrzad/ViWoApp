import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { notificationService } from '@/services/notifications/fcm';
import { useAuth } from '@/contexts/AuthContext';

export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Only initialize if user is authenticated
    if (!isAuthenticated) {
      return;
    }

    let cleanup: (() => void) | undefined;

    const initializeNotifications = async () => {
      try {
        // Initialize notification service
        const token = await notificationService.initialize(
          // Handle foreground notifications
          (notification) => {
            console.log('Foreground notification:', notification);
            setNotification(notification);
          },
          // Handle notification taps
          (response) => {
            console.log('Notification tapped:', response);
            const data = response.notification.request.content.data;

            // Navigate based on notification data
            if (data.postId) {
              // Navigate to post (you can create a post detail screen)
              console.log('Navigate to post:', data.postId);
            } else if (data.threadId) {
              router.push(`/chat/${data.threadId}`);
            } else if (data.userId) {
              router.push(`/profile/${data.userId}`);
            }
          }
        );

        if (token) {
          setExpoPushToken(token);
        }
      } catch (error) {
        console.error('Failed to initialize notifications:', error);
      }
    };

    initializeNotifications();

    // Cleanup on unmount
    return () => {
      cleanup?.();
    };
  }, [isAuthenticated]);

  return {
    expoPushToken,
    notification,
  };
}

