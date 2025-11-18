import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { GlassCard } from '@/components/GlassCard';
import { LoadingSpinner } from '@/components/LoadingState';
import { ErrorView } from '@/components/ErrorView';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, Typography } from '@/constants/theme';
import { rewardsApi, LeaderboardEntry } from '@/services/api/rewards';
import { formatVCoinBalance } from '@/utils/formatters';
import { LucideIcons } from '@/utils/iconMapping';

interface LeaderboardItemProps {
  entry: LeaderboardEntry;
  onPress: () => void;
}

function LeaderboardItem({ entry, onPress }: LeaderboardItemProps) {
  const { colors } = useTheme();

  const getRankColor = (rank: number) => {
    if (rank === 1) return colors.warning; // Gold
    if (rank === 2) return colors.textSecondary; // Silver
    if (rank === 3) return colors.warningDark; // Bronze
    return colors.textSecondary;
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3) return 'trophy';
    return 'chevron-forward';
  };

  return (
    <Pressable onPress={onPress}>
      <GlassCard padding="md" style={styles.leaderboardCard}>
        <View style={styles.rankContainer}>
          <Text
            style={[
              styles.rankNumber,
              {
                color: getRankColor(entry.rank),
                fontSize: Typography.size.h3,
                fontWeight: Typography.weight.bold,
              },
            ]}
          >
            {entry.rank}
          </Text>
          <LucideIcons.trophy size={20} color={getRankColor(entry.rank)} strokeWidth={2} />
        </View>

        <View
          style={[
            styles.avatar,
            { backgroundColor: colors.accent + '20' },
          ]}
        >
          <LucideIcons.user size={20} color={colors.accent} strokeWidth={2} />
        </View>

        <View style={styles.userInfo}>
          <Text
            style={[
              styles.displayName,
              {
                color: colors.textPrimary,
                fontSize: Typography.size.body,
                fontWeight: Typography.weight.semibold,
              },
            ]}
          >
            {entry.user.displayName}
          </Text>
          <Text
            style={[
              styles.username,
              { color: colors.textSecondary, fontSize: Typography.size.caption },
            ]}
          >
            @{entry.user.username}
          </Text>
        </View>

        <View style={styles.earningsContainer}>
          <LucideIcons.trendingUp size={16} color={colors.success} strokeWidth={2} />
          <Text
            style={[
              styles.earnings,
              {
                color: colors.success,
                fontSize: Typography.size.body,
                fontWeight: Typography.weight.bold,
              },
            ]}
          >
            {formatVCoinBalance(entry.totalEarned)}
          </Text>
        </View>
      </GlassCard>
    </Pressable>
  );
}

export default function LeaderboardScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  const { data: leaderboard, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['rewards', 'leaderboard', timeframe],
    queryFn: () => rewardsApi.getLeaderboard(timeframe),
  });

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
          message="Failed to load leaderboard."
        />
      </View>
    );
  }

  const renderEntry = ({ item }: { item: LeaderboardEntry }) => (
    <LeaderboardItem entry={item} onPress={() => router.push(`/profile/${item.userId}`)} />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Timeframe Filter */}
      <View style={styles.filterContainer}>
        <GlassCard padding="xs" style={styles.filterCard}>
          <View style={styles.filterButtons}>
            {(['daily', 'weekly', 'monthly'] as const).map((tf) => (
              <Pressable
                key={tf}
                onPress={() => setTimeframe(tf)}
                style={[
                  styles.filterButton,
                  {
                    backgroundColor:
                      timeframe === tf ? colors.accent : 'transparent',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    {
                      color: timeframe === tf ? colors.background : colors.textPrimary,
                      fontSize: Typography.size.body2,
                      fontWeight: Typography.weight.semibold,
                    },
                  ]}
                >
                  {tf.charAt(0).toUpperCase() + tf.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
        </GlassCard>
      </View>

      {/* Leaderboard List */}
      <FlatList
        data={leaderboard}
        renderItem={renderEntry}
        keyExtractor={(item) => item.userId}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
            tintColor={colors.accent}
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
  filterContainer: {
    padding: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  filterCard: {},
  filterButtons: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  filterButton: {
    flex: 1,
    padding: Spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  filterText: {},
  list: {
    padding: Spacing.md,
    paddingTop: Spacing.xs,
  },
  leaderboardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  rankContainer: {
    width: 50,
    alignItems: 'center',
  },
  rankNumber: {},
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
  },
  userInfo: {
    flex: 1,
  },
  displayName: {},
  username: {
    marginTop: 2,
  },
  earningsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  earnings: {},
});

