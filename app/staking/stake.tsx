import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GlassCard } from '@/components/GlassCard';
import { GlassButton } from '@/components/GlassButton';
import { useVCoin } from '@/contexts/VCoinContext';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, Typography } from '@/constants/theme';
import { stakingApi } from '@/services/api/staking';
import { formatVCoinBalance } from '@/utils/formatters';
import { LucideIcons } from '@/utils/iconMapping';

export default function StakeScreen() {
  const [amount, setAmount] = useState('');
  const [selectedDuration, setSelectedDuration] = useState<number>(30);

  const { balance, loadBalance } = useVCoin();
  const router = useRouter();
  const { colors } = useTheme();
  const queryClient = useQueryClient();

  const { data: requirements, isLoading: loadingRequirements } = useQuery({
    queryKey: ['staking', 'requirements'],
    queryFn: () => stakingApi.getRequirements(),
  });

  const stakeMutation = useMutation({
    mutationFn: (data: { amount: number; duration: number }) =>
      stakingApi.stake(data.amount, data.duration),
    onSuccess: () => {
      loadBalance();
      queryClient.invalidateQueries({ queryKey: ['staking'] });
      Alert.alert('Success', 'VCoin staked successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    },
  });

  const getApy = (duration: number) => {
    const durationOption = requirements?.durations.find((d) => d.days === duration);
    return durationOption?.apy || 0;
  };

  const calculateRewards = () => {
    const amountNum = parseFloat(amount) || 0;
    const apy = getApy(selectedDuration);
    const days = selectedDuration;
    return (amountNum * apy * days) / (365 * 100);
  };

  const handleStake = async () => {
    const amountNum = parseFloat(amount);

    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (amountNum > balance) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    if (requirements && amountNum < requirements.minAmount) {
      Alert.alert('Error', `Minimum stake amount is ${requirements.minAmount} VCN`);
      return;
    }

    try {
      await stakeMutation.mutateAsync({
        amount: amountNum,
        duration: selectedDuration,
      });
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to stake VCoin');
    }
  };

  const setMaxAmount = () => {
    setAmount(balance.toString());
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Balance Card */}
      <GlassCard padding="md" style={styles.balanceCard}>
        <Text
          style={[
            styles.balanceLabel,
            { color: colors.textSecondary, fontSize: Typography.size.body2 },
          ]}
        >
          Available Balance
        </Text>
        <Text
          style={[
            styles.balanceAmount,
            { color: colors.accent, fontSize: Typography.size.h2, fontWeight: Typography.weight.bold },
          ]}
        >
          {formatVCoinBalance(balance)}
        </Text>
      </GlassCard>

      {/* Stake Form */}
      <GlassCard padding="lg" style={styles.formCard}>
        <Text
          style={[
            styles.title,
            { color: colors.textPrimary, fontSize: Typography.size.h3, fontWeight: Typography.weight.bold },
          ]}
        >
          Stake VCoin
        </Text>

        {/* Amount Input */}
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
            <GlassButton onPress={setMaxAmount} variant="secondary" style={styles.maxButton}>
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
            editable={!stakeMutation.isPending}
          />
          {requirements && (
            <Text
              style={[
                styles.hint,
                { color: colors.textSecondary, fontSize: Typography.size.caption },
              ]}
            >
              Minimum: {requirements.minAmount} VCN
            </Text>
          )}
        </View>

        {/* Duration Selection */}
        <View style={styles.durationContainer}>
          <Text
            style={[
              styles.label,
              { color: colors.textSecondary, fontSize: Typography.size.body2 },
            ]}
          >
            Duration
          </Text>
          <View style={styles.durationButtons}>
            {requirements?.durations.map((option) => (
              <Pressable
                key={option.days}
                onPress={() => setSelectedDuration(option.days)}
                style={[
                  styles.durationButton,
                  {
                    backgroundColor:
                      selectedDuration === option.days ? colors.accent : colors.glassFill,
                    borderColor: colors.glassBorder,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.durationText,
                    {
                      color: selectedDuration === option.days ? colors.background : colors.textPrimary,
                      fontSize: Typography.size.body2,
                      fontWeight: Typography.weight.semibold,
                    },
                  ]}
                >
                  {option.days} Days
                </Text>
                <Text
                  style={[
                    styles.apyText,
                    {
                      color: selectedDuration === option.days ? colors.background : colors.accent,
                      fontSize: Typography.size.caption,
                    },
                  ]}
                >
                  {option.apy}% APY
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Rewards Estimate */}
        {amount && parseFloat(amount) > 0 && (
          <View style={[styles.rewardsBox, { backgroundColor: colors.accent + '10' }]}>
            <Text
              style={[
                styles.rewardsLabel,
                { color: colors.textSecondary, fontSize: Typography.size.body2 },
              ]}
            >
              Estimated Rewards
            </Text>
            <Text
              style={[
                styles.rewardsAmount,
                { color: colors.accent, fontSize: Typography.size.h3, fontWeight: Typography.weight.bold },
              ]}
            >
              +{calculateRewards().toFixed(2)} VCN
            </Text>
            <Text
              style={[
                styles.rewardsSubtext,
                { color: colors.textSecondary, fontSize: Typography.size.caption },
              ]}
            >
              After {selectedDuration} days at {getApy(selectedDuration)}% APY
            </Text>
          </View>
        )}

        {/* Info Box */}
        <View style={[styles.infoBox, { backgroundColor: colors.glassFill }]}>
          <LucideIcons.info size={20} color={colors.accent} strokeWidth={2} />
          <Text
            style={[
              styles.infoText,
              { color: colors.textSecondary, fontSize: Typography.size.caption },
            ]}
          >
            Staked VCoin is locked for the selected duration. Rewards are calculated and
            distributed automatically.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <GlassButton
            onPress={() => router.back()}
            variant="secondary"
            style={styles.actionButton}
            disabled={stakeMutation.isPending}
          >
            Cancel
          </GlassButton>
          <GlassButton
            onPress={handleStake}
            variant="primary"
            style={styles.actionButton}
            loading={stakeMutation.isPending}
            disabled={!amount || parseFloat(amount) <= 0}
          >
            Stake
          </GlassButton>
        </View>
      </GlassCard>
    </ScrollView>
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
  title: {
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
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
    marginBottom: Spacing.xs,
  },
  hint: {
    opacity: 0.7,
  },
  durationContainer: {
    marginBottom: Spacing.md,
  },
  durationButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  durationButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  durationText: {},
  apyText: {
    marginTop: 4,
  },
  rewardsBox: {
    padding: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  rewardsLabel: {
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  rewardsAmount: {
    letterSpacing: -1,
    marginBottom: Spacing.xs,
  },
  rewardsSubtext: {
    opacity: 0.8,
  },
  infoBox: {
    flexDirection: 'row',
    padding: Spacing.sm,
    borderRadius: 8,
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  infoText: {
    flex: 1,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});

