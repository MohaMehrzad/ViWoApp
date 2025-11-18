import { Layout, LiquidGlass, Motion, Spacing, Typography } from '@/constants/theme';
import { useVCoin } from '@/contexts/VCoinContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { formatVCoinBalance } from '@/utils/formatters';
import { HapticFeedback } from '@/utils/haptics';
import { getFlexDirection } from '@/utils/rtl';
import { LucideIcons } from '@/utils/iconMapping';
import { BlurView } from '@react-native-community/blur';
import { useRouter } from 'expo-router';
import React from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HeaderProps {
  title?: string;
}

export function Header({ title = '' }: HeaderProps) {
  const { isDark, colors, glassFill, hairlineBorder, blurType } = useTheme();
  const { balance } = useVCoin();
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isIOS = Platform.OS === 'ios';
  const [balanceLoaded, setBalanceLoaded] = React.useState(false);
  const [prevBalance, setPrevBalance] = React.useState(balance);
  
  // Animated values
  const avatarScale = React.useRef(new Animated.Value(1)).current;
  const searchScale = React.useRef(new Animated.Value(1)).current;
  const vcoinScale = React.useRef(new Animated.Value(1)).current;
  const vcoinPulse = React.useRef(new Animated.Value(1)).current;

  // Track when balance is loaded to prevent flash
  React.useEffect(() => {
    if (balance >= 0) {
      setBalanceLoaded(true);
    }
  }, [balance]);
  
  // Pulse animation when balance changes
  React.useEffect(() => {
    if (balance !== prevBalance && balanceLoaded) {
      Animated.sequence([
        Animated.spring(vcoinPulse, {
          toValue: 1.15,
          ...Motion.spring.bouncy,
          useNativeDriver: true,
        }),
        Animated.spring(vcoinPulse, {
          toValue: 1,
          ...Motion.spring.snappy,
          useNativeDriver: true,
        }),
      ]).start();
      setPrevBalance(balance);
    }
  }, [balance, prevBalance, balanceLoaded, vcoinPulse]);

  const handleProfilePress = () => {
    HapticFeedback.light();
    // Animate press
    Animated.sequence([
      Animated.spring(avatarScale, {
        toValue: 0.9,
        ...Motion.spring.snappy,
        useNativeDriver: true,
      }),
      Animated.spring(avatarScale, {
        toValue: 1,
        ...Motion.spring.bouncy,
        useNativeDriver: true,
      }),
    ]).start();
    
    if (user?.id) {
      router.push(`/profile/${user.id}`);
    }
  };

  const handleSearchPress = () => {
    HapticFeedback.light();
    // Animate press
    Animated.sequence([
      Animated.spring(searchScale, {
        toValue: 0.9,
        ...Motion.spring.snappy,
        useNativeDriver: true,
      }),
      Animated.spring(searchScale, {
        toValue: 1,
        ...Motion.spring.bouncy,
        useNativeDriver: true,
      }),
    ]).start();
    
    router.push('/search');
  };

  const handleVCoinPress = () => {
    HapticFeedback.light();
    // Animate press
    Animated.sequence([
      Animated.spring(vcoinScale, {
        toValue: 0.95,
        ...Motion.spring.snappy,
        useNativeDriver: true,
      }),
      Animated.spring(vcoinScale, {
        toValue: 1,
        ...Motion.spring.bouncy,
        useNativeDriver: true,
      }),
    ]).start();
    
    router.push('/defi');
  };

  const handleVCoinLongPress = () => {
    HapticFeedback.medium();
    // Optional: Show quick actions menu
    // Could implement: Copy address, View rewards, etc.
  };

  // Format balance consistently (always show integers, no decimals)
  const formattedBalance = formatVCoinBalance(balance, { showCurrency: false, showDecimals: false });

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          backgroundColor: 'transparent',
        },
      ]}
    >
      {/* Background - Pure glass blur like iOS Control Center */}
      <View style={StyleSheet.absoluteFill}>
        <BlurView
          blurType={blurType}
          blurAmount={LiquidGlass.blur.intensity.appleGlass}
          reducedTransparencyFallbackColor="transparent"
          style={StyleSheet.absoluteFill}
        />
        
        {/* Bottom border */}
        <View
          style={[
            styles.bottomBorder,
            { backgroundColor: hairlineBorder },
          ]}
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Left side - Profile Avatar */}
        <View style={styles.leftSection}>
          <Animated.View style={{ transform: [{ scale: avatarScale }] }}>
            <Pressable
              onPress={handleProfilePress}
              style={({ pressed }) => [
                styles.avatarButton,
                {
                  backgroundColor: glassFill(LiquidGlass.fillIntensity.subtle),
                  borderWidth: StyleSheet.hairlineWidth,
                  borderColor: colors.accent + Math.round(LiquidGlass.accentBorderOpacity.subtle * 255).toString(16).padStart(2, '0'),
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
              accessibilityLabel="Your profile"
              accessibilityRole="button"
              accessibilityHint="Double tap to view your profile"
            >
              <LucideIcons.user size={20} color={colors.textPrimary} strokeWidth={2} />
            </Pressable>
          </Animated.View>
        </View>

        {/* Center - Title */}
        <View style={[styles.centerSection, styles.centerAligned]}>
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
        </View>

        {/* Right side - Search + VCoin Badge */}
        <View style={styles.rightSection}>
          {/* Search Button */}
          <Animated.View style={{ transform: [{ scale: searchScale }] }}>
            <Pressable
              onPress={handleSearchPress}
              style={({ pressed }) => [
                styles.iconButton,
                {
                  backgroundColor: glassFill(LiquidGlass.fillIntensity.subtle),
                  borderWidth: StyleSheet.hairlineWidth,
                  borderColor: colors.accent + Math.round(LiquidGlass.accentBorderOpacity.subtle * 255).toString(16).padStart(2, '0'),
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
              accessibilityLabel="Search"
              accessibilityRole="button"
              accessibilityHint="Double tap to search for users"
            >
              <LucideIcons.search size={Layout.icon.sm} color={colors.textPrimary} strokeWidth={2} />
            </Pressable>
          </Animated.View>

          {/* VCoin Badge */}
          <Animated.View style={{ transform: [{ scale: Animated.multiply(vcoinScale, vcoinPulse) }] }}>
            <Pressable
              onPress={handleVCoinPress}
              onLongPress={handleVCoinLongPress}
              style={({ pressed }) => [
                styles.vcoinBadge,
                {
                  backgroundColor: glassFill(LiquidGlass.fillIntensity.subtle),
                  borderRadius: Layout.header.vcoinBadge.height / 2,
                  borderWidth: StyleSheet.hairlineWidth,
                  borderColor: colors.accent + Math.round(LiquidGlass.accentBorderOpacity.normal * 255).toString(16).padStart(2, '0'),
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
              accessibilityLabel="VCoin balance"
              accessibilityRole="button"
              accessibilityHint={`${formattedBalance} VCoin. Double tap to view DeFi screen`}
            >
              {/* VCoin icon */}
              <LucideIcons.bitcoin
                size={Layout.header.vcoinBadge.iconSize}
                color={colors.accent}
                strokeWidth={2}
                style={styles.vcoinIcon}
              />

              {/* Balance */}
              {balanceLoaded && (
                <Text
                  style={[
                    styles.vcoinBalance,
                    {
                      color: colors.accent,
                      fontSize: Typography.size.body2,
                      fontWeight: Typography.weight.bold,
                    },
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {formattedBalance} VCN
                </Text>
              )}
            </Pressable>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  bottomBorder: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
  },
  content: {
    flexDirection: 'row', // RTL handled by getFlexDirection if needed
    alignItems: 'center',
    justifyContent: 'space-between',
    height: Layout.header.height,
    paddingHorizontal: Spacing.md,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 2,
  },
  centerAligned: {
    alignItems: 'center',
  },
  rightSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Layout.header.spacing,
  },
  title: {
    textAlign: 'center',
  },
  avatarButton: {
    width: Layout.avatar.small,
    height: Layout.avatar.small,
    borderRadius: Layout.avatar.small / 2,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: Layout.tapTargetMin,
    minWidth: Layout.tapTargetMin,
  },
  avatarEmoji: {
    fontSize: Layout.avatar.small * 0.6, // 60% of container
  },
  iconButton: {
    width: Layout.avatar.small,
    height: Layout.avatar.small,
    borderRadius: Layout.avatar.small / 2,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: Layout.tapTargetMin,
    minWidth: Layout.tapTargetMin,
  },
  vcoinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    height: Layout.header.vcoinBadge.height,
    paddingHorizontal: Layout.header.vcoinBadge.horizontalPadding,
    minHeight: Layout.tapTargetMin,
    minWidth: Layout.tapTargetMin,
  },
  vcoinIcon: {
    marginRight: 6,
  },
  vcoinBalance: {
    letterSpacing: Typography.letterSpacing.uppercase,
  },
});

