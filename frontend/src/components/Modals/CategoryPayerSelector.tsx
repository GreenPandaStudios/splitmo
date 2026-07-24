import React from 'react';
import type { Member, ExpenseCategory } from '../../types';

interface CategoryPayerSelectorProps {
  paidBy: string;
  onPaidByChange: (id: string) => void;
  category: ExpenseCategory;
  onCategoryChange: (cat: ExpenseCategory) => void;
  members: Member[];
}

export const CategoryPayerSelector: React.FC<CategoryPayerSelectorProps> = ({
  paidBy,
  onPaidByChange,
  category,
  onCategoryChange,
  members,
}) => {
  return (
    <div className="form-row">
      <div className="form-group flex-1">
        <label className="input-label">Paid By</label>
        <select value={paidBy} onChange={(e) => onPaidByChange(e.target.value)} className="select-input">
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group flex-1">
        <label className="input-label">Category</label>
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value as ExpenseCategory)}
          className="select-input"
        >
          <option value="food">Food & Dining 🍽️</option>
          <option value="gas">Fuel / Gas ⛽</option>
          <option value="lodging">Lodging 🏡</option>
          <option value="groceries">Groceries 🛒</option>
          <option value="activities">Tours / Excursions 🌋</option>
          <option value="transport">Transport 🚗</option>
          <option value="other">Other 💳</option>
        </select>
      </div>
    </div>
  );
};
