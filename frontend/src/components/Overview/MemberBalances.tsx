import React from 'react';
import type { MemberBalance, CurrencyCode } from '../../types';
import { formatCurrency } from '../../services';
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
          const isCreditor = b.netBalanceISK > 5;
          const isDebtor = b.netBalanceISK < -5;
          
          const netStrPrimary =
            displayCurrency === 'USD'
              ? formatCurrency(Math.abs(b.netBalanceUSD), 'USD')
              : formatCurrency(Math.abs(b.netBalanceISK), 'ISK');
          
          const netStrSecondary =
            displayCurrency === 'USD'
              ? formatCurrency(Math.abs(b.netBalanceISK), 'ISK')
              : formatCurrency(Math.abs(b.netBalanceUSD), 'USD');

          const paidStr =
            displayCurrency === 'USD' ? formatCurrency(b.totalPaidUSD, 'USD') : formatCurrency(b.totalPaidISK, 'ISK');
          const shareStr =
            displayCurrency === 'USD' ? formatCurrency(b.totalShareUSD, 'USD') : formatCurrency(b.totalShareISK, 'ISK');

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
                  <span>
                    {isCreditor ? 'Is owed' : isDebtor ? 'Owes' : 'Settled up'}
                  </span>
                </span>
              </div>

              <div className="balance-amount-display">
                <span className={`net-amount ${isCreditor ? 'positive' : isDebtor ? 'negative' : ''}`}>
                  {isCreditor ? '+' : isDebtor ? '-' : ''}{netStrPrimary}
                </span>
                <span className="net-secondary">≈ {netStrSecondary}</span>
              </div>

              <div className="member-card-details">
                <div>
                  <span className="detail-label">Paid:</span> <strong>{paidStr}</strong>
                </div>
                <div>
                  <span className="detail-label">Share:</span> <strong>{shareStr}</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
