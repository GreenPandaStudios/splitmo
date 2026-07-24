import React, { useState } from 'react';
import type { TripGroup } from '../../types';
import type { SupabaseConfig } from '../../services';
import { DEFAULT_SUPABASE_CONFIG } from '../../services';
import { Download, Database, UserPlus, RefreshCw } from 'lucide-react';

interface SettingsViewProps {
  trip: TripGroup;
  onAddMember: (name: string) => void;
  onUpdateSupabaseConfig: (config: SupabaseConfig) => void;
  onResetTrip: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  trip,
  onAddMember,
  onUpdateSupabaseConfig,
  onResetTrip,
}) => {
  const [newMemberName, setNewMemberName] = useState('');
  const [sbUrl, setSbUrl] = useState(trip.supabaseConfig?.url || DEFAULT_SUPABASE_CONFIG.url);
  const [sbKey, setSbKey] = useState(trip.supabaseConfig?.anonKey || DEFAULT_SUPABASE_CONFIG.anonKey);

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMemberName.trim()) {
      onAddMember(newMemberName.trim());
      setNewMemberName('');
    }
  };

  const handleExportCsv = () => {
    if (trip.expenses.length === 0) return;
    const headers = ['ID', 'Title', 'Amount', 'Currency', 'PayerId', 'Date', 'Category'];
    const rows = trip.expenses.map((e) => [e.id, `"${e.title}"`, e.amount, e.currency, e.paidByMemberId, e.date, e.category]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${trip.name.replace(/\s+/g, '_')}_expenses.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="view-stack">
      <div className="glass-card section-block">
        <h2 className="section-title">Export & Backup</h2>
        <p className="section-sub">Download complete ledger data as CSV</p>
        <button className="btn-primary" onClick={handleExportCsv}>
          <Download size={15} /> Export Ledger CSV ({trip.expenses.length} items)
        </button>
      </div>

      <div className="glass-card section-block">
        <h2 className="section-title">Add Trip Member</h2>
        <form onSubmit={handleAddMemberSubmit} className="form-row">
          <input
            type="text"
            required
            placeholder="Friend Name"
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            className="text-input"
          />
          <button type="submit" className="btn-secondary">
            <UserPlus size={14} /> Add
          </button>
        </form>
      </div>

      <div className="glass-card section-block">
        <div className="section-header-flex">
          <h2 className="section-title">Supabase Database Sync</h2>
          <span className="badge-pill active-badge"><Database size={11} /> Connected</span>
        </div>
        <div className="form-group">
          <label className="input-label">Project URL</label>
          <input type="text" value={sbUrl} onChange={(e) => setSbUrl(e.target.value)} className="text-input" />
        </div>
        <div className="form-group">
          <label className="input-label">Anon API Key</label>
          <input type="password" value={sbKey} onChange={(e) => setSbKey(e.target.value)} className="text-input" />
        </div>
        <button className="btn-secondary" onClick={() => onUpdateSupabaseConfig({ url: sbUrl, anonKey: sbKey })}>
          Save Database Config
        </button>
      </div>

      <div className="glass-card section-block">
        <h2 className="section-title">Reset Trip Ledger</h2>
        <button className="btn-secondary" style={{ color: '#f87171' }} onClick={onResetTrip}>
          <RefreshCw size={14} /> Clear All Expenses
        </button>
      </div>
    </div>
  );
};
