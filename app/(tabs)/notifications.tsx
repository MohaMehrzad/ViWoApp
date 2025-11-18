import { GlassCard } from '@/components/GlassCard';
import { LoadingNotifications } from '@/components/LoadingState';
import { ErrorView, EmptyState } from '@/components/ErrorView';
import { Spacing, Typography } from '@/constants/theme';
import { useScreenLayout } from '@/hooks/useScreenLayout';
import { useTheme } from '@/hooks/useTheme';
import { getRelativeTime } from '@/utils/formatters';
import { LucideIcons } from '@/utils/iconMapping';
import React, { useState, useEffect } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

// Create animated GlassCard component
const AnimatedGlassCard = Animated.createAnimatedComponent(GlassCard);

// Mock notification data
const mockNotifications = [
  {
    id: '1',
    type: 'reward',
    title: 'You earned 2 VCN!',
    body: 'Someone shared your post',
    timestamp: Date.now() - 1000 * 60 * 5, // 5 mins ago
  },
  {
    id: '2',
    type: 'follow',
    title: 'New Follower',
    body: 'Alice started following you',
    timestamp: Date.now() - 1000 * 60 * 30, // 30 mins ago
  },
  {
    id: '3',
    type: 'mention',
    title: 'You were mentioned',
    body: 'Bob mentioned you in a post',
    timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
  },
];

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const { headerHeight, contentPaddingBottom } = useScreenLayout();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [notifications, setNotifications] = useState(mockNotifications);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) {
        setLoading(true);
      }
      setError(null);
      
      // Simulate API call - reduced delay for better UX
      await new Promise(resolve => setTimeout(resolve, isRefreshing ? 300 : 400));
      
      setNotifications(mockNotifications);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications(true);
  };

  const handleRetry = () => {
    loadNotifications();
  };

  const renderNotification = ({ item, index }: { item: typeof mockNotifications[0]; index: number }) => {
    const isReward = item.type === 'reward';

    return (
      <AnimatedGlassCard
        padding="md"
        interactive
        useBlur={false}
        style={styles.notificationCard}
        entering={FadeIn.duration(300).delay(index * 50)}
      >
        <View style={styles.notificationContent}>
          {isReward && (
            <LucideIcons.bitcoin
              size={24}
              color={colors.accent}
              strokeWidth={2}
              style={styles.icon}
            />
          )}
          <View style={styles.textContent}>
            <Text
              style={[
                styles.title,
                {
                  color: colors.textPrimary,
                  fontSize: Typography.size.body,
                  fontWeight: Typography.weight.bold,
                },
              ]}
              selectable={false}
            >
              {item.title}
            </Text>
            <Text
              style={[
                styles.body,
                {
                  color: colors.textSecondary,
                  fontSize: Typography.size.body2,
                },
              ]}
              selectable={false}
            >
              {item.body}
            </Text>
          </View>
          <Text
            style={[
              styles.timestamp,
              {
                color: colors.textSecondary,
                fontSize: Typography.size.caption,
              },
            ]}
            selectable={false}
          >
            {getRelativeTime(item.timestamp)}
          </Text>
        </View>
      </AnimatedGlassCard>
    );
  };

  if (mockNotifications.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyState}>
          <LucideIcons.gift
            size={64}
            color={colors.textSecondary}
            strokeWidth={2}
            style={styles.emptyIcon}
          />
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
            No notifications yet
          </Text>
          <Text
            style={[
              styles.emptySubtitle,
              {
                color: colors.textSecondary,
                fontSize: Typography.size.body2,
              },
            ]}
          >
            We'll notify you when something happens
          </Text>
        </View>
      </View>
    );
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.loadingContainer, { paddingTop: headerHeight }]}>
          <LoadingNotifications count={5} />
        </View>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ErrorView
          variant="network"
          onRetry={handleRetry}
          message="Unable to load notifications. Please try again."
        />
      </View>
    );
  }

  // Empty state
  if (notifications.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState
          icon="notifications-outline"
          title="No Notifications"
          message="You're all caught up! Check back later for updates."
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item, index) => item?.id ? `${item.id}-${index}` : `notification-${index}`}
        contentContainerStyle={[
          styles.list,
          {
            paddingTop: headerHeight + Spacing.md,
            paddingBottom: contentPaddingBottom,
          },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
            progressBackgroundColor={colors.background}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
  },
  list: {
    padding: Spacing.md,
    // paddingTop and paddingBottom set dynamically via contentContainerStyle
  },
  notificationCard: {
    marginBottom: Spacing.md,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icon: {
    marginRight: Spacing.sm,
  },
  textContent: {
    flex: 1,
  },
  title: {
    marginBottom: 2,
  },
  body: {
    marginTop: 2,
  },
  timestamp: {
    marginLeft: Spacing.sm,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyIcon: {
    marginBottom: Spacing.md,
    opacity: 0.5,
  },
  emptyTitle: {
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    textAlign: 'center',
  },
});

