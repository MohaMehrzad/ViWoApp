/**
 * Error Boundary Component
 * Catches React errors and displays a fallback UI
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { LucideIcons } from '@/utils/iconMapping';
import { Typography, Spacing, Colors } from '@/constants/theme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to error reporting service
    if (__DEV__) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    // In production, you would send this to Sentry or similar service
    // Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  handleReload = () => {
    // In a real app, you might want to reload the entire app
    // For now, just reset the error boundary
    this.handleReset();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI with theme wrapper
      return (
        <ErrorFallbackUI 
          error={this.state.error}
          onReset={this.handleReset}
          onReload={this.handleReload}
        />
      );
    }

    return this.props.children;
  }
}

// Functional component wrapper - uses default colors to avoid ThemeProvider dependency
function ErrorFallbackUI({ error, onReset, onReload }: { error: Error | null, onReset: () => void, onReload: () => void }) {
  // Use default colors directly to avoid dependency on ThemeProvider
  const fallbackColors = {
    background: Colors.dark.background,
    textPrimary: Colors.dark.text,
    textSecondary: Colors.dark.textSecondary,
    textTertiary: Colors.dark.textTertiary,
    error: Colors.dark.error,
  };
  
  return (
    <View style={[styles.container, { backgroundColor: fallbackColors.background }]}>
      <View style={[styles.errorCard, { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 16, padding: Spacing.lg }]}>
        <View style={styles.iconContainer}>
          <LucideIcons.alertCircle size={64} color={fallbackColors.error} strokeWidth={2} />
        </View>

        <Text style={[styles.title, { color: fallbackColors.textPrimary }]}>Oops! Something went wrong</Text>

        <Text style={[styles.message, { color: fallbackColors.textSecondary }]}>
          We're sorry for the inconvenience. The app encountered an unexpected error.
        </Text>

        {__DEV__ && error && (
          <View style={[styles.errorDetails, { 
            backgroundColor: fallbackColors.error + '1A',
            borderColor: fallbackColors.error + '4D'
          }]}>
            <Text style={[styles.errorTitle, { color: fallbackColors.error }]}>Error Details (Dev Only):</Text>
            <Text style={[styles.errorText, { color: fallbackColors.error }]} numberOfLines={5}>
              {error.toString()}
            </Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <Pressable
            onPress={onReset}
            style={[styles.button, { backgroundColor: Colors.dark.accent }]}
          >
            <Text style={[styles.buttonText, { color: Colors.dark.text }]}>Try Again</Text>
          </Pressable>

          <Pressable
            onPress={onReload}
            style={[styles.button, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}
          >
            <Text style={[styles.buttonText, { color: Colors.dark.text }]}>Reload App</Text>
          </Pressable>
        </View>

        <Text style={[styles.supportText, { color: fallbackColors.textTertiary }]}>
          If this problem persists, please contact support@viwoapp.com
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  errorCard: {
    maxWidth: 400,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.size.h2,
    fontWeight: Typography.weight.bold,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  message: {
    fontSize: Typography.size.body,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: Typography.lineHeight.body,
  },
  errorDetails: {
    width: '100%',
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  errorTitle: {
    fontSize: Typography.size.body2,
    fontWeight: Typography.weight.bold,
    marginBottom: Spacing.sm,
  },
  errorText: {
    fontSize: Typography.size.caption,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  buttonContainer: {
    width: '100%',
    gap: Spacing.sm,
  },
  button: {
    width: '100%',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: Typography.size.body,
    fontWeight: Typography.weight.semibold,
  },
  supportText: {
    fontSize: Typography.size.caption,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
});

export default ErrorBoundary;

