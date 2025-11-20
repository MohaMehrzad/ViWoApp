/**
 * ViWoApp Design Tokens
 * Complete design system based on Liquid Glass aesthetic
 */

import { Platform } from 'react-native';

// Brand Color Scales (from color.md)
export const BrandColors = {
  // Primary Brand - Purple
  purple: {
    50: '#F5F3FF',
    100: '#EDE9FE',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#A855F7', // Primary dark mode
    600: '#9333EA',
    700: '#7B3FFF', // Primary light mode
    800: '#6929FF',
    900: '#5C2BCC',
  },
  
  // Secondary - Cyan
  cyan: {
    50: '#ECFEFF',
    100: '#CFFAFE',
    200: '#A5F3FC',
    300: '#67E8F9',
    400: '#22D3EE',
    500: '#06B6D4', // Primary dark mode
    600: '#00B8D4', // Primary light mode
    700: '#0891B2',
    800: '#0E7490',
    900: '#155E75',
  },
  
  // Accent (VCoin) - Gray Scale
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB', // Primary dark mode - visible on dark backgrounds
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151', // Primary light mode - dark gray
    800: '#1F2937',
    900: '#111827',
  },
};

// Color tokens (light/dark aware)
export const Colors = {
  light: {
    // Base background
    background: '#F7FAFF',
    
    // Primary Brand Color (Purple)
    primary: '#7B3FFF',
    primaryHover: '#6929FF',
    primaryLight: '#9D66FF',
    primaryDark: '#5C2BCC',
    
    // Secondary Color (Cyan - Social)
    secondary: '#00B8D4',
    secondaryHover: '#0097A7',
    secondaryLight: '#26C6DA',
    secondaryDark: '#00838F',
    
    // Accent Color (Gray - VCoin ONLY)
    accent: '#374151',
    accentHover: '#4B5563',
    accentLight: '#6B7280',
    accentDark: '#1F2937',
    
    // Create/Action Color (Bright Lime - FAB & Creation Buttons)
    create: '#C6FF3D',
    createHover: '#D4FF61',
    createDark: '#B8F029',
    createContrast: '#1F2937', // Dark color for text/icons on bright create background
    
    // Surface Hierarchy
    surface1: '#FFFFFF', // Elevated cards
    surface2: '#F0F4FA', // Modal backgrounds
    surface3: '#E6EDF7', // Highest elevation
    
    // Overlays
    backdrop: 'rgba(247, 250, 255, 0.85)',
    modalScrim: 'rgba(0, 0, 0, 0.40)',
    
    // Text Hierarchy
    textPrimary: '#0B0F14',
    textSecondary: '#2E3E4E',
    textTertiary: '#566475',
    textDisabled: 'rgba(11, 15, 20, 0.38)',
    placeholder: 'rgba(46, 62, 78, 0.90)',
    
    // Semantic Colors
    success: '#10B981',
    successHover: '#059669',
    successLight: '#34D399',
    successDark: '#047857',
    
    warning: '#F59E0B',
    warningHover: '#D97706',
    warningLight: '#FCD34D',
    warningDark: '#B45309',
    
    danger: '#DC2626',
    dangerHover: '#B91C1C',
    dangerLight: '#EF4444',
    dangerDark: '#991B1B',
    
    error: '#DC2626', // Alias for danger
    errorHover: '#B91C1C',
    errorLight: '#EF4444',
    errorDark: '#991B1B',
    
    info: '#3B82F6',
    infoHover: '#2563EB',
    infoLight: '#60A5FA',
    infoDark: '#1D4ED8',
    
    // Glass Effects
    glassFill: 'rgba(255, 255, 255, 0.70)',
    glassBorder: 'rgba(0, 0, 0, 0.18)',
    appleGlassFill: 'rgba(246, 246, 246, 0.72)',
    androidTranslucentBg: 'rgba(247, 250, 255, 0.85)',
    hairlineBorder: 'rgba(0, 0, 0, 0.18)',
    border: 'rgba(0, 0, 0, 0.18)',
    cardFallback: '#FFFFFF',
    
    // Link States
    link: '#7B3FFF',
    linkVisited: '#5C2BCC',
    linkHover: '#9D66FF',
    linkActive: '#6929FF',
  },
  dark: {
    // Base background
    background: '#1B1B1B',
    
    // Primary Brand Color (Purple)
    primary: '#A855F7',
    primaryHover: '#C084FC',
    primaryLight: '#D8B4FE',
    primaryDark: '#9333EA',
    
    // Secondary Color (Cyan - Social)
    secondary: '#06B6D4',
    secondaryHover: '#22D3EE',
    secondaryLight: '#67E8F9',
    secondaryDark: '#0891B2',
    
    // Accent Color (Gray - VCoin ONLY)
    accent: '#D1D5DB',
    accentHover: '#E5E7EB',
    accentLight: '#F3F4F6',
    accentDark: '#9CA3AF',
    
    // Create/Action Color (Bright Lime - FAB & Creation Buttons)
    create: '#C6FF3D',
    createHover: '#D4FF61',
    createDark: '#B8F029',
    createContrast: '#1B1B1B', // Dark color for text/icons on bright create background
    
    // Surface Hierarchy
    surface1: '#252525', // Elevated cards
    surface2: '#2E2E2E', // Modal backgrounds
    surface3: '#383838', // Highest elevation
    
    // Overlays
    backdrop: 'rgba(27, 27, 27, 0.85)',
    modalScrim: 'rgba(0, 0, 0, 0.60)',
    
    // Text Hierarchy
    textPrimary: '#F3F4F6',
    textSecondary: '#D1D5DB',
    textTertiary: '#9CA3AF',
    textDisabled: 'rgba(243, 244, 246, 0.38)',
    placeholder: 'rgba(209, 213, 219, 0.90)',
    
    // Semantic Colors
    success: '#49E79A',
    successHover: '#6EF5AB',
    successLight: '#A7F3D0',
    successDark: '#10B981',
    
    warning: '#FFC857',
    warningHover: '#FFD97D',
    warningLight: '#FFE4A3',
    warningDark: '#F59E0B',
    
    danger: '#FF6B6B',
    dangerHover: '#FF8888',
    dangerLight: '#FFA5A5',
    dangerDark: '#FF4545',
    
    error: '#FF6B6B', // Alias for danger
    errorHover: '#FF8888',
    errorLight: '#FFA5A5',
    errorDark: '#FF4545',
    
    info: '#60A5FA',
    infoHover: '#93C5FD',
    infoLight: '#BFDBFE',
    infoDark: '#3B82F6',
    
    // Glass Effects
    glassFill: 'rgba(255, 255, 255, 0.06)',
    glassBorder: 'rgba(255, 255, 255, 0.15)',
    appleGlassFill: 'rgba(27, 27, 27, 0.72)',
    androidTranslucentBg: 'rgba(37, 37, 37, 0.85)',
    hairlineBorder: 'rgba(255, 255, 255, 0.15)',
    border: 'rgba(255, 255, 255, 0.15)',
    cardFallback: '#252525',
    
    // Link States
    link: '#A855F7',
    linkVisited: '#9333EA',
    linkHover: '#C084FC',
    linkActive: '#7B3FFF',
  },
};

