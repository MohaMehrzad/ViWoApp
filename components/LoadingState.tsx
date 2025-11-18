/**
 * Loading State Component
 * Displays loading indicators and skeleton screens with smooth animations
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { GlassCard } from './GlassCard';
import { Spacing, Motion, Layout } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface LoadingStateProps {
  variant?: 'spinner' | 'skeleton';
  count?: number;
}

/**
 * Skeleton for post cards with shimmer animation
 */
function SkeletonPost({ index = 0 }: { index?: number }) {
  const { colors, isDark } = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Staggered fade-in entrance
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: Motion.timing.entrance.duration,
      delay: index * 100,
      useNativeDriver: true,
    }).start();
    
    // Continuous shimmer loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [index]);
  
  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });
  
  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.5, 0.3],
  });
  
  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <GlassCard padding="md" style={styles.skeletonCard}>
        <View style={styles.skeletonHeader}>
          <View
            style={[
              styles.skeletonAvatar,
              { backgroundColor: colors.glassFill },
            ]}
          >
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: isDark 
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(255, 255, 255, 0.5)',
                  opacity: shimmerOpacity,
                  transform: [{ translateX: shimmerTranslate }],
                },
              ]}
            />
          </View>
          <View style={styles.skeletonHeaderText}>
            <View
              style={[
                styles.skeletonTextLine,
                styles.skeletonName,
                { backgroundColor: colors.glassFill, overflow: 'hidden' },
              ]}
            >
              <Animated.View
                style={[
                  StyleSheet.absoluteFill,
                  {
                    backgroundColor: isDark 
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(255, 255, 255, 0.5)',
                    opacity: shimmerOpacity,
                    transform: [{ translateX: shimmerTranslate }],
                  },
                ]}
              />
            </View>
            <View
              style={[
                styles.skeletonTextLine,
                styles.skeletonTime,
                { backgroundColor: colors.glassFill, overflow: 'hidden' },
              ]}
            >
              <Animated.View
                style={[
                  StyleSheet.absoluteFill,
                  {
                    backgroundColor: isDark 
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(255, 255, 255, 0.5)',
                    opacity: shimmerOpacity,
                    transform: [{ translateX: shimmerTranslate }],
                  },
                ]}
              />
            </View>
          </View>
        </View>
        
        <View
          style={[
            styles.skeletonContent,
            { backgroundColor: colors.glassFill, overflow: 'hidden' },
          ]}
        >
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: isDark 
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'rgba(255, 255, 255, 0.5)',
                opacity: shimmerOpacity,
                transform: [{ translateX: shimmerTranslate }],
              },
            ]}
          />
        </View>
        
        <View style={styles.skeletonActions}>
          {[1, 2, 3, 4].map((i) => (
            <View
              key={i}
              style={[
                styles.skeletonAction,
                { backgroundColor: colors.glassFill, overflow: 'hidden' },
              ]}
            >
              <Animated.View
                style={[
                  StyleSheet.absoluteFill,
                  {
                    backgroundColor: isDark 
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(255, 255, 255, 0.5)',
                    opacity: shimmerOpacity,
                    transform: [{ translateX: shimmerTranslate }],
                  },
                ]}
              />
            </View>
          ))}
        </View>
      </GlassCard>
    </Animated.View>
  );
}

/**
 * Skeleton for notification items with shimmer animation
 */
function SkeletonNotification({ index = 0 }: { index?: number }) {
  const { colors, isDark } = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Staggered fade-in entrance
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: Motion.timing.entrance.duration,
      delay: index * 80,
      useNativeDriver: true,
    }).start();
    
    // Continuous shimmer loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [index]);
  
  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });
  
  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.5, 0.3],
  });
  
  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <GlassCard padding="md" style={styles.skeletonCard}>
        <View style={styles.skeletonNotificationRow}>
          <View
            style={[
              styles.skeletonIcon,
              { backgroundColor: colors.glassFill, overflow: 'hidden' },
            ]}
          >
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: isDark 
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(255, 255, 255, 0.5)',
                  opacity: shimmerOpacity,
                  transform: [{ translateX: shimmerTranslate }],
                },
              ]}
            />
          </View>
          <View style={styles.skeletonNotificationText}>
            <View
              style={[
                styles.skeletonTextLine,
                styles.skeletonNotificationTitle,
                { backgroundColor: colors.glassFill, overflow: 'hidden' },
              ]}
            >
              <Animated.View
                style={[
                  StyleSheet.absoluteFill,
                  {
                    backgroundColor: isDark 
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(255, 255, 255, 0.5)',
                    opacity: shimmerOpacity,
                    transform: [{ translateX: shimmerTranslate }],
                  },
                ]}
              />
            </View>
            <View
              style={[
                styles.skeletonTextLine,
                styles.skeletonNotificationBody,
                { backgroundColor: colors.glassFill, overflow: 'hidden' },
              ]}
            >
              <Animated.View
                style={[
                  StyleSheet.absoluteFill,
                  {
                    backgroundColor: isDark 
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(255, 255, 255, 0.5)',
                    opacity: shimmerOpacity,
                    transform: [{ translateX: shimmerTranslate }],
                  },
                ]}
              />
            </View>
          </View>
        </View>
      </GlassCard>
    </Animated.View>
  );
}

/**
 * Skeleton for message threads with shimmer animation
 */
