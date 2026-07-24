import React, { useState } from 'react';
import type { Member } from '../../types';
import type { SplitwiseImportResult } from '../../services';
import { parseSplitwiseCSV } from '../../services';
import { Upload, CheckCircle2, X } from 'lucide-react';

interface SplitwiseImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingMembers: Member[];
  onImportComplete: (result: SplitwiseImportResult) => void;
  iskRate: number;
}

export const SplitwiseImportModal: React.FC<SplitwiseImportModalProps> = ({
  isOpen,
  onClose,
  existingMembers,
  onImportComplete,
  iskRate,
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
          const res = parseSplitwiseCSV(text, existingMembers, iskRate);
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
          <h2>Import Splitwise CSV Export 📊</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="import-modal-body">
          <p className="modal-subtext">
            Export your group expenses from Splitwise as a CSV file, then drop it here to import all expenses and members instantly!
          </p>

          <label className="csv-dropzone">
            <Upload size={32} className="icon-blue" />
            <span>{fileName ? `Loaded: ${fileName}` : 'Choose Splitwise CSV Export File'}</span>
            <input type="file" accept=".csv" onChange={handleFileUpload} className="file-input-hidden" />
          </label>

          {parseResult && (
            <div className="import-preview-box">
              <div className="preview-header">
                <CheckCircle2 size={20} className="icon-green" />
                <span>Found {parseResult.expenses.length} expenses to import</span>
              </div>

              <div className="import-stats">
                <div className="stat-pill">Members: {parseResult.members.length}</div>
                <div className="stat-pill">Expenses: {parseResult.expenses.length}</div>
                {parseResult.ignoredCount > 0 && (
                  <div className="stat-pill warning">Skipped {parseResult.ignoredCount} invalid rows</div>
                )}
              </div>

              <div className="preview-table-container">
                <table className="preview-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parseResult.expenses.slice(0, 5).map((exp) => (
                      <tr key={exp.id}>
                        <td>{exp.date}</td>
                        <td>{exp.title}</td>
                        <td>
                          {exp.amount} {exp.currency}
                        </td>
                        <td>{exp.category}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parseResult.expenses.length > 5 && (
                  <p className="more-rows-lbl">+ {parseResult.expenses.length - 5} more expenses...</p>
                )}
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
