import React, { useState } from 'react';
import type { TripGroup } from '../../types';
import { Plus, Check, Trash2, X, MapPin } from 'lucide-react';

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

  if (!isOpen) return null;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTripName.trim()) {
      onCreateTrip(newTripName.trim(), newTripDesc.trim() || 'Trip expense group');
      setNewTripName(''); setNewTripDesc('');
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content glass-card slide-up large-modal">
        <div className="modal-header">
          <h2>Manage Your Trips 🗺️</h2>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="trip-manager-grid">
          <div className="trip-list-section">
            <label className="input-label">Select Active Trip</label>
            <div className="trip-cards-list">
              {trips.map((t) => {
                const isActive = t.id === activeTripId;
                return (
                  <div key={t.id} className={`trip-selector-card ${isActive ? 'active' : ''}`}>
                    <div className="trip-card-left" onClick={() => { onSelectTrip(t.id); onClose(); }}>
                      <MapPin size={18} className={isActive ? 'icon-blue' : 'icon-muted'} />
                      <div>
                        <h4 className="trip-card-title">{t.name}</h4>
                        <p className="trip-card-sub">{t.expenses.length} expenses • {t.members.length} members</p>
                      </div>
                    </div>

                    <div className="trip-card-right">
                      {isActive ? (
                        <span className="badge-pill active-badge"><Check size={12} /> Active</span>
                      ) : (
                        trips.length > 1 && (
                          <button className="delete-btn-icon" onClick={() => onDeleteTrip(t.id)} title="Delete trip">
                            <Trash2 size={15} />
                          </button>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="create-trip-section glass-card">
            <h3>Create New Trip 🌋</h3>
            <form onSubmit={handleCreateSubmit} className="modal-form">
              <div className="form-group">
                <label className="input-label">Trip Name</label>
                <input type="text" required placeholder="e.g. Golden Circle Weekend 🏕️" value={newTripName} onChange={(e) => setNewTripName(e.target.value)} className="text-input" />
              </div>
              <div className="form-group">
                <label className="input-label">Description (Optional)</label>
                <input type="text" placeholder="e.g. Splitting rental car & cabins" value={newTripDesc} onChange={(e) => setNewTripDesc(e.target.value)} className="text-input" />
              </div>
              <button type="submit" className="btn-primary full-width"><Plus size={16} /> Create Trip</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
