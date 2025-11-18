export interface ExchangeRequest {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  slippagePercent?: number;
}

export interface ExchangeResponse {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  inputAmount: number;
  outputAmount: number;
  rate: number;
  slippage: number;
  fee: number;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface ExchangeQuote {
  fromCurrency: string;
  toCurrency: string;
  inputAmount: number;
  outputAmount: number;
  rate: number;
  slippage: number;
  fee: number;
  expiresAt: string;
}

export interface PaymentMethod {
  id: string;
  type: 'debit' | 'credit' | 'bank';
  label: string;
  icon: string;
  fee: number; // percentage
}

export interface PurchaseRequest {
  cryptocurrency: string;
  amount: number; // in crypto
  paymentMethod: string;
  cardDetails?: {
    number: string;
    expiry: string;
    cvv: string;
    name: string;
  };
}

export interface PurchaseResponse {
  id: string;
  cryptocurrency: string;
  amount: number;
  fiatAmount: number;
  currency: string;
  fee: number;
  total: number;
  status: 'completed' | 'pending' | 'failed';
  timestamp: string;
}

