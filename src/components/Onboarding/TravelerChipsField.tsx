import React, { useState } from 'react';

interface TravelerChipsFieldProps {
  members: string[];
  onChange: (members: string[]) => void;
}

/** Comma-separated or one-at-a-time traveler entry, rendered as removable chips. */
export const TravelerChipsField: React.FC<TravelerChipsFieldProps> = ({ members, onChange }) => {
  const [input, setInput] = useState('');

  const addNames = () => {
    const parsed = input.split(',').map((s) => s.trim()).filter((s) => s && !members.includes(s));
    if (parsed.length === 0) return;
    onChange([...members, ...parsed]);
    setInput('');
  };

  return (
    <div className="onboarding-field">
      <label>Travelers ({members.length})</label>
      <div className="member-chips-list">
        {members.map((m, i) => (
          <span key={`${m}-${i}`} className="member-chip">
            {m}
            <button type="button" onClick={() => onChange(members.filter((_, idx) => idx !== i))}>×</button>
          </span>
        ))}
      </div>
      <div className="form-row" style={{ marginTop: '4px' }}>
        <input
          type="text"
          placeholder="Add a name"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addNames(); } }}
          className="text-input"
        />
        <button type="button" className="btn-secondary" onClick={addNames}>Add</button>
      </div>
    </div>
  );
};
