import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Typography, Spacing, LiquidGlass } from '@/constants/theme';

export type ProfileTab = 'posts' | 'shorts' | 'media' | 'replies';

interface ProfileTabsProps {
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
  counts?: {
    posts?: number;
    shorts?: number;
    media?: number;
    replies?: number;
  };
}

export function ProfileTabs({ activeTab, onTabChange, counts }: ProfileTabsProps) {
  const { colors, glassFill, hairlineBorder } = useTheme();

  const tabs: { key: ProfileTab; label: string }[] = [
    { key: 'posts', label: 'Posts' },
    { key: 'shorts', label: 'Shorts' },
    { key: 'media', label: 'Media' },
    { key: 'replies', label: 'Replies' },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: glassFill(LiquidGlass.fillIntensity.subtle),
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: hairlineBorder,
        },
      ]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const count = counts?.[tab.key];

          return (
            <Pressable
              key={tab.key}
              onPress={() => onTabChange(tab.key)}
              style={({ pressed }) => [
                styles.tab,
                isActive && styles.activeTab,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isActive ? colors.accent : colors.textSecondary,
                    fontSize: Typography.size.body1,
                    fontWeight: isActive
                      ? Typography.weight.semibold
                      : Typography.weight.regular,
                  },
                ]}
              >
                {tab.label}
                {count !== undefined && ` (${count})`}
              </Text>
              {isActive && (
                <View
                  style={[styles.activeIndicator, { backgroundColor: colors.accent }]}
                />
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xs,
  },
  tabsContainer: {
    paddingHorizontal: Spacing.sm,
    gap: Spacing.md,
  },
  tab: {
    paddingVertical: Spacing.sm,
    position: 'relative',
  },
  activeTab: {},
  tabLabel: {},
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    borderRadius: 1,
  },
});

