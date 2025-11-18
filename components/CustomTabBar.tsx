import { Layout, LiquidGlass, Motion, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useBackgroundLuminance, BackgroundPresets } from '@/hooks/useBackgroundLuminance';
import { BlurView } from '@react-native-community/blur';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import React from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getAdaptiveIconColor } from '@/utils/luminance';

/**
 * CustomTabBar with Adaptive Icon System
 * 
 * Implements dynamic icon contrast based on background luminance.
 * Icons automatically switch between light and dark variants to ensure
 * optimal contrast and WCAG AA compliance.
 * 
 * Features:
 * - Adaptive icon colors based on background luminance
 * - Smooth sliding active indicator with glass effect
 * - Per-icon luminance tracking (active vs inactive)
 * - Theme-aware with automatic updates
 * 
 * @see components/AdaptiveTabBar.md for full documentation
 */
export const CustomTabBar = React.memo(({ state, descriptors, navigation }: BottomTabBarProps) => {
  const { colors, blurType, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  // Background luminance tracking for adaptive icons
  // Automatically detects theme and updates icon colors accordingly
  const { luminance, updateLuminance } = useBackgroundLuminance({
    autoUpdate: true,
    defaultLuminance: isDark ? BackgroundPresets.darkBackground : BackgroundPresets.lightBackground,
  });

  // Animated values for smooth transitions
  const animatedValues = React.useRef(
    state.routes.map(() => new Animated.Value(0))
  ).current;

  // Animated value for the sliding background indicator
  const slideAnim = React.useRef(new Animated.Value(state.index)).current;
  
  // Store tab positions for precise alignment
  const [tabPositions, setTabPositions] = React.useState<number[]>([]);
  
  // Store individual icon colors based on their position
  const [iconLuminances, setIconLuminances] = React.useState<number[]>(
    state.routes.map(() => luminance)
  );

  React.useEffect(() => {
    // Animate the selected tab icons
    animatedValues.forEach((anim, index) => {
      Animated.spring(anim, {
        toValue: state.index === index ? 1 : 0,
        ...Motion.spring.snappy,
        useNativeDriver: false,
      }).start();
    });

    // Animate the sliding background
    Animated.spring(slideAnim, {
      toValue: state.index,
      ...Motion.spring.smooth,
      useNativeDriver: true,
    }).start();

    // Update luminance for icons based on active state
    // ADAPTIVE ICON SYSTEM:
    // - Active icon: Sits over bright lime (#C6FF3D) indicator → high luminance → dark icon
    // - Inactive icons: Sit over glass background → theme luminance → adaptive color
    // This ensures optimal contrast in all scenarios
    const newLuminances = state.routes.map((_, index) => {
      if (state.index === index) {
        // Icon is over the bright lime background - use very high luminance
        // This triggers dark icon color for maximum contrast on bright background
        return 0.9; // High luminance for bright lime background
      } else {
        // Icon is over glass background - use theme-based luminance
        // This triggers adaptive color based on light/dark mode
        return luminance; // ~0.95 (light) or ~0.1 (dark)
      }
    });
    setIconLuminances(newLuminances);
  }, [state.index, luminance]);

  const tabBarHeight = Layout.bottomBar.height + 16;
  const bottomPadding = Math.max(insets.bottom + 6, 18); // Unified padding for both platforms
  
  const borderRadius = tabBarHeight / 2;
  
  // Horizontal insets for pill shape (unified for both platforms)
  const horizontalInset = 32; // Unified 32dp for both iOS and Android

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.container,
        {
          paddingBottom: bottomPadding,
          paddingHorizontal: horizontalInset,
        },
      ]}
    >
      <View
        style={[
          styles.tabBar,
          {
            height: tabBarHeight,
            borderRadius, // Apply borderRadius to outer container
            overflow: 'hidden', // Critical: Ensures children clip to rounded corners
          },
        ]}
      >
        {/* Pure glass blur - NO white fill overlay */}
        <BlurView
          blurType={blurType}
          blurAmount={LiquidGlass.blur.intensity.appleGlass}
          reducedTransparencyFallbackColor="transparent"
          style={StyleSheet.absoluteFill}
        />
        
        {/* Border to define rounded shape (like iOS Control Center) */}
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: colors.hairlineBorder,
            },
          ]}
          pointerEvents="none"
        />

        {/* Tab items */}
        <View style={styles.tabContent}>
          {/* Sliding background indicator - sized to icon */}
          {tabPositions.length === state.routes.length && (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.activeIndicator,
                {
                  transform: [{
                    translateX: slideAnim.interpolate({
                      inputRange: state.routes.map((_, i) => i),
                      outputRange: tabPositions,
                    }),
                  }],
                  overflow: 'hidden',
                },
              ]}
            >
              {/* Blur layer for depth */}
              <BlurView
                blurType={blurType}
                blurAmount={20}
                reducedTransparencyFallbackColor={colors.create}
                style={StyleSheet.absoluteFill}
              />
              {/* Color overlay with transparency - bright lime create color */}
              <View
                style={[
                  StyleSheet.absoluteFill,
                  {
                    backgroundColor: colors.create,
                    opacity: 0.85,
                  },
                ]}
              />
              {/* Subtle inner glow for glass effect */}
              <View
                style={[
                  StyleSheet.absoluteFill,
                  {
                    borderRadius: 28,
                    borderWidth: StyleSheet.hairlineWidth,
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                  },
                ]}
                pointerEvents="none"
              />
            </Animated.View>
          )}

          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }

              // Haptic feedback on both iOS and Android
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });

              // Haptic feedback on both iOS and Android
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            };

            // ADAPTIVE ICON COLOR CALCULATION
            // Get the luminance value for this specific icon's position
            const iconLuma = iconLuminances[index] || luminance;
            
            // Calculate adaptive icon color based on background luminance:
            // - Focused: Use createContrast from theme for dark color on bright lime indicator
            // - Unfocused: Adaptive color via getAdaptiveIconColor()
            //   • Light bg (luma ≥ 0.55) → Dark icon (rgba(17, 24, 39, 0.88))
            //   • Dark bg (luma < 0.55) → Light icon (rgba(248, 250, 252, 0.92))
            const iconColor = isFocused 
              ? colors.createContrast // Theme color for contrast on bright lime
              : getAdaptiveIconColor(iconLuma, isDark);

            // Get the icon component
            const iconComponent = options.tabBarIcon?.({
              focused: isFocused,
              color: iconColor,
              size: Layout.bottomBar.iconSize,
            });

            return (
              <View
                key={index}
                style={styles.tabWrapper}
                onLayout={(e) => {
                  const { x, width } = e.nativeEvent.layout;
                  const center = x + width / 2;
                  setTabPositions(prev => {
                    const newPositions = [...prev];
                    newPositions[index] = center;
                    return newPositions;
                  });
                }}
              >
                <Pressable
                  onPress={onPress}
                  onLongPress={onLongPress}
                  style={styles.tab}
                >
                  {/* Icon with scale animation */}
                  <Animated.View
                    style={[
                      styles.iconContainer,
                      {
                        transform: [
                          {
                            scale: animatedValues[index].interpolate({
                              inputRange: [0, 1],
                              outputRange: [1, 1.1],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    {iconComponent}
                  </Animated.View>
                </Pressable>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}, (prevProps, nextProps) => {
  // Only re-render if the active tab index changes
  return prevProps.state.index === nextProps.state.index;
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    // Shadow/elevation for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
    // overflow: 'hidden' set dynamically in component for proper clipping
  },
  tabContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.sm,
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    left: -28, // Offset by half width so translateX positions from center
    top: '50%',
    marginTop: -28, // Center the pill vertically (half of height)
    // Enhanced shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  tabWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    minHeight: Layout.tapTargetMin,
    width: '100%',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
});
