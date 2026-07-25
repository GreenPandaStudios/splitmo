import React from 'react';
import type { Expense, Member, TripGroup } from '../../types';
import { AddExpenseModal } from './AddExpenseModal';
import { ReceiptOcrModal } from './ReceiptOcrModal';
import { SplitwiseImportModal } from './SplitwiseImportModal';
import { TripManagerModal } from './TripManagerModal';

export type ModalKind = 'add' | 'ocr' | 'import' | null;

interface ModalStackProps {
  activeModal: ModalKind;
  onCloseModal: () => void;
  /** Seeds the expense form: a full entry when editing, OCR fields when scanning. */
  expenseDraft?: Partial<Expense>;
  members: Member[];
  customRates?: Record<string, number>;
  onSaveExpense: (expense: Expense) => void;
  onReceiptScanned: (draft: Partial<Expense>) => void;
  onImportTrip: (trip: TripGroup) => void;
  isTripManagerOpen: boolean;
  onCloseTripManager: () => void;
  trips: TripGroup[];
  activeTripId: string;
  onSelectTrip: (id: string) => void;
  onCreateTrip: (name: string, description: string) => void;
  onDeleteTrip: (id: string) => void;
}

/** Every overlay the app can show, so App itself stays a thin orchestrator. */
export const ModalStack: React.FC<ModalStackProps> = ({
  activeModal, onCloseModal, expenseDraft, members, customRates,
  onSaveExpense, onReceiptScanned, onImportTrip,
  isTripManagerOpen, onCloseTripManager, trips, activeTripId,
  onSelectTrip, onCreateTrip, onDeleteTrip,
}) => (
  <>
    {activeModal === 'add' && (
      <AddExpenseModal
        key={expenseDraft?.id || 'new-expense'}
        isOpen
        onClose={onCloseModal}
        onSaveExpense={onSaveExpense}
        members={members}
        customRates={customRates}
        initialData={expenseDraft}
      />
    )}

    <ReceiptOcrModal
      isOpen={activeModal === 'ocr'}
      onClose={onCloseModal}
      onReceiptScanned={onReceiptScanned}
    />

    <SplitwiseImportModal
      isOpen={activeModal === 'import'}
      onClose={onCloseModal}
      customRates={customRates}
      onImportTripComplete={onImportTrip}
    />

    <TripManagerModal
      isOpen={isTripManagerOpen}
      onClose={onCloseTripManager}
      trips={trips}
      activeTripId={activeTripId}
      onSelectTrip={onSelectTrip}
      onCreateTrip={onCreateTrip}
      onDeleteTrip={onDeleteTrip}
    />
  </>
);
