import React from 'react';
import type { CurrencyCode, DebtSettlement, Expense, MemberBalance, TripGroup } from '../types';
import type { TabType } from './NavigationTabs';
import { LedgerView } from './Ledger';
import { BalancesView } from './Balances';
import { SettingsView } from './Settings';

interface TabContentProps {
  activeTab: TabType;
  trip: TripGroup;
  tripCount: number;
  displayCurrency: CurrencyCode;
  rates?: Record<string, number>;
  memberBalances: MemberBalance[];
  settlements: DebtSettlement[];
  myNetBalance: number;
  myMemberName: string;
  onAddExpense: () => void;
  onScanOcr: () => void;
  onImportCsv: () => void;
  onSettleUp: () => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onRecordSettlement: (settlement: DebtSettlement) => void;
  onOpenTripManager: () => void;
  onUpdateTrip: (updater: (t: TripGroup) => TripGroup) => void;
  onRefreshRates: () => void;
  onDeleteTrip: () => void;
  onNotify: (message: string) => void;
}

/** Routes the active tab to its view and adapts trip mutations into each view's callbacks. */
export const TabContent: React.FC<TabContentProps> = (p) => {
  if (p.activeTab === 'ledger') {
    return (
      <LedgerView
        expenses={p.trip.expenses}
        members={p.trip.members}
        displayCurrency={p.displayCurrency}
        customRates={p.rates}
        netBalance={p.myNetBalance}
        currentMemberName={p.myMemberName}
        onAddExpense={p.onAddExpense}
        onScanOcr={p.onScanOcr}
        onImportCsv={p.onImportCsv}
        onSettleUp={p.onSettleUp}
        onEditExpense={p.onEditExpense}
        onDeleteExpense={p.onDeleteExpense}
      />
    );
  }

  if (p.activeTab === 'balances') {
    return (
      <BalancesView
        settlements={p.settlements}
        balances={p.memberBalances}
        displayCurrency={p.displayCurrency}
        onRecordSettlement={p.onRecordSettlement}
      />
    );
  }

  return (
    <SettingsView
      trip={p.trip}
      tripCount={p.tripCount}
      onOpenTripManager={p.onOpenTripManager}
      onAddMember={(name) => p.onUpdateTrip((t) => ({ ...t, members: [...t.members, { id: `m_${Date.now()}`, name }] }))}
      onUpdateTripDetails={(name, description) => { p.onUpdateTrip((t) => ({ ...t, name, description })); p.onNotify('Ledger details saved'); }}
      onUpdateSupabaseConfig={(cfg) => { p.onUpdateTrip((t) => ({ ...t, supabaseConfig: cfg })); p.onNotify('Database config saved'); }}
      onRefreshRates={p.onRefreshRates}
      onResetTrip={() => { p.onUpdateTrip((t) => ({ ...t, expenses: [] })); p.onNotify('All expenses cleared'); }}
      onDeleteCurrentTrip={p.onDeleteTrip}
      onNotify={p.onNotify}
    />
  );
};
