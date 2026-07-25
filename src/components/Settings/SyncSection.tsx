import React, { useState } from 'react';
import type { SupabaseConfig } from '../../services';
import { DEFAULT_SUPABASE_CONFIG } from '../../services';
import { Database, RefreshCw } from 'lucide-react';

interface SyncSectionProps {
  config?: SupabaseConfig;
  ratesUpdatedAt?: string;
  onUpdateSupabaseConfig: (config: SupabaseConfig) => void;
  onRefreshRates: () => void;
}

export const SyncSection: React.FC<SyncSectionProps> = ({
  config,
  ratesUpdatedAt,
  onUpdateSupabaseConfig,
  onRefreshRates,
}) => {
  const [sbUrl, setSbUrl] = useState(config?.url || DEFAULT_SUPABASE_CONFIG.url);
  const [sbKey, setSbKey] = useState(config?.anonKey || DEFAULT_SUPABASE_CONFIG.anonKey);

  const updatedLabel = ratesUpdatedAt
    ? new Date(ratesUpdatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'never';

  return (
    <section className="section-block">
      <div className="section-header-flex">
        <div>
          <h2 className="section-title">Sync &amp; Rates</h2>
          <p className="section-sub">Exchange rates last pulled {updatedLabel}</p>
        </div>
        <span className="badge-pill active-badge"><Database size={11} /> Live</span>
      </div>

      <div className="section-body">
        <button className="btn-secondary" onClick={onRefreshRates}>
          <RefreshCw size={14} /> Refresh exchange rates
        </button>

        <div className="form-group">
          <label className="input-label">Supabase project URL</label>
          <input type="text" value={sbUrl} onChange={(e) => setSbUrl(e.target.value)} className="text-input" />
        </div>

        <div className="form-group">
          <label className="input-label">Anon API key</label>
          <input type="password" value={sbKey} onChange={(e) => setSbKey(e.target.value)} className="text-input" />
        </div>

        <button className="btn-secondary" onClick={() => onUpdateSupabaseConfig({ url: sbUrl, anonKey: sbKey })}>
          Save database config
        </button>
      </div>
    </section>
  );
};
