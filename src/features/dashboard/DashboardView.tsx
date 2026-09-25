import React from 'react';
import { useGameStore } from '../../state/gameStore';
import { selectDashboardMetrics } from '../../state/selectors';
import { MetricCard } from '../../components/ui/MetricCard';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { formatCurrency, formatPercent } from '../../utils/rounding';

export const DashboardView: React.FC = () => {
  const { game, setActiveTab } = useGameStore();
  const metrics = selectDashboardMetrics(game);
  const player = game.player;
  const economy = game.economy;

  return (
    <div className="space-y-6">
      {/* Top Welcome / Status Hero */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Boardroom Executive Dashboard</h2>
            <Badge variant="indigo" size="md">Year {game.year} • Quarter {game.quarter}</Badge>
          </div>
          <p className="mt-1 text-xs text-slate-400 max-w-2xl">
            You are directing operations for <strong className="text-slate-200">{player.name}</strong>. Factory operations are centered in the South region. Manage pricing, factory shifts, logistics, labour negotiations, and corporate finance to maximize long-term shareholder value.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="md"
            variant="primary"
            onClick={() => setActiveTab('decisions')}
            className="shadow-lg shadow-indigo-900/50"
          >
            Review Decisions & Run Quarter →
          </Button>
        </div>
      </div>

      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Share Price"
          value={`$${player.sharePrice.toFixed(2)}`}
          change={
            metrics.sharePriceDelta !== 0
              ? {
                  value: `$${Math.abs(metrics.sharePriceDelta).toFixed(2)}`,
                  isPositive: metrics.sharePriceDelta > 0,
                }
              : undefined
          }
          subtitle="Primary Board Performance Target"
          variant="primary"
        />

        <MetricCard
          label="Cash & Reserves"
          value={formatCurrency(player.cash)}
          subtitle={
            player.finance.currentOverdraft > 0
              ? `Overdraft: ${formatCurrency(player.finance.currentOverdraft)}`
              : 'Deposits earning interest'
          }
          variant={player.cash > 25000 ? 'success' : 'warning'}
        />

        <MetricCard
          label="Last Quarter Net Profit"
          value={formatCurrency(player.finance.lastQuarterNetProfit)}
          subtitle={`Net Worth: ${formatCurrency(metrics.netWorth)}`}
          variant={player.finance.lastQuarterNetProfit >= 0 ? 'default' : 'danger'}
        />

        <MetricCard
          label="Overall Market Share"
          value={formatPercent(metrics.marketShare)}
          subtitle="Across 4 Geographic Markets"
          variant="default"
        />
      </div>

      {/* Operations & Economy Dual Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Economic Climate Card */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/70 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Macroeconomic Environment</h3>
            <Badge variant={economy.mode === 'growth' ? 'emerald' : economy.mode === 'decline' ? 'rose' : 'slate'}>
              {economy.mode.toUpperCase()} MODE
            </Badge>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <span className="text-slate-400">GDP Index (Base 100)</span>
              <span className="font-semibold text-white">{economy.gdpIndex.toFixed(1)} ({economy.gdpGrowthRate > 0 ? '+' : ''}{(economy.gdpGrowthRate * 100).toFixed(1)}%)</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <span className="text-slate-400">Central Bank Rate (CBR)</span>
              <span className="font-semibold text-amber-300">{(economy.centralBankRate * 100).toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <span className="text-slate-400">Unemployment Rate</span>
              <span className="font-semibold text-slate-200">{(economy.unemploymentRate * 100).toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <span className="text-slate-400">Annual Inflation</span>
              <span className="font-semibold text-slate-200">{(economy.inflationRate * 100).toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Quarterly Seasonal Factor</span>
              <span className="font-bold text-indigo-300">{(economy.seasonalFactor * 100).toFixed(0)}% (Q4 Peak)</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800">
            <div className="text-[11px] text-slate-400">
              <strong className="text-slate-300">Bank Borrowing Rates:</strong> Overdraft at {(player.finance.overdraftRate * 100).toFixed(1)}% (CBR+4%), Unsecured borrowing at {(player.finance.unsecuredRate * 100).toFixed(1)}% (CBR+10%).
            </div>
          </div>
        </div>

        {/* Product Portfolio Summary */}
        <div className="lg:col-span-2 p-5 rounded-xl border border-slate-800 bg-slate-900/70 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Product Portfolio</h3>
            <button
              onClick={() => setActiveTab('marketing')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              Tune Prices & R&D →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="py-2">Product</th>
                  <th className="py-2">Home / Export Price</th>
                  <th className="py-2">Quality / Design</th>
                  <th className="py-2">Finished Stock</th>
                  <th className="py-2">Backlog</th>
                  <th className="py-2">R&D Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {player.products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-800/30">
                    <td className="py-3 font-semibold text-white">
                      {prod.name}
                      {prod.isModelObsolete && (
                        <span className="ml-2 text-[10px] text-amber-400 border border-amber-400/40 px-1 rounded">Obsolete Model</span>
                      )}
                    </td>
                    <td className="py-3">
                      ${prod.homePrice} / ${prod.exportPrice}
                    </td>
                    <td className="py-3">
                      <span className="text-emerald-400 font-bold">{prod.quality}</span> / <span className="text-indigo-400 font-bold">{prod.designRating}</span>
                    </td>
                    <td className="py-3 font-medium">
                      {prod.inventory.toLocaleString()} units
                    </td>
                    <td className="py-3">
                      {prod.backlog > 0 ? (
                        <span className="text-rose-400 font-bold">{prod.backlog.toLocaleString()} units</span>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>
                    <td className="py-3">
                      {prod.pendingMajorImprovementAvailable ? (
                        <Badge variant="emerald">Major Upgrade Ready!</Badge>
                      ) : (
                        <span className="text-slate-400">${(prod.developmentInvestment).toLocaleString()} invested</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Regional Warehouses & Distribution Overview */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/70 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Regional Market Inventory & Warehousing</h3>
          <button
            onClick={() => setActiveTab('operations')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            Adjust Delivery Schedule →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {player.warehouses.map((w) => {
            const mkt = player.markets.find((m) => m.id === w.marketId);
            const totalStock = w.stock.product1 + w.stock.product2 + w.stock.product3;
            return (
              <div
                key={w.marketId}
                className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/60 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white capitalize">{w.marketId} Market</span>
                  <Badge variant={w.marketId === 'south' ? 'indigo' : 'slate'}>
                    {w.marketId === 'south' ? 'Factory Hub' : `${mkt?.demographic.distanceFromFactoryKm} km`}
                  </Badge>
                </div>
                <div className="text-slate-400 flex justify-between">
                  <span>Sales Force Assigned:</span>
                  <span className="text-white font-semibold">{mkt?.salespeopleAssigned || 0} reps</span>
                </div>
                <div className="text-slate-400 flex justify-between">
                  <span>Total Regional Stock:</span>
                  <span className="text-white font-bold">{totalStock.toLocaleString()} units</span>
                </div>
                <div className="pt-2 border-t border-slate-800/80 text-[11px] grid grid-cols-3 gap-1 text-center text-slate-300">
                  <div>P1: <strong className="text-white">{w.stock.product1}</strong></div>
                  <div>P2: <strong className="text-white">{w.stock.product2}</strong></div>
                  <div>P3: <strong className="text-white">{w.stock.product3}</strong></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
