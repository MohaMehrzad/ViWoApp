import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Typography, Spacing } from '@/constants/theme';
import { LucideIcons } from '@/utils/iconMapping';
import { SocialLinks as SocialLinksType } from '@/types/user';

interface SocialLinksProps {
  location?: string;
  website?: string;
  socialLinks?: SocialLinksType;
}

export function SocialLinks({ location, website, socialLinks }: SocialLinksProps) {
  const { colors } = useTheme();

  const handleLinkPress = (url: string) => {
    let formattedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      formattedUrl = 'https://' + url;
    }
    Linking.openURL(formattedUrl);
  };

  const getSocialUrl = (platform: string, handle: string) => {
    const cleanHandle = handle.replace('@', '');
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/${cleanHandle}`,
      instagram: `https://instagram.com/${cleanHandle}`,
      linkedin: `https://linkedin.com/in/${cleanHandle}`,
      tiktok: `https://tiktok.com/@${cleanHandle}`,
    };
    return urls[platform] || handle;
  };

  const hasAnyInfo =
    location || website || socialLinks?.twitter || socialLinks?.instagram || 
    socialLinks?.linkedin || socialLinks?.tiktok;

  if (!hasAnyInfo) return null;

  return (
    <View style={styles.container}>
      <View style={styles.compactRow}>
        {/* Location */}
        {location && (
          <View style={styles.infoItem}>
            <LucideIcons.mapPin size={12} color={colors.textTertiary} strokeWidth={2} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              {location}
            </Text>
          </View>
        )}

        {/* Website */}
        {website && (
          <Pressable
            style={styles.infoItem}
            onPress={() => handleLinkPress(website)}
          >
            <LucideIcons.link size={12} color={colors.accent} strokeWidth={2} />
            <Text style={[styles.linkText, { color: colors.accent }]} numberOfLines={1}>
              {website.replace(/^https?:\/\//, '')}
            </Text>
          </Pressable>
        )}

        {/* Social Media Links */}
        {socialLinks?.twitter && (
          <Pressable
            style={styles.socialButton}
            onPress={() => handleLinkPress(getSocialUrl('twitter', socialLinks.twitter!))}
          >
            <LucideIcons.twitter size={14} color={colors.info} strokeWidth={2} />
          </Pressable>
        )}
        {socialLinks?.instagram && (
          <Pressable
            style={styles.socialButton}
            onPress={() => handleLinkPress(getSocialUrl('instagram', socialLinks.instagram!))}
          >
            <LucideIcons.instagram size={14} color={colors.danger} strokeWidth={2} />
          </Pressable>
        )}
        {socialLinks?.linkedin && (
          <Pressable
            style={styles.socialButton}
            onPress={() => handleLinkPress(getSocialUrl('linkedin', socialLinks.linkedin!))}
          >
            <LucideIcons.linkedin size={14} color={colors.info} strokeWidth={2} />
          </Pressable>
        )}
        {socialLinks?.tiktok && (
          <Pressable
            style={styles.socialButton}
            onPress={() => handleLinkPress(getSocialUrl('tiktok', socialLinks.tiktok!))}
          >
            <LucideIcons.music size={14} color={colors.textPrimary} strokeWidth={2} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: '45%',
  },
  infoText: {
    fontSize: Typography.size.caption,
  },
  linkText: {
    fontSize: Typography.size.caption,
    textDecorationLine: 'underline',
  },
  socialButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

