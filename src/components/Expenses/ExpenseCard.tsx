import React from 'react';
import type { Expense, Member, CurrencyCode } from '../../types';
import { formatCurrency, convertCurrency } from '../../services';
import { Utensils, Fuel, Home, ShoppingCart, Mountain, Car, CreditCard, Trash2, Calendar, User } from 'lucide-react';

interface ExpenseCardProps {
  expense: Expense;
  members: Member[];
  displayCurrency: CurrencyCode;
  iskRate: number;
  onDeleteExpense: (id: string) => void;
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({
  expense,
  members,
  displayCurrency,
  iskRate,
  onDeleteExpense,
}) => {
  const payer = members.find((m) => m.id === expense.paidByMemberId)?.name || 'Unknown Member';

  const amountISK = expense.amountInISK || convertCurrency(expense.amount, expense.currency, 'ISK', iskRate);
  const amountUSD = expense.amountInUSD || convertCurrency(expense.amount, expense.currency, 'USD', iskRate);

  const primaryAmountStr = displayCurrency === 'USD' ? formatCurrency(amountUSD, 'USD') : formatCurrency(amountISK, 'ISK');
  const secondaryAmountStr = displayCurrency === 'USD' ? formatCurrency(amountISK, 'ISK') : formatCurrency(amountUSD, 'USD');

  const CategoryIcon = getCategoryIcon(expense.category);

  return (
    <div className="expense-card glass-card">
      <div className="expense-card-left">
        <div className="category-badge-icon">
          <CategoryIcon size={20} />
        </div>
        <div className="expense-main-info">
          <h3 className="expense-title">{expense.title}</h3>
          <div className="expense-meta-row">
            <span className="meta-item">
              <Calendar size={13} /> {expense.date}
            </span>
            <span className="meta-item">
              <User size={13} /> Paid by <strong>{payer}</strong>
            </span>
            <span className="category-chip">{expense.category}</span>
          </div>
        </div>
      </div>

      <div className="expense-card-right">
        <div className="expense-amount-display">
          <span className="primary-amount">{primaryAmountStr}</span>
          <span className="secondary-amount">≈ {secondaryAmountStr}</span>
          {expense.currency !== displayCurrency && (
            <span className="original-curr-tag">Recorded in {expense.currency}</span>
          )}
        </div>

        <button
          className="delete-btn-icon"
          onClick={() => onDeleteExpense(expense.id)}
          title="Delete expense"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

function getCategoryIcon(category: string) {
  switch (category) {
    case 'food': return Utensils;
    case 'gas': return Fuel;
    case 'lodging': return Home;
    case 'groceries': return ShoppingCart;
    case 'activities': return Mountain;
    case 'transport': return Car;
    default: return CreditCard;
  }
}
