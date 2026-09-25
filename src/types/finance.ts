export interface FinancialStatementLine {
  label: string;
  amount: number;
  isTotal?: boolean;
  indent?: boolean;
}

export interface IncomeStatement {
  revenue: number;
  costOfGoodsSold: number;
  grossProfit: number;
  
  // Operating expenses
  advertisingExpense: number;
  salariesAndWages: number;
  salesCommissions: number;
  salesExpenses: number;
  sellingOfficeOverhead: number;
  transportCosts: number;
  warehousingCosts: number;
  maintenanceExpense: number;
  productDevelopmentExpense: number;
  managementBudgetExpense: number;
  guaranteeServiceExpense: number;
  businessIntelligenceExpense: number;
  totalOperatingExpenses: number;
  
  operatingProfit: number; // EBITDA - dep
  
  // Depreciation
  depreciationMachines: number;
  depreciationVehicles: number;
  totalDepreciation: number;
  
  operatingProfitAfterDepreciation: number;
  
  // Financing & scrap
  scrapIncome: number;
  interestIncome: number; // On deposits
  overdraftInterest: number;
  unsecuredLoanInterest: number;
  netInterestExpense: number;
  
  profitBeforeTax: number;
  taxExpense: number;
  netProfit: number;
}

export interface BalanceSheet {
  // Current Assets
  cash: number;
  debtors: number; // Accounts receivable
  rawMaterialInventory: number;
  finishedGoodsInventory: number;
  totalCurrentAssets: number;
  
  // Fixed Assets
  propertyValue: number; // South factory land/buildings - no depreciation
  machineGrossValue: number;
  machineDepreciationCumulative: number;
  machineNetBookValue: number;
  vehicleGrossValue: number;
  vehicleDepreciationCumulative: number;
  vehicleNetBookValue: number;
  totalFixedAssets: number;
  
  totalAssets: number;
  
  // Current Liabilities
  creditors: number; // Accounts payable
  overdraft: number;
  unsecuredLoans: number;
  taxPayable: number;
  dividendsPayable: number;
  machineOrdersPayable: number; // Outstanding payments on ordered machines
  totalCurrentLiabilities: number;
  
  // Equity
  shareCapital: number;
  retainedEarnings: number;
  currentQuarterProfit: number;
  totalEquity: number;
  
  totalLiabilitiesAndEquity: number;
  
  // Integrity check: Assets = Liabilities + Equity
  isBalanced: boolean;
  imbalanceDifference: number;
}

export interface CashFlowStatement {
  operatingCashFlow: number;
  investingCashFlow: number;
  financingCashFlow: number;
  netCashFlow: number;
  openingCash: number;
  closingCash: number;
}

export interface FinanceState {
  cash: number;
  debtors: number; // Outstanding customer receivables
  creditors: number; // Outstanding supplier payables
  overdraftLimit: number;
  currentOverdraft: number;
  unsecuredLoans: number;
  accumulatedTaxLosses: number; // Losses carried forward
  taxPayable: number; // Tax assessed in Q4, due in Q2
  dividendsPaidThisYear: number;
  shareCapital: number;
  retainedEarnings: number;
  lastQuarterNetProfit: number;
  propertyValue: number;
  creditTermsDays: number; // Normal 30 days
  depositRate: number; // Central bank rate - 2%
  overdraftRate: number; // Central bank rate + 4%
  unsecuredRate: number; // Central bank rate + 10%
}
