export interface Cryptocurrency {
  id: string;
  symbol: string;
  name: string;
  icon: string;
  priceUSD: number;
  color: string;
}

// Mock exchange rates relative to VCoin (1 VCN = X units of crypto)
export const CRYPTOCURRENCIES: Cryptocurrency[] = [
  {
    id: 'vcoin',
    symbol: 'VCN',
    name: 'VCoin',
    icon: '💎',
    priceUSD: 0.10,
    color: '#00D9FF',
  },
  {
    id: 'bitcoin',
    symbol: 'BTC',
    name: 'Bitcoin',
    icon: '₿',
    priceUSD: 43250.00,
    color: '#F7931A',
  },
  {
    id: 'ethereum',
    symbol: 'ETH',
    name: 'Ethereum',
    icon: 'Ξ',
    priceUSD: 2280.00,
    color: '#627EEA',
  },
  {
    id: 'tether',
    symbol: 'USDT',
    name: 'Tether',
    icon: '₮',
    priceUSD: 1.00,
    color: '#26A17B',
  },
  {
    id: 'usd-coin',
    symbol: 'USDC',
    name: 'USD Coin',
    icon: '$',
    priceUSD: 1.00,
    color: '#2775CA',
  },
  {
    id: 'binance-coin',
    symbol: 'BNB',
    name: 'BNB',
    icon: 'B',
    priceUSD: 310.50,
    color: '#F3BA2F',
  },
  {
    id: 'solana',
    symbol: 'SOL',
    name: 'Solana',
    icon: 'S',
    priceUSD: 98.75,
    color: '#00FFA3',
  },
  {
    id: 'cardano',
    symbol: 'ADA',
    name: 'Cardano',
    icon: 'A',
    priceUSD: 0.52,
    color: '#0033AD',
  },
  {
    id: 'polkadot',
    symbol: 'DOT',
    name: 'Polkadot',
    icon: 'D',
    priceUSD: 7.25,
    color: '#E6007A',
  },
  {
    id: 'polygon',
    symbol: 'MATIC',
    name: 'Polygon',
    icon: 'M',
    priceUSD: 0.88,
    color: '#8247E5',
  },
  {
    id: 'avalanche',
    symbol: 'AVAX',
    name: 'Avalanche',
    icon: 'Av',
    priceUSD: 36.80,
    color: '#E84142',
  },
  {
    id: 'chainlink',
    symbol: 'LINK',
    name: 'Chainlink',
    icon: 'L',
    priceUSD: 14.85,
    color: '#375BD2',
  },
  {
    id: 'uniswap',
    symbol: 'UNI',
    name: 'Uniswap',
    icon: 'U',
    priceUSD: 6.42,
    color: '#FF007A',
  },
];

// Calculate exchange rate between two cryptocurrencies
export const getExchangeRate = (fromSymbol: string, toSymbol: string): number => {
  const fromCrypto = CRYPTOCURRENCIES.find(c => c.symbol === fromSymbol);
  const toCrypto = CRYPTOCURRENCIES.find(c => c.symbol === toSymbol);
  
  if (!fromCrypto || !toCrypto) {
    return 0;
  }
  
  // Calculate rate based on USD prices
  const rate = fromCrypto.priceUSD / toCrypto.priceUSD;
  
  // Add small random fluctuation (±0.5%) to simulate market movement
  const fluctuation = 1 + (Math.random() - 0.5) * 0.01;
  
  return rate * fluctuation;
};

// Calculate conversion with slippage
export const calculateConversion = (
  amount: number,
  fromSymbol: string,
  toSymbol: string,
  slippagePercent: number = 0.5
): { outputAmount: number; rate: number; slippage: number } => {
  const rate = getExchangeRate(fromSymbol, toSymbol);
  const outputBeforeSlippage = amount * rate;
  const slippage = outputBeforeSlippage * (slippagePercent / 100);
  const outputAmount = outputBeforeSlippage - slippage;
  
  return {
    outputAmount,
    rate,
    slippage,
  };
};

export const getCryptoBySymbol = (symbol: string): Cryptocurrency | undefined => {
  return CRYPTOCURRENCIES.find(c => c.symbol === symbol);
};

