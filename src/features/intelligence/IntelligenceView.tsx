import React from 'react';
import { useGameStore } from '../../state/gameStore';
import { useDecisionStore } from '../../state/decisionStore';
import { table02InformationSellingCosts } from '../../data/tables/informationSellingCosts';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency } from '../../utils/rounding';

export const IntelligenceView: React.FC = () => {
  const { game, lastReport } = useGameStore();
  const { draftDecisions, updateResearch } = useDecisionStore();
  const competitors = game.competitors;
  const research = draftDecisions.research;
  const costs = table02InformationSellingCosts;

  const totalIntelCost =
    (research.purchaseCompetitorAdSpend ? costs.intelAdSpendCost.value : 0) +
    (research.purchaseCompetitorDevSpend ? costs.intelDevSpendCost.value : 0) +
    (research.purchaseCompetitorDesignRatings ? costs.intelDesignRatingsCost.value : 0) +
    (research.purchaseCompetitorMarketShare ? costs.intelMarketShareCost.value : 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-slate-800 bg-slate-900/60">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Competitor Intelligence & Commercial Research</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Access free public market information or commission specialized commercial intelligence agency reports.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs bg-slate-950/80 px-4 py-2 rounded-lg border border-slate-800">
          <span className="text-slate-400">Commissioned Intelligence Cost:</span>
          <span className="font-bold text-indigo-300 text-sm">{formatCurrency(totalIntelCost)}</span>
        </div>
      </div>

      {/* Intelligence Commissioning Decisions */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/70 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Purchase Commercial Research Reports</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {[
            {
              key: 'purchaseCompetitorAdSpend',
              label: 'Competitor Advertising Spend',
              cost: costs.intelAdSpendCost.value,
              desc: 'Uncovers total quarterly advertising expenditure across media and markets for all rivals.',
            },
            {
              key: 'purchaseCompetitorDevSpend',
              label: 'Competitor R&D Expenditure',
              cost: costs.intelDevSpendCost.value,
              desc: 'Tracks rival engineering and product development budget commitments.',
            },
            {
              key: 'purchaseCompetitorDesignRatings',
              label: 'Rival Product Design Ratings',
              cost: costs.intelDesignRatingsCost.value,
              desc: 'Consumer agency benchmark evaluation of competitor product aesthetics and design.',
            },
            {
              key: 'purchaseCompetitorMarketShare',
              label: 'Market Share Intelligence',
              cost: costs.intelMarketShareCost.value,
              desc: 'Audited sales distribution and market penetration estimates across all regions.',
            },
          ].map(({ key, label, cost, desc }) => {
            const isChecked = (research as any)[key];
            return (
              <label
                key={key}
                className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2.5 block ${
                  isChecked
                    ? 'border-indigo-500 bg-indigo-950/40 ring-1 ring-indigo-500'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{label}</span>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      updateResearch(
                        (prev) => ({ ...prev, [key]: checked }),
                        game.player,
                        game.quarter
                      );
                    }}
                    className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
                <div className="text-indigo-400 font-semibold">{formatCurrency(cost)}</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{desc}</p>
              </label>
            );
          })}
        </div>
      </div>

      {/* Free Public Competitor Data & Latest Intel */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/70 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Public Competitor Profiles & Intel Archive</h3>
          <Badge variant="indigo">{competitors.length} Computer-Controlled Competitors</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {competitors.map((comp) => {
            const intelFromReport = lastReport?.competitorsIntel.find((i) => i.id === comp.id);
            const totalStaff =
              comp.employees.salespeople +
              comp.employees.machinists +
              comp.employees.assemblyWorkers +
              comp.employees.ancillaryWorkers;

            return (
              <div
                key={comp.id}
                className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3 text-xs"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div>
                    <h4 className="font-bold text-white text-sm">{comp.name}</h4>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wide">Strategy: {comp.strategy}</span>
                  </div>
                  <Badge variant="emerald">Share Price: ${comp.sharePrice.toFixed(2)}</Badge>
                </div>

                {/* Free Public Data */}
                <div className="space-y-1.5 text-slate-300">
                  <div className="font-semibold text-slate-400 text-[10px] uppercase">Public Information (Free):</div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Workforce:</span>
                    <span className="font-medium text-white">{totalStaff} employees</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Assembly Base Wage:</span>
                    <span className="font-medium text-white">${comp.employees.assemblyHourlyWage.toFixed(2)}/hr</span>
                  </div>
                  <div className="pt-1">
                    <span className="text-slate-400">Product Prices (Home / Export):</span>
                    <div className="mt-1 grid grid-cols-3 gap-1 text-[11px] text-center">
                      <div className="bg-slate-900 p-1 rounded border border-slate-800">
                        P1: ${comp.products.find((p) => p.id === 'product1')?.homePrice} / ${comp.products.find((p) => p.id === 'product1')?.exportPrice}
                      </div>
                      <div className="bg-slate-900 p-1 rounded border border-slate-800">
                        P2: ${comp.products.find((p) => p.id === 'product2')?.homePrice} / ${comp.products.find((p) => p.id === 'product2')?.exportPrice}
                      </div>
                      <div className="bg-slate-900 p-1 rounded border border-slate-800">
                        P3: ${comp.products.find((p) => p.id === 'product3')?.homePrice} / ${comp.products.find((p) => p.id === 'product3')?.exportPrice}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Purchased Intel Section */}
                <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                  <div className="font-semibold text-indigo-400 text-[10px] uppercase">Purchased Intelligence:</div>
                  {intelFromReport?.purchasedData ? (
                    <div className="space-y-1 text-slate-300">
                      {intelFromReport.purchasedData.advertisingSpendTotal !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Advertising Spend:</span>
                          <span className="font-bold text-white">{formatCurrency(intelFromReport.purchasedData.advertisingSpendTotal)}</span>
                        </div>
                      )}
                      {intelFromReport.purchasedData.rAndDSpendTotal !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">R&D Expenditure:</span>
                          <span className="font-bold text-white">{formatCurrency(intelFromReport.purchasedData.rAndDSpendTotal)}</span>
                        </div>
                      )}
                      {intelFromReport.purchasedData.marketShareEstimate !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Estimated Market Share:</span>
                          <span className="font-bold text-emerald-400">{(intelFromReport.purchasedData.marketShareEstimate * 100).toFixed(1)}%</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 italic">No purchased intelligence for last quarter. Select research packages above.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
