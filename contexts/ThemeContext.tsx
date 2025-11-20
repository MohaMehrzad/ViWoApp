import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme as useRNColorScheme, Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  themeMode: ThemeMode;
  actualTheme: 'light' | 'dark';
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@viwo_theme_preference';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useRNColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

  // Calculate actual theme based on mode and system preference
  const actualTheme: 'light' | 'dark' = 
    themeMode === 'system' 
      ? (systemColorScheme || 'dark') 
      : themeMode;

  // Load saved theme preference on mount - non-blocking
  useEffect(() => {
    loadThemePreference();
  }, []);

  // Listen to system theme changes when in system mode
  useEffect(() => {
    if (themeMode === 'system') {
      const subscription = Appearance.addChangeListener(() => {
        // Force re-render when system theme changes
      });
      return () => subscription.remove();
    }
  }, [themeMode]);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system')) {
        setThemeModeState(savedTheme as ThemeMode);
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      setThemeModeState(mode);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  const toggleTheme = async () => {
    const newMode = actualTheme === 'light' ? 'dark' : 'light';
    await setThemeMode(newMode);
  };

  // Render immediately with default theme - hydrate asynchronously
  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        actualTheme,
        setThemeMode,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

