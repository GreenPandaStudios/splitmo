import React, { useState } from 'react';
import type { TripGroup } from '../../types';
import { Plus, Check, Trash2, X, MapPin, AlertTriangle } from 'lucide-react';

interface TripManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  trips: TripGroup[];
  activeTripId: string;
  onSelectTrip: (id: string) => void;
  onCreateTrip: (name: string, description: string) => void;
  onDeleteTrip: (id: string) => void;
}

export const TripManagerModal: React.FC<TripManagerModalProps> = ({
  isOpen, onClose, trips, activeTripId, onSelectTrip, onCreateTrip, onDeleteTrip,
}) => {
  const [newTripName, setNewTripName] = useState('');
  const [newTripDesc, setNewTripDesc] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTripName.trim()) {
      onCreateTrip(newTripName.trim(), newTripDesc.trim() || 'Trip expense group');
      setNewTripName(''); setNewTripDesc('');
    }
  };

  const handleConfirmDelete = (id: string) => {
    onDeleteTrip(id);
    setDeletingId(null);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content glass-card slide-up large-modal">
        <div className="modal-header">
          <h2>Trip Manager 🗺️</h2>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="trip-manager-grid">
          <div className="trip-list-section">
            <label className="input-label">Your Trips ({trips.length})</label>
            <div className="trip-cards-list">
              {trips.map((t) => {
                const isActive = t.id === activeTripId;
                const isConfirming = deletingId === t.id;
                return (
                  <div key={t.id} className={`trip-selector-card ${isActive ? 'active' : ''}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--bg-input)', borderRadius: '8px', marginBottom: '6px' }}>
                    <div className="trip-card-left" onClick={() => { onSelectTrip(t.id); onClose(); }} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={16} className={isActive ? 'icon-blue' : 'icon-muted'} />
                      <div>
                        <h4 className="trip-card-title" style={{ fontSize: '13px', fontWeight: 600 }}>{t.name}</h4>
                        <p className="trip-card-sub" style={{ fontSize: '11px', color: 'var(--text-sub)' }}>{t.expenses.length} expenses • {t.members.length} members</p>
                      </div>
                    </div>

                    <div className="trip-card-right" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {isActive && <span className="badge-pill active-badge" style={{ fontSize: '10px' }}><Check size={11} /> Active</span>}
                      {isConfirming ? (
                        <button className="btn-secondary-small" style={{ background: '#ef4444', color: '#fff' }} onClick={() => handleConfirmDelete(t.id)}>
                          <AlertTriangle size={12} /> Confirm Delete
                        </button>
                      ) : (
                        <button className="delete-btn-icon" onClick={() => setDeletingId(t.id)} title="Delete trip">
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="create-trip-section glass-card" style={{ marginTop: '10px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>Create New Trip 🌋</h3>
            <form onSubmit={handleCreateSubmit} className="modal-form">
              <div className="form-group">
                <input type="text" required placeholder="e.g. Golden Circle Weekend 🏕️" value={newTripName} onChange={(e) => setNewTripName(e.target.value)} className="text-input" />
              </div>
              <button type="submit" className="btn-primary full-width"><Plus size={15} /> Create Trip</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
