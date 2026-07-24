import React from 'react';
import type { DebtSettlement, CurrencyCode } from '../../types';
import { formatCurrency } from '../../services';
import { ArrowRight, Check, Send } from 'lucide-react';

interface SettlementListProps {
  settlements: DebtSettlement[];
  displayCurrency: CurrencyCode;
  onRecordSettlement?: (settlement: DebtSettlement) => void;
}

export const SettlementList: React.FC<SettlementListProps> = ({
  settlements,
  displayCurrency,
  onRecordSettlement,
}) => {
  return (
    <div className="section-block glass-card">
      <div className="section-header-flex">
        <h2 className="section-title">Suggested Debt Simplification</h2>
        <span className="badge-pill aurora-border">Minimized Transfers</span>
      </div>

      {settlements.length === 0 ? (
        <div className="empty-state-box">
          <Check size={32} className="icon-green" />
          <p className="empty-title">Everyone is settled up!</p>
          <p className="empty-subtext">No pending balances or money transfers required.</p>
        </div>
      ) : (
        <div className="settlement-list">
          {settlements.map((s, idx) => {
            const amountPrimary =
              displayCurrency === 'USD' ? formatCurrency(s.amountUSD, 'USD') : formatCurrency(s.amountISK, 'ISK');
            const amountSecondary =
              displayCurrency === 'USD' ? formatCurrency(s.amountISK, 'ISK') : formatCurrency(s.amountUSD, 'USD');

            return (
              <div key={idx} className="settlement-card">
                <div className="settlement-parties">
                  <span className="party-name debtor-name">{s.fromMemberName}</span>
                  <div className="transfer-arrow-wrapper">
                    <ArrowRight size={16} />
                  </div>
                  <span className="party-name creditor-name">{s.toMemberName}</span>
                </div>

                <div className="settlement-amount-box">
                  <span className="settlement-val">{amountPrimary}</span>
                  <span className="settlement-subval">({amountSecondary})</span>
                </div>

                {onRecordSettlement && (
                  <button
                    className="btn-secondary-small"
                    onClick={() => onRecordSettlement(s)}
                    title="Record this payment as an expense"
                  >
                    <Send size={13} />
                    <span>Settle Up</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
