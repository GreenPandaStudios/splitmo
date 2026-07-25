import React from 'react';
import type { Member, SplitType, CurrencyCode } from '../../types';
import type { SplitPlan } from './useSplitPlan';
import { formatCurrency } from '../../services';

interface SplitSelectorProps {
  plan: SplitPlan;
  members: Member[];
  currency: CurrencyCode;
  total: number;
}

const MODE_LABELS: Record<SplitType, string> = {
  equal: 'Split Equally',
  exact: 'Exact Amounts',
};

export const SplitSelector: React.FC<SplitSelectorProps> = ({ plan, members, currency, total }) => {
  const isExact = plan.splitType === 'exact';
  const shortfall = plan.remainder > 0;

  return (
    <div className="split-selector-box">
      <label className="input-label">How to Split</label>

      <div className="split-type-buttons">
        {(['equal', 'exact'] as SplitType[]).map((type) => (
          <button
            key={type}
            type="button"
            className={`split-type-btn ${plan.splitType === type ? 'active' : ''}`}
            onClick={() => plan.chooseSplitType(type)}
          >
            {MODE_LABELS[type]}
          </button>
        ))}
      </div>

      <div className="split-members-list">
        {members.map((member) => {
          const included = plan.isParticipant(member.id);
          return (
            <div key={member.id} className="split-member-row">
              <label className="member-label">
                <input
                  type="checkbox"
                  checked={included}
                  onChange={() => plan.toggleParticipant(member.id)}
                />
                <span>{member.name}</span>
              </label>

              {!included ? (
                <span className="equal-share-display excluded">Excluded</span>
              ) : isExact ? (
                <div className="input-with-symbol">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={plan.amountFor(member.id) || ''}
                    onChange={(e) => plan.setAmount(member.id, parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="split-num-input"
                  />
                  <span className="input-curr-suffix">{currency}</span>
                </div>
              ) : (
                <span className="equal-share-display">
                  {formatCurrency(plan.amountFor(member.id), currency)}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {plan.participantCount === 0 && (
        <p className="split-summary invalid">Pick at least one person to share this.</p>
      )}

      {isExact && plan.participantCount > 0 && (
        <div className="split-summary">
          <span className={plan.remainder === 0 ? 'balanced' : 'invalid'}>
            Assigned {formatCurrency(plan.assigned, currency)} of {formatCurrency(total, currency)}
            {plan.remainder !== 0 && (
              <> · {formatCurrency(Math.abs(plan.remainder), currency)} {shortfall ? 'left' : 'over'}</>
            )}
          </span>
          {plan.remainder !== 0 && (
            <button type="button" className="btn-inline-link" onClick={plan.distributeRest}>
              {shortfall ? 'Split rest' : 'Even out'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
