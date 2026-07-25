import React from 'react';
import type { DebtSettlement, MemberBalance, CurrencyCode } from '../../types';
import { SettleUpList } from './SettleUpList';
import { BalanceBars } from './BalanceBars';

interface BalancesViewProps {
  settlements: DebtSettlement[];
  balances: MemberBalance[];
  displayCurrency: CurrencyCode;
  onRecordSettlement: (settlement: DebtSettlement) => void;
}

export const BalancesView: React.FC<BalancesViewProps> = ({
  settlements,
  balances,
  displayCurrency,
  onRecordSettlement,
}) => (
  <div className="tab-panel">
    <SettleUpList
      settlements={settlements}
      displayCurrency={displayCurrency}
      onRecordSettlement={onRecordSettlement}
    />
    <BalanceBars balances={balances} displayCurrency={displayCurrency} />
  </div>
);
