import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LucideIcons } from '@/utils/iconMapping';
import { Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface VerificationBadgeProps {
  tier?: string | null;
  size?: number | 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

export function VerificationBadge({ tier, size = 'small', showLabel = false }: VerificationBadgeProps) {
  const { colors } = useTheme();
  
  if (!tier || tier === 'NONE' || tier === 'BASIC') return null;

  const getConfig = () => {
    const upperTier = tier?.toUpperCase();
    switch (upperTier) {
      case 'BRONZE':
        return { icon: 'medal' as const, color: colors.warningDark, label: 'Bronze' };
      case 'SILVER':
        return { icon: 'medal' as const, color: colors.textSecondary, label: 'Silver' };
      case 'GOLD':
        return { icon: 'medal' as const, color: colors.warning, label: 'Gold' };
      case 'VERIFIED':
      case 'PREMIUM':
        return { icon: 'checkmarkCircle' as const, color: colors.info, label: 'Verified' };
      case 'ENTERPRISE':
        return { icon: 'checkmarkCircle' as const, color: colors.warning, label: 'Enterprise' };
      default:
        return null;
    }
  };

  const config = getConfig();
  if (!config) return null;

  const iconSize = typeof size === 'number' ? size : size === 'small' ? 16 : size === 'medium' ? 20 : 24;

  const IconComponent = LucideIcons[config.icon];
  
  return (
    <View style={[styles.container, showLabel && styles.containerWithLabel]}>
      <IconComponent size={iconSize} color={config.color} strokeWidth={2} />
      {showLabel && (
        <Text
          style={[
            styles.label,
            {
              color: config.color,
              fontSize: size === 'small' ? Typography.size.caption : Typography.size.caption,
            },
          ]}
        >
          {config.label}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerWithLabel: {
    flexDirection: 'row',
    gap: 4,
  },
  label: {
    fontWeight: '600',
  },
});

