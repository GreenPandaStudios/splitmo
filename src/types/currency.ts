export type CurrencyCode = 'ISK' | 'USD' | 'EUR';

export interface ExchangeRates {
  baseCurrency: CurrencyCode;
  rates: Record<string, number>;
  lastUpdated: string;
  isCustomRate?: boolean;
}

export interface CurrencyAmount {
  amount: number;
  currency: CurrencyCode;
}
