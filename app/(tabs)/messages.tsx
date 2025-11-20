import { GlassCard } from '@/components/GlassCard';
import { LoadingMessages } from '@/components/LoadingState';
import { ErrorView, EmptyState } from '@/components/ErrorView';
import { Layout, Spacing, Typography } from '@/constants/theme';
import { useScreenLayout } from '@/hooks/useScreenLayout';
import { useTheme } from '@/hooks/useTheme';
import { useMessageThreads } from '@/hooks/useMessages';
import { useAuth } from '@/contexts/AuthContext';
import { getRelativeTime } from '@/utils/formatters';
import { LucideIcons } from '@/utils/iconMapping';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

// Create animated GlassCard component
const AnimatedGlassCard = Animated.createAnimatedComponent(GlassCard);

export default function MessagesScreen() {
  const { colors } = useTheme();
  const { headerHeight, contentPaddingBottom } = useScreenLayout();
  const { user: currentUser } = useAuth();
  const router = useRouter();
  
  const {
    data: threads,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useMessageThreads();

  const handleRetry = () => {
    refetch();
  };

  const handleThreadPress = (threadId: string) => {
    router.push(`/chat/${threadId}`);
  };

  const renderThread = ({ item, index }: { item: any; index: number }) => {
    // Get the other participant (not current user)
    const otherParticipant = item.participants?.find((p: any) => p.id !== currentUser?.id) || item.participants?.[0];
    
    if (!otherParticipant) return null;

    return (
      <AnimatedGlassCard
        padding="md"
        interactive
        useBlur={false}
        style={styles.threadCard}
        entering={FadeIn.duration(300).delay(index * 50)}
        onPress={() => handleThreadPress(item.id)}
      >
        <View style={styles.threadContent}>
          {/* Avatar */}
          <View
            style={[
              styles.avatar,
              { backgroundColor: colors.glassFill },
            ]}
          >
            <LucideIcons.user size={24} color={colors.accent} strokeWidth={2} />
          </View>

          {/* Content */}
          <View style={styles.messageContent}>
            <Text
              style={[
                styles.name,
                {
                  color: colors.textPrimary,
                  fontSize: Typography.size.body,
                  fontWeight: Typography.weight.semibold,
                },
              ]}
              selectable={false}
            >
              {otherParticipant.displayName}
            </Text>
            {item.lastMessage && (
              <Text
                style={[
                  styles.lastMessage,
                  {
                    color: item.unreadCount > 0 ? colors.textPrimary : colors.textSecondary,
                    fontSize: Typography.size.body2,
                    fontWeight: item.unreadCount > 0 ? Typography.weight.medium : Typography.weight.regular,
                  },
                ]}
                numberOfLines={1}
                selectable={false}
              >
                {item.lastMessage.content}
              </Text>
            )}
          </View>

          {/* Right side */}
          <View style={styles.rightSection}>
            {item.lastMessage && (
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
                {getRelativeTime(new Date(item.lastMessage.createdAt).getTime())}
              </Text>
            )}
            {item.unreadCount > 0 && (
              <View
                style={[
                  styles.unreadDot,
                  { backgroundColor: colors.accent },
                ]}
              />
            )}
          </View>
        </View>
      </AnimatedGlassCard>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.loadingContainer, { paddingTop: headerHeight }]}>
          <LoadingMessages count={4} />
        </View>
      </View>
    );
  }

  // Error state
  if (isError) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ErrorView
          variant="network"
          onRetry={handleRetry}
          message="Unable to load messages. Please try again."
        />
      </View>
    );
  }

  // Empty state
  if (!threads || threads.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState
          icon="chatbubbles-outline"
          title="No Messages Yet"
          message="Start a conversation with someone!"
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={threads}
        renderItem={renderThread}
        keyExtractor={(item, index) => item?.id ? `${item.id}-${index}` : `thread-${index}`}
        contentContainerStyle={[
          styles.list,
          {
            paddingTop: headerHeight + Spacing.md,
            paddingBottom: contentPaddingBottom,
          },
        ]}
        style={{ backgroundColor: colors.background }}
        // Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        initialNumToRender={5}
        windowSize={5}
        updateCellsBatchingPeriod={50}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
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
  threadCard: {
    marginBottom: Spacing.md,
  },
  threadContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: Layout.avatar.medium,
    height: Layout.avatar.medium,
    borderRadius: Layout.avatar.medium / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  avatarEmoji: {
    fontSize: 20,
  },
  messageContent: {
    flex: 1,
  },
  name: {
    marginBottom: 2,
  },
  lastMessage: {
    marginTop: 2,
  },
  rightSection: {
    alignItems: 'flex-end',
    marginLeft: Spacing.sm,
  },
  timestamp: {
    marginBottom: 4,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
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

