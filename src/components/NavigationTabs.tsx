import React from 'react';
import { LayoutDashboard, Receipt, PlusCircle, Scan, FileSpreadsheet, Settings } from 'lucide-react';

export type TabType = 'overview' | 'expenses' | 'add' | 'ocr' | 'import' | 'settings';

interface NavigationTabsProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  expenseCount: number;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onSelectTab,
  expenseCount,
}) => {
  const tabs: { id: TabType; label: string; icon: React.ElementType; badge?: number; highlight?: boolean }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'expenses', label: 'Expenses', icon: Receipt, badge: expenseCount },
    { id: 'add', label: 'Add', icon: PlusCircle, highlight: true },
    { id: 'ocr', label: 'OCR Scan', icon: Scan },
    { id: 'import', label: 'Import CSV', icon: FileSpreadsheet },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="nav-tabs-container glass-card">
      {tabs.map((t) => {
        const Icon = t.icon;
        const isActive = activeTab === t.id;
        return (
          <button
            key={t.id}
            className={`nav-tab-btn ${isActive ? 'active' : ''} ${t.highlight ? 'highlight-btn' : ''}`}
            onClick={() => onSelectTab(t.id)}
          >
            <Icon size={16} />
            <span>{t.label}</span>
            {t.badge !== undefined && t.badge > 0 && (
              <span className="tab-badge">{t.badge}</span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
