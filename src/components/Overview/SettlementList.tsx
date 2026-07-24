import React, { useState } from 'react';
import type { DebtSettlement, CurrencyCode } from '../../types';
import { formatCurrency, convertCurrency } from '../../services';
import { ArrowRight, Check, Send, Share2, CheckCheck } from 'lucide-react';

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
  const [copied, setCopied] = useState(false);

  const handleShareSummary = () => {
    if (settlements.length === 0) return;
    const summaryLines = settlements.map(
      (s) => `• ${s.fromMemberName} pays ${s.toMemberName}: ${formatCurrency(convertCurrency(s.amountISK, 'ISK', displayCurrency), displayCurrency)}`
    );
    const text = `✈️ Splitmo Settlement Summary:\n${summaryLines.join('\n')}\n\nTracked via Splitmo App`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="section-block glass-card">
      <div className="section-header-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="section-title">Suggested Debt Transfers</h2>
        {settlements.length > 0 && (
          <button className="btn-secondary-small" onClick={handleShareSummary} title="Copy formatted share summary to clipboard">
            {copied ? <CheckCheck size={13} className="icon-green" /> : <Share2 size={13} />}
            <span>{copied ? 'Copied!' : 'Share Text'}</span>
          </button>
        )}
      </div>

      {settlements.length === 0 ? (
        <div className="empty-state-box">
          <Check size={32} className="icon-green" />
          <p className="empty-title">Everyone is settled up!</p>
          <p className="empty-subtext">No pending transfers needed.</p>
        </div>
      ) : (
        <div className="settlement-list">
          {settlements.map((s, idx) => {
            const amountConverted = convertCurrency(s.amountISK, 'ISK', displayCurrency);
            const amountStr = formatCurrency(amountConverted, displayCurrency);

            return (
              <div key={idx} className="settlement-card">
                <div className="settlement-parties">
                  <span className="party-name debtor-name">{s.fromMemberName}</span>
                  <div className="transfer-arrow-wrapper"><ArrowRight size={15} /></div>
                  <span className="party-name creditor-name">{s.toMemberName}</span>
                </div>

                <div className="settlement-amount-box">
                  <span className="settlement-val">{amountStr}</span>
                </div>

                {onRecordSettlement && (
                  <button className="btn-secondary-small" onClick={() => onRecordSettlement(s)} title="Record settlement">
                    <Send size={13} /> Settle
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
