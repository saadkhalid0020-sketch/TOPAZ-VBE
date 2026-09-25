import { describe, it, expect } from 'vitest';
import { executeFinance } from '../finance/financeEngine';
import { createCompany, createInitialEconomy } from '../../data/scenarios/initialGame';

describe('Finance & Accounting Engine', () => {
  it('strictly balances the Balance Sheet: Assets = Liabilities + Equity', () => {
    const company = createCompany('player', 'Aura Corp', true);
    const economy = createInitialEconomy();

    const result = executeFinance(company, {
      deliveredSalesRevenue: 150000,
      costOfGoodsSold: 70000,
      totalAdvertisingExpense: 12000,
      salariesAndWages: 35000,
      salesCommissions: 3750,
      salesExpenses: 12000,
      sellingOfficeOverhead: 1500,
      transportCosts: 3500,
      warehousingCosts: 4000,
      maintenanceExpense: 2500,
      productDevelopmentExpense: 10000,
      managementBudgetExpense: 28000,
      scrapIncome: 1200,
      guaranteeServiceExpense: 800,
      purchasingAdminCost: 250,
      materialOrderCost: 25000,
      researchDecisions: {
        purchaseCompetitorAdSpend: false,
        purchaseCompetitorDevSpend: false,
        purchaseCompetitorDesignRatings: false,
        purchaseCompetitorMarketShare: false,
      },
      financeDecisions: {
        dividendPerShare: 0,
        debtRepaymentAmount: 0,
      },
      machinesOrderedCount: 0,
      machinesSoldBookValue: 0,
      machinesSoldRealizedCash: 0,
      economy,
      marketShare: 0.25,
      capacityUtilization: 0.85,
      customerSatisfactionScore: 65,
    });

    const bs = result.balanceSheet;
    expect(bs.isBalanced).toBe(true);
    expect(Math.abs(bs.imbalanceDifference)).toBeLessThan(1.0);
  });

  it('earns deposit interest when closing cash is positive', () => {
    const company = createCompany('player', 'Aura Corp', true);
    company.cash = 200000;
    const economy = createInitialEconomy();

    const result = executeFinance(company, {
      deliveredSalesRevenue: 180000,
      costOfGoodsSold: 60000,
      totalAdvertisingExpense: 8000,
      salariesAndWages: 25000,
      salesCommissions: 3000,
      salesExpenses: 8000,
      sellingOfficeOverhead: 1500,
      transportCosts: 2000,
      warehousingCosts: 3000,
      maintenanceExpense: 1500,
      productDevelopmentExpense: 5000,
      managementBudgetExpense: 20000,
      scrapIncome: 500,
      guaranteeServiceExpense: 300,
      purchasingAdminCost: 250,
      materialOrderCost: 15000,
      researchDecisions: { purchaseCompetitorAdSpend: false, purchaseCompetitorDevSpend: false, purchaseCompetitorDesignRatings: false, purchaseCompetitorMarketShare: false },
      financeDecisions: { dividendPerShare: 0, debtRepaymentAmount: 0 },
      machinesOrderedCount: 0,
      machinesSoldBookValue: 0,
      machinesSoldRealizedCash: 0,
      economy,
      marketShare: 0.25,
      capacityUtilization: 0.8,
      customerSatisfactionScore: 70,
    });

    expect(result.incomeStatement.interestIncome).toBeGreaterThan(0);
    expect(result.balanceSheet.overdraft).toBe(0);
  });
});
