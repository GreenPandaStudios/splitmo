import React from 'react';
import type { CurrencyCode, Expense } from '../../types';
import { formatCurrency, convertCurrency } from '../../services';
import { Wallet, Users, ArrowRightLeft, CreditCard } from 'lucide-react';

interface SummaryCardsProps {
  expenses: Expense[];
  memberCount: number;
  settlementCount: number;
  displayCurrency: CurrencyCode;
  iskRate: number;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  expenses,
  memberCount,
  settlementCount,
  displayCurrency,
  iskRate,
}) => {
  const totalISK = expenses.reduce(
    (sum, e) => sum + (e.amountInISK || convertCurrency(e.amount, e.currency, 'ISK', iskRate)),
    0
  );
  const totalUSD = expenses.reduce(
    (sum, e) => sum + (e.amountInUSD || convertCurrency(e.amount, e.currency, 'USD', iskRate)),
    0
  );

  const perPersonISK = memberCount > 0 ? totalISK / memberCount : 0;
  const perPersonUSD = memberCount > 0 ? totalUSD / memberCount : 0;

  const displayTotal = displayCurrency === 'USD' ? formatCurrency(totalUSD, 'USD') : formatCurrency(totalISK, 'ISK');
  const secondaryTotal = displayCurrency === 'USD' ? formatCurrency(totalISK, 'ISK') : formatCurrency(totalUSD, 'USD');

  const displayPerPerson = displayCurrency === 'USD' ? formatCurrency(perPersonUSD, 'USD') : formatCurrency(perPersonISK, 'ISK');
  const secondaryPerPerson = displayCurrency === 'USD' ? formatCurrency(perPersonISK, 'ISK') : formatCurrency(perPersonUSD, 'USD');

  return (
    <div className="summary-cards-grid">
      <div className="stat-card glass-card">
        <div className="stat-icon aurora-glow">
          <Wallet size={24} />
        </div>
        <div className="stat-content">
          <span className="stat-label">Total Trip Expense</span>
          <div className="stat-value">{displayTotal}</div>
          <span className="stat-subtext">≈ {secondaryTotal}</span>
        </div>
      </div>

      <div className="stat-card glass-card">
        <div className="stat-icon blue-glow">
          <Users size={24} />
        </div>
        <div className="stat-content">
          <span className="stat-label">Average per Person ({memberCount})</span>
          <div className="stat-value">{displayPerPerson}</div>
          <span className="stat-subtext">≈ {secondaryPerPerson}</span>
        </div>
      </div>

      <div className="stat-card glass-card">
        <div className="stat-icon purple-glow">
          <ArrowRightLeft size={24} />
        </div>
        <div className="stat-content">
          <span className="stat-label">Settlement Transfers</span>
          <div className="stat-value">{settlementCount} transfers</div>
          <span className="stat-subtext">Minimized graph solver</span>
        </div>
      </div>

      <div className="stat-card glass-card">
        <div className="stat-icon teal-glow">
          <CreditCard size={24} />
        </div>
        <div className="stat-content">
          <span className="stat-label">Expenses Recorded</span>
          <div className="stat-value">{expenses.length} items</div>
          <span className="stat-subtext">Multi-currency (ISK/USD)</span>
        </div>
      </div>
    </div>
  );
};
