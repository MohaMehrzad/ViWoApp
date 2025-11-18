/**
 * Hook for tracking background luminance behind glass UI elements
 * Provides dynamic luminance values for adaptive icon rendering
 */

import { useState, useEffect, useCallback } from 'react';
import { useColorScheme, Appearance } from 'react-native';
import { hexToLuminance, rgbaToLuminance, getAverageLuminance } from '@/utils/luminance';

export interface BackgroundLuminanceConfig {
  /**
   * Static color to sample (hex or rgba)
   */
  staticColor?: string;
  
  /**
   * Multiple colors for gradient backgrounds
   */
  gradientColors?: string[];
  
  /**
   * Whether to update on theme changes
   */
  autoUpdate?: boolean;
  
  /**
   * Default luminance when no background is specified
   */
  defaultLuminance?: number;
}

/**
 * Hook for managing background luminance detection
 * Supports static colors, gradients, and dynamic theme switching
 */
export function useBackgroundLuminance(config: BackgroundLuminanceConfig = {}) {
  const {
    staticColor,
    gradientColors,
    autoUpdate = true,
    defaultLuminance,
  } = config;
  
  const colorScheme = useColorScheme();
  
  // Calculate default based on theme if not provided
  const getDefaultLuminance = useCallback(() => {
    if (defaultLuminance !== undefined) {
      return defaultLuminance;
    }
    // Default to typical background luminance for theme
    return colorScheme === 'dark' ? 0.1 : 0.95;
  }, [defaultLuminance, colorScheme]);
  
  const [luminance, setLuminance] = useState<number>(() => {
    if (staticColor) {
      return staticColor.startsWith('#') 
        ? hexToLuminance(staticColor)
        : rgbaToLuminance(staticColor);
    }
    if (gradientColors && gradientColors.length > 0) {
      return getAverageLuminance(gradientColors);
    }
    return getDefaultLuminance();
  });
  
  // Update luminance when config changes
  useEffect(() => {
    if (staticColor) {
      const newLuma = staticColor.startsWith('#')
        ? hexToLuminance(staticColor)
        : rgbaToLuminance(staticColor);
      setLuminance(newLuma);
    } else if (gradientColors && gradientColors.length > 0) {
      setLuminance(getAverageLuminance(gradientColors));
    } else if (autoUpdate) {
      setLuminance(getDefaultLuminance());
    }
  }, [staticColor, gradientColors, autoUpdate, getDefaultLuminance]);
  
  // Update when theme changes
  useEffect(() => {
    if (autoUpdate && !staticColor && !gradientColors) {
      const subscription = Appearance.addChangeListener(() => {
        setLuminance(getDefaultLuminance());
      });
      
      return () => subscription.remove();
    }
  }, [autoUpdate, staticColor, gradientColors, getDefaultLuminance]);
  
  /**
   * Manually update luminance value
   * Useful for scroll-based or dynamic content
   */
  const updateLuminance = useCallback((newLuminance: number) => {
    setLuminance(Math.max(0, Math.min(1, newLuminance)));
  }, []);
  
  /**
   * Update from a color string
   */
  const updateFromColor = useCallback((color: string) => {
    const newLuma = color.startsWith('#')
      ? hexToLuminance(color)
      : rgbaToLuminance(color);
    setLuminance(newLuma);
  }, []);
  
  /**
   * Update from multiple colors (gradient)
   */
  const updateFromGradient = useCallback((colors: string[]) => {
    setLuminance(getAverageLuminance(colors));
  }, []);
  
  return {
    luminance,
    updateLuminance,
    updateFromColor,
    updateFromGradient,
  };
}

/**
 * Preset luminance values for common backgrounds
 */
export const BackgroundPresets = {
  // Pure colors
  white: 1.0,
  black: 0.0,
  
  // Common theme backgrounds
  lightBackground: 0.95,
  darkBackground: 0.1,
  
  // Glass surfaces
  lightGlass: 0.85,
  darkGlass: 0.15,
  
  // Gradient midpoints
  purpleDream: 0.35,   // Purple gradient
  cryptoGlow: 0.2,     // Dark blue gradient
  oceanWave: 0.45,     // Cyan-purple gradient
  aurora: 0.4,         // Multi-color gradient
  
  // Common UI elements
  accentLight: 0.05,   // Dark navy (VCoin)
  accentDark: 0.25,    // Blue (VCoin dark mode)
  primaryLight: 0.35,  // Purple
  primaryDark: 0.4,    // Purple (dark mode)
} as const;

