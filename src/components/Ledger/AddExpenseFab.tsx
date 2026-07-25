import React from 'react';
import { Plus } from 'lucide-react';

interface AddExpenseFabProps {
  onAddExpense: () => void;
}

export const AddExpenseFab: React.FC<AddExpenseFabProps> = ({ onAddExpense }) => (
  <button className="add-expense-fab" onClick={onAddExpense} title="Add expense" aria-label="Add expense">
    <Plus size={26} />
  </button>
);
