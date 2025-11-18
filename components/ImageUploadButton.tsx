import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Typography, Spacing, LiquidGlass } from '@/constants/theme';
import { LucideIcons } from '@/utils/iconMapping';

interface ImageUploadButtonProps {
  label: string;
  imageUri?: string;
  onPress: () => void;
  aspectRatio?: 'square' | 'banner';
  loading?: boolean;
}

export function ImageUploadButton({
  label,
  imageUri,
  onPress,
  aspectRatio = 'square',
  loading = false,
}: ImageUploadButtonProps) {
  const { colors, glassFill, hairlineBorder } = useTheme();

  const containerStyle =
    aspectRatio === 'banner'
      ? styles.bannerContainer
      : styles.squareContainer;

  return (
    <View style={styles.wrapper}>
      <Text
        style={[
          styles.label,
          { color: colors.textPrimary, fontSize: Typography.size.body1 },
        ]}
      >
        {label}
      </Text>
      <Pressable
        onPress={onPress}
        disabled={loading}
        style={({ pressed }) => [
          containerStyle,
          {
            backgroundColor: glassFill(LiquidGlass.fillIntensity.subtle),
            borderWidth: 2,
            borderStyle: 'dashed',
            borderColor: hairlineBorder,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <LucideIcons.image size={32} color={colors.textTertiary} strokeWidth={2} />
            <Text
              style={[
                styles.placeholderText,
                {
                  color: colors.textTertiary,
                  fontSize: Typography.size.body2,
                },
              ]}
            >
              {loading ? 'Uploading...' : 'Tap to upload'}
            </Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.md,
  },
  label: {
    marginBottom: Spacing.xs,
    fontWeight: Typography.weight.semibold,
  },
  squareContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  bannerContainer: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholder: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  placeholderText: {},
});

