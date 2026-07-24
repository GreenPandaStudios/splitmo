import type { CurrencyCode } from './currency';
import type { SplitType } from './member';

export type ExpenseCategory =
  | 'food'
  | 'gas'
  | 'lodging'
  | 'activities'
  | 'transport'
  | 'groceries'
  | 'other';

export interface SplitShare {
  memberId: string;
  amount: number;
  percentage?: number;
  shares?: number;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  currency: CurrencyCode;
  amountInUSD: number;
  amountInISK: number;
  exchangeRateUsed: number;
  paidByMemberId: string;
  date: string;
  category: ExpenseCategory;
  splitType: SplitType;
  splits: SplitShare[];
  receiptUrl?: string;
  notes?: string;
  createdAt: string;
}
