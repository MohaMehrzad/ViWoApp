import { FeesRisksModal } from '@/components/FeesRisksModal';
import { GlassButton } from '@/components/GlassButton';
import { GlassCard } from '@/components/GlassCard';
import { Spacing, Typography } from '@/constants/theme';
import { useVCoin } from '@/contexts/VCoinContext';
import { useAuth } from '@/contexts/AuthContext';
import { useScreenLayout } from '@/hooks/useScreenLayout';
import { useTheme } from '@/hooks/useTheme';
import { formatVCoinBalance } from '@/utils/formatters';
import { useState, useEffect, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Animated,
  LayoutAnimation,
  UIManager,
  Platform,
  Pressable,
  TextInput,
  Alert,
  Share,
} from 'react-native';
import { LucideIcons } from '@/utils/iconMapping';
import { useRouter } from 'expo-router';
import { CRYPTOCURRENCIES, getExchangeRate, getCryptoBySymbol } from '@/constants/cryptocurrencies';
import { exchangeApi } from '@/services/api/exchange';
import { vcoinApi } from '@/services/api/vcoin';
import { stakingApi } from '@/services/api/staking';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Clipboard from 'expo-clipboard';
import { HapticFeedback } from '@/utils/haptics';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type TabType = 'exchange' | 'send' | 'receive' | 'stake' | 'buy';

// Animated counter component
function AnimatedCounter({ value, style }: { value: number; style?: any }) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value,
      duration: 1500,
      useNativeDriver: false,
    }).start();

    const listener = animatedValue.addListener(({ value: animValue }) => {
      setDisplayValue(Math.floor(animValue));
    });

    return () => {
      animatedValue.removeListener(listener);
    };
  }, [value, animatedValue]);

  return <Text style={style}>{formatVCoinBalance(displayValue, { showDecimals: false })}</Text>;
}

// Tab Navigation Component
function TabNavigation({
  activeTab,
  onTabChange,
  colors,
}: {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  colors: any;
}) {
  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'exchange', label: 'Exchange', icon: LucideIcons.arrowLeftRight },
    { id: 'send', label: 'Send', icon: LucideIcons.send },
    { id: 'receive', label: 'Receive', icon: LucideIcons.download },
    { id: 'stake', label: 'Stake', icon: LucideIcons.lock },
    { id: 'buy', label: 'Buy', icon: LucideIcons.shoppingCart },
  ];

  return (
    <View style={styles.tabContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabScrollContent}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              onPress={() => onTabChange(tab.id)}
              style={[
                styles.tab,
                {
                  backgroundColor: isActive ? colors.accent : colors.glassFill,
                  borderColor: isActive ? colors.accent : colors.glassBorder,
                },
              ]}
            >
              <Icon
                size={16}
                color={isActive ? colors.background : colors.textSecondary}
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isActive ? colors.background : colors.textSecondary,
                    fontSize: Typography.size.caption,
                    fontWeight: isActive ? Typography.weight.bold : Typography.weight.medium,
                  },
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

