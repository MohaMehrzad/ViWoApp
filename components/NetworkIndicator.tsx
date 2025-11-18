/**
 * Network Indicator Component
 * Displays a banner when the device is offline
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from '@react-native-community/blur';
import { Typography, Spacing, LiquidGlass } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';

export function NetworkIndicator() {
  const [isOffline, setIsOffline] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-100));
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (isOffline) {
      // Slide in
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      // Slide out
      Animated.spring(slideAnim, {
        toValue: -100,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    }
  }, [isOffline, slideAnim]);

  if (!isOffline) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: insets.top,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.bannerContainer}>
        {Platform.OS !== 'web' ? (
          <BlurView
            blurType="dark"
            blurAmount={LiquidGlass.blur.intensity.default}
            reducedTransparencyFallbackColor="transparent"
            style={StyleSheet.absoluteFill}
          />
        ) : (
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: 'rgba(0, 0, 0, 0.8)' },
            ]}
          />
        )}

        <View style={styles.content}>
          <Ionicons
            name="cloud-offline"
            size={20}
            color={colors.warning}
            style={styles.icon}
          />
          <Text style={[styles.text, { color: colors.warning }]}>You're offline</Text>
          <Text style={[styles.subtext, { color: colors.textSecondary }]}>
            Check your internet connection
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingHorizontal: Spacing.md,
  },
  bannerContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 200, 87, 0.3)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  icon: {
    marginRight: Spacing.sm,
  },
  text: {
    flex: 1,
    fontSize: Typography.size.body2,
    fontWeight: Typography.weight.bold,
  },
  subtext: {
    fontSize: Typography.size.caption,
  },
});

/**
 * Hook to check network status
 * Returns isOffline boolean and network state
 */
export function useNetworkStatus() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });
    
    return unsubscribe;
  }, []);

  return { isOffline };
}

export default NetworkIndicator;

