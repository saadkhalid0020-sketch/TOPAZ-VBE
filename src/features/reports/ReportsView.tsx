import React, { useState } from 'react';
import { useGameStore } from '../../state/gameStore';
import { QuarterlyReport } from '../../types/reports';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency } from '../../utils/rounding';

export const ReportsView: React.FC = () => {
  const { game, lastReport } = useGameStore();
  const reports = game.reports;
  const [selectedReportId, setSelectedReportId] = useState<string>(
    lastReport?.id || reports[0]?.id || ''
  );
  const [activeReportTab, setActiveReportTab] = useState<
    'executive' | 'income' | 'balance' | 'cashflow' | 'marketing' | 'operations' | 'personnel' | 'intel'
  >('executive');

  const report: QuarterlyReport | undefined =
    reports.find((r) => r.id === selectedReportId) || lastReport || reports[0];

  if (!report) {
    return (
      <div className="p-12 text-center text-slate-400 rounded-xl border border-slate-800 bg-slate-900/60">
        <div className="text-3xl mb-2">📊</div>
        <h3 className="text-base font-bold text-white">No Quarterly Reports Available Yet</h3>
        <p className="text-xs mt-1">Complete your first quarter decisions to generate official management reports.</p>
      </div>
    );
  }

  const { incomeStatement, balanceSheet, cashFlowStatement, executiveSummary } = report;

  return (
    <div className="space-y-6">
      {/* Report Header & Quarter Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-slate-800 bg-slate-900/60">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-tight">Quarterly Management Report</h2>
            <Badge variant="indigo" size="md">
              Year {report.year} • Quarter {report.quarter}
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Audited financial statements and operational departmental performance breakdown.
          </p>
        </div>

        {reports.length > 1 && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">View Archive:</span>
            <select
              value={selectedReportId}
              onChange={(e) => setSelectedReportId(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-white rounded px-3 py-1.5 font-semibold focus:outline-none focus:border-indigo-500"
            >
              {reports.map((r) => (
                <option key={r.id} value={r.id}>
                  Year {r.year} Quarter {r.quarter}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Report Sub-Navigation Tabs */}
      <div className="border-b border-slate-800 bg-slate-900/40 rounded-t-xl px-2 flex space-x-1 overflow-x-auto scrollbar-none text-xs">
        {[
          { id: 'executive', label: 'Executive Summary' },
          { id: 'income', label: 'Income Statement' },
          { id: 'balance', label: 'Balance Sheet' },
          { id: 'cashflow', label: 'Cash Flow' },
          { id: 'marketing', label: 'Marketing & Demand' },
          { id: 'operations', label: 'Operations & Plant' },
          { id: 'personnel', label: 'Personnel & Payroll' },
          { id: 'intel', label: 'Competitor Intel' },
        ].map((tab) => {
          const isActive = activeReportTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReportTab(tab.id as any)}
              className={`py-3 px-3.5 font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'border-indigo-500 text-white bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Executive Summary */}
      {activeReportTab === 'executive' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/70">
              <span className="text-xs text-slate-400 font-semibold uppercase">Quarterly Revenue</span>
              <div className="text-xl font-bold text-white mt-1">{formatCurrency(executiveSummary.revenue)}</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/70">
              <span className="text-xs text-slate-400 font-semibold uppercase">Net Profit / (Loss)</span>
              <div
                className={`text-xl font-bold mt-1 ${
                  executiveSummary.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {formatCurrency(executiveSummary.netProfit)}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/70">
              <span className="text-xs text-slate-400 font-semibold uppercase">Closing Cash</span>
              <div className="text-xl font-bold text-white mt-1">{formatCurrency(executiveSummary.cashPosition)}</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/70">
              <span className="text-xs text-slate-400 font-semibold uppercase">Closing Share Price</span>
              <div className="text-xl font-bold text-indigo-400 mt-1">
                ${executiveSummary.sharePrice.toFixed(2)}
                {executiveSummary.sharePriceChange !== 0 && (
                  <span
                    className={`ml-2 text-xs font-semibold ${
                      executiveSummary.sharePriceChange > 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {executiveSummary.sharePriceChange > 0 ? '+' : ''}
                    ${executiveSummary.sharePriceChange.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Key Highlights */}
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/70 space-y-3">
              <h3 className="font-bold text-white uppercase tracking-wider text-sm">Key Operating Highlights</h3>
              <ul className="space-y-2 text-slate-300">
                {executiveSummary.keyHighlights.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Critical Warnings */}
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/70 space-y-3">
              <h3 className="font-bold text-white uppercase tracking-wider text-sm">Executive Alerts & Bottlenecks</h3>
              {executiveSummary.criticalWarnings.length === 0 ? (
                <p className="text-slate-400 italic">No critical operational or financial warnings reported this quarter.</p>
              ) : (
                <ul className="space-y-2 text-slate-300">
                  {executiveSummary.criticalWarnings.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">⚠️</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Income Statement */}
      {activeReportTab === 'income' && (
        <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/70 space-y-4 max-w-4xl mx-auto text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Income Statement (Profit & Loss)</h3>
              <span className="text-slate-400">Quarter ended Year {report.year} Q{report.quarter}</span>
            </div>
            <Badge variant="indigo">All Values in USD</Badge>
          </div>

          <div className="space-y-1.5 text-slate-200">
            <div className="flex justify-between py-1 font-bold text-white text-sm">
              <span>Gross Sales Revenue (Units Delivered)</span>
              <span>{formatCurrency(incomeStatement.revenue)}</span>
            </div>

            <div className="flex justify-between py-1 text-slate-400 pl-4">
              <span>Less: Cost of Goods Sold (Standard Absorption)</span>
              <span>({formatCurrency(incomeStatement.costOfGoodsSold)})</span>
            </div>

            <div className="flex justify-between py-1.5 font-bold text-white border-t border-b border-slate-800">
              <span>Gross Operating Profit</span>
              <span>{formatCurrency(incomeStatement.grossProfit)}</span>
            </div>

            <div className="pt-2 font-semibold text-slate-400">Operating & Administrative Expenses:</div>
            <div className="space-y-1 pl-4 text-slate-300">
              <div className="flex justify-between">
                <span>Advertising & Marketing Media</span>
                <span>{formatCurrency(incomeStatement.advertisingExpense)}</span>
              </div>
              <div className="flex justify-between">
                <span>Salaries, Machinists & Factory Wages</span>
                <span>{formatCurrency(incomeStatement.salariesAndWages)}</span>
              </div>
              <div className="flex justify-between">
                <span>Sales Commissions (on orders generated)</span>
                <span>{formatCurrency(incomeStatement.salesCommissions)}</span>
              </div>
              <div className="flex justify-between">
                <span>Salesforce Expenses</span>
                <span>{formatCurrency(incomeStatement.salesExpenses)}</span>
              </div>
              <div className="flex justify-between">
                <span>Selling-Office Overhead (1% of order value)</span>
                <span>{formatCurrency(incomeStatement.sellingOfficeOverhead)}</span>
              </div>
              <div className="flex justify-between">
                <span>Product Distribution & Transport</span>
                <span>{formatCurrency(incomeStatement.transportCosts)}</span>
              </div>
              <div className="flex justify-between">
                <span>Regional Warehousing & Pallet Storage</span>
                <span>{formatCurrency(incomeStatement.warehousingCosts)}</span>
              </div>
              <div className="flex justify-between">
                <span>Plant Machinery Maintenance & Breakdown Repairs</span>
                <span>{formatCurrency(incomeStatement.maintenanceExpense)}</span>
              </div>
              <div className="flex justify-between">
                <span>Product Research & Development (R&D)</span>
                <span>{formatCurrency(incomeStatement.productDevelopmentExpense)}</span>
              </div>
              <div className="flex justify-between">
                <span>Senior Management Budgets</span>
                <span>{formatCurrency(incomeStatement.managementBudgetExpense)}</span>
              </div>
              <div className="flex justify-between">
                <span>Guarantee Repairs Servicing</span>
                <span>{formatCurrency(incomeStatement.guaranteeServiceExpense)}</span>
              </div>
              {incomeStatement.businessIntelligenceExpense > 0 && (
                <div className="flex justify-between">
                  <span>Commissioned Business Intelligence</span>
                  <span>{formatCurrency(incomeStatement.businessIntelligenceExpense)}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between py-1 text-slate-400 border-t border-slate-800/80 font-medium">
              <span>Total Operating Expenses</span>
              <span>({formatCurrency(incomeStatement.totalOperatingExpenses)})</span>
            </div>

            <div className="flex justify-between py-1.5 font-bold text-white border-t border-b border-slate-800">
              <span>Operating Profit (EBITDA)</span>
              <span>{formatCurrency(incomeStatement.operatingProfit)}</span>
            </div>

            <div className="flex justify-between py-1 text-slate-400 pl-4">
              <span>Depreciation of Machines (2.5%) & Vehicles (6.25%)</span>
              <span>({formatCurrency(incomeStatement.totalDepreciation)})</span>
            </div>

            <div className="flex justify-between py-1 text-slate-400 pl-4">
              <span>Scrap Salvage Recovery Income</span>
              <span>+{formatCurrency(incomeStatement.scrapIncome)}</span>
            </div>

            <div className="flex justify-between py-1 text-slate-400 pl-4">
              <span>Net Financing & Bank Interest (Deposit vs Borrowing)</span>
              <span>({formatCurrency(incomeStatement.netInterestExpense)})</span>
            </div>

            <div className="flex justify-between py-1.5 font-bold text-white border-t border-b border-slate-800">
              <span>Profit Before Taxation</span>
              <span>{formatCurrency(incomeStatement.profitBeforeTax)}</span>
            </div>

            <div className="flex justify-between py-1 text-slate-400 pl-4">
              <span>Corporate Income Tax Expense</span>
              <span>({formatCurrency(incomeStatement.taxExpense)})</span>
            </div>

            <div className="flex justify-between py-2 font-bold text-base text-emerald-400 border-t-2 border-b-2 border-slate-700">
              <span>Net Profit / (Loss) for the Quarter</span>
              <span>{formatCurrency(incomeStatement.netProfit)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Balance Sheet */}
      {activeReportTab === 'balance' && (
        <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/70 space-y-4 max-w-4xl mx-auto text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Balance Sheet (Statement of Financial Position)</h3>
              <span className="text-slate-400">As at Quarter end Year {report.year} Q{report.quarter}</span>
            </div>
            <Badge variant={balanceSheet.isBalanced ? 'emerald' : 'rose'}>
              {balanceSheet.isBalanced ? '✓ Assets = Liabilities + Equity' : `Imbalance: ${balanceSheet.imbalanceDifference}`}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-slate-200">
            {/* Assets */}
            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase text-xs pb-1 border-b border-slate-800">ASSETS</h4>

              <div className="space-y-1.5">
                <div className="font-semibold text-indigo-300">Current Assets:</div>
                <div className="flex justify-between pl-3">
                  <span>Cash & Bank Balances</span>
                  <span className="font-medium text-white">{formatCurrency(balanceSheet.cash)}</span>
                </div>
                <div className="flex justify-between pl-3">
                  <span>Trade Debtors (Receivables)</span>
                  <span className="font-medium text-white">{formatCurrency(balanceSheet.debtors)}</span>
                </div>
                <div className="flex justify-between pl-3">
                  <span>Raw Materials Stock</span>
                  <span className="font-medium text-white">{formatCurrency(balanceSheet.rawMaterialInventory)}</span>
                </div>
                <div className="flex justify-between pl-3">
                  <span>Finished Goods Warehouse Inventory</span>
                  <span className="font-medium text-white">{formatCurrency(balanceSheet.finishedGoodsInventory)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-800/80 font-bold text-slate-200">
                  <span>Total Current Assets</span>
                  <span>{formatCurrency(balanceSheet.totalCurrentAssets)}</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <div className="font-semibold text-indigo-300">Fixed (Non-Current) Assets:</div>
                <div className="flex justify-between pl-3">
                  <span>Freehold Property (South Factory site)</span>
                  <span className="font-medium text-white">{formatCurrency(balanceSheet.propertyValue)}</span>
                </div>
                <div className="flex justify-between pl-3">
                  <span>Machinery (Net Book Value)</span>
                  <span className="font-medium text-white">{formatCurrency(balanceSheet.machineNetBookValue)}</span>
                </div>
                <div className="flex justify-between pl-3">
                  <span>Distribution Vehicles (Net Book Value)</span>
                  <span className="font-medium text-white">{formatCurrency(balanceSheet.vehicleNetBookValue)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-800/80 font-bold text-slate-200">
                  <span>Total Fixed Assets</span>
                  <span>{formatCurrency(balanceSheet.totalFixedAssets)}</span>
                </div>
              </div>

              <div className="flex justify-between py-2 font-bold text-sm text-white border-t-2 border-b-2 border-slate-700">
                <span>TOTAL ASSETS</span>
                <span>{formatCurrency(balanceSheet.totalAssets)}</span>
              </div>
            </div>

            {/* Liabilities & Equity */}
            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase text-xs pb-1 border-b border-slate-800">LIABILITIES & EQUITY</h4>

              <div className="space-y-1.5">
                <div className="font-semibold text-indigo-300">Current Liabilities:</div>
                <div className="flex justify-between pl-3">
                  <span>Trade Creditors (Payables)</span>
                  <span className="font-medium text-white">{formatCurrency(balanceSheet.creditors)}</span>
                </div>
                <div className="flex justify-between pl-3">
                  <span>Bank Overdraft Facility</span>
                  <span className="font-medium text-white">{formatCurrency(balanceSheet.overdraft)}</span>
                </div>
                <div className="flex justify-between pl-3">
                  <span>Unsecured Emergency Borrowing</span>
                  <span className="font-medium text-white">{formatCurrency(balanceSheet.unsecuredLoans)}</span>
                </div>
                <div className="flex justify-between pl-3">
                  <span>Machine Purchase Orders Outstanding</span>
                  <span className="font-medium text-white">{formatCurrency(balanceSheet.machineOrdersPayable)}</span>
                </div>
                <div className="flex justify-between pl-3">
                  <span>Taxation Payable</span>
                  <span className="font-medium text-white">{formatCurrency(balanceSheet.taxPayable)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-800/80 font-bold text-slate-200">
                  <span>Total Current Liabilities</span>
                  <span>{formatCurrency(balanceSheet.totalCurrentLiabilities)}</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <div className="font-semibold text-indigo-300">Shareholders' Equity:</div>
                <div className="flex justify-between pl-3">
                  <span>Share Capital (100,000 shares)</span>
                  <span className="font-medium text-white">{formatCurrency(balanceSheet.shareCapital)}</span>
                </div>
                <div className="flex justify-between pl-3">
                  <span>Retained Reserves</span>
                  <span className="font-medium text-white">{formatCurrency(balanceSheet.retainedEarnings)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-800/80 font-bold text-slate-200">
                  <span>Total Shareholders' Equity</span>
                  <span>{formatCurrency(balanceSheet.totalEquity)}</span>
                </div>
              </div>

              <div className="flex justify-between py-2 font-bold text-sm text-white border-t-2 border-b-2 border-slate-700">
                <span>TOTAL LIABILITIES & EQUITY</span>
                <span>{formatCurrency(balanceSheet.totalLiabilitiesAndEquity)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Cash Flow Statement */}
      {activeReportTab === 'cashflow' && (
        <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/70 space-y-4 max-w-4xl mx-auto text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Cash Flow Statement</h3>
              <span className="text-slate-400">Quarter ended Year {report.year} Q{report.quarter}</span>
            </div>
            <Badge variant="indigo">Cash & Equivalents</Badge>
          </div>

          <div className="space-y-2 text-slate-300">
            <div className="flex justify-between py-1">
              <span>Opening Cash Balance</span>
              <span className="font-bold text-white">{formatCurrency(cashFlowStatement.openingCash)}</span>
            </div>

            <div className="flex justify-between py-1 pl-4">
              <span>Net Cash from Operating Activities</span>
              <span className={cashFlowStatement.operatingCashFlow >= 0 ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                {formatCurrency(cashFlowStatement.operatingCashFlow)}
              </span>
            </div>

            <div className="flex justify-between py-1 pl-4">
              <span>Net Cash from Capital & Investing Activities</span>
              <span className="font-medium text-white">{formatCurrency(cashFlowStatement.investingCashFlow)}</span>
            </div>

            <div className="flex justify-between py-1 pl-4">
              <span>Net Cash from Financing Activities</span>
              <span className="font-medium text-white">{formatCurrency(cashFlowStatement.financingCashFlow)}</span>
            </div>

            <div className="flex justify-between py-2 font-bold text-sm text-white border-t border-b border-slate-800">
              <span>Net Quarterly Change in Cash</span>
              <span>{formatCurrency(cashFlowStatement.netCashFlow)}</span>
            </div>

            <div className="flex justify-between py-2 font-bold text-base text-emerald-400 border-b border-slate-700">
              <span>Closing Cash Balance</span>
              <span>{formatCurrency(cashFlowStatement.closingCash)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Marketing & Demand Report */}
      {activeReportTab === 'marketing' && (
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/70 space-y-4 text-xs">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Marketing & Regional Order Fulfillment</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="py-2">Product / Market</th>
                  <th className="py-2">New Orders</th>
                  <th className="py-2">Actual Sales Delivered</th>
                  <th className="py-2">Backlog Carried</th>
                  <th className="py-2">Cancelled Orders</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {(['product1', 'product2', 'product3'] as const).map((prodId) => (
                  <React.Fragment key={prodId}>
                    <tr className="bg-slate-950/80 font-bold text-indigo-300">
                      <td colSpan={5} className="py-2 px-1 capitalize">{prodId} Performance</td>
                    </tr>
                    {(['south', 'west', 'north', 'export'] as const).map((mkt) => {
                      const orders = report.marketing.ordersReceived[prodId]?.[mkt] || 0;
                      const sales = report.marketing.actualSalesUnits[prodId]?.[mkt] || 0;
                      const backlog = report.marketing.unfulfilledBacklog[prodId]?.[mkt] || 0;
                      const cancelled = report.marketing.cancelledOrdersUnits[prodId]?.[mkt] || 0;
                      return (
                        <tr key={mkt} className="hover:bg-slate-800/20">
                          <td className="py-2 capitalize pl-3">{mkt}</td>
                          <td className="py-2">{orders.toLocaleString()}</td>
                          <td className="py-2 font-semibold text-emerald-400">{sales.toLocaleString()}</td>
                          <td className="py-2 text-amber-300">{backlog > 0 ? backlog.toLocaleString() : '-'}</td>
                          <td className="py-2 text-rose-300">{cancelled > 0 ? cancelled.toLocaleString() : '-'}</td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 6: Operations & Plant */}
      {activeReportTab === 'operations' && (
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/70 space-y-4 text-xs">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Manufacturing & Logistics Report</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/60 space-y-1">
              <span className="text-slate-400">Effective Plant Capacity:</span>
              <div className="text-base font-bold text-white">
                {report.operations.capacity.effectiveCapacityUnits.toLocaleString()} units
              </div>
              <div className="text-[11px] text-slate-500">
                Limiting factor: {report.operations.capacity.limitingFactor}
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/60 space-y-1">
              <span className="text-slate-400">Total Machinery Breakdowns:</span>
              <div className="text-base font-bold text-amber-300">
                {report.operations.totalBreakdownHours} hours
              </div>
              <div className="text-[11px] text-slate-500">
                Emergency repairs: {report.operations.emergencyRepairHours} hrs
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/60 space-y-1">
              <span className="text-slate-400">Distribution Transport:</span>
              <div className="text-base font-bold text-white">
                {report.operations.transportMethod.ownVehiclesTrips} Owned / {report.operations.transportMethod.hiredTransportTrips} Hired
              </div>
              <div className="text-[11px] text-slate-500">
                Cost: {formatCurrency(report.operations.transportMethod.totalTransportCost)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Personnel & Payroll */}
      {activeReportTab === 'personnel' && (
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/70 space-y-4 text-xs">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Human Resources & Staffing Report</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/60 space-y-1">
              <span className="text-slate-400">Active Sales Force:</span>
              <div className="text-base font-bold text-white">{report.personnel.salespeopleCount} reps</div>
              <div className="text-[11px] text-slate-500">
                Recruited: +{report.personnel.salespeopleRecruited} | Turnover: -{report.personnel.salespeopleTurnover}
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/60 space-y-1">
              <span className="text-slate-400">Assembly Workers:</span>
              <div className="text-base font-bold text-white">{report.personnel.assemblyWorkersCount} operators</div>
              <div className="text-[11px] text-slate-500">
                Recruited: +{report.personnel.assemblyRecruited} | Turnover: -{report.personnel.assemblyTurnover}
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/60 space-y-1">
              <span className="text-slate-400">Total Wages & Salaries Paid:</span>
              <div className="text-base font-bold text-indigo-300">{formatCurrency(report.personnel.totalWagesPaid)}</div>
              <div className="text-[11px] text-slate-500">
                Assembly Wage: ${report.personnel.assemblyHourlyWageCurrent.toFixed(2)}/hr
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 8: Competitor Intel */}
      {activeReportTab === 'intel' && (
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/70 space-y-4 text-xs">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Competitor Benchmarking & Intelligence</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {report.competitorsIntel.map((comp) => (
              <div key={comp.id} className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/60 space-y-2">
                <div className="flex justify-between font-bold text-white">
                  <span>{comp.name}</span>
                  <span className="text-emerald-400">${comp.sharePrice.toFixed(2)}</span>
                </div>
                <div className="text-slate-400">
                  Total Staff: <strong className="text-white">{comp.publicData.totalEmployees}</strong> • Wage: <strong className="text-white">${comp.publicData.assemblyHourlyWage.toFixed(2)}/hr</strong>
                </div>
                {comp.purchasedData && (
                  <div className="pt-2 border-t border-slate-800 text-[11px] space-y-1">
                    {comp.purchasedData.advertisingSpendTotal !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Ad Spend:</span>
                        <strong className="text-white">{formatCurrency(comp.purchasedData.advertisingSpendTotal)}</strong>
                      </div>
                    )}
                    {comp.purchasedData.rAndDSpendTotal !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">R&D Spend:</span>
                        <strong className="text-white">{formatCurrency(comp.purchasedData.rAndDSpendTotal)}</strong>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
