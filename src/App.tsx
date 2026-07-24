import { useState, useEffect, useMemo } from 'react';
import type { TripGroup, CurrencyCode, Expense, DebtSettlement } from './types';
import {
  loadAllTrips, saveAllTrips, loadActiveTripId, saveActiveTripId,
  fetchLiveIskRate, calculateMemberBalances, simplifyDebts,
  subscribeToTripSupabase, syncTripToSupabase,
} from './services';
import type { TabType } from './components';
import {
  Header, NavigationTabs, SummaryCards, MemberBalances,
  SettlementList, ExpenseFilters, ExpenseList, AddExpenseModal,
  ReceiptOcrModal, SplitwiseImportModal, SettingsModal, TripManagerModal,
} from './components';

export default function App() {
  const [trips, setTrips] = useState<TripGroup[]>(loadAllTrips);
  const [activeTripId, setActiveTripId] = useState<string>(loadActiveTripId);
  const [displayCurrency, setDisplayCurrency] = useState<CurrencyCode>('USD');
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isTripManagerOpen, setIsTripManagerOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMember, setSelectedMember] = useState('all');
  const [ocrInitialData, setOcrInitialData] = useState<Partial<Expense> | undefined>(undefined);

  const trip = useMemo(() => trips.find((t) => t.id === activeTripId) || trips[0], [trips, activeTripId]);
  const iskRate = trip.customIskToUsdRate || 138.5;
  const isSbActive = Boolean(trip.supabaseConfig?.url && trip.supabaseConfig?.anonKey);

  useEffect(() => {
    saveAllTrips(trips);
    saveActiveTripId(activeTripId);
    if (trip.supabaseConfig?.url) syncTripToSupabase(trip.supabaseConfig, trip);
  }, [trips, activeTripId, trip]);

  useEffect(() => {
    if (trip.supabaseConfig?.url) {
      const unsub = subscribeToTripSupabase(trip.supabaseConfig, trip.id, (remoteTrip: TripGroup) => {
        setTrips((prev) => prev.map((t) => (t.id === remoteTrip.id ? remoteTrip : t)));
      });
      return () => { if (unsub) unsub(); };
    }
  }, [trip.supabaseConfig, trip.id]);

  const updateCurrentTrip = (updater: (prevTrip: TripGroup) => TripGroup) => {
    setTrips((prevTrips) => prevTrips.map((t) => (t.id === activeTripId ? updater(t) : t)));
  };

  const handleRefreshRate = async () => {
    const liveRate = await fetchLiveIskRate();
    updateCurrentTrip((t) => ({ ...t, customIskToUsdRate: liveRate }));
  };

  const handleSaveExpense = (newExp: Expense) => {
    updateCurrentTrip((t) => ({ ...t, expenses: [newExp, ...t.expenses] }));
    setActiveTab('expenses'); setOcrInitialData(undefined);
  };

  const handleRecordSettlement = (s: DebtSettlement) => {
    handleSaveExpense({
      id: `set_${Date.now()}`, title: `Settlement: ${s.fromMemberName} → ${s.toMemberName}`,
      amount: s.amountISK, currency: 'ISK', amountInISK: s.amountISK, amountInUSD: s.amountUSD,
      exchangeRateUsed: iskRate, paidByMemberId: s.fromMemberId, date: new Date().toISOString().split('T')[0],
      category: 'other', splitType: 'exact', splits: [{ memberId: s.toMemberId, amount: s.amountISK }],
      createdAt: new Date().toISOString(),
    });
  };

  const memberBalances = useMemo(() => calculateMemberBalances(trip.members, trip.expenses, iskRate), [trip, iskRate]);
  const debtSettlements = useMemo(() => simplifyDebts(memberBalances, iskRate), [memberBalances, iskRate]);
  const filteredExpenses = useMemo(() => trip.expenses.filter((e: Expense) => e.title.toLowerCase().includes(searchQuery.toLowerCase()) && (selectedCategory === 'all' || e.category === selectedCategory) && (selectedMember === 'all' || e.paidByMemberId === selectedMember)), [trip.expenses, searchQuery, selectedCategory, selectedMember]);

  return (
    <div className="app-shell">
      <Header tripName={trip.name} displayCurrency={displayCurrency} onToggleCurrency={() => setDisplayCurrency((prev) => (prev === 'USD' ? 'ISK' : 'USD'))} iskRate={iskRate} onRefreshRate={handleRefreshRate} isDbActive={isSbActive} dbTypeName={isSbActive ? 'Supabase Live ⚡' : 'Local DB'} onOpenTripManager={() => setIsTripManagerOpen(true)} />
      <NavigationTabs activeTab={activeTab} onSelectTab={(tab) => { if (tab === 'add') setOcrInitialData(undefined); setActiveTab(tab); }} expenseCount={trip.expenses.length} />

      <main className="app-main-content">
        {activeTab === 'overview' && (
          <div className="view-stack">
            <SummaryCards expenses={trip.expenses} memberCount={trip.members.length} settlementCount={debtSettlements.length} displayCurrency={displayCurrency} iskRate={iskRate} />
            <div className="dual-column-grid">
              <MemberBalances balances={memberBalances} displayCurrency={displayCurrency} />
              <SettlementList settlements={debtSettlements} displayCurrency={displayCurrency} onRecordSettlement={handleRecordSettlement} />
            </div>
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="view-stack">
            <ExpenseFilters searchQuery={searchQuery} onSearchChange={setSearchQuery} selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} selectedMember={selectedMember} onMemberChange={setSelectedMember} members={trip.members} />
            <ExpenseList expenses={filteredExpenses} members={trip.members} displayCurrency={displayCurrency} iskRate={iskRate} onDeleteExpense={(id) => updateCurrentTrip((t) => ({ ...t, expenses: t.expenses.filter((e) => e.id !== id) }))} />
          </div>
        )}
      </main>

      <AddExpenseModal isOpen={activeTab === 'add'} onClose={() => setActiveTab('overview')} onSaveExpense={handleSaveExpense} members={trip.members} iskRate={iskRate} initialData={ocrInitialData} />
      <ReceiptOcrModal isOpen={activeTab === 'ocr'} onClose={() => setActiveTab('overview')} members={trip.members} onReceiptScanned={(data) => { setOcrInitialData(data); setActiveTab('add'); }} />
      <SplitwiseImportModal isOpen={activeTab === 'import'} onClose={() => setActiveTab('overview')} existingMembers={trip.members} iskRate={iskRate} onImportComplete={(res) => { updateCurrentTrip((t) => ({ ...t, members: res.members, expenses: [...res.expenses, ...t.expenses] })); setActiveTab('expenses'); }} />
      <SettingsModal isOpen={activeTab === 'settings'} onClose={() => setActiveTab('overview')} trip={trip} onUpdateIskRate={(rate) => updateCurrentTrip((t) => ({ ...t, customIskToUsdRate: rate }))} onAddMember={(name) => updateCurrentTrip((t) => ({ ...t, members: [...t.members, { id: `m_${Date.now()}`, name }] }))} onUpdateSupabaseConfig={(cfg) => updateCurrentTrip((t) => ({ ...t, supabaseConfig: cfg }))} onResetTrip={() => updateCurrentTrip((t) => ({ ...t, expenses: [] }))} />
      <TripManagerModal isOpen={isTripManagerOpen} onClose={() => setIsTripManagerOpen(false)} trips={trips} activeTripId={activeTripId} onSelectTrip={setActiveTripId} onCreateTrip={(name, desc) => { const newT: TripGroup = { ...trip, id: `trip_${Date.now()}`, name, description: desc, expenses: [] }; setTrips((prev) => [...prev, newT]); setActiveTripId(newT.id); }} onDeleteTrip={(id) => { setTrips((prev) => prev.filter((t) => t.id !== id)); if (activeTripId === id) setActiveTripId(trips[0].id); }} />
    </div>
  );
}
