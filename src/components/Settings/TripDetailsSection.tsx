import React, { useState } from 'react';

interface TripDetailsSectionProps {
  name: string;
  description?: string;
  onSave: (name: string, description: string) => void;
}

/** Renames the active ledger. Mount with key={trip.id} so switching trips reseeds the fields. */
export const TripDetailsSection: React.FC<TripDetailsSectionProps> = ({ name, description, onSave }) => {
  const [draftName, setDraftName] = useState(name);
  const [draftDescription, setDraftDescription] = useState(description || '');

  const trimmedName = draftName.trim();
  const isDirty = trimmedName !== name || draftDescription.trim() !== (description || '');
  const canSave = trimmedName.length > 0 && isDirty;

  return (
    <section className="section-block">
      <h2 className="section-title">Ledger Details</h2>
      <p className="section-sub">Rename this trip or update its description</p>

      <div className="section-body">
        <div className="form-group">
          <label className="input-label" htmlFor="trip-name">Trip title</label>
          <input
            id="trip-name"
            type="text"
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            className="text-input"
          />
        </div>

        <div className="form-group">
          <label className="input-label" htmlFor="trip-desc">Description</label>
          <input
            id="trip-desc"
            type="text"
            placeholder="Roadtrip, cabin &amp; fuel splits"
            value={draftDescription}
            onChange={(e) => setDraftDescription(e.target.value)}
            className="text-input"
          />
        </div>

        <button
          className="btn-primary"
          disabled={!canSave}
          onClick={() => onSave(trimmedName, draftDescription.trim())}
        >
          Save details
        </button>
      </div>
    </section>
  );
};
