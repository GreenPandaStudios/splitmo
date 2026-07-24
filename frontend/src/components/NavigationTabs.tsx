import React from 'react';
import { LayoutDashboard, Receipt, PlusCircle, ScanLine, FileSpreadsheet, Settings } from 'lucide-react';

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
  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: LayoutDashboard },
    { id: 'expenses' as TabType, label: `Expenses (${expenseCount})`, icon: Receipt },
    { id: 'add' as TabType, label: 'Add Expense', icon: PlusCircle, highlight: true },
    { id: 'ocr' as TabType, label: 'Receipt OCR', icon: ScanLine },
    { id: 'import' as TabType, label: 'Import Splitwise', icon: FileSpreadsheet },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="nav-tabs-container">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            className={`nav-tab-btn ${isActive ? 'active' : ''} ${tab.highlight ? 'highlight-btn' : ''}`}
            onClick={() => onSelectTab(tab.id)}
          >
            <Icon size={18} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
