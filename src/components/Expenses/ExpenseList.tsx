import React from 'react';
import type { Expense, Member, CurrencyCode } from '../../types';
import { ExpenseCard } from './ExpenseCard';

interface ExpenseListProps {
  expenses: Expense[];
  members: Member[];
  displayCurrency: CurrencyCode;
  customRates?: Record<string, number>;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  emptyMessage?: string;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  members,
  displayCurrency,
  customRates,
  onEditExpense,
  onDeleteExpense,
  emptyMessage = 'No expenses match your filters.',
}) => {
  if (expenses.length === 0) {
    return <div className="ledger-empty-note">{emptyMessage}</div>;
  }

  return (
    <div className="expense-list-container">
      {expenses.map((expense) => (
        <ExpenseCard
          key={expense.id}
          expense={expense}
          members={members}
          displayCurrency={displayCurrency}
          customRates={customRates}
          onEditExpense={onEditExpense}
          onDeleteExpense={onDeleteExpense}
        />
      ))}
    </div>
  );
};
