import React from 'react';
import { useGameStore } from '../../state/gameStore';
import { useDecisionStore } from '../../state/decisionStore';
import { ProductId } from '../../types/product';
import { MarketId } from '../../types/market';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency } from '../../utils/rounding';

export const MarketingView: React.FC = () => {
  const { game } = useGameStore();
  const { draftDecisions, updateMarketing } = useDecisionStore();
  const player = game.player;

  const products: ProductId[] = ['product1', 'product2', 'product3'];
  const markets: MarketId[] = ['south', 'west', 'north', 'export'];

  // Helper to calculate total ad spend
  let totalAdSpend = 0;
  for (const p of products) {
    for (const m of markets) {
      const ad = draftDecisions.marketing.advertising[p]?.[m];
      if (ad) {
        totalAdSpend += (ad.tradePress || 0) + (ad.advertisingSupport || 0) + (ad.pointOfSale || 0);
      }
    }
  }

  const totalDevSpend =
    (draftDecisions.marketing.developmentBudgets.product1 || 0) +
    (draftDecisions.marketing.developmentBudgets.product2 || 0) +
    (draftDecisions.marketing.developmentBudgets.product3 || 0);

  return (
    <div className="space-y-6">
      {/* Header Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-slate-800 bg-slate-900/60">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Marketing & Product Development</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure consumer pricing, retailer credit terms, advertising across media channels, and R&D budgets.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs bg-slate-950/80 px-4 py-2 rounded-lg border border-slate-800">
          <div>
            <span className="text-slate-400">Total Advertising Budget:</span>
            <div className="font-bold text-white text-sm">{formatCurrency(totalAdSpend)}</div>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <span className="text-slate-400">Total R&D Investment:</span>
            <div className="font-bold text-indigo-300 text-sm">{formatCurrency(totalDevSpend)}</div>
          </div>
        </div>
      </div>

      {/* Pricing & Credit Terms Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pricing Table */}
        <div className="lg:col-span-2 p-5 rounded-xl border border-slate-800 bg-slate-900/70 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Product Pricing</h3>
            <span className="text-[11px] text-slate-400">A price of $0 withdraws product from that market.</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="py-2.5">Product</th>
                  <th className="py-2.5">Standard Cost</th>
                  <th className="py-2.5">Home Price (South/West/North)</th>
                  <th className="py-2.5">Export Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {products.map((prodId) => {
                  const prod = player.products.find((p) => p.id === prodId);
                  const currentPrices = draftDecisions.marketing.prices[prodId];
                  const stdCost = prodId === 'product1' ? 24.50 : prodId === 'product2' ? 36.00 : 52.00;

                  return (
                    <tr key={prodId}>
                      <td className="py-3 font-semibold text-white">
                        {prod?.name}
                      </td>
                      <td className="py-3 text-slate-400">
                        ${stdCost.toFixed(2)}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400">$</span>
                          <input
                            type="number"
                            min="0"
                            max="500"
                            value={currentPrices?.homePrice ?? 50}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              updateMarketing(
                                (prev) => ({
                                  ...prev,
                                  prices: {
                                    ...prev.prices,
                                    [prodId]: {
                                      ...prev.prices[prodId],
                                      homePrice: val,
                                    },
                                  },
                                }),
                                player,
                                game.quarter
                              );
                            }}
                            className="w-24 bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-white font-semibold focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400">$</span>
                          <input
                            type="number"
                            min="0"
                            max="500"
                            value={currentPrices?.exportPrice ?? 45}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              updateMarketing(
                                (prev) => ({
                                  ...prev,
                                  prices: {
                                    ...prev.prices,
                                    [prodId]: {
                                      ...prev.prices[prodId],
                                      exportPrice: val,
                                    },
                                  },
                                }),
                                player,
                                game.quarter
                              );
                            }}
                            className="w-24 bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-white font-semibold focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Credit Terms Card */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/70 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Retailer Credit Terms</h3>
            <Badge variant="indigo">{draftDecisions.marketing.creditTermsDays} Days</Badge>
          </div>

          <p className="text-xs text-slate-400">
            Standard benchmark is 30 days. Longer credit terms attract retail orders but tie up cash in trade debtors and increase bad debt exposure.
          </p>

          <div className="space-y-2 pt-2">
            <input
              type="range"
              min="15"
              max="90"
              step="5"
              value={draftDecisions.marketing.creditTermsDays}
              onChange={(e) => {
                const days = parseInt(e.target.value);
                updateMarketing(
                  (prev) => ({ ...prev, creditTermsDays: days }),
                  player,
                  game.quarter
                );
              }}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>15 Days (Tight)</span>
              <span>30 Days (Normal)</span>
              <span>90 Days (Generous)</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div>• Current Central Bank Rate: <strong className="text-white">{(game.economy.centralBankRate * 100).toFixed(1)}%</strong></div>
            <div>• Retailers are more sensitive to credit terms when borrowing rates are high.</div>
          </div>
        </div>
      </div>

      {/* Product Development & Major Breakthroughs */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/70 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Product Development (R&D) & Engineering Upgrades</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {products.map((prodId) => {
            const prod = player.products.find((p) => p.id === prodId);
            const budget = draftDecisions.marketing.developmentBudgets[prodId] ?? 3000;
            const adopt = draftDecisions.marketing.adoptMajorImprovement[prodId] ?? false;

            return (
              <div
                key={prodId}
                className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{prod?.name}</span>
                  <Badge variant={prod?.pendingMajorImprovementAvailable ? 'emerald' : 'slate'}>
                    {prod?.pendingMajorImprovementAvailable ? 'Major Breakthrough!' : `${prod?.quality} Quality`}
                  </Badge>
                </div>

                <div className="text-slate-400 flex justify-between">
                  <span>Cumulative Investment:</span>
                  <span className="text-white font-medium">${prod?.developmentInvestment.toLocaleString()}</span>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Quarterly R&D Budget ($):</label>
                  <input
                    type="number"
                    step="500"
                    min="0"
                    max="50000"
                    value={budget}
                    onChange={(e) => {
                      const val = Math.max(0, parseFloat(e.target.value) || 0);
                      updateMarketing(
                        (prev) => ({
                          ...prev,
                          developmentBudgets: {
                            ...prev.developmentBudgets,
                            [prodId]: val,
                          },
                        }),
                        player,
                        game.quarter
                      );
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-semibold focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {prod?.pendingMajorImprovementAvailable && (
                  <div className="p-2.5 rounded-lg border border-emerald-800 bg-emerald-950/40 text-emerald-200">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={adopt}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          updateMarketing(
                            (prev) => ({
                              ...prev,
                              adoptMajorImprovement: {
                                ...prev.adoptMajorImprovement,
                                [prodId]: checked,
                              },
                            }),
                            player,
                            game.quarter
                          );
                        }}
                        className="mt-0.5 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-[11px] leading-tight">
                        <strong>Adopt Major Redesign Now</strong>. Will upgrade design by +12 pts and quality by +8 pts. (Note: Existing warehouse stock will become obsolete model).
                      </span>
                    </label>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Advertising Matrix: 3 Products x 4 Markets x 3 Media */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/70 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Advertising Media Expenditure Matrix</h3>
          <span className="text-[11px] text-slate-400">Media: Trade Press (TP), Advertising Support (AS), Point-of-Sale (POS)</span>
        </div>

        <div className="space-y-6">
          {products.map((prodId) => {
            const prod = player.products.find((p) => p.id === prodId);
            return (
              <div key={prodId} className="border border-slate-800/80 rounded-lg p-4 bg-slate-950/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-xs tracking-wide">{prod?.name} Advertising Allocation</h4>
                  <Badge variant="indigo" size="sm">Image Score: {prod?.quality}</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {markets.map((mkt) => {
                    const media = draftDecisions.marketing.advertising[prodId]?.[mkt] || { tradePress: 0, advertisingSupport: 0, pointOfSale: 0 };
                    return (
                      <div key={mkt} className="p-3 rounded-lg border border-slate-800 bg-slate-900/90 space-y-2 text-xs">
                        <div className="font-semibold text-white capitalize">{mkt} Market</div>

                        <div>
                          <label className="text-[10px] text-slate-400 flex justify-between">
                            <span>Trade Press ($)</span>
                            <span>TP</span>
                          </label>
                          <input
                            type="number"
                            step="100"
                            min="0"
                            value={media.tradePress}
                            onChange={(e) => {
                              const val = Math.max(0, parseInt(e.target.value) || 0);
                              updateMarketing(
                                (prev) => ({
                                  ...prev,
                                  advertising: {
                                    ...prev.advertising,
                                    [prodId]: {
                                      ...prev.advertising[prodId],
                                      [mkt]: { ...media, tradePress: val },
                                    },
                                  },
                                }),
                                player,
                                game.quarter
                              );
                            }}
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-medium focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 flex justify-between">
                            <span>Advertising Support ($)</span>
                            <span>AS</span>
                          </label>
                          <input
                            type="number"
                            step="100"
                            min="0"
                            value={media.advertisingSupport}
                            onChange={(e) => {
                              const val = Math.max(0, parseInt(e.target.value) || 0);
                              updateMarketing(
                                (prev) => ({
                                  ...prev,
                                  advertising: {
                                    ...prev.advertising,
                                    [prodId]: {
                                      ...prev.advertising[prodId],
                                      [mkt]: { ...media, advertisingSupport: val },
                                    },
                                  },
                                }),
                                player,
                                game.quarter
                              );
                            }}
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-medium focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 flex justify-between">
                            <span>Point-of-Sale ($)</span>
                            <span>POS</span>
                          </label>
                          <input
                            type="number"
                            step="100"
                            min="0"
                            value={media.pointOfSale}
                            onChange={(e) => {
                              const val = Math.max(0, parseInt(e.target.value) || 0);
                              updateMarketing(
                                (prev) => ({
                                  ...prev,
                                  advertising: {
                                    ...prev.advertising,
                                    [prodId]: {
                                      ...prev.advertising[prodId],
                                      [mkt]: { ...media, pointOfSale: val },
                                    },
                                  },
                                }),
                                player,
                                game.quarter
                              );
                            }}
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-medium focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
