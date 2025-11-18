import {
  ExchangeRequest,
  ExchangeResponse,
  ExchangeQuote,
  PurchaseRequest,
  PurchaseResponse,
  PaymentMethod,
} from '@/types/exchange';
import { calculateConversion } from '@/constants/cryptocurrencies';

// Mock exchange API service (simulates backend calls)
export const exchangeApi = {
  /**
   * Get a quote for an exchange
   */
  getQuote: async (request: ExchangeRequest): Promise<ExchangeQuote> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const { outputAmount, rate, slippage } = calculateConversion(
      request.amount,
      request.fromCurrency,
      request.toCurrency,
      request.slippagePercent || 0.5
    );

    // Calculate 1% exchange fee
    const fee = outputAmount * 0.01;

    return {
      fromCurrency: request.fromCurrency,
      toCurrency: request.toCurrency,
      inputAmount: request.amount,
      outputAmount: outputAmount - fee,
      rate,
      slippage,
      fee,
      expiresAt: new Date(Date.now() + 30000).toISOString(), // Expires in 30 seconds
    };
  },

  /**
   * Execute an exchange
   */
  executeExchange: async (request: ExchangeRequest): Promise<ExchangeResponse> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const { outputAmount, rate, slippage } = calculateConversion(
      request.amount,
      request.fromCurrency,
      request.toCurrency,
      request.slippagePercent || 0.5
    );

    // Calculate 1% exchange fee
    const fee = outputAmount * 0.01;

    return {
      id: `exchange_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fromCurrency: request.fromCurrency,
      toCurrency: request.toCurrency,
      inputAmount: request.amount,
      outputAmount: outputAmount - fee,
      rate,
      slippage,
      fee,
      timestamp: new Date().toISOString(),
      status: 'completed',
    };
  },

  /**
   * Get available payment methods
   */
  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return [
      {
        id: 'debit',
        type: 'debit',
        label: 'Debit Card',
        icon: '💳',
        fee: 2.5,
      },
      {
        id: 'credit',
        type: 'credit',
        label: 'Credit Card',
        icon: '💳',
        fee: 3.5,
      },
      {
        id: 'bank',
        type: 'bank',
        label: 'Bank Transfer',
        icon: '🏦',
        fee: 1.0,
      },
    ];
  },

  /**
   * Purchase cryptocurrency with fiat (mock)
   */
  purchaseCrypto: async (request: PurchaseRequest): Promise<PurchaseResponse> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get payment method to calculate fee
    const paymentMethods = await exchangeApi.getPaymentMethods();
    const paymentMethod = paymentMethods.find(pm => pm.id === request.paymentMethod);
    const feePercent = paymentMethod?.fee || 2.5;

    // Mock: Calculate fiat amount based on crypto price
    // In reality, this would come from the request or be calculated server-side
    const mockPriceUSD = 0.10; // VCoin price, adjust based on cryptocurrency
    const fiatAmount = request.amount * mockPriceUSD;
    const fee = fiatAmount * (feePercent / 100);
    const total = fiatAmount + fee;

    return {
      id: `purchase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      cryptocurrency: request.cryptocurrency,
      amount: request.amount,
      fiatAmount,
      currency: 'USD',
      fee,
      total,
      status: 'completed',
      timestamp: new Date().toISOString(),
    };
  },
};

