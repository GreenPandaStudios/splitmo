import { useMemo, useState } from 'react';
import type { CurrencyCode, Member, SplitShare, SplitType } from '../../types';
import { splitEvenly, roundToCurrency, sumAmounts } from '../../services';

export interface SplitPlan {
  splitType: SplitType;
  chooseSplitType: (type: SplitType) => void;
  isParticipant: (memberId: string) => boolean;
  toggleParticipant: (memberId: string) => void;
  participantCount: number;
  /** What this member owes under the current mode; 0 when they are excluded. */
  amountFor: (memberId: string) => number;
  setAmount: (memberId: string, amount: number) => void;
  assigned: number;
  remainder: number;
  distributeRest: () => void;
  isValid: boolean;
  finalSplits: SplitShare[];
}

interface Options {
  members: Member[];
  total: number;
  currency: CurrencyCode;
  initialSplits?: SplitShare[];
  initialSplitType?: SplitType;
}

/** Participants come from stored splits with a real amount; a blank ledger includes everyone. */
function initialParticipants(members: Member[], splits?: SplitShare[]): string[] {
  const sharing = (splits || []).filter((s) => s.amount > 0).map((s) => s.memberId);
  return sharing.length > 0 ? sharing : members.map((m) => m.id);
}

/**
 * Owns who shares an expense and how much each owes. Participation is tracked separately from
 * amounts so that excluding someone is unambiguous and a genuine zero share stays representable.
 */
export function useSplitPlan({ members, total, currency, initialSplits, initialSplitType }: Options): SplitPlan {
  const [splitType, setSplitType] = useState<SplitType>(initialSplitType || 'equal');
  const [participants, setParticipants] = useState<string[]>(() => initialParticipants(members, initialSplits));
  const [exactAmounts, setExactAmounts] = useState<Record<string, number>>(() => {
    const seeded: Record<string, number> = {};
    (initialSplits || []).forEach((s) => { seeded[s.memberId] = s.amount; });
    return seeded;
  });

  const isParticipant = (memberId: string) => participants.includes(memberId);

  // Shares are assigned in member order so the extra minor units land predictably.
  const equalShares = useMemo(() => {
    const sharing = members.filter((m) => participants.includes(m.id));
    const shares = splitEvenly(total, currency, sharing.length);
    return Object.fromEntries(sharing.map((m, i) => [m.id, shares[i]])) as Record<string, number>;
  }, [members, participants, total, currency]);

  const amountFor = (memberId: string) => {
    if (!isParticipant(memberId)) return 0;
    return splitType === 'equal' ? equalShares[memberId] || 0 : exactAmounts[memberId] || 0;
  };

  const assigned = sumAmounts(participants.map(amountFor), currency);
  const remainder = roundToCurrency(total - assigned, currency);

  const chooseSplitType = (type: SplitType) => {
    // Entering exact mode from equal carries the even shares over, so it opens already reconciled.
    if (type === 'exact' && splitType === 'equal') setExactAmounts({ ...equalShares });
    setSplitType(type);
  };

  const toggleParticipant = (memberId: string) => {
    setParticipants((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
    setExactAmounts((prev) => ({ ...prev, [memberId]: 0 }));
  };

  const setAmount = (memberId: string, amount: number) => {
    setExactAmounts((prev) => ({ ...prev, [memberId]: isFinite(amount) ? amount : 0 }));
  };

  const distributeRest = () => {
    const sharing = members.filter((m) => participants.includes(m.id));
    if (sharing.length === 0) return;
    const deltas = splitEvenly(remainder, currency, sharing.length);
    setExactAmounts((prev) => {
      const next = { ...prev };
      sharing.forEach((m, i) => {
        next[m.id] = roundToCurrency((prev[m.id] || 0) + deltas[i], currency);
      });
      return next;
    });
  };

  const isValid =
    participants.length > 0 && total > 0 && (splitType === 'equal' || remainder === 0);

  const finalSplits = members.map((m) => ({ memberId: m.id, amount: amountFor(m.id) }));

  return {
    splitType, chooseSplitType,
    isParticipant, toggleParticipant, participantCount: participants.length,
    amountFor, setAmount,
    assigned, remainder, distributeRest,
    isValid, finalSplits,
  };
}
