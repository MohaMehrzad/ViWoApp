import React from 'react';
import { View, Text, StyleSheet, ImageBackground, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { Typography, Spacing, Layout } from '@/constants/theme';
import { LucideIcons } from '@/utils/iconMapping';
import { VerificationBadge } from './VerificationBadge';

interface ProfileHeaderProps {
  coverPhotoUrl?: string;
  avatarUrl?: string;
  displayName: string;
  username: string;
  verificationTier?: string;
  memberSince: string;
  onCoverPress?: () => void;
  onAvatarPress?: () => void;
}

export function ProfileHeader({
  coverPhotoUrl,
  avatarUrl,
  displayName,
  username,
  verificationTier,
  memberSince,
  onCoverPress,
  onAvatarPress,
}: ProfileHeaderProps) {
  const { colors } = useTheme();

  const formatMemberSince = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <View style={styles.container}>
      {/* Cover Photo - Compact */}
      <Pressable onPress={onCoverPress} disabled={!onCoverPress}>
        <ImageBackground
          source={
            coverPhotoUrl
              ? { uri: coverPhotoUrl }
              : require('@/assets/images/splash-icon.png')
          }
          style={styles.coverPhoto}
          imageStyle={styles.coverPhotoImage}
        >
          <LinearGradient
            colors={['transparent', colors.background + 'EE']}
            style={styles.coverGradient}
          />
        </ImageBackground>
      </Pressable>

      {/* Avatar with Verification Badge - Compact */}
      <View style={styles.profileInfo}>
        <Pressable
          onPress={onAvatarPress}
          disabled={!onAvatarPress}
          style={[
            styles.avatarContainer,
            {
              backgroundColor: colors.accent + '20',
              borderColor: colors.background,
            },
          ]}
        >
          {avatarUrl ? (
            <ImageBackground
              source={{ uri: avatarUrl }}
              style={styles.avatar}
              imageStyle={styles.avatarImage}
            />
          ) : (
            <LucideIcons.user size={32} color={colors.accent} strokeWidth={2} />
          )}
          {verificationTier && (
            <View style={styles.verificationBadge}>
              <VerificationBadge tier={verificationTier} size={18} />
            </View>
          )}
        </Pressable>

        <View style={styles.nameContainer}>
          <View style={styles.nameRow}>
            <Text
              style={[
                styles.displayName,
                {
                  color: colors.textPrimary,
                  fontSize: Typography.size.h3,
                  fontWeight: Typography.weight.bold,
                },
              ]}
            >
              {displayName}
            </Text>
            <View style={styles.memberSince}>
              <LucideIcons.calendar
                size={12}
                color={colors.textTertiary}
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.memberSinceText,
                  {
                    color: colors.textTertiary,
                    fontSize: Typography.size.caption,
                  },
                ]}
              >
                {formatMemberSince(memberSince)}
              </Text>
            </View>
          </View>
          <Text
            style={[
              styles.username,
              {
                color: colors.textSecondary,
                fontSize: Typography.size.caption,
              },
            ]}
          >
            @{username}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xs,
  },
  coverPhoto: {
    width: '100%',
    height: 120,
    backgroundColor: '#2E2E2E',
  },
  coverPhotoImage: {
    resizeMode: 'cover',
  },
  coverGradient: {
    flex: 1,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -28,
    paddingHorizontal: Spacing.sm,
    gap: Spacing.sm,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    position: 'relative',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    overflow: 'hidden',
  },
  avatarImage: {
    resizeMode: 'cover',
  },
  verificationBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  nameContainer: {
    flex: 1,
    marginTop: 28,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  displayName: {
    flex: 1,
  },
  username: {
    marginTop: 2,
  },
  memberSince: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  memberSinceText: {},
});

