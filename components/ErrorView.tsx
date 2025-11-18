/**
 * Error View Component
 * Displays error messages with retry functionality and smooth entrance animations
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';
import { Spacing, Typography, Motion } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface ErrorViewProps {
  message?: string;
  title?: string;
  onRetry?: () => void;
  variant?: 'network' | 'generic' | 'notFound' | 'permission';
  showRetry?: boolean;
}

const errorConfig = {
  network: {
    icon: 'cloud-offline-outline' as const,
    title: 'Network Error',
    defaultMessage: 'Unable to connect to the server. Please check your internet connection and try again.',
    colorKey: 'warning' as const,
  },
  generic: {
    icon: 'alert-circle-outline' as const,
    title: 'Something Went Wrong',
    defaultMessage: 'An unexpected error occurred. Please try again later.',
    colorKey: 'error' as const,
  },
  notFound: {
    icon: 'search-outline' as const,
    title: 'Not Found',
    defaultMessage: "The content you're looking for doesn't exist or has been removed.",
    colorKey: 'textSecondary' as const,
  },
  permission: {
    icon: 'lock-closed-outline' as const,
    title: 'Access Denied',
    defaultMessage: "You don't have permission to view this content.",
    colorKey: 'warning' as const,
  },
};

/**
 * Full-screen error view with retry button and entrance animation
 */
export function ErrorView({
  message,
  title,
  onRetry,
  variant = 'generic',
  showRetry = true,
}: ErrorViewProps) {
  const { colors } = useTheme();
  const config = errorConfig[variant] || errorConfig.generic;
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const iconBounceAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: Motion.timing.entrance.duration,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        ...Motion.spring.gentle,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Icon bounce after entrance
      Animated.sequence([
        Animated.spring(iconBounceAnim, {
          toValue: -10,
          ...Motion.spring.bouncy,
          useNativeDriver: true,
        }),
        Animated.spring(iconBounceAnim, {
          toValue: 0,
          ...Motion.spring.bouncy,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
      >
        <GlassCard elevated padding="lg" style={styles.errorCard}>
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [{ translateY: iconBounceAnim }],
              },
            ]}
          >
            <Ionicons
              name={config.icon}
              size={64}
              color={colors[config.colorKey]}
            />
          </Animated.View>

          <Text
            style={[
              styles.title,
              {
                color: colors.textPrimary,
                fontSize: Typography.size.h2,
                fontWeight: Typography.weight.bold,
              },
            ]}
          >
            {title || config.title}
          </Text>

          <Text
            style={[
              styles.message,
              {
                color: colors.textSecondary,
                fontSize: Typography.size.body,
                lineHeight: Typography.lineHeight.body,
              },
            ]}
          >
            {message || config.defaultMessage}
          </Text>

          {showRetry && onRetry && (
            <GlassButton
              onPress={onRetry}
              variant="primary"
              style={styles.button}
            >
              Try Again
            </GlassButton>
          )}
        </GlassCard>
      </Animated.View>
    </View>
  );
}

/**
 * Inline error message (smaller, for use within other components)
 */
export function InlineError({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.inlineContainer}>
      <View style={styles.inlineContent}>
        <Ionicons
          name="alert-circle"
          size={20}
          color={colors.danger}
          style={styles.inlineIcon}
        />
        <Text
          style={[
            styles.inlineMessage,
            {
              color: colors.danger,
              fontSize: Typography.size.body2,
            },
          ]}
        >
          {message}
        </Text>
      </View>
      {onRetry && (
        <GlassButton
          onPress={onRetry}
          variant="secondary"
          style={styles.inlineButton}
        >
          Retry
        </GlassButton>
      )}
    </View>
  );
}

/**
 * Empty state view (no content available) with entrance animation
 */
export function EmptyState({
  icon = 'file-tray-outline',
  title = 'No Content',
  message = "There's nothing here yet.",
  actionLabel,
  onAction,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const { colors } = useTheme();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;
  const iconFloatAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: Motion.timing.entrance.duration,
        useNativeDriver: true,
      }),
      Animated.spring(translateYAnim, {
        toValue: 0,
        ...Motion.spring.gentle,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Gentle floating animation for icon
      Animated.loop(
        Animated.sequence([
          Animated.timing(iconFloatAnim, {
            toValue: -8,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(iconFloatAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.emptyContent,
          {
            opacity: fadeAnim,
            transform: [{ translateY: translateYAnim }],
          },
        ]}
      >
        <Animated.View
          style={{
            transform: [{ translateY: iconFloatAnim }],
          }}
        >
          <Ionicons
            name={icon}
            size={64}
            color={colors.textSecondary}
            style={styles.emptyIcon}
          />
        </Animated.View>

        <Text
          style={[
            styles.emptyTitle,
            {
              color: colors.textPrimary,
              fontSize: Typography.size.h3,
              fontWeight: Typography.weight.bold,
            },
          ]}
        >
          {title}
        </Text>

        <Text
          style={[
            styles.emptyMessage,
            {
              color: colors.textSecondary,
              fontSize: Typography.size.body,
            },
          ]}
        >
          {message}
        </Text>

        {actionLabel && onAction && (
          <GlassButton
            onPress={onAction}
            variant="primary"
            style={styles.button}
          >
            {actionLabel}
          </GlassButton>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorCard: {
    maxWidth: 400,
    width: '100%',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: Spacing.xl,
  },
  title: {
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  message: {
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  button: {
    width: '100%',
    marginTop: Spacing.md,
  },
  
  // Inline error
  inlineContainer: {
    padding: Spacing.md,
  },
  inlineContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  inlineIcon: {
    marginRight: Spacing.sm,
  },
  inlineMessage: {
    flex: 1,
  },
  inlineButton: {
    alignSelf: 'flex-start',
  },
  
  // Empty state
  emptyContent: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  emptyIcon: {
    marginBottom: Spacing.xl,
    opacity: 0.4,
  },
  emptyTitle: {
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  emptyMessage: {
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
});

export default ErrorView;

