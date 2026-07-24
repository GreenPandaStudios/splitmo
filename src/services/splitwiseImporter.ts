import type { Member, Expense, CurrencyCode, ExpenseCategory, TripGroup } from '../types';
import { convertCurrency } from './currencyService';
import { DEFAULT_SUPABASE_CONFIG } from './supabaseService';

export interface SplitwiseImportResult {
  trip: TripGroup;
  ignoredCount: number;
}

export function parseSplitwiseCSVToTrip(
  csvContent: string,
  tripNameHint?: string,
  customRates?: Record<string, number>
): SplitwiseImportResult {
  const lines = csvContent.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    const emptyTrip: TripGroup = {
      id: `trip_sp_${Date.now()}`,
      name: tripNameHint || 'Splitwise Import',
      exchangeRates: { baseCurrency: 'USD', rates: {}, lastUpdated: new Date().toISOString() },
      members: [], expenses: [], createdAt: new Date().toISOString(),
    };
    return { trip: emptyTrip, ignoredCount: 0 };
  }

  const membersMap = new Map<string, Member>();
  const expenses: Expense[] = [];
  let ignoredCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const row = parseCsvRow(lines[i]);
    if (row.length < 3) continue;

    const date = row[0] || new Date().toISOString().split('T')[0];
    const description = row[1] || 'Imported Expense';
    const categoryRaw = row[2] || 'other';
    const costRaw = parseFloat(row[3] || row[4] || '0');
    const currencyRaw = (row[4] && isNaN(Number(row[4])) ? row[4] : 'USD').toUpperCase();
    const currency: CurrencyCode = (currencyRaw as CurrencyCode) || 'USD';

    if (isNaN(costRaw) || costRaw <= 0) {
      ignoredCount++;
      continue;
    }

    const paidByName = row[5] || 'Unknown';
    let payer = membersMap.get(paidByName.toLowerCase());
    if (!payer) {
      payer = { id: `m_sp_${Date.now()}_${membersMap.size}`, name: paidByName };
      membersMap.set(paidByName.toLowerCase(), payer);
    }

    const membersList = Array.from(membersMap.values());
    const splitAmount = Math.round((costRaw / (membersList.length || 1)) * 100) / 100;

    const expense: Expense = {
      id: `sp_${Date.now()}_${i}`,
      title: description,
      amount: costRaw,
      currency,
      amountInISK: convertCurrency(costRaw, currency, 'ISK', customRates),
      amountInUSD: convertCurrency(costRaw, currency, 'USD', customRates),
      exchangeRateUsed: customRates?.[currency] || 1,
      paidByMemberId: payer.id,
      date,
      category: mapCategory(categoryRaw),
      splitType: 'equal',
      splits: membersList.map((m) => ({ memberId: m.id, amount: splitAmount })),
      createdAt: new Date().toISOString(),
    };

    expenses.push(expense);
  }

  const members = Array.from(membersMap.values());
  const newTrip: TripGroup = {
    id: `trip_sp_${Date.now()}`,
    name: tripNameHint || 'Splitwise Group Import 📊',
    description: 'Imported full trip from Splitwise CSV export',
    supabaseConfig: DEFAULT_SUPABASE_CONFIG,
    exchangeRates: { baseCurrency: 'USD', rates: {}, lastUpdated: new Date().toISOString() },
    members,
    expenses,
    createdAt: new Date().toISOString(),
  };

  return { trip: newTrip, ignoredCount };
}

function parseCsvRow(row: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    if (char === '"') inQuotes = !inQuotes;
    else if (char === ',' && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
    } else current += char;
  }
  result.push(current.trim().replace(/^"|"$/g, ''));
  return result;
}

function mapCategory(cat: string): ExpenseCategory {
  const c = cat.toLowerCase();
  if (c.includes('food') || c.includes('dining') || c.includes('restaurant')) return 'food';
  if (c.includes('gas') || c.includes('fuel')) return 'gas';
  if (c.includes('hotel') || c.includes('lodging') || c.includes('stay')) return 'lodging';
  if (c.includes('grocer') || c.includes('supermarket')) return 'groceries';
  if (c.includes('tour') || c.includes('activity')) return 'activities';
  if (c.includes('flight') || c.includes('car') || c.includes('taxi')) return 'transport';
  return 'other';
}
