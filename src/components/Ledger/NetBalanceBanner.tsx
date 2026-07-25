import React from 'react';
import type { CurrencyCode } from '../../types';
import { formatCurrency } from '../../services';

interface NetBalanceBannerProps {
  netBalance: number;
  displayCurrency: CurrencyCode;
  currentMemberName?: string;
}

/** Phrases the caption in the first person when we don't know the traveler's name. */
function caption(name: string, isOwed: boolean, owes: boolean): string {
  if (!isOwed && !owes) return 'Settled up';
  const isSelf = name === 'You';
  if (isOwed) return isSelf ? 'You are owed' : `${name} is owed`;
  return isSelf ? 'You owe' : `${name} owes`;
}

export const NetBalanceBanner: React.FC<NetBalanceBannerProps> = ({
  netBalance,
  displayCurrency,
  currentMemberName = 'You',
}) => {
  const isOwed = netBalance > 0.5;
  const owes = netBalance < -0.5;
  const firstName = currentMemberName.split(' ')[0];
  const absFormatted = formatCurrency(Math.abs(netBalance), displayCurrency);

  return (
    <div className="net-balance-block">
      <div className="net-balance-caption">{caption(firstName, isOwed, owes)}</div>
      <div className={`net-balance-figure ${isOwed ? 'positive' : owes ? 'negative' : ''}`}>
        {isOwed ? `+${absFormatted}` : owes ? `-${absFormatted}` : formatCurrency(0, displayCurrency)}
      </div>
    </div>
  );
};
