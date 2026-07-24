import React from 'react';
import type { Member } from '../../types';
import { Search, Filter } from 'lucide-react';

interface ExpenseFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  selectedMember: string;
  onMemberChange: (memId: string) => void;
  members: Member[];
}

export const ExpenseFilters: React.FC<ExpenseFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedMember,
  onMemberChange,
  members,
}) => {
  const categories: { value: string; label: string }[] = [
    { value: 'all', label: 'All Categories' },
    { value: 'food', label: 'Food & Dining 🍽️' },
    { value: 'gas', label: 'Fuel / Gas ⛽' },
    { value: 'lodging', label: 'Lodging / Airbnb 🏡' },
    { value: 'groceries', label: 'Groceries (Bónus/Krónan) 🛒' },
    { value: 'activities', label: 'Tours & Excursions 🌋' },
    { value: 'transport', label: 'Car & Transport 🚗' },
    { value: 'other', label: 'Other 💳' },
  ];

  return (
    <div className="expense-filters-bar glass-card">
      <div className="search-input-wrapper">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          placeholder="Search expenses, vendors, notes..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="filter-dropdowns">
        <div className="dropdown-wrapper">
          <Filter size={14} className="dropdown-icon" />
          <select value={selectedCategory} onChange={(e) => onCategoryChange(e.target.value)} className="select-input">
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="dropdown-wrapper">
          <select value={selectedMember} onChange={(e) => onMemberChange(e.target.value)} className="select-input">
            <option value="all">Paid by: Anyone</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                Paid by: {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
