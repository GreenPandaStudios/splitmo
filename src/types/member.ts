export interface Member {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
}

export type SplitType = 'equal' | 'exact';

export interface MemberBalance {
  memberId: string;
  memberName: string;
  totalPaidISK: number;
  totalPaidUSD: number;
  totalShareISK: number;
  totalShareUSD: number;
  netBalanceISK: number;
  netBalanceUSD: number;
}
