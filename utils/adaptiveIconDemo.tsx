/**
 * Demo/Debug Component for Adaptive Icon System
 * 
 * Use this component to test and visualize how icons adapt
 * to different background luminances in real-time.
 * 
 * Usage:
 * import { AdaptiveIconDemo } from '@/utils/adaptiveIconDemo';
 * <AdaptiveIconDemo />
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Slider,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassAwareIcon } from '@/components/GlassAwareIcon';
import {
  hexToLuminance,
  getAdaptiveIconColor,
  getContrastRatio,
  meetsWCAGAA,
} from '@/utils/luminance';
import { BackgroundPresets } from '@/hooks/useBackgroundLuminance';
import { useTheme } from '@/hooks/useTheme';
import { Typography, Spacing, Radius } from '@/constants/theme';

export function AdaptiveIconDemo() {
  const { colors, isDark } = useTheme();
  const [luminance, setLuminance] = useState(0.5);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  // Test icons
  const testIcons: Array<React.ComponentProps<typeof Ionicons>['name']> = [
    'home',
    'play-circle',
    'wallet',
    'notifications',
    'chatbubbles',
    'person',
    'settings',
    'heart',
  ];

  // Background presets for testing
  const presets = [
    { name: 'Pure Black', value: BackgroundPresets.black },
    { name: 'Dark Background', value: BackgroundPresets.darkBackground },
    { name: 'Dark Glass', value: BackgroundPresets.darkGlass },
    { name: 'Threshold (0.55)', value: 0.55 },
    { name: 'Light Glass', value: BackgroundPresets.lightGlass },
    { name: 'Light Background', value: BackgroundPresets.lightBackground },
    { name: 'Pure White', value: BackgroundPresets.white },
  ];

  // Calculate current icon color
  const iconColor = getAdaptiveIconColor(luminance, isDark);
  const iconLuminance = iconColor.includes('248') ? 0.95 : 0.05; // Approximate
  const contrastRatio = getContrastRatio(luminance, iconLuminance);
  const meetsAA = meetsWCAGAA(contrastRatio, false);
  const meetsAALarge = meetsWCAGAA(contrastRatio, true);

  // Background color for visualization
  const backgroundGray = Math.round(luminance * 255);
  const backgroundColor = `rgb(${backgroundGray}, ${backgroundGray}, ${backgroundGray})`;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Header */}
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Adaptive Icon Demo
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Test how icons adapt to different background luminances
        </Text>

        {/* Current Values */}
        <View style={[styles.card, { backgroundColor: colors.surface1 }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            Current Settings
          </Text>
          <View style={styles.valueRow}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Luminance:
            </Text>
            <Text style={[styles.value, { color: colors.textPrimary }]}>
              {luminance.toFixed(3)}
            </Text>
          </View>
          <View style={styles.valueRow}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Icon Color:
            </Text>
            <Text style={[styles.value, { color: colors.textPrimary }]}>
              {luminance < 0.55 ? 'Light' : 'Dark'}
            </Text>
          </View>
          <View style={styles.valueRow}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Contrast Ratio:
            </Text>
            <Text style={[styles.value, { color: colors.textPrimary }]}>
              {contrastRatio.toFixed(2)}:1
            </Text>
          </View>
          <View style={styles.valueRow}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              WCAG AA:
            </Text>
            <Text
              style={[
                styles.value,
                { color: meetsAA ? colors.success : colors.danger },
              ]}
            >
              {meetsAA ? '✓ Pass' : '✗ Fail'} (Small)
            </Text>
          </View>
          <View style={styles.valueRow}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              WCAG AA:
            </Text>
            <Text
              style={[
                styles.value,
                { color: meetsAALarge ? colors.success : colors.danger },
              ]}
            >
              {meetsAALarge ? '✓ Pass' : '✗ Fail'} (Large)
            </Text>
          </View>
        </View>

        {/* Luminance Slider */}
        <View style={[styles.card, { backgroundColor: colors.surface1 }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            Adjust Luminance
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={1}
            value={luminance}
            onValueChange={(value) => {
              setLuminance(value);
              setSelectedPreset(null);
            }}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.glassBorder}
          />
          <View style={styles.sliderLabels}>
            <Text style={[styles.sliderLabel, { color: colors.textTertiary }]}>
              0.0 (Black)
            </Text>
            <Text style={[styles.sliderLabel, { color: colors.textTertiary }]}>
              1.0 (White)
            </Text>
          </View>
        </View>

        {/* Presets */}
        <View style={[styles.card, { backgroundColor: colors.surface1 }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            Quick Presets
          </Text>
          <View style={styles.presetGrid}>
            {presets.map((preset) => (
              <Pressable
                key={preset.name}
                style={[
                  styles.presetButton,
                  {
                    backgroundColor:
                      selectedPreset === preset.name
                        ? colors.primary
                        : colors.glassFill,
                    borderColor:
                      selectedPreset === preset.name
                        ? colors.primary
                        : colors.glassBorder,
                  },
                ]}
                onPress={() => {
                  setLuminance(preset.value);
                  setSelectedPreset(preset.name);
                }}
              >
                <Text
                  style={[
                    styles.presetText,
                    {
                      color:
                        selectedPreset === preset.name
                          ? '#FFFFFF'
                          : colors.textPrimary,
                    },
                  ]}
                >
                  {preset.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Icon Preview */}
        <View style={[styles.card, { backgroundColor: colors.surface1 }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            Icon Preview
          </Text>
          <View style={[styles.preview, { backgroundColor }]}>
            <View style={styles.iconGrid}>
              {testIcons.map((iconName) => (
                <View key={iconName} style={styles.iconWrapper}>
                  <GlassAwareIcon
                    name={iconName}
                    size={32}
                    backgroundLuma={luminance}
                  />
                </View>
              ))}
            </View>
          </View>
          <Text style={[styles.previewLabel, { color: colors.textTertiary }]}>
            Background: rgb({backgroundGray}, {backgroundGray}, {backgroundGray})
          </Text>
        </View>

        {/* Tab Bar Simulation */}
        <View style={[styles.card, { backgroundColor: colors.surface1 }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            Tab Bar Simulation
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            Shows how icons appear in the actual tab bar
          </Text>
          <View style={styles.tabBarPreview}>
            {/* Glass background */}
            <View
              style={[
                styles.glassBackground,
                { backgroundColor: colors.glassFill },
              ]}
            />
            {/* Icons */}
            <View style={styles.tabIcons}>
              {testIcons.slice(0, 5).map((iconName, index) => (
                <View key={iconName} style={styles.tabIcon}>
                  {index === 2 ? (
                    // Active tab with dark indicator
                    <>
                      <View
                        style={[
                          styles.activeIndicator,
                          { backgroundColor: colors.accent },
                        ]}
                      />
                      <Ionicons name={iconName} size={24} color="#FFFFFF" />
                    </>
                  ) : (
                    // Inactive tab with adaptive color
                    <GlassAwareIcon
                      name={iconName}
                      size={24}
                      backgroundLuma={luminance}
                    />
                  )}
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Info */}
        <View style={[styles.card, { backgroundColor: colors.surface1 }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            About
          </Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            This demo shows how the adaptive icon system works. Icons
            automatically switch between light and dark variants based on the
            background luminance to ensure optimal contrast.
          </Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            The threshold is set at 0.55, meaning:
          </Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            • Luminance {'<'} 0.55: Use light icons (dark background)
          </Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            • Luminance ≥ 0.55: Use dark icons (light background)
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
  },
  title: {
    fontSize: Typography.size.h1,
    fontWeight: Typography.weight.bold,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.size.body,
    marginBottom: Spacing.lg,
  },
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  cardTitle: {
    fontSize: Typography.size.h3,
    fontWeight: Typography.weight.semibold,
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: Typography.size.body2,
    marginBottom: Spacing.sm,
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: Typography.size.body,
  },
  value: {
    fontSize: Typography.size.body,
    fontWeight: Typography.weight.medium,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabel: {
    fontSize: Typography.size.caption,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  presetButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  presetText: {
    fontSize: Typography.size.body2,
    fontWeight: Typography.weight.medium,
  },
  preview: {
    borderRadius: Radius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  previewLabel: {
    fontSize: Typography.size.caption,
    textAlign: 'center',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBarPreview: {
    height: 72,
    borderRadius: 36,
    overflow: 'hidden',
    position: 'relative',
  },
  glassBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  tabIcons: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.md,
  },
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    opacity: 0.85,
  },
  infoText: {
    fontSize: Typography.size.body2,
    lineHeight: Typography.lineHeight.body2,
    marginBottom: Spacing.xs,
  },
});

