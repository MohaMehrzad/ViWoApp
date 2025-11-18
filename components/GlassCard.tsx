import { getShadow, LiquidGlass, Motion, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useBlurPerformance } from '@/utils/performanceMonitor';
import { BlurView } from '@react-native-community/blur';
import React from 'react';
import { Animated, Platform, Pressable, StyleSheet, View, ViewStyle } from 'react-native';

type PaddingSize = 'sm' | 'md' | 'lg';

interface GlassCardProps {
  children: React.ReactNode;
  elevated?: boolean;
  padding?: PaddingSize;
  interactive?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  blurIntensity?: number;
  useBlur?: boolean;
}

const paddingMap: Record<PaddingSize, number> = {
  sm: Spacing.sm,
  md: Spacing.md,
  lg: Spacing.lg,
};

export function GlassCard({
  children,
  elevated = false,
  padding = 'md',
  interactive = false,
  onPress,
  style,
  blurIntensity = LiquidGlass.blur.intensity.default,
  useBlur = true,
}: GlassCardProps) {
  const { isDark, colors, glassFill, hairlineBorder, blurType } = useTheme();
  const [isHovered, setIsHovered] = React.useState(false);
  const shouldDisableBlur = useBlurPerformance();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const borderAnim = React.useRef(new Animated.Value(0)).current;

  const paddingValue = paddingMap[padding];
  const isInteractive = interactive || !!onPress;

  // Platform-specific blur handling with performance monitoring
  const isWeb = Platform.OS === 'web';
  const isAndroidEmulator = Platform.OS === 'android' && __DEV__;
  const useNativeBlur = !isWeb && !isAndroidEmulator && !shouldDisableBlur && useBlur;

  const handlePressIn = () => {
    if (isInteractive) {
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        ...Motion.spring.gentle,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (isInteractive) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        ...Motion.spring.gentle,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (isInteractive) {
      Animated.timing(borderAnim, {
        toValue: 1,
        duration: Motion.duration.fast,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (isInteractive) {
      Animated.timing(borderAnim, {
        toValue: 0,
        duration: Motion.duration.fast,
        useNativeDriver: false,
      }).start();
    }
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      hairlineBorder,
      isDark ? 'rgba(255, 255, 255, 0.35)' : 'rgba(0, 0, 0, 0.28)',
    ],
  });

  const CardWrapper = isInteractive ? Animated.View : View;
  const cardWrapperProps = isInteractive ? {
    style: [
      {
        transform: [{ scale: scaleAnim }],
      },
    ],
  } : {};

  // Full liquid glass implementation with @react-native-community/blur
  const cardContent = (
    <View
      style={[
        styles.container,
        {
          borderRadius: Radius.xl,
          overflow: 'hidden',
        },
        elevated && getShadow(LiquidGlass.shadow.elevation),
        style,
      ]}
      {...(isInteractive && isWeb
        ? {
            // @ts-ignore - Web only props
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave,
          }
        : {})}
    >
      {/* Pure glass blur - NO white fill (iOS Control Center style) */}
      {useNativeBlur ? (
        <BlurView
          blurType={blurType}
          blurAmount={blurIntensity}
          reducedTransparencyFallbackColor="transparent"
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: useBlur
                ? (isDark ? colors.androidTranslucentBg : colors.androidTranslucentBg)
                : colors.cardFallback,
              // @ts-ignore - Web only CSS properties
              ...(isWeb && useBlur && {
                backdropFilter: `blur(${blurIntensity}px)`,
                WebkitBackdropFilter: `blur(${blurIntensity}px)`,
              }),
            },
          ]}
        />
      )}

      {/* Hairline border for definition */}
      <Animated.View
        style={[
          styles.border,
          {
            borderRadius: Radius.xl,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: isInteractive ? borderColor : hairlineBorder,
          },
        ]}
      />

      {/* Content */}
      <View style={[styles.content, { padding: paddingValue }]}>
        {children}
      </View>
    </View>
  );

  if (isInteractive && onPress) {
    return (
      <CardWrapper {...cardWrapperProps}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={{ borderRadius: Radius.xl }}
        >
          {cardContent}
        </Pressable>
      </CardWrapper>
    );
  }

  return (
    <CardWrapper {...cardWrapperProps}>
      {cardContent}
    </CardWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  border: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
});

