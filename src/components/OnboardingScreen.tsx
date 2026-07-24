import React, { useState } from 'react';
import type { CurrencyCode } from '../types';
import { CURRENCY_LIST } from '../services';
import { Compass, UserPlus, Sparkles } from 'lucide-react';

interface OnboardingScreenProps {
  onCreateTrip: (name: string, description: string, homeCurrency: CurrencyCode, initialMembers: string[]) => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onCreateTrip }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [homeCurrency, setHomeCurrency] = useState<CurrencyCode>('USD');
  const [memberInput, setMemberInput] = useState('');
  const [members, setMembers] = useState<string[]>(['Alice', 'Bob', 'Charlie']);

  const handleAddMember = () => {
    if (memberInput.trim()) {
      const parsed = memberInput.split(',').map((s) => s.trim()).filter((s) => s && !members.includes(s));
      if (parsed.length > 0) {
        setMembers([...members, ...parsed]);
        setMemberInput('');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreateTrip(name.trim(), description.trim() || 'Trip expense ledger', homeCurrency, members);
    }
  };

  return (
    <div className="onboarding-container glass-card slide-up">
      <div className="onboarding-header">
        <div className="brand-icon-large">
          <Compass size={32} />
        </div>
        <h1 className="onboarding-title">Welcome to Splitmo</h1>
        <p className="onboarding-sub">Create your first trip ledger to split bills & scan receipts.</p>
      </div>

      <form onSubmit={handleSubmit} className="modal-form">
        <div className="form-group">
          <label className="input-label">Trip Title</label>
          <input
            type="text"
            required
            placeholder="e.g. Iceland Ring Road 🇮🇸, Tokyo 🍜"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-input"
          />
        </div>

        <div className="form-row">
          <div className="form-group flex-2">
            <label className="input-label">Description</label>
            <input
              type="text"
              placeholder="e.g. Roadtrip cabin & fuel splits"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-input"
            />
          </div>

          <div className="form-group flex-1">
            <label className="input-label">Currency</label>
            <select
              value={homeCurrency}
              onChange={(e) => setHomeCurrency(e.target.value as CurrencyCode)}
              className="select-input"
            >
              {CURRENCY_LIST.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="input-label">Trip Members ({members.length})</label>
          <div className="member-chips-list">
            {members.map((m, i) => (
              <span key={i} className="member-chip">
                {m}
                <button type="button" onClick={() => setMembers(members.filter((_, idx) => idx !== i))}>×</button>
              </span>
            ))}
          </div>
          <div className="form-row">
            <input
              type="text"
              placeholder="Names (e.g. 'Dana, Eric')"
              value={memberInput}
              onChange={(e) => setMemberInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddMember(); } }}
              className="text-input"
            />
            <button type="button" className="btn-secondary" onClick={handleAddMember}>
              <UserPlus size={14} /> Add
            </button>
          </div>
        </div>

        <button type="submit" className="btn-primary full-width large-btn">
          <Sparkles size={18} /> Start Trip Ledger
        </button>
      </form>
    </div>
  );
};
