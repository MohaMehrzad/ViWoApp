import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useColorScheme } from '@/components/useColorScheme';
import { VCoinProvider } from '@/contexts/VCoinContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { SocketProvider } from '@/contexts/SocketContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { NetworkIndicator } from '@/components/NetworkIndicator';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Create a React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
    },
  },
});

// Using custom ErrorBoundary instead of expo-router's default
export { ErrorBoundary };

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <ThemedNavigationContainer />
          </ThemeProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

function ThemedNavigationContainer() {
  const colorScheme = useColorScheme();

  return (
    <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <SocketProvider>
          <VCoinProvider>
            <NetworkIndicator />
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="auth/login" options={{ headerShown: false }} />
              <Stack.Screen name="auth/register" options={{ headerShown: false }} />
              <Stack.Screen name="auth/forgot-password" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
              <Stack.Screen name="post-composer" options={{ presentation: 'modal', title: 'Create Post' }} />
              <Stack.Screen name="short-composer" options={{ presentation: 'modal', title: 'Create Short' }} />
              <Stack.Screen 
                name="profile/[id]" 
                options={{ 
                  headerShown: false,
                  animation: 'slide_from_right',
                }} 
              />
              <Stack.Screen name="chat/[threadId]" options={{ title: 'Chat' }} />
              <Stack.Screen name="vcoin/send" options={{ title: 'Send VCoin' }} />
              <Stack.Screen name="vcoin/receive" options={{ title: 'Receive VCoin' }} />
              <Stack.Screen name="vcoin/history" options={{ title: 'Transaction History' }} />
              <Stack.Screen name="staking/stake" options={{ title: 'Stake VCoin' }} />
              <Stack.Screen name="staking/my-stakes" options={{ title: 'My Stakes' }} />
              <Stack.Screen name="rewards-history" options={{ title: 'Rewards History' }} />
              <Stack.Screen name="leaderboard" options={{ title: 'Leaderboard' }} />
              <Stack.Screen name="search" options={{ title: 'Search' }} />
              <Stack.Screen name="verification/apply" options={{ title: 'Verification' }} />
            </Stack>
          </VCoinProvider>
        </SocketProvider>
      </AuthProvider>
    </NavigationThemeProvider>
  );
}
