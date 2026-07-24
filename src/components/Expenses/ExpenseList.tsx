import React from 'react';
import type { Expense, Member, CurrencyCode } from '../../types';
import { ExpenseCard } from './ExpenseCard';
import { Inbox } from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  members: Member[];
  displayCurrency: CurrencyCode;
  customRates?: Record<string, number>;
  onDeleteExpense: (id: string) => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  members,
  displayCurrency,
  customRates,
  onDeleteExpense,
}) => {
  if (expenses.length === 0) {
    return (
      <div className="empty-state-box glass-card">
        <Inbox size={36} className="icon-muted" />
        <p className="empty-title">No expenses recorded yet</p>
        <p className="empty-subtext">Tap '+' or scan a receipt to log your first expense.</p>
      </div>
    );
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
          onDeleteExpense={onDeleteExpense}
        />
      ))}
    </div>
  );
};
