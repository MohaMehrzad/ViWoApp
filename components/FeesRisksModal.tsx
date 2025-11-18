import { Spacing, Typography, LiquidGlass } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { LucideIcons } from '@/utils/iconMapping';
import { BlurView } from '@react-native-community/blur';
import React, { useState, useEffect } from 'react';
import {
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
    BackHandler,
    LayoutAnimation,
    UIManager
} from 'react-native';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassButton } from './GlassButton';
import { GlassCard } from './GlassCard';

interface AccordionItemProps {
  title: string;
  content: string;
  isExpanded: boolean;
  onToggle: () => void;
}

function AccordionItem({ title, content, isExpanded, onToggle }: AccordionItemProps) {
  const { colors } = useTheme();

  const handleToggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onToggle();
  };

  return (
    <GlassCard padding="md" style={styles.accordionCard} interactive>
      <Pressable onPress={handleToggle}>
        <View style={styles.accordionHeader}>
          <Text
            style={[
              styles.accordionTitle,
              {
                color: colors.textPrimary,
                fontSize: Typography.size.body,
                fontWeight: Typography.weight.bold,
              },
            ]}
          >
            {title}
          </Text>
          {isExpanded ? (
            <LucideIcons.chevronUp
              size={20}
              color={colors.textSecondary}
              strokeWidth={2}
            />
          ) : (
            <LucideIcons.chevronDown
              size={20}
              color={colors.textSecondary}
              strokeWidth={2}
            />
          )}
        </View>
      </Pressable>
      {isExpanded && (
        <Text
          style={[
            styles.accordionContent,
            {
              color: colors.textSecondary,
              fontSize: Typography.size.body2,
              lineHeight: Typography.lineHeight.body2,
              marginTop: Spacing.sm,
            },
          ]}
        >
          {content}
        </Text>
      )}
    </GlassCard>
  );
}

interface FeesRisksModalProps {
  visible: boolean;
  onClose: () => void;
}

export function FeesRisksModal({ visible, onClose }: FeesRisksModalProps) {
  const { colors, blurType, glassFill } = useTheme();
  const insets = useSafeAreaInsets();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const isWeb = Platform.OS === 'web';

  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (visible) {
        onClose();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [visible, onClose]);

  const sections = [
    {
      id: 'network-fees',
      title: 'Network Fees',
      content:
        'Network fees vary based on blockchain congestion. Typical fees range from 0.1-2 VCN per transaction. These fees go to network validators, not ViWoApp. We display estimated fees before each transaction.',
    },
    {
      id: 'staking',
      title: 'Staking Lockups',
      content:
        'When you stake VCoin, your tokens are locked for a minimum period (typically 7-30 days depending on the plan). During this time, you cannot withdraw or transfer these tokens. Early unstaking may incur penalties of up to 5% of staked amount.',
    },
    {
      id: 'slashing',
      title: 'Slashing Risk',
      content:
        'Slashing risk is minimal for delegated staking on ViWoApp. However, if network validators misbehave, a portion of staked tokens (typically <1%) may be slashed. We only work with reputable, highly-secure validators to minimize this risk.',
    },
    {
      id: 'rewards',
      title: 'Reward Calculations',
      content:
        'Engagement rewards: Like (+1 VCN), Share (+2 VCN), Repost (+3 VCN). Staking rewards: 5-12% APY depending on lockup period. Rewards are calculated daily and distributed weekly. Abuse detection may cap or revoke rewards for suspicious activity.',
    },
    {
      id: 'security',
      title: 'Security & Custody',
      content:
        'Your VCoin is secured using industry-standard encryption. We use multi-signature wallets and cold storage for the majority of platform funds. However, you are responsible for keeping your account credentials secure. Never share your password or recovery phrase.',
    },
  ];

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* Blurred Backdrop */}
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
        accessibilityLabel="Close modal"
        accessibilityRole="button"
      >
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
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                // @ts-ignore - Web only
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
              },
            ]}
          />
        )}
      </Pressable>

      <View 
        style={[styles.container, { backgroundColor: colors.background }]}
        onStartShouldSetResponder={() => true}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
          <Text
            style={[
              styles.headerTitle,
              {
                color: colors.textPrimary,
                fontSize: Typography.size.h2,
                fontWeight: Typography.weight.bold,
              },
            ]}
          >
            Fees & Risks
          </Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <LucideIcons.close size={28} color={colors.textPrimary} strokeWidth={2} />
          </Pressable>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
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
            Understanding fees and risks is essential for safe participation in the ViWoApp
            ecosystem. Review each section below for detailed information.
          </Text>

          {sections.map((section) => (
            <AccordionItem
              key={section.id}
              title={section.title}
              content={section.content}
              isExpanded={expandedSection === section.id}
              onToggle={() => toggleSection(section.id)}
            />
          ))}

          {/* Important Notice */}
          <GlassCard padding="md" style={styles.noticeCard}>
            <View style={styles.noticeHeader}>
              <LucideIcons.warning
                size={24}
                color={colors.warning}
                strokeWidth={2}
                style={{ marginRight: Spacing.sm }}
              />
              <Text
                style={[
                  styles.noticeTitle,
                  {
                    color: colors.warning,
                    fontSize: Typography.size.body,
                    fontWeight: Typography.weight.bold,
                  },
                ]}
              >
                Important Notice
              </Text>
            </View>
            <Text
              style={[
                styles.noticeText,
                {
                  color: colors.textSecondary,
                  fontSize: Typography.size.body2,
                  lineHeight: Typography.lineHeight.body2,
                  marginTop: Spacing.sm,
                },
              ]}
            >
              Cryptocurrency transactions are irreversible. Always double-check recipient
              addresses and amounts before confirming. ViWoApp cannot reverse or refund
              completed transactions.
            </Text>
          </GlassCard>
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) + Spacing.md }]}>
          <GlassButton onPress={onClose} variant="primary">
            I Understand
          </GlassButton>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    flex: 1,
    marginTop: 40,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    // paddingTop set dynamically with safe area insets
  },
  headerTitle: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  description: {
    marginBottom: Spacing.lg,
  },
  accordionCard: {
    marginBottom: Spacing.sm,
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accordionTitle: {},
  accordionContent: {
    opacity: 0.9,
  },
  noticeCard: {
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 200, 87, 0.3)',
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noticeTitle: {},
  noticeText: {},
  footer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    // paddingBottom set dynamically with safe area insets
  },
});

