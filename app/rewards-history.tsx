import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useInfiniteQuery } from '@tanstack/react-query';
import { GlassCard } from '@/components/GlassCard';
import { LoadingSpinner } from '@/components/LoadingState';
import { ErrorView, EmptyState } from '@/components/ErrorView';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, Typography } from '@/constants/theme';
import { rewardsApi, Reward } from '@/services/api/rewards';
import { formatVCoinBalance } from '@/utils/formatters';
import { LucideIcons } from '@/utils/iconMapping';
import { useAutoUpdateTime } from '@/hooks/useAutoUpdateTime';

interface RewardItemProps {
  reward: Reward;
}

function RewardItem({ reward }: RewardItemProps) {
  const { colors } = useTheme();
  const relativeTime = useAutoUpdateTime(new Date(reward.createdAt).getTime());

  return (
    <GlassCard padding="md" style={styles.rewardCard}>
      <View style={styles.rewardContent}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: colors.success + '20' },
          ]}
        >
          <LucideIcons.gift size={24} color={colors.success} strokeWidth={2} />
        </View>
        <View style={styles.rewardInfo}>
          <Text
            style={[
              styles.reason,
              {
                color: colors.textPrimary,
                fontSize: Typography.size.body,
                fontWeight: Typography.weight.semibold,
              },
            ]}
          >
            {reward.reason}
          </Text>
          <Text
            style={[
              styles.timestamp,
              { color: colors.textSecondary, fontSize: Typography.size.caption },
            ]}
          >
            {relativeTime}
          </Text>
        </View>
        <Text
          style={[
            styles.amount,
            {
              color: colors.success,
              fontSize: Typography.size.body,
              fontWeight: Typography.weight.bold,
            },
          ]}
        >
          +{formatVCoinBalance(reward.amount)}
        </Text>
      </View>
    </GlassCard>
  );
}

export default function RewardsHistoryScreen() {
  const { colors } = useTheme();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ['rewards', 'history'],
    queryFn: ({ pageParam = 1 }) => rewardsApi.getHistory(pageParam, 20),
    getNextPageParam: (lastPage, pages) => {
      const hasMore = lastPage.rewards.length === 20;
      return hasMore ? pages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });

  const rewards = data?.pages.flatMap((page) => page.rewards) ?? [];
  const totalEarned = rewards.reduce((sum, reward) => sum + reward.amount, 0);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LoadingSpinner />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ErrorView
          variant="network"
          onRetry={() => refetch()}
          message="Failed to load rewards history."
        />
      </View>
    );
  }

  const renderReward = ({ item }: { item: Reward }) => <RewardItem reward={item} />;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Total Earned Header */}
      <GlassCard padding="lg" style={styles.totalCard}>
        <Text
          style={[
            styles.totalLabel,
            { color: colors.textSecondary, fontSize: Typography.size.body2 },
          ]}
        >
          Total Rewards Earned
        </Text>
        <Text
          style={[
            styles.totalAmount,
            { color: colors.success, fontSize: Typography.size.h1, fontWeight: Typography.weight.bold },
          ]}
        >
          {formatVCoinBalance(totalEarned)}
        </Text>
      </GlassCard>

      {/* Rewards List */}
      {rewards.length > 0 ? (
        <FlatList
          data={rewards}
          renderItem={renderReward}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => refetch()}
              tintColor={colors.accent}
            />
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={styles.loadingMore}>
                <Text style={{ color: colors.textSecondary }}>Loading more...</Text>
              </View>
            ) : null
          }
        />
      ) : (
        <EmptyState
          icon="gift-outline"
          title="No Rewards Yet"
          message="Keep engaging with content to earn rewards!"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  totalCard: {
    margin: Spacing.md,
    alignItems: 'center',
  },
  totalLabel: {
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  totalAmount: {
    letterSpacing: -1,
  },
  list: {
    padding: Spacing.md,
    paddingTop: 0,
  },
  rewardCard: {
    marginBottom: Spacing.sm,
  },
  rewardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  rewardInfo: {
    flex: 1,
  },
  reason: {},
  timestamp: {
    marginTop: 2,
  },
  amount: {
    marginLeft: Spacing.sm,
  },
  loadingMore: {
    padding: Spacing.md,
    alignItems: 'center',
  },
});

