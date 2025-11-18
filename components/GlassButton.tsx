import { LiquidGlass, Motion, Radius, Typography, Spacing, Layout } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { HapticFeedback } from '@/utils/haptics';
import { BlurView } from '@react-native-community/blur';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextStyle,
    View,
    ViewStyle
} from 'react-native';

interface GlassButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  blurIntensity?: number;
  variant?: 'primary' | 'secondary';
  hapticFeedback?: boolean;
}

export function GlassButton({
  onPress,
  children,
  disabled = false,
  loading = false,
  style,
  textStyle,
  blurIntensity = LiquidGlass.blur.intensity.default,
  variant = 'primary',
  hapticFeedback = true,
}: GlassButtonProps) {
  const { colors, isDark, blurType } = useTheme();
  const [scaleAnim] = useState(new Animated.Value(1));
  const [isFocused, setIsFocused] = React.useState(false);
  const spinAnim = React.useRef(new Animated.Value(0)).current;
  const isWeb = Platform.OS === 'web';

  // Loading spinner animation
  React.useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinAnim.setValue(0);
    }
  }, [loading, spinAnim]);

  const handlePressIn = () => {
    if (hapticFeedback && !disabled && !loading) {
      HapticFeedback.light();
    }
    
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      ...Motion.spring.snappy,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      ...Motion.spring.bouncy,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (!disabled && !loading) {
      onPress();
    }
  };

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
        },
        style,
      ]}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        {...(Platform.OS === 'web' && {
          // @ts-ignore - Web only props
          onFocus: () => setIsFocused(true),
          onBlur: () => setIsFocused(false),
        })}
        style={({ pressed }) => [
          styles.container,
          {
            borderRadius: Radius.lg,
            overflow: 'hidden',
            opacity: disabled || loading ? 0.5 : 1,
            ...((disabled || loading) && isWeb && {
              // @ts-ignore - Web only
              cursor: loading ? 'wait' : 'not-allowed',
            }),
          },
        ]}
      >
        {/* Pure glass blur - NO fill overlay */}
        {!isWeb ? (
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
                backgroundColor: isDark
                  ? colors.androidTranslucentBg
                  : colors.androidTranslucentBg,
                // @ts-ignore - Web only CSS
                backdropFilter: `blur(${blurIntensity}px)`,
                WebkitBackdropFilter: `blur(${blurIntensity}px)`,
              },
            ]}
          />
        )}

        {/* Simple border (no gradient, pure and clean) */}
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: Radius.lg,
              borderWidth: variant === 'primary' ? LiquidGlass.borderWidth.normal : StyleSheet.hairlineWidth,
              borderColor: isFocused && isWeb
                ? colors.accent
                : variant === 'primary' 
                  ? colors.accent + Math.round(LiquidGlass.accentBorderOpacity.strong * 255).toString(16).padStart(2, '0')
                  : colors.hairlineBorder,
            },
          ]}
          pointerEvents="none"
        />

        {/* Content */}
        <View style={styles.contentRow}>
          {loading && (
            <ActivityIndicator
              size="small"
              color={variant === 'primary' ? colors.textPrimary : colors.textPrimary}
              style={styles.spinner}
            />
          )}
          <Text
            style={[
              styles.text,
              {
                color: colors.textPrimary,
                fontSize: Typography.size.body,
                fontWeight: Typography.weight.bold,
                opacity: loading ? 0.6 : 1,
              },
              textStyle,
            ]}
          >
            {children}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: Layout.tapTargetMin + 4, // 48dp minimum tap target
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  text: {
    textAlign: 'center',
    position: 'relative',
    zIndex: 1,
  },
  spinner: {
    marginRight: 4,
  },
});