// Gradient Definitions
export const Gradients = {
  // Purple Dream (Premium) - For hero sections, premium features, CTAs
  purpleDream: 'linear-gradient(135deg, #7B3FFF 0%, #A855F7 100%)',
  purpleDreamColors: ['#7B3FFF', '#A855F7'],
  purpleDreamAngle: 135,
  
  // Crypto Glow (VCoin) - For VCoin balance displays, reward notifications
  cryptoGlow: 'linear-gradient(135deg, #1E40AF 0%, #1E3A8A 50%, #0F172A 100%)',
  cryptoGlowColors: ['#1E40AF', '#1E3A8A', '#0F172A'],
  cryptoGlowAngle: 135,
  
  // Ocean Wave (Social) - For social features, message backgrounds
  oceanWave: 'linear-gradient(135deg, #06B6D4 0%, #00B8D4 50%, #7B3FFF 100%)',
  oceanWaveColors: ['#06B6D4', '#00B8D4', '#7B3FFF'],
  oceanWaveAngle: 135,
  
  // Aurora (Special Events) - For special events, achievements, highlights
  aurora: 'linear-gradient(135deg, #A855F7 0%, #06B6D4 50%, #1E40AF 100%)',
  auroraColors: ['#A855F7', '#06B6D4', '#1E40AF'],
  auroraAngle: 135,
  
  // Liquid Glass Shimmer (Subtle) - For card highlights, glass effect enhancements
  liquidGlassShimmer: 'linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)',
  liquidGlassShimmerColors: ['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.04)'],
  liquidGlassShimmerAngle: 180,
};

