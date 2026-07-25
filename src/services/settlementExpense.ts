import type { DebtSettlement, Expense, CurrencyCode } from '../types';

/** Records a settle-up transfer as a ledger entry paid by the debtor to the creditor. */
export function buildSettlementExpense(s: DebtSettlement, displayCurrency: CurrencyCode): Expense {
  return {
    id: `set_${Date.now()}`,
    title: `Settlement: ${s.fromMemberName} → ${s.toMemberName}`,
    amount: s.amountISK,
    currency: displayCurrency,
    amountInISK: s.amountISK,
    amountInUSD: s.amountUSD,
    exchangeRateUsed: 1,
    paidByMemberId: s.fromMemberId,
    date: new Date().toISOString().split('T')[0],
    category: 'other',
    splitType: 'exact',
    splits: [{ memberId: s.toMemberId, amount: s.amountISK }],
    createdAt: new Date().toISOString(),
  };
}
