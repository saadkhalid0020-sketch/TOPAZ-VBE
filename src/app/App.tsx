import React, { useEffect, useState } from 'react';
import { useGameStore } from '../state/gameStore';
import { useDecisionStore } from '../state/decisionStore';
import { Header } from '../components/layout/Header';
import { Navbar } from '../components/layout/Navbar';
import { AlertsBanner } from '../components/layout/AlertsBanner';
import { DashboardView } from '../features/dashboard/DashboardView';
import { MarketingView } from '../features/marketing/MarketingView';
import { OperationsView } from '../features/operations/OperationsView';
import { PersonnelView } from '../features/personnel/PersonnelView';
import { FinanceView } from '../features/finance/FinanceView';
import { IntelligenceView } from '../features/intelligence/IntelligenceView';
import { DecisionsReviewView } from '../features/decisions/DecisionsReviewView';
import { ReportsView } from '../features/reports/ReportsView';
import { HistoryView } from '../features/history/HistoryView';
import { DevControlsView } from '../features/dev/DevControlsView';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { AlertTriangle, GraduationCap } from 'lucide-react';

export const App: React.FC = () => {
  const { game, activeTab } = useGameStore();
  const { initializeDraft } = useDecisionStore();
  const [showLaunchNotice, setShowLaunchNotice] = useState<boolean>(true);

  // Initialize draft decisions when quarter advances or game changes
  useEffect(() => {
    initializeDraft(game.player, game.quarter);
  }, [game.year, game.quarter, game.id]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      <Header />
      <Navbar />
      <AlertsBanner />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'marketing' && <MarketingView />}
        {activeTab === 'operations' && <OperationsView />}
        {activeTab === 'personnel' && <PersonnelView />}
        {activeTab === 'finance' && <FinanceView />}
        {activeTab === 'intelligence' && <IntelligenceView />}
        {activeTab === 'decisions' && <DecisionsReviewView />}
        {activeTab === 'reports' && <ReportsView />}
        {activeTab === 'history' && <HistoryView />}
        {activeTab === 'dev' && <DevControlsView />}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-5 px-4 text-center text-xs text-slate-400">
        <p className="font-medium text-slate-300">
          This is a university semester project and does not have any direct relation with Topaz-Vbe.
        </p>
        <p className="mt-1 text-slate-400">
          Student Name: <span className="text-slate-300 font-semibold">Saad Khalid</span> (BAF Student) • Educational academic project — legal to publish.
        </p>
        <div className="mt-2 flex items-center justify-center gap-3 text-[11px] text-slate-400">
          <span>Browser-Only Offline Persistence via IndexedDB</span>
          <span>•</span>
          <button
            onClick={() => setShowLaunchNotice(true)}
            className="text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors cursor-pointer"
          >
            COMSATS Academic Disclaimer
          </button>
        </div>
      </footer>

      {/* Launch Popup Notice Modal */}
      <Modal
        isOpen={showLaunchNotice}
        onClose={() => setShowLaunchNotice(false)}
        title="Notice: Academic Project Only"
        maxWidth="lg"
        footer={
          <Button
            variant="primary"
            size="md"
            onClick={() => setShowLaunchNotice(false)}
            className="w-full sm:w-auto font-semibold px-6 bg-amber-600 hover:bg-amber-500 text-white border-0"
          >
            I Understand — Proceed
          </Button>
        }
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-amber-200 flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-base font-bold text-amber-300 uppercase tracking-wide">
                DO NOT USE IT
              </h4>
              <p className="text-sm font-semibold text-amber-100 mt-1">
                It is only intended for a graded assignment at COMSATS.
              </p>
            </div>
          </div>

          <div className="space-y-2 text-slate-300 text-sm leading-relaxed">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <GraduationCap className="h-4 w-4 text-indigo-400" />
              Project Details & Attribution
            </div>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-300">
              <li>
                <strong className="text-white">Institution:</strong> COMSATS University
              </li>
              <li>
                <strong className="text-white">Student:</strong> Saad Khalid (BAF Student)
              </li>
              <li>
                <strong className="text-white">Nature of Project:</strong> University semester project and graded assignment only.
              </li>
              <li>
                <strong className="text-white">No Affiliation:</strong> Does not have any direct relation with Topaz-Vbe. Academic educational project — legal to publish.
              </li>
              <li>
                <strong className="text-white">Intended Use:</strong> Strictly for academic demonstration and grading purposes. Do not use for real commercial, industrial, or production purposes.
              </li>
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default App;
