/**
 * Keyboard Aware View
 * Wrapper component that handles keyboard appearance and adjusts content
 */

import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface KeyboardAwareViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  scrollable?: boolean;
  dismissOnTap?: boolean;
  extraOffset?: number;
}

/**
 * KeyboardAwareView - Adjusts content when keyboard appears
 * Use this for screens with text inputs (comments, messaging, etc.)
 */
export function KeyboardAwareView({
  children,
  style,
  scrollable = false,
  dismissOnTap = true,
  extraOffset = 0,
}: KeyboardAwareViewProps) {
  const insets = useSafeAreaInsets();

  const behavior = Platform.select({
    ios: 'padding' as const,
    android: 'height' as const,
    default: undefined,
  });

  const keyboardVerticalOffset = Platform.select({
    ios: insets.top + extraOffset,
    android: extraOffset,
    default: 0,
  });

  const content = scrollable ? (
    <ScrollView
      style={[styles.scrollView, style]}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.container, style]}>
      {children}
    </View>
  );

  const wrappedContent = dismissOnTap ? (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      {content}
    </TouchableWithoutFeedback>
  ) : (
    content
  );

  return (
    <KeyboardAvoidingView
      behavior={behavior}
      keyboardVerticalOffset={keyboardVerticalOffset}
      style={styles.keyboardView}
    >
      {wrappedContent}
    </KeyboardAvoidingView>
  );
}

/**
 * Simple hook to dismiss keyboard
 */
export function useDismissKeyboard() {
  return () => {
    Keyboard.dismiss();
  };
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});

export default KeyboardAwareView;

