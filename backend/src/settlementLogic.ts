export interface TestMember {
  id: string;
  name: string;
}

export interface TestExpense {
  id: string;
  amountISK: number;
  paidById: string;
  splitMemberIds: string[];
}

export interface TestBalance {
  memberId: string;
  paid: number;
  share: number;
  net: number;
}

export function computeNetBalances(members: TestMember[], expenses: TestExpense[]): TestBalance[] {
  const map: Record<string, { paid: number; share: number }> = {};
  members.forEach((m) => {
    map[m.id] = { paid: 0, share: 0 };
  });

  expenses.forEach((e) => {
    if (map[e.paidById]) map[e.paidById].paid += e.amountISK;
    const perHead = Math.round(e.amountISK / (e.splitMemberIds.length || 1));
    e.splitMemberIds.forEach((id) => {
      if (map[id]) map[id].share += perHead;
    });
  });

  return members.map((m) => {
    const b = map[m.id] || { paid: 0, share: 0 };
    return {
      memberId: m.id,
      paid: b.paid,
      share: b.share,
      net: b.paid - b.share,
    };
  });
}
