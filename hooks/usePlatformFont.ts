/**
 * Platform Font Hook
 * Returns platform-appropriate fonts: SF Pro (iOS), Inter (Android/Web)
 */

import { Platform } from 'react-native';
import { Typography } from '@/constants/theme';

type FontWeight = 'regular' | 'medium' | 'semibold' | 'bold';

/**
 * Get platform-specific font family
 */
export function usePlatformFont(weight: FontWeight = 'regular'): string {
  const fontFamily = Platform.select({
    ios: 'System', // iOS will use SF Pro by default
    android: 'sans-serif', // Android will use Roboto by default (closest to Inter)
    web: 'Inter, system-ui, -apple-system, sans-serif',
    default: 'System',
  });

  // On iOS, System font automatically uses SF Pro
  // For Android/Web, you would load custom fonts via useFonts hook
  // For now, using system fonts as fallback

  return fontFamily;
}

/**
 * Get text style with platform font
 */
export function getPlatformTextStyle(weight: FontWeight = 'regular') {
  return {
    fontFamily: usePlatformFont(weight),
    fontWeight: Typography.weight[weight],
  };
}

export default usePlatformFont;

