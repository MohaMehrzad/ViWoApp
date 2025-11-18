import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassCard } from '@/components/GlassCard';
import { GlassButton } from '@/components/GlassButton';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, Typography, Radius, Layout } from '@/constants/theme';
import { LucideIcons } from '@/utils/iconMapping';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // TODO: Implement password reset API call when backend endpoint is ready
      // await authApi.requestPasswordReset(email);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setSuccess(true);
      Alert.alert(
        'Check Your Email',
        'If an account exists with this email, you will receive password reset instructions.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to send reset email. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back Button */}
        <Pressable
          onPress={() => router.back()}
          style={[styles.backButton, { top: insets.top + Spacing.sm }]}
          disabled={loading}
        >
          <LucideIcons.arrowLeft size={24} color={colors.textPrimary} strokeWidth={2} />
        </Pressable>

        {/* Header */}
        <View style={styles.header}>
          <LucideIcons.send size={64} color={colors.accent} strokeWidth={2} />
          <Text
            style={[
              styles.title,
              {
                color: colors.textPrimary,
                fontSize: Typography.size.h2,
                fontWeight: Typography.weight.bold,
              },
            ]}
          >
            Forgot Password?
          </Text>
          <Text
            style={[
              styles.subtitle,
              {
                color: colors.textSecondary,
                fontSize: Typography.size.body2,
              },
            ]}
          >
            Enter your email and we'll send you instructions to reset your password
          </Text>
        </View>

        {/* Form */}
        <GlassCard padding="lg" style={styles.formCard}>
          <View style={styles.inputContainer}>
            <Text
              style={[
                styles.label,
                { color: colors.textSecondary, fontSize: Typography.size.body2 },
              ]}
            >
              Email Address
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.glassFill,
                  color: colors.textPrimary,
                  borderColor: colors.glassBorder,
                },
              ]}
              placeholder="your.email@example.com"
              placeholderTextColor={colors.placeholder}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              editable={!loading && !success}
            />
          </View>

          {error ? (
            <Text
              style={[
                styles.errorText,
                { color: colors.error, fontSize: Typography.size.body2 },
              ]}
            >
              {error}
            </Text>
          ) : null}

          {success ? (
            <View
              style={[
                styles.successContainer,
                { backgroundColor: colors.accent + '20' },
              ]}
            >
              <LucideIcons.checkmarkCircle size={24} color={colors.accent} strokeWidth={2} />
              <Text
                style={[
                  styles.successText,
                  { color: colors.accent, fontSize: Typography.size.body2 },
                ]}
              >
                Reset email sent! Check your inbox.
              </Text>
            </View>
          ) : null}

          <GlassButton
            onPress={handleResetPassword}
            variant="primary"
            loading={loading}
            style={styles.resetButton}
            disabled={success}
          >
            Send Reset Link
          </GlassButton>
        </GlassCard>

        {/* Back to Login */}
        <View style={styles.loginContainer}>
          <Text
            style={[
              styles.loginText,
              { color: colors.textSecondary, fontSize: Typography.size.body2 },
            ]}
          >
            Remember your password?{' '}
          </Text>
          <Pressable onPress={() => router.push('/auth/login')} disabled={loading}>
            <Text
              style={[
                styles.loginLink,
                {
                  color: colors.accent,
                  fontSize: Typography.size.body2,
                  fontWeight: Typography.weight.bold,
                },
              ]}
            >
              Sign In
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  backButton: {
    position: 'absolute',
    left: Spacing.md,
    zIndex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.8,
    paddingHorizontal: Spacing.md,
  },
  formCard: {
    marginBottom: Spacing.md,
  },
  inputContainer: {
    marginBottom: Spacing.md,
  },
  label: {
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: Typography.letterSpacing.uppercase,
  },
  input: {
    height: Layout.tapTargetMin + 4, // 48dp
    borderRadius: Radius.input,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.size.body1,
  },
  errorText: {
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: Radius.input,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  successText: {
    fontWeight: Typography.weight.medium,
  },
  resetButton: {
    marginTop: Spacing.sm,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    opacity: 0.8,
  },
  loginLink: {},
});

