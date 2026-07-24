import React, { useState } from 'react';
import type { TripGroup } from '../../types';
import type { SplitwiseImportResult } from '../../services';
import { parseSplitwiseCSVToTrip } from '../../services';
import { Upload, CheckCircle2, X, UserCheck } from 'lucide-react';

interface SplitwiseImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  customRates?: Record<string, number>;
  onImportTripComplete: (importedTrip: TripGroup, currentMemberId?: string) => void;
}

export const SplitwiseImportModal: React.FC<SplitwiseImportModalProps> = ({
  isOpen,
  onClose,
  customRates,
  onImportTripComplete,
}) => {
  const [fileName, setFileName] = useState('');
  const [tripName, setTripName] = useState('Splitwise Group Import');
  const [parseResult, setParseResult] = useState<SplitwiseImportResult | null>(null);
  const [selectedMyId, setSelectedMyId] = useState<string>('');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const defaultName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setFileName(file.name);
      setTripName(defaultName);

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          const res = parseSplitwiseCSVToTrip(text, defaultName, customRates);
          setParseResult(res);
          if (res.trip.members.length > 0) {
            setSelectedMyId(res.trip.members[0].id);
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const handleConfirmImport = () => {
    if (parseResult) {
      const finalTrip: TripGroup = {
        ...parseResult.trip,
        name: tripName || parseResult.trip.name,
        currentMemberId: selectedMyId || parseResult.trip.members[0]?.id,
      };
      onImportTripComplete(finalTrip, selectedMyId);
      onClose();
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content glass-card slide-up large-modal">
        <div className="modal-header">
          <h2>Import Splitwise Group 📊</h2>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="import-modal-body modal-form">
          <p className="modal-subtext">
            Upload your Splitwise CSV export to import the full group, members, and expenses instantly.
          </p>

          <label className="csv-dropzone">
            <Upload size={24} className="icon-blue" />
            <span>{fileName ? `Loaded: ${fileName}` : 'Choose Splitwise CSV File'}</span>
            <input type="file" accept=".csv" onChange={handleFileUpload} className="file-input-hidden" />
          </label>

          {parseResult && (
            <div className="import-preview-box view-stack">
              <div className="form-group">
                <label className="input-label">Trip / Group Name</label>
                <input
                  type="text"
                  value={tripName}
                  onChange={(e) => setTripName(e.target.value)}
                  className="text-input"
                />
              </div>

              <div className="form-group">
                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <UserCheck size={13} /> Who are you in this group?
                </label>
                <select
                  value={selectedMyId}
                  onChange={(e) => setSelectedMyId(e.target.value)}
                  className="select-input"
                >
                  {parseResult.trip.members.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div className="preview-header">
                <CheckCircle2 size={16} className="icon-green" />
                <span>Found {parseResult.trip.expenses.length} expenses across {parseResult.trip.members.length} members</span>
              </div>

              <button className="btn-primary full-width" onClick={handleConfirmImport}>
                Import Full Group Ledger
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
