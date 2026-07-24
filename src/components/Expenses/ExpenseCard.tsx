import React, { useState } from 'react';
import type { Expense, Member, CurrencyCode } from '../../types';
import { formatCurrency, convertCurrency } from '../../services';
import { Utensils, Fuel, Home, ShoppingCart, Mountain, Car, CreditCard, Trash2, Calendar, User, ChevronDown, ChevronUp } from 'lucide-react';

interface ExpenseCardProps {
  expense: Expense;
  members: Member[];
  displayCurrency: CurrencyCode;
  customRates?: Record<string, number>;
  onDeleteExpense: (id: string) => void;
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({
  expense,
  members,
  displayCurrency,
  customRates,
  onDeleteExpense,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const payer = members.find((m) => m.id === expense.paidByMemberId)?.name || 'Member';

  const convertedAmount = convertCurrency(expense.amount, expense.currency, displayCurrency, customRates);
  const primaryAmountStr = formatCurrency(convertedAmount, displayCurrency);
  const originalAmountStr = formatCurrency(expense.amount, expense.currency);

  const CategoryIcon = getCategoryIcon(expense.category);

  return (
    <div className="expense-card glass-card" style={{ flexDirection: 'column', gap: '8px' }}>
      <div className="expense-card-main-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <div className="expense-card-left" onClick={() => setIsExpanded(!isExpanded)} style={{ cursor: 'pointer' }}>
          <div className="category-badge-icon">
            <CategoryIcon size={18} />
          </div>
          <div className="expense-main-info">
            <h3 className="expense-title">{expense.title}</h3>
            <div className="expense-meta-row">
              <span className="meta-item"><Calendar size={12} /> {expense.date}</span>
              <span className="meta-item"><User size={12} /> {payer}</span>
              <span className="category-chip">{expense.category}</span>
            </div>
          </div>
        </div>

        <div className="expense-card-right">
          <div className="expense-amount-display" onClick={() => setIsExpanded(!isExpanded)} style={{ cursor: 'pointer' }}>
            <span className="primary-amount">{primaryAmountStr}</span>
            {expense.currency !== displayCurrency && (
              <span className="secondary-amount">Orig: {originalAmountStr}</span>
            )}
          </div>

          <button className="delete-btn-icon" onClick={() => setIsExpanded(!isExpanded)} title="Toggle details">
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          <button className="delete-btn-icon" onClick={() => onDeleteExpense(expense.id)} title="Delete expense">
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="expense-splits-expanded-box">
          <span className="input-label">Split Breakdown:</span>
          <div className="splits-grid-mini">
            {expense.splits.map((s) => {
              const memberName = members.find((m) => m.id === s.memberId)?.name || 'Member';
              const splitVal = convertCurrency(s.amount, expense.currency, displayCurrency, customRates);
              return (
                <div key={s.memberId} className="mini-split-row">
                  <span>{memberName}:</span>
                  <strong>{formatCurrency(splitVal, displayCurrency)}</strong>
                </div>
              );
            })}
          </div>
        </div>
      )}
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
