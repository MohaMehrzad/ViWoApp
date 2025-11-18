import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Typography, Spacing, LiquidGlass } from '@/constants/theme';
import { LucideIcons } from '@/utils/iconMapping';

interface PrivacySettingRowProps {
  label: string;
  description?: string;
  value: string;
  options: { label: string; value: string }[];
  onPress: () => void;
}

export function PrivacySettingRow({
  label,
  description,
  value,
  options,
  onPress,
}: PrivacySettingRowProps) {
  const { colors, glassFill, hairlineBorder } = useTheme();

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: glassFill(LiquidGlass.fillIntensity.subtle),
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: hairlineBorder,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <View style={styles.leftContent}>
        <Text
          style={[
            styles.label,
            {
              color: colors.textPrimary,
              fontSize: Typography.size.body1,
              fontWeight: Typography.weight.semibold,
            },
          ]}
        >
          {label}
        </Text>
        {description && (
          <Text
            style={[
              styles.description,
              {
                color: colors.textSecondary,
                fontSize: Typography.size.caption,
              },
            ]}
          >
            {description}
          </Text>
        )}
      </View>
      <View style={styles.rightContent}>
        <Text
          style={[
            styles.value,
            {
              color: colors.accent,
              fontSize: Typography.size.body2,
            },
          ]}
        >
          {selectedOption?.label || value}
        </Text>
        <LucideIcons.chevronRight
          size={20}
          color={colors.textTertiary}
          strokeWidth={2}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.sm,
  },
  leftContent: {
    flex: 1,
  },
  label: {},
  description: {
    marginTop: Spacing.xs / 2,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  value: {},
});