// Exchange Tab Component
function ExchangeTab({ colors, balance, onBalanceUpdate }: { colors: any; balance: number; onBalanceUpdate: () => void }) {
  const [fromCurrency, setFromCurrency] = useState('VCN');
  const [toCurrency, setToCurrency] = useState('USDT');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  const outputAmount = amount && parseFloat(amount) > 0
    ? parseFloat(amount) * getExchangeRate(fromCurrency, toCurrency)
    : 0;

  const handleSwap = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const handleExchange = async () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (fromCurrency === 'VCN' && amountNum > balance) {
      Alert.alert('Error', 'Insufficient VCoin balance');
      return;
    }

    setLoading(true);
    try {
      const result = await exchangeApi.executeExchange({
        fromCurrency,
        toCurrency,
        amount: amountNum,
      });

      Alert.alert(
        'Exchange Successful!',
        `Exchanged ${result.inputAmount} ${result.fromCurrency} for ${result.outputAmount.toFixed(6)} ${result.toCurrency}`,
        [{ text: 'OK', onPress: () => {
          setAmount('');
          onBalanceUpdate();
        }}]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to execute exchange. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const CurrencySelector = ({
    value,
    onSelect,
    show,
    setShow,
  }: {
    value: string;
    onSelect: (symbol: string) => void;
    show: boolean;
    setShow: (show: boolean) => void;
  }) => {
    const selectedCrypto = getCryptoBySymbol(value);

    return (
      <View>
        <Pressable
          onPress={() => setShow(!show)}
          style={[styles.currencyButton, { backgroundColor: colors.glassFill, borderColor: colors.glassBorder }]}
        >
          <Text style={[styles.currencyIcon, { color: selectedCrypto?.color || colors.accent }]}>
            {selectedCrypto?.icon}
          </Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.currencySymbol, { color: colors.textPrimary, fontSize: Typography.size.body1, fontWeight: Typography.weight.semibold }]}>
              {value}
            </Text>
            <Text style={[styles.currencyName, { color: colors.textSecondary, fontSize: Typography.size.caption }]}>
              {selectedCrypto?.name}
            </Text>
          </View>
          <Text style={[styles.currencyPrice, { color: colors.textPrimary, fontSize: Typography.size.body2, fontWeight: Typography.weight.semibold, marginRight: Spacing.sm }]}>
            ${(selectedCrypto?.priceUSD || 0).toFixed(2)}
          </Text>
          <LucideIcons.chevronDown size={20} color={colors.textSecondary} strokeWidth={2} style={{ transform: [{ rotate: show ? '180deg' : '0deg' }] }} />
        </Pressable>

        {show && (
          <View style={[styles.dropdown, { backgroundColor: colors.surface1, borderColor: colors.glassBorder }]}>
            <ScrollView style={styles.dropdownScroll} nestedScrollEnabled showsVerticalScrollIndicator={false}>
              {CRYPTOCURRENCIES.map((crypto) => (
                <Pressable
                  key={crypto.symbol}
                  onPress={() => {
                    onSelect(crypto.symbol);
                    setShow(false);
                  }}
                  style={({ pressed }) => [
                    styles.dropdownItem,
                    { 
                      backgroundColor: value === crypto.symbol 
                        ? colors.accent + '10' 
                        : pressed 
                        ? colors.glassFill 
                        : 'transparent',
                      borderLeftWidth: value === crypto.symbol ? 3 : 0,
                      borderLeftColor: colors.accent,
                    },
                  ]}
                >
                  <Text style={[styles.currencyIcon, { color: crypto.color }]}>{crypto.icon}</Text>
                  <View style={styles.dropdownItemText}>
                    <Text style={[styles.dropdownSymbol, { color: colors.textPrimary, fontSize: Typography.size.body2, fontWeight: Typography.weight.semibold }]}>
                      {crypto.symbol}
                    </Text>
                    <Text style={[styles.dropdownName, { color: colors.textSecondary, fontSize: Typography.size.caption }]}>
                      {crypto.name}
                    </Text>
                  </View>
                  <Text style={[styles.dropdownPrice, { color: colors.textPrimary, fontSize: Typography.size.body2, fontWeight: Typography.weight.medium }]}>
                    ${crypto.priceUSD.toFixed(2)}
                  </Text>
                  {value === crypto.symbol && (
                    <LucideIcons.check size={18} color={colors.accent} strokeWidth={2.5} style={{ marginLeft: Spacing.xs }} />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  return (
    <GlassCard padding="md" style={styles.tabContent}>
      <Text style={[styles.tabTitle, { color: colors.textPrimary, fontSize: Typography.size.body1, fontWeight: Typography.weight.bold }]}>
        Exchange Cryptocurrency
      </Text>

      {/* From Currency */}
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: colors.textSecondary, fontSize: Typography.size.body2 }]}>
          From
        </Text>
        <CurrencySelector
          value={fromCurrency}
          onSelect={setFromCurrency}
          show={showFromDropdown}
          setShow={setShowFromDropdown}
        />
        <TextInput
          style={[styles.input, { backgroundColor: colors.glassFill, color: colors.textPrimary, borderColor: colors.glassBorder }]}
          placeholder="0.00"
          placeholderTextColor={colors.placeholder}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          editable={!loading}
        />
        {fromCurrency === 'VCN' && (
          <Text style={[styles.hint, { color: colors.textSecondary, fontSize: Typography.size.caption }]}>
            Available: {formatVCoinBalance(balance)}
          </Text>
        )}
      </View>

      {/* Swap Button */}
      <View style={styles.swapButtonContainer}>
        <Pressable
          onPress={handleSwap}
          style={[styles.swapButton, { backgroundColor: colors.accent }]}
        >
          <LucideIcons.arrowUpDown size={20} color={colors.background} strokeWidth={2} />
        </Pressable>
      </View>

      {/* To Currency */}
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: colors.textSecondary, fontSize: Typography.size.body2 }]}>
          To (estimated)
        </Text>
        <CurrencySelector
          value={toCurrency}
          onSelect={setToCurrency}
          show={showToDropdown}
          setShow={setShowToDropdown}
        />
        <View style={[styles.outputBox, { backgroundColor: colors.glassFill, borderColor: colors.glassBorder }]}>
          <Text style={[styles.outputAmount, { color: colors.accent, fontSize: Typography.size.h4, fontWeight: Typography.weight.bold }]}>
            {outputAmount > 0 ? outputAmount.toFixed(6) : '0.00'}
          </Text>
        </View>
      </View>

      {/* Exchange Rate Info */}
      {amount && parseFloat(amount) > 0 && (
        <View style={[styles.infoBox, { backgroundColor: colors.accent + '10' }]}>
          <LucideIcons.info size={16} color={colors.accent} strokeWidth={2} />
          <Text style={[styles.infoText, { color: colors.textSecondary, fontSize: Typography.size.caption }]}>
            Rate: 1 {fromCurrency} ≈ {getExchangeRate(fromCurrency, toCurrency).toFixed(6)} {toCurrency}
            {'\n'}Exchange fee: 1% • Slippage: ~0.5%
          </Text>
        </View>
      )}

      <GlassButton
        onPress={handleExchange}
        variant="primary"
        loading={loading}
        disabled={!amount || parseFloat(amount) <= 0 || loading}
        style={styles.actionButton}
      >
        Exchange Now
      </GlassButton>
    </GlassCard>
  );
}

// Send Tab Component
function SendTab({ colors, balance, onBalanceUpdate }: { colors: any; balance: number; onBalanceUpdate: () => void }) {
  const [recipientId, setRecipientId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

      Alert.alert('Success', `Sent ${amount} VCN to ${recipientId}`, [
        {
          text: 'OK',
          onPress: () => {
            setRecipientId('');
            setAmount('');
            setNote('');
            onBalanceUpdate();
          },
        },
      ]);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to send VCoin. Please try again.';
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
    <GlassCard padding="md" style={styles.tabContent}>
      <Text style={[styles.tabTitle, { color: colors.textPrimary, fontSize: Typography.size.body1, fontWeight: Typography.weight.bold }]}>
        Send VCoin
      </Text>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: colors.textSecondary, fontSize: Typography.size.body2 }]}>
          Recipient Username or ID
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.glassFill, color: colors.textPrimary, borderColor: colors.glassBorder }]}
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
          <Text style={[styles.label, { color: colors.textSecondary, fontSize: Typography.size.body2 }]}>
            Amount (VCN)
          </Text>
          <GlassButton onPress={setMaxAmount} variant="secondary" style={styles.maxButton}>
            MAX
          </GlassButton>
        </View>
        <TextInput
          style={[styles.input, { backgroundColor: colors.glassFill, color: colors.textPrimary, borderColor: colors.glassBorder }]}
          placeholder="0.00"
          placeholderTextColor={colors.placeholder}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          editable={!loading}
        />
        <Text style={[styles.hint, { color: colors.textSecondary, fontSize: Typography.size.caption }]}>
          Available: {formatVCoinBalance(balance)}
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: colors.textSecondary, fontSize: Typography.size.body2 }]}>
          Note (Optional)
        </Text>
        <TextInput
          style={[styles.input, styles.noteInput, { backgroundColor: colors.glassFill, color: colors.textPrimary, borderColor: colors.glassBorder }]}
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
        <Text style={[styles.errorText, { color: colors.error, fontSize: Typography.size.body2 }]}>
          {error}
        </Text>
      ) : null}

      <View style={[styles.infoBox, { backgroundColor: colors.glassFill }]}>
        <LucideIcons.info size={16} color={colors.accent} strokeWidth={2} />
        <Text style={[styles.infoText, { color: colors.textSecondary, fontSize: Typography.size.caption }]}>
          Transactions are instant and irreversible. Please double-check the recipient before sending.
        </Text>
      </View>

      <GlassButton
        onPress={handleSend}
        variant="primary"
        loading={loading}
        disabled={loading}
        style={styles.actionButton}
      >
        Send VCoin
      </GlassButton>
    </GlassCard>
  );
}