// Special UI Colors
export const SpecialColors = {
  // Verification Badge Colors
  verification: {
    basic: '#A8B8CC',      // Gray
    verified: '#06B6D4',   // Cyan
    premium: '#A855F7',    // Purple
    enterprise: '#1E40AF', // Dark Navy Blue
  },
  
  // Staking APY Colors (with gradients for different tiers)
  stakingAPY: {
    low: {
      // < 5% APY
      from: '#6B7C93',
      to: '#A8B8CC',
      threshold: 5,
    },
    medium: {
      // 5-15% APY
      from: '#06B6D4',
      to: '#22D3EE',
      threshold: 15,
    },
    high: {
      // 15-30% APY
      from: '#A855F7',
      to: '#C084FC',
      threshold: 30,
    },
    veryHigh: {
      // > 30% APY
      from: '#1E40AF',
      to: '#1E3A8A',
      threshold: Infinity,
    },
  },
  
  // Post Engagement Action Colors
  engagement: {
    like: '#FF6B6B',      // Coral - emotional
    share: '#06B6D4',     // Cyan - spreading
    repost: '#10B981',    // Green - amplifying
    comment: '#A8B8CC',   // Gray - neutral
    bookmark: '#1E40AF',  // Dark Navy Blue - saving value
  },
  
  // Reputation/Quality Score Colors (7 levels)
  reputation: {
    critical: '#DC2626',   // Red
    poor: '#F59E0B',       // Amber
    average: '#6B7C93',    // Gray
    good: '#06B6D4',       // Cyan
    excellent: '#10B981',  // Green
    outstanding: '#A855F7', // Purple
    legendary: '#1E40AF',  // Dark Navy Blue
  },
};

// Interactive States Configuration
export const InteractiveStates = {
  // Button States (Primary Purple)
  button: {
    default: '#A855F7',
    hover: '#C084FC',      // brightness +15%
    active: '#9333EA',     // brightness -10%, scale 0.98
    disabled: 'rgba(168, 85, 247, 0.38)',
    loading: '#A855F7',    // with opacity pulse animation
  },
  
  // Focus Ring
  focus: {
    color: '#A855F7',
    blur: 4,
    spread: 2,
    opacity: 0.5,
  },
  
  // Input States
  input: {
    defaultBorder: {
      light: 'rgba(0, 0, 0, 0.18)',
      dark: 'rgba(255, 255, 255, 0.15)',
    },
    focusBorder: '#A855F7',
    errorBorder: '#FF6B6B',
    successBorder: '#49E79A',
    disabledBackground: {
      light: 'rgba(0, 0, 0, 0.03)',
      dark: 'rgba(255, 255, 255, 0.03)',
    },
  },
};

// Spacing system (dp) - Enhanced for minimal design with more breathing room
export const Spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 20,
  lg: 28,
  xl: 36,
  xxl: 48,
};

// Border radius (dp)
export const Radius = {
  sm: 10,
  md: 16,
  lg: 24,
  xl: 28, // "Liquid Glass" major cards
  input: 12, // Input fields and form elements
};

// Typography - Enhanced for better readability
export const Typography = {
  fontFamily: {
    ios: 'SF Pro',
    android: 'Inter',
    web: 'Inter',
  },
  size: {
    h1: 32,
    h2: 24,
    h3: 20,
    body: 17,
    body2: 15,
    caption: 13,
  },
  lineHeight: {
    h1: 48, // 1.5x ratio
    h2: 34, // ~1.42x ratio
    h3: 28, // 1.4x ratio
    body: 24, // ~1.41x ratio
    body2: 21, // 1.4x ratio
    caption: 18, // ~1.38x ratio
  },
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  letterSpacing: {
    uppercase: 0.6, // Standardized for all uppercase labels
  },
};

