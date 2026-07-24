import React from 'react';
import type { CurrencyCode, Expense } from '../../types';
import { formatCurrency, convertCurrency } from '../../services';
import { Wallet, Users, ArrowRightLeft, CreditCard } from 'lucide-react';

interface SummaryCardsProps {
  expenses: Expense[];
  memberCount: number;
  settlementCount: number;
  displayCurrency: CurrencyCode;
  customRates?: Record<string, number>;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  expenses,
  memberCount,
  settlementCount,
  displayCurrency,
  customRates,
}) => {
  const totalConverted = expenses.reduce(
    (sum, e) => sum + convertCurrency(e.amount, e.currency, displayCurrency, customRates),
    0
  );

  const perPersonConverted = memberCount > 0 ? totalConverted / memberCount : 0;
  const displayTotal = formatCurrency(totalConverted, displayCurrency);
  const displayPerPerson = formatCurrency(perPersonConverted, displayCurrency);

  return (
    <div className="summary-cards-grid">
      <div className="stat-card glass-card">
        <div className="stat-icon aurora-glow">
          <Wallet size={22} />
        </div>
        <div className="stat-content">
          <span className="stat-label">Total Spent</span>
          <div className="stat-value">{displayTotal}</div>
          <span className="stat-subtext">Sum across all trip expenses</span>
        </div>
      </div>

      <div className="stat-card glass-card">
        <div className="stat-icon blue-glow">
          <Users size={22} />
        </div>
        <div className="stat-content">
          <span className="stat-label">Per Person ({memberCount})</span>
          <div className="stat-value">{displayPerPerson}</div>
          <span className="stat-subtext">Equal split target</span>
        </div>
      </div>

      <div className="stat-card glass-card">
        <div className="stat-icon purple-glow">
          <ArrowRightLeft size={22} />
        </div>
        <div className="stat-content">
          <span className="stat-label">Transfers</span>
          <div className="stat-value">{settlementCount} needed</div>
          <span className="stat-subtext">Minimized debt graph</span>
        </div>
      </div>

      <div className="stat-card glass-card">
        <div className="stat-icon teal-glow">
          <CreditCard size={22} />
        </div>
        <div className="stat-content">
          <span className="stat-label">Expenses</span>
          <div className="stat-value">{expenses.length} items</div>
          <span className="stat-subtext">Multi-currency ledger</span>
        </div>
      </div>
    </div>
  );
};
