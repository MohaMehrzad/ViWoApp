import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { GlassCard } from './GlassCard';
import { useTheme } from '@/hooks/useTheme';
import { Typography, Spacing } from '@/constants/theme';
import { LucideIcons } from '@/utils/iconMapping';
import { formatNumber } from '@/utils/formatters';
import { ProfileStats } from '@/types/user';

interface ProfileStatsGridProps {
  stats: ProfileStats;
  onStatPress?: (stat: string) => void;
}

export function ProfileStatsGrid({ stats, onStatPress }: ProfileStatsGridProps) {
  const { colors } = useTheme();

  const statItems = [
    {
      key: 'posts',
      value: stats.postsCount,
      icon: LucideIcons.document,
      color: colors.accent,
    },
    {
      key: 'shorts',
      value: stats.shortsCount,
      icon: LucideIcons.video,
      color: colors.error,
    },
    {
      key: 'followers',
      value: stats.followersCount,
      icon: LucideIcons.users,
      color: colors.secondary,
    },
    {
      key: 'following',
      value: stats.followingCount,
      icon: LucideIcons.userPlus,
      color: colors.secondaryLight,
    },
    {
      key: 'vcoin',
      value: stats.vcoinBalance,
      icon: LucideIcons.coins,
      color: colors.warning,
      format: true,
    },
    {
      key: 'staked',
      value: stats.vcoinStaked,
      icon: LucideIcons.lock,
      color: colors.info,
      format: true,
    },
    {
      key: 'reputation',
      value: stats.reputationScore,
      icon: LucideIcons.star,
      color: colors.warningDark,
      decimal: true,
    },
    {
      key: 'views',
      value: stats.totalViewsReceived,
      icon: LucideIcons.eye,
      color: colors.dangerLight,
    },
  ];

  return (
    <View style={styles.grid}>
      {statItems.map((item) => (
        <Pressable
          key={item.key}
          onPress={() => onStatPress?.(item.key)}
          style={styles.statItemWrapper}
        >
          <View style={[styles.statItem, { borderColor: colors.border }]}>
            <item.icon size={16} color={item.color} strokeWidth={2} />
            <Text
              style={[
                styles.statValue,
                {
                  color: colors.textPrimary,
                  fontSize: Typography.size.body1,
                  fontWeight: Typography.weight.bold,
                },
              ]}
            >
              {item.decimal
                ? item.value.toFixed(1)
                : item.format
                ? formatNumber(item.value)
                : item.value}
            </Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    gap: 6,
  },
  statItemWrapper: {
    width: '23.5%',
  },
  statItem: {
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: 4,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  statValue: {
    lineHeight: 18,
  },
});

