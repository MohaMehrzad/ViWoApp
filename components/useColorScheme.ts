import { useThemeContext } from '@/contexts/ThemeContext';

export function useColorScheme() {
  const { actualTheme } = useThemeContext();
  return actualTheme;
}
