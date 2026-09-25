import { ProductId } from './product';
import { MarketId, EconomyState } from './market';
import { IncomeStatement, BalanceSheet, CashFlowStatement } from './finance';
import { ProductionCapacityInfo } from './production';

export interface MarketingReport {
  prices: Record<ProductId, { home: number; export: number }>;
  ordersReceived: Record<ProductId, Record<MarketId, number>>;
  actualSalesUnits: Record<ProductId, Record<MarketId, number>>;
  unfulfilledBacklog: Record<ProductId, Record<MarketId, number>>;
  cancelledOrdersUnits: Record<ProductId, Record<MarketId, number>>;
  advertisingSpendTotal: Record<ProductId, number>;
  productDevelopmentSpend: Record<ProductId, number>;
  productDevelopmentResult: Record<ProductId, 'NONE' | 'MINOR' | 'MAJOR'>;
  productImageScores: Record<ProductId, number>;
  marketSharePercentages: Record<ProductId, Record<MarketId, number>>;
  overallMarketShare: number;
}

export interface OperationsReport {
  capacity: ProductionCapacityInfo;
  machineCount: number;
  activeShifts: number;
  machineEfficiencyAverage: number;
  totalBreakdownHours: number;
  contractedMaintenanceHours: number;
  emergencyRepairHours: number;
  maintenanceCost: number;
  finishedGoodsInventoryQuarterEnd: Record<ProductId, number>;
  rawMaterialClosingStock: number;
  materialOrdersDelivered: number;
  transportMethod: {
    ownVehiclesTrips: number;
    hiredTransportTrips: number;
    totalTransportCost: number;
  };
  warehousingCostTotal: number;
  guaranteeReturnsCount: Record<ProductId, number>;
  guaranteeServiceCost: number;
}

export interface PersonnelReport {
  salespeopleCount: number;
  salespeopleRecruited: number;
  salespeopleTurnover: number;
  salespeopleAllocation: Record<MarketId, number>;
  machinistsCount: number;
  assemblyWorkersCount: number;
  assemblyRecruited: number;
  assemblyTurnover: number;
  assemblyHourlyWageCurrent: number;
  totalWagesPaid: number;
  managementBudgetSpent: number;
}

export interface CompetitorIntelItem {
  id: string;
  name: string;
  sharePrice: number;
  publicData: {
    prices: Record<ProductId, { home: number; export: number }>;
    totalEmployees: number;
    assemblyHourlyWage: number;
  };
  purchasedData?: {
    advertisingSpendTotal?: number;
    rAndDSpendTotal?: number;
    designRatings?: Record<ProductId, number>;
    marketShareEstimate?: number;
  };
}

export interface QuarterlyReport {
  id: string;
  gameId: string;
  year: number;
  quarter: 1 | 2 | 3 | 4;
  timestamp: number;
  
  economy: EconomyState;
  
  marketing: MarketingReport;
  operations: OperationsReport;
  personnel: PersonnelReport;
  
  incomeStatement: IncomeStatement;
  balanceSheet: BalanceSheet;
  cashFlowStatement: CashFlowStatement;
  
  competitorsIntel: CompetitorIntelItem[];
  
  executiveSummary: {
    revenue: number;
    grossProfit: number;
    netProfit: number;
    cashPosition: number;
    sharePrice: number;
    sharePriceChange: number;
    keyHighlights: string[];
    criticalWarnings: string[];
  };
}
