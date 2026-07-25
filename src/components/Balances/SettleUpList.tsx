import React, { useState } from 'react';
import type { DebtSettlement, CurrencyCode } from '../../types';
import { formatCurrency } from '../../services';
import { ArrowRight, Share2, CheckCheck } from 'lucide-react';

interface SettleUpListProps {
  settlements: DebtSettlement[];
  displayCurrency: CurrencyCode;
  onRecordSettlement: (settlement: DebtSettlement) => void;
}

export const SettleUpList: React.FC<SettleUpListProps> = ({
  settlements,
  displayCurrency,
  onRecordSettlement,
}) => {
  const [copied, setCopied] = useState(false);

  const handleShareSummary = () => {
    if (settlements.length === 0) return;
    const lines = settlements.map(
      (s) => `• ${s.fromMemberName} pays ${s.toMemberName}: ${formatCurrency(s.amountISK, displayCurrency)}`
    );
    navigator.clipboard.writeText(`Splitmo settle-up:\n${lines.join('\n')}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="section-block">
      <div className="section-header-flex">
        <div>
          <h2 className="section-title">Settle Up</h2>
          <p className="section-sub">Minimum transfers to zero everyone out</p>
        </div>
        {settlements.length > 0 && (
          <button className="btn-secondary-small" onClick={handleShareSummary}>
            {copied ? <CheckCheck size={13} /> : <Share2 size={13} />}
            <span>{copied ? 'Copied' : 'Share'}</span>
          </button>
        )}
      </div>

      <div className="section-body">
        {settlements.length === 0 ? (
          <div className="all-settled-box">All debts settled ✓</div>
        ) : (
          <div className="settlement-list">
            {settlements.map((s, idx) => {
              // amountISK is already expressed in the display currency by simplifyDebts.
              const amountStr = formatCurrency(s.amountISK, displayCurrency);
              return (
                <div key={`${s.fromMemberId}-${s.toMemberId}-${idx}`} className="settlement-card">
                  <div className="settlement-parties">
                    <span className="party-name debtor-name">{s.fromMemberName.split(' ')[0]}</span>
                    <ArrowRight size={13} className="settlement-arrow" />
                    <span className="party-name creditor-name">{s.toMemberName.split(' ')[0]}</span>
                  </div>
                  <div className="settlement-right">
                    <span className="settlement-val">{amountStr}</span>
                    <button className="btn-secondary-small" onClick={() => onRecordSettlement(s)}>
                      Settle
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
