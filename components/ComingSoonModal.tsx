/**
 * Coming Soon Modal
 * Displays a modal for features that are not yet implemented
 */

import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from '@react-native-community/blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';
import { Spacing, Typography, LiquidGlass } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface ComingSoonModalProps {
  visible: boolean;
  onClose: () => void;
  featureName?: string;
  description?: string;
}

export function ComingSoonModal({
  visible,
  onClose,
  featureName = 'This Feature',
  description = "We're working hard to bring you this feature. Stay tuned for updates!",
}: ComingSoonModalProps) {
  const { colors, blurType } = useTheme();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
        accessibilityLabel="Close modal"
        accessibilityRole="button"
      >
        {/* Blurred Backdrop */}
        {!isWeb ? (
          <BlurView
            blurType={blurType}
            blurAmount={LiquidGlass.blur.intensity.imageHeavy}
            reducedTransparencyFallbackColor="transparent"
            style={StyleSheet.absoluteFill}
          />
        ) : (
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                // @ts-ignore - Web only
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
              },
            ]}
          />
        )}
      </Pressable>
      <Pressable
        style={styles.modalWrapper}
        onPress={() => {}}
        accessibilityLabel="Modal content"
      >
        <View
          style={[
            styles.modalContainer,
            {
              paddingTop: insets.top + Spacing.xl,
              paddingBottom: insets.bottom + Spacing.xl,
            },
          ]}
          onStartShouldSetResponder={() => true}
        >
          <GlassCard elevated padding="lg" style={styles.card}>
            <View style={styles.iconContainer}>
              <Ionicons
                name="construct-outline"
                size={64}
                color={colors.accent}
              />
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
              Coming Soon
            </Text>

            <Text
              style={[
                styles.featureName,
                {
                  color: colors.accent,
                  fontSize: Typography.size.body,
                  fontWeight: Typography.weight.semibold,
                },
              ]}
            >
              {featureName}
            </Text>

            <Text
              style={[
                styles.description,
                {
                  color: colors.textSecondary,
                  fontSize: Typography.size.body,
                  lineHeight: Typography.lineHeight.body,
                },
              ]}
            >
              {description}
            </Text>

            <GlassButton onPress={onClose} variant="primary" style={styles.button}>
              Got It
            </GlassButton>
          </GlassCard>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxWidth: 400,
  },
  card: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: Spacing.lg,
  },
  title: {
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  featureName: {
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  description: {
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  button: {
    width: '100%',
  },
});

export default ComingSoonModal;

