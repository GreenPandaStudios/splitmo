import type { Member } from './member';
import type { Expense } from './expense';
import type { ExchangeRates } from './currency';
import type { SupabaseConfig } from '../services/supabaseService';

export interface TripGroup {
  id: string;
  name: string;
  description?: string;
  customIskToUsdRate?: number;
  currentMemberId?: string;
  supabaseConfig?: SupabaseConfig;
  exchangeRates: ExchangeRates;
  members: Member[];
  expenses: Expense[];
  createdAt: string;
}

export interface TripSummary {
  id: string;
  name: string;
  description?: string;
  expenseCount: number;
  memberCount: number;
}

export interface DebtSettlement {
  fromMemberId: string;
  fromMemberName: string;
  toMemberId: string;
  toMemberName: string;
  amountISK: number;
  amountUSD: number;
}
