import React, { useState } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface DangerZoneProps {
  onResetTrip: () => void;
  onDeleteCurrentTrip?: () => void;
}

export const DangerZone: React.FC<DangerZoneProps> = ({ onResetTrip, onDeleteCurrentTrip }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <section className="section-block">
      <h2 className="section-title danger-title">Danger Zone</h2>
      <div className="section-body danger-actions">
        <button className="btn-ghost-danger" onClick={onResetTrip}>
          <RefreshCw size={14} /> Clear all expenses
        </button>

        {onDeleteCurrentTrip && (
          confirmDelete ? (
            <button className="btn-danger" onClick={onDeleteCurrentTrip}>
              <AlertTriangle size={14} /> Confirm delete trip
            </button>
          ) : (
            <button className="btn-ghost-danger" onClick={() => setConfirmDelete(true)}>
              <Trash2 size={14} /> Delete this trip
            </button>
          )
        )}
      </div>
    </section>
  );
};
