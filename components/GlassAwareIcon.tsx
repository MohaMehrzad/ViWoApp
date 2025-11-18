/**
 * Glass-Aware Icon Component
 * Automatically adjusts icon color based on background luminance
 * Ensures optimal contrast and WCAG AA compliance
 */

import React, { useEffect } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAdaptiveIconColor, shouldUseLightIcon } from '@/utils/luminance';
import { Motion } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

// Color constants for glass UI
const DARK_ICON = 'rgba(17, 24, 39, 0.88)';
const LIGHT_ICON = 'rgba(248, 250, 252, 0.92)';
const LUMINANCE_THRESHOLD = 0.55;

export interface GlassAwareIconProps {
  /**
   * Icon name from Ionicons
   */
  name: React.ComponentProps<typeof Ionicons>['name'];
  
  /**
   * Icon size in pixels
   */
  size?: number;
  
  /**
   * Background luminance value (0-1)
   * 0 = pure black, 1 = pure white
   */
  backgroundLuma: number;
  
  /**
   * Override automatic color selection
   */
  color?: string;
  
  /**
   * Custom threshold for switching (default 0.55)
   */
  threshold?: number;
  
  /**
   * Animation duration in ms (default 180)
   */
  animationDuration?: number;
  
  /**
   * Additional style
   */
  style?: any;
  
  /**
   * Whether icon is in focused/active state
   * When true and over dark background indicator, uses white
   */
  isFocused?: boolean;
}

/**
 * Icon component that adapts its color based on background luminance
 * Provides smooth animated transitions between light and dark variants
 */
export const GlassAwareIcon: React.FC<GlassAwareIconProps> = ({
  name,
  size = 24,
  backgroundLuma,
  color,
  threshold = LUMINANCE_THRESHOLD,
  animationDuration = 180,
  style,
  isFocused = false,
}) => {
  const { colors } = useTheme();
  const colorAnim = React.useRef(new Animated.Value(backgroundLuma)).current;
  
  useEffect(() => {
    Animated.timing(colorAnim, {
      toValue: backgroundLuma,
      duration: animationDuration,
      useNativeDriver: false, // Color animations require native driver: false
    }).start();
  }, [backgroundLuma, animationDuration]);
  
  // Determine target color based on luminance
  const useLightIcon = shouldUseLightIcon(backgroundLuma, threshold);
  
  // If focused and on dark indicator background, always use theme background color
  const finalColor = color || (isFocused ? colors.background : (useLightIcon ? LIGHT_ICON : DARK_ICON));
  
  // For now, we use immediate color switching (more performant)
  // Smooth interpolation can be added if needed
  return (
    <Animated.View style={[styles.container, style]}>
      <Ionicons 
        name={name} 
        size={size} 
        color={finalColor}
      />
    </Animated.View>
  );
};

/**
 * Alternative version with smooth color interpolation
 * Use when smooth transitions are more important than performance
 */
export const GlassAwareIconSmooth: React.FC<GlassAwareIconProps> = ({
  name,
  size = 24,
  backgroundLuma,
  color,
  threshold = LUMINANCE_THRESHOLD,
  animationDuration = 180,
  style,
  isFocused = false,
}) => {
  const { colors } = useTheme();
  const colorProgress = React.useRef(new Animated.Value(backgroundLuma < threshold ? 0 : 1)).current;
  
  useEffect(() => {
    Animated.timing(colorProgress, {
      toValue: backgroundLuma < threshold ? 0 : 1,
      duration: animationDuration,
      useNativeDriver: false,
    }).start();
  }, [backgroundLuma, threshold, animationDuration]);
  
  // Interpolate between light and dark colors
  const interpolatedColor = colorProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [LIGHT_ICON, DARK_ICON],
  });
  
  const finalColor = color || (isFocused ? colors.background : interpolatedColor);
  
  return (
    <Animated.View style={[styles.container, style]}>
      <Ionicons 
        name={name} 
        size={size} 
        color={finalColor}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default GlassAwareIcon;

