import React from 'react';
import type { CurrencyCode } from '../types';
import { Compass, RefreshCw, Database, DollarSign, Layers } from 'lucide-react';

interface HeaderProps {
  tripName: string;
  displayCurrency: CurrencyCode;
  onToggleCurrency: () => void;
  iskRate: number;
  onRefreshRate: () => void;
  isDbActive: boolean;
  dbTypeName?: string;
  onOpenTripManager: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  tripName,
  displayCurrency,
  onToggleCurrency,
  iskRate,
  onRefreshRate,
  isDbActive,
  dbTypeName = 'Local DB',
  onOpenTripManager,
}) => {
  return (
    <header className="app-header glass-card">
      <div className="header-brand">
        <div className="brand-icon-wrapper" onClick={onOpenTripManager} style={{ cursor: 'pointer' }} title="Manage Trips">
          <Compass className="brand-icon spinning-compass" size={26} />
        </div>
        <div>
          <h1 className="brand-title">Splitmo 🇮🇸</h1>
          <p className="brand-subtitle">{tripName}</p>
        </div>
      </div>

      <div className="header-actions">
        <button className="btn-secondary" onClick={onOpenTripManager} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Layers size={14} />
          <span>Trips</span>
        </button>

        <div className="status-badge live-rate-badge" title="Current ISK to 1 USD exchange rate">
          <span>1 USD = {Math.round(iskRate)} ISK</span>
          <button className="icon-btn-small" onClick={onRefreshRate} title="Refresh Exchange Rate">
            <RefreshCw size={12} />
          </button>
        </div>

        <div className={`status-badge fb-badge ${isDbActive ? 'connected' : 'local'}`}>
          <Database size={13} />
          <span>{dbTypeName}</span>
        </div>

        <button className="currency-toggle-btn" onClick={onToggleCurrency}>
          <DollarSign size={16} />
          <span>View in {displayCurrency === 'USD' ? 'ISK (kr.)' : 'USD ($)'}</span>
        </button>
      </div>
    </header>
  );
};
