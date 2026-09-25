import { ProductId } from './product';
import { MarketId } from './market';
import { ShiftLevel } from './production';

export interface MarketingDecisions {
  // Pricing: Home price covers South, West, North. Export price covers Export.
  prices: Record<ProductId, { homePrice: number; exportPrice: number }>;
  
  // Advertising by product, market, and medium
  advertising: Record<ProductId, Record<MarketId, {
    tradePress: number;
    advertisingSupport: number;
    pointOfSale: number;
  }>>;
  
  // Product development investments
  developmentBudgets: Record<ProductId, number>;
  
  // Major improvement implementation decision (true = adopt and obsolete old model)
  adoptMajorImprovement: Record<ProductId, boolean>;
  
  // Retailer credit terms (days) - 30 normal
  creditTermsDays: number;
}

export interface OperationsDecisions {
  // Production delivery quantities planned per product and market
  // Negative quantities allow transferring excess warehouse inventory
  deliveryQuantities: Record<ProductId, Record<MarketId, number>>;
  
  // Assembly time chosen per product (minutes). Higher time improves quality, reduces defects
  assemblyTimeMinutes: Record<ProductId, number>;
  
  // Factory shift level: 1, 2, or 3
  shifts: ShiftLevel;
  
  // Contracted maintenance hours per machine
  contractedMaintenanceHoursPerMachine: number;
  
  // Material purchase decision: supplier index (0, 1, 2, or 3) and quantity units
  materialOrder: {
    supplierId: 0 | 1 | 2 | 3;
    units: number;
  };
  
  // Fixed assets decisions
  machinesToOrder: number; // Multiquarter delivery
  machinesToSell: number;
  vehiclesToBuy: number; // Next quarter availability
  vehiclesToSell: number;
}

export interface PersonnelDecisions {
  // Sales recruitment and dismissal (net change or explicit hire/fire)
  salespeopleHires: number;
  salespeopleDismissals: number;
  salespeopleToTrain: number; // Converts unemployed workers to salespeople
  
  // Sales allocation across markets (sum must equal total salespeople)
  salespeopleAllocation: Record<MarketId, number>;
  
  // Assembly workers
  assemblyHires: number;
  assemblyDismissals: number;
  assemblyToTrain: number;
  
  // Compensation
  assemblyHourlyWageOffer: number; // Wage increases take effect next quarter
  
  // Management budgets
  marketingManagementBudget: number;
  productionManagementBudget: number;
  personnelManagementBudget: number;
  financialManagementBudget: number;
}

export interface FinanceDecisions {
  // Dividends: only in Q1 and Q3
  dividendPerShare: number;
  
  // Additional loan repayments or short-term notes if desired
  debtRepaymentAmount: number;
}

export interface ResearchDecisions {
  // Business intelligence purchases
  purchaseCompetitorAdSpend: boolean;
  purchaseCompetitorDevSpend: boolean;
  purchaseCompetitorDesignRatings: boolean;
  purchaseCompetitorMarketShare: boolean;
}

export interface QuarterlyDecisions {
  marketing: MarketingDecisions;
  operations: OperationsDecisions;
  personnel: PersonnelDecisions;
  finance: FinanceDecisions;
  research: ResearchDecisions;
}

export interface DecisionHistory {
  year: number;
  quarter: 1 | 2 | 3 | 4;
  decisions: QuarterlyDecisions;
  submittedAt: number;
}
