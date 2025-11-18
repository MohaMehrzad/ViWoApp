/**
 * @deprecated This file is deprecated. Please use constants/theme.ts instead.
 * 
 * The color system has been moved to theme.ts with a comprehensive brand palette:
 * - BrandColors: Purple/Cyan/Gold color scales
 * - Colors.light/dark: Complete color tokens with primary/secondary/accent
 * - Gradients: Brand gradient definitions
 * - SpecialColors: Verification, staking, engagement, reputation colors
 * - InteractiveStates: Button, focus, and input state colors
 * 
 * Import from theme.ts: import { Colors, BrandColors } from '@/constants/theme';
 */

import { Colors as ThemeColors, BrandColors } from './theme';

// Backward compatibility exports
const tintColorLight = ThemeColors.light.primary;  // Updated to brand purple
const tintColorDark = ThemeColors.dark.primary;     // Updated to brand purple

export default {
  light: {
    text: ThemeColors.light.textPrimary,
    background: ThemeColors.light.background,
    tint: tintColorLight,
    tabIconDefault: ThemeColors.light.textTertiary,
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: ThemeColors.dark.textPrimary,
    background: ThemeColors.dark.background,
    tint: tintColorDark,
    tabIconDefault: ThemeColors.dark.textTertiary,
    tabIconSelected: tintColorDark,
  },
};

// Re-export for convenience
export { ThemeColors as Colors, BrandColors };
