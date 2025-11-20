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
import { vcoinApi } from '@/services/api/vcoin';
import { VCoinTransaction } from '@/types/vcoin';
import { formatVCoinBalance } from '@/utils/formatters';
import { LucideIcons } from '@/utils/iconMapping';
import { useAutoUpdateTime } from '@/hooks/useAutoUpdateTime';

interface TransactionItemProps {
  transaction: VCoinTransaction;
}

function TransactionItem({ transaction }: TransactionItemProps) {
  const { colors } = useTheme();
  const relativeTime = useAutoUpdateTime(new Date(transaction.createdAt).getTime());

  const isCredit = transaction.type === 'EARN' || transaction.type === 'REWARD';
  const isDebit = transaction.type === 'SPEND' || transaction.type === 'TRANSFER';

  const getIconComponent = () => {
    switch (transaction.type) {
      case 'EARN':
        return LucideIcons.trophy;
      case 'REWARD':
        return LucideIcons.gift;
      case 'SPEND':
        return LucideIcons.arrowDown;
      case 'TRANSFER':
        return LucideIcons.arrowUp;
      default:
        return LucideIcons.repost;
    }
  };

  const getIconColor = () => {
    if (isCredit) return colors.success;
    if (isDebit) return colors.danger || colors.textSecondary;
    return colors.accent;
  };

  return (
    <GlassCard padding="md" style={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: getIconColor() + '20' },
          ]}
        >
          {React.createElement(getIconComponent(), { size: 24, color: getIconColor(), strokeWidth: 2 })}
        </View>
        <View style={styles.transactionInfo}>
          <Text
            style={[
              styles.description,
              {
                color: colors.textPrimary,
                fontSize: Typography.size.body,
                fontWeight: Typography.weight.semibold,
              },
            ]}
            numberOfLines={1}
          >
            {transaction.description}
          </Text>
          <Text
            style={[
              styles.timestamp,
              {
                color: colors.textSecondary,
                fontSize: Typography.size.caption,
              },
            ]}
          >
            {relativeTime}
          </Text>
        </View>
        <Text
          style={[
            styles.amount,
            {
              color: isCredit ? colors.success : colors.textPrimary,
              fontSize: Typography.size.body,
              fontWeight: Typography.weight.bold,
            },
          ]}
        >
          {isCredit ? '+' : '-'}
          {formatVCoinBalance(transaction.amount, { showDecimals: true })}
        </Text>
      </View>
    </GlassCard>
  );
}

export default function VCoinHistoryScreen() {
  const { colors } = useTheme();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ['vcoin', 'transactions'],
    queryFn: ({ pageParam = 1 }) => vcoinApi.getTransactions(pageParam, 20),
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
  });

  const transactions = data?.pages.flatMap((page) => page.transactions) ?? [];

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderTransaction = ({ item }: { item: VCoinTransaction }) => (
    <TransactionItem transaction={item} />
  );

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
          message="Failed to load transaction history."
        />
      </View>
    );
  }

  if (transactions.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState
          icon="receipt-outline"
          title="No Transactions Yet"
          message="Your transaction history will appear here once you start earning and spending VCoin."
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        // Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={8}
        initialNumToRender={8}
        windowSize={5}
        updateCellsBatchingPeriod={50}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
            tintColor={colors.accent}
            colors={[colors.accent]}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: Spacing.md,
  },
  transactionCard: {
    marginBottom: Spacing.sm,
  },
  transactionHeader: {
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
  transactionInfo: {
    flex: 1,
  },
  description: {},
  timestamp: {
    marginTop: 2,
  },
  amount: {
    marginLeft: Spacing.sm,
  },
  loadingMore: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
});

