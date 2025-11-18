import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GlassCard } from '@/components/GlassCard';
import { GlassButton } from '@/components/GlassButton';
import { VerificationBadge } from '@/components/VerificationBadge';
import { LoadingSpinner } from '@/components/LoadingState';
import { ErrorView } from '@/components/ErrorView';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, Typography } from '@/constants/theme';
import { verificationApi } from '@/services/api/verification';
import { LucideIcons } from '@/utils/iconMapping';

export default function VerificationApplyScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: tiers, isLoading: loadingTiers } = useQuery({
    queryKey: ['verification', 'tiers'],
    queryFn: () => verificationApi.getTiers(),
  });

  const { data: status, isLoading: loadingStatus } = useQuery({
    queryKey: ['verification', 'status'],
    queryFn: () => verificationApi.getStatus(),
  });

  const applyMutation = useMutation({
    mutationFn: (documents: string[]) => verificationApi.apply(documents),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verification'] });
      Alert.alert(
        'Application Submitted',
        'Your verification application has been submitted. We will review it and notify you of the result.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    },
  });

  const upgradeMutation = useMutation({
    mutationFn: () => verificationApi.upgrade(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verification'] });
      Alert.alert('Success', 'Your tier has been upgraded!');
    },
  });

  const handleApply = async () => {
    try {
      await applyMutation.mutateAsync([]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to apply for verification');
    }
  };

  const handleUpgrade = async () => {
    try {
      await upgradeMutation.mutateAsync();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to upgrade tier');
    }
  };

  if (loadingTiers || loadingStatus) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Current Status */}
      <GlassCard padding="lg" style={styles.statusCard}>
        <Text
          style={[
            styles.statusLabel,
            { color: colors.textSecondary, fontSize: Typography.size.body2 },
          ]}
        >
          Current Verification Status
        </Text>
        <View style={styles.currentTier}>
          <VerificationBadge tier={status?.tier || 'NONE'} size="large" showLabel />
        </View>
        {status?.status === 'PENDING' && (
          <View style={[styles.pendingBanner, { backgroundColor: colors.accent + '20' }]}>
            <LucideIcons.clock size={20} color={colors.accent} strokeWidth={2} />
            <Text
              style={[
                styles.pendingText,
                { color: colors.accent, fontSize: Typography.size.caption },
              ]}
            >
              Application under review
            </Text>
          </View>
        )}
      </GlassCard>

      {/* Tiers Information */}
      <Text
        style={[
          styles.sectionTitle,
          { color: colors.textPrimary, fontSize: Typography.size.h3, fontWeight: Typography.weight.bold },
        ]}
      >
        Verification Tiers
      </Text>

      {tiers?.map((tier, index) => (
        <GlassCard key={tier.name} padding="md" style={styles.tierCard}>
          <View style={styles.tierHeader}>
            <Text
              style={[
                styles.tierName,
                {
                  color: colors.textPrimary,
                  fontSize: Typography.size.body,
                  fontWeight: Typography.weight.bold,
                },
              ]}
            >
              {tier.name}
            </Text>
            <VerificationBadge
              tier={tier.name.toUpperCase() as any}
              size="medium"
            />
          </View>

          {tier.requirements && tier.requirements.length > 0 && (
            <View style={styles.section}>
              <Text
                style={[
                  styles.sectionLabel,
                  { color: colors.textSecondary, fontSize: Typography.size.caption },
                ]}
              >
                Requirements:
              </Text>
              {tier.requirements.map((req, i) => (
                <View key={i} style={styles.listItem}>
                  <LucideIcons.check size={16} color={colors.success} strokeWidth={2} />
                  <Text
                    style={[
                      styles.listText,
                      { color: colors.textPrimary, fontSize: Typography.size.caption },
                    ]}
                  >
                    {req}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {tier.benefits && tier.benefits.length > 0 && (
            <View style={styles.section}>
              <Text
                style={[
                  styles.sectionLabel,
                  { color: colors.textSecondary, fontSize: Typography.size.caption },
                ]}
              >
                Benefits:
              </Text>
              {tier.benefits.map((benefit, i) => (
                <View key={i} style={styles.listItem}>
                  <LucideIcons.star size={16} color={colors.accent} strokeWidth={2} />
                  <Text
                    style={[
                      styles.listText,
                      { color: colors.textPrimary, fontSize: Typography.size.caption },
                    ]}
                  >
                    {benefit}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </GlassCard>
      ))}

      {/* Action Buttons */}
      {status?.tier === 'NONE' && status?.status !== 'PENDING' && (
        <GlassButton
          onPress={handleApply}
          variant="primary"
          loading={applyMutation.isPending}
          style={styles.applyButton}
        >
          Apply for Verification
        </GlassButton>
      )}

      {status?.tier && status.tier !== 'NONE' && status.tier !== 'VERIFIED' && (
        <GlassButton
          onPress={handleUpgrade}
          variant="primary"
          loading={upgradeMutation.isPending}
          style={styles.applyButton}
        >
          Upgrade Tier
        </GlassButton>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  statusCard: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  statusLabel: {
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  currentTier: {
    marginBottom: Spacing.sm,
  },
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: 8,
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  pendingText: {},
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  tierCard: {
    marginBottom: Spacing.sm,
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  tierName: {},
  section: {
    marginTop: Spacing.sm,
  },
  sectionLabel: {
    textTransform: 'uppercase',
    letterSpacing: Typography.letterSpacing.uppercase,
    marginBottom: Spacing.xs,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
    gap: Spacing.xs,
  },
  listText: {
    flex: 1,
    lineHeight: 18,
  },
  applyButton: {
    marginTop: Spacing.md,
  },
});

