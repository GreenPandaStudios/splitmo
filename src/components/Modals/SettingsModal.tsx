import React, { useState } from 'react';
import type { TripGroup } from '../../types';
import { UserPlus, Database, Trash2, X, Code2 } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: TripGroup;
  onUpdateIskRate: (rate: number) => void;
  onAddMember: (name: string) => void;
  onUpdateSupabaseConfig: (config: TripGroup['supabaseConfig']) => void;
  onResetTrip: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen, onClose, trip, onUpdateIskRate, onAddMember, onUpdateSupabaseConfig, onResetTrip,
}) => {
  const [customRate, setCustomRate] = useState<string>(trip.customIskToUsdRate?.toString() || '138.5');
  const [newMemberName, setNewMemberName] = useState('');
  const [sbUrl, setSbUrl] = useState(trip.supabaseConfig?.url || '');
  const [sbAnonKey, setSbAnonKey] = useState(trip.supabaseConfig?.anonKey || '');
  const [showSql, setShowSql] = useState(false);

  if (!isOpen) return null;

  const handleSaveRate = () => {
    const r = parseFloat(customRate);
    if (!isNaN(r) && r > 0) { onUpdateIskRate(r); alert(`Exchange rate updated to 1 USD = ${r} ISK`); }
  };

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMemberName.trim()) { onAddMember(newMemberName.trim()); setNewMemberName(''); }
  };

  const handleSaveSupabase = () => {
    if (sbUrl.trim() && sbAnonKey.trim()) {
      onUpdateSupabaseConfig({ url: sbUrl.trim(), anonKey: sbAnonKey.trim() });
      alert('Supabase database configuration saved!');
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content glass-card slide-up large-modal">
        <div className="modal-header">
          <h2>Trip & Database Settings ⚙️</h2>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="settings-grid">
          <div className="settings-card glass-card">
            <h3>Currency Exchange Rate</h3>
            <p className="settings-desc">Set custom exchange rate for ISK to USD conversion.</p>
            <div className="form-row">
              <input type="number" step="any" value={customRate} onChange={(e) => setCustomRate(e.target.value)} className="text-input" placeholder="e.g. 138.5" />
              <button className="btn-secondary" onClick={handleSaveRate}>Update Rate</button>
            </div>
          </div>

          <div className="settings-card glass-card">
            <h3>Trip Members</h3>
            <form onSubmit={handleAddMemberSubmit} className="form-row">
              <input type="text" value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} placeholder="New friend name" className="text-input" />
              <button type="submit" className="btn-secondary"><UserPlus size={15} /> Add</button>
            </form>
          </div>

          <div className="settings-card glass-card">
            <h3>Supabase Cloud Sync ⚡</h3>
            <p className="settings-desc">Paste your Supabase URL & Anon Key to sync across devices in real time.</p>
            <div className="form-group"><input type="text" placeholder="https://your-project.supabase.co" value={sbUrl} onChange={(e) => setSbUrl(e.target.value)} className="text-input" /></div>
            <div className="form-group"><input type="text" placeholder="eyJhbGciOiJIUzI1NiIsIn..." value={sbAnonKey} onChange={(e) => setSbAnonKey(e.target.value)} className="text-input" /></div>
            <div className="form-row">
              <button className="btn-secondary flex-1" onClick={handleSaveSupabase}><Database size={15} /> Connect Supabase</button>
              <button className="btn-secondary" onClick={() => setShowSql(!showSql)}><Code2 size={15} /> {showSql ? 'Hide SQL' : 'View SQL'}</button>
            </div>

            {showSql && (
              <pre className="sql-snippet-box">
{`create table public.trips (
  id text primary key,
  name text not null,
  data jsonb not null,
  updated_at timestamptz default now()
);
alter table public.trips enable row level security;
create policy "Public trips" on public.trips for all using (true);
alter publication supabase_realtime add table public.trips;`}
              </pre>
            )}
          </div>

          <div className="settings-card glass-card danger-card">
            <h3>Reset Trip Data</h3>
            <p className="settings-desc">Clear all expenses and reset to default template.</p>
            <button className="btn-danger" onClick={() => { if (confirm('Reset all expenses for this trip?')) { onResetTrip(); onClose(); } }}>
              <Trash2 size={15} /> Reset Expenses
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
