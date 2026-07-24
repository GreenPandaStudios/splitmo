import React from 'react';
import type { CurrencyCode } from '../types';
import { CURRENCY_LIST } from '../services';
import { Compass, RefreshCw, Layers } from 'lucide-react';

interface HeaderProps {
  tripName: string;
  displayCurrency: CurrencyCode;
  onSelectCurrency: (code: CurrencyCode) => void;
  onRefreshRate: () => void;
  isDbActive: boolean;
  dbTypeName?: string;
  onOpenTripManager: () => void;
  netBalance?: number;
}

export const Header: React.FC<HeaderProps> = ({
  tripName,
  displayCurrency,
  onSelectCurrency,
  onRefreshRate,
  onOpenTripManager,
  netBalance = 0,
}) => {
  const isOwed = netBalance > 0.5;
  const owes = netBalance < -0.5;

  return (
    <header className="app-header glass-card">
      <div className="header-top-bar">
        <div className="header-brand">
          <div className="brand-icon-wrapper" onClick={onOpenTripManager} title="Manage Trips">
            <Compass size={22} />
          </div>
          <div>
            <h1 className="brand-title">{tripName}</h1>
            <p className="brand-subtitle">Group Expense Ledger</p>
          </div>
        </div>

        <div className="header-actions">
          <button className="btn-secondary" onClick={onOpenTripManager}>
            <Layers size={14} /> Trips
          </button>
          <button className="icon-btn-small" onClick={onRefreshRate} title="Refresh Rates">
            <RefreshCw size={13} />
          </button>
          <select
            value={displayCurrency}
            onChange={(e) => onSelectCurrency(e.target.value as CurrencyCode)}
            className="select-input curr-select-header"
          >
            {CURRENCY_LIST.map((c) => (
              <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="splitwise-balance-banner">
        <span className="banner-left">Group Total Status</span>
        <span className={`banner-right ${isOwed ? 'positive' : owes ? 'negative' : ''}`}>
          {isOwed ? `Overall you are owed $${Math.abs(Math.round(netBalance))}` : owes ? `Overall you owe $${Math.abs(Math.round(netBalance))}` : 'You are settled up'}
        </span>
      </div>
    </header>
  );
};