function SkeletonMessage({ index = 0 }: { index?: number }) {
  const { colors, isDark } = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Staggered fade-in entrance
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: Motion.timing.entrance.duration,
      delay: index * 80,
      useNativeDriver: true,
    }).start();
    
    // Continuous shimmer loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [index]);
  
  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });
  
  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.5, 0.3],
  });
  
  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <GlassCard padding="md" style={styles.skeletonCard}>
        <View style={styles.skeletonMessageRow}>
          <View
            style={[
              styles.skeletonAvatar,
              { backgroundColor: colors.glassFill, overflow: 'hidden' },
            ]}
          >
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: isDark 
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(255, 255, 255, 0.5)',
                  opacity: shimmerOpacity,
                  transform: [{ translateX: shimmerTranslate }],
                },
              ]}
            />
          </View>
          <View style={styles.skeletonMessageText}>
            <View
              style={[
                styles.skeletonTextLine,
                styles.skeletonName,
                { backgroundColor: colors.glassFill, overflow: 'hidden' },
              ]}
            >
              <Animated.View
                style={[
                  StyleSheet.absoluteFill,
                  {
                    backgroundColor: isDark 
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(255, 255, 255, 0.5)',
                    opacity: shimmerOpacity,
                    transform: [{ translateX: shimmerTranslate }],
                  },
                ]}
              />
            </View>
            <View
              style={[
                styles.skeletonTextLine,
                styles.skeletonMessageBody,
                { backgroundColor: colors.glassFill, overflow: 'hidden' },
              ]}
            >
              <Animated.View
                style={[
                  StyleSheet.absoluteFill,
                  {
                    backgroundColor: isDark 
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(255, 255, 255, 0.5)',
                    opacity: shimmerOpacity,
                    transform: [{ translateX: shimmerTranslate }],
                  },
                ]}
              />
            </View>
          </View>
          <View
            style={[
              styles.skeletonBadge,
              { backgroundColor: colors.glassFill, overflow: 'hidden' },
            ]}
          >
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: isDark 
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(255, 255, 255, 0.5)',
                  opacity: shimmerOpacity,
                  transform: [{ translateX: shimmerTranslate }],
                },
              ]}
            />
          </View>
        </View>
      </GlassCard>
    </Animated.View>
  );
}

/**
 * Main Loading State Component
 */
export function LoadingState({ variant = 'spinner', count = 3 }: LoadingStateProps) {
  const { colors } = useTheme();

  if (variant === 'spinner') {
    return (
      <View style={styles.spinnerContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  // Skeleton variant
  return (
    <View style={styles.skeletonContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonPost key={index} />
      ))}
    </View>
  );
}

/**
 * Loading state specifically for post feed
 */
export function LoadingPosts({ count = 3 }: { count?: number }) {
  return (
    <View style={styles.skeletonContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonPost key={index} index={index} />
      ))}
    </View>
  );
}

/**
 * Loading state specifically for notifications
 */
export function LoadingNotifications({ count = 5 }: { count?: number }) {
  return (
    <View style={styles.skeletonContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonNotification key={index} index={index} />
      ))}
    </View>
  );
}

/**
 * Loading state specifically for messages
 */
export function LoadingMessages({ count = 4 }: { count?: number }) {
  return (
    <View style={styles.skeletonContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonMessage key={index} index={index} />
      ))}
    </View>
  );
}

/**
 * Simple spinner for inline loading
 */
export function LoadingSpinner({ size = 'large' }: { size?: 'small' | 'large' }) {
  const { colors } = useTheme();
  
  return (
    <View style={styles.spinnerContainer}>
      <ActivityIndicator size={size} color={colors.accent} />
    </View>
  );
}

const styles = StyleSheet.create({
  spinnerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  skeletonContainer: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  skeletonCard: {
    marginBottom: 0,
  },
  
  // Post skeleton
  skeletonHeader: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  skeletonAvatar: {
    width: Layout.avatar.small,
    height: Layout.avatar.small,
    borderRadius: Layout.avatar.small / 2,
    opacity: 0.25,
  },
  skeletonHeaderText: {
    marginLeft: Spacing.sm,
    flex: 1,
    gap: Spacing.xs,
  },
  skeletonTextLine: {
    height: 12,
    borderRadius: 6,
    opacity: 0.25,
  },
  skeletonName: {
    width: '40%',
  },
  skeletonTime: {
    width: '20%',
  },
  skeletonContent: {
    height: 60,
    borderRadius: 12,
    marginBottom: Spacing.md,
    opacity: 0.25,
  },
  skeletonActions: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  skeletonAction: {
    width: 50,
    height: 20,
    borderRadius: 10,
    opacity: 0.25,
  },
  
  // Notification skeleton
  skeletonNotificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skeletonIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: Spacing.sm,
  },
  skeletonNotificationText: {
    flex: 1,
    gap: Spacing.xs,
  },
  skeletonNotificationTitle: {
    width: '60%',
  },
  skeletonNotificationBody: {
    width: '80%',
  },
  
  // Message skeleton
  skeletonMessageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skeletonMessageText: {
    flex: 1,
    marginLeft: Spacing.sm,
    gap: Spacing.xs,
  },
  skeletonMessageBody: {
    width: '70%',
  },
  skeletonBadge: {
    width: 24,
    height: 12,
    borderRadius: 6,
    marginLeft: Spacing.sm,
  },
});

export default LoadingState;

