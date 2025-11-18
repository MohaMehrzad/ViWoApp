/**
 * Responsive Utilities
 * Helper functions for responsive design across different screen sizes
 * Optimized for iPhone SE to iPhone 14 Pro Max
 */

import { Dimensions, Platform, ScaledSize } from 'react-native';

// Screen size breakpoints (width in dp)
export const Breakpoints = {
  // iPhone SE / small phones
  xs: 375,
  // iPhone 13/14 / standard phones
  sm: 390,
  // iPhone 14 Pro / larger phones
  md: 393,
  // iPhone 14 Pro Max / largest phones
  lg: 430,
  // Tablets
  xl: 768,
};

/**
 * Get current screen dimensions
 * Note: This is for initial calculation only. Use useWindowDimensions hook in components.
 */
export function getScreenDimensions(): ScaledSize {
  return Dimensions.get('window');
}

/**
 * Check if device is a tablet
 */
export function isTablet(width?: number): boolean {
  const screenWidth = width || Dimensions.get('window').width;
  return screenWidth >= Breakpoints.xl;
}

/**
 * Check if device is a small phone (iPhone SE size)
 */
export function isSmallPhone(width?: number): boolean {
  const screenWidth = width || Dimensions.get('window').width;
  return screenWidth < Breakpoints.sm;
}

/**
 * Check if device is a large phone (iPhone 14 Pro Max size)
 */
export function isLargePhone(width?: number): boolean {
  const screenWidth = width || Dimensions.get('window').width;
  return screenWidth >= Breakpoints.lg && screenWidth < Breakpoints.xl;
}

/**
 * Scale value based on screen width
 * Useful for responsive font sizes and spacing
 * @param size Base size (designed for iPhone 14 - 390px width)
 * @param width Current screen width (optional)
 */
export function scaleSize(size: number, width?: number): number {
  const screenWidth = width || Dimensions.get('window').width;
  const baseWidth = 390; // iPhone 14 as base
  const scale = screenWidth / baseWidth;
  
  // Limit scaling to reasonable range
  const clampedScale = Math.max(0.85, Math.min(scale, 1.15));
  
  return Math.round(size * clampedScale);
}

/**
 * Get responsive value based on breakpoints
 * @param values Object with breakpoint keys and values
 * @param width Current screen width (optional)
 */
export function getResponsiveValue<T>(
  values: {
    xs?: T;
    sm?: T;
    md?: T;
    lg?: T;
    xl?: T;
    default: T;
  },
  width?: number
): T {
  const screenWidth = width || Dimensions.get('window').width;

  if (screenWidth >= Breakpoints.xl && values.xl !== undefined) {
    return values.xl;
  }
  if (screenWidth >= Breakpoints.lg && values.lg !== undefined) {
    return values.lg;
  }
  if (screenWidth >= Breakpoints.md && values.md !== undefined) {
    return values.md;
  }
  if (screenWidth >= Breakpoints.sm && values.sm !== undefined) {
    return values.sm;
  }
  if (screenWidth < Breakpoints.sm && values.xs !== undefined) {
    return values.xs;
  }

  return values.default;
}

/**
 * Get responsive font size
 * Automatically scales based on screen width
 */
export function responsiveFontSize(baseSize: number, width?: number): number {
  const screenWidth = width || Dimensions.get('window').width;
  
  // More aggressive scaling for small devices
  if (screenWidth < Breakpoints.xs) {
    return Math.round(baseSize * 0.9);
  }
  
  // Slight increase for large devices
  if (screenWidth >= Breakpoints.lg) {
    return Math.round(baseSize * 1.05);
  }
  
  return baseSize;
}

/**
 * Get responsive spacing
 * Automatically scales based on screen width
 */
export function responsiveSpacing(baseSpacing: number, width?: number): number {
  return scaleSize(baseSpacing, width);
}

/**
 * Calculate responsive padding for content
 * Ensures comfortable reading width on tablets
 */
export function getContentPadding(width?: number): number {
  const screenWidth = width || Dimensions.get('window').width;
  
  if (isTablet(screenWidth)) {
    // More padding on tablets for better reading experience
    return Math.min(screenWidth * 0.15, 120);
  }
  
  if (isSmallPhone(screenWidth)) {
    // Less padding on small phones to maximize content area
    return 12;
  }
  
  // Standard padding for normal phones
  return 16;
}

/**
 * Get aspect ratio for media based on screen size
 * Returns optimal aspect ratio for current device
 */
export function getMediaAspectRatio(
  preferredRatio: number,
  width?: number
): number {
  const screenWidth = width || Dimensions.get('window').width;
  
  // On small screens, prefer more vertical content
  if (isSmallPhone(screenWidth) && preferredRatio > 1) {
    return Math.max(preferredRatio * 0.9, 1);
  }
  
  return preferredRatio;
}

/**
 * Get number of columns for grid layouts
 */
export function getGridColumns(width?: number): number {
  const screenWidth = width || Dimensions.get('window').width;
  
  if (screenWidth >= Breakpoints.xl) {
    return 3; // Tablets: 3 columns
  }
  if (screenWidth >= Breakpoints.lg) {
    return 2; // Large phones: 2 columns
  }
  return 1; // Small/medium phones: 1 column
}

/**
 * Calculate item width for grid layouts
 */
export function getGridItemWidth(
  columns: number,
  spacing: number = 16,
  padding: number = 16,
  width?: number
): number {
  const screenWidth = width || Dimensions.get('window').width;
  const totalSpacing = spacing * (columns - 1) + padding * 2;
  return (screenWidth - totalSpacing) / columns;
}

/**
 * Platform-specific utilities
 */
export const PlatformResponsive = {
  /**
   * Get touch target size (minimum 44dp per Apple HIG)
   */
  touchTargetSize: Platform.select({
    ios: 44,
    android: 48,
    default: 44,
  }),

  /**
   * Get icon size based on platform
   */
  iconSize: (base: number) =>
    Platform.select({
      ios: base,
      android: Math.round(base * 1.1),
      default: base,
    }),

  /**
   * Get button height based on platform
   */
  buttonHeight: Platform.select({
    ios: 44,
    android: 48,
    default: 44,
  }),
};

export default {
  Breakpoints,
  isTablet,
  isSmallPhone,
  isLargePhone,
  scaleSize,
  getResponsiveValue,
  responsiveFontSize,
  responsiveSpacing,
  getContentPadding,
  getMediaAspectRatio,
  getGridColumns,
  getGridItemWidth,
  PlatformResponsive,
};

