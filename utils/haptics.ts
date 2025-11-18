/**
 * Safe Haptics Wrapper
 * Provides haptic feedback with Android version checking and error handling
 */

import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

type HapticStyle = 
  | Haptics.ImpactFeedbackStyle.Light
  | Haptics.ImpactFeedbackStyle.Medium
  | Haptics.ImpactFeedbackStyle.Heavy;

type NotificationStyle =
  | Haptics.NotificationFeedbackType.Success
  | Haptics.NotificationFeedbackType.Warning
  | Haptics.NotificationFeedbackType.Error;

/**
 * Check if haptics are supported on the current device
 */
function isHapticsSupported(): boolean {
  if (Platform.OS === 'ios') {
    return true;
  }
  
  if (Platform.OS === 'android') {
    // expo-haptics requires Android 12+ (API level 31)
    return Platform.Version >= 31;
  }
  
  return false;
}

/**
 * Trigger impact haptic feedback
 * @param style - Impact style (Light, Medium, Heavy)
 */
export async function impactAsync(style: HapticStyle = Haptics.ImpactFeedbackStyle.Light): Promise<void> {
  if (!isHapticsSupported()) {
    return;
  }

  try {
    await Haptics.impactAsync(style);
  } catch (error) {
    // Silently fail - haptics are not critical
    if (__DEV__) {
      console.warn('Haptic feedback failed:', error);
    }
  }
}

/**
 * Trigger notification haptic feedback
 * @param type - Notification type (Success, Warning, Error)
 */
export async function notificationAsync(type: NotificationStyle): Promise<void> {
  if (!isHapticsSupported()) {
    return;
  }

  try {
    await Haptics.notificationAsync(type);
  } catch (error) {
    if (__DEV__) {
      console.warn('Haptic notification failed:', error);
    }
  }
}

/**
 * Trigger selection haptic feedback
 */
export async function selectionAsync(): Promise<void> {
  if (!isHapticsSupported()) {
    return;
  }

  try {
    await Haptics.selectionAsync();
  } catch (error) {
    if (__DEV__) {
      console.warn('Haptic selection failed:', error);
    }
  }
}

/**
 * Convenience functions for common haptic patterns
 */
export const HapticFeedback = {
  /**
   * Light tap feedback - for subtle interactions
   */
  light: () => impactAsync(Haptics.ImpactFeedbackStyle.Light),

  /**
   * Medium tap feedback - for standard interactions
   */
  medium: () => impactAsync(Haptics.ImpactFeedbackStyle.Medium),

  /**
   * Heavy tap feedback - for important actions
   */
  heavy: () => impactAsync(Haptics.ImpactFeedbackStyle.Heavy),

  /**
   * Success feedback - for completed actions
   */
  success: () => notificationAsync(Haptics.NotificationFeedbackType.Success),

  /**
   * Warning feedback - for cautionary actions
   */
  warning: () => notificationAsync(Haptics.NotificationFeedbackType.Warning),

  /**
   * Error feedback - for failed actions
   */
  error: () => notificationAsync(Haptics.NotificationFeedbackType.Error),

  /**
   * Selection feedback - for picker/selector changes
   */
  selection: () => selectionAsync(),
};

/**
 * Check if haptics are available
 */
export const isHapticsAvailable = isHapticsSupported;

export default HapticFeedback;

