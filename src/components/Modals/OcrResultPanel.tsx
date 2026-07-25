import React from 'react';
import type { ReceiptOCRResult } from '../../types';
import { formatCurrency } from '../../services';
import { CheckCircle, AlertTriangle, ArrowRight, RotateCcw } from 'lucide-react';

interface OcrResultPanelProps {
  result: ReceiptOCRResult;
  onUse: () => void;
  onRescan: () => void;
}

export const OcrResultPanel: React.FC<OcrResultPanelProps> = ({ result, onUse, onRescan }) => {
  const foundTotal = typeof result.totalAmount === 'number' && result.totalAmount > 0;

  return (
    <div className="ocr-results-box">
      <div className="result-header">
        {foundTotal ? <CheckCircle size={18} className="icon-green" /> : <AlertTriangle size={18} className="icon-red" />}
        <span>{foundTotal ? 'Scan complete' : 'No total found'}</span>
      </div>

      <div className="extracted-fields-list">
        <div className="field-row">
          <span className="field-lbl">Merchant</span>
          <strong>{result.merchantName || 'Unknown'}</strong>
        </div>
        <div className="field-row">
          <span className="field-lbl">Total</span>
          <strong className={foundTotal ? 'text-highlight' : ''}>
            {foundTotal ? formatCurrency(result.totalAmount!, result.currency || 'ISK') : 'Not detected'}
          </strong>
        </div>
        <div className="field-row">
          <span className="field-lbl">Date</span>
          <span>{result.date}</span>
        </div>
        <div className="field-row">
          <span className="field-lbl">Category</span>
          <span>{result.category}</span>
        </div>
      </div>

      <div className="ocr-actions">
        <button className="btn-secondary" onClick={onRescan}>
          <RotateCcw size={14} /> Rescan
        </button>
        <button className="btn-primary" onClick={onUse}>
          {foundTotal ? 'Use this' : 'Fill in manually'} <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
