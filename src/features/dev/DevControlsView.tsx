import React, { useState } from 'react';
import { useGameStore } from '../../state/gameStore';
import { useDecisionStore } from '../../state/decisionStore';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency } from '../../utils/rounding';

export const DevControlsView: React.FC = () => {
  const { game, setGame, executeQuarter, startNewGame } = useGameStore();
  const { draftDecisions } = useDecisionStore();
  const [cashAmount, setCashAmount] = useState(50000);
  const [gdpChange, setGdpChange] = useState(5);

  const isDev = import.meta.env.DEV || true; // Active in development mode

  const handleAddCash = () => {
    const updated = {
      ...game,
      player: {
        ...game.player,
        cash: game.player.cash + cashAmount,
      },
    };
    setGame(updated);
  };

  const handleForceBreakdown = () => {
    const updated = {
      ...game,
      player: {
        ...game.player,
        machines: game.player.machines.map((m, idx) =>
          idx === 0 ? { ...m, efficiency: 0.75, breakdownHoursLastQuarter: 45 } : m
        ),
      },
    };
    setGame(updated);
  };

  const handleForceMajorBreakthrough = () => {
    const updated = {
      ...game,
      player: {
        ...game.player,
        products: game.player.products.map((p, idx) =>
          idx === 0 ? { ...p, pendingMajorImprovementAvailable: true, developmentOutcome: 'MAJOR' as const } : p
        ),
      },
    };
    setGame(updated);
  };

  const handleAdjustEconomy = (mode: 'growth' | 'decline' | 'static') => {
    const updated = {
      ...game,
      economy: {
        ...game.economy,
        mode,
        gdpIndex: game.economy.gdpIndex + gdpChange,
      },
    };
    setGame(updated);
  };

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-xl border border-amber-800/80 bg-amber-950/20">
        <div className="flex items-center gap-2">
          <span className="text-xl">🛠️</span>
          <h2 className="text-lg font-bold text-amber-200">Developer Simulation & Diagnostics Suite</h2>
          <Badge variant="amber">Debug Mode</Badge>
        </div>
        <p className="text-xs text-amber-300/80 mt-1">
          Direct engine inspection, parameter inspection, and manual state intervention controls.
        </p>
      </div>

      {/* State Inspector Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-900/80">
          <span className="text-slate-400">Deterministic Seed:</span>
          <div className="text-base font-bold text-white mt-1">#{game.seed}</div>
        </div>

        <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-900/80">
          <span className="text-slate-400">Current Period:</span>
          <div className="text-base font-bold text-white mt-1">Y{game.year} Q{game.quarter}</div>
        </div>

        <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-900/80">
          <span className="text-slate-400">Macro Economy:</span>
          <div className="text-base font-bold text-indigo-300 mt-1">
            GDP {game.economy.gdpIndex.toFixed(1)} ({game.economy.mode})
          </div>
        </div>

        <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-900/80">
          <span className="text-slate-400">Share Price:</span>
          <div className="text-base font-bold text-emerald-400 mt-1">${game.player.sharePrice.toFixed(2)}</div>
        </div>
      </div>

      {/* Intervention Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* State Manipulations */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/70 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Direct State Interventions</h3>

          {/* Add Cash */}
          <div className="space-y-1.5 pb-3 border-b border-slate-800">
            <span className="font-semibold text-slate-300">Add Cash to Treasury:</span>
            <div className="flex gap-2">
              <input
                type="number"
                step="10000"
                value={cashAmount}
                onChange={(e) => setCashAmount(parseInt(e.target.value) || 0)}
                className="w-32 bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-white font-semibold focus:outline-none focus:border-indigo-500"
              />
              <Button size="sm" variant="success" onClick={handleAddCash}>
                Inject Cash
              </Button>
            </div>
          </div>

          {/* Force Breakthrough */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <div className="font-semibold text-white">Force R&D Major Breakthrough</div>
              <div className="text-[11px] text-slate-400">Triggers major breakthrough on Product 1</div>
            </div>
            <Button size="sm" variant="primary" onClick={handleForceMajorBreakthrough}>
              Trigger Breakthrough
            </Button>
          </div>

          {/* Force Breakdown */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <div className="font-semibold text-white">Force Severe Machine Breakdown</div>
              <div className="text-[11px] text-slate-400">Sets 45 breakdown hours on Machine 1</div>
            </div>
            <Button size="sm" variant="danger" onClick={handleForceBreakdown}>
              Breakdown Machine
            </Button>
          </div>

          {/* Economy Mode */}
          <div className="space-y-1.5">
            <span className="font-semibold text-slate-300">Set Economic Climate:</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleAdjustEconomy('growth')}>
                Boom / Growth
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleAdjustEconomy('static')}>
                Static
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleAdjustEconomy('decline')}>
                Recession
              </Button>
            </div>
          </div>
        </div>

        {/* Engine Lifecycle Controls */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/70 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Engine Lifecycle</h3>

          <div className="space-y-3">
            <div>
              <div className="font-semibold text-white mb-1">Fast-Forward Run Quarter:</div>
              <Button size="sm" variant="primary" onClick={() => executeQuarter(draftDecisions)}>
                Execute Step Immediately
              </Button>
            </div>

            <div className="pt-3 border-t border-slate-800">
              <div className="font-semibold text-white mb-1">Reset Game State:</div>
              <Button size="sm" variant="secondary" onClick={() => startNewGame()}>
                Restart Game from Scratch
              </Button>
            </div>

            <div className="pt-3 border-t border-slate-800">
              <div className="font-semibold text-white mb-1">Raw State Export:</div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const stateJson = JSON.stringify(game, null, 2);
                  navigator.clipboard.writeText(stateJson);
                  alert('Complete GameState JSON copied to clipboard!');
                }}
              >
                Copy GameState JSON
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
