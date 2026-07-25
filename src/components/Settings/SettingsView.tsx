import React from 'react';
import type { TripGroup } from '../../types';
import type { SupabaseConfig } from '../../services';
import { TripDetailsSection } from './TripDetailsSection';
import { TravelersSection } from './TravelersSection';
import { SyncSection } from './SyncSection';
import { DangerZone } from './DangerZone';
import { exportLedgerCsv } from './exportLedgerCsv';
import { Download, Map } from 'lucide-react';

interface SettingsViewProps {
  trip: TripGroup;
  tripCount: number;
  onOpenTripManager: () => void;
  onAddMember: (name: string) => void;
  onUpdateTripDetails: (name: string, description: string) => void;
  onUpdateSupabaseConfig: (config: SupabaseConfig) => void;
  onRefreshRates: () => void;
  onResetTrip: () => void;
  onDeleteCurrentTrip?: () => void;
  onNotify?: (message: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  trip,
  tripCount,
  onOpenTripManager,
  onAddMember,
  onUpdateTripDetails,
  onUpdateSupabaseConfig,
  onRefreshRates,
  onResetTrip,
  onDeleteCurrentTrip,
  onNotify,
}) => {
  const handleExport = () => {
    const exported = exportLedgerCsv(trip);
    onNotify?.(exported ? 'Ledger exported as CSV' : 'Nothing to export yet');
  };

  const entryLabel = trip.expenses.length === 1 ? 'entry' : 'entries';

  return (
    <div className="tab-panel">
      <section className="section-block">
        <h2 className="section-title">Export &amp; Backup</h2>
        <p className="section-sub">Download the full ledger as CSV</p>
        <div className="section-body">
          <button className="btn-primary" onClick={handleExport}>
            <Download size={15} /> Export {trip.expenses.length} {entryLabel}
          </button>
        </div>
      </section>

      <TripDetailsSection
        key={trip.id}
        name={trip.name}
        description={trip.description}
        onSave={onUpdateTripDetails}
      />

      <section className="section-block">
        <h2 className="section-title">Trips</h2>
        <p className="section-sub">Switch between ledgers or remove old ones</p>
        <div className="section-body">
          <button className="btn-secondary" onClick={onOpenTripManager}>
            <Map size={14} /> Manage {tripCount} {tripCount === 1 ? 'trip' : 'trips'}
          </button>
        </div>
      </section>

      <TravelersSection members={trip.members} onAddMember={onAddMember} />

      <SyncSection
        config={trip.supabaseConfig}
        ratesUpdatedAt={trip.exchangeRates.lastUpdated}
        onUpdateSupabaseConfig={onUpdateSupabaseConfig}
        onRefreshRates={onRefreshRates}
      />

      <DangerZone onResetTrip={onResetTrip} onDeleteCurrentTrip={onDeleteCurrentTrip} />
    </div>
  );
};
