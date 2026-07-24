import type { CurrencyCode } from '../types';

export const DEFAULT_ISK_PER_USD = 138.5; // ~138.5 ISK per 1 USD

export function convertCurrency(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
  customIskRate?: number
): number {
  if (from === to) return amount;
  const rate = customIskRate && customIskRate > 0 ? customIskRate : DEFAULT_ISK_PER_USD;

  if (from === 'ISK' && to === 'USD') {
    return Math.round((amount / rate) * 100) / 100;
  }
  if (from === 'USD' && to === 'ISK') {
    return Math.round(amount * rate);
  }
  if (from === 'EUR' && to === 'USD') {
    return Math.round(amount * 1.08 * 100) / 100;
  }
  if (from === 'EUR' && to === 'ISK') {
    return Math.round(amount * 1.08 * rate);
  }
  return amount;
}

export function formatCurrency(amount: number, currency: CurrencyCode): string {
  if (currency === 'ISK') {
    return `${Math.round(amount).toLocaleString('is-IS')} kr.`;
  }
  if (currency === 'USD') {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `€${amount.toFixed(2)}`;
}

export async function fetchLiveIskRate(): Promise<number> {
  try {
    const response = await fetch('https://open.er-api.com/v6/latest/USD');
    const data = await response.json();
    if (data?.rates?.ISK) {
      return data.rates.ISK;
    }
  } catch (err) {
    console.warn('Could not fetch live exchange rate, using default ISK rate:', err);
  }
  return DEFAULT_ISK_PER_USD;
}
