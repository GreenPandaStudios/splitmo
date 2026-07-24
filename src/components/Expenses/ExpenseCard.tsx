import React, { useState } from 'react';
import type { Expense, Member, CurrencyCode } from '../../types';
import { formatCurrency, convertCurrency } from '../../services';
import { Utensils, Fuel, Home, ShoppingCart, Mountain, Car, CreditCard, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

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

  const parsedDate = new Date(expense.date);
  const month = isNaN(parsedDate.getTime()) ? 'EXP' : parsedDate.toLocaleString('en-US', { month: 'short' });
  const day = isNaN(parsedDate.getTime()) ? '1' : parsedDate.getDate();

  const CategoryIcon = getCategoryIcon(expense.category);

  return (
    <div className="splitwise-expense-item" style={{ flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <div className="expense-item-left" onClick={() => setIsExpanded(!isExpanded)} style={{ cursor: 'pointer' }}>
          <div className="date-stack">
            <span className="date-month">{month}</span>
            <span className="date-day">{day}</span>
          </div>

          <div className="category-icon-box">
            <CategoryIcon size={18} />
          </div>

          <div className="expense-item-details">
            <h3 className="expense-title">{expense.title}</h3>
            <span className="expense-payer-sub">{payer} paid {primaryAmountStr}</span>
          </div>
        </div>

        <div className="expense-item-right">
          <div className="splitwise-share-box" onClick={() => setIsExpanded(!isExpanded)} style={{ cursor: 'pointer' }}>
            <span className="share-label">Total</span>
            <span className="share-val lent">{primaryAmountStr}</span>
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
        <div className="expense-splits-expanded-box" style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 10px', borderRadius: '6px', width: '100%', fontSize: '12px' }}>
          <span className="input-label">Member Shares:</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '6px', marginTop: '4px' }}>
            {expense.splits.map((s) => {
              const memberName = members.find((m) => m.id === s.memberId)?.name || 'Member';
              const splitVal = convertCurrency(s.amount, expense.currency, displayCurrency, customRates);
              return (
                <div key={s.memberId} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Space Mono', color: '#8c9ba5' }}>
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
