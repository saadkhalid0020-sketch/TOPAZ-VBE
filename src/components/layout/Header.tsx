import React, { useState } from 'react';
import { useGameStore } from '../../state/gameStore';
import { useDecisionStore } from '../../state/decisionStore';
import { selectDashboardMetrics } from '../../state/selectors';
import { formatCurrency, formatCurrencyDecimals } from '../../utils/rounding';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { gameRepository } from '../../persistence/gameRepository';
import { SavedGameRecord } from '../../persistence/database';

export const Header: React.FC = () => {
  const { game, startNewGame, saveCurrentGame, loadGame, setGame, activeTab, setActiveTab } = useGameStore();
  const { validationResult } = useDecisionStore();
  const metrics = selectDashboardMetrics(game);

  const [isNewGameOpen, setIsNewGameOpen] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('Aura Manufacturing Corp');
  const [newSeed, setNewSeed] = useState(Math.floor(Math.random() * 900000 + 100000).toString());

  const [isLoadGameOpen, setIsLoadGameOpen] = useState(false);
  const [savedGamesList, setSavedGamesList] = useState<SavedGameRecord[]>([]);

  const handleOpenLoadModal = async () => {
    const list = await gameRepository.listGames();
    setSavedGamesList(list);
    setIsLoadGameOpen(true);
  };

  const handleExportJson = () => {
    const jsonStr = gameRepository.exportGameToJson(game);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `topaz-game-${game.name.replace(/\s+/g, '_')}-Y${game.year}Q${game.quarter}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const content = evt.target?.result as string;
        const imported = gameRepository.importGameFromJson(content);
        await gameRepository.saveGame(imported);
        setGame(imported);
      } catch (err: any) {
        alert('Failed to import game: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md px-4 py-3 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Branding & Year/Quarter */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-white text-base shadow-sm shadow-indigo-500/50">
              T
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-white">{game.player.name}</h1>
                <Badge variant="indigo" size="sm">Topaz-VBE Engine</Badge>
              </div>
              <div className="text-xs text-slate-400">
                Quarterly Business Simulation • Seed #{game.seed}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
            <span className="text-xs uppercase font-semibold text-slate-400">Period:</span>
            <span className="text-sm font-bold text-indigo-300">
              Year {game.year} • Q{game.quarter}
            </span>
          </div>
        </div>

        {/* Center: Live Key Financial Bar */}
        <div className="flex items-center gap-4 text-xs bg-slate-950/60 px-4 py-2 rounded-xl border border-slate-800 w-full md:w-auto justify-around">
          <div>
            <div className="text-slate-400 font-medium">Share Price</div>
            <div className="text-sm font-bold text-white flex items-center gap-1">
              ${formatCurrencyDecimals(metrics.sharePrice)}
              {metrics.sharePriceDelta !== 0 && (
                <span className={`text-[10px] font-semibold ${metrics.sharePriceDelta > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {metrics.sharePriceDelta > 0 ? '▲' : '▼'}{Math.abs(metrics.sharePriceDelta).toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800" />

          <div>
            <div className="text-slate-400 font-medium">Cash Position</div>
            <div className={`text-sm font-bold ${metrics.cash > 25000 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {formatCurrency(metrics.cash)}
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800" />

          <div>
            <div className="text-slate-400 font-medium">Total Borrowing</div>
            <div className={`text-sm font-bold ${metrics.totalDebt > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
              {formatCurrency(metrics.totalDebt)}
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800" />

          <div>
            <div className="text-slate-400 font-medium">Net Worth</div>
            <div className="text-sm font-bold text-indigo-300">
              {formatCurrency(metrics.netWorth)}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsNewGameOpen(true)}
          >
            New Game
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => saveCurrentGame()}
          >
            Save
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleOpenLoadModal}
          >
            Load
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleExportJson}
            title="Export state as JSON file"
          >
            Export
          </Button>

          <label className="cursor-pointer inline-flex items-center justify-center font-medium rounded-lg text-xs px-2.5 py-1.5 bg-transparent hover:bg-slate-800 text-slate-300 border border-slate-700 transition-all">
            Import
            <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
          </label>

          <Button
            size="sm"
            variant="primary"
            onClick={() => setActiveTab('decisions')}
            className="font-bold relative"
          >
            Review & Run
            {!validationResult.isValid && (
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-rose-500 animate-ping" />
            )}
          </Button>
        </div>
      </div>

      {/* New Game Modal */}
      <Modal
        isOpen={isNewGameOpen}
        onClose={() => setIsNewGameOpen(false)}
        title="Start New Business Simulation"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsNewGameOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              size="sm"
              onClick={async () => {
                await startNewGame({
                  companyName: newCompanyName,
                  seed: parseInt(newSeed) || 123456,
                });
                setIsNewGameOpen(false);
              }}
            >
              Start Game
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Company Name</label>
            <input
              type="text"
              value={newCompanyName}
              onChange={(e) => setNewCompanyName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Simulation Seed (Deterministic PRNG)</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={newSeed}
                onChange={(e) => setNewSeed(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
              <Button
                size="sm"
                variant="secondary"
                type="button"
                onClick={() => setNewSeed(Math.floor(Math.random() * 900000 + 100000).toString())}
              >
                Randomize
              </Button>
            </div>
            <p className="mt-1 text-xs text-slate-400">Identical seed + decisions guarantees 100% reproducible results.</p>
          </div>
        </div>
      </Modal>

      {/* Load Game Modal */}
      <Modal
        isOpen={isLoadGameOpen}
        onClose={() => setIsLoadGameOpen(false)}
        title="Load Saved Simulation"
      >
        {savedGamesList.length === 0 ? (
          <p className="text-slate-400 text-center py-6">No saved games found in browser database.</p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {savedGamesList.map((g) => (
              <div
                key={g.id}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-950/60 hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="font-semibold text-white">{g.name}</div>
                  <div className="text-xs text-slate-400">
                    Year {g.year} Q{g.quarter} • Share Price: ${g.sharePrice.toFixed(2)} • Saved: {new Date(g.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={async () => {
                      await loadGame(g.id);
                      setIsLoadGameOpen(false);
                    }}
                  >
                    Load
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={async () => {
                      await gameRepository.deleteGame(g.id);
                      setSavedGamesList(savedGamesList.filter((item) => item.id !== g.id));
                    }}
                  >
                    ✕
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </header>
  );
};
