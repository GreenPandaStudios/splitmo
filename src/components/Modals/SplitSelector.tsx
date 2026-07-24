import React from 'react';
import type { Member, SplitType, SplitShare, CurrencyCode } from '../../types';
import { formatCurrency } from '../../services';

interface SplitSelectorProps {
  splitType: SplitType;
  onSplitTypeChange: (type: SplitType) => void;
  members: Member[];
  splits: SplitShare[];
  onUpdateSplit: (memberId: string, amount: number) => void;
  totalAmount: number;
  currency: CurrencyCode;
}

export const SplitSelector: React.FC<SplitSelectorProps> = ({
  splitType,
  onSplitTypeChange,
  members,
  splits,
  onUpdateSplit,
  totalAmount,
  currency,
}) => {
  const getMemberSplitVal = (memberId: string) => splits.find((s) => s.memberId === memberId)?.amount || 0;
  const activeMembersCount = splits.filter((s) => s.amount > 0).length || members.length;
  const perMemberEqual = totalAmount > 0 ? Math.round((totalAmount / activeMembersCount) * 100) / 100 : 0;

  const handleToggleMemberEqual = (memberId: string) => {
    const currentVal = getMemberSplitVal(memberId);
    if (currentVal > 0) {
      onUpdateSplit(memberId, 0);
    } else {
      onUpdateSplit(memberId, 1);
    }
  };

  return (
    <div className="split-selector-box">
      <label className="input-label">How to Split</label>
      <div className="split-type-buttons">
        {(['equal', 'exact'] as SplitType[]).map((type) => (
          <button
            key={type}
            type="button"
            className={`split-type-btn ${splitType === type ? 'active' : ''}`}
            onClick={() => onSplitTypeChange(type)}
          >
            {type === 'equal' ? 'Split Equally ⚖️' : 'Exact Amounts 💵'}
          </button>
        ))}
      </div>

      <div className="split-members-list">
        {members.map((member) => {
          const val = getMemberSplitVal(member.id);
          const isIncluded = val > 0 || splitType === 'equal';
          return (
            <div key={member.id} className="split-member-row">
              <label className="member-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isIncluded}
                  onChange={() => handleToggleMemberEqual(member.id)}
                />
                <span>{member.name}</span>
              </label>

              {splitType === 'equal' ? (
                <span className="equal-share-display">
                  {isIncluded ? formatCurrency(perMemberEqual, currency) : 'Excluded'}
                </span>
              ) : (
                <div className="input-with-symbol">
                  <input
                    type="number" min="0" step="any"
                    value={val || ''}
                    onChange={(e) => onUpdateSplit(member.id, parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="split-num-input"
                  />
                  <span className="input-curr-suffix">{currency}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
