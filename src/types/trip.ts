import type { Member } from './member';
import type { Expense } from './expense';
import type { ExchangeRates } from './currency';

export interface TripGroup {
  id: string;
  name: string;
  description: string;
  members: Member[];
  expenses: Expense[];
  exchangeRates: ExchangeRates;
  customIskToUsdRate?: number;
  supabaseConfig?: {
    url: string;
    anonKey: string;
  };
  createdAt?: string;
}

export interface TripSummary {
  id: string;
  name: string;
  expenseCount: number;
  totalISK: number;
  totalUSD: number;
}

export interface DebtSettlement {
  fromMemberId: string;
  fromMemberName: string;
  toMemberId: string;
  toMemberName: string;
  amountISK: number;
  amountUSD: number;
}
