import React from 'react';
import type { CurrencyCode, Member } from '../../types';
import { CURRENCY_LIST } from '../../services';
import { MemberPills } from './MemberPills';

interface HeaderProps {
  tripName: string;
  displayCurrency: CurrencyCode;
  onSelectCurrency: (code: CurrencyCode) => void;
  onOpenTripManager: () => void;
  members: Member[];
  currentMemberId?: string;
  onSelectCurrentMember: (memberId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  tripName,
  displayCurrency,
  onSelectCurrency,
  onOpenTripManager,
  members,
  currentMemberId,
  onSelectCurrentMember,
}) => {
  return (
    <header className="app-header">
      <div className="header-top-bar">
        <div>
          <div className="eyebrow">Trip Ledger</div>
          <h1 className="header-trip-name">{tripName}</h1>
        </div>

        <div className="header-actions">
          <select
            value={displayCurrency}
            onChange={(e) => onSelectCurrency(e.target.value as CurrencyCode)}
            className="curr-select-header"
            title="Display currency"
          >
            {CURRENCY_LIST.map((c) => (
              <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
            ))}
          </select>

          <button className="btn-outline-pill" onClick={onOpenTripManager}>
            + New Trip
          </button>
        </div>
      </div>

      <MemberPills
        members={members}
        currentMemberId={currentMemberId}
        onSelectCurrentMember={onSelectCurrentMember}
      />
    </header>
  );
};
