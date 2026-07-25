import React, { useMemo, useState } from 'react';
import type { CurrencyCode, Expense, Member } from '../../types';
import { ExpenseFilters, ExpenseList } from '../Expenses';
import { NetBalanceBanner } from './NetBalanceBanner';
import { QuickActionBar } from './QuickActionBar';
import { AddExpenseFab } from './AddExpenseFab';

interface LedgerViewProps {
  expenses: Expense[];
  members: Member[];
  displayCurrency: CurrencyCode;
  customRates?: Record<string, number>;
  netBalance: number;
  currentMemberName?: string;
  onAddExpense: () => void;
  onScanOcr: () => void;
  onImportCsv: () => void;
  onSettleUp: () => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
}

export const LedgerView: React.FC<LedgerViewProps> = ({
  expenses,
  members,
  displayCurrency,
  customRates,
  netBalance,
  currentMemberName,
  onAddExpense,
  onScanOcr,
  onImportCsv,
  onSettleUp,
  onEditExpense,
  onDeleteExpense,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMember, setSelectedMember] = useState('all');

  const filteredExpenses = useMemo(
    () =>
      expenses.filter(
        (e) =>
          e.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          (selectedCategory === 'all' || e.category === selectedCategory) &&
          (selectedMember === 'all' || e.paidByMemberId === selectedMember)
      ),
    [expenses, searchQuery, selectedCategory, selectedMember]
  );

  const emptyMessage = expenses.length === 0
    ? 'No entries yet. Tap + to log the first expense.'
    : 'No expenses match your filters.';

  return (
    <div className="view-stack">
      <NetBalanceBanner
        netBalance={netBalance}
        displayCurrency={displayCurrency}
        currentMemberName={currentMemberName}
      />

      <QuickActionBar onScanOcr={onScanOcr} onImportCsv={onImportCsv} onSettleUp={onSettleUp} />

      <ExpenseFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedMember={selectedMember}
        onMemberChange={setSelectedMember}
        members={members}
      />

      <ExpenseList
        expenses={filteredExpenses}
        members={members}
        displayCurrency={displayCurrency}
        customRates={customRates}
        onEditExpense={onEditExpense}
        onDeleteExpense={onDeleteExpense}
        emptyMessage={emptyMessage}
      />

      <AddExpenseFab onAddExpense={onAddExpense} />
    </div>
  );
};
