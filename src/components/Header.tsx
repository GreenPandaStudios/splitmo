import React from 'react';
import type { CurrencyCode, Member } from '../types';
import { CURRENCY_LIST } from '../services';
import { Compass, RefreshCw, Layers, UserCheck } from 'lucide-react';

interface HeaderProps {
  tripName: string;
  displayCurrency: CurrencyCode;
  onSelectCurrency: (code: CurrencyCode) => void;
  onRefreshRate: () => void;
  isDbActive: boolean;
  dbTypeName?: string;
  onOpenTripManager: () => void;
  netBalance?: number;
  members: Member[];
  currentMemberId?: string;
  onSelectCurrentMember: (memberId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  tripName,
  displayCurrency,
  onSelectCurrency,
  onRefreshRate,
  onOpenTripManager,
  netBalance = 0,
  members,
  currentMemberId,
  onSelectCurrentMember,
}) => {
  const currentMember = members.find((m) => m.id === currentMemberId) || members[0];
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
        <div className="banner-left-identity">
          <UserCheck size={14} className="icon-blue" />
          <span className="banner-user-label">I am:</span>
          <select
            value={currentMemberId || members[0]?.id}
            onChange={(e) => onSelectCurrentMember(e.target.value)}
            className="select-input identity-select"
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        <span className={`banner-right ${isOwed ? 'positive' : owes ? 'negative' : ''}`}>
          {isOwed
            ? `${currentMember?.name || 'You'} are owed $${Math.abs(Math.round(netBalance))}`
            : owes
            ? `${currentMember?.name || 'You'} owe $${Math.abs(Math.round(netBalance))}`
            : 'Settled up'}
        </span>
      </div>
    </header>
  );
};
