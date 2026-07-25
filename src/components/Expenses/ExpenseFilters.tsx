import React from 'react';
import type { Member } from '../../types';
import { CATEGORY_OPTIONS } from './categoryMeta';

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
  return (
    <div className="expense-filters-bar">
      <input
        type="text"
        placeholder="Search expenses…"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="search-input"
      />

      <div className="filter-dropdowns">
        <select value={selectedCategory} onChange={(e) => onCategoryChange(e.target.value)} className="select-input">
          <option value="all">All categories</option>
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>

        <select value={selectedMember} onChange={(e) => onMemberChange(e.target.value)} className="select-input">
          <option value="all">Paid by anyone</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>Paid by {m.name.split(' ')[0]}</option>
          ))}
        </select>
      </div>
    </div>
  );
};
