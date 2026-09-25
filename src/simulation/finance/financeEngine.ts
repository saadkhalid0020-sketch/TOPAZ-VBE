import { CompanyState } from '../../types/company';
import { FinanceState, IncomeStatement, BalanceSheet, CashFlowStatement } from '../../types/finance';
import { EconomyState } from '../../types/market';
import { FinanceDecisions, ResearchDecisions } from '../../types/decisions';
import { MachineOrderPipeline, MachineState, VehicleState } from '../../types/production';
import { table02InformationSellingCosts } from '../../data/tables/informationSellingCosts';
import { table18MachinesVehicles } from '../../data/tables/machinesVehicles';
import { table20InterestTax } from '../../data/tables/interestTax';
import { table21InventoryValuation } from '../../data/tables/inventoryValuation';
import { table23CreditTerms } from '../../data/tables/creditTerms';
import { calculateSharePrice } from './sharePrice';
import { roundCurrency, roundTo } from '../../utils/rounding';

export interface FinanceExecutionParams {
  deliveredSalesRevenue: number;
  costOfGoodsSold: number;
  totalAdvertisingExpense: number;
  salariesAndWages: number;
  salesCommissions: number;
  salesExpenses: number;
  sellingOfficeOverhead: number;
  transportCosts: number;
  warehousingCosts: number;
  maintenanceExpense: number;
  productDevelopmentExpense: number;
  managementBudgetExpense: number;
  scrapIncome: number;
  guaranteeServiceExpense: number;
  purchasingAdminCost: number;
  materialOrderCost: number;
  researchDecisions: ResearchDecisions;
  financeDecisions: FinanceDecisions;
  machinesOrderedCount: number;
  machinesSoldBookValue: number;
  machinesSoldRealizedCash: number;
  economy: EconomyState;
  marketShare: number;
  capacityUtilization: number;
  customerSatisfactionScore: number;
}

export interface FinanceExecutionResult {
  updatedFinance: FinanceState;
  updatedMachinePipeline: MachineOrderPipeline[];
  incomeStatement: IncomeStatement;
  balanceSheet: BalanceSheet;
  cashFlowStatement: CashFlowStatement;
  newSharePrice: number;
  businessIntelligenceExpense: number;
}

