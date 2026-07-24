import type { Member, Expense, MemberBalance, DebtSettlement, SplitShare } from '../types';
import { convertCurrency } from './currencyService';

export function calculateMemberBalances(
  members: Member[],
  expenses: Expense[],
  customIskRate?: number
): MemberBalance[] {
  const balances: Record<string, { paidISK: number; paidUSD: number; shareISK: number; shareUSD: number }> = {};

  members.forEach((m) => {
    balances[m.id] = { paidISK: 0, paidUSD: 0, shareISK: 0, shareUSD: 0 };
  });

  expenses.forEach((e) => {
    const paidISK = e.amountInISK || convertCurrency(e.amount, e.currency, 'ISK', customIskRate);
    const paidUSD = e.amountInUSD || convertCurrency(e.amount, e.currency, 'USD', customIskRate);

    if (balances[e.paidByMemberId]) {
      balances[e.paidByMemberId].paidISK += paidISK;
      balances[e.paidByMemberId].paidUSD += paidUSD;
    }

    e.splits.forEach((s: SplitShare) => {
      if (balances[s.memberId]) {
        const sISK = convertCurrency(s.amount, e.currency, 'ISK', customIskRate);
        const sUSD = convertCurrency(s.amount, e.currency, 'USD', customIskRate);
        balances[s.memberId].shareISK += sISK;
        balances[s.memberId].shareUSD += sUSD;
      }
    });
  });

  return members.map((m) => {
    const b = balances[m.id] || { paidISK: 0, paidUSD: 0, shareISK: 0, shareUSD: 0 };
    return {
      memberId: m.id,
      memberName: m.name,
      totalPaidISK: b.paidISK,
      totalPaidUSD: b.paidUSD,
      totalShareISK: b.shareISK,
      totalShareUSD: b.shareUSD,
      netBalanceISK: Math.round(b.paidISK - b.shareISK),
      netBalanceUSD: Math.round((b.paidUSD - b.shareUSD) * 100) / 100,
    };
  });
}

export function simplifyDebts(
  memberBalances: MemberBalance[],
  customIskRate?: number
): DebtSettlement[] {
  const debtors = memberBalances
    .filter((b) => b.netBalanceISK < -5)
    .map((b) => ({ id: b.memberId, name: b.memberName, amount: -b.netBalanceISK }))
    .sort((a, b) => b.amount - a.amount);

  const creditors = memberBalances
    .filter((b) => b.netBalanceISK > 5)
    .map((b) => ({ id: b.memberId, name: b.memberName, amount: b.netBalanceISK }))
    .sort((a, b) => b.amount - a.amount);

  const settlements: DebtSettlement[] = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const settlementISK = Math.min(debtor.amount, creditor.amount);

    if (settlementISK > 1) {
      const settlementUSD = convertCurrency(settlementISK, 'ISK', 'USD', customIskRate);
      settlements.push({
        fromMemberId: debtor.id,
        fromMemberName: debtor.name,
        toMemberId: creditor.id,
        toMemberName: creditor.name,
        amountISK: Math.round(settlementISK),
        amountUSD: settlementUSD,
      });
    }

    debtor.amount -= settlementISK;
    creditor.amount -= settlementISK;

    if (debtor.amount < 1) i++;
    if (creditor.amount < 1) j++;
  }

  return settlements;
}
