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
import { GlassCard } from '@/components/GlassCard';
import { GlassButton } from '@/components/GlassButton';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, Typography, Radius, Layout } from '@/constants/theme';
import { LucideIcons } from '@/utils/iconMapping';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();

  const validateForm = () => {
    try {
      if (!username || !email || !password) {
        setError('Please fill in all required fields');
        return false;
      }

      if (username.length < 3) {
        setError('Username must be at least 3 characters');
        return false;
      }

      if (username.length > 30) {
        setError('Username must be at most 30 characters');
        return false;
      }

      // Check username contains only letters, numbers, and underscores
      const usernameRegex = new RegExp('^[a-zA-Z0-9_]+$');
      if (!usernameRegex.test(username)) {
        setError('Username can only contain letters, numbers, and underscores');
        return false;
      }

      if (!email.includes('@')) {
        setError('Please enter a valid email');
        return false;
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return false;
      }

      // Check for lowercase letter
      const hasLowercase = new RegExp('[a-z]');
      if (!hasLowercase.test(password)) {
        setError('Password must contain at least one lowercase letter');
        return false;
      }

      // Check for uppercase letter
      const hasUppercase = new RegExp('[A-Z]');
      if (!hasUppercase.test(password)) {
        setError('Password must contain at least one uppercase letter');
        return false;
      }

      // Check for number
      const hasNumber = new RegExp('[0-9]');
      if (!hasNumber.test(password)) {
        setError('Password must contain at least one number');
        return false;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return false;
      }

      return true;
    } catch (err) {
      console.error('Validation error:', err);
      setError('An error occurred during validation');
      return false;
    }
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setError('');
    setLoading(true);

    try {
      await register({
        username,
        email,
        password,
        displayName: displayName || username,
      });
      // Navigation will be handled by the root layout based on auth state
      router.replace('/(tabs)');
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Registration failed. Please try again.';
      setError(errorMessage);
      Alert.alert('Registration Failed', errorMessage);
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
        {/* Logo/Title */}
        <View style={styles.header}>
          <Text
            style={[
              styles.title,
              {
                color: colors.accent,
                fontSize: Typography.size.h1,
                fontWeight: Typography.weight.bold,
              },
            ]}
          >
            ViWoApp
          </Text>
          <Text
            style={[
              styles.subtitle,
              {
                color: colors.textSecondary,
                fontSize: Typography.size.body1,
              },
            ]}
          >
            Create Your Account
          </Text>
        </View>

        {/* Register Form */}
        <GlassCard padding="lg" style={styles.formCard}>
          <View style={styles.inputContainer}>
            <Text
              style={[
                styles.label,
                { color: colors.textSecondary, fontSize: Typography.size.body2 },
              ]}
            >
              Username *
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
              placeholder="Choose a unique username"
              placeholderTextColor={colors.placeholder}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoComplete="username"
              textContentType="username"
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text
              style={[
                styles.label,
                { color: colors.textSecondary, fontSize: Typography.size.body2 },
              ]}
            >
              Email *
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
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text
              style={[
                styles.label,
                { color: colors.textSecondary, fontSize: Typography.size.body2 },
              ]}
            >
              Display Name (Optional)
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
              placeholder="How others will see you"
              placeholderTextColor={colors.placeholder}
              value={displayName}
              onChangeText={setDisplayName}
              autoComplete="name"
              textContentType="name"
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text
              style={[
                styles.label,
                { color: colors.textSecondary, fontSize: Typography.size.body2 },
              ]}
            >
              Password *
            </Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.input,
                  styles.passwordInput,
                  {
                    backgroundColor: colors.glassFill,
                    color: colors.textPrimary,
                    borderColor: colors.glassBorder,
                  },
                ]}
                placeholder="Min 6 chars, 1 uppercase, 1 lowercase, 1 number"
                placeholderTextColor={colors.placeholder}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password-new"
                textContentType="newPassword"
                editable={!loading}
              />
              <Pressable
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <LucideIcons.eyeOff
                    size={20}
                    color={colors.textSecondary}
                    strokeWidth={2}
                  />
                ) : (
                  <LucideIcons.eye
                    size={20}
                    color={colors.textSecondary}
                    strokeWidth={2}
                  />
                )}
              </Pressable>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text
              style={[
                styles.label,
                { color: colors.textSecondary, fontSize: Typography.size.body2 },
              ]}
            >
              Confirm Password *
            </Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.input,
                  styles.passwordInput,
                  {
                    backgroundColor: colors.glassFill,
                    color: colors.textPrimary,
                    borderColor: colors.glassBorder,
                  },
                ]}
                placeholder="Re-enter your password"
                placeholderTextColor={colors.placeholder}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoComplete="password-new"
                textContentType="newPassword"
                editable={!loading}
              />
              <Pressable
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <LucideIcons.eyeOff
                    size={20}
                    color={colors.textSecondary}
                    strokeWidth={2}
                  />
                ) : (
                  <LucideIcons.eye
                    size={20}
                    color={colors.textSecondary}
                    strokeWidth={2}
                  />
                )}
              </Pressable>
            </View>
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

          <GlassButton
            onPress={handleRegister}
            variant="primary"
            loading={loading}
            style={styles.registerButton}
          >
            Create Account
          </GlassButton>

          <Text
            style={[
              styles.termsText,
              {
                color: colors.textSecondary,
                fontSize: Typography.size.caption,
                opacity: 0.7,
              },
            ]}
          >
            By signing up, you agree to our Terms of Service and Privacy Policy
          </Text>
        </GlassCard>

        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text
            style={[
              styles.loginText,
              { color: colors.textSecondary, fontSize: Typography.size.body2 },
            ]}
          >
            Already have an account?{' '}
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
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    letterSpacing: -1, // Keep as is for branding
    marginBottom: Spacing.xs,
  },
  subtitle: {
    opacity: 0.8,
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
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: Spacing.md,
    top: 13,
  },
  errorText: {
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  registerButton: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  termsText: {
    textAlign: 'center',
    lineHeight: 18,
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

