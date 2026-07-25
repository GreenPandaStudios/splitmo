import React from 'react';
import type { MemberBalance, CurrencyCode } from '../../types';
import { formatCurrency } from '../../services';

interface BalanceBarsProps {
  balances: MemberBalance[];
  displayCurrency: CurrencyCode;
}

/** Bars are scaled against the largest absolute position, so the widest bar is always full. */
export const BalanceBars: React.FC<BalanceBarsProps> = ({ balances, displayCurrency }) => {
  // calculateMemberBalances already reports in the display currency, despite the field name.
  const converted = balances.map((b) => ({
    memberId: b.memberId,
    memberName: b.memberName,
    net: b.netBalanceISK,
  }));
  const maxAbs = Math.max(1, ...converted.map((b) => Math.abs(b.net)));

  return (
    <section className="section-block">
      <h2 className="section-title">Where Everyone Stands</h2>
      <div className="section-body">
        <div className="balances-grid">
          {converted.map((b) => {
            const isCreditor = b.net > 0.5;
            const isDebtor = b.net < -0.5;
            const color = isCreditor ? 'var(--credit)' : isDebtor ? 'var(--debit)' : 'var(--ink-faint)';
            const netStr = formatCurrency(Math.abs(b.net), displayCurrency);

            return (
              <div key={b.memberId} className="balance-bar-row">
                <div className="balance-bar-head">
                  <span className="balance-bar-name">{b.memberName}</span>
                  <span className="balance-bar-value" style={{ color }}>
                    {isCreditor ? `+${netStr}` : isDebtor ? `-${netStr}` : formatCurrency(0, displayCurrency)}
                  </span>
                </div>
                <div className="balance-bar-track">
                  <div
                    className="balance-bar-fill"
                    style={{ width: `${Math.round((Math.abs(b.net) / maxAbs) * 100)}%`, background: color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