// Receive Tab Component
function ReceiveTab({ colors }: { colors: any }) {
  const { user } = useAuth();

  const handleCopyUsername = async () => {
    if (user?.username) {
      await Clipboard.setStringAsync(user.username);
      HapticFeedback.light();
      Alert.alert('Copied!', 'Username copied to clipboard');
    }
  };

  const handleCopyUserId = async () => {
    if (user?.id) {
      await Clipboard.setStringAsync(user.id);
      HapticFeedback.light();
      Alert.alert('Copied!', 'User ID copied to clipboard');
    }
  };

  const handleShare = async () => {
    if (user?.username) {
      try {
        await Share.share({
          message: `Send me VCoin on ViWoApp! My username: @${user.username}`,
          title: 'Send me VCoin',
        });
      } catch (error) {
        console.error('Failed to share:', error);
      }
    }
  };

  return (
    <GlassCard padding="md" style={styles.tabContent}>
      <Text style={[styles.tabTitle, { color: colors.textPrimary, fontSize: Typography.size.body1, fontWeight: Typography.weight.bold }]}>
        Receive VCoin
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary, fontSize: Typography.size.caption, marginBottom: Spacing.sm }]}>
        Share your details to receive VCoin from others
      </Text>

      {/* Username */}
      <View style={styles.receiveSection}>
        <Text style={[styles.label, { color: colors.textSecondary, fontSize: Typography.size.body2 }]}>
          Your Username
        </Text>
        <Pressable
          onPress={handleCopyUsername}
          style={[styles.valueContainer, { backgroundColor: colors.glassFill }]}
        >
          <Text style={[styles.valueText, { color: colors.accent, fontSize: Typography.size.h4, fontWeight: Typography.weight.bold }]}>
            @{user?.username}
          </Text>
          <LucideIcons.copy size={20} color={colors.accent} strokeWidth={2} />
        </Pressable>
      </View>

      {/* User ID */}
      <View style={styles.receiveSection}>
        <Text style={[styles.label, { color: colors.textSecondary, fontSize: Typography.size.body2 }]}>
          Your User ID
        </Text>
        <Pressable
          onPress={handleCopyUserId}
          style={[styles.valueContainer, { backgroundColor: colors.glassFill }]}
        >
          <Text
            style={[styles.valueText, { color: colors.textPrimary, fontSize: Typography.size.body2 }]}
            numberOfLines={1}
            ellipsizeMode="middle"
          >
            {user?.id}
          </Text>
          <LucideIcons.copy size={20} color={colors.textSecondary} strokeWidth={2} />
        </Pressable>
      </View>

      <GlassButton onPress={handleShare} variant="primary" style={styles.actionButton}>
        Share My Details
      </GlassButton>

      {/* Instructions */}
      <View style={[styles.infoBox, { backgroundColor: colors.glassFill }]}>
        <View style={styles.instructionsList}>
          <View style={styles.instructionRow}>
            <LucideIcons.checkmarkCircle size={16} color={colors.success} strokeWidth={2} />
            <Text style={[styles.infoText, { color: colors.textSecondary, fontSize: Typography.size.caption }]}>
              Share your username with anyone
            </Text>
          </View>
          <View style={styles.instructionRow}>
            <LucideIcons.checkmarkCircle size={16} color={colors.success} strokeWidth={2} />
            <Text style={[styles.infoText, { color: colors.textSecondary, fontSize: Typography.size.caption }]}>
              Transactions are instant
            </Text>
          </View>
          <View style={styles.instructionRow}>
            <LucideIcons.checkmarkCircle size={16} color={colors.success} strokeWidth={2} />
            <Text style={[styles.infoText, { color: colors.textSecondary, fontSize: Typography.size.caption }]}>
              No fees for receiving VCoin
            </Text>
          </View>
        </View>
      </View>
    </GlassCard>
  );
}

