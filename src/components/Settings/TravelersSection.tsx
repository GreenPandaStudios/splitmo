import React, { useState } from 'react';
import type { Member } from '../../types';
import { Avatar } from '../common';

interface TravelersSectionProps {
  members: Member[];
  onAddMember: (name: string) => void;
}

export const TravelersSection: React.FC<TravelersSectionProps> = ({ members, onAddMember }) => {
  const [newMemberName, setNewMemberName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newMemberName.trim();
    if (!name) return;
    onAddMember(name);
    setNewMemberName('');
  };

  return (
    <section className="section-block">
      <h2 className="section-title">Travelers</h2>
      <div className="section-body">
        <div className="traveler-rows">
          {members.map((m) => (
            <div key={m.id} className="traveler-row">
              <Avatar name={m.name} avatarUrl={m.avatarUrl} size={32} />
              <span className="traveler-name">{m.name}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="form-row">
          <input
            type="text"
            placeholder="Add a traveler"
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            className="text-input"
          />
          <button type="submit" className="btn-secondary">Add</button>
        </form>
      </div>
    </section>
  );
};
