import { useState, useEffect, useMemo } from 'react';
import type { TripGroup, CurrencyCode, Expense, DebtSettlement } from './types';
import {
  loadAllTrips, saveAllTrips, loadActiveTripId, saveActiveTripId,
  fetchLiveRates, calculateMemberBalances, simplifyDebts,
  subscribeToTripSupabase, syncTripToSupabase, DEFAULT_SUPABASE_CONFIG,
} from './services';
import type { TabType } from './components';
import {
  Header, NavigationTabs, SummaryCards, MemberBalances,
  SettlementList, ExpenseFilters, ExpenseList, AddExpenseModal,
  ReceiptOcrModal, SplitwiseImportModal, SettingsModal, TripManagerModal,
  OnboardingScreen,
} from './components';

export default function App() {
  const [trips, setTrips] = useState<TripGroup[]>(loadAllTrips);
  const [activeTripId, setActiveTripId] = useState<string | null>(loadActiveTripId);
  const [displayCurrency, setDisplayCurrency] = useState<CurrencyCode>('USD');
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isTripManagerOpen, setIsTripManagerOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMember, setSelectedMember] = useState('all');
  const [ocrInitialData, setOcrInitialData] = useState<Partial<Expense> | undefined>(undefined);

  const activeTrip = useMemo(() => trips.find((t) => t.id === activeTripId) || trips[0] || null, [trips, activeTripId]);
  const isSbActive = Boolean(activeTrip?.supabaseConfig?.url || DEFAULT_SUPABASE_CONFIG.url);

  useEffect(() => {
    saveAllTrips(trips);
    if (activeTripId) saveActiveTripId(activeTripId);
    if (activeTrip) syncTripToSupabase(activeTrip.supabaseConfig || DEFAULT_SUPABASE_CONFIG, activeTrip);
  }, [trips, activeTripId, activeTrip]);

  useEffect(() => {
    if (activeTrip) {
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
    const newTrip: TripGroup = {
      id: `trip_${Date.now()}`,
      name, description,
      supabaseConfig: DEFAULT_SUPABASE_CONFIG,
      exchangeRates: { baseCurrency: homeCurrency, rates: {}, lastUpdated: new Date().toISOString() },
      members: initialMembers.map((mName, idx) => ({ id: `m_${Date.now()}_${idx}`, name: mName })),
      expenses: [],
      createdAt: new Date().toISOString(),
    };
    setTrips((prev) => [...prev, newTrip]);
    setActiveTripId(newTrip.id);
    setDisplayCurrency(homeCurrency);
  };

  const handleSaveExpense = (newExp: Expense) => {
    updateCurrentTrip((t) => ({ ...t, expenses: [newExp, ...t.expenses] }));
    setActiveTab('expenses'); setOcrInitialData(undefined);
  };

  const handleRecordSettlement = (s: DebtSettlement) => {
    handleSaveExpense({
      id: `set_${Date.now()}`, title: `Settlement: ${s.fromMemberName} → ${s.toMemberName}`,
      amount: s.amountISK, currency: displayCurrency, amountInISK: s.amountISK, amountInUSD: s.amountUSD,
      exchangeRateUsed: 1, paidByMemberId: s.fromMemberId, date: new Date().toISOString().split('T')[0],
      category: 'other', splitType: 'exact', splits: [{ memberId: s.toMemberId, amount: s.amountISK }],
      createdAt: new Date().toISOString(),
    });
  };

  if (!activeTrip || trips.length === 0) {
    return <div className="app-shell"><OnboardingScreen onCreateTrip={handleCreateNewTrip} /></div>;
  }

  const memberBalances = calculateMemberBalances(activeTrip.members, activeTrip.expenses, activeTrip.exchangeRates.rates);
  const debtSettlements = simplifyDebts(memberBalances, activeTrip.exchangeRates.rates);
  const filteredExpenses = activeTrip.expenses.filter((e) => e.title.toLowerCase().includes(searchQuery.toLowerCase()) && (selectedCategory === 'all' || e.category === selectedCategory) && (selectedMember === 'all' || e.paidByMemberId === selectedMember));

  return (
    <div className="app-shell">
      <Header tripName={activeTrip.name} displayCurrency={displayCurrency} onSelectCurrency={setDisplayCurrency} onRefreshRate={async () => { const r = await fetchLiveRates(); updateCurrentTrip((t) => ({ ...t, exchangeRates: { ...t.exchangeRates, rates: r } })); }} isDbActive={isSbActive} dbTypeName="Supabase Live ⚡" onOpenTripManager={() => setIsTripManagerOpen(true)} />
      <NavigationTabs activeTab={activeTab} onSelectTab={(tab) => { if (tab === 'add') setOcrInitialData(undefined); setActiveTab(tab); }} expenseCount={activeTrip.expenses.length} />

      <main className="app-main-content">
        {activeTab === 'overview' && (
          <div className="view-stack">
            <SummaryCards expenses={activeTrip.expenses} memberCount={activeTrip.members.length} settlementCount={debtSettlements.length} displayCurrency={displayCurrency} customRates={activeTrip.exchangeRates.rates} />
            <div className="dual-column-grid">
              <MemberBalances balances={memberBalances} displayCurrency={displayCurrency} />
              <SettlementList settlements={debtSettlements} displayCurrency={displayCurrency} onRecordSettlement={handleRecordSettlement} />
            </div>
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="view-stack">
            <ExpenseFilters searchQuery={searchQuery} onSearchChange={setSearchQuery} selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} selectedMember={selectedMember} onMemberChange={setSelectedMember} members={activeTrip.members} />
            <ExpenseList expenses={filteredExpenses} members={activeTrip.members} displayCurrency={displayCurrency} customRates={activeTrip.exchangeRates.rates} onDeleteExpense={(id) => updateCurrentTrip((t) => ({ ...t, expenses: t.expenses.filter((e) => e.id !== id) }))} />
          </div>
        )}
      </main>

      <AddExpenseModal isOpen={activeTab === 'add'} onClose={() => setActiveTab('overview')} onSaveExpense={handleSaveExpense} members={activeTrip.members} customRates={activeTrip.exchangeRates.rates} initialData={ocrInitialData} />
      <ReceiptOcrModal isOpen={activeTab === 'ocr'} onClose={() => setActiveTab('overview')} members={activeTrip.members} onReceiptScanned={(data) => { setOcrInitialData(data); setActiveTab('add'); }} />
      <SplitwiseImportModal isOpen={activeTab === 'import'} onClose={() => setActiveTab('overview')} existingMembers={activeTrip.members} customRates={activeTrip.exchangeRates.rates} onImportComplete={(res) => { updateCurrentTrip((t) => ({ ...t, members: res.members, expenses: [...res.expenses, ...t.expenses] })); setActiveTab('expenses'); }} />
      <SettingsModal isOpen={activeTab === 'settings'} onClose={() => setActiveTab('overview')} trip={activeTrip} onUpdateIskRate={(rate) => updateCurrentTrip((t) => ({ ...t, customIskToUsdRate: rate }))} onAddMember={(name) => updateCurrentTrip((t) => ({ ...t, members: [...t.members, { id: `m_${Date.now()}`, name }] }))} onUpdateSupabaseConfig={(cfg) => updateCurrentTrip((t) => ({ ...t, supabaseConfig: cfg }))} onResetTrip={() => updateCurrentTrip((t) => ({ ...t, expenses: [] }))} />
      <TripManagerModal isOpen={isTripManagerOpen} onClose={() => setIsTripManagerOpen(false)} trips={trips} activeTripId={activeTrip.id} onSelectTrip={setActiveTripId} onCreateTrip={(n, d) => handleCreateNewTrip(n, d, 'USD', ['Alice', 'Bob'])} onDeleteTrip={(id) => { setTrips((prev) => prev.filter((t) => t.id !== id)); if (activeTrip.id === id) { const remaining = trips.filter((t) => t.id !== id); setActiveTripId(remaining[0]?.id || null); } }} />
    </div>
  );
}
