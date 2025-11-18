import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import apiClient from '../api/client';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const notificationService = {
  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      console.log('Must use physical device for push notifications');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push notification permissions');
      return false;
    }

    return true;
  },

  /**
   * Get the Expo push token
   */
  async getExpoPushToken(): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      // For Expo managed workflow
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'viwoapp',
      });

      console.log('Expo Push Token:', token.data);
      return token.data;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  },

  /**
   * Register device token with backend
   */
  async registerTokenWithBackend(token: string): Promise<void> {
    try {
      await apiClient.post('/notifications/register-token', {
        token,
        platform: Platform.OS,
      });
      console.log('Token registered with backend successfully');
    } catch (error) {
      console.error('Failed to register token with backend:', error);
      throw error;
    }
  },

  /**
   * Remove token from backend (on logout)
   */
  async removeTokenFromBackend(token: string): Promise<void> {
    try {
      await apiClient.delete('/notifications/remove-token', {
        data: { token },
      });
      console.log('Token removed from backend successfully');
    } catch (error) {
      console.error('Failed to remove token from backend:', error);
    }
  },

  /**
   * Setup notification listeners
   */
  setupNotificationListeners(
    onNotificationReceived?: (notification: Notifications.Notification) => void,
    onNotificationTapped?: (response: Notifications.NotificationResponse) => void
  ) {
    // Foreground notification listener
    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
        onNotificationReceived?.(notification);
      }
    );

    // Notification tap listener
    const responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification tapped:', response);
        onNotificationTapped?.(response);
      }
    );

    // Return cleanup function
    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  },

  /**
   * Initialize notification service
   */
  async initialize(
    onNotificationReceived?: (notification: Notifications.Notification) => void,
    onNotificationTapped?: (response: Notifications.NotificationResponse) => void
  ): Promise<string | null> {
    try {
      // Get token
      const token = await this.getExpoPushToken();
      if (!token) {
        return null;
      }

      // Register with backend
      await this.registerTokenWithBackend(token);

      // Setup listeners
      this.setupNotificationListeners(onNotificationReceived, onNotificationTapped);

      return token;
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
      return null;
    }
  },
};

