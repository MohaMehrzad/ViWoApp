import { Colors, getGlassFill, getHairlineBorder, LiquidGlass } from '@/constants/theme';
import { useThemeContext } from '@/contexts/ThemeContext';

export function useTheme() {
  const { actualTheme } = useThemeContext();
  const isDark = actualTheme === 'dark';

  return {
    isDark,
    colors: isDark ? Colors.dark : Colors.light,
    glassFill: (alphaAdjust?: number) => getGlassFill(isDark, alphaAdjust),
    hairlineBorder: getHairlineBorder(isDark),
    // For @react-native-community/blur
    blurType: (isDark ? LiquidGlass.blur.type.dark : LiquidGlass.blur.type.light) as 'dark' | 'light' | 'xlight' | 'extraDark' | 'regular' | 'prominent',
    // Legacy for compatibility during migration
    blurTint: isDark ? 'dark' : 'light',
  };
}

