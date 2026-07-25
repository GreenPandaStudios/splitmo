import type { CurrencyCode, CurrencyMeta } from '../types';

export const CURRENCY_LIST: CurrencyMeta[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'ISK', symbol: 'kr.', name: 'Icelandic Króna', flag: '🇮🇸' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  { code: 'CAD', symbol: '$', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'AUD', symbol: '$', name: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', flag: '🇨🇭' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', flag: '🇳🇴' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', flag: '🇸🇪' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone', flag: '🇩🇰' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', flag: '🇧🇷' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso', flag: '🇲🇽' },
  { code: 'SGD', symbol: '$', name: 'Singapore Dollar', flag: '🇸🇬' },
  { code: 'NZD', symbol: '$', name: 'New Zealand Dollar', flag: '🇳🇿' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', flag: '🇿🇦' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht', flag: '🇹🇭' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Złoty', flag: '🇵🇱' },
  { code: 'HKD', symbol: '$', name: 'Hong Kong Dollar', flag: '🇭🇰' },
  { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna', flag: '🇨🇿' },
  { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint', flag: '🇭🇺' },
];

export const DEFAULT_RATES: Record<string, number> = {
  USD: 1, ISK: 138.5, EUR: 0.92, GBP: 0.78, CAD: 1.36, AUD: 1.52, JPY: 155.2,
  CHF: 0.91, NOK: 10.6, SEK: 10.5, DKK: 6.85, INR: 83.4, BRL: 5.42, MXN: 18.2,
  SGD: 1.35, NZD: 1.64, ZAR: 18.1, THB: 36.7, PLN: 3.96, HKD: 7.81, CZK: 23.1, HUF: 362.5,
};

export function convertCurrency(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
  customRates?: Record<string, number>
): number {
  if (from === to || !amount || isNaN(amount)) return isNaN(amount) ? 0 : amount;
  const rates = { ...DEFAULT_RATES, ...(customRates && typeof customRates === 'object' ? customRates : {}) };
  let fromRate = rates[from] && !isNaN(rates[from]) && rates[from] > 0 ? rates[from] : DEFAULT_RATES[from] || 1;
  let toRate = rates[to] && !isNaN(rates[to]) && rates[to] > 0 ? rates[to] : DEFAULT_RATES[to] || 1;

  if (from === 'ISK' && fromRate <= 1.1) fromRate = DEFAULT_RATES['ISK'];
  if (to === 'ISK' && toRate <= 1.1) toRate = DEFAULT_RATES['ISK'];

  const inUSD = amount / fromRate;
  const converted = inUSD * toRate;
  return to === 'ISK' || to === 'JPY' || to === 'HUF' ? Math.round(converted) : Math.round(converted * 100) / 100;
}

export function formatCurrency(amount: number, currency: CurrencyCode): string {
  const meta = CURRENCY_LIST.find((c) => c.code === currency);
  const symbol = meta?.symbol || '$';
  if (currency === 'ISK' || currency === 'JPY' || currency === 'HUF') {
    return `${Math.round(amount).toLocaleString()} kr.`;
  }
  return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export async function fetchLiveRates(): Promise<Record<string, number>> {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    const data = await res.json();
    if (data?.rates) return data.rates;
  } catch (err) {
    console.warn('Live rates fetch failed, using defaults:', err);
  }
  return DEFAULT_RATES;
}
