import React, { useState } from 'react';
import type { Expense, Member, CurrencyCode } from '../../types';
import { formatCurrency, convertCurrency } from '../../services';
import { categoryMeta, categoryColor } from './categoryMeta';
import { Pencil, X } from 'lucide-react';

interface ExpenseCardProps {
  expense: Expense;
  members: Member[];
  displayCurrency: CurrencyCode;
  customRates?: Record<string, number>;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({
  expense,
  members,
  displayCurrency,
  customRates,
  onEditExpense,
  onDeleteExpense,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const payer = members.find((m) => m.id === expense.paidByMemberId)?.name || 'Member';

  const convertedAmount = convertCurrency(expense.amount, expense.currency, displayCurrency, customRates);
  const primaryAmountStr = formatCurrency(convertedAmount, displayCurrency);

  const parsedDate = new Date(expense.date);
  const isValidDate = !isNaN(parsedDate.getTime());
  const month = isValidDate ? parsedDate.toLocaleString('en-US', { month: 'short' }) : '—';
  const day = isValidDate ? parsedDate.getDate() : '·';

  const meta = categoryMeta(expense.category);
  const stampColor = categoryColor(meta.hue);
  const toggle = () => setIsExpanded(!isExpanded);

  return (
    <div className="splitwise-expense-item">
      <div className="expense-row-main">
        <div className="expense-item-left" onClick={toggle}>
          <div className="date-stack">
            <span className="date-month">{month}</span>
            <span className="date-day">{day}</span>
          </div>

          <span className="category-tag" style={{ color: stampColor }} title={meta.label}>
            {meta.abbr}
          </span>

          <div className="expense-item-details">
            <h3 className="expense-title">{expense.title}</h3>
            <span className="expense-payer-sub">{payer.split(' ')[0]} paid</span>
          </div>
        </div>

        <div className="expense-item-right">
          <span className="expense-amount">{primaryAmountStr}</span>
          <button className="delete-btn-icon" onClick={() => onDeleteExpense(expense.id)} title="Remove entry">
            <X size={15} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
          <div className="expense-splits-expanded-box">
            {expense.splits.filter((s) => s.amount > 0).map((s) => {
              const memberName = members.find((m) => m.id === s.memberId)?.name || 'Member';
              const splitVal = convertCurrency(s.amount, expense.currency, displayCurrency, customRates);
              return (
                <div key={s.memberId} className="split-detail-row">
                  <span>{memberName.split(' ')[0]}</span>
                  <strong>{formatCurrency(splitVal, displayCurrency)}</strong>
                </div>
              );
            })}
          </div>

          <div className="expense-expanded-actions">
            <button className="btn-secondary-small" onClick={() => onEditExpense(expense)}>
              <Pencil size={12} /> Edit entry
            </button>
          </div>
        </>
      )}
    </div>
  );
};
