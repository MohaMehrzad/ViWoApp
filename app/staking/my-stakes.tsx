import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GlassCard } from '@/components/GlassCard';
import { GlassButton } from '@/components/GlassButton';
import { LoadingSpinner } from '@/components/LoadingState';
import { ErrorView, EmptyState } from '@/components/ErrorView';
import { useVCoin } from '@/contexts/VCoinContext';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, Typography } from '@/constants/theme';
import { stakingApi, Stake } from '@/services/api/staking';
import { formatVCoinBalance } from '@/utils/formatters';
import { LucideIcons } from '@/utils/iconMapping';

interface StakeItemProps {
  stake: Stake;
  onUnstake: () => void;
  isUnstaking: boolean;
}

function StakeItem({ stake, onUnstake, isUnstaking }: StakeItemProps) {
  const { colors } = useTheme();

  const isActive = stake.status === 'ACTIVE';
  const canUnstake = new Date(stake.endDate) <= new Date();
  const daysRemaining = Math.max(
    0,
    Math.ceil((new Date(stake.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );

  return (
    <GlassCard padding="md" style={styles.stakeCard}>
      <View style={styles.stakeHeader}>
        <View style={styles.stakeInfo}>
          <Text
            style={[
              styles.stakeAmount,
              {
                color: colors.textPrimary,
                fontSize: Typography.size.h3,
                fontWeight: Typography.weight.bold,
              },
            ]}
          >
            {formatVCoinBalance(stake.amount)}
          </Text>
          <Text
            style={[
              styles.stakeApy,
              { color: colors.accent, fontSize: Typography.size.body2 },
            ]}
          >
            {stake.apy}% APY
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                stake.status === 'ACTIVE'
                  ? colors.success + '20'
                  : colors.textSecondary + '20',
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              {
                color: stake.status === 'ACTIVE' ? colors.success : colors.textSecondary,
                fontSize: Typography.size.caption,
              },
            ]}
          >
            {stake.status}
          </Text>
        </View>
      </View>

      <View style={styles.stakeDetails}>
        <View style={styles.detailRow}>
          <LucideIcons.calendar size={16} color={colors.textSecondary} strokeWidth={2} />
          <Text
            style={[
              styles.detailText,
              { color: colors.textSecondary, fontSize: Typography.size.caption },
            ]}
          >
            Duration: {stake.duration} days
          </Text>
        </View>

        {isActive && daysRemaining > 0 && (
          <View style={styles.detailRow}>
            <LucideIcons.clock size={16} color={colors.textSecondary} strokeWidth={2} />
            <Text
              style={[
                styles.detailText,
                { color: colors.textSecondary, fontSize: Typography.size.caption },
              ]}
            >
              {daysRemaining} days remaining
            </Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <LucideIcons.trophy size={16} color={colors.accent} strokeWidth={2} />
          <Text
            style={[
              styles.detailText,
              { color: colors.accent, fontSize: Typography.size.caption },
            ]}
          >
            Earned: +{stake.earnedRewards.toFixed(2)} VCN
          </Text>
        </View>
      </View>

      {isActive && canUnstake && (
        <GlassButton
          onPress={onUnstake}
          variant="primary"
          loading={isUnstaking}
          style={styles.unstakeButton}
        >
          Unstake
        </GlassButton>
      )}

      {isActive && !canUnstake && (
        <Text
          style={[
            styles.lockedText,
            { color: colors.textSecondary, fontSize: Typography.size.caption },
          ]}
        >
          Locked until {new Date(stake.endDate).toLocaleDateString()}
        </Text>
      )}
    </GlassCard>
  );
}

export default function MyStakesScreen() {
  const { colors } = useTheme();
  const { loadBalance } = useVCoin();
  const queryClient = useQueryClient();

  const { data: stakes, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['staking', 'my-stakes'],
    queryFn: () => stakingApi.getMyStakes(),
  });

  const unstakeMutation = useMutation({
    mutationFn: (stakeId: string) => stakingApi.unstake(stakeId),
    onSuccess: () => {
      loadBalance();
      queryClient.invalidateQueries({ queryKey: ['staking'] });
      Alert.alert('Success', 'VCoin unstaked successfully!');
    },
  });

  const handleUnstake = (stakeId: string) => {
    Alert.alert('Unstake VCoin', 'Are you sure you want to unstake? You will receive your staked amount plus earned rewards.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Unstake',
        onPress: async () => {
          try {
            await unstakeMutation.mutateAsync(stakeId);
          } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to unstake');
          }
        },
      },
    ]);
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
        <ErrorView variant="network" onRetry={() => refetch()} message="Failed to load stakes." />
      </View>
    );
  }

  if (!stakes || stakes.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState
          icon="wallet-outline"
          title="No Active Stakes"
          message="Start staking VCoin to earn rewards!"
        />
      </View>
    );
  }

  const renderStake = ({ item }: { item: Stake }) => (
    <StakeItem
      stake={item}
      onUnstake={() => handleUnstake(item.id)}
      isUnstaking={unstakeMutation.isPending}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={stakes}
        renderItem={renderStake}
        keyExtractor={(item) => item.id}
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
  scrollContent: {
    padding: Spacing.md,
  },
  balanceCard: {
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  balanceLabel: {
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  balanceAmount: {
    letterSpacing: -1,
  },
  formCard: {},
  title: {
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: Spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  label: {
    textTransform: 'uppercase',
    letterSpacing: Typography.letterSpacing.uppercase,
  },
  maxButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  input: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.size.body1,
    marginBottom: Spacing.xs,
  },
  hint: {
    opacity: 0.7,
  },
  durationContainer: {
    marginBottom: Spacing.md,
  },
  durationButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  durationButton: {
    flex: 1,
    padding: Spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  durationText: {},
  apyText: {
    marginTop: 4,
  },
  rewardsBox: {
    padding: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  rewardsLabel: {
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  rewardsAmount: {
    letterSpacing: -1,
    marginBottom: Spacing.xs,
  },
  rewardsSubtext: {
    opacity: 0.8,
  },
  infoBox: {
    flexDirection: 'row',
    padding: Spacing.sm,
    borderRadius: 8,
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  infoText: {
    flex: 1,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  list: {
    padding: Spacing.md,
  },
  stakeCard: {
    marginBottom: Spacing.sm,
  },
  stakeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  stakeInfo: {},
  stakeAmount: {},
  stakeApy: {
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: Typography.letterSpacing.uppercase,
  },
  stakeDetails: {
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  detailText: {},
  unstakeButton: {
    marginTop: Spacing.xs,
  },
  lockedText: {
    textAlign: 'center',
    marginTop: Spacing.xs,
    fontStyle: 'italic',
  },
});

