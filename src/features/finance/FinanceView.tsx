import React from 'react';
import { useGameStore } from '../../state/gameStore';
import { useDecisionStore } from '../../state/decisionStore';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency } from '../../utils/rounding';

export const FinanceView: React.FC = () => {
  const { game } = useGameStore();
  const { draftDecisions, updateFinance } = useDecisionStore();
  const player = game.player;
  const fin = player.finance;
  const isDividendEligibleQuarter = game.quarter === 1 || game.quarter === 3;

  // Calculate machine creditworthiness
  const outstandingMachinePayments = player.operations.machineOrdersPipeline.reduce((acc, p) => {
    if (!p.firstPaymentPaid) return acc + p.totalCost;
    if (!p.secondPaymentPaid) return acc + p.totalCost * 0.5;
    return acc;
  }, 0);

  const machineCreditworthiness = Math.max(
    0,
    fin.overdraftLimit - fin.currentOverdraft - fin.unsecuredLoans - outstandingMachinePayments
  );

  return (
    <div className="space-y-6">
      {/* Header Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-slate-800 bg-slate-900/60">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Treasury, Banking & Capital Management</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor bank borrowings, credit facilities, dividend declarations, and corporate taxation.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs bg-slate-950/80 px-4 py-2 rounded-lg border border-slate-800">
          <div>
            <span className="text-slate-400">Total Borrowing:</span>
            <div className="font-bold text-rose-300 text-sm">
              {formatCurrency(fin.currentOverdraft + fin.unsecuredLoans)}
            </div>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <span className="text-slate-400">Retained Reserves:</span>
            <div className="font-bold text-indigo-300 text-sm">{formatCurrency(fin.retainedEarnings)}</div>
          </div>
        </div>
      </div>

      {/* Banking & Credit Facilities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Credit Limit & Facilities */}
        <div className="lg:col-span-2 p-5 rounded-xl border border-slate-800 bg-slate-900/70 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Bank Borrowing Lines & Creditworthiness</h3>
            <Badge variant={machineCreditworthiness > 50000 ? 'indigo' : 'amber'}>
              Supplier Creditworthiness: {formatCurrency(machineCreditworthiness)}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/60 space-y-1">
              <span className="text-slate-400">Overdraft Line of Credit</span>
              <div className="text-base font-bold text-white">{formatCurrency(fin.overdraftLimit)}</div>
              <div className="text-[11px] text-slate-500">Drawn: {formatCurrency(fin.currentOverdraft)}</div>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/60 space-y-1">
              <span className="text-slate-400">Unsecured Borrowing</span>
              <div className={`text-base font-bold ${fin.unsecuredLoans > 0 ? 'text-rose-400' : 'text-slate-200'}`}>
                {formatCurrency(fin.unsecuredLoans)}
              </div>
              <div className="text-[11px] text-slate-500">Emergency auto-draw above limit</div>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/60 space-y-1">
              <span className="text-slate-400">Trade Debtors (Receivables)</span>
              <div className="text-base font-bold text-emerald-400">{formatCurrency(fin.debtors)}</div>
              <div className="text-[11px] text-slate-500">{fin.creditTermsDays}-day payment terms</div>
            </div>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/40 text-xs space-y-1 text-slate-400">
            <div className="font-semibold text-white">Machine Supplier Creditworthiness Rule:</div>
            <div>
              <code className="text-indigo-300">Overdraft Limit (${fin.overdraftLimit.toLocaleString()}) - Current Overdraft (${fin.currentOverdraft.toLocaleString()}) - Unsecured Loans (${fin.unsecuredLoans.toLocaleString()}) - Pending Machine Orders (${outstandingMachinePayments.toLocaleString()}) = ${machineCreditworthiness.toLocaleString()}</code>
            </div>
            <p className="text-[11px] text-slate-500">This credit buffer governs how many new machines can be placed on order.</p>
          </div>
        </div>

        {/* Interest Rates Matrix */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/70 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Interest Rate Structure</h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Central Bank Rate (CBR):</span>
              <span className="font-bold text-white">{(game.economy.centralBankRate * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Cash Deposit Yield:</span>
              <span className="font-bold text-emerald-400">{(fin.depositRate * 100).toFixed(1)}% (CBR - 2%)</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Overdraft Facility Rate:</span>
              <span className="font-bold text-amber-300">{(fin.overdraftRate * 100).toFixed(1)}% (CBR + 4%)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Unsecured Emergency Rate:</span>
              <span className="font-bold text-rose-400">{(fin.unsecuredRate * 100).toFixed(1)}% (CBR + 10%)</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
            Excess cash balances automatically earn deposit yield at quarter end.
          </div>
        </div>
      </div>

      {/* Dividend Declaration & Corporate Taxation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dividends */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/70 space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Shareholder Dividend Declaration</h3>
            <Badge variant={isDividendEligibleQuarter ? 'emerald' : 'slate'}>
              {isDividendEligibleQuarter ? `Quarter ${game.quarter} Eligible` : 'Q1 & Q3 Only'}
            </Badge>
          </div>

          <p className="text-slate-400">
            Dividends can only be declared in <strong>Quarter 1</strong> and <strong>Quarter 3</strong>, and are paid at the beginning of the following quarter. Declaring dividends rewards shareholders and supports share price.
          </p>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-slate-300 font-semibold">Dividend Offer Per Share ($):</label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="2.0"
                disabled={!isDividendEligibleQuarter}
                value={draftDecisions.finance.dividendPerShare}
                onChange={(e) => {
                  const val = Math.max(0, parseFloat(e.target.value) || 0);
                  updateFinance((prev) => ({ ...prev, dividendPerShare: val }), player, game.quarter);
                }}
                className="w-24 bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white font-bold text-center focus:outline-none focus:border-indigo-500 disabled:opacity-40"
              />
            </div>

            <div className="flex justify-between text-slate-400 text-[11px]">
              <span>Estimated Outflow (100,000 shares):</span>
              <strong className="text-white">{formatCurrency(draftDecisions.finance.dividendPerShare * 100000)}</strong>
            </div>
          </div>
        </div>

        {/* Corporate Tax Status */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/70 space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Corporate Income Taxation</h3>
            <Badge variant="indigo">30% Statutory Rate</Badge>
          </div>

          <div className="space-y-3 p-4 rounded-xl border border-slate-800 bg-slate-950/60">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Current Tax Payable (due in Q2):</span>
              <span className="font-bold text-white">{formatCurrency(fin.taxPayable)}</span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Accumulated Tax Loss Carryforwards:</span>
              <span className="font-bold text-indigo-300">{formatCurrency(fin.accumulatedTaxLosses)}</span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Tax is assessed on taxable profit at the end of <strong>Quarter 4</strong>. Losses accumulate and offset future taxable profits. Tax is automatically paid in <strong>Quarter 2</strong> of the following year.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
