import React from 'react';
import type { Expense, Member, CurrencyCode } from '../../types';
import { ExpenseCard } from './ExpenseCard';
import { Inbox } from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  members: Member[];
  displayCurrency: CurrencyCode;
  iskRate: number;
  onDeleteExpense: (id: string) => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  members,
  displayCurrency,
  iskRate,
  onDeleteExpense,
}) => {
  if (expenses.length === 0) {
    return (
      <div className="empty-state-box glass-card">
        <Inbox size={40} className="icon-muted" />
        <p className="empty-title">No expenses found</p>
        <p className="empty-subtext">Add a new expense or import from Splitwise to get started.</p>
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
          iskRate={iskRate}
          onDeleteExpense={onDeleteExpense}
        />
      ))}
    </div>
  );
};
