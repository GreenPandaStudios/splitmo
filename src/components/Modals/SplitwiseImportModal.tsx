import React, { useState } from 'react';
import type { Member } from '../../types';
import type { SplitwiseImportResult } from '../../services';
import { parseSplitwiseCSV } from '../../services';
import { Upload, CheckCircle2, X } from 'lucide-react';

interface SplitwiseImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingMembers: Member[];
  customRates?: Record<string, number>;
  iskRate?: number;
  onImportComplete: (result: SplitwiseImportResult) => void;
}

export const SplitwiseImportModal: React.FC<SplitwiseImportModalProps> = ({
  isOpen,
  onClose,
  existingMembers,
  customRates,
  onImportComplete,
}) => {
  const [fileName, setFileName] = useState('');
  const [parseResult, setParseResult] = useState<SplitwiseImportResult | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          const res = parseSplitwiseCSV(text, existingMembers, customRates);
          setParseResult(res);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleConfirmImport = () => {
    if (parseResult) {
      onImportComplete(parseResult);
      onClose();
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content glass-card slide-up large-modal">
        <div className="modal-header">
          <h2>Import Splitwise CSV 📊</h2>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="import-modal-body">
          <p className="modal-subtext">
            Export expenses from Splitwise as a CSV file and upload it here to import all members and expenses automatically.
          </p>

          <label className="csv-dropzone">
            <Upload size={28} className="icon-blue" />
            <span>{fileName ? `Loaded: ${fileName}` : 'Upload Splitwise CSV Export'}</span>
            <input type="file" accept=".csv" onChange={handleFileUpload} className="file-input-hidden" />
          </label>

          {parseResult && (
            <div className="import-preview-box">
              <div className="preview-header">
                <CheckCircle2 size={18} className="icon-green" />
                <span>Found {parseResult.expenses.length} expenses to import</span>
              </div>

              <div className="import-stats">
                <div className="stat-pill">Members: {parseResult.members.length}</div>
                <div className="stat-pill">Expenses: {parseResult.expenses.length}</div>
              </div>

              <button className="btn-primary full-width" onClick={handleConfirmImport}>
                Import {parseResult.expenses.length} Expenses Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
