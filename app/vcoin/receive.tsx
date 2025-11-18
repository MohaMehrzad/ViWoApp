import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Share,
  Pressable,
} from 'react-native';
import { GlassCard } from '@/components/GlassCard';
import { GlassButton } from '@/components/GlassButton';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, Typography } from '@/constants/theme';
import { LucideIcons } from '@/utils/iconMapping';
import { HapticFeedback } from '@/utils/haptics';
import * as Clipboard from 'expo-clipboard';

export default function ReceiveVCoinScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();

  const handleCopyUsername = async () => {
    if (user?.username) {
      await Clipboard.setStringAsync(user.username);
      HapticFeedback.light();
      // In production, show a toast notification
      console.log('Username copied!');
    }
  };

  const handleCopyUserId = async () => {
    if (user?.id) {
      await Clipboard.setStringAsync(user.id);
      HapticFeedback.light();
      console.log('User ID copied!');
    }
  };

  const handleShare = async () => {
    if (user?.username) {
      try {
        await Share.share({
          message: `Send me VCoin on ViWoApp! My username: @${user.username}`,
          title: 'Send me VCoin',
        });
      } catch (error) {
        console.error('Failed to share:', error);
      }
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Header */}
      <View style={styles.header}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: colors.accent + '20' },
          ]}
        >
          <LucideIcons.qrCode size={64} color={colors.accent} strokeWidth={2} />
        </View>
        <Text
          style={[
            styles.title,
            {
              color: colors.textPrimary,
              fontSize: Typography.size.h2,
              fontWeight: Typography.weight.bold,
            },
          ]}
        >
          Receive VCoin
        </Text>
        <Text
          style={[
            styles.subtitle,
            {
              color: colors.textSecondary,
              fontSize: Typography.size.body2,
            },
          ]}
        >
          Share your username or ID to receive VCoin
        </Text>
      </View>

      {/* Username Card */}
      <GlassCard padding="md" style={styles.card}>
        <Text
          style={[
            styles.cardLabel,
            {
              color: colors.textSecondary,
              fontSize: Typography.size.body2,
            },
          ]}
        >
          Your Username
        </Text>
        <Pressable
          onPress={handleCopyUsername}
          style={[
            styles.valueContainer,
            { backgroundColor: colors.glassFill },
          ]}
        >
          <Text
            style={[
              styles.valueText,
              {
                color: colors.accent,
                fontSize: Typography.size.h3,
                fontWeight: Typography.weight.bold,
              },
            ]}
          >
            @{user?.username}
          </Text>
          <LucideIcons.copy size={24} color={colors.accent} strokeWidth={2} />
        </Pressable>
        <Text
          style={[
            styles.hint,
            {
              color: colors.textSecondary,
              fontSize: Typography.size.caption,
            },
          ]}
        >
          Tap to copy
        </Text>
      </GlassCard>

      {/* User ID Card */}
      <GlassCard padding="md" style={styles.card}>
        <Text
          style={[
            styles.cardLabel,
            {
              color: colors.textSecondary,
              fontSize: Typography.size.body2,
            },
          ]}
        >
          Your User ID
        </Text>
        <Pressable
          onPress={handleCopyUserId}
          style={[
            styles.valueContainer,
            { backgroundColor: colors.glassFill },
          ]}
        >
          <Text
            style={[
              styles.valueText,
              {
                color: colors.textPrimary,
                fontSize: Typography.size.body1,
              },
            ]}
            numberOfLines={1}
            ellipsizeMode="middle"
          >
            {user?.id}
          </Text>
          <LucideIcons.copy size={20} color={colors.textSecondary} strokeWidth={2} />
        </Pressable>
        <Text
          style={[
            styles.hint,
            {
              color: colors.textSecondary,
              fontSize: Typography.size.caption,
            },
          ]}
        >
          Tap to copy
        </Text>
      </GlassCard>

      {/* Share Button */}
      <GlassButton
        onPress={handleShare}
        variant="primary"
        style={styles.shareButton}
      >
        Share My Details
      </GlassButton>

      {/* Instructions */}
      <GlassCard padding="md" style={styles.instructionsCard}>
        <View style={styles.instructionRow}>
          <LucideIcons.checkmarkCircle size={20} color={colors.success} strokeWidth={2} />
          <Text
            style={[
              styles.instructionText,
              {
                color: colors.textSecondary,
                fontSize: Typography.size.body2,
              },
            ]}
          >
            Share your username with anyone who wants to send you VCoin
          </Text>
        </View>
        <View style={styles.instructionRow}>
          <LucideIcons.checkmarkCircle size={20} color={colors.success} strokeWidth={2} />
          <Text
            style={[
              styles.instructionText,
              {
                color: colors.textSecondary,
                fontSize: Typography.size.body2,
              },
            ]}
          >
            Transactions are instant and appear in your balance immediately
          </Text>
        </View>
        <View style={styles.instructionRow}>
          <LucideIcons.checkmarkCircle size={20} color={colors.success} strokeWidth={2} />
          <Text
            style={[
              styles.instructionText,
              {
                color: colors.textSecondary,
                fontSize: Typography.size.body2,
              },
            ]}
          >
            There are no fees for receiving VCoin
          </Text>
        </View>
      </GlassCard>
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
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.8,
  },
  card: {
    marginBottom: Spacing.md,
  },
  cardLabel: {
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.xs,
  },
  valueText: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  hint: {
    opacity: 0.7,
    textAlign: 'center',
  },
  shareButton: {
    marginBottom: Spacing.md,
  },
  instructionsCard: {},
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  instructionText: {
    flex: 1,
    lineHeight: 20,
  },
});

