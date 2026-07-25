import React, { useState } from 'react';
import type { TripGroup } from '../../types';

interface ImportConfirmProps {
  trip: TripGroup;
  onConfirm: (trip: TripGroup) => void;
  onCancel: () => void;
}

/** Second step of a CSV import: name the trip and say which traveler you are. */
export const ImportConfirm: React.FC<ImportConfirmProps> = ({ trip, onConfirm, onCancel }) => {
  const [name, setName] = useState(trip.name);
  const [myId, setMyId] = useState(trip.members[0]?.id || '');

  return (
    <div className="onboarding-container">
      <div className="onboarding-header">
        <div className="eyebrow">Imported Ledger</div>
        <h1 className="onboarding-title">Confirm trip</h1>
        <p className="onboarding-sub">
          {trip.expenses.length} expenses across {trip.members.length} travelers.
        </p>
      </div>

      <div className="onboarding-form">
        <div className="onboarding-field">
          <label htmlFor="import-trip-name">Trip title</label>
          <input
            id="import-trip-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="line-input display"
          />
        </div>

        <div className="onboarding-field">
          <label htmlFor="import-me">Which traveler are you?</label>
          <select id="import-me" value={myId} onChange={(e) => setMyId(e.target.value)} className="select-input">
            {trip.members.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="onboarding-spacer" />

      <div className="onboarding-actions">
        <button
          className="btn-primary large-btn"
          onClick={() => onConfirm({ ...trip, name: name.trim() || trip.name, currentMemberId: myId || trip.members[0]?.id })}
        >
          Open Trip Ledger →
        </button>
        <button className="btn-quiet" onClick={onCancel}>Cancel import</button>
      </div>
    </div>
  );
};