// Motion/Animation durations (ms) - Enhanced for smooth, purposeful animations
export const Motion = {
  duration: {
    micro: 150,
    fast: 200,
    default: 250,
    slow: 350,
    page: 400,
    modal: 350,
    complex: 600,
  },
  // Spring physics presets for different interaction types
  spring: {
    // Gentle spring for subtle interactions (cards, small elements)
    gentle: {
      mass: 1,
      stiffness: 300,
      damping: 30,
    },
    // Bouncy spring for playful interactions (buttons, chips)
    bouncy: {
      mass: 1,
      stiffness: 500,
      damping: 25,
    },
    // Snappy spring for quick feedback (tabs, toggles)
    snappy: {
      mass: 0.8,
      stiffness: 400,
      damping: 24,
    },
    // Default spring (legacy support)
    mass: 1,
    stiffness: 400,
    damping: 24,
  },
  // Timing curve configurations
  timing: {
    // Entrance animations (elements appearing)
    entrance: {
      duration: 300,
      // iOS-like cubic-bezier: (0.22, 0.61, 0.36, 1)
      easing: 'ease-out',
    },
    // Exit animations (elements disappearing)
    exit: {
      duration: 200,
      // Quick fade out: (0.4, 0, 1, 1)
      easing: 'ease-in',
    },
    // Interactive feedback (user-initiated)
    interaction: {
      duration: 250,
      // Material-like: (0.4, 0, 0.2, 1)
      easing: 'ease-in-out',
    },
  },
  // Gesture-driven animation configs
  gesture: {
    swipe: {
      threshold: 50, // px
      velocity: 0.5, // px/ms
    },
    drag: {
      tension: 40,
      friction: 7,
    },
    scroll: {
      threshold: 10, // px before hiding/showing elements
    },
  },
};

