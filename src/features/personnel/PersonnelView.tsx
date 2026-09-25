import React from 'react';
import { useGameStore } from '../../state/gameStore';
import { useDecisionStore } from '../../state/decisionStore';
import { MarketId } from '../../types/market';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency } from '../../utils/rounding';

export const PersonnelView: React.FC = () => {
  const { game } = useGameStore();
  const { draftDecisions, updatePersonnel } = useDecisionStore();
  const player = game.player;
  const employees = player.employees;

  // Expected planned salespeople
  const plannedSalespeople =
    employees.salespeople +
    draftDecisions.personnel.salespeopleHires -
    draftDecisions.personnel.salespeopleDismissals +
    draftDecisions.personnel.salespeopleToTrain;

  const totalAllocated =
    draftDecisions.personnel.salespeopleAllocation.south +
    draftDecisions.personnel.salespeopleAllocation.west +
    draftDecisions.personnel.salespeopleAllocation.north +
    draftDecisions.personnel.salespeopleAllocation.export;

  const totalManagementBudgets =
    draftDecisions.personnel.marketingManagementBudget +
    draftDecisions.personnel.productionManagementBudget +
    draftDecisions.personnel.personnelManagementBudget +
    draftDecisions.personnel.financialManagementBudget;

  return (
    <div className="space-y-6">
      {/* Header Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-slate-800 bg-slate-900/60">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Personnel & Human Resources</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Recruit, train, and allocate sales representatives, negotiate factory wages, and fund executive management budgets.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs bg-slate-950/80 px-4 py-2 rounded-lg border border-slate-800">
          <div>
            <span className="text-slate-400">Total Workforce:</span>
            <div className="font-bold text-white text-sm">
              {employees.salespeople + employees.machinists + employees.assemblyWorkers + employees.ancillaryWorkers} Staff
            </div>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <span className="text-slate-400">Management Budgets:</span>
            <div className="font-bold text-indigo-300 text-sm">{formatCurrency(totalManagementBudgets)}</div>
          </div>
        </div>
      </div>

      {/* Sales Force Recruitment & Regional Allocation */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/70 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Sales Representative Force</h3>
          <Badge variant={totalAllocated === plannedSalespeople ? 'emerald' : 'rose'}>
            Planned: {plannedSalespeople} | Allocated: {totalAllocated}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {/* Recruitment Actions */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3">
            <h4 className="font-bold text-white">Recruitment & Staffing</h4>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Current Sales Team:</span>
              <span className="font-bold text-white">{employees.salespeople} reps</span>
            </div>

            <div className="flex justify-between items-center">
              <label className="text-slate-300">Recruit Direct ($1,200 fee):</label>
              <input
                type="number"
                min="0"
                max="10"
                value={draftDecisions.personnel.salespeopleHires}
                onChange={(e) => {
                  const val = Math.max(0, parseInt(e.target.value) || 0);
                  updatePersonnel((prev) => ({ ...prev, salespeopleHires: val }), player, game.quarter);
                }}
                className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-semibold text-center focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="text-slate-300">Train from Unemployed ($2,800):</label>
              <input
                type="number"
                min="0"
                max="10"
                value={draftDecisions.personnel.salespeopleToTrain}
                onChange={(e) => {
                  const val = Math.max(0, parseInt(e.target.value) || 0);
                  updatePersonnel((prev) => ({ ...prev, salespeopleToTrain: val }), player, game.quarter);
                }}
                className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-semibold text-center focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="text-slate-300">Dismiss Salespeople ($1,500 comp):</label>
              <input
                type="number"
                min="0"
                max={employees.salespeople}
                value={draftDecisions.personnel.salespeopleDismissals}
                onChange={(e) => {
                  const val = Math.max(0, parseInt(e.target.value) || 0);
                  updatePersonnel((prev) => ({ ...prev, salespeopleDismissals: val }), player, game.quarter);
                }}
                className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-semibold text-center focus:outline-none focus:border-indigo-500"
              />
            </div>
            <p className="text-[11px] text-slate-500">Trained employees are guaranteed to remain for at least 1 quarter.</p>
          </div>

          {/* Regional Allocation */}
          <div className="md:col-span-2 p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3">
            <h4 className="font-bold text-white">Geographic Market Assignment</h4>
            <p className="text-[11px] text-slate-400">
              Each salesperson represents all 3 products in their allocated territory. Sum must match planned sales force.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              {(['south', 'west', 'north', 'export'] as const).map((mkt) => {
                const count = draftDecisions.personnel.salespeopleAllocation[mkt] ?? 0;
                return (
                  <div key={mkt} className="p-3 rounded-lg border border-slate-800 bg-slate-900 space-y-1">
                    <span className="font-semibold text-white capitalize">{mkt}</span>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={count}
                      onChange={(e) => {
                        const val = Math.max(0, parseInt(e.target.value) || 0);
                        updatePersonnel(
                          (prev) => ({
                            ...prev,
                            salespeopleAllocation: {
                              ...prev.salespeopleAllocation,
                              [mkt]: val,
                            },
                          }),
                          player,
                          game.quarter
                        );
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-white font-bold text-center focus:outline-none focus:border-indigo-500"
                    />
                    <div className="text-[10px] text-slate-500 text-center">Reps Assigned</div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 text-[11px] text-slate-400">
              Commission: <strong className="text-white">2.5% of order value</strong> • Quarterly expense allowance: <strong className="text-white">$1,500/rep</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Assembly & Machinists Workforce */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assembly Operators */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/70 space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Assembly Workforce</h3>
            <Badge variant="indigo">{employees.assemblyWorkers} Workers</Badge>
          </div>

          <div className="space-y-3 p-3.5 rounded-lg border border-slate-800 bg-slate-950/60">
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Recruit Assembly Operators ($400 fee):</span>
              <input
                type="number"
                min="0"
                max="20"
                value={draftDecisions.personnel.assemblyHires}
                onChange={(e) => {
                  const val = Math.max(0, parseInt(e.target.value) || 0);
                  updatePersonnel((prev) => ({ ...prev, assemblyHires: val }), player, game.quarter);
                }}
                className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-semibold text-center focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="text-slate-300">Train Operators ($950 fee):</label>
              <input
                type="number"
                min="0"
                max="20"
                value={draftDecisions.personnel.assemblyToTrain}
                onChange={(e) => {
                  const val = Math.max(0, parseInt(e.target.value) || 0);
                  updatePersonnel((prev) => ({ ...prev, assemblyToTrain: val }), player, game.quarter);
                }}
                className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-semibold text-center focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="text-slate-300">Dismiss Operators ($1,500 comp):</label>
              <input
                type="number"
                min="0"
                max={employees.assemblyWorkers}
                value={draftDecisions.personnel.assemblyDismissals}
                onChange={(e) => {
                  const val = Math.max(0, parseInt(e.target.value) || 0);
                  updatePersonnel((prev) => ({ ...prev, assemblyDismissals: val }), player, game.quarter);
                }}
                className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-semibold text-center focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Wage Offer */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-white">Assembly Hourly Wage Offer:</span>
              <span className="font-bold text-indigo-400">
                ${draftDecisions.personnel.assemblyHourlyWageOffer.toFixed(2)}/hr
              </span>
            </div>
            <input
              type="range"
              min={employees.assemblyHourlyWage}
              max={employees.assemblyHourlyWage + 5.0}
              step="0.25"
              value={draftDecisions.personnel.assemblyHourlyWageOffer}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                updatePersonnel((prev) => ({ ...prev, assemblyHourlyWageOffer: val }), player, game.quarter);
              }}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="text-[11px] text-slate-400 leading-relaxed">
              Current: ${employees.assemblyHourlyWage.toFixed(2)}/hr. <strong>Rule:</strong> Wage increases take effect next quarter; wages cannot be reduced. Higher wages reduce employee turnover.
            </div>
          </div>
        </div>

        {/* Machinists & Ancillary */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/70 space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Machinists & Support Staff</h3>
            <Badge variant="indigo">Automated Staffing</Badge>
          </div>

          <div className="space-y-3 p-4 rounded-xl border border-slate-800 bg-slate-950/60">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-300 font-semibold">Machinists:</span>
              <span className="font-bold text-white">{employees.machinists} technicians</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Calculated automatically: 4 machinists × {player.machines.length} machines × {draftDecisions.operations.shifts} shift(s). Paid standard quarterly rate ($5,200).
            </p>

            <div className="flex justify-between items-center pt-2 pb-2 border-b border-slate-800">
              <span className="text-slate-300 font-semibold">Ancillary Logistics Staff:</span>
              <span className="font-bold text-white">{employees.ancillaryWorkers} workers</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Warehouse handling, receiving, and dispatch crew. Paid standard quarterly rate ($3,800).
            </p>
          </div>
        </div>
      </div>

      {/* Senior Management Budgets */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/70 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Executive Management Budgets</h3>
          <span className="text-xs text-slate-400">Minimum $5,000 per department. Increasing takes effect immediately; decreasing requires 1-quarter notice.</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {[
            { key: 'marketingManagementBudget', label: 'Marketing Management' },
            { key: 'productionManagementBudget', label: 'Production Management' },
            { key: 'personnelManagementBudget', label: 'Personnel Management' },
            { key: 'financialManagementBudget', label: 'Financial Management' },
          ].map(({ key, label }) => {
            const val = (draftDecisions.personnel as any)[key] ?? 6000;
            return (
              <div key={key} className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/60 space-y-2">
                <span className="font-semibold text-white">{label}</span>
                <input
                  type="number"
                  step="500"
                  min="5000"
                  max="50000"
                  value={val}
                  onChange={(e) => {
                    const amount = Math.max(5000, parseInt(e.target.value) || 5000);
                    updatePersonnel(
                      (prev) => ({ ...prev, [key]: amount }),
                      player,
                      game.quarter
                    );
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white font-bold focus:outline-none focus:border-indigo-500"
                />
                <div className="text-[10px] text-slate-500">Quarterly Allocation</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
