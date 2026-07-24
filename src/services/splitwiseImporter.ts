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
  if (lines.length < 2) return { trip: createEmptyTrip(tripNameHint), ignoredCount: 0 };

  const headerRow = parseCsvRow(lines[0]);
  const memberNames = headerRow.slice(5).map((n) => n.trim()).filter((n) => n.length > 0);
  const members: Member[] = memberNames.map((name, idx) => ({ id: `m_sp_${Date.now()}_${idx}`, name }));

  const expenses: Expense[] = [];
  let ignoredCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const row = parseCsvRow(lines[i]);
    const description = (row[1] || '').trim();
    if (row.length < 4 || description.toLowerCase().includes('total balance')) {
      ignoredCount++; continue;
    }

    const date = (row[0] || '').trim() || new Date().toISOString().split('T')[0];
    const categoryRaw = (row[2] || '').trim();
    const costRaw = parseFloat(row[3] || '0');
    const currency = parseCurrencyCode(row[4] || 'USD');

    if (isNaN(costRaw) || costRaw <= 0) { ignoredCount++; continue; }

    let payerIndex = 0; let maxVal = -Infinity;
    members.forEach((_, idx) => {
      const val = parseFloat(row[5 + idx] || '0');
      if (val > maxVal) { maxVal = val; payerIndex = idx; }
    });

    const paidByMemberId = members[payerIndex]?.id || members[0]?.id;
    const splits = members.map((m, idx) => {
      const netVal = parseFloat(row[5 + idx] || '0');
      let share = netVal < 0 ? Math.abs(netVal) : (netVal > 0 ? Math.max(0, Math.round((costRaw - netVal) * 100) / 100) : 0);
      if (share <= 0) share = Math.round((costRaw / (members.length || 1)) * 100) / 100;
      return { memberId: m.id, amount: share };
    });

    expenses.push({
      id: `sp_${Date.now()}_${i}`, title: description || 'Imported Expense', amount: costRaw, currency,
      amountInISK: convertCurrency(costRaw, currency, 'ISK', customRates),
      amountInUSD: convertCurrency(costRaw, currency, 'USD', customRates),
      exchangeRateUsed: customRates?.[currency] || 1, paidByMemberId, date,
      category: mapCategory(categoryRaw), splitType: 'exact', splits, createdAt: new Date().toISOString(),
    });
  }

  const newTrip: TripGroup = {
    id: `trip_sp_${Date.now()}`, name: tripNameHint || 'Iceland Trip Ledger 🌋',
    description: 'Imported from official Splitwise CSV', supabaseConfig: DEFAULT_SUPABASE_CONFIG,
    currentMemberId: members[1]?.id || members[0]?.id,
    exchangeRates: { baseCurrency: expenses[0]?.currency || 'USD', rates: {}, lastUpdated: new Date().toISOString() },
    members, expenses, createdAt: new Date().toISOString(),
  };

  return { trip: newTrip, ignoredCount };
}

function createEmptyTrip(hint?: string): TripGroup {
  return {
    id: `trip_sp_${Date.now()}`, name: hint || 'Splitwise Import',
    exchangeRates: { baseCurrency: 'USD', rates: {}, lastUpdated: new Date().toISOString() },
    members: [], expenses: [], createdAt: new Date().toISOString(),
  };
}

function parseCurrencyCode(raw: string): CurrencyCode {
  const clean = raw.trim().toUpperCase();
  if (['USD', '$'].includes(clean)) return 'USD';
  if (['ISK', 'KR.'].includes(clean)) return 'ISK';
  if (['EUR', '€'].includes(clean)) return 'EUR';
  if (['GBP', '£'].includes(clean)) return 'GBP';
  return 'USD';
}

function parseCsvRow(row: string): string[] {
  const result: string[] = []; let current = ''; let inQuotes = false;
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    if (char === '"') inQuotes = !inQuotes;
    else if (char === ',' && !inQuotes) { result.push(current.trim().replace(/^"|"$/g, '')); current = ''; }
    else current += char;
  }
  result.push(current.trim().replace(/^"|"$/g, ''));
  return result;
}

function mapCategory(cat: string): ExpenseCategory {
  const c = cat.toLowerCase();
  if (c.includes('food') || c.includes('dining') || c.includes('dessert')) return 'food';
  if (c.includes('gas') || c.includes('fuel')) return 'gas';
  if (c.includes('hotel') || c.includes('lodging')) return 'lodging';
  if (c.includes('car') || c.includes('parking') || c.includes('tax') || c.includes('scooter')) return 'transport';
  if (c.includes('puffin') || c.includes('lagoon') || c.includes('activity')) return 'activities';
  return 'other';
}
