import React from 'react';
import type { CurrencyCode } from '../types';
import { CURRENCY_LIST } from '../services';
import { Compass, RefreshCw, Database, Layers } from 'lucide-react';

interface HeaderProps {
  tripName: string;
  displayCurrency: CurrencyCode;
  onSelectCurrency: (code: CurrencyCode) => void;
  onRefreshRate: () => void;
  isDbActive: boolean;
  dbTypeName?: string;
  onOpenTripManager: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  tripName,
  displayCurrency,
  onSelectCurrency,
  onRefreshRate,
  isDbActive,
  dbTypeName = 'Local DB',
  onOpenTripManager,
}) => {
  return (
    <header className="app-header glass-card">
      <div className="header-brand">
        <div className="brand-icon-wrapper" onClick={onOpenTripManager} title="Manage Trips">
          <Compass className="brand-icon spinning-compass" size={24} />
        </div>
        <div>
          <h1 className="brand-title">Splitmo</h1>
          <p className="brand-subtitle">{tripName}</p>
        </div>
      </div>

      <div className="header-actions">
        <button className="btn-secondary" onClick={onOpenTripManager}>
          <Layers size={14} />
          <span>Trips</span>
        </button>

        <div className="status-badge live-rate-badge">
          <span>Rates Live</span>
          <button className="icon-btn-small" onClick={onRefreshRate} title="Refresh Rates">
            <RefreshCw size={11} />
          </button>
        </div>

        <div className={`status-badge fb-badge ${isDbActive ? 'connected' : 'local'}`}>
          <Database size={12} />
          <span>{dbTypeName}</span>
        </div>

        <select
          value={displayCurrency}
          onChange={(e) => onSelectCurrency(e.target.value as CurrencyCode)}
          className="select-input curr-select-header"
        >
          {CURRENCY_LIST.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.code} ({c.symbol})
            </option>
          ))}
        </select>
      </div>
    </header>
  );
};
