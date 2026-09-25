import React, { useState } from 'react';
import { useGameStore } from '../../state/gameStore';
import { useDecisionStore } from '../../state/decisionStore';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { formatCurrency } from '../../utils/rounding';

export const DecisionsReviewView: React.FC = () => {
  const { game, executeQuarter, isSimulating, setActiveTab } = useGameStore();
  const { draftDecisions, validationResult } = useDecisionStore();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const player = game.player;
  const decs = draftDecisions;

  const handleRunQuarter = async () => {
    setIsConfirmModalOpen(false);
    await executeQuarter(draftDecisions);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-slate-800 bg-slate-900/60">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-tight">Review Decisions & Pre-Flight Audit</h2>
            <Badge variant={validationResult.isValid ? 'emerald' : 'rose'}>
              {validationResult.isValid ? 'Ready for Execution' : 'Validation Errors Present'}
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit all departmental decisions before submitting to the Topaz-VBE simulation engine.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="lg"
            variant="primary"
            disabled={!validationResult.isValid}
            isLoading={isSimulating}
            onClick={() => setIsConfirmModalOpen(true)}
            className="shadow-lg shadow-indigo-900/50 font-bold"
          >
            Advance to Quarter {game.quarter === 4 ? 1 : game.quarter + 1} →
          </Button>
        </div>
      </div>

      {/* Validation Warnings & Errors Banner */}
      {(!validationResult.isValid || validationResult.warnings.length > 0) && (
        <div className="space-y-2">
          {validationResult.errors.map((err, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 p-3 rounded-lg border border-rose-800 bg-rose-950/60 text-rose-200 text-xs font-semibold"
            >
              <span>⛔</span>
              <div>
                <strong>Blocking Error ({err.category}):</strong> {err.message}
              </div>
            </div>
          ))}

          {validationResult.warnings.map((warn, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 p-3 rounded-lg border border-amber-800 bg-amber-950/60 text-amber-200 text-xs font-medium"
            >
              <span>⚠️</span>
              <div>
                <strong>Advisory Warning ({warn.category}):</strong> {warn.message}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Decision Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Marketing Summary */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/70 space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="font-bold text-white uppercase tracking-wider">1. Marketing Decisions</h3>
            <button
              onClick={() => setActiveTab('marketing')}
              className="text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              Edit →
            </button>
          </div>

          <div className="space-y-2 text-slate-300">
            <div>
              <span className="text-slate-400 font-semibold">Pricing (Home / Export):</span>
              <ul className="mt-1 space-y-0.5 pl-2 text-white">
                <li>• Topaz Alpha (P1): ${decs.marketing.prices.product1.homePrice} / ${decs.marketing.prices.product1.exportPrice}</li>
                <li>• Topaz Beta (P2): ${decs.marketing.prices.product2.homePrice} / ${decs.marketing.prices.product2.exportPrice}</li>
                <li>• Topaz Gamma (P3): ${decs.marketing.prices.product3.homePrice} / ${decs.marketing.prices.product3.exportPrice}</li>
              </ul>
            </div>

            <div>
              <span className="text-slate-400 font-semibold">Retailer Credit Period:</span>{' '}
              <strong className="text-white">{decs.marketing.creditTermsDays} days</strong>
            </div>

            <div>
              <span className="text-slate-400 font-semibold">R&D Investments:</span>
              <div className="mt-1 text-slate-300">
                P1: {formatCurrency(decs.marketing.developmentBudgets.product1)} • P2: {formatCurrency(decs.marketing.developmentBudgets.product2)} • P3: {formatCurrency(decs.marketing.developmentBudgets.product3)}
              </div>
            </div>
          </div>
        </div>

        {/* Operations Summary */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/70 space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="font-bold text-white uppercase tracking-wider">2. Factory & Operations</h3>
            <button
              onClick={() => setActiveTab('operations')}
              className="text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              Edit →
            </button>
          </div>

          <div className="space-y-2 text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Factory Shifts:</span>
              <strong className="text-white">{decs.operations.shifts} Shift(s)</strong>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">Contracted Maintenance:</span>
              <strong className="text-white">{decs.operations.contractedMaintenanceHoursPerMachine} hrs/machine</strong>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">Raw Material Order:</span>
              <strong className="text-white">
                {decs.operations.materialOrder.units.toLocaleString()} units (Supplier {decs.operations.materialOrder.supplierId})
              </strong>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">Capital Orders:</span>
              <strong className="text-white">
                {decs.operations.machinesToOrder} machines • {decs.operations.vehiclesToBuy} vehicles
              </strong>
            </div>
          </div>
        </div>

        {/* Personnel Summary */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/70 space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="font-bold text-white uppercase tracking-wider">3. Personnel & Wages</h3>
            <button
              onClick={() => setActiveTab('personnel')}
              className="text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              Edit →
            </button>
          </div>

          <div className="space-y-2 text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Sales Force Hires / Trains / Dismissals:</span>
              <strong className="text-white">
                +{decs.personnel.salespeopleHires} hire / +{decs.personnel.salespeopleToTrain} train / -{decs.personnel.salespeopleDismissals} fire
              </strong>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">Territory Allocation:</span>
              <span className="text-white font-medium">
                S:{decs.personnel.salespeopleAllocation.south} W:{decs.personnel.salespeopleAllocation.west} N:{decs.personnel.salespeopleAllocation.north} E:{decs.personnel.salespeopleAllocation.export}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">Assembly Wage Offer:</span>
              <strong className="text-emerald-400">${decs.personnel.assemblyHourlyWageOffer.toFixed(2)}/hr</strong>
            </div>
          </div>
        </div>

        {/* Finance & Research Summary */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/70 space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="font-bold text-white uppercase tracking-wider">4. Treasury & Intelligence</h3>
            <button
              onClick={() => setActiveTab('finance')}
              className="text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              Edit →
            </button>
          </div>

          <div className="space-y-2 text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Dividend Declared:</span>
              <strong className="text-white">
                {decs.finance.dividendPerShare > 0 ? `$${decs.finance.dividendPerShare.toFixed(2)}/share` : 'None'}
              </strong>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">Commissioned Intelligence:</span>
              <span className="text-white font-medium">
                {[
                  decs.research.purchaseCompetitorAdSpend && 'Ad Spend',
                  decs.research.purchaseCompetitorDevSpend && 'R&D',
                  decs.research.purchaseCompetitorDesignRatings && 'Design',
                  decs.research.purchaseCompetitorMarketShare && 'Market Share',
                ]
                  .filter(Boolean)
                  .join(', ') || 'None'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title={`Advance Simulation to Year ${game.quarter === 4 ? game.year + 1 : game.year} Quarter ${game.quarter === 4 ? 1 : game.quarter + 1}?`}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsConfirmModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isSimulating}
              onClick={handleRunQuarter}
            >
              Confirm & Execute Quarter
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs text-slate-300">
          <p>
            The simulation engine will process all market demand, factory production, logistics, workforce evolution, and financial accounts deterministically under seed <strong className="text-white">#{game.seed}</strong>.
          </p>
          <p className="text-slate-400">
            New management reports and audited financial statements will be generated immediately upon completion.
          </p>
        </div>
      </Modal>
    </div>
  );
};
