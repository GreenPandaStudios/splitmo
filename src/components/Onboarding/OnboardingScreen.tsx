import React, { useState } from 'react';
import type { TripGroup, CurrencyCode } from '../../types';
import { CURRENCY_LIST } from '../../services';
import { ImportConfirm } from './ImportConfirm';
import { TravelerChipsField } from './TravelerChipsField';
import { readTripFromCsv } from './readTripFromCsv';
import { Upload } from 'lucide-react';

interface OnboardingScreenProps {
  onCreateTrip: (name: string, description: string, homeCurrency: CurrencyCode, initialMembers: string[]) => void;
  onImportTrip?: (importedTrip: TripGroup) => void;
  /** Present only when there is an existing ledger to return to. */
  onCancel?: () => void;
  currentTripName?: string;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onCreateTrip,
  onImportTrip,
  onCancel,
  currentTripName,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [homeCurrency, setHomeCurrency] = useState<CurrencyCode>('USD');
  const [members, setMembers] = useState<string[]>(['Alice', 'Bob', 'Charlie']);
  const [pendingTrip, setPendingTrip] = useState<TripGroup | null>(null);

  const handleCsvFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const trip = await readTripFromCsv(file);
    if (trip) setPendingTrip(trip);
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    onCreateTrip(name.trim(), description.trim() || 'Trip expense ledger', homeCurrency, members);
  };

  if (pendingTrip && onImportTrip) {
    return (
      <ImportConfirm
        trip={pendingTrip}
        onConfirm={(trip) => { onImportTrip(trip); setPendingTrip(null); }}
        onCancel={() => setPendingTrip(null)}
      />
    );
  }

  return (
    <div className="onboarding-container">
      <div className="onboarding-header">
        <div className="eyebrow">Field Ledger</div>
        <h1 className="onboarding-title">Splitmo</h1>
        <p className="onboarding-sub">Start a new trip ledger, or come back to your current one.</p>
      </div>

      <div className="onboarding-form">
        <div className="onboarding-field">
          <label htmlFor="ob-title">Trip title</label>
          <input
            id="ob-title"
            type="text"
            placeholder="e.g. Iceland Ring Road"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="line-input display"
          />
        </div>

        <div className="onboarding-field">
          <label htmlFor="ob-desc">Description</label>
          <input
            id="ob-desc"
            type="text"
            placeholder="Roadtrip, cabin &amp; fuel splits"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="line-input"
          />
        </div>

        <div className="onboarding-field">
          <label htmlFor="ob-currency">Home currency</label>
          <select
            id="ob-currency"
            value={homeCurrency}
            onChange={(e) => setHomeCurrency(e.target.value as CurrencyCode)}
            className="select-input"
          >
            {CURRENCY_LIST.map((c) => (
              <option key={c.code} value={c.code}>{c.flag} {c.code} — {c.name}</option>
            ))}
          </select>
        </div>

        <TravelerChipsField members={members} onChange={setMembers} />
      </div>

      {onImportTrip && (
        <div className="onboarding-import-row">
          <label className="import-link">
            <Upload size={15} /> Import a Splitwise CSV instead
            <input type="file" accept=".csv" onChange={handleCsvFileUpload} className="file-input-hidden" />
          </label>
        </div>
      )}

      <div className="onboarding-spacer" />

      <div className="onboarding-actions">
        <button className="btn-primary large-btn" onClick={handleSubmit}>Start Trip Ledger →</button>
        {onCancel && (
          <button className="btn-quiet" onClick={onCancel}>
            Cancel, back to {currentTripName || 'my ledger'}
          </button>
        )}
      </div>
    </div>
  );
};
