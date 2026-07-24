import React, { useState } from 'react';
import type { TripGroup, CurrencyCode } from '../types';
import { CURRENCY_LIST, parseSplitwiseCSVToTrip } from '../services';
import { Compass, UserPlus, Sparkles, Upload } from 'lucide-react';

interface OnboardingScreenProps {
  onCreateTrip: (name: string, description: string, homeCurrency: CurrencyCode, initialMembers: string[]) => void;
  onImportTrip?: (importedTrip: TripGroup) => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onCreateTrip,
  onImportTrip,
}) => {
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

  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onImportTrip) {
      const file = e.target.files[0];
      const defaultName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          const res = parseSplitwiseCSVToTrip(text, defaultName);
          if (res.trip.expenses.length > 0 || res.trip.members.length > 0) {
            onImportTrip(res.trip);
          }
        }
      };
      reader.readAsText(file);
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
        <p className="onboarding-sub">Create a new trip ledger or import a Splitwise CSV.</p>
      </div>

      {onImportTrip && (
        <label className="csv-dropzone" style={{ marginBottom: '16px' }}>
          <Upload size={22} className="icon-blue" />
          <span><strong>Import Splitwise CSV Export</strong></span>
          <span style={{ fontSize: '11px', color: 'var(--text-sub)' }}>Creates your trip automatically with all members & expenses</span>
          <input type="file" accept=".csv" onChange={handleCsvFileUpload} className="file-input-hidden" />
        </label>
      )}

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
