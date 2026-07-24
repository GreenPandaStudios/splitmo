export type CurrencyCode =
  | 'USD' | 'ISK' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'CHF'
  | 'NOK' | 'SEK' | 'DKK' | 'INR' | 'BRL' | 'MXN' | 'SGD' | 'NZD'
  | 'ZAR' | 'THB' | 'PLN' | 'HKD' | 'CZK' | 'HUF';

export interface CurrencyMeta {
  code: CurrencyCode;
  symbol: string;
  name: string;
  flag: string;
}

export interface ExchangeRates {
  baseCurrency: CurrencyCode;
  rates: Record<string, number>;
  lastUpdated: string;
}

export interface CurrencyAmount {
  amount: number;
  currency: CurrencyCode;
}
