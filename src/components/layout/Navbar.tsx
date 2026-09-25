import React from 'react';
import { useGameStore } from '../../state/gameStore';
import { useDecisionStore } from '../../state/decisionStore';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab } = useGameStore();
  const { validationResult } = useDecisionStore();

  const tabs: Array<{ id: typeof activeTab; label: string; count?: number; hasError?: boolean; isHighlight?: boolean }> = [
    { id: 'dashboard', label: '1. Executive Dashboard' },
    { id: 'marketing', label: '2. Marketing & R&D' },
    { id: 'operations', label: '3. Operations & Factory' },
    { id: 'personnel', label: '4. Personnel & Wages' },
    { id: 'finance', label: '5. Treasury & Finance' },
    { id: 'intelligence', label: '6. Intelligence' },
    {
      id: 'decisions',
      label: '7. Review Decisions',
      hasError: !validationResult.isValid,
      count: validationResult.errors.length + validationResult.warnings.length,
      isHighlight: true,
    },
    { id: 'reports', label: 'Quarterly Reports' },
    { id: 'history', label: 'Historical Trends' },
    { id: 'dev', label: 'Dev Controls' },
  ];

  return (
    <nav className="border-b border-slate-800 bg-slate-900/60 overflow-x-auto scrollbar-none">
      <div className="max-w-7xl mx-auto flex items-center px-4 space-x-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap py-3 px-3.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                isActive
                  ? 'border-indigo-500 text-white bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              } ${tab.isHighlight && !isActive ? 'text-indigo-300 font-bold' : ''}`}
            >
              <span>{tab.label}</span>
              {tab.hasError && (
                <span className="h-2 w-2 rounded-full bg-rose-500 ring-2 ring-rose-500/20" />
              )}
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    tab.hasError ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
