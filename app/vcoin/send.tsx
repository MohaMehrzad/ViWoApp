import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { GlassCard } from '@/components/GlassCard';
import { GlassButton } from '@/components/GlassButton';
import { useVCoin } from '@/contexts/VCoinContext';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, Typography } from '@/constants/theme';
import { vcoinApi } from '@/services/api/vcoin';
import { LucideIcons } from '@/utils/iconMapping';
import { formatVCoinBalance } from '@/utils/formatters';

export default function SendVCoinScreen() {
  const [recipientId, setRecipientId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { balance, loadBalance } = useVCoin();
  const router = useRouter();
  const { colors } = useTheme();

  const validateForm = () => {
    if (!recipientId.trim()) {
      setError('Please enter recipient username or ID');
      return false;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount');
      return false;
    }

    if (amountNum > balance) {
      setError('Insufficient balance');
      return false;
    }

    return true;
  };

  const handleSend = async () => {
    if (!validateForm()) {
      return;
    }

    setError('');
    setLoading(true);

    try {
      await vcoinApi.send({
        recipientId: recipientId.trim(),
        amount: parseFloat(amount),
        note: note.trim() || undefined,
      });

      // Reload balance
      await loadBalance();

      Alert.alert(
        'Success',
        `Sent ${amount} VCN to ${recipientId}`,
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
        'Failed to send VCoin. Please try again.';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const setMaxAmount = () => {
    setAmount(balance.toString());
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
        {/* Balance Card */}
        <GlassCard padding="md" style={styles.balanceCard}>
          <Text
            style={[
              styles.balanceLabel,
              {
                color: colors.textSecondary,
                fontSize: Typography.size.body2,
              },
            ]}
          >
            Available Balance
          </Text>
          <Text
            style={[
              styles.balanceAmount,
              {
                color: colors.accent,
                fontSize: Typography.size.h2,
                fontWeight: Typography.weight.bold,
              },
            ]}
          >
            {formatVCoinBalance(balance)}
          </Text>
        </GlassCard>

        {/* Send Form */}
        <GlassCard padding="lg" style={styles.formCard}>
          <View style={styles.inputContainer}>
            <Text
              style={[
                styles.label,
                { color: colors.textSecondary, fontSize: Typography.size.body2 },
              ]}
            >
              Recipient Username or ID
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
              placeholder="@username or user ID"
              placeholderTextColor={colors.placeholder}
              value={recipientId}
              onChangeText={setRecipientId}
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.labelRow}>
              <Text
                style={[
                  styles.label,
                  { color: colors.textSecondary, fontSize: Typography.size.body2 },
                ]}
              >
                Amount (VCN)
              </Text>
              <GlassButton
                onPress={setMaxAmount}
                variant="secondary"
                style={styles.maxButton}
              >
                MAX
              </GlassButton>
            </View>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.glassFill,
                  color: colors.textPrimary,
                  borderColor: colors.glassBorder,
                },
              ]}
              placeholder="0.00"
              placeholderTextColor={colors.placeholder}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
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
              Note (Optional)
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.noteInput,
                {
                  backgroundColor: colors.glassFill,
                  color: colors.textPrimary,
                  borderColor: colors.glassBorder,
                },
              ]}
              placeholder="Add a message..."
              placeholderTextColor={colors.placeholder}
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              editable={!loading}
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

          <GlassButton
            onPress={handleSend}
            variant="primary"
            loading={loading}
            style={styles.sendButton}
          >
            Send VCoin
          </GlassButton>

          <View style={[styles.infoBox, { backgroundColor: colors.glassFill }]}>
            <LucideIcons.info size={20} color={colors.accent} strokeWidth={2} />
            <Text
              style={[
                styles.infoText,
                {
                  color: colors.textSecondary,
                  fontSize: Typography.size.caption,
                },
              ]}
            >
              Transactions are instant and irreversible. Please double-check the recipient
              before sending.
            </Text>
          </View>
        </GlassCard>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  balanceCard: {
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  balanceLabel: {
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  balanceAmount: {
    letterSpacing: -1,
  },
  formCard: {},
  inputContainer: {
    marginBottom: Spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  label: {
    textTransform: 'uppercase',
    letterSpacing: Typography.letterSpacing.uppercase,
  },
  maxButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  input: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.size.body1,
  },
  noteInput: {
    height: 80,
    paddingTop: Spacing.sm,
  },
  errorText: {
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  sendButton: {
    marginBottom: Spacing.md,
  },
  infoBox: {
    flexDirection: 'row',
    padding: Spacing.sm,
    borderRadius: 8,
    gap: Spacing.xs,
  },
  infoText: {
    flex: 1,
    lineHeight: 18,
  },
});

