import React from 'react';
import type { MemberBalance, CurrencyCode } from '../../types';
import { formatCurrency, convertCurrency } from '../../services';
import { ArrowUpRight, ArrowDownLeft, CheckCircle2 } from 'lucide-react';

interface MemberBalancesProps {
  balances: MemberBalance[];
  displayCurrency: CurrencyCode;
}

export const MemberBalances: React.FC<MemberBalancesProps> = ({ balances, displayCurrency }) => {
  return (
    <div className="section-block glass-card">
      <h2 className="section-title">Member Balances</h2>
      <div className="balances-grid">
        {balances.map((b) => {
          const netConverted = convertCurrency(b.netBalanceISK, 'ISK', displayCurrency);
          const isCreditor = netConverted > 0.5;
          const isDebtor = netConverted < -0.5;

          const netStr = formatCurrency(Math.abs(netConverted), displayCurrency);
          const paidStr = formatCurrency(convertCurrency(b.totalPaidISK, 'ISK', displayCurrency), displayCurrency);
          const shareStr = formatCurrency(convertCurrency(b.totalShareISK, 'ISK', displayCurrency), displayCurrency);

          return (
            <div
              key={b.memberId}
              className={`member-balance-card ${isCreditor ? 'creditor' : isDebtor ? 'debtor' : 'settled'}`}
            >
              <div className="member-card-header">
                <span className="member-name">{b.memberName}</span>
                <span className="balance-badge">
                  {isCreditor && <ArrowUpRight size={14} className="icon-green" />}
                  {isDebtor && <ArrowDownLeft size={14} className="icon-red" />}
                  {!isCreditor && !isDebtor && <CheckCircle2 size={14} className="icon-muted" />}
                  <span>{isCreditor ? 'Is owed' : isDebtor ? 'Owes' : 'Settled up'}</span>
                </span>
              </div>

              <div className="balance-amount-display">
                <span className={`net-amount ${isCreditor ? 'positive' : isDebtor ? 'negative' : ''}`}>
                  {isCreditor ? '+' : isDebtor ? '-' : ''}{netStr}
                </span>
              </div>

              <div className="member-card-details">
                <div><span className="detail-label">Paid:</span> <strong>{paidStr}</strong></div>
                <div><span className="detail-label">Share:</span> <strong>{shareStr}</strong></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