// Stake Tab Component
function StakeTab({ colors, balance, onBalanceUpdate }: { colors: any; balance: number; onBalanceUpdate: () => void }) {
  const [amount, setAmount] = useState('');
  const [selectedDuration, setSelectedDuration] = useState<number>(30);
  const queryClient = useQueryClient();

  const { data: requirements, isLoading: loadingRequirements } = useQuery({
    queryKey: ['staking', 'requirements'],
    queryFn: () => stakingApi.getRequirements(),
  });

  const stakeMutation = useMutation({
    mutationFn: (data: { amount: number; duration: number }) =>
      stakingApi.stake(data.amount, data.duration),
    onSuccess: () => {
      onBalanceUpdate();
      queryClient.invalidateQueries({ queryKey: ['staking'] });
      Alert.alert('Success', 'VCoin staked successfully!', [
        {
          text: 'OK',
          onPress: () => {
            setAmount('');
          },
        },
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
    <GlassCard padding="md" style={styles.tabContent}>
      <Text style={[styles.tabTitle, { color: colors.textPrimary, fontSize: Typography.size.body1, fontWeight: Typography.weight.bold }]}>
        Stake VCoin
      </Text>

      {/* Amount Input */}
      <View style={styles.inputContainer}>
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: colors.textSecondary, fontSize: Typography.size.body2 }]}>
            Amount (VCN)
          </Text>
          <GlassButton onPress={setMaxAmount} variant="secondary" style={styles.maxButton}>
            MAX
          </GlassButton>
        </View>
        <TextInput
          style={[styles.input, { backgroundColor: colors.glassFill, color: colors.textPrimary, borderColor: colors.glassBorder }]}
          placeholder="0.00"
          placeholderTextColor={colors.placeholder}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          editable={!stakeMutation.isPending}
        />
        <Text style={[styles.hint, { color: colors.textSecondary, fontSize: Typography.size.caption }]}>
          Available: {formatVCoinBalance(balance)}
          {requirements && ` • Minimum: ${requirements.minAmount} VCN`}
        </Text>
      </View>

      {/* Duration Selection */}
      <View style={styles.durationContainer}>
        <Text style={[styles.label, { color: colors.textSecondary, fontSize: Typography.size.body2 }]}>
          Lock Duration
        </Text>
        <View style={styles.durationButtons}>
          {(requirements?.durations || []).map((option) => (
            <Pressable
              key={option.days}
              onPress={() => setSelectedDuration(option.days)}
              style={[
                styles.durationButton,
                {
                  backgroundColor: selectedDuration === option.days ? colors.accent : colors.glassFill,
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
          <Text style={[styles.rewardsLabel, { color: colors.textSecondary, fontSize: Typography.size.caption }]}>
            Estimated Rewards
          </Text>
          <Text style={[styles.rewardsAmount, { color: colors.accent, fontSize: Typography.size.h4, fontWeight: Typography.weight.bold }]}>
            +{calculateRewards().toFixed(2)} VCN
          </Text>
          <Text style={[styles.rewardsSubtext, { color: colors.textSecondary, fontSize: Typography.size.caption }]}>
            After {selectedDuration} days at {getApy(selectedDuration)}% APY
          </Text>
        </View>
      )}

      <View style={[styles.infoBox, { backgroundColor: colors.glassFill }]}>
        <LucideIcons.info size={16} color={colors.accent} strokeWidth={2} />
        <Text style={[styles.infoText, { color: colors.textSecondary, fontSize: Typography.size.caption }]}>
          Staked VCoin is locked for the selected duration. Rewards are calculated and distributed automatically.
        </Text>
      </View>

      <GlassButton
        onPress={handleStake}
        variant="primary"
        loading={stakeMutation.isPending}
        disabled={!amount || parseFloat(amount) <= 0 || stakeMutation.isPending}
        style={styles.actionButton}
      >
        Stake Now
      </GlassButton>
    </GlassCard>
  );
}

// Buy Tab Component
function BuyTab({ colors }: { colors: any }) {
  const [selectedCrypto, setSelectedCrypto] = useState('VCN');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('debit');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [cardName, setCardName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCryptoDropdown, setShowCryptoDropdown] = useState(false);

  const { data: paymentMethods } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: () => exchangeApi.getPaymentMethods(),
  });

  const crypto = getCryptoBySymbol(selectedCrypto);
  const cryptoAmount = parseFloat(amount) || 0;
  const fiatAmount = cryptoAmount * (crypto?.priceUSD || 0);
  const selectedPaymentMethod = (paymentMethods || []).find((pm) => pm.id === paymentMethod);
  const fee = fiatAmount * ((selectedPaymentMethod?.fee || 2.5) / 100);
  const total = fiatAmount + fee;

  const handlePurchase = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!cardNumber || !cardExpiry || !cardCVV || !cardName) {
      Alert.alert('Error', 'Please fill in all card details');
      return;
    }

    setLoading(true);
    try {
      const cryptoPrice = crypto?.priceUSD || 0.10;
      const result = await exchangeApi.purchaseCrypto({
        cryptocurrency: selectedCrypto,
        amount: parseFloat(amount),
        paymentMethod,
        cardDetails: {
          number: cardNumber,
          expiry: cardExpiry,
          cvv: cardCVV,
          name: cardName,
        },
      });

      Alert.alert(
        'Purchase Successful! 🎉',
        `You've purchased ${result.amount} ${result.cryptocurrency} for $${result.total.toFixed(2)}`,
        [
          {
            text: 'OK',
            onPress: () => {
              setAmount('');
              setCardNumber('');
              setCardExpiry('');
              setCardCVV('');
              setCardName('');
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to process purchase. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard padding="md" style={styles.tabContent}>
      <Text style={[styles.tabTitle, { color: colors.textPrimary, fontSize: Typography.size.body1, fontWeight: Typography.weight.bold }]}>
        Buy Cryptocurrency
      </Text>

      {/* Cryptocurrency Selector */}
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: colors.textSecondary, fontSize: Typography.size.body2 }]}>
          SELECT CRYPTOCURRENCY
        </Text>
        <Pressable
          onPress={() => setShowCryptoDropdown(!showCryptoDropdown)}
          style={[styles.currencyButton, { backgroundColor: colors.glassFill, borderColor: colors.glassBorder }]}
        >
          <Text style={[styles.currencyIcon, { color: crypto?.color || colors.accent }]}>{crypto?.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.currencySymbol, { color: colors.textPrimary, fontSize: Typography.size.body1, fontWeight: Typography.weight.semibold }]}>
              {selectedCrypto}
            </Text>
            <Text style={[styles.currencyName, { color: colors.textSecondary, fontSize: Typography.size.caption }]}>
              {crypto?.name}
            </Text>
          </View>
          <Text style={[styles.currencyPrice, { color: colors.textPrimary, fontSize: Typography.size.body2, fontWeight: Typography.weight.semibold, marginRight: Spacing.sm }]}>
            ${(crypto?.priceUSD || 0).toFixed(2)}
          </Text>
          <LucideIcons.chevronDown size={20} color={colors.textSecondary} strokeWidth={2} style={{ transform: [{ rotate: showCryptoDropdown ? '180deg' : '0deg' }] }} />
        </Pressable>

        {showCryptoDropdown && (
          <View style={[styles.dropdown, { backgroundColor: colors.surface1, borderColor: colors.glassBorder }]}>
            <ScrollView style={styles.dropdownScroll} nestedScrollEnabled showsVerticalScrollIndicator={false}>
              {CRYPTOCURRENCIES.map((c) => (
                <Pressable
                  key={c.symbol}
                  onPress={() => {
                    setSelectedCrypto(c.symbol);
                    setShowCryptoDropdown(false);
                  }}
                  style={({ pressed }) => [
                    styles.dropdownItem,
                    { 
                      backgroundColor: selectedCrypto === c.symbol 
                        ? colors.accent + '10' 
                        : pressed 
                        ? colors.glassFill 
                        : 'transparent',
                      borderLeftWidth: selectedCrypto === c.symbol ? 3 : 0,
                      borderLeftColor: colors.accent,
                    },
                  ]}
                >
                  <Text style={[styles.currencyIcon, { color: c.color }]}>{c.icon}</Text>
                  <View style={styles.dropdownItemText}>
                    <Text style={[styles.dropdownSymbol, { color: colors.textPrimary, fontSize: Typography.size.body2, fontWeight: Typography.weight.semibold }]}>
                      {c.symbol}
                    </Text>
                    <Text style={[styles.dropdownName, { color: colors.textSecondary, fontSize: Typography.size.caption }]}>
                      {c.name}
                    </Text>
                  </View>
                  <Text style={[styles.dropdownPrice, { color: colors.textPrimary, fontSize: Typography.size.body2, fontWeight: Typography.weight.medium }]}>
                    ${(c.priceUSD || 0).toFixed(2)}
                  </Text>
                  {selectedCrypto === c.symbol && (
                    <LucideIcons.check size={18} color={colors.accent} strokeWidth={2.5} style={{ marginLeft: Spacing.xs }} />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Amount */}
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: colors.textSecondary, fontSize: Typography.size.body2 }]}>
          Amount ({selectedCrypto})
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.glassFill, color: colors.textPrimary, borderColor: colors.glassBorder }]}
          placeholder="0.00"
          placeholderTextColor={colors.placeholder}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          editable={!loading}
        />
        {cryptoAmount > 0 && (
          <Text style={[styles.hint, { color: colors.accent, fontSize: Typography.size.body2 }]}>
            ≈ ${fiatAmount.toFixed(2)} USD
          </Text>
        )}
      </View>

      {/* Payment Method */}
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: colors.textSecondary, fontSize: Typography.size.body2 }]}>
          Payment Method
        </Text>
        <View style={styles.paymentMethods}>
          {(paymentMethods || []).map((pm) => (
            <Pressable
              key={pm.id}
              onPress={() => setPaymentMethod(pm.id)}
              style={[
                styles.paymentMethodButton,
                {
                  backgroundColor: paymentMethod === pm.id ? colors.accent : colors.glassFill,
                  borderColor: colors.glassBorder,
                },
              ]}
            >
              <Text style={{ fontSize: 20 }}>{pm.icon}</Text>
              <Text
                style={[
                  styles.paymentMethodText,
                  {
                    color: paymentMethod === pm.id ? colors.background : colors.textPrimary,
                    fontSize: Typography.size.caption,
                  },
                ]}
              >
                {pm.label}
              </Text>
              <Text
                style={[
                  styles.paymentMethodFee,
                  {
                    color: paymentMethod === pm.id ? colors.background : colors.textSecondary,
                    fontSize: Typography.size.caption,
                  },
                ]}
              >
                {pm.fee}% fee
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Card Details */}
      <View style={styles.cardDetailsSection}>
        <Text style={[styles.label, { color: colors.textSecondary, fontSize: Typography.size.body2, marginBottom: Spacing.sm }]}>
          Card Details
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.glassFill, color: colors.textPrimary, borderColor: colors.glassBorder, marginBottom: Spacing.sm }]}
          placeholder="Card Number"
          placeholderTextColor={colors.placeholder}
          value={cardNumber}
          onChangeText={setCardNumber}
          keyboardType="number-pad"
          maxLength={16}
          editable={!loading}
        />
        <View style={styles.cardRow}>
          <TextInput
            style={[styles.input, styles.cardRowInput, { backgroundColor: colors.glassFill, color: colors.textPrimary, borderColor: colors.glassBorder }]}
            placeholder="MM/YY"
            placeholderTextColor={colors.placeholder}
            value={cardExpiry}
            onChangeText={setCardExpiry}
            maxLength={5}
            editable={!loading}
          />
          <TextInput
            style={[styles.input, styles.cardRowInput, { backgroundColor: colors.glassFill, color: colors.textPrimary, borderColor: colors.glassBorder }]}
            placeholder="CVV"
            placeholderTextColor={colors.placeholder}
            value={cardCVV}
            onChangeText={setCardCVV}
            keyboardType="number-pad"
            maxLength={3}
            secureTextEntry
            editable={!loading}
          />
        </View>
        <TextInput
          style={[styles.input, { backgroundColor: colors.glassFill, color: colors.textPrimary, borderColor: colors.glassBorder }]}
          placeholder="Cardholder Name"
          placeholderTextColor={colors.placeholder}
          value={cardName}
          onChangeText={setCardName}
          autoCapitalize="words"
          editable={!loading}
        />
      </View>

      {/* Purchase Summary */}
      {cryptoAmount > 0 && (
        <View style={[styles.summaryBox, { backgroundColor: colors.glassFill }]}>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary, fontSize: Typography.size.body2 }]}>
              Crypto Amount:
            </Text>
            <Text style={[styles.summaryValue, { color: colors.textPrimary, fontSize: Typography.size.body2 }]}>
              {cryptoAmount} {selectedCrypto}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary, fontSize: Typography.size.body2 }]}>
              Price:
            </Text>
            <Text style={[styles.summaryValue, { color: colors.textPrimary, fontSize: Typography.size.body2 }]}>
              ${fiatAmount.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary, fontSize: Typography.size.body2 }]}>
              Fee ({selectedPaymentMethod?.fee}%):
            </Text>
            <Text style={[styles.summaryValue, { color: colors.textPrimary, fontSize: Typography.size.body2 }]}>
              ${fee.toFixed(2)}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryTotal]}>
            <Text style={[styles.summaryLabel, { color: colors.textPrimary, fontSize: Typography.size.body2, fontWeight: Typography.weight.bold }]}>
              Total:
            </Text>
            <Text style={[styles.summaryValue, { color: colors.accent, fontSize: Typography.size.h4, fontWeight: Typography.weight.bold }]}>
              ${total.toFixed(2)}
            </Text>
          </View>
        </View>
      )}

      <GlassButton
        onPress={handlePurchase}
        variant="primary"
        loading={loading}
        disabled={loading || !amount || parseFloat(amount) <= 0}
        style={styles.actionButton}
      >
        Complete Purchase
      </GlassButton>
    </GlassCard>
  );
}

