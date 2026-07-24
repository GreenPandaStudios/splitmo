import React, { useState } from 'react';
import type { DebtSettlement, MemberBalance, CurrencyCode } from '../../types';
import { formatCurrency, convertCurrency } from '../../services';
import { ArrowRight, Send, Share2, Check, CheckCheck } from 'lucide-react';

interface DebtGraphMatrixProps {
  settlements: DebtSettlement[];
  balances: MemberBalance[];
  displayCurrency: CurrencyCode;
  onRecordSettlement: (settlement: DebtSettlement) => void;
}

export const DebtGraphMatrix: React.FC<DebtGraphMatrixProps> = ({
  settlements,
  balances,
  displayCurrency,
  onRecordSettlement,
}) => {
  const [copied, setCopied] = useState(false);

  const handleShareSummary = () => {
    if (settlements.length === 0) return;
    const summaryLines = settlements.map(
      (s) => `• ${s.fromMemberName} pays ${s.toMemberName}: ${formatCurrency(convertCurrency(s.amountISK, 'ISK', displayCurrency), displayCurrency)}`
    );
    const text = `✈️ Splitmo Settlement Matrix:\n${summaryLines.join('\n')}\n\nTracked via Splitmo App`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="view-stack">
      <div className="glass-card section-block">
        <div className="section-header-flex">
          <div>
            <h2 className="section-title">Debt Simplification Graph</h2>
            <p className="section-sub">Optimized minimum transfers solver</p>
          </div>
          {settlements.length > 0 && (
            <button className="btn-secondary-small" onClick={handleShareSummary}>
              {copied ? <CheckCheck size={13} className="icon-green" /> : <Share2 size={13} />}
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>
          )}
        </div>

        {settlements.length === 0 ? (
          <div className="empty-state-box">
            <Check size={32} className="icon-green" />
            <p className="empty-title">All debts settled!</p>
          </div>
        ) : (
          <div className="settlement-list">
            {settlements.map((s, idx) => {
              const amountStr = formatCurrency(convertCurrency(s.amountISK, 'ISK', displayCurrency), displayCurrency);
              return (
                <div key={idx} className="settlement-card">
                  <div className="settlement-parties">
                    <span className="party-name debtor-name">{s.fromMemberName}</span>
                    <ArrowRight size={14} className="icon-muted" />
                    <span className="party-name creditor-name">{s.toMemberName}</span>
                  </div>
                  <span className="settlement-val font-mono">{amountStr}</span>
                  <button className="btn-secondary-small" onClick={() => onRecordSettlement(s)}>
                    <Send size={12} /> Settle
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="glass-card section-block">
        <h2 className="section-title">Person-by-Person Position</h2>
        <div className="balances-grid">
          {balances.map((b) => {
            const netConverted = convertCurrency(b.netBalanceISK, 'ISK', displayCurrency);
            const isCreditor = netConverted > 0.5;
            const isDebtor = netConverted < -0.5;
            const netStr = formatCurrency(Math.abs(netConverted), displayCurrency);

            return (
              <div key={b.memberId} className={`member-balance-card ${isCreditor ? 'creditor' : isDebtor ? 'debtor' : ''}`}>
                <span className="member-name">{b.memberName}</span>
                <span className={`net-amount font-mono ${isCreditor ? 'positive' : isDebtor ? 'negative' : ''}`}>
                  {isCreditor ? `+${netStr}` : isDebtor ? `-${netStr}` : '$0.00'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
