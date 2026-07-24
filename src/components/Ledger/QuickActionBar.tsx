import React from 'react';
import { Plus, Scan, FileSpreadsheet, Send } from 'lucide-react';

interface QuickActionBarProps {
  onAddExpense: () => void;
  onScanOcr: () => void;
  onImportCsv: () => void;
  onSettleUp: () => void;
}

export const QuickActionBar: React.FC<QuickActionBarProps> = ({
  onAddExpense,
  onScanOcr,
  onImportCsv,
  onSettleUp,
}) => {
  return (
    <div className="quick-action-bar">
      <button className="quick-action-btn electric-btn" onClick={onAddExpense} title="Add New Expense">
        <Plus size={16} />
        <span>Expense</span>
      </button>

      <button className="quick-action-btn secondary-action" onClick={onScanOcr} title="Scan Receipt OCR">
        <Scan size={15} />
        <span>Receipt</span>
      </button>

      <button className="quick-action-btn secondary-action" onClick={onImportCsv} title="Import Splitwise CSV">
        <FileSpreadsheet size={15} />
        <span>Import</span>
      </button>

      <button className="quick-action-btn secondary-action" onClick={onSettleUp} title="Settle Up Debts">
        <Send size={15} />
        <span>Settle</span>
      </button>
    </div>
  );
};
