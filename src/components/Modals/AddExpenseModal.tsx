import React, { useState } from 'react';
import type { Expense, Member, CurrencyCode, ExpenseCategory, SplitType, SplitShare } from '../../types';
import { CURRENCY_LIST, convertCurrency } from '../../services';
import { SplitSelector } from './SplitSelector';
import { CategoryPayerSelector } from './CategoryPayerSelector';
import { Plus, X } from 'lucide-react';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveExpense: (expense: Expense) => void;
  members: Member[];
  customRates?: Record<string, number>;
  initialData?: Partial<Expense>;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen, onClose, onSaveExpense, members, customRates, initialData,
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [amount, setAmount] = useState<string>(initialData?.amount?.toString() || '');
  const [currency, setCurrency] = useState<CurrencyCode>(initialData?.currency || 'USD');
  const [paidBy, setPaidBy] = useState<string>(initialData?.paidByMemberId || members[0]?.id || '');
  const [category, setCategory] = useState<ExpenseCategory>(initialData?.category || 'food');
  const [splitType, setSplitType] = useState<SplitType>(initialData?.splitType || 'equal');
  const [splits, setSplits] = useState<SplitShare[]>(initialData?.splits || members.map((m) => ({ memberId: m.id, amount: 0 })));

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!title || isNaN(numAmount) || numAmount <= 0 || !paidBy) return;

    const finalSplits = splitType === 'equal'
      ? members.map((m) => ({ memberId: m.id, amount: Math.round((numAmount / (members.length || 1)) * 100) / 100 }))
      : splits;

    const newExpense: Expense = {
      id: initialData?.id || `exp_${Date.now()}`,
      title, amount: numAmount, currency,
      amountInISK: convertCurrency(numAmount, currency, 'ISK', customRates),
      amountInUSD: convertCurrency(numAmount, currency, 'USD', customRates),
      exchangeRateUsed: customRates?.[currency] || 1, paidByMemberId: paidBy,
      date: initialData?.date || new Date().toISOString().split('T')[0],
      category, splitType, splits: finalSplits,
      createdAt: new Date().toISOString(),
    };

    onSaveExpense(newExpense);
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content glass-card slide-up">
        <div className="modal-header">
          <h2>{initialData?.id ? 'Edit Expense' : 'Add New Expense 💳'}</h2>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="input-label">Description / Vendor</label>
            <input type="text" required placeholder="e.g. Hotel, Fuel, Dinner" value={title} onChange={(e) => setTitle(e.target.value)} className="text-input" />
          </div>

          <div className="form-row">
            <div className="form-group flex-2">
              <label className="input-label">Amount</label>
              <input type="number" step="any" required placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="text-input" />
            </div>

            <div className="form-group flex-1">
              <label className="input-label">Currency</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value as CurrencyCode)} className="select-input">
                {CURRENCY_LIST.map((c) => (
                  <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                ))}
              </select>
            </div>
          </div>

          <CategoryPayerSelector paidBy={paidBy} onPaidByChange={setPaidBy} category={category} onCategoryChange={setCategory} members={members} />
          <SplitSelector splitType={splitType} onSplitTypeChange={setSplitType} members={members} splits={splits} onUpdateSplit={(mId, val) => setSplits((prev) => prev.map((s) => (s.memberId === mId ? { ...s, amount: val } : s)))} totalAmount={parseFloat(amount) || 0} currency={currency} />

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary"><Plus size={16} /> Save Expense</button>
          </div>
        </form>
      </div>
    </div>
  );
};
