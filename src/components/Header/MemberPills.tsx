import React from 'react';
import type { Member } from '../../types';
import { Avatar } from '../common';

interface MemberPillsProps {
  members: Member[];
  currentMemberId?: string;
  onSelectCurrentMember: (memberId: string) => void;
}

/** Horizontal traveler strip; tapping a pill sets whose balance the ledger reports. */
export const MemberPills: React.FC<MemberPillsProps> = ({
  members,
  currentMemberId,
  onSelectCurrentMember,
}) => {
  return (
    <div className="member-pills-row">
      {members.map((m) => {
        const isSelected = m.id === currentMemberId;
        return (
          <button
            key={m.id}
            className={`member-pill ${isSelected ? 'selected' : ''}`}
            onClick={() => onSelectCurrentMember(m.id)}
            title={`View the ledger as ${m.name}`}
          >
            <Avatar name={m.name} avatarUrl={m.avatarUrl} size={26} />
            <span>{m.name.split(' ')[0]}</span>
          </button>
        );
      })}
    </div>
  );
};
