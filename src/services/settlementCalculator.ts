import type { Member, Expense, MemberBalance, DebtSettlement, SplitShare, CurrencyCode } from '../types';
import { convertCurrency } from './currencyService';

export function calculateMemberBalances(
  members: Member[],
  expenses: Expense[],
  customRates?: Record<string, number>,
  displayCurrency: CurrencyCode = 'USD'
): MemberBalance[] {
  const balances: Record<string, { paid: number; share: number }> = {};

  members.forEach((m) => {
    balances[m.id] = { paid: 0, share: 0 };
  });

  expenses.forEach((e) => {
    const paidInDisplay = convertCurrency(e.amount, e.currency, displayCurrency, customRates);

    if (balances[e.paidByMemberId]) {
      balances[e.paidByMemberId].paid += paidInDisplay;
    }

    e.splits.forEach((s: SplitShare) => {
      if (balances[s.memberId]) {
        const shareInDisplay = convertCurrency(s.amount, e.currency, displayCurrency, customRates);
        balances[s.memberId].share += shareInDisplay;
      }
    });
  });

  return members.map((m) => {
    const b = balances[m.id] || { paid: 0, share: 0 };
    const net = b.paid - b.share;
    const isRounded = displayCurrency === 'ISK' || displayCurrency === 'JPY' || displayCurrency === 'HUF';
    const roundedNet = isRounded ? Math.round(net) : Math.round(net * 100) / 100;

    return {
      memberId: m.id,
      memberName: m.name,
      totalPaidISK: b.paid,
      totalPaidUSD: b.paid,
      totalShareISK: b.share,
      totalShareUSD: b.share,
      netBalanceISK: roundedNet,
      netBalanceUSD: roundedNet,
    };
  });
}

export function simplifyDebts(
  memberBalances: MemberBalance[],
  customRates?: Record<string, number>
): DebtSettlement[] {
  const debtors = memberBalances
    .filter((b) => b.netBalanceISK < -0.05)
    .map((b) => ({ id: b.memberId, name: b.memberName, amount: -b.netBalanceISK }))
    .sort((a, b) => b.amount - a.amount);

  const creditors = memberBalances
    .filter((b) => b.netBalanceISK > 0.05)
    .map((b) => ({ id: b.memberId, name: b.memberName, amount: b.netBalanceISK }))
    .sort((a, b) => b.amount - a.amount);

  const settlements: DebtSettlement[] = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const settlementVal = Math.min(debtor.amount, creditor.amount);

    if (settlementVal > 0.01) {
      settlements.push({
        fromMemberId: debtor.id,
        fromMemberName: debtor.name,
        toMemberId: creditor.id,
        toMemberName: creditor.name,
        amountISK: Math.round(settlementVal * 100) / 100,
        amountUSD: Math.round(settlementVal * 100) / 100,
      });
    }

    debtor.amount -= settlementVal;
    creditor.amount -= settlementVal;

    if (debtor.amount < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  return settlements;
}
