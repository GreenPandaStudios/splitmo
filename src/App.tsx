import { useState } from 'react';
import type { CurrencyCode, Expense, TripGroup } from './types';
import { fetchLiveRates, buildSettlementExpense } from './services';
import { useTripStore, useToast, useTripBalances } from './hooks';
import type { TabType, ModalKind } from './components';
import { Header, NavigationTabs, TabContent, ModalStack, OnboardingScreen, Toast, InstallBanner } from './components';

export default function App() {
  const store = useTripStore();
  const { toast, showToast } = useToast();
  const { activeTrip } = store;

  const [displayCurrency, setDisplayCurrency] = useState<CurrencyCode>('USD');
  const [activeTab, setActiveTab] = useState<TabType>('ledger');
  const [isTripManagerOpen, setIsTripManagerOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalKind>(null);
  const [expenseDraft, setExpenseDraft] = useState<Partial<Expense> | undefined>(undefined);

  const balances = useTripBalances(activeTrip, displayCurrency, store.currentMemberId);

  const handleCreateTrip = (name: string, description: string, homeCurrency: CurrencyCode, members: string[]) => {
    const trip = store.createTrip(name, description, homeCurrency, members);
    if (trip.currentMemberId) store.setCurrentMember(trip.currentMemberId, trip.id);
    setDisplayCurrency(homeCurrency);
    setActiveTab('ledger');
    setIsOnboardingOpen(false);
    showToast(`Started ${name}`);
  };

  const handleImportTrip = (importedTrip: TripGroup) => {
    store.importTrip(importedTrip);
    // The traveler chosen during import is this device's identity, not a shared setting.
    if (importedTrip.currentMemberId) store.setCurrentMember(importedTrip.currentMemberId, importedTrip.id);
    if (importedTrip.expenses[0]?.currency) setDisplayCurrency(importedTrip.expenses[0].currency);
    setActiveTab('ledger');
    setIsOnboardingOpen(false);
    showToast(`Imported ${importedTrip.expenses.length} entries`);
  };

  const handleSaveExpense = (expense: Expense, notice = 'Expense added') => {
    const isExisting = activeTrip.expenses.some((e) => e.id === expense.id);
    store.saveExpense(expense);
    setActiveModal(null);
    setExpenseDraft(undefined);
    showToast(isExisting ? 'Entry updated' : notice);
  };

  const handleOpenExpenseForm = (draft?: Partial<Expense>) => {
    setExpenseDraft(draft);
    setActiveModal('add');
  };

  const handleRefreshRates = async () => {
    const rates = await fetchLiveRates();
    store.updateCurrentTrip((t) => ({
      ...t,
      exchangeRates: { ...t.exchangeRates, rates, lastUpdated: new Date().toISOString() },
    }));
    showToast('Exchange rates updated');
  };

  if (store.isLoading) {
    return <div className="app-shell app-loading-screen">Opening ledger…</div>;
  }

  const hasNoTrips = store.trips.length === 0;
  if (hasNoTrips || isOnboardingOpen) {
    return (
      <div className="app-shell">
        <OnboardingScreen
          onCreateTrip={handleCreateTrip}
          onImportTrip={handleImportTrip}
          onCancel={hasNoTrips ? undefined : () => setIsOnboardingOpen(false)}
          currentTripName={activeTrip.name}
        />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Header
        tripName={activeTrip.name}
        displayCurrency={displayCurrency}
        onSelectCurrency={setDisplayCurrency}
        onOpenTripManager={() => setIsOnboardingOpen(true)}
        members={activeTrip.members}
        currentMemberId={store.currentMemberId}
        onSelectCurrentMember={(id) => store.setCurrentMember(id)}
      />

      <InstallBanner />

      <main className="app-main-content">
        <TabContent
          activeTab={activeTab}
          trip={activeTrip}
          tripCount={store.trips.length}
          displayCurrency={displayCurrency}
          rates={balances.rates}
          memberBalances={balances.memberBalances}
          settlements={balances.settlements}
          myNetBalance={balances.myNetBalance}
          myMemberName={balances.myMemberName}
          onAddExpense={() => handleOpenExpenseForm(undefined)}
          onScanOcr={() => setActiveModal('ocr')}
          onImportCsv={() => setActiveModal('import')}
          onSettleUp={() => setActiveTab('balances')}
          onEditExpense={handleOpenExpenseForm}
          onDeleteExpense={store.deleteExpense}
          onRecordSettlement={(s) => handleSaveExpense(
            buildSettlementExpense(s, displayCurrency),
            `${s.fromMemberName.split(' ')[0]} settled with ${s.toMemberName.split(' ')[0]}`
          )}
          onOpenTripManager={() => setIsTripManagerOpen(true)}
          onUpdateTrip={store.updateCurrentTrip}
          onRefreshRates={handleRefreshRates}
          onDeleteTrip={() => store.deleteTrip(activeTrip.id)}
          onNotify={showToast}
        />
      </main>

      <NavigationTabs activeTab={activeTab} onSelectTab={setActiveTab} />
      <Toast message={toast} />

      <ModalStack
        activeModal={activeModal}
        onCloseModal={() => { setActiveModal(null); setExpenseDraft(undefined); }}
        expenseDraft={expenseDraft}
        members={activeTrip.members}
        customRates={balances.rates}
        onSaveExpense={handleSaveExpense}
        onReceiptScanned={handleOpenExpenseForm}
        onImportTrip={handleImportTrip}
        isTripManagerOpen={isTripManagerOpen}
        onCloseTripManager={() => setIsTripManagerOpen(false)}
        trips={store.trips}
        activeTripId={activeTrip.id}
        onSelectTrip={store.setActiveTripId}
        onCreateTrip={(n, d) => handleCreateTrip(n, d, displayCurrency, ['Alice', 'Bob'])}
        onDeleteTrip={store.deleteTrip}
      />
    </div>
  );
}