// Liquid Glass configuration
export const LiquidGlass = {
  blur: {
    intensity: {
      /**
       * default (28px): Primary blur for standard cards/components
       * - Provides optimal balance between translucency and readability
       * - Used in: GlassCard, GlassButton, most UI elements
       * - Performance: ~60fps on mid-range devices
       */
      default: 28,
      /**
       * imageHeavy (36px): Stronger blur for content over complex images
       * - Used in: Modal backdrops, overlays with media backgrounds
       * - Ensures text readability over any backdrop
       */
      imageHeavy: 36,
      /**
       * lowEnd (20px): Fallback for low-end devices
       * - Automatically applied when performance monitor detects frame drops
       * - Maintains glass aesthetic while preserving performance
       */
      lowEnd: 20,
      /**
       * appleGlass (80px): iOS-style ultra-blur for headers/navigation
       * - Used in: Header, CustomTabBar, navigation elements
       * - Creates distinct separation from content area
       * - Matches iOS Control Center aesthetic
       */
      appleGlass: 80,
    },
    // @react-native-community/blur types
    // Options: 'xlight', 'light', 'dark', 'extraDark', 'regular', 'prominent'
    type: {
      dark: 'dark' as const,
      light: 'light' as const,
      extraDark: 'extraDark' as const,
      prominent: 'prominent' as const,
    },
  },
  saturationBoost: 1.08,
  verticalGradientAlpha: 0.02,
  /**
   * Glass fill intensity presets
   * - subtle: Light tint for minimal backgrounds
   * - normal: Standard glass fill for most components
   * - strong: More opaque for overlays and emphasis
   */
  fillIntensity: {
    subtle: 0.04,
    normal: 0.2,
    strong: 0.35,
  },
  /**
   * Accent border opacity levels
   * - subtle: For secondary elements (25%)
   * - normal: For standard interactive elements (40%)
   * - strong: For primary/focused elements (60%)
   */
  accentBorderOpacity: {
    subtle: 0.25,
    normal: 0.4,
    strong: 0.6,
  },
  /**
   * Border width constants
   * - hairline: Platform-specific thinnest line for dividers
   * - normal: Standard 1px for cards and buttons
   * - emphasis: Thicker 2px for focus states
   */
  borderWidth: {
    hairline: 'hairline' as const, // Will use StyleSheet.hairlineWidth
    normal: 1,
    emphasis: 2,
  },
  innerHighlightWidth: 1,
  shadow: {
    radius: 12,
    opacity: 0.25,
    elevation: 6,
  },
  /**
   * Text over media shadow for better legibility
   */
  textShadow: {
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  contrast: {
    bodyText: 4.5, // WCAG ratio
    icons: 7.0,
  },
  // Auto-backdrop adjustments
  backdropGuard: {
    highLuminance: 0.02, // Add to alpha
    lowLuminance: -0.02, // Subtract from alpha
  },
};

// Layout constants - Enhanced for better ergonomics and minimal design
export const Layout = {
  contentGutter: 20,
  cardSpacing: 20,
  tapTargetMin: 44,
  hitSlop: 14, // Standardized hit slop for all interactive elements
  bottomBar: {
    height: 56,
    iconSize: 24,
    labelSize: 11,
    spacing: 8, // Space between tabs
  },
  header: {
    height: 56,
    spacing: 12, // Space between header elements
    vcoinBadge: {
      height: 32,
      maxHeight: 36,
      horizontalPadding: 12,
      maxHorizontalPadding: 14,
      iconSize: 18,
      maxIconSize: 20,
    },
  },
  avatar: {
    small: 36,
    medium: 44,
    mediumLarge: 48, // For shorts and messages
    large: 56,
    xlarge: 96, // For profile screens
  },
  icon: {
    xs: 16, // Badges, small indicators
    sm: 20, // Buttons, secondary actions
    md: 24, // Primary actions, tab bar
    lg: 32, // Headers, emphasis
  },
  emptyState: {
    iconSize: 64,
  },
  media: {
    aspectRatio: {
      landscape: 16 / 9,
      portrait: 4 / 5,
    },
  },
  fab: {
    size: 60,
    iconSize: 30,
    bottomOffset: 36, // Increased for better clearance from tab bar
    rightOffset: 24,
  },
};

// VCoin earn values
export const VCoinRewards = {
  like: 1,
  share: 2,
  repost: 3,
};

// Performance thresholds
export const Performance = {
  targetFPS: 60,
  minimumFPS: 30,
  frameTimeBudget: 22, // ms - if exceeded for >1s, disable blur
  sustainedPoorPerformanceThreshold: 1000, // ms
  maxSimultaneousVideoDecodes: 1,
};

// Platform-specific helpers
export const getPlatformFont = () => {
  if (Platform.OS === 'ios') return Typography.fontFamily.ios;
  if (Platform.OS === 'android') return Typography.fontFamily.android;
  return Typography.fontFamily.web;
};

// Shadow presets (platform-aware)
export const getShadow = (elevation: number = 6) => {
  if (Platform.OS === 'ios' || Platform.OS === 'web') {
    return {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: elevation / 2 },
      shadowOpacity: LiquidGlass.shadow.opacity,
      shadowRadius: LiquidGlass.shadow.radius,
    };
  }
  return {
    elevation,
  };
};

// Glass fill with optional alpha adjustment
export const getGlassFill = (isDark: boolean, alphaAdjust: number = 0) => {
  if (isDark) {
    // Dark mode: use very subtle white overlay (barely visible, just adds slight depth)
    const baseAlpha = 0.04;
    const adjustedAlpha = Math.max(0, Math.min(1, baseAlpha + alphaAdjust));
    return `rgba(255, 255, 255, ${adjustedAlpha})`;
  } else {
    // Light mode: use white with opacity
    const baseAlpha = 0.40;
    const adjustedAlpha = Math.max(0, Math.min(1, baseAlpha + alphaAdjust));
    return `rgba(255, 255, 255, ${adjustedAlpha})`;
  }
};

// Hairline border color
export const getHairlineBorder = (isDark: boolean) => {
  return isDark ? Colors.dark.hairlineBorder : Colors.light.hairlineBorder;
};

export default {
  BrandColors,
  Colors,
  Gradients,
  SpecialColors,
  InteractiveStates,
  Spacing,
  Radius,
  Typography,
  Motion,
  LiquidGlass,
  Layout,
  VCoinRewards,
  Performance,
  getPlatformFont,
  getShadow,
  getGlassFill,
  getHairlineBorder,
};