// Main DeFi Screen Component
export default function DeFiScreen() {
  const { colors } = useTheme();
  const { balance, loadBalance } = useVCoin();
  const router = useRouter();
  const [showFeesModal, setShowFeesModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [howToEarnExpanded, setHowToEarnExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('exchange');
  const { headerHeight, contentPaddingBottom } = useScreenLayout();

  useEffect(() => {
    const initializeBalance = async () => {
      setLoading(true);
      await loadBalance();
      setLoading(false);
    };

    initializeBalance();
  }, []);

  const toggleHowToEarn = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setHowToEarnExpanded(!howToEarnExpanded);
  };

  if (loading) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.sm,
            paddingBottom: contentPaddingBottom,
          },
        ]}
      >
        <GlassCard padding="md" style={styles.walletCard}>
          <Text style={[styles.label, { color: colors.textSecondary, fontSize: Typography.size.caption }]}>
            Total Balance
          </Text>
          <View style={[styles.skeletonBalance, { backgroundColor: colors.glassFill }]} />
        </GlassCard>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: headerHeight + Spacing.sm,
          paddingBottom: contentPaddingBottom,
          backgroundColor: colors.background,
        },
      ]}
    >
      {/* Wallet Balance Card */}
      <GlassCard padding="md" style={styles.walletCard}>
        <Text
          style={[
            styles.label,
            {
              color: colors.textSecondary,
              fontSize: Typography.size.caption,
              marginBottom: Spacing.xs,
            },
          ]}
        >
          Total Balance
        </Text>
        <AnimatedCounter
          value={balance}
          style={[
            styles.balance,
            {
              color: colors.accent,
              fontSize: Typography.size.h2,
              fontWeight: Typography.weight.bold,
            },
          ]}
        />
      </GlassCard>

      {/* Tab Navigation */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} colors={colors} />

      {/* Tab Content */}
      {activeTab === 'exchange' && (
        <ExchangeTab colors={colors} balance={balance} onBalanceUpdate={loadBalance} />
      )}
      {activeTab === 'send' && (
        <SendTab colors={colors} balance={balance} onBalanceUpdate={loadBalance} />
      )}
      {activeTab === 'receive' && <ReceiveTab colors={colors} />}
      {activeTab === 'stake' && (
        <StakeTab colors={colors} balance={balance} onBalanceUpdate={loadBalance} />
      )}
      {activeTab === 'buy' && <BuyTab colors={colors} />}

      {/* How to Earn VCoin Section */}
      <GlassCard padding="sm" style={styles.infoCard} interactive>
        <Pressable onPress={toggleHowToEarn}>
          <View style={styles.infoHeader}>
            <Text
              style={[
                styles.infoTitle,
                {
                  color: colors.textPrimary,
                  fontSize: Typography.size.body1,
                  fontWeight: Typography.weight.bold,
                },
              ]}
            >
              How to Earn VCoin
            </Text>
            {howToEarnExpanded ? (
              <LucideIcons.chevronUp size={20} color={colors.textPrimary} strokeWidth={2} />
            ) : (
              <LucideIcons.chevronDown size={20} color={colors.textSecondary} strokeWidth={2} />
            )}
          </View>
        </Pressable>
        {howToEarnExpanded && (
          <Text
            style={[
              styles.infoText,
              {
                color: colors.textSecondary,
                fontSize: Typography.size.caption,
                lineHeight: Typography.lineHeight.caption,
                marginTop: Spacing.xs,
              },
            ]}
          >
            Earn VCoin by engaging with content on ViWoApp:
            {'\n\n'}• Like a post: +1 VCN
            {'\n'}• Share a post: +2 VCN
            {'\n'}• Repost content: +3 VCN
            {'\n\n'}
            Engagement rewards may be capped or revoked for suspicious activity.
          </Text>
        )}
      </GlassCard>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <GlassButton
          onPress={() => router.push('/vcoin/history')}
          variant="secondary"
          style={styles.quickActionButton}
        >
          <View style={styles.quickActionContent}>
            <LucideIcons.clock size={16} color={colors.textPrimary} strokeWidth={2} />
            <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>
              Transaction History
            </Text>
          </View>
        </GlassButton>

        <GlassButton
          onPress={() => router.push('/leaderboard')}
          variant="secondary"
          style={styles.quickActionButton}
        >
          <View style={styles.quickActionContent}>
            <LucideIcons.trophy size={16} color={colors.textPrimary} strokeWidth={2} />
            <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>
              Leaderboard
            </Text>
          </View>
        </GlassButton>

        <GlassButton
          onPress={() => router.push('/rewards-history')}
          variant="secondary"
          style={styles.quickActionButton}
        >
          <View style={styles.quickActionContent}>
            <LucideIcons.gift size={16} color={colors.textPrimary} strokeWidth={2} />
            <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>
              Rewards History
            </Text>
          </View>
        </GlassButton>
      </View>

      <GlassButton
        onPress={() => setShowFeesModal(true)}
        variant="secondary"
        style={styles.feesButton}
      >
        Fees & Risks
      </GlassButton>

      <FeesRisksModal visible={showFeesModal} onClose={() => setShowFeesModal(false)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.sm,
  },
  walletCard: {
    marginBottom: Spacing.sm,
  },
  label: {
    textTransform: 'uppercase',
    letterSpacing: Typography.letterSpacing.uppercase,
  },
  balance: {
    letterSpacing: -1,
  },
  skeletonBalance: {
    height: 36,
    borderRadius: 8,
    marginBottom: Spacing.sm,
  },
  tabContainer: {
    marginBottom: Spacing.sm,
  },
  tabScrollContent: {
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 10,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  tabLabel: {},
  tabContent: {
    marginBottom: Spacing.sm,
  },
  tabTitle: {
    marginBottom: Spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.8,
  },
  inputContainer: {
    marginBottom: Spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  maxButton: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
  },
  input: {
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    fontSize: Typography.size.body2,
  },
  noteInput: {
    height: 70,
    paddingTop: Spacing.xs,
  },
  hint: {
    marginTop: Spacing.xs,
    opacity: 0.7,
  },
  errorText: {
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  currencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  currencyIcon: {
    fontSize: 24,
    marginRight: Spacing.xs,
  },
  currencySymbol: {
    marginBottom: 2,
  },
  currencyName: {
    opacity: 0.8,
  },
  currencyPrice: {
    minWidth: 80,
    textAlign: 'right',
  },
  dropdown: {
    marginTop: Spacing.xs,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    maxHeight: 200,
    overflow: 'hidden',
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  dropdownItemText: {
    flex: 1,
  },
  dropdownSymbol: {
    marginBottom: 2,
  },
  dropdownName: {
    opacity: 0.7,
  },
  dropdownPrice: {
    minWidth: 80,
    textAlign: 'right',
  },
  swapButtonContainer: {
    alignItems: 'center',
    marginVertical: Spacing.xs,
  },
  swapButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outputBox: {
    padding: Spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  outputAmount: {
    letterSpacing: -0.5,
  },
  infoBox: {
    flexDirection: 'row',
    padding: Spacing.xs,
    borderRadius: 8,
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  infoText: {
    flex: 1,
    lineHeight: 18,
  },
  actionButton: {
    marginTop: Spacing.xs,
  },
  receiveSection: {
    marginBottom: Spacing.sm,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.sm,
    borderRadius: 10,
    marginTop: Spacing.xs,
  },
  valueText: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  instructionsList: {
    gap: Spacing.sm,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
  },
  durationContainer: {
    marginBottom: Spacing.sm,
  },
  durationButtons: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  durationButton: {
    flex: 1,
    padding: Spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  durationText: {},
  apyText: {
    marginTop: 2,
  },
  rewardsBox: {
    padding: Spacing.sm,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: Spacing.sm,
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
  paymentMethods: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  paymentMethodButton: {
    flex: 1,
    padding: Spacing.xs,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    gap: 2,
  },
  paymentMethodText: {
    fontWeight: Typography.weight.semibold,
  },
  paymentMethodFee: {},
  cardDetailsSection: {
    marginBottom: Spacing.sm,
  },
  cardRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  cardRowInput: {
    flex: 1,
  },
  summaryBox: {
    padding: Spacing.sm,
    borderRadius: 10,
    marginBottom: Spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  summaryTotal: {
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  summaryLabel: {},
  summaryValue: {},
  infoCard: {
    marginBottom: Spacing.sm,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoTitle: {},
  quickActions: {
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  quickActionButton: {
    width: '100%',
  },
  quickActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  quickActionText: {
    fontSize: Typography.size.caption,
    fontWeight: Typography.weight.semibold,
  },
  feesButton: {
    marginBottom: Spacing.md,
  },
});
