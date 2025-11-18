import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Provides consistent layout measurements across all screens
 * Handles header, tab bar, and content padding calculations
 */
export function useScreenLayout() {
  const insets = useSafeAreaInsets();
  
  const HEADER_HEIGHT = 56;
  const TAB_BAR_BASE_HEIGHT = 56;
  const TAB_BAR_PADDING = Platform.OS === 'ios' ? 12 : 12;
  
  // Tab bar total height includes safe area and padding
  const tabBarHeight = TAB_BAR_BASE_HEIGHT + TAB_BAR_PADDING + (Platform.OS === 'ios' ? Math.max(insets.bottom - 8, 12) : 12);
  
  return {
    // Header measurements
    headerHeight: HEADER_HEIGHT + insets.top,
    headerContentHeight: HEADER_HEIGHT,
    
    // Tab bar measurements
    tabBarHeight,
    tabBarBaseHeight: TAB_BAR_BASE_HEIGHT,
    
    // Content padding (when header is NOT transparent)
    contentPaddingTop: 0, // Header is in the layout, not overlapping
    
    // Content padding bottom to account for floating tab bar
    contentPaddingBottom: tabBarHeight + 20, // Extra 20 for visual breathing room
    
    // Safe area insets (for manual use)
    insets,
  };
}

