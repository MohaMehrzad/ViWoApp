/**
 * Post Action Sheet
 * Action sheet for post overflow menu (edit, delete, report, etc.)
 */

import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable } from 'react-native';
import { LucideIcons } from '@/utils/iconMapping';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassCard } from './GlassCard';
import { Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { HapticFeedback } from '@/utils/haptics';

interface ActionItem {
  id: string;
  label: string;
  icon: keyof typeof LucideIcons;
  color?: string;
  destructive?: boolean;
  onPress: () => void;
}

interface PostActionSheetProps {
  visible: boolean;
  onClose: () => void;
  isOwnPost?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onReport?: () => void;
  onShare?: () => void;
}

export function PostActionSheet({
  visible,
  onClose,
  isOwnPost = false,
  onEdit,
  onDelete,
  onReport,
  onShare,
}: PostActionSheetProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const handleAction = (action: () => void) => {
    HapticFeedback.light();
    action();
    onClose();
  };

  const actions: ActionItem[] = [];

  if (isOwnPost) {
    if (onEdit) {
      actions.push({
        id: 'edit',
        label: 'Edit Post',
        icon: 'edit',
        onPress: () => handleAction(onEdit),
      });
    }
    if (onDelete) {
      actions.push({
        id: 'delete',
        label: 'Delete Post',
        icon: 'delete',
        color: colors.danger,
        destructive: true,
        onPress: () => handleAction(onDelete),
      });
    }
  } else {
    if (onReport) {
      actions.push({
        id: 'report',
        label: 'Report Post',
        icon: 'report',
        color: colors.danger,
        onPress: () => handleAction(onReport),
      });
    }
  }

  if (onShare) {
    actions.push({
      id: 'share',
      label: 'Share via...',
      icon: 'shareExternal',
      onPress: () => handleAction(onShare),
    });
  }

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
        accessibilityLabel="Close menu"
        accessibilityRole="button"
      >
        <View
          style={[
            styles.sheetContainer,
            {
              paddingBottom: insets.bottom + Spacing.lg,
            },
          ]}
          onStartShouldSetResponder={() => true}
        >
          <GlassCard elevated padding="sm" style={styles.sheet}>
            {actions.map((action, index) => {
              const IconComponent = LucideIcons[action.icon];
              return (
                <Pressable
                  key={action.id}
                  onPress={action.onPress}
                  style={({ pressed }) => [
                    styles.actionItem,
                    index < actions.length - 1 && styles.actionItemBorder,
                    pressed && styles.actionItemPressed,
                    { borderColor: colors.hairlineBorder },
                  ]}
                  accessibilityLabel={action.label}
                  accessibilityRole="button"
                >
                  <IconComponent
                    size={22}
                    color={action.color || colors.textPrimary}
                    strokeWidth={2}
                    style={styles.actionIcon}
                  />
                  <Text
                    style={[
                      styles.actionLabel,
                      {
                        color: action.color || colors.textPrimary,
                        fontSize: Typography.size.body,
                      },
                    ]}
                  >
                    {action.label}
                  </Text>
                </Pressable>
              );
            })}

            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.cancelButton,
                pressed && styles.actionItemPressed,
              ]}
              accessibilityLabel="Cancel"
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.cancelLabel,
                  {
                    color: colors.textPrimary,
                    fontSize: Typography.size.body,
                    fontWeight: Typography.weight.semibold,
                  },
                ]}
              >
                Cancel
              </Text>
            </Pressable>
          </GlassCard>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    paddingHorizontal: Spacing.md,
  },
  sheet: {
    width: '100%',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    minHeight: 52,
  },
  actionItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  actionItemPressed: {
    opacity: 0.7,
  },
  actionIcon: {
    marginRight: Spacing.md,
    width: 24,
  },
  actionLabel: {
    flex: 1,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  cancelLabel: {
    textAlign: 'center',
  },
});

export default PostActionSheet;

