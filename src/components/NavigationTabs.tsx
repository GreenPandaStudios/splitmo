import React from 'react';
import { BookOpen, PieChart, Sliders } from 'lucide-react';

export type TabType = 'ledger' | 'balances' | 'settings';

interface NavigationTabsProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: 'ledger', label: 'Ledger', icon: BookOpen },
    { id: 'balances', label: 'Balances', icon: PieChart },
    { id: 'settings', label: 'Settings', icon: Sliders },
  ];

  return (
    <nav className="nav-tabs-container">
      <div className="nav-tabs-track">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              className={`nav-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTab(t.id)}
            >
              <Icon size={16} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
