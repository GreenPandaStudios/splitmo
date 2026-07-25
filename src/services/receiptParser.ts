import type { ReceiptOCRResult, CurrencyCode, ExpenseCategory } from '../types';

/** Lines naming a payable total. SUBTOTAL also matches, which is fine — we take the largest. */
const TOTAL_KEYWORD = /(TOTAL|TOTALT|SAMTALS|SAMTALA|UPPH[ÆAE]Ð|TIL GREI[ÐD]SLU|AMOUNT|BALANCE|SUM)/i;

/** Lines carrying long digit strings that are never money. */
const NOISE = /(S[ÍI]MI|TEL[:.\s]|PHONE|VSK|VAT|KT[.:]|REG[.:]|KORT|CARD|\*{3,}|IBAN|BANK)/i;

const ZERO_DECIMAL = ['ISK', 'JPY', 'HUF'];

/** A date reads as a number ("24.07.2026" -> 2407.2026) and must never be mistaken for money. */
const DATE_IN_LINE = /\d{1,4}[./-]\d{1,2}[./-]\d{2,4}/;

/**
 * Reads one number from receipt text. The decimal separator is inferred from the trailing group:
 * 1-2 digits after the last separator is a decimal, exactly 3 is a thousands group. This keeps
 * US "12.34" from becoming 1234 and Icelandic "2.028" from becoming 2.028.
 */
export function parseReceiptNumber(raw: string): number | undefined {
  const cleaned = raw.replace(/\s/g, '').replace(/[^\d.,]/g, '');
  if (!cleaned || !/\d/.test(cleaned)) return undefined;

  const lastSep = Math.max(cleaned.lastIndexOf('.'), cleaned.lastIndexOf(','));
  if (lastSep === -1) {
    const n = parseFloat(cleaned);
    return isNaN(n) ? undefined : n;
  }

  const trailing = cleaned.length - lastSep - 1;
  if (trailing === 3) {
    const n = parseFloat(cleaned.replace(/[.,]/g, ''));
    return isNaN(n) ? undefined : n;
  }

  const whole = cleaned.slice(0, lastSep).replace(/[.,]/g, '');
  const fraction = cleaned.slice(lastSep + 1);
  const n = parseFloat(`${whole || '0'}.${fraction}`);
  return isNaN(n) ? undefined : n;
}

/** Lines that could plausibly carry an amount: no boilerplate identifiers, no dates. */
function moneyLines(lines: string[]): string[] {
  return lines.filter((l) => !NOISE.test(l) && !DATE_IN_LINE.test(l));
}

function detectCurrency(text: string, candidates: string[]): CurrencyCode {
  const upper = text.toUpperCase();
  if (upper.includes('$') || /\bUSD\b/.test(upper)) return 'USD';
  if (upper.includes('€') || /\bEUR\b/.test(upper)) return 'EUR';
  if (upper.includes('£') || /\bGBP\b/.test(upper)) return 'GBP';
  if (/\bISK\b|\bKR\b|KR\.|KR[ÓO]N/.test(upper)) return 'ISK';

  // Nothing explicit: fractional amounts rule out the zero-decimal currencies.
  const hasFractions = candidates.flatMap(numbersOnLine).some((n) => !Number.isInteger(n));
  return hasFractions ? 'USD' : 'ISK';
}

function numbersOnLine(line: string): number[] {
  const tokens = line.match(/\d[\d.,\s]*/g) || [];
  return tokens
    .map((t) => parseReceiptNumber(t))
    .filter((n): n is number => n !== undefined && n > 0);
}

function extractTotal(candidates: string[], currency: CurrencyCode): number | undefined {
  // A line that names a total is far more trustworthy than the largest number on the receipt.
  const keyed = candidates.filter((l) => TOTAL_KEYWORD.test(l)).flatMap(numbersOnLine);
  const pool = keyed.length > 0 ? keyed : candidates.flatMap(numbersOnLine);
  if (pool.length === 0) return undefined;

  const total = Math.max(...pool);
  return ZERO_DECIMAL.includes(currency) ? Math.round(total) : Math.round(total * 100) / 100;
}

function asIsoDate(year: number, month: number, day: number): string | undefined {
  if (month < 1 || month > 12 || day < 1 || day > 31) return undefined;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function extractDate(text: string): string | undefined {
  const iso = text.match(/(\d{4})[./-](\d{1,2})[./-](\d{1,2})/);
  if (iso) return asIsoDate(+iso[1], +iso[2], +iso[3]);

  const parts = text.match(/(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})/);
  if (!parts) return undefined;

  let year = +parts[3];
  if (year < 100) year += 2000;

  // Icelandic receipts are day-first, but a value above 12 can only be a day, which settles it.
  let [day, month] = [+parts[1], +parts[2]];
  if (month > 12 && day <= 12) [day, month] = [month, day];

  return asIsoDate(year, month, day);
}

const MERCHANTS: { match: RegExp; name: string; category: ExpenseCategory }[] = [
  { match: /B[ÓO]NUS/i, name: 'Bónus Supermarket', category: 'groceries' },
  { match: /KR[ÓO]NAN/i, name: 'Krónan Supermarket', category: 'groceries' },
  { match: /NETT[ÓO]/i, name: 'Nettó Store', category: 'groceries' },
  { match: /\bN1\b/i, name: 'N1 Gas Station', category: 'gas' },
  { match: /OL[ÍI]S/i, name: 'Olís Gas & Grill', category: 'gas' },
  { match: /ORKAN/i, name: 'Orkan', category: 'gas' },
  { match: /ICEWEAR/i, name: 'Icewear Iceland', category: 'activities' },
  { match: /SUBWAY/i, name: 'Subway', category: 'food' },
];

export function parseReceiptText(text: string): ReceiptOCRResult {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const known = MERCHANTS.find((m) => m.match.test(text));
  const candidates = moneyLines(lines);
  const currency = detectCurrency(text, candidates);

  return {
    merchantName: known?.name || (lines[0] ? lines[0].slice(0, 30) : 'Unknown merchant'),
    totalAmount: extractTotal(candidates, currency),
    currency,
    date: extractDate(text) || new Date().toISOString().split('T')[0],
    category: known?.category || 'food',
    rawText: text,
    confidence: known ? 0.9 : 0.6,
  };
}
