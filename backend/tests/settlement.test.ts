import { describe, it, expect } from 'vitest';
import { computeNetBalances } from '../src/settlementLogic';

describe('Iceland Expense Settlement Logic', () => {
  it('correctly calculates net balances for equal splits in ISK', () => {
    const members = [
      { id: 'm1', name: 'Alice' },
      { id: 'm2', name: 'Bob' },
    ];
    const expenses = [
      { id: 'e1', amountISK: 10000, paidById: 'm1', splitMemberIds: ['m1', 'm2'] },
    ];

    const balances = computeNetBalances(members, expenses);
    expect(balances).toHaveLength(2);
    
    const alice = balances.find((b) => b.memberId === 'm1');
    const bob = balances.find((b) => b.memberId === 'm2');

    expect(alice?.net).toBe(5000);
    expect(bob?.net).toBe(-5000);
  });
});
