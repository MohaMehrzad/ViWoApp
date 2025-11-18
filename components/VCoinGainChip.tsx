import { Motion, Radius, Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { formatVCoinAmount } from '@/utils/formatters';
import { BlurView } from '@react-native-community/blur';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

interface VCoinGainChipProps {
  amount: number;
  onComplete?: () => void;
}

export function VCoinGainChip({ amount, onComplete }: VCoinGainChipProps) {
  const { colors, blurType, glassFill } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;
  const translateXAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let isMounted = true;
    
    // Enhanced animation with arc motion and pulse
    const animation = Animated.sequence([
      // Entrance: Scale + fade in (200ms)
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1.1,
          ...Motion.spring.bouncy,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: Motion.duration.fast,
          useNativeDriver: true,
        }),
      ]),
      // Pulse effect (150ms)
      Animated.spring(pulseAnim, {
        toValue: 1.15,
        ...Motion.spring.bouncy,
        useNativeDriver: true,
      }),
      Animated.spring(pulseAnim, {
        toValue: 1,
        ...Motion.spring.bouncy,
        useNativeDriver: true,
      }),
      // Hold for readability (500ms)
      Animated.delay(500),
      // Float up with arc motion and fade out (800ms)
      Animated.parallel([
        // Arc path: move up
        Animated.timing(translateYAnim, {
          toValue: -140,
          duration: 800,
          useNativeDriver: true,
        }),
        // Arc path: slight horizontal movement for natural arc
        Animated.sequence([
          Animated.timing(translateXAnim, {
            toValue: 20,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(translateXAnim, {
            toValue: 30,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        // Scale down slightly while floating
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 800,
          useNativeDriver: true,
        }),
        // Fade out
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 600,
          delay: 200,
          useNativeDriver: true,
        }),
      ]),
    ]);
    
    animation.start(() => {
      if (isMounted) {
        onComplete?.();
      }
    });

    // Cleanup: stop animation if component unmounts
    return () => {
      isMounted = false;
      animation.stop();
    };
    // onComplete is intentionally excluded from deps to prevent re-triggering animation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const combinedScale = Animated.multiply(scaleAnim, pulseAnim);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { scale: combinedScale },
            { translateY: translateYAnim },
            { translateX: translateXAnim },
          ],
          opacity: opacityAnim,
          overflow: 'hidden',
          borderRadius: Radius.lg,
        },
      ]}
    >
      <BlurView
        blurType={blurType}
        blurAmount={20}
        reducedTransparencyFallbackColor="transparent"
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: Radius.lg,
            borderWidth: 1.5,
            borderColor: colors.success + '80',
          },
        ]}
        pointerEvents="none"
      />
      <Text
        style={[
          styles.text,
          {
            color: colors.success,
            fontSize: Typography.size.body2,
            fontWeight: Typography.weight.bold,
          },
        ]}
      >
        +{formatVCoinAmount(amount)} VCN
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    minWidth: 80,
  },
  text: {
    position: 'relative',
    zIndex: 1,
    letterSpacing: 0.5,
  },
});

