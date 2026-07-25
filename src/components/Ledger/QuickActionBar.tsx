import React from 'react';
import { Scan, FileSpreadsheet, ArrowRight } from 'lucide-react';

interface QuickActionBarProps {
  onScanOcr: () => void;
  onImportCsv: () => void;
  onSettleUp: () => void;
}

/** Three secondary entry points. Adding an expense lives on the floating button. */
export const QuickActionBar: React.FC<QuickActionBarProps> = ({
  onScanOcr,
  onImportCsv,
  onSettleUp,
}) => {
  return (
    <div className="quick-action-bar">
      <button className="quick-action-btn" onClick={onScanOcr} title="Scan a receipt">
        <Scan size={16} />
        <span>Receipt</span>
      </button>

      <button className="quick-action-btn" onClick={onImportCsv} title="Import a Splitwise CSV">
        <FileSpreadsheet size={16} />
        <span>Import</span>
      </button>

      <button className="quick-action-btn" onClick={onSettleUp} title="Settle up debts">
        <ArrowRight size={16} />
        <span>Settle</span>
      </button>
    </div>
  );
};
