import type { ExpenseCategory } from '../../types';

interface CategoryMeta {
  /** Three-letter stamp shown on the ledger row. */
  abbr: string;
  /** OKLCH hue used for the stamp's ink. */
  hue: number;
  label: string;
}

const CATEGORY_META: Record<ExpenseCategory, CategoryMeta> = {
  gas: { abbr: 'GAS', hue: 35, label: 'Gas' },
  transport: { abbr: 'TRN', hue: 70, label: 'Transport' },
  food: { abbr: 'EAT', hue: 150, label: 'Food' },
  activities: { abbr: 'ACT', hue: 200, label: 'Activities' },
  lodging: { abbr: 'LDG', hue: 300, label: 'Lodging' },
  groceries: { abbr: 'GRO', hue: 110, label: 'Groceries' },
  other: { abbr: 'OTH', hue: 75, label: 'Other' },
};

export function categoryMeta(category: string): CategoryMeta {
  return CATEGORY_META[category as ExpenseCategory] || CATEGORY_META.other;
}

export function categoryColor(hue: number): string {
  return `oklch(52% 0.13 ${hue})`;
}

export const CATEGORY_OPTIONS = (Object.keys(CATEGORY_META) as ExpenseCategory[]).map((value) => ({
  value,
  label: CATEGORY_META[value].label,
}));
