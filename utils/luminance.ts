/**
 * Luminance Utilities for Glass UI
 * Based on WCAG relative luminance calculations for dynamic icon contrast
 */

/**
 * Convert hex color to RGB values
 */
export function hexToRgb(hex: string): [number, number, number] {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Handle shorthand hex (#RGB)
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return [r, g, b];
}

/**
 * Convert rgba string to RGB values
 */
export function rgbaToRgb(rgba: string): [number, number, number] {
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) {
    return [128, 128, 128]; // Default to mid-gray
  }
  return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
}

/**
 * Normalize RGB channel value for luminance calculation
 */
function normalizeChannel(channel: number): number {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/**
 * Calculate relative luminance from RGB values (0-1 scale)
 * Uses WCAG formula: 0.2126R + 0.7152G + 0.0722B
 */
export function rgbToLuminance(r: number, g: number, b: number): number {
  const [nr, ng, nb] = [
    normalizeChannel(r),
    normalizeChannel(g),
    normalizeChannel(b),
  ];
  
  return 0.2126 * nr + 0.7152 * ng + 0.0722 * nb;
}

/**
 * Calculate luminance from hex color
 */
export function hexToLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return rgbToLuminance(r, g, b);
}

/**
 * Calculate luminance from rgba string
 */
export function rgbaToLuminance(rgba: string): number {
  const [r, g, b] = rgbaToRgb(rgba);
  return rgbToLuminance(r, g, b);
}

/**
 * Calculate contrast ratio between two luminance values
 * Returns ratio from 1:1 to 21:1
 */
export function getContrastRatio(luma1: number, luma2: number): number {
  const lighter = Math.max(luma1, luma2);
  const darker = Math.min(luma1, luma2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast meets WCAG AA standards
 * @param ratio - Contrast ratio
 * @param largeText - Whether text is large (>18pt or >14pt bold)
 */
export function meetsWCAGAA(ratio: number, largeText: boolean = false): boolean {
  return ratio >= (largeText ? 3.0 : 4.5);
}

/**
 * Determine if an icon should be light or dark based on background luminance
 * Uses threshold approach for crisp switching
 * @param backgroundLuma - Luminance of the background (0-1)
 * @param threshold - Luminance threshold for switching (default 0.55)
 * @returns true if icon should be light, false if dark
 */
export function shouldUseLightIcon(
  backgroundLuma: number,
  threshold: number = 0.55
): boolean {
  return backgroundLuma < threshold;
}

/**
 * Get adaptive icon color based on background luminance
 * Returns color strings suitable for glass UI
 */
export function getAdaptiveIconColor(
  backgroundLuma: number,
  isDarkMode: boolean = false,
  threshold: number = 0.55
): string {
  const useLightIcon = shouldUseLightIcon(backgroundLuma, threshold);
  
  if (useLightIcon) {
    // Light icon with slight transparency for glass effect
    return 'rgba(248, 250, 252, 0.92)';
  } else {
    // Dark icon with slight transparency for glass effect
    return 'rgba(17, 24, 39, 0.88)';
  }
}

/**
 * Interpolate between two colors based on luminance value
 * @param luma - Luminance value (0-1)
 * @param darkColor - Color for dark backgrounds
 * @param lightColor - Color for light backgrounds
 * @param threshold - Switching threshold
 */
export function interpolateIconColor(
  luma: number,
  darkColor: string = 'rgba(248, 250, 252, 0.92)',
  lightColor: string = 'rgba(17, 24, 39, 0.88)',
  threshold: number = 0.55
): string {
  // For smoother transitions, we could interpolate
  // But for crisp glass UI, we use threshold switching
  return luma < threshold ? darkColor : lightColor;
}

/**
 * Sample multiple points and get average luminance
 * Useful for gradient or complex backgrounds
 */
export function getAverageLuminance(colors: string[]): number {
  if (colors.length === 0) return 0.5; // Default to mid-gray
  
  const luminances = colors.map(color => {
    if (color.startsWith('#')) {
      return hexToLuminance(color);
    } else if (color.startsWith('rgb')) {
      return rgbaToLuminance(color);
    }
    return 0.5;
  });
  
  return luminances.reduce((sum, luma) => sum + luma, 0) / luminances.length;
}

