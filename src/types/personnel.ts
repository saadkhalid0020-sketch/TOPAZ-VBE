import { MarketId } from './market';

export interface EmployeeState {
  salespeople: number;
  salespeopleAllocation: Record<MarketId, number>;
  salespeopleTrainedRemainingCommitment: number; // Trained salespeople guaranteed for at least 1 Q
  
  machinists: number; // Automatically calculated: 4 * machines * shifts
  
  assemblyWorkers: number;
  assemblyWorkersInTraining: number;
  
  ancillaryWorkers: number;
  
  // Compensation
  salespersonBaseSalary: number; // Quarterly base
  salespersonCommissionRate: number; // Percentage of order value
  salespersonQuarterlyExpenses: number;
  
  assemblyHourlyWage: number;
  assemblyNextQuarterHourlyWage: number; // Wage increases take effect next quarter
  
  // Management budgets
  marketingManagementBudget: number;
  productionManagementBudget: number;
  personnelManagementBudget: number;
  financialManagementBudget: number;
  pendingBudgetReductions: Record<string, number>; // Reductions require 1-quarter notice
  
  // Turnover tracking
  salespeopleLeftLastQuarter: number;
  assemblyWorkersLeftLastQuarter: number;
}
