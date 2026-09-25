import React from 'react';
import { useGameStore } from '../../state/gameStore';
import { selectDashboardMetrics } from '../../state/selectors';

export const AlertsBanner: React.FC = () => {
  const { game, simulationError, dismissError } = useGameStore();
  const metrics = selectDashboardMetrics(game);

  if (!simulationError && metrics.alerts.length === 0) {
    return null;
  }

  const alertStyles = {
    danger: 'bg-rose-950/40 border-rose-800 text-rose-200',
    warning: 'bg-amber-950/40 border-amber-800 text-amber-200',
    info: 'bg-indigo-950/40 border-indigo-800 text-indigo-200',
    success: 'bg-emerald-950/40 border-emerald-800 text-emerald-200',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pt-4 space-y-2">
      {simulationError && (
        <div className="flex items-center justify-between p-3 rounded-lg border bg-rose-950/70 border-rose-700 text-rose-100 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="text-base">⚠️</span>
            <span>Simulation Error: {simulationError}</span>
          </div>
          <button onClick={dismissError} className="hover:text-white px-2 py-1">
            ✕
          </button>
        </div>
      )}

      {metrics.alerts.map((alert) => (
        <div
          key={alert.id}
          className={`flex items-center justify-between p-2.5 rounded-lg border text-xs font-medium ${alertStyles[alert.type]}`}
        >
          <div className="flex items-center gap-2">
            <span>{alert.type === 'danger' ? '🚨' : alert.type === 'warning' ? '⚠️' : '💡'}</span>
            <span>{alert.text}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
