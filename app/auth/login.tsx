import React, { useState, useEffect } from 'react';
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
import { TokenStorage } from '@/services/storage/tokenStorage';

export default function LoginScreen() {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();

  // Load saved email on mount
  useEffect(() => {
    loadSavedCredentials();
  }, []);

  const loadSavedCredentials = async () => {
    try {
      const savedEmail = await TokenStorage.getSavedEmail();
      const isRememberMeEnabled = await TokenStorage.isRememberMeEnabled();
      
      if (savedEmail && isRememberMeEnabled) {
        setEmailOrUsername(savedEmail);
        setRememberMe(true);
      }
    } catch (error) {
      console.error('Failed to load saved credentials:', error);
    }
  };

  const handleLogin = async () => {
    if (!emailOrUsername || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await login(emailOrUsername, password);
      
      // Handle "Remember Me"
      if (rememberMe) {
        await TokenStorage.setSavedEmail(emailOrUsername);
      } else {
        await TokenStorage.clearSavedEmail();
      }
      
      // Navigation will be handled by the root layout based on auth state
      router.replace('/(tabs)');
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Login failed. Please check your credentials.';
      setError(errorMessage);
      Alert.alert('Login Failed', errorMessage);
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
            Welcome Back
          </Text>
        </View>

        {/* Login Form */}
        <GlassCard padding="lg" style={styles.formCard}>
          <View style={styles.inputContainer}>
            <Text
              style={[
                styles.label,
                { color: colors.textSecondary, fontSize: Typography.size.body2 },
              ]}
            >
              Email or Username
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
              placeholder="email@example.com or username"
              placeholderTextColor={colors.placeholder}
              value={emailOrUsername}
              onChangeText={setEmailOrUsername}
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
              Password
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
                placeholder="Enter your password"
                placeholderTextColor={colors.placeholder}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
                textContentType="password"
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

          {/* Remember Me Checkbox */}
          <Pressable
            style={styles.rememberMeContainer}
            onPress={() => setRememberMe(!rememberMe)}
            disabled={loading}
          >
            <View
              style={[
                styles.checkbox,
                {
                  backgroundColor: rememberMe ? colors.accent : 'transparent',
                  borderColor: colors.glassBorder,
                },
              ]}
            >
              {rememberMe && (
                <LucideIcons.check size={16} color={colors.background} strokeWidth={2.5} />
              )}
            </View>
            <Text
              style={[
                styles.rememberMeText,
                { color: colors.textSecondary, fontSize: Typography.size.body2 },
              ]}
            >
              Remember me
            </Text>
          </Pressable>

          <GlassButton
            onPress={handleLogin}
            variant="primary"
            loading={loading}
            style={styles.loginButton}
          >
            Login
          </GlassButton>

          <Pressable
            onPress={() => router.push('/auth/forgot-password')}
            style={styles.forgotPassword}
            disabled={loading}
          >
            <Text
              style={[
                styles.forgotPasswordText,
                { color: colors.accent, fontSize: Typography.size.body2 },
              ]}
            >
              Forgot Password?
            </Text>
          </Pressable>
        </GlassCard>

        {/* Register Link */}
        <View style={styles.registerContainer}>
          <Text
            style={[
              styles.registerText,
              { color: colors.textSecondary, fontSize: Typography.size.body2 },
            ]}
          >
            Don't have an account?{' '}
          </Text>
          <Pressable onPress={() => router.push('/auth/register')} disabled={loading}>
            <Text
              style={[
                styles.registerLink,
                {
                  color: colors.accent,
                  fontSize: Typography.size.body2,
                  fontWeight: Typography.weight.bold,
                },
              ]}
            >
              Sign Up
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
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    marginRight: Spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rememberMeText: {
    opacity: 0.9,
  },
  loginButton: {
    marginTop: Spacing.xs,
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  forgotPasswordText: {
    opacity: 0.9,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    opacity: 0.8,
  },
  registerLink: {},
});

