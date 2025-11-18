import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Typography, Spacing } from '@/constants/theme';
import { LucideIcons } from '@/utils/iconMapping';

interface EditSectionProps {
  title: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export function EditSection({
  title,
  children,
  collapsible = false,
  defaultExpanded = true,
}: EditSectionProps) {
  const { colors } = useTheme();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const handleToggle = () => {
    if (collapsible) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={handleToggle}
        disabled={!collapsible}
        style={({ pressed }) => [
          styles.header,
          { opacity: pressed && collapsible ? 0.7 : 1 },
        ]}
      >
        <Text
          style={[
            styles.title,
            {
              color: colors.textPrimary,
              fontSize: Typography.size.h3,
              fontWeight: Typography.weight.bold,
            },
          ]}
        >
          {title}
        </Text>
        {collapsible && (
          <LucideIcons.chevronDown
            size={20}
            color={colors.textSecondary}
            strokeWidth={2}
            style={{
              transform: [{ rotate: isExpanded ? '0deg' : '-90deg' }],
            }}
          />
        )}
      </Pressable>
      {isExpanded && <View style={styles.content}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  title: {},
  content: {},
});