export function executeFinance(
  company: CompanyState,
  params: FinanceExecutionParams
): FinanceExecutionResult {
  const currentFinance = company.finance;
  const quarter = params.economy.quarter;
  const cbr = params.economy.centralBankRate;

  // 1. Business Intelligence Research Expenditure
  let businessIntelligenceExpense = 0;
  if (params.researchDecisions.purchaseCompetitorAdSpend) {
    businessIntelligenceExpense += table02InformationSellingCosts.intelAdSpendCost.value;
  }
  if (params.researchDecisions.purchaseCompetitorDevSpend) {
    businessIntelligenceExpense += table02InformationSellingCosts.intelDevSpendCost.value;
  }
  if (params.researchDecisions.purchaseCompetitorDesignRatings) {
    businessIntelligenceExpense += table02InformationSellingCosts.intelDesignRatingsCost.value;
  }
  if (params.researchDecisions.purchaseCompetitorMarketShare) {
    businessIntelligenceExpense += table02InformationSellingCosts.intelMarketShareCost.value;
  }

  // 2. Fixed Asset Depreciation
  // Machines 2.5%, Vehicles 6.25% decreasing-balance
  const machineBookValueGross = company.machines.reduce((acc, m) => acc + m.bookValue, 0);
  const vehicleBookValueGross = company.vehicles.reduce((acc, v) => acc + v.bookValue, 0);

  const depreciationMachines = roundCurrency(machineBookValueGross * table18MachinesVehicles.machineQuarterlyDepreciationRate.value);
  const depreciationVehicles = roundCurrency(vehicleBookValueGross * table18MachinesVehicles.vehicleQuarterlyDepreciationRate.value);
  const totalDepreciation = depreciationMachines + depreciationVehicles;

  const machineNetBookValue = Math.max(0, machineBookValueGross - depreciationMachines);
  const vehicleNetBookValue = Math.max(0, vehicleBookValueGross - depreciationVehicles);

  // 3. Operating Expenses & Profit before interest & tax
  const totalOperatingExpenses = roundCurrency(
    params.totalAdvertisingExpense +
    params.salariesAndWages +
    params.salesCommissions +
    params.salesExpenses +
    params.sellingOfficeOverhead +
    params.transportCosts +
    params.warehousingCosts +
    params.maintenanceExpense +
    params.productDevelopmentExpense +
    params.managementBudgetExpense +
    params.guaranteeServiceExpense +
    params.purchasingAdminCost +
    businessIntelligenceExpense
  );

  const grossProfit = roundCurrency(params.deliveredSalesRevenue - params.costOfGoodsSold);
  const operatingProfit = roundCurrency(grossProfit - totalOperatingExpenses);
  const operatingProfitAfterDepreciation = roundCurrency(operatingProfit - totalDepreciation + params.scrapIncome);

  // 4. Working Capital & Cash Receipts
  // Debtors collection: standard credit terms (30 days normal)
  // Cash collected this quarter = (Previous Debtors * collectionRate) + (Current Invoices * (1 - carryoverRate))
  const collectionRate = table23CreditTerms.quarterEndDebtorCollectionRate.value;
  const cashCollectedFromPriorDebtors = roundCurrency(currentFinance.debtors * collectionRate);
  const cashCollectedFromCurrentSales = roundCurrency(params.deliveredSalesRevenue * (1 - (currentFinance.creditTermsDays / 90)));
  const totalCashReceiptsFromCustomers = Math.max(0, cashCollectedFromPriorDebtors + cashCollectedFromCurrentSales);

  const newDebtors = Math.max(0, roundCurrency(
    currentFinance.debtors - cashCollectedFromPriorDebtors + (params.deliveredSalesRevenue - cashCollectedFromCurrentSales)
  ));

  // Creditors payment for material orders
  // 50% paid in quarter, 50% carried into accounts payable
  const cashPaidToSuppliers = roundCurrency(currentFinance.creditors * 0.80 + params.materialOrderCost * 0.50);
  const newCreditors = roundCurrency(currentFinance.creditors * 0.20 + params.materialOrderCost * 0.50);

  // 5. Machine Purchase Pipeline Progress
  // T: Order, T+1: 50% payment, T+2: 50% payment + installation, T+3: Operational
  const updatedPipeline: MachineOrderPipeline[] = [];
  let machineCashOutflow = 0;
  let newOperationalMachinesFromPipeline = 0;

  for (const pipe of company.operations.machineOrdersPipeline) {
    if (!pipe.firstPaymentPaid) {
      // First 50% due in T+1
      machineCashOutflow += pipe.totalCost * 0.5;
      updatedPipeline.push({ ...pipe, firstPaymentPaid: true });
    } else if (!pipe.secondPaymentPaid) {
      // Second 50% due in T+2 (installation)
      machineCashOutflow += pipe.totalCost * 0.5;
      updatedPipeline.push({ ...pipe, secondPaymentPaid: true });
    } else {
      // Becomes operational in T+3
      newOperationalMachinesFromPipeline += pipe.quantity;
    }
  }

  // Handle new machine order placed this quarter
  if (params.machinesOrderedCount > 0) {
    const costPerMachine = table18MachinesVehicles.machineCostNew.value;
    const totalCost = params.machinesOrderedCount * costPerMachine;
    updatedPipeline.push({
      id: `ORD-${Date.now().toString().slice(-4)}`,
      quarterOrdered: { year: params.economy.year, quarter: params.economy.quarter },
      quantity: params.machinesOrderedCount,
      totalCost,
      firstPaymentPaid: false,
      secondPaymentPaid: false,
      operationalQuarter: {
        year: params.economy.quarter >= 2 ? params.economy.year + 1 : params.economy.year,
        quarter: ((params.economy.quarter + 2) % 4) + 1,
      },
    });
  }

  // Calculate outstanding machine commitments
  let outstandingMachinePayments = 0;
  for (const p of updatedPipeline) {
    if (!p.firstPaymentPaid) outstandingMachinePayments += p.totalCost;
    else if (!p.secondPaymentPaid) outstandingMachinePayments += p.totalCost * 0.5;
  }

  // 6. Dividends declaration & payment
  // Dividends can only be declared in Q1 and Q3, paid beginning of next quarter
  let dividendDeclared = 0;
  if ((quarter === 1 || quarter === 3) && params.financeDecisions.dividendPerShare > 0) {
    dividendDeclared = roundCurrency(params.financeDecisions.dividendPerShare * 100000);
  }

  // 7. Tax Assessment and Payment
  // Assessed in Q4, paid automatically in Q2 following year
  let taxPaidThisQuarter = 0;
  let newTaxPayable = currentFinance.taxPayable;

  if (quarter === 2 && currentFinance.taxPayable > 0) {
    taxPaidThisQuarter = currentFinance.taxPayable;
    newTaxPayable = 0;
  }

  // 8. Cash Flow & Interest Calculations
  // Total cash disbursements before financing
  const totalCashDisbursements = roundCurrency(
    totalOperatingExpenses +
    cashPaidToSuppliers +
    machineCashOutflow +
    taxPaidThisQuarter
  );

  const initialEstimatedCash = roundCurrency(
    currentFinance.cash +
    totalCashReceiptsFromCustomers +
    params.scrapIncome +
    params.machinesSoldRealizedCash -
    totalCashDisbursements
  );

  // Interest Rates
  const depositRate = Math.max(0.005, cbr + table20InterestTax.depositRateSpread.value);
  const overdraftRate = cbr + table20InterestTax.overdraftRateSpread.value;
  const unsecuredRate = cbr + table20InterestTax.unsecuredLoanRateSpread.value;

  let interestIncome = 0;
  let overdraftInterest = 0;
  let unsecuredLoanInterest = 0;
  let closingCash = 0;
  let closingOverdraft = 0;
  let closingUnsecuredLoans = 0;

  const overdraftLimit = currentFinance.overdraftLimit;

  if (initialEstimatedCash >= 0) {
    // Excess cash earns deposit interest
    interestIncome = roundCurrency(initialEstimatedCash * (depositRate / 4));
    closingCash = roundCurrency(initialEstimatedCash + interestIncome);
    closingOverdraft = 0;
    closingUnsecuredLoans = 0;
  } else {
    // Negative cash: draw on overdraft up to limit, remainder into unsecured loan
    const deficit = Math.abs(initialEstimatedCash);
    if (deficit <= overdraftLimit) {
      closingOverdraft = roundCurrency(deficit);
      overdraftInterest = roundCurrency(closingOverdraft * (overdraftRate / 4));
      closingOverdraft += overdraftInterest;
      closingCash = 0;
      closingUnsecuredLoans = 0;
    } else {
      closingOverdraft = overdraftLimit;
      overdraftInterest = roundCurrency(closingOverdraft * (overdraftRate / 4));
      const unsecuredNeeded = deficit - overdraftLimit;
      unsecuredLoanInterest = roundCurrency(unsecuredNeeded * (unsecuredRate / 4));
      closingUnsecuredLoans = roundCurrency(unsecuredNeeded + unsecuredLoanInterest);
      closingCash = 0;
    }
  }

  const netInterestExpense = roundCurrency(overdraftInterest + unsecuredLoanInterest - interestIncome);
  const profitBeforeTax = roundCurrency(operatingProfitAfterDepreciation - netInterestExpense);

  // Tax calculation: assessed at Q4, losses offset future taxable profits
  let taxExpense = 0;
  let accumulatedTaxLosses = currentFinance.accumulatedTaxLosses;

  if (profitBeforeTax < 0) {
    accumulatedTaxLosses += Math.abs(profitBeforeTax);
  } else {
    const taxableProfit = Math.max(0, profitBeforeTax - accumulatedTaxLosses);
    accumulatedTaxLosses = Math.max(0, accumulatedTaxLosses - profitBeforeTax);
    
    // Tax assessed in Q4
    if (quarter === 4 && taxableProfit > 0) {
      taxExpense = roundCurrency(taxableProfit * table20InterestTax.corporateTaxRate.value);
      newTaxPayable = taxExpense;
    }
  }

  const netProfit = roundCurrency(profitBeforeTax - taxExpense);

  // 9. Financial Statements Construction & Balance Sheet Reconciliation
  const incomeStatement: IncomeStatement = {
    revenue: params.deliveredSalesRevenue,
    costOfGoodsSold: params.costOfGoodsSold,
    grossProfit,
    advertisingExpense: params.totalAdvertisingExpense,
    salariesAndWages: params.salariesAndWages,
    salesCommissions: params.salesCommissions,
    salesExpenses: params.salesExpenses,
    sellingOfficeOverhead: params.sellingOfficeOverhead,
    transportCosts: params.transportCosts,
    warehousingCosts: params.warehousingCosts,
    maintenanceExpense: params.maintenanceExpense,
    productDevelopmentExpense: params.productDevelopmentExpense,
    managementBudgetExpense: params.managementBudgetExpense,
    guaranteeServiceExpense: params.guaranteeServiceExpense,
    businessIntelligenceExpense,
    totalOperatingExpenses,
    operatingProfit,
    depreciationMachines,
    depreciationVehicles,
    totalDepreciation,
    operatingProfitAfterDepreciation,
    scrapIncome: params.scrapIncome,
    interestIncome,
    overdraftInterest,
    unsecuredLoanInterest,
    netInterestExpense,
    profitBeforeTax,
    taxExpense,
    netProfit,
  };

  // Inventory valuations
  const rawMaterialInventoryValue = roundCurrency(company.materials.currentStockUnits * company.materials.averageUnitCost);
  const finishedGoodsInventoryValue = roundCurrency(
    company.products.reduce((acc, p) => acc + p.inventory * table21InventoryValuation.standardProductUnitCosts[p.id].value, 0)
  );

  const totalCurrentAssets = roundCurrency(closingCash + newDebtors + rawMaterialInventoryValue + finishedGoodsInventoryValue);
  const propertyValue = currentFinance.propertyValue;
  const totalFixedAssets = roundCurrency(propertyValue + machineNetBookValue + vehicleNetBookValue);
  const totalAssets = roundCurrency(totalCurrentAssets + totalFixedAssets);

  const totalCurrentLiabilities = roundCurrency(
    newCreditors + closingOverdraft + closingUnsecuredLoans + newTaxPayable + dividendDeclared
  );

  // Equity strictly balances: Assets = Liabilities + Equity
  const totalEquity = roundCurrency(totalAssets - totalCurrentLiabilities);
  const nextRetainedEarnings = roundCurrency(totalEquity - currentFinance.shareCapital);
  const totalLiabilitiesAndEquity = roundCurrency(totalCurrentLiabilities + totalEquity);

  const imbalance = roundTo(totalAssets - totalLiabilitiesAndEquity, 2);
  const isBalanced = Math.abs(imbalance) < 0.05;

  const balanceSheet: BalanceSheet = {
    cash: closingCash,
    debtors: newDebtors,
    rawMaterialInventory: rawMaterialInventoryValue,
    finishedGoodsInventory: finishedGoodsInventoryValue,
    totalCurrentAssets,
    propertyValue,
    machineGrossValue: machineBookValueGross,
    machineDepreciationCumulative: depreciationMachines,
    machineNetBookValue,
    vehicleGrossValue: vehicleBookValueGross,
    vehicleDepreciationCumulative: depreciationVehicles,
    vehicleNetBookValue,
    totalFixedAssets,
    totalAssets,
    creditors: newCreditors,
    overdraft: closingOverdraft,
    unsecuredLoans: closingUnsecuredLoans,
    taxPayable: newTaxPayable,
    dividendsPayable: dividendDeclared,
    machineOrdersPayable: outstandingMachinePayments,
    totalCurrentLiabilities,
    shareCapital: currentFinance.shareCapital,
    retainedEarnings: nextRetainedEarnings,
    currentQuarterProfit: netProfit,
    totalEquity,
    totalLiabilitiesAndEquity,
    isBalanced,
    imbalanceDifference: imbalance,
  };

  // Cash Flow Statement
  const operatingCashFlow = roundCurrency(totalCashReceiptsFromCustomers + params.scrapIncome - totalOperatingExpenses - cashPaidToSuppliers - taxPaidThisQuarter);
  const investingCashFlow = roundCurrency(params.machinesSoldRealizedCash - machineCashOutflow);
  const financingCashFlow = roundCurrency(closingOverdraft + closingUnsecuredLoans - currentFinance.currentOverdraft - currentFinance.unsecuredLoans - (interestIncome > 0 ? 0 : netInterestExpense));
  const netCashFlow = roundCurrency(closingCash - currentFinance.cash);

  const cashFlowStatement: CashFlowStatement = {
    operatingCashFlow,
    investingCashFlow,
    financingCashFlow,
    netCashFlow,
    openingCash: currentFinance.cash,
    closingCash,
  };

  // Calculate Net Worth and Updated Share Price
  const netWorth = totalAssets - totalCurrentLiabilities;
  const newSharePrice = calculateSharePrice({
    netWorth,
    lastQuarterNetProfit: netProfit,
    annualizedNetProfit: netProfit * 4,
    cash: closingCash,
    totalDebt: closingOverdraft + closingUnsecuredLoans,
    dividendsPaidThisYear: (quarter === 1 ? 0 : currentFinance.dividendsPaidThisYear) + dividendDeclared,
    marketShare: params.marketShare,
    capacityUtilization: params.capacityUtilization,
    customerSatisfactionScore: params.customerSatisfactionScore,
    economy: params.economy,
  });

  const updatedFinance: FinanceState = {
    cash: closingCash,
    debtors: newDebtors,
    creditors: newCreditors,
    overdraftLimit,
    currentOverdraft: closingOverdraft,
    unsecuredLoans: closingUnsecuredLoans,
    accumulatedTaxLosses,
    taxPayable: newTaxPayable,
    dividendsPaidThisYear: (quarter === 1 ? 0 : currentFinance.dividendsPaidThisYear) + dividendDeclared,
    shareCapital: currentFinance.shareCapital,
    retainedEarnings: nextRetainedEarnings,
    lastQuarterNetProfit: netProfit,
    propertyValue,
    creditTermsDays: currentFinance.creditTermsDays,
    depositRate,
    overdraftRate,
    unsecuredRate,
  };

  return {
    updatedFinance,
    updatedMachinePipeline: updatedPipeline,
    incomeStatement,
    balanceSheet,
    cashFlowStatement,
    newSharePrice,
    businessIntelligenceExpense,
  };
}
