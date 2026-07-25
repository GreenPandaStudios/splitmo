import { useMemo } from 'react';
import type { TripGroup, CurrencyCode } from '../types';
import { calculateMemberBalances, simplifyDebts } from '../services';

/** Derives every balance figure the UI shows, all expressed in the display currency. */
export function useTripBalances(trip: TripGroup, displayCurrency: CurrencyCode, currentMemberId?: string) {
  return useMemo(() => {
    const rates = trip.exchangeRates.rates;
    const memberBalances = calculateMemberBalances(trip.members, trip.expenses, rates, displayCurrency);

    return {
      rates,
      memberBalances,
      settlements: simplifyDebts(memberBalances, rates),
      myNetBalance: memberBalances.find((b) => b.memberId === currentMemberId)?.netBalanceISK || 0,
      myMemberName: trip.members.find((m) => m.id === currentMemberId)?.name || 'You',
    };
  }, [trip, displayCurrency, currentMemberId]);
}
