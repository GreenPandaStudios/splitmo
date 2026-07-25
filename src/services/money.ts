import type { CurrencyCode } from '../types';

/** Currencies with no sub-unit — a "cent" of these does not exist as money. */
const ZERO_DECIMAL: CurrencyCode[] = ['ISK', 'JPY', 'HUF'];

/** The smallest indivisible amount of a currency, expressed in whole currency units. */
export function minorUnit(currency: CurrencyCode): number {
  return ZERO_DECIMAL.includes(currency) ? 1 : 0.01;
}

function toMinor(amount: number, currency: CurrencyCode): number {
  return Math.round(amount / minorUnit(currency));
}

function fromMinor(units: number, currency: CurrencyCode): number {
  return Math.round(units * minorUnit(currency) * 100) / 100;
}

/** Snaps an amount to something payable in the given currency. */
export function roundToCurrency(amount: number, currency: CurrencyCode): number {
  if (!isFinite(amount)) return 0;
  return fromMinor(toMinor(amount, currency), currency);
}

export function sumAmounts(amounts: number[], currency: CurrencyCode): number {
  return roundToCurrency(amounts.reduce((total, a) => total + (a || 0), 0), currency);
}

/**
 * Divides `total` into `count` shares that sum to it exactly. Any leftover minor units are handed
 * out one each from the front, so no money is invented or lost to rounding.
 */
export function splitEvenly(total: number, currency: CurrencyCode, count: number): number[] {
  if (count <= 0) return [];

  const sign = total < 0 ? -1 : 1;
  const units = Math.abs(toMinor(total, currency));
  const base = Math.floor(units / count);
  let leftover = units - base * count;

  return Array.from({ length: count }, () => {
    const extra = leftover > 0 ? 1 : 0;
    leftover -= extra;
    return fromMinor(sign * (base + extra), currency);
  });
}
