import React from 'react';
import type { CurrencyCode } from '../../types';
import { formatCurrency } from '../../services';
import { ArrowUpRight, ArrowDownLeft, CheckCircle2 } from 'lucide-react';

interface NetBalanceBannerProps {
  netBalance: number;
  displayCurrency: CurrencyCode;
  tripName: string;
  onOpenTripManager: () => void;
}

export const NetBalanceBanner: React.FC<NetBalanceBannerProps> = ({
  netBalance,
  displayCurrency,
  tripName,
  onOpenTripManager,
}) => {
  const isOwed = netBalance > 0.5;
  const owes = netBalance < -0.5;
  const absFormatted = formatCurrency(Math.abs(netBalance), displayCurrency);

  return (
    <div className="net-balance-banner glass-card" onClick={onOpenTripManager} style={{ cursor: 'pointer' }}>
      <div className="banner-top-row">
        <div className="banner-group-title">
          <span className="group-badge">Active Ledger</span>
          <h2>{tripName}</h2>
        </div>
        <div className="status-indicator-chip">
          {isOwed && <ArrowUpRight size={14} className="icon-green" />}
          {owes && <ArrowDownLeft size={14} className="icon-red" />}
          {!isOwed && !owes && <CheckCircle2 size={14} className="icon-muted" />}
          <span className={isOwed ? 'text-green' : owes ? 'text-red' : ''}>
            {isOwed ? 'Owed' : owes ? 'Owe' : 'Settled'}
          </span>
        </div>
      </div>

      <div className="banner-main-amount">
        <span className="banner-sublabel">
          {isOwed ? 'Overall you are owed' : owes ? 'Overall you owe' : 'You are completely settled up'}
        </span>
        <div className={`banner-figure font-mono ${isOwed ? 'positive' : owes ? 'negative' : ''}`}>
          {isOwed ? `+${absFormatted}` : owes ? `-${absFormatted}` : '$0.00'}
        </div>
      </div>
    </div>
  );
};
