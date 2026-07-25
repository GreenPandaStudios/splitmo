import { useState, useEffect, useMemo } from 'react';
import type { TripGroup, CurrencyCode, Expense, DebtSettlement } from './types';
import {
  loadAllTrips, saveAllTrips, loadActiveTripId, saveActiveTripId,
  fetchLiveRates, calculateMemberBalances, simplifyDebts,
  subscribeToTripSupabase, syncTripToSupabase, fetchAllTripsFromSupabase,
  DEFAULT_SUPABASE_CONFIG, DEFAULT_ICELAND_TRIP,
} from './services';
import type { TabType } from './components';
import {
  Header, NavigationTabs, NetBalanceBanner, QuickActionBar,
  ExpenseFilters, ExpenseList, DebtGraphMatrix, SettingsView,
  AddExpenseModal, ReceiptOcrModal, SplitwiseImportModal, TripManagerModal,
  OnboardingScreen,
} from './components';

export default function App() {
  const [trips, setTrips] = useState<TripGroup[]>(() => {
    const loaded = loadAllTrips();
    return loaded.filter((t) => !t.id.startsWith('trip_sp_') && t.expenses.length <= 10);
  });
  const [activeTripId, setActiveTripId] = useState<string | null>(DEFAULT_ICELAND_TRIP.id);
  const [displayCurrency, setDisplayCurrency] = useState<CurrencyCode>('USD');
  const [activeTab, setActiveTab] = useState<TabType>('ledger');
  const [isTripManagerOpen, setIsTripManagerOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'add' | 'ocr' | 'import' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMember, setSelectedMember] = useState('all');
  const [ocrInitialData, setOcrInitialData] = useState<Partial<Expense> | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAllTripsFromSupabase(DEFAULT_SUPABASE_CONFIG)
      .then((remotes) => {
        if (remotes && remotes.length > 0) {
          setTrips(remotes);
          setActiveTripId(remotes[0].id);
        } else {
          setTrips([DEFAULT_ICELAND_TRIP]);
          setActiveTripId(DEFAULT_ICELAND_TRIP.id);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const activeTrip = useMemo(() => {
    return trips.find((t) => t.id === activeTripId) || trips[0] || DEFAULT_ICELAND_TRIP;
  }, [trips, activeTripId]);

  const isSbActive = Boolean(activeTrip?.supabaseConfig?.url || DEFAULT_SUPABASE_CONFIG.url);

  useEffect(() => {
    if (!isLoading && trips.length > 0 && activeTrip && !activeTrip.id.startsWith('trip_sp_')) {
      saveAllTrips(trips);
      if (activeTripId) saveActiveTripId(activeTripId);
      syncTripToSupabase(activeTrip.supabaseConfig || DEFAULT_SUPABASE_CONFIG, activeTrip);
    }
  }, [trips, activeTripId, activeTrip, isLoading]);

  useEffect(() => {
    if (activeTrip && !activeTrip.id.startsWith('trip_sp_')) {
      const cfg = activeTrip.supabaseConfig || DEFAULT_SUPABASE_CONFIG;
      const unsub = subscribeToTripSupabase(cfg, activeTrip.id, (remote: TripGroup) => {
        setTrips((prev) => prev.map((t) => (t.id === remote.id ? remote : t)));
      });
      return () => { if (unsub) unsub(); };
    }
  }, [activeTrip?.id, activeTrip?.supabaseConfig]);

  const updateCurrentTrip = (updater: (t: TripGroup) => TripGroup) => {
    if (!activeTrip) return;
    setTrips((prev) => prev.map((t) => (t.id === activeTrip.id ? updater(t) : t)));
  };

  const handleCreateNewTrip = (name: string, description: string, homeCurrency: CurrencyCode, initialMembers: string[]) => {
    const mems = initialMembers.map((mName, idx) => ({ id: `m_${Date.now()}_${idx}`, name: mName }));
    const newTrip: TripGroup = {
      id: `trip_${Date.now()}`, name, description, supabaseConfig: DEFAULT_SUPABASE_CONFIG, currentMemberId: mems[0]?.id,
      exchangeRates: { baseCurrency: homeCurrency, rates: {}, lastUpdated: new Date().toISOString() },
      members: mems, expenses: [], createdAt: new Date().toISOString(),
    };
    setTrips((prev) => [...prev, newTrip]); setActiveTripId(newTrip.id); setDisplayCurrency(homeCurrency);
  };

  const handleImportTrip = (importedTrip: TripGroup) => {
    setTrips((prev) => [...prev, importedTrip]); setActiveTripId(importedTrip.id);
    if (importedTrip.expenses[0]?.currency) setDisplayCurrency(importedTrip.expenses[0].currency);
    setActiveTab('ledger');
  };

  const handleDeleteTrip = (id: string) => {
    const remaining = trips.filter((t) => t.id !== id);
    setTrips(remaining);
    if (activeTripId === id) setActiveTripId(remaining[0]?.id || null);
  };

  const handleSaveExpense = (newExp: Expense) => {
    updateCurrentTrip((t) => ({ ...t, expenses: [newExp, ...t.expenses] }));
    setActiveModal(null); setOcrInitialData(undefined);
  };

  if (isLoading) {
    return <div className="app-shell flex-center" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: 'var(--text-sub)' }}>Loading Iceland Trip Ledger...</p></div>;
  }

  if (!activeTrip || trips.length === 0) {
    return <div className="app-shell"><OnboardingScreen onCreateTrip={handleCreateNewTrip} onImportTrip={handleImportTrip} /></div>;
  }

  const memberBalances = calculateMemberBalances(activeTrip.members, activeTrip.expenses, activeTrip.exchangeRates.rates, displayCurrency);
  const debtSettlements = simplifyDebts(memberBalances, activeTrip.exchangeRates.rates);
  const filteredExpenses = activeTrip.expenses.filter((e) => e.title.toLowerCase().includes(searchQuery.toLowerCase()) && (selectedCategory === 'all' || e.category === selectedCategory) && (selectedMember === 'all' || e.paidByMemberId === selectedMember));

  const myMemberId = activeTrip.currentMemberId || activeTrip.members[0]?.id;
  const myBalanceObj = memberBalances.find((b) => b.memberId === myMemberId);
  const myNetBalance = myBalanceObj ? myBalanceObj.netBalanceISK : 0;
  const myMemberName = activeTrip.members.find((m) => m.id === myMemberId)?.name || 'You';

  return (
    <div className="app-shell">
      <Header tripName={activeTrip.name} displayCurrency={displayCurrency} onSelectCurrency={setDisplayCurrency} onRefreshRate={async () => { const r = await fetchLiveRates(); updateCurrentTrip((t) => ({ ...t, exchangeRates: { ...t.exchangeRates, rates: r } })); }} isDbActive={isSbActive} dbTypeName="Supabase Live ⚡" onOpenTripManager={() => setIsTripManagerOpen(true)} netBalance={myNetBalance} members={activeTrip.members} currentMemberId={myMemberId} onSelectCurrentMember={(id) => updateCurrentTrip((t) => ({ ...t, currentMemberId: id }))} />

      <main className="app-main-content">
        {activeTab === 'ledger' && (
          <div className="view-stack">
            <NetBalanceBanner netBalance={myNetBalance} displayCurrency={displayCurrency} tripName={activeTrip.name} currentMemberName={myMemberName} onOpenTripManager={() => setIsTripManagerOpen(true)} />
            <QuickActionBar onAddExpense={() => setActiveModal('add')} onScanOcr={() => setActiveModal('ocr')} onImportCsv={() => setActiveModal('import')} onSettleUp={() => setActiveTab('balances')} />
            <ExpenseFilters searchQuery={searchQuery} onSearchChange={setSearchQuery} selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} selectedMember={selectedMember} onMemberChange={setSelectedMember} members={activeTrip.members} />
            <ExpenseList expenses={filteredExpenses} members={activeTrip.members} displayCurrency={displayCurrency} customRates={activeTrip.exchangeRates.rates} onDeleteExpense={(id) => updateCurrentTrip((t) => ({ ...t, expenses: t.expenses.filter((e) => e.id !== id) }))} />
          </div>
        )}

        {activeTab === 'balances' && (
          <DebtGraphMatrix settlements={debtSettlements} balances={memberBalances} displayCurrency={displayCurrency} onRecordSettlement={(s) => handleSaveExpense({ id: `set_${Date.now()}`, title: `Settlement: ${s.fromMemberName} → ${s.toMemberName}`, amount: s.amountISK, currency: displayCurrency, amountInISK: s.amountISK, amountInUSD: s.amountUSD, exchangeRateUsed: 1, paidByMemberId: s.fromMemberId, date: new Date().toISOString().split('T')[0], category: 'other', splitType: 'exact', splits: [{ memberId: s.toMemberId, amount: s.amountISK }], createdAt: new Date().toISOString() })} />
        )}

        {activeTab === 'settings' && (
          <SettingsView trip={activeTrip} onAddMember={(name) => updateCurrentTrip((t) => ({ ...t, members: [...t.members, { id: `m_${Date.now()}`, name }] }))} onUpdateSupabaseConfig={(cfg) => updateCurrentTrip((t) => ({ ...t, supabaseConfig: cfg }))} onResetTrip={() => updateCurrentTrip((t) => ({ ...t, expenses: [] }))} onDeleteCurrentTrip={() => handleDeleteTrip(activeTrip.id)} />
        )}
      </main>

      <NavigationTabs activeTab={activeTab} onSelectTab={setActiveTab} />
      <AddExpenseModal isOpen={activeModal === 'add'} onClose={() => setActiveModal(null)} onSaveExpense={handleSaveExpense} members={activeTrip.members} customRates={activeTrip.exchangeRates.rates} initialData={ocrInitialData} />
      <ReceiptOcrModal isOpen={activeModal === 'ocr'} onClose={() => setActiveModal(null)} members={activeTrip.members} onReceiptScanned={(data) => { setOcrInitialData(data); setActiveModal('add'); }} />
      <SplitwiseImportModal isOpen={activeModal === 'import'} onClose={() => setActiveModal(null)} customRates={activeTrip.exchangeRates.rates} onImportTripComplete={handleImportTrip} />
      <TripManagerModal isOpen={isTripManagerOpen} onClose={() => setIsTripManagerOpen(false)} trips={trips} activeTripId={activeTrip.id} onSelectTrip={setActiveTripId} onCreateTrip={(n, d) => handleCreateNewTrip(n, d, 'USD', ['Alice', 'Bob'])} onDeleteTrip={handleDeleteTrip} />
    </div>
  );
}
